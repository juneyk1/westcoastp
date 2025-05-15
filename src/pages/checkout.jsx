import React, { useEffect } from "react";
import Header from "./header";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import Appendices from "./Appendices";
import { useUserAuth, defaultShippingAddressAtom, defaultBillingAddressAtom } from "../contexts/AuthContexts";
import { useAtom } from "jotai";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, setItems } = useCart();
  const { 
    user, 
    addresses, 
    isLoading: authLoading 
  } = useUserAuth();
  
  const [defaultShippingAddress] = useAtom(defaultShippingAddressAtom);
  const [defaultBillingAddress] = useAtom(defaultBillingAddressAtom);
  const [selectedShippingAddress, setSelectedShippingAddress] = React.useState(null);
  const [selectedBillingAddress, setSelectedBillingAddress] = React.useState(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !authLoading) {
      navigate("/signup", { state: { from: "/checkout" } });
    }
  }, [user, authLoading, navigate]);

  // Set default addresses when they're available
  useEffect(() => {
    if (defaultShippingAddress) {
      setSelectedShippingAddress(defaultShippingAddress.id);
    }
    if (defaultBillingAddress) {
      setSelectedBillingAddress(defaultBillingAddress.id);
    }
  }, [defaultShippingAddress, defaultBillingAddress]);

  function calculateSubtotal() {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  function calculateOGSubtotal() {
    return items.reduce((sum, item) => sum + (item.ogPrice * item.quantity), 0);
  }

  const subtotal = calculateSubtotal();
  const salesTax = subtotal * 0.08;
  const grandTotal = (subtotal + salesTax).toFixed(2);

  const OGsubtotal = calculateOGSubtotal();
  const OGsalesTax = OGsubtotal * 0.08;
  const OGgrandTotal = (OGsubtotal + OGsalesTax).toFixed(2);

  function handleQuantityChange(itemSku, newQuantity) {
    if (newQuantity < 0) return;

    if (newQuantity === 0) {
      // Remove the item from the cart
      setItems(items.filter(item => item.sku !== itemSku));
    } else {
      // Update the quantity
      setItems(items.map(item => 
        item.sku === itemSku ? { ...item, quantity: newQuantity } : item
      ));
    }
  }

  const handleCheckout = () => {
    setIsProcessing(true);
    if (!selectedShippingAddress || !selectedBillingAddress) {
      alert("Please select both shipping and billing addresses");
      setIsProcessing(false);
      return;
    }
    navigate("/subscribe", { 
      state: { 
        shippingAddressId: selectedShippingAddress,
        billingAddressId: selectedBillingAddress
      }
    });
  };

  if (authLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4 min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-lg font-medium">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter addresses by type
  const shippingAddresses = addresses.filter(addr => 
    addr.type === 'shipping' || addr.type === 'both'
  );
  
  const billingAddresses = addresses.filter(addr => 
    addr.type === 'billing' || addr.type === 'both'
  );

  return (
    <div className="max-w-6xl mx-auto">
      <Header/>
    <h2 className="text-3xl font-medium mb-6">Your Cart ({items.length} items)</h2>
    
    <div className="grid grid-cols-12 gap-8">
      <div className="col-span-12 lg:col-span-8">
        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.sku} className="flex items-start gap-4 pb-6 border-b border-gray-200">
              <div className="w-80 h-80">
              <img 
                src={item.image}
                alt={item.name}
                className="w-full h-full object-contain"
              />
              </div>
              
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{item.name}</h3>
                    {item.description && (
                      <p className="text-sm text-gray-600">{item.description}</p>
                    )}
                    {item.shippingDate && (
                      <p className="text-sm text-green-800">
                        {item.isShippingDateEstimated ? 'Estimated ' : ''}
                        Ship Date: {item.shippingDate}
                      </p>
                    )}
                    {item.seller && (
                      <p className="text-sm text-gray-500">{item.seller}</p>
                    )}
                  </div>
                  <div className="flex items-center"> {/* items-center for vertical alignment */}
                  <strike className="text-lg font-medium mr-2 text-gray-500">${item.ogPrice}</strike> {/* Add margin for spacing */}
                  <p className="text-lg font-medium">${item.price.toFixed(2)}</p>
                </div>
                </div>
                
                <div className="mt-4 flex items-center gap-2">
                  <div className="inline-flex items-center border rounded">
                    <button 
                      onClick={() => handleQuantityChange(item.sku, Math.max(0, item.quantity - 1))}
                      className="px-2 py-1 hover:bg-gray-100"
                    >
                      −
                    </button>
                    <span className="px-4 py-1 border-x min-w-[40px] text-center">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => handleQuantityChange(item.sku, item.quantity + 1)}
                      className="px-2 py-1 hover:bg-gray-100"
                    >
                    +  
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

        {items.length > 0 && (
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
                  className={`w-full bg-black text-white py-3 rounded hover:bg-gray-800 flex items-center justify-center ${
                    (!selectedShippingAddress || !selectedBillingAddress || isProcessing) ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  disabled={!selectedShippingAddress || !selectedBillingAddress || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Check out'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Appendices/>
    </div>
  );
}