// src/pages/SubscriptionReview.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { UserAuth } from "../contexts/AuthContexts";            // :contentReference[oaicite:0]{index=0}&#8203;:contentReference[oaicite:1]{index=1}
import { checkSubscription, createCheckoutSession } from "../services/stripeClient"; // your new file

export default function SubscriptionReview() {
  const { user } = UserAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

  useEffect(() => {
    if (!user) return navigate("/login");
    (async () => {
      const { active } = await checkSubscription(user.id);
      if (active) return navigate("/checkout");

      const { sessionId } = await createCheckoutSession(
        user.id,
        import.meta.env.VITE_STRIPE_PRICE_ID,
        user.email
      );
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId });
    })();
  }, [user, navigate, stripePromise]);

  return <p>Redirecting to checkout...</p>;;
}
