import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  createSubscription as createSubscriptionService, // Renamed to avoid shadowing
  checkSubscription,
} from "../services/stripeClient";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function SubscriptionForm({ clientSecret, onSubscriptionSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useUserAuth();
  const [formData, setForm] = useState({
    firstName: "",
    lastName: "",
    email: user.email,
    billingAddress1: "",
    billingAddress2: "",
    zipCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isMounted = useRef(true); // Keep track of mount status

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  useEffect(() => {
    return () => {
      isMounted.current = false; // Set to false when unmounted
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!stripe || !elements) {
      setError("Stripe hasn't loaded yet. Please refresh the page.");
      setLoading(false);
      return;
    }

    try {
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
        if (isMounted.current) {
          setError(confirmError.message);
          setLoading(false);
        }
        return;
      }

      try {
        await createSubscriptionService({ // Use the renamed import
          paymentMethodId: setupIntent.payment_method,
          priceId: import.meta.env.VITE_STRIPE_PRICE_ID,
          customerInfo: { userId: user.id, email: formData.email },
        });

        if (isMounted.current) { //check if the component is mounted before calling the callback
          onSubscriptionSuccess(); // Notify the parent component
          setLoading(false); //set loading to false
        }

      } catch (err) {
        let msg = err.message;
        if (err.response) {
          try {
            const body = await err.response.json();
            msg = body.error || msg;
          } catch { }
        }
        if (isMounted.current) { //check if the component is mounted before setting state
          setError(msg || "Subscription failed");
          setLoading(false);
        }
        return;
      }
    } catch (err) {
      if (isMounted.current) {
        setError("An unexpected error occurred. Please try again.");
        setLoading(false);
      }
    }
  };

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
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const { shippingAddressId, billingAddressId } = location.state || {};

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
  
    const checkAndSetupSubscription = async () => {
      setLoading(true);
      try {
        const { active } = await checkSubscription(user.id);
        setSubscriptionActive(active);
  
        if (!active) {
          const { clientSecret } = await createSetupIntent(
            import.meta.env.VITE_STRIPE_PRICE_ID
          );
          setClientSecret(clientSecret);
        }
      } catch (error) {
        console.error("Error checking/setting up subscription:", error);
        navigate("/error");
      } finally {
        setLoading(false);
      }
    };
  
    checkAndSetupSubscription();
  }, [user, navigate]);
  
  useEffect(() => {
    if (subscriptionActive) {
      navigate("/place-order", {
        state: { shippingAddressId, billingAddressId },
      });
    }
  }, [subscriptionActive, navigate, shippingAddressId, billingAddressId]);
  

  const handleSubscriptionSuccess = () => {
    setSubscriptionActive(true); // Update state on successful subscription
    navigate("/place-order", { 
      state: { 
        shippingAddressId, billingAddressId
      }
    }) // Redirect
  };

  if (loading) {
    return <p className="text-center mt-8">Loading payment form…</p>; // Or a more sophisticated loading indicator
  }

  if (!clientSecret) {
    return <p className="text-center mt-8">Setting up payment…</p>;
  }

  return (
    <Elements stripe={stripePromise}>
      <SubscriptionForm
        clientSecret={clientSecret}
        onSubscriptionSuccess={handleSubscriptionSuccess} // Pass the callback
      />
    </Elements>
  );
}
