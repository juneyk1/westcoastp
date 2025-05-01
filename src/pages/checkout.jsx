import React, { useState } from 'react';
import Header from './header'
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";


export default function Checkout() {
  //const navigate = useNavigate();
  const { items, setItems } = useCart();

  function calculateSubtotal() {
    let subtotal = 0; //Creates a subtotal
    for (const item of items) { //Loops through all items
      subtotal += item.price * item.quantity; // Adds all them toghter to the price
    }
    return subtotal;
  }
  function calculateOGSubtotal() {
    let subtotal = 0; //Creates a subtotal
    for (const item of items) { //Loops through all items
      subtotal += item.ogPrice * item.quantity; // Adds all them toghter to the price
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
    setItems(items.map(item => 
      item.sku === itemSku ? { ...item, quantity: newQuantity } : item
    ));
  }



  return (
    <div className="max-w-6xl mx-auto">
      <Header/>
    <h2 className="text-3xl font-medium mb-6">Your Cart ({items.length} items)</h2>
    
    <div className="grid grid-cols-12 gap-8">
      <div className="col-span-12 lg:col-span-8">
        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.sku} className="flex items-start gap-4 pb-6 border-b border-gray-200">
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

      <div className="col-span-12 lg:col-span-4">
        <div className="bg-gray-50 p-6 rounded-lg">
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
            <button onClick={() => navigate("/subscribe")}
              className="w-full bg-black text-white py-3 rounded hover:bg-gray-800">
              Check out
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>

);
}
