// src/pages/PlaceOrder.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../pages/header";
import { useCart } from "../contexts/CartContext";
import { useUserAuth } from "../contexts/AuthContexts";
import {
    createOrder
} from "../services/stripeClient";

export default function PlaceOrder() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, setItems } = useCart();
  const { user, addresses, isLoading: authLoading } = useUserAuth();

  // pulled from navigation state
  const { shippingAddressId, billingAddressId } = location.state || {};

  const [shippingAddress, setShippingAddress] = useState(null);
  const [billingAddress, setBillingAddress] = useState(null);
  const [loading, setLoading] = useState(false);

  // redirect if missing data
  useEffect(() => {
    if (!user && !authLoading) {
      navigate("/signup", { state: { from: "/place-order" } });
    }
    if (!shippingAddressId || !billingAddressId) {
      navigate("/checkout");
    }
  }, [user, authLoading,  shippingAddressId, billingAddressId, navigate]);

  // pick out full address objects
  useEffect(() => {
    if (addresses?.length) {
      setShippingAddress(
        addresses.find((a) => a.id === shippingAddressId) || null
      );
      setBillingAddress(
        addresses.find((a) => a.id === billingAddressId) || null
      );
    }
  }, [addresses, shippingAddressId, billingAddressId]);

  // totals
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = subtotal * 0.08;
  const grandTotal = (subtotal + tax).toFixed(2);

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const { orderId, error }  = await createOrder({
          user: user,
          items: items,
          shippingAddress: shippingAddress,
          billingAddress: billingAddress,
      })
      if (orderId) {
        setItems([]);
        navigate('/checkout-response');
      } else {
        alert("Failed to place order: " + error);
        setLoading(false);
      }
    } catch (err) {
      let msg = err.message;
      if (err.response) {
        try {
          const body = await err.response.json();
          msg = body.error || msg;
        } catch {}
      }
      setLoading(false);
    }
  };
    
  if (authLoading || !shippingAddress || !billingAddress) {
    return <div className="max-w-6xl mx-auto p-4">Loading…</div>;
  }
    
    return (
    <div>
     <Header />
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-medium my-6">Review & Place Order</h2>

      <div className="grid grid-cols-12 gap-8">
        {/* Items Summary */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.sku}
              className="flex justify-between border-b pb-4 items-center"
            >
              <div>
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm">
                  {item.quantity} × ${item.price.toFixed(2)}
                </p>
              </div>
              <div className="font-medium">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary & Addresses */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg space-y-3">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (8%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="pt-3 border-t flex justify-between font-semibold">
              <span>Total:</span>
              <span>${grandTotal}</span>
            </div>
        </div>
                  
        <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">Shipping To</h4>
            <p>
                {shippingAddress.first_name} {shippingAddress.last_name}
            </p>
            <p>{shippingAddress.address_line1}</p>
            {shippingAddress.address_line2 && (
                <p>{shippingAddress.address_line2}</p>
            )}
            <p>
                {shippingAddress.city}, {shippingAddress.state}{" "}
                {shippingAddress.postal_code}
            </p>
        </div>

        <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">Billing To</h4>
            <p>
                {billingAddress.first_name} {billingAddress.last_name}
            </p>
            <p>{billingAddress.address_line1}</p>
            {billingAddress.address_line2 && (
                <p>{billingAddress.address_line2}</p>
            )}
            <p>
                {billingAddress.city}, {billingAddress.state}{" "}
                {billingAddress.postal_code}
            </p>
        </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 disabled:opacity-50"
            >
            {loading ? "Placing Order…" : "Place Order"}
          </button>
        </div>
      </div>
        </div>
        </div>
  );
}