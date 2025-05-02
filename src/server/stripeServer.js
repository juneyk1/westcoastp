import express from "express";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";


dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
app.use(cors())


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
  

app.use(express.json());

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
  

  app.listen(4242, () =>
    console.log("Stripe server listening")
  );