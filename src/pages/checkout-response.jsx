import React from "react";
import Header from './header';

const CheckoutResponse = () => {
  const trackingNumber = "1234567890";

  return (
    <div>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-semibold mb-4">Checkout Successful</h2>
          <p className="text-gray-600 mb-6">
            Your order has been successfully processed.
          </p>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-gray-800 font-medium">
              Tracking Number: <span className="text-blue-500">{trackingNumber}</span>
            </p>
          </div>
          <p className="text-gray-600 mt-6">
            You can use this tracking number to track your order.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutResponse;