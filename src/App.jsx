import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Checkout from "./pages/checkout";
import Landing from "./pages/Landing";
import ProductInfo from "./pages/ProductInfo";
import SubscriptionForm from "./pages/Subscription";
import LoginPage from "./pages/LoginPage";
import SignUp from "./pages/signUp";
import About from "./pages/About";
import Account from "./pages/Account";
import Appendices from "./pages/Appendices";
import CheckoutResponse from "./pages/checkout-response";
import { CartProvider } from "../src/contexts/CartContext";
import { AuthContextProvider } from "./contexts/AuthContexts";

export default function App() {
  return (
    <Router>
      <AuthContextProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/subscribe" element={<SubscriptionForm />} />
            <Route path="/about" element={<About />} />
            <Route path="/account" element={<Account />} />
            <Route path="/notices" element={<Appendices />} />
            <Route path="/checkout-response" element={<CheckoutResponse />} />
            <Route path="/products/:productName" element={<ProductInfo />} />
          </Routes>
        </CartProvider>
      </AuthContextProvider>
    </Router>
  );
}