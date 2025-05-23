import "./App.css";
import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "../src/contexts/CartContext";
import { AuthProvider, useUserAuth } from "../src/contexts/AuthContexts";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_test_51RHjcU095U3ovyFQpzMXWiESIHyrPFWLZw9ZDkv3bLfYBjcl3AX6nbfMDN3hByS889U374PWYUCWGGiVRpiAVYiF008jihvzxt"); // Replace with your actual key

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Lazy load components
const Landing = lazy(() => import("./pages/Landing"));
const ProductInfo = lazy(() => import("./pages/ProductInfo"));
const Checkout = lazy(() => import("./pages/checkout"));
const Subscription = lazy(() => import("./pages/Subscription"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignUp = lazy(() => import("./pages/signUp"));
const About = lazy(() => import("./pages/About"));
const Account = lazy(() => import("./pages/Account"));
const NoticesOfPrivacyPractices = lazy(() => import('./pages/Notices'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const CheckoutResponse = lazy(() => import("./pages/checkout-response"));
const PlaceOrder = lazy(() => import("./pages/PlaceOrder"));

// Error boundary component to catch rendering errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-700 mb-4">
              We're sorry, but there was an error loading this page. Please try refreshing.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ProtectedRoute = ({ children }) => {
  const { user } = useUserAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user } = useUserAuth();
  return !user ? children : <Navigate to="/account" replace />;
};

const SubscriptionWithStripe = () => {
  const options = {
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#0066ff',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <Subscription />
    </Elements>
  );
};

export default function App() {
  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <CartProvider>
            <Suspense fallback={<LoadingSpinner />}>
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
                    <SubscriptionWithStripe />
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
                <Route path="/place-order" element={
                  <ProtectedRoute>
                    <PlaceOrder />
                  </ProtectedRoute>
                } />
              </Routes>
            </Suspense>
          </CartProvider>
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
}