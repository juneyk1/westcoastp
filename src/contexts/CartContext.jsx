import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const addToCart = (product) => {
    const existing = items.find(item => item.name === product.name);
    if (existing) {
      setItems(items.map(item => 
        item.name === product.name
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setItems([...items, { ...product, quantity: 1 }]);
    }
  };

  return (
    <CartContext.Provider value={{ items, setItems, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};