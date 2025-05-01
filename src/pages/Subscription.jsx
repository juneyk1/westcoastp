import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { supabaseClient } from "../services/supabaseClient";
import { UserAuth } from "../contexts/AuthContexts";

const stripePromise = loadStripe(
  "pk_test_51RHjcU095U3ovyFQpzMXWiESIHyrPFWLZw9ZDkv3bLfYBjcl3AX6nbfMDN3hByS889U374PWYUCWGGiVRpiAVYiF008jihvzxt"
);

const PRODUCT_ID = "prod_SC7u7P8S6ntLiz";

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { user, signOut, loading, error: authError } = UserAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);
  const [supabaseUpdateSuccess, setSupabaseUpdateSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    billingAddress1: "",
    billingAddress2: "",
    zipCode: "",
    email: "",
  });

  useEffect(() => {
    // Pre-fill email if user is logged in
    if (user && user.email) {
      setFormData((prev) => ({
        ...prev,
        email: user.email,
      }));
    }

    // Fetch client secret from your backend
    fetch('http://127.0.0.1:42069/api/create-subscription-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: PRODUCT_ID
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setPaymentError(data.error);
        } else {
          setClientSecret(data.clientSecret);
        }
      })
      .catch((err) => {
        setPaymentError("Failed to connect to the server. Please try again later.");
        console.error("Error fetching client secret:", err);
      });
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Function to update user subscription in Supabase
  const updateUserSubscriptionInSupabase = async (userId) => {
    try {
      if (!userId) {
        console.error("Cannot update subscription: User ID is missing");
        return false;
      }
  
      // Update the users table with is_subscribed field
      const { data, error, status } = await supabaseClient
        .from("users")
        .update({ 
          is_subscribed: true,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId);
  
      // Handle both error cases and 204 No Content success case
      if (error) {
        console.error("Error updating subscription in Supabase:", error);
        return false;
      }
      
      // Status 204 means success with no content returned
      if (status === 204 || status === 200) {
        console.log("Supabase subscription updated successfully for user:", userId);
        return true;
      }
      
      console.log("Supabase response status:", status);
      return true;
    } catch (err) {
      console.error("Exception updating subscription in Supabase:", err);
      return false;
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    // Check if user is logged in
    if (!user) {
      setPaymentError(
        "You must be logged in to subscribe. Please sign in first."
      );
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: elements.getElement(CardElement),
        billing_details: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Send payment method to backend
      const response = await fetch(
        "http://127.0.0.1:42069/api/create-subscription",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentMethodId: paymentMethod.id,
            productId: PRODUCT_ID,
            customerInfo: {
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              userId: user.id, // Pass user ID to backend if needed
            },
          }),
        }
      );

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      // Handle subscription confirmation
      if (result.status === "succeeded" || result.status === "active") {
        // Payment was already successful, update Supabase
        const supabaseResult = await updateUserSubscriptionInSupabase(user.id);
        setSupabaseUpdateSuccess(supabaseResult);
        setSubscriptionSuccess(true);
      } else if (result.clientSecret) {
        // Need to confirm the payment
        const confirmResult = await stripe.confirmCardPayment(
          result.clientSecret
        );

        if (confirmResult.error) {
          throw new Error(confirmResult.error.message);
        }

        // After successful payment, update Supabase
        const supabaseResult = await updateUserSubscriptionInSupabase(user.id);
        setSupabaseUpdateSuccess(supabaseResult);
        setSubscriptionSuccess(true);
      } else {
        // If no client secret is returned but operation was successful
        // Still update Supabase
        const supabaseResult = await updateUserSubscriptionInSupabase(user.id);
        setSupabaseUpdateSuccess(supabaseResult);
        setSubscriptionSuccess(true);
      }
    } catch (err) {
      setPaymentError(
        err.message || "An error occurred while processing your payment."
      );
      console.error("Payment error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (subscriptionSuccess) {
    // Set up redirect after 12 seconds
    const redirectTimer = setTimeout(() => {
      navigate('/');
    }, 12000);
  
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
          {supabaseUpdateSuccess
            ? " Your account has been updated with premium access."
            : " However, there was an issue updating your account status. Please contact support."}
        </div>
        <p className="text-sm text-gray-500">
          You will be redirected to the home page in 12 seconds...
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
      <h1 className="text-3xl font-semibold text-center mb-2">
        Your Subscription
      </h1>
      <div className="text-xl text-gray-600 text-center mb-10">$1000/mo</div>

      {!user && (
        <div className="bg-yellow-100 p-4 rounded-md text-yellow-800 mb-6">
          You need to be signed in to purchase a subscription. Please sign in
          first.
        </div>
      )}

      <div className="flex flex-col space-y-8">
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

        {paymentError && (
          <div className="text-red-600 text-sm">{paymentError}</div>
        )}

        <button
          onClick={handleSubmit}
          className="bg-black text-white py-4 rounded-md font-semibold text-base cursor-pointer mt-4 disabled:opacity-50"
          disabled={!stripe || isProcessing || !user}
        >
          {isProcessing ? "Processing..." : "Subscribe"}
        </button>
      </div>
    </div>
  );
};

const SubscriptionPage = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default SubscriptionPage;
