import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Checkout from "./pages/checkout";
import Landing from "./pages/Landing";
import ProductInfo from "./pages/ProductInfo";
import LoginPage from "./pages/LoginPage";
import SignUp from "./pages/signUp";
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />{" "}
        {/* Landing page at the root URL */}
        <Route path="/product/:id" element={<ProductInfo />} />{" "}
        {/* Example: ProductInfo with a dynamic ID */}
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Router>
  );
}
