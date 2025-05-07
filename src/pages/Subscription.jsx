import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useUserAuth } from "../contexts/AuthContexts";
import {
  createSetupIntent,
  createSubscription,
  checkSubscription,
} from "../services/stripeClient";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function SubscriptionForm({ clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = UseUserAuth();
  const navigate = useNavigate();

  const [formData, setForm] = useState({
    firstName: "",
    lastName: "",
    email: user.email,
    billingAddress1: "",
    billingAddress2: "",
    zipCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { setupIntent, error: confirmError } = await stripe.confirmCardSetup(
      clientSecret,
      {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
          },
        },
      }
    );

    if (confirmError) {
      setError(confirmError.message);
      setLoading(false);
      return;
    }

    try {
      await createSubscription({
        paymentMethodId: setupIntent.payment_method,
        priceId: import.meta.env.VITE_STRIPE_PRICE_ID,
        customerInfo: { userId: user.id, email: formData.email },
      });
    } catch (err) {
      let msg = err.message;
      if (err.response) {
        try {
          const body = await err.response.json();
          msg = body.error || msg;
        } catch {}
      }
      setError(err.message || "Subscription failed");
      setLoading(false);
    }
    setSuccess(true);
  };

  if (success) {
    // Set up redirect after 12 seconds
    const redirectTimer = setTimeout(() => {
      navigate("/checkout-response");
    }, 3500);

    return (
      <div className="max-w-lg mx-auto my-10 px-5 text-center">
        <h1 className="text-3xl font-semibold mb-4">
          Subscription Successful!
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          Thank you for subscribing. You will receive a confirmation email
          shortly.
        </p>
        <div className="bg-green-100 p-4 rounded-md text-green-800 mb-4">
          Your subscription has been activated successfully.
        </div>
        <p className="text-sm text-gray-500">
          You will be redirected back to checkout in a few seconds...
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto my-10 px-5 text-center">
        Loading your account information...
      </div>
    );
  }

  if (authError) {
    return (
      <div className="max-w-lg mx-auto my-10 px-5 text-center">
        <div className="bg-red-100 p-4 rounded-md text-red-800">
          Error loading your account. Please try refreshing the page or signing
          in again.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto my-10 px-5">
      <div className="bg-white rounded-2xl p-6 shadow-md text-center mb-10">
        <h1 className="text-3xl font-semibold">Your Subscription</h1>
        <p className="text-4xl font-extrabold mt-4">
          $100<span className="text-2xl font-medium">/mo</span>
        </p>
        <p className="mt-2 text-gray-600">
          Unlock member pricing on all medical devices
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col space-y-8">
        {/* Name Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="p-3 border border-gray-300 rounded-md text-sm w-full"
              required
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="p-3 border border-gray-300 rounded-md text-sm w-full"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-md text-sm"
            required
          />
        </div>

        {/* Billing Address */}
        <div className="flex flex-col space-y-4">
          <h2 className="text-lg font-medium text-gray-800">Billing To</h2>
          <input
            type="text"
            name="billingAddress1"
            value={formData.billingAddress1}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-md text-sm"
            placeholder="Street address"
            required
          />
          <input
            type="text"
            name="billingAddress2"
            value={formData.billingAddress2}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-md text-sm"
            placeholder="Apt, suite, building (optional)"
          />
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Zip Code
            </label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              className="p-3 border border-gray-300 rounded-md text-sm"
              required
            />
          </div>
        </div>

        {/* Stripe Card Element */}
        <div className="flex flex-col space-y-4">
          <h2 className="text-lg font-medium text-gray-800">Payment Details</h2>
          <div className="p-3 border border-gray-300 rounded-md bg-white">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#424770",
                    "::placeholder": {
                      color: "#aab7c4",
                    },
                  },
                  invalid: {
                    color: "#9e2146",
                  },
                },
              }}
            />
          </div>
        </div>

        {error && <p className="text-red-600 text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white rounded-md text-sm disabled:opacity-50"
        >
          {loading ? "Processing…" : "Subscribe"}
        </button>
      </form>
    </div>
  );
}

export default function Subscription() {
  const [clientSecret, setClientSecret] = useState("");
  const { user } = useUserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return navigate("/login");

    (async () => {
      const { active } = await checkSubscription(user.id);
      if (active) {
        navigate("/checkout");
      } else {
        const { clientSecret } = await createSetupIntent(
          import.meta.env.VITE_STRIPE_PRICE_ID
        );
        setClientSecret(clientSecret);
      }
    })();
  }, [user, navigate]);

  if (!clientSecret) {
    return <p className="text-center mt-8">Loading payment form…</p>;
  }

  return (
    <Elements stripe={stripePromise}>
      <SubscriptionForm clientSecret={clientSecret} />
    </Elements>
  );
}
