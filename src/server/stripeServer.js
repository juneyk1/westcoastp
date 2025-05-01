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
app.use(express.json());

app.post("/check-subscription", async (req, res) => {
    const { userId } = req.body;
    const { data, error } = await supabase
        .from("subscriptions")
        .select("stripe_status, current_period_end")
        .eq("user_id", userId)
        .order("current_period_end", { ascending: false })
        .limit(1);
    
    if (error) return res.status(400).json({ error });
    const sub = data[0];
    const active =
        sub?.stripe_status === "active" &&
        sub.current_period_end * 1000 > Date.now();
    res.jason({ active });
})

app.post("/create-checkout-session", async (req, res) => {
    const { userId, priceId } = req.body;
    const customer = await stripe.customers.create({
      metadata: { userId },
      email: req.body.email,
    });
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/checkout`,
      cancel_url: `${process.env.FRONTEND_URL}/subscribe`,
    });
    res.json({ sessionId: session.id });
});
  
app.post(
    "/webhook",
    bodyParser.raw({ type: "application/json" }),
    (req, res) => {
      const sig = req.headers["stripe-signature"];
      let event;
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
  
      const handleSub = async (sub) => {
        const userId = sub.metadata.userId;
        await supabase.from("subscriptions").upsert({
          user_id: userId,
          stripe_subscription_id: sub.id,
          stripe_status: sub.status,
          current_period_end: sub.current_period_end,
          price_id: sub.items.data[0].price.id,
        });
      };
  
      if (event.type === "checkout.session.completed") {
        stripe
          .subscriptions.retrieve(event.data.object.subscription)
          .then(handleSub)
          .catch(console.error);
      }
      if (
        event.type === "invoice.payment_succeeded" ||
        event.type === "invoice.payment_failed"
      ) {
        stripe
          .subscriptions.retrieve(event.data.object.subscription)
          .then(handleSub)
          .catch(console.error);
      }
  
      res.json({ received: true });
    }
  );
  
  app.listen(4242, () =>
    console.log("Stripe server listening")
  );