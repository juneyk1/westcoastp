import React from 'react';

const SubscriptionSuccess = ({ subscriptionId, customerName, email }) => {
  return (
    <div className="max-w-lg mx-auto my-16 px-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Subscription Confirmed!</h1>
        <p className="text-gray-600 text-lg">Thank you for your subscription</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="border-b pb-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Order Details</h2>
          <p className="text-gray-500 text-sm">Subscription #{subscriptionId || "Processing"}</p>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Plan</span>
            <span className="font-medium">Premium Subscription</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount</span>
            <span className="font-medium">$1000.00/month</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Customer</span>
            <span className="font-medium">{customerName || "Customer"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email</span>
            <span className="font-medium">{email || "customer@example.com"}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-5 text-blue-800 text-sm">
        <p>A confirmation email has been sent to your email address with all the details of your subscription.</p>
      </div>
      
      <div className="mt-8 text-center">
        <button 
          onClick={() => window.location.href = '/'}
          className="bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition"
        >
          Return Home
        </button>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;