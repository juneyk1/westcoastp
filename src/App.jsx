import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Checkout from "./pages/checkout";
import Landing from "./pages/Landing";
import ProductInfo from "./pages/ProductInfo";
import Subscription from "./pages/Subscription";
import LoginPage from "./pages/LoginPage";
import SignUp from "./pages/signUp";
import About from "./pages/About";
import Account from "./pages/Account";
import NoticesOfPrivacyPractices from './pages/Notices';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CheckoutResponse from "./pages/checkout-response";
import { CartProvider } from "../src/contexts/CartContext";
import { AuthProvider, useUserAuth } from "../src/contexts/AuthContexts";

const ProtectedRoute = ({ children }) => {
  const { user } = useUserAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user } = useUserAuth();
  return !user ? children : <Navigate to="/account" replace />;
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/notices" element={<NoticesOfPrivacyPractices />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/products/:productName" element={<ProductInfo />} />
            
            <Route path="/login" element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } />
            <Route path="/signup" element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            } />

            <Route path="/checkout" element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/subscribe" element={
              <ProtectedRoute>
                <Subscription />
              </ProtectedRoute>
            } />
            <Route path="/account" element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            } />
            <Route path="/checkout-response" element={
              <ProtectedRoute>
                <CheckoutResponse />
              </ProtectedRoute>
            } />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}