import React, { useState, useEffect } from "react";
import Header from "./header";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { UserAuth } from "../contexts/AuthContexts";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, setItems } = useCart();
  const { user, addresses } = UserAuth();
  const [selectedShippingAddress, setSelectedShippingAddress] = useState(null);
  const [selectedBillingAddress, setSelectedBillingAddress] = useState(null);

  // Filter addresses by type with default addresses first
  const shippingAddresses = addresses
    .filter(addr => addr.type === 'shipping' || addr.type === 'both')
    .sort((a, b) => b.is_default - a.is_default);
    
  const billingAddresses = addresses
    .filter(addr => addr.type === 'billing' || addr.type === 'both')
    .sort((a, b) => b.is_default - a.is_default);

  // Set default addresses when addresses load
  useEffect(() => {
    if (shippingAddresses.length > 0) {
      const defaultShipping = shippingAddresses.find(addr => addr.is_default) || shippingAddresses[0];
      setSelectedShippingAddress(defaultShipping.id);
    }
    if (billingAddresses.length > 0) {
      const defaultBilling = billingAddresses.find(addr => addr.is_default) || billingAddresses[0];
      setSelectedBillingAddress(defaultBilling.id);
    }
  }, [addresses]);

  function calculateSubtotal() {
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.price * item.quantity;
    }
    return subtotal;
  }

  function calculateOGSubtotal() {
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.ogPrice * item.quantity;
    }
    return subtotal;
  }

  const subtotal = calculateSubtotal();
  const salesTax = subtotal * 0.08;
  const grandTotal = (subtotal + salesTax).toFixed(2);

  const OGsubtotal = calculateOGSubtotal();
  const OGsalesTax = OGsubtotal * 0.08;
  const OGgrandTotal = (OGsubtotal + OGsalesTax).toFixed(2);

  function handleQuantityChange(itemSku, newQuantity) {
    if (newQuantity < 0) return;
    setItems(
      items.map((item) =>
        item.sku === itemSku ? { ...item, quantity: newQuantity } : item
      )
    );
  }

  const handleCheckout = () => {
    if (!selectedShippingAddress || !selectedBillingAddress) {
      alert("Please select both shipping and billing addresses");
      return;
    }
    // Here you would typically pass the selected addresses to your order processing
    console.log("Selected Shipping Address ID:", selectedShippingAddress);
    console.log("Selected Billing Address ID:", selectedBillingAddress);
    navigate("/subscribe");
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Header />
      <h2 className="text-3xl font-medium mb-6">
        Your Cart ({items.length} items)
      </h2>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8">
          <div className="space-y-6">
            {items.map((item) => (
              <div
                key={item.sku}
                className="flex items-start gap-4 pb-6 border-b border-gray-200"
              >
                <div className="w-24 h-24">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-600">
                          {item.description}
                        </p>
                      )}
                      {item.shippingDate && (
                        <p className="text-sm text-green-800">
                          {item.isShippingDateEstimated ? "Estimated " : ""}
                          Ship Date: {item.shippingDate}
                        </p>
                      )}
                      {item.seller && (
                        <p className="text-sm text-gray-500">{item.seller}</p>
                      )}
                    </div>
                    <div className="flex items-center">
                      <strike className="text-lg font-medium mr-2 text-gray-500">
                        ${item.ogPrice}
                      </strike>
                      <p className="text-lg font-medium">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <div className="inline-flex items-center border rounded">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.sku,
                            Math.max(0, item.quantity - 1)
                          )
                        }
                        className="px-2 py-1 hover:bg-gray-100"
                      >
                        −
                      </button>
                      <span className="px-4 py-1 border-x min-w-[40px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantityChange(item.sku, item.quantity + 1)
                        }
                        className="px-2 py-1 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Address Selection Section */}
            <div className="mt-8 space-y-6">
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Shipping Address</h3>
                {shippingAddresses.length > 0 ? (
                  <select
                    value={selectedShippingAddress || ""}
                    onChange={(e) => setSelectedShippingAddress(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    {shippingAddresses.map((address) => (
                      <option key={address.id} value={address.id}>
                        {address.first_name} {address.last_name} - {address.address_line1}, {address.city}, {address.state} {address.postal_code}
                        {address.is_default && " (Default)"}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-500">
                    No shipping addresses saved. 
                    <a href="/account/addresses" className="text-blue-500 ml-2">
                      Add one now
                    </a>
                  </p>
                )}
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Billing Address</h3>
                {billingAddresses.length > 0 ? (
                  <select
                    value={selectedBillingAddress || ""}
                    onChange={(e) => setSelectedBillingAddress(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    {billingAddresses.map((address) => (
                      <option key={address.id} value={address.id}>
                        {address.first_name} {address.last_name} - {address.address_line1}, {address.city}, {address.state} {address.postal_code}
                        {address.is_default && " (Default)"}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-500">
                    No billing addresses saved. 
                    <a href="/account/addresses" className="text-blue-500 ml-2">
                      Add one now
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="bg-gray-50 p-6 rounded-lg sticky top-4">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Sales Tax:</span>
                <span>${salesTax.toFixed(2)}</span>
              </div>
              <div className="pt-4 border-t flex justify-between font-medium">
                <span>Grand total:</span>
                <span>${grandTotal}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Savings:</span>
                <span>${(OGgrandTotal - grandTotal).toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-green-600 mb-4">
                Congrats, you're eligible for Free Shipping
              </p>
              <button
                onClick={handleCheckout}
                className="w-full bg-black text-white py-3 rounded hover:bg-gray-800"
                disabled={!selectedShippingAddress || !selectedBillingAddress}
              >
                Check out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}