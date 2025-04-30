import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51RHjcU095U3ovyFQpzMXWiESIHyrPFWLZw9ZDkv3bLfYBjcl3AX6nbfMDN3hByS889U374PWYUCWGGiVRpiAVYiF008jihvzxt');

const PRODUCT_ID = 'prod_SC7u7P8S6ntLiz';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    billingAddress1: '',
    billingAddress2: '',
    zipCode: '',
    email: ''
  });

  useEffect(() => {
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
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
        billing_details: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Send payment method to backend
      const response = await fetch('http://127.0.0.1:42069/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          productId: PRODUCT_ID,
          customerInfo: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
          }
        }),
      });
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Handle subscription confirmation
      if (result.clientSecret) {
        const { error: confirmError } = await stripe.confirmCardPayment(result.clientSecret);
        
        if (confirmError) {
          throw new Error(confirmError.message);
        }
        
        setSubscriptionSuccess(true);
      } else {
        // If no client secret is returned but operation was successful
        setSubscriptionSuccess(true);
      }
    } catch (err) {
      setPaymentError(err.message || "An error occurred while processing your payment.");
      console.error("Payment error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Show success message if subscription is successful
  if (subscriptionSuccess) {
    return (
      <div className="max-w-lg mx-auto my-10 px-5 text-center">
        <h1 className="text-3xl font-semibold mb-4">Subscription Successful!</h1>
        <p className="text-lg text-gray-700 mb-6">
          Thank you for subscribing. You will receive a confirmation email shortly.
        </p>
        <div className="bg-green-100 p-4 rounded-md text-green-800">
          Your subscription has been activated successfully.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto my-10 px-5">
      <h1 className="text-3xl font-semibold text-center mb-2">Your Subscription</h1>
      <div className="text-xl text-gray-600 text-center mb-10">$1000/mo</div>

      <div className="flex flex-col space-y-8">
        {/* Name Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">First Name</label>
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
            <label className="text-sm font-medium text-gray-700">Last Name</label>
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
            <label className="text-sm font-medium text-gray-700">Zip Code</label>
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
            <CardElement options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              }
            }} />
          </div>
        </div>

        {paymentError && (
          <div className="text-red-600 text-sm">{paymentError}</div>
        )}

        <button 
          onClick={handleSubmit}
          className="bg-black text-white py-4 rounded-md font-semibold text-base cursor-pointer mt-4 disabled:opacity-50"
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Subscribe'}
        </button>
      </div>
    </div>
  );
};

// Main component that wraps the form with Stripe Elements
const SubscriptionPage = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default SubscriptionPage;