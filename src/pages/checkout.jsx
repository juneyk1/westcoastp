import React, { useState } from 'react';

export default function Checkout() {
  const [items, setItems] = useState([
    { 
      sku: 1, 
      name: 'Gloves', 
      price: 2.99, 
      quantity: 1, 
      image: 'src/assets/gloves.png',
      seller: 'June',
      inStock: true,
      deliveryDate: 'Tuesday, February 2'
    },
    { 
      sku: 2, 
      name: 'Stethoscope', 
      price: 40.99, 
      quantity: 1, 
      image: 'src/assets/stethoscope.png',
      seller: 'Sophia',
      inStock: true,
      deliveryDate: 'Wednesday, February 3'
    },
    { 
        sku: 3, 
        name: 'Syringe', 
        price: 9.99, 
        quantity: 1, 
        image: 'src/assets/syringe.png',
        seller: 'Zach',
        inStock: true,
        deliveryDate: 'Wednesday, February 3'
      },
      { 
        sku: 4, 
        name: 'Band-aids', 
        price: 29.99, 
        quantity: 1, 
        image: 'src/assets/bandAids.png',
        seller: 'Dr. Klefstad',
        inStock: false,
        deliveryDate: 'Wednesday, February 3'
      },
      { 
        sku: 5, 
        name: 'Ozempic', 
        price: 19.99, 
        quantity: 1, 
        image: 'src/assets/ozempic.png',
        seller: 'Dr. Klefstad',
        inStock: true,
        deliveryDate: 'Wednesday, February 3'
      }
  ]);

  function calculateSubtotal() {
    let subtotal = 0; //Creates a subtotal
    for (const item of items) { //Loops through all items
      subtotal += item.price * item.quantity; // Adds all them toghter to the price
    }
    return subtotal;
  }

  const subtotal = calculateSubtotal();
  const finalTotal = (subtotal * 1.08).toFixed(2);
  

  
  function handleQuantityChange(itemSku, newQuantity) {
  // This function changes the quantity of a specific item.
  // 'itemId' is the unique ID of the item we want to change.
  // 'newQuantity' is the new quantity we want to set.

  if (newQuantity < 0) {
    return;
  }

  // We're going to create a new list of items with the updated quantity.
  const updatedItems = []; 


  for (let i = 0; i < items.length; i++) {
    const currentItem = items[i];

    if (currentItem.sku === itemSku) {
      const updatedItem = { ...currentItem, quantity: newQuantity }; 
      // Dupes object, copying prop. from currentItem modfying quantity
      updatedItems.push(updatedItem);
    } else {
      updatedItems.push(currentItem);
    }
  }
  setItems(updatedItems);
}

  function handleRemoveItem(sku) {
    // This function removes an item from the cart based on its sku
    // 'sku' is the sku of the item to be removed.

  const updatedItems = []; // List of things we are going to keep

  for (let i = 0; i < items.length; i++) {
    const currentItem = items[i];

    if (currentItem.sku !== sku) {
      updatedItems.push(currentItem);
    }
  }

  setItems(updatedItems); // Update the cart
  }

  return (
<div className=" bg-gray-50">
  <div className="w-full">
    <div className="grid grid-cols-12 gap-8">
      {/* Main Cart Section */}
      <div className="col-span-12 lg:col-span-8 p-6">
        <h1 className="text-5xl font-normal text-gray-900 px-13 py-8 mb-4">Shopping Cart</h1>
        <div className="border-dashed">
          {items.map((item) => (
            <div key={item.id} className="py-4 px-8 border-t border-gray-200 first:border-t-0">
              <div className="flex gap-4">
                <div className="w-32 flex-shrink-0 ">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-auto "
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-medium mb-1">{item.name}</h3>
                  {item.inStock ? (
          <p className="text-sm text-green-600 mb-1">In Stock</p>
        ) : (
          <p className="text-sm text-red-600 mb-1">Out Of Stock</p>
        )}
                  <p className="text-xs text-gray-500 mb-2">Ships from and sold by {item.seller}</p>
                  <p className="text-xs text-gray-500 mb-4">Delivery: {item.deliveryDate}</p>
                  
                  <div className="flex items-center space-x-4 text-white">
                    <select
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.sku, parseInt(e.target.value))}
                      className="border border-gray-300 rounded p-1 text-sm bg-gray-50 text-black"
                    >
                      {[...Array(90)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          Qty: {i + 1}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleRemoveItem(item.sku)}
                      className="text-xs text-black hover:text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="w-24 text-right">
                  <span className="text-lg font-medium">${item.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-right py-4 text-lg text-black">
          Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items):
          <span className="font-bold ml-2">${subtotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Checkout Sidebar */}
      <div className="col-span-12 lg:col-span-4 p-6 py-38">
        <div className="bg-white p-6 border border-gray-200 sticky top-6">
          <p className="text-green-600 text-sm mb-4">
            Your order qualifies for FREE Shipping
          </p>
          <div className="space-y-2 mb-4">
            <p className="text-lg text-black">
              Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items):
              <span className="font-bold ml-1">${subtotal.toFixed(2)}</span>
            </p>
            <p className="text-lg text-black">
              Final Total
              <span className="font-bold ml-1">${finalTotal}</span>
            </p> 
            <p className='text-emerald-400 text-xl'>Total Amount saved $10 </p>
          </div>
          <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-sm font-medium py-2 px-4 rounded transition-colors mb-2">
            Proceed to checkout
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
  );
}
