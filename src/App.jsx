import './App.css'
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Checkout from './pages/checkout'
import Landing from './pages/Landing'
import ProductInfo from './pages/ProductInfo';
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/product-info" element={<ProductInfo />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
    </Router>
  );
}


