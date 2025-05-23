import React from "react"; 
import { useEffect } from "react";
import { atom, useAtom } from "jotai";
import supabaseClient from "../services/supabaseClient";
import { userAtom } from "../contexts/AuthContexts";

// Atoms
export const subscriptionAtom = atom(null);
export const subscriptionLoadingAtom = atom(false);
export const subscriptionErrorAtom = atom(null);

// Helper components
const LoadingSkeleton = () => (
  <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-lg font-medium mb-4">MY SUBSCRIPTIONS</h3>
    <div className="border-t pt-4">
      <div className="animate-pulse flex space-x-4">
        <div className="flex-1 space-y-4 py-1">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  </div>
);

const ErrorMessage = ({ onRetry }) => (
  <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-lg font-medium mb-4">MY SUBSCRIPTIONS</h3>
    <div className="border-t pt-4">
      <div className="text-red-500 mb-4">
        Unable to load subscription details. Please try again later.
      </div>
      <div className="flex space-x-4">
        <button
          onClick={onRetry}
          className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Retry
        </button>
        <a
          href="/subscriptions"
          className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
        >
          Manage Subscriptions
        </a>
      </div>
    </div>
  </div>
);

const NoSubscription = () => (
  <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-lg font-medium mb-4">MY SUBSCRIPTIONS</h3>
    <div className="border-t pt-4">
      <p className="mb-4">You don't have any active subscriptions.</p>
      <a
        href="/subscriptions"
        className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Browse Subscription Plans
      </a>
    </div>
  </div>
);

const SubscriptionActive = ({ subscription }) => (
  <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-lg font-medium mb-4">MY SUBSCRIPTIONS</h3>
    <div className="border-t pt-4">
      <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">Active Subscription</h3>
            <div className="mt-2 text-sm text-green-700">
              <p>Customer ID: {subscription.stripe_customer_id}</p>
              {subscription.name && <p className="mt-1">Name: {subscription.name}</p>}
              <p className="mt-1">Email: {subscription.email}</p>
              <p className="mt-1">Since: {new Date(subscription.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex space-x-4">
        <a
          href="/subscriptions"
          className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Manage Subscription
        </a>
        
        <a
          href="/billing-history"
          className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
        >
          Billing History
        </a>
      </div>
    </div>
  </div>
);

export const SubscriptionSection = () => {
  const [user] = useAtom(userAtom);
  const [subscription, setSubscription] = useAtom(subscriptionAtom);
  const [isLoading, setIsLoading] = useAtom(subscriptionLoadingAtom);
  const [error, setError] = useAtom(subscriptionErrorAtom);

  const fetchSubscription = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: supabaseError } = await supabaseClient
        .from("subscribers")
        .select("*")
        .eq("user_id", user.id)
        .single();
        
      if (supabaseError) {
        if (supabaseError.code === "PGRST116") {
          setSubscription(null);
          return;
        }
        throw supabaseError;
      }
      
      setSubscription(data);
    } catch (err) {
      console.error("Error fetching subscription:", err);
      setError(err.message || "Failed to fetch subscription data");
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user?.id]);

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage onRetry={fetchSubscription} />;
  if (!subscription) return <NoSubscription />;

  return <SubscriptionActive subscription={subscription} />;
};

export const useSubscription = () => {
  const [subscription] = useAtom(subscriptionAtom);
  const [isLoading] = useAtom(subscriptionLoadingAtom);
  const [error] = useAtom(subscriptionErrorAtom);
  
  return {
    subscription,
    isLoading,
    error,
    isSubscribed: Boolean(subscription)
  };
};