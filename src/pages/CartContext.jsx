
import React, { createContext, useState } from 'react';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addToCart = (product, quantity = 1) => {
    setItems(prev => {
      const exists = prev.find(item => item.sku === product.sku);
      if (exists) {
        // update quantity
        return prev.map(item =>
          item.sku === product.sku
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prev, { ...product, quantity }];
      }
    });
  };

  const updateQuantity = (sku, quantity) => {
    setItems(prev =>
      prev.map(item =>
        item.sku === sku ? { ...item, quantity } : item
      )
    );
  };

  return (
    <CartContext.Provider value={{ items, addToCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
}