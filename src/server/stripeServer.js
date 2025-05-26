import express from "express";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';
import { generatePurchaseOrderPDF } from "../services/pdfTemplates.js";

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);
const mailer = nodemailer.createTransport({
  host:    process.env.SMTP_HOST,               // e.g. email-smtp.us-west-2.amazonaws.com
  port:    +process.env.SMTP_PORT,              // 465 or 587
  secure:  process.env.SMTP_PORT === '465',     // true for 465, false for other ports (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,                // generated SMTP username
    pass: process.env.SMTP_PASS,                // generated SMTP password
  },
});



app.use(cors());
app.use(express.json());

app.post(
    "/webhook",
    bodyParser.raw({ type: "application/json" }),
    async (req, res) => {
      let event;
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          req.headers["stripe-signature"],
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        console.error("Webhook signature failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
  
      async function handleSub(sub) {
        const row = {
          user_id:                sub.metadata.userId,
          stripe_subscription_id: sub.id,
          stripe_status:          sub.status,
          current_period_end:     sub.current_period_end,
          price_id:               sub.items.data[0].price.id,
        };
        
        const { data, error } = await supabase.from("stripe_subscriptions").upsert(row);
        if (error) console.error("Supabase upsert error:", error);
        else        console.log("Upserted subscription:", data);
      }
  
      if (
        event.type === "customer.subscription.created" ||
        event.type === "customer.subscription.updated"
      ) {
        await handleSub(event.data.object);
      }
  
      res.json({ received: true });
    }
  );

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});


app.post('/create-order', async (req, res) => {
  const { userId, email, items, shippingAddress, billingAddress } = req.body;
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const { data: order, error: orderErr } = await supabase
    .from('purchase_orders')
    .insert(
      [{ user_id: userId, total }],
      { returning: "representation" }
    )
    .single();
  
  if (orderErr) return res.status(500).json({ error: orderErr.message });
  
  const { data: [orderData], error: selectError } = await supabase
  .from("purchase_orders")
  .select("*")
  .eq("user_id", userId)
  .order("created_at", { ascending: false })
  .limit(1);
  
  if (selectError) throw selectError;
  if (!orderData) {
    return res.status(404).json({ error: "Order not found" });
  }
  const orderId = orderData.id;
  const createdAt = orderData.createdAt
  
  const lineItems = items.map(i => ({
    order_id:      orderId,
    product_sku:   i.sku,
    product_name:  i.name,
    unit_price:    i.price,
    quantity:      i.quantity
  }));

  const { error: itemsErr } = await supabase
    .from('purchase_order_items')
    .insert(lineItems);
  if (itemsErr) console.error('Line-item insert error', itemsErr);

  const doc = generatePurchaseOrderPDF({ orderId, createdAt, items, shippingAddress, billingAddress});
  const buffers = [];
  doc.on("data", (chunk) => buffers.push(chunk));
  doc.on('end', async () => {
    const pdfBuffer = Buffer.concat(buffers);

    try {
      await mailer.sendMail({
        from: `"WCPA" <${process.env.SMTP_EMAIL}>`,
        to: email,
        subject: `Your Purchase Order #${orderId}`,
        text: `Thank you for your order! Please find your Purchase Order attached.`,
        attachments: [{
          filename: `PO-${orderId}.pdf`,
          content: pdfBuffer
        }]
      });
      res.json({ orderId: orderId });
    } catch (mailErr) {
      console.error('Email send error', mailErr);
      res.status(500).json({ error: 'Order created but failed to send email.' });
    }
  });
  doc.end();

});


app.post("/check-subscription", async (req, res) => {
    const { userId } = req.body;
    const { data, error } = await supabase
        .from("stripe_subscriptions")
        .select("stripe_status")
        .eq("user_id", userId)
        .limit(1);
    
    if (error) return res.status(400).json({ error });
    const sub = data[0];
    const active =
        sub?.stripe_status === "active"
    res.json({ active });
})

app.post("/create-subscription-intent", async (req, res) => {
    const { priceId } = req.body;
    try {
        const intent = await stripe.setupIntents.create({
            payment_method_types: ['card'],
            usage: 'off_session',
            payment_method_options: {
              card: {
                request_three_d_secure: 'any'
              }
            },
            metadata: { priceId }
        });

        res.json({ clientSecret: intent.client_secret });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

app.post("/create-subscription", async (req, res) => {
    const { paymentMethodId, priceId, customerInfo } = req.body;
    try {
        const customer = await stripe.customers.create({
            email: customerInfo.email,
            metadata: { userId: customerInfo.userId }
        });
        
        await stripe.paymentMethods.attach(paymentMethodId, { customer: customer.id });
        await stripe.customers.update(customer.id, {
            invoice_settings: { default_payment_method: paymentMethodId }
        });

        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: priceId }],
            metadata: { userId: customerInfo.userId }
         });
        
        const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
        const billingDetails = paymentMethod.billing_details;
        
        await supabase.from("subscribers").upsert({
            user_id:               customerInfo.userId,
            stripe_customer_id:    customer.id,
            email:                 billingDetails.email || customer.email,
            name:                  billingDetails.name,
            billing_details:       billingDetails,
            default_payment_method: paymentMethodId
            });
  
      res.json({ subscriptionId: subscription.id, status: subscription.status });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
});
  
app.listen(4248, () => {
  console.log('Server listening on 4248');
});
process.stdin.resume();