import { atom, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { supabaseClient } from "../services/supabaseClient";
import { useRef, useEffect, useMemo } from "react";
import { debounce } from "lodash";
import { useCallback } from "react";
// Atoms
export const sessionAtom = atom(null);
export const userAtom = atom(null);
export const addressesAtom = atom([]);
export const authErrorAtom = atom(null);
export const authLoadingAtom = atom(true);

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

// Address operations

let requestCount = 0;
const logRequest = (method) => {
  requestCount++;
  console.log(`Supabase Request #${requestCount}: ${method}`);
};

export const useAddressActions = () => {
  const [addresses, setAddresses] = useAtom(addressesAtom);
  const [user] = useAtom(userAtom);
  const [isLoading, setIsLoading] = useAtom(authLoadingAtom);
  const [, setError] = useAtom(authErrorAtom);

  // Persistent cache
  const cache = useRef({
    addresses: null,
    lastFetch: 0,
    pendingUpdates: {},
  });

  // Cache addresses
  useEffect(() => {
    cache.current.addresses = addresses;
  }, [addresses]);

  // Debug effect - log when this hook recreates
  useEffect(() => {
    console.log("AddressActions hook initialized");
    return () => console.log("AddressActions hook cleaned up");
  }, []);

  // Stable function references
  const fetchAddresses = useCallback(
    async (userId, forceRefresh = false) => {
      if (!userId) {
        setError("User ID is required");
        return { success: false, error: new Error("User ID is required") };
      }

      // Return cached data if fresh (5 minute cache)
      const now = Date.now();
      if (
        !forceRefresh &&
        cache.current.addresses &&
        now - cache.current.lastFetch < 300000
      ) {
        return { success: true, data: cache.current.addresses };
      }

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
        setAddresses(result);
        cache.current.lastFetch = now;
        return { success: true, data: result };
      } catch (err) {
        setError(err?.message || "Fetch failed");
        return { success: false, error: err };
      } finally {
        setIsLoading(false);
      }
    },
    [setAddresses, setError, setIsLoading]
  );

  // Batch updates with 500ms debounce
  const processUpdates = useCallback(async () => {
    if (Object.keys(cache.current.pendingUpdates).length === 0) return;

    const updates = { ...cache.current.pendingUpdates };
    cache.current.pendingUpdates = {};

    logRequest("batchUpdate");
    setIsLoading(true);
    try {
      const { data, error } = await supabaseClient
        .from("addresses")
        .upsert(Object.values(updates))
        .select();

      if (error) throw error;

      setAddresses((prev) =>
        prev.map((addr) =>
          updates[addr.id] ? { ...addr, ...updates[addr.id] } : addr
        )
      );
      return { success: true, data };
    } catch (err) {
      setError(err?.message || "Batch update failed");
      // Requeue failed updates
      cache.current.pendingUpdates = {
        ...cache.current.pendingUpdates,
        ...updates,
      };
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  }, [setAddresses, setError, setIsLoading]);

  // Debounced processor
  const debouncedProcessUpdates = useRef();
  useEffect(() => {
    debouncedProcessUpdates.current = debounce(processUpdates, 500);
    return () => debouncedProcessUpdates.current?.cancel();
  }, [processUpdates]);

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

        setAddresses((prev) => [...prev, data]);
        return { success: true, data };
      } catch (err) {
        setError(err?.message || "Add address failed");
        return { success: false, error: err };
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, setAddresses, setError, setIsLoading]
  );

  const updateAddress = useCallback(
    (id, updates) => {
      cache.current.pendingUpdates[id] = { id, ...updates };
      debouncedProcessUpdates.current();

      // Optimistic update
      setAddresses((prev) =>
        prev.map((addr) => (addr.id === id ? { ...addr, ...updates } : addr))
      );

      return { success: true };
    },
    [setAddresses]
  );

  const removeAddress = useCallback(
    async (id) => {
      logRequest("removeAddress");
      setIsLoading(true);
      try {
        // Remove from pending updates if exists
        if (cache.current.pendingUpdates[id]) {
          delete cache.current.pendingUpdates[id];
        }

        const { error } = await supabaseClient
          .from("addresses")
          .delete()
          .eq("id", id);

        if (error) throw error;

        setAddresses((prev) => prev.filter((addr) => addr.id !== id));
        return { success: true };
      } catch (err) {
        setError(err?.message || "Delete address failed");
        return { success: false, error: err };
      } finally {
        setIsLoading(false);
      }
    },
    [setAddresses, setError, setIsLoading]
  );

  const setDefaultAddress = useCallback(
    async (id) => {
      const addressToUpdate = cache.current.addresses?.find(
        (addr) => addr.id === id
      );
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

        setAddresses((prev) =>
          prev.map((addr) => ({
            ...addr,
            is_default:
              addr.id === id ||
              (addr.type !== addressToUpdate.type && addr.is_default),
          }))
        );

        return { success: true, data };
      } catch (err) {
        setError(err?.message || "Set default address failed");
        return { success: false, error: err };
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, setAddresses, setError, setIsLoading]
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

  const resetError = () => setError(null);

  const signUpNewUser = async (email, password) => {
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
  };

  const signInUser = async (email, password) => {
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
  };

  const signOut = async () => {
    resetError();
    setIsLoading(true);

    try {
      // Clear local state immediately
      setUser(null);
      setSession(null);
      setAddresses([]);

      // Clear localStorage
      localStorage.removeItem("sb-auth-token");
      localStorage.removeItem("sb-auth-refresh-token");

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
  };

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
  const { fetchAddresses } = useAddressActions();

  useEffect(() => {
    let isMounted = true;

    const handleBeforeUnload = async () => {
      await supabaseClient.auth.signOut();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;

      setSession(currentSession);
      setUser(currentSession?.user || null);
      if (currentSession?.user?.id) {
        await fetchAddresses(currentSession.user.id);
      } else {
        setAddresses([]);
      }
      setIsLoading(false);
    });

    const checkInitialSession = async () => {
      setIsLoading(true);
      try {
        const {
          data: { session: initialSession },
        } = await supabaseClient.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user || null);
        if (initialSession?.user?.id) {
          await fetchAddresses(initialSession.user.id);
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
      window.removeEventListener("beforeunload", handleBeforeUnload);
      subscription?.unsubscribe();
    };
  }, [
    setSession,
    setUser,
    setAddresses,
    setIsLoading,
    setError,
    fetchAddresses,
  ]);

  return children;
};
