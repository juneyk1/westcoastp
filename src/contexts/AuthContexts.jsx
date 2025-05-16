import { atom, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import supabaseClient from "../services/supabaseClient";
import React, { useRef, useEffect, useMemo, useCallback } from "react";
import { debounce } from "lodash";

// Create a storage atom for caching addresses with TTL
const addressCacheAtom = atomWithStorage('address-cache', {
  addresses: null,
  lastFetch: 0,
  userId: null
});

// Atoms
export const sessionAtom = atom(null);
export const userAtom = atom(null);
export const addressesAtom = atom([]);
export const authErrorAtom = atom(null);
export const authLoadingAtom = atom(false); // Default to false to prevent unnecessary loading states

// Derived atoms
export const defaultShippingAddressAtom = atom((get) =>
  get(addressesAtom).find(
    (addr) =>
      (addr.type === "shipping" || addr.type === "both") && addr.is_default
  )
);

export const defaultBillingAddressAtom = atom((get) =>
  get(addressesAtom).find(
    (addr) =>
      (addr.type === "billing" || addr.type === "both") && addr.is_default
  )
);

// Request tracking - moved outside hooks for stability
let requestCount = 0;
const logRequest = (method) => {
  requestCount++;
  console.log(`Supabase Request #${requestCount}: ${method}`);
};

// Address operations
export const useAddressActions = () => {
  const [addresses, setAddresses] = useAtom(addressesAtom);
  const [user] = useAtom(userAtom);
  const [isLoading, setIsLoading] = useAtom(authLoadingAtom);
  const [, setError] = useAtom(authErrorAtom);
  const [addressCache, setAddressCache] = useAtom(addressCacheAtom);
  
  // Store for pending updates
  const pendingUpdatesRef = useRef({});

  // Fetch addresses with proper caching
  // Stable reference with useCallback and memoized dependencies
  const fetchAddresses = useCallback(
    async (userId, forceRefresh = false) => {
      if (!userId) {
        return { success: false, error: new Error("User ID is required") };
      }


      const now = Date.now();
      const cacheValid = 
        !forceRefresh && 
        addressCache.addresses && 
        addressCache.userId === userId &&
        now - addressCache.lastFetch < 300000;
      
      if (cacheValid) {
        // Use cached data without triggering a new request
        setAddresses(addressCache.addresses);
        return { success: true, data: addressCache.addresses };
      }

      // Only make an API call if cache is invalid
      logRequest("fetchAddresses");
      setIsLoading(true);
      
      try {
        const { data, error } = await supabaseClient
          .from("addresses")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const result = data || [];
        
        // Update both the atom and the cache
        setAddresses(result);
        setAddressCache({
          addresses: result,
          lastFetch: now,
          userId
        });
        
        return { success: true, data: result };
      } catch (err) {
        setError(err?.message || "Fetch failed");
        return { success: false, error: err };
      } finally {
        setIsLoading(false);
      }
    },
    [setAddresses, setError, setIsLoading, addressCache, setAddressCache]
  );

  // Process batched updates
  const processUpdates = useCallback(async () => {
    const updates = pendingUpdatesRef.current;
    const updateValues = Object.values(updates);
    
    if (updateValues.length === 0) return;
    
    // Clear pending updates before processing
    pendingUpdatesRef.current = {};

    logRequest("batchUpdate");
    setIsLoading(true);
    
    try {
      const { data, error } = await supabaseClient
        .from("addresses")
        .upsert(updateValues)
        .select();

      if (error) throw error;

      // Update addresses in state and cache
      const updatedAddresses = addresses.map((addr) =>
        updates[addr.id] ? { ...addr, ...updates[addr.id] } : addr
      );
      
      setAddresses(updatedAddresses);
      setAddressCache(prev => ({
        ...prev,
        addresses: updatedAddresses
      }));
      
      return { success: true, data };
    } catch (err) {
      setError(err?.message || "Batch update failed");
      // Requeue failed updates
      pendingUpdatesRef.current = {
        ...pendingUpdatesRef.current,
        ...updates
      };
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  }, [addresses, setAddresses, setError, setIsLoading, setAddressCache]);

  // Create stable debounced function that persists across renders
  const debouncedProcessUpdates = useMemo(
    () => debounce(() => {
      processUpdates();
    }, 500),
    [processUpdates]
  );

  // Cleanup effect for debounced function
  useEffect(() => {
    return () => debouncedProcessUpdates.cancel();
  }, [debouncedProcessUpdates]);

  const addAddress = useCallback(
    async (addressData) => {
      if (!user?.id) {
        setError("User not authenticated");
        return { success: false, error: new Error("User not authenticated") };
      }

      logRequest("addAddress");
      setIsLoading(true);
      
      try {
        const { data, error } = await supabaseClient
          .from("addresses")
          .insert({ ...addressData, user_id: user.id })
          .select()
          .single();

        if (error) throw error;

        const updatedAddresses = [...addresses, data];
        setAddresses(updatedAddresses);
        
        // Update cache with new address
        setAddressCache(prev => ({
          ...prev,
          addresses: updatedAddresses
        }));
        
        return { success: true, data };
      } catch (err) {
        setError(err?.message || "Add address failed");
        return { success: false, error: err };
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, addresses, setAddresses, setError, setIsLoading, setAddressCache]
  );

  const updateAddress = useCallback(
    (id, updates) => {
      // Queue update in the pending updates
      pendingUpdatesRef.current[id] = { id, ...updates };
      debouncedProcessUpdates();

      // Optimistic update to state
      const updatedAddresses = addresses.map((addr) => 
        addr.id === id ? { ...addr, ...updates } : addr
      );
      
      setAddresses(updatedAddresses);
      
      // Also update the cache optimistically
      setAddressCache(prev => ({
        ...prev,
        addresses: updatedAddresses
      }));

      return { success: true };
    },
    [addresses, setAddresses, debouncedProcessUpdates, setAddressCache]
  );

  const removeAddress = useCallback(
    async (id) => {
      logRequest("removeAddress");
      setIsLoading(true);
      
      try {
        // Remove from pending updates if exists
        if (pendingUpdatesRef.current[id]) {
          delete pendingUpdatesRef.current[id];
        }

        const { error } = await supabaseClient
          .from("addresses")
          .delete()
          .eq("id", id);

        if (error) throw error;

        const updatedAddresses = addresses.filter((addr) => addr.id !== id);
        setAddresses(updatedAddresses);
        
        // Update cache after removal
        setAddressCache(prev => ({
          ...prev,
          addresses: updatedAddresses
        }));
        
        return { success: true };
      } catch (err) {
        setError(err?.message || "Delete address failed");
        return { success: false, error: err };
      } finally {
        setIsLoading(false);
      }
    },
    [addresses, setAddresses, setError, setIsLoading, setAddressCache]
  );

  const setDefaultAddress = useCallback(
    async (id) => {
      const addressToUpdate = addresses.find((addr) => addr.id === id);
      
      if (!addressToUpdate) {
        setError("Address not found");
        return { success: false, error: new Error("Address not found") };
      }

      const currentUserId = user?.id;
      if (!currentUserId) {
        setError("User not authenticated");
        return { success: false, error: new Error("User not authenticated") };
      }

      logRequest("setDefaultAddress");
      setIsLoading(true);
      
      try {
        const { data, error } = await supabaseClient.rpc(
          "set_default_address",
          {
            p_user_id: currentUserId,
            p_address_id: id,
            p_address_type: addressToUpdate.type,
          }
        );

        if (error) throw error;

        const updatedAddresses = addresses.map((addr) => ({
          ...addr,
          is_default:
            addr.id === id ||
            (addr.type !== addressToUpdate.type && addr.is_default),
        }));
        
        setAddresses(updatedAddresses);
        
        // Update cache with default address change
        setAddressCache(prev => ({
          ...prev,
          addresses: updatedAddresses
        }));

        return { success: true, data };
      } catch (err) {
        setError(err?.message || "Set default address failed");
        return { success: false, error: err };
      } finally {
        setIsLoading(false);
      }
    },
    [addresses, user?.id, setAddresses, setError, setIsLoading, setAddressCache]
  );

  return {
    fetchAddresses,
    addAddress,
    updateAddress,
    removeAddress,
    setDefaultAddress,
    isLoading,
  };
};

// Auth operations
export const useAuthActions = () => {
  const [, setSession] = useAtom(sessionAtom);
  const [, setUser] = useAtom(userAtom);
  const [, setAddresses] = useAtom(addressesAtom);
  const [, setError] = useAtom(authErrorAtom);
  const [, setIsLoading] = useAtom(authLoadingAtom);
  const [, setAddressCache] = useAtom(addressCacheAtom);

  const resetError = useCallback(() => setError(null), [setError]);

  const signUpNewUser = useCallback(async (email, password) => {
    resetError();
    setIsLoading(true);

    try {
      const { data, error: signUpError } = await supabaseClient.auth.signUp({
        email: email.toLowerCase().trim(),
        password: password,
      });

      if (signUpError) {
        if (signUpError.message.includes("already exists")) {
          const errorMsg =
            "Email already exists. Please use a different email.";
          setError(errorMsg);
          return { success: false, error: { message: errorMsg } };
        } else {
          setError(signUpError.message);
          return { success: false, error: signUpError };
        }
      }

      return { success: true, data };
    } catch (err) {
      const errorMessage = "An unexpected error occurred during signup.";
      setError(errorMessage);
      console.error(errorMessage, err);
      return {
        success: false,
        error: { message: "An unexpected error occurred. Please try again." },
      };
    } finally {
      setIsLoading(false);
    }
  }, [resetError, setIsLoading, setError]);

  const signInUser = useCallback(async (email, password) => {
    resetError();
    setIsLoading(true);

    try {
      const { data, error: signInError } =
        await supabaseClient.auth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password: password,
        });

      if (signInError) {
        setError(signInError.message);
        return { success: false, error: signInError };
      }

      return { success: true, data };
    } catch (err) {
      const errorMessage = "An unexpected error occurred during signin.";
      setError(errorMessage);
      console.error(errorMessage, err);
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      };
    } finally {
      setIsLoading(false);
    }
  }, [resetError, setIsLoading, setError]);

  const signOut = useCallback(async () => {
    resetError();
    setIsLoading(true);

    try {
      // Clear local state immediately
      setUser(null);
      setSession(null);
      setAddresses([]);
      setAddressCache({
        addresses: null,
        lastFetch: 0,
        userId: null
      });

      // Server sign out
      const { error: signOutError } = await supabaseClient.auth.signOut();

      if (signOutError) {
        setError(signOutError.message);
        return { success: false, error: signOutError };
      }

      return { success: true };
    } catch (err) {
      const errorMessage = "An unexpected error occurred during signout.";
      setError(errorMessage);
      console.error(errorMessage, err);
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      };
    } finally {
      setIsLoading(false);
    }
  }, [resetError, setIsLoading, setUser, setSession, setAddresses, setAddressCache, setError]);

  return {
    signUpNewUser,
    signInUser,
    signOut,
    resetError,
  };
};

// Combined hook for components
export const useUserAuth = () => {
  const [session] = useAtom(sessionAtom);
  const [user] = useAtom(userAtom);
  const [addresses] = useAtom(addressesAtom);
  const [error] = useAtom(authErrorAtom);
  const [isLoading] = useAtom(authLoadingAtom);

  const addressActions = useAddressActions();
  const authActions = useAuthActions();

  return {
    session,
    user,
    addresses,
    error,
    isLoading,
    ...authActions,
    ...addressActions,
  };
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [, setSession] = useAtom(sessionAtom);
  const [, setUser] = useAtom(userAtom);
  const [, setAddresses] = useAtom(addressesAtom);
  const [, setError] = useAtom(authErrorAtom);
  const [, setIsLoading] = useAtom(authLoadingAtom);
  const [addressCache, setAddressCache] = useAtom(addressCacheAtom);
  
  // Use addressActions inside a memo to maintain stable reference
  const { fetchAddresses } = useAddressActions();
  
  // Reference to track initialization
  const isInitialized = useRef(false);

  useEffect(() => {
    let isMounted = true;

    // Auth state change handler
    const handleAuthChange = async (event, currentSession) => {
      if (!isMounted) return;

      const userId = currentSession?.user?.id;
      setSession(currentSession);
      setUser(currentSession?.user || null);
      
      if (userId) {
        // Only fetch addresses if we have a new user or cached user is different
        if (!addressCache.addresses || addressCache.userId !== userId) {
          await fetchAddresses(userId);
        } else {
          // Just use the cached addresses without fetching
          setAddresses(addressCache.addresses);
        }
      } else {
        setAddresses([]);
      }
    };

    // Setup auth subscription
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(handleAuthChange);

    // Initial session check - only run once
    const checkInitialSession = async () => {
      if (isInitialized.current) return;
      isInitialized.current = true;
      
      setIsLoading(true);
      try {
        const { data: { session: initialSession } } = await supabaseClient.auth.getSession();
        const userId = initialSession?.user?.id;
        
        setSession(initialSession);
        setUser(initialSession?.user || null);
        
        if (userId) {
          // Use cache if available and for the same user
          if (addressCache.addresses && addressCache.userId === userId) {
            setAddresses(addressCache.addresses);
          } else {
            await fetchAddresses(userId);
          }
        } else {
          setAddresses([]);
        }
      } catch (err) {
        console.error("Error checking initial session:", err);
        setError("Failed to check initial session.");
      } finally {
        setIsLoading(false);
      }
    };

    checkInitialSession();

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [
    setSession,
    setUser,
    setAddresses,
    setIsLoading,
    setError,
    fetchAddresses,
    addressCache,
    setAddressCache
  ]);

  return <>{children}</>;
};