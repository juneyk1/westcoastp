import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Checkout from "./pages/checkout";
import Landing from "./pages/Landing";
import ProductInfo from "./pages/ProductInfo";
import SubscriptionForm from "./pages/Subscription";
//import Login from "./pages/Login";
//import CreateAccount from "./pages/CreateAccount";
import LoginPage from "./pages/LoginPage";
import SignUp from "./pages/signUp";
import About from "./pages/About";
import Account from "./pages/Account";
import Appendices from "./pages/Appendices";
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/product-info" element={<ProductInfo />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/subscribe" element={<SubscriptionForm />} />
        <Route path="/about" element={<About />} />
        <Route path="/Account" element={<Account />} />
        <Route path="/notices" element={<Appendices />} />
      </Routes>
    </Router>
    //<Account/>
  );
}
