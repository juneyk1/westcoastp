import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from "react";
import { supabaseClient } from "../services/supabaseClient";

const AuthContext = createContext(null);

export const AuthContextProvider = ({ children }) => {
  // State management
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addresses, setAddresses] = useState([]);
  
  const setDefaultAddressRef = useRef(null);

  const resetError = useCallback(() => setError(null), []);

  const fetchAddresses = useCallback(async (userId) => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabaseClient
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      
      setAddresses(data || []);
      return { success: true, data };
    } catch (err) {
      console.error("Error fetching addresses:", err);
      setError(err.message || "Failed to load addresses");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDefaultAddressUpdate = useCallback(async (userId, addressType, excludeId = null) => {
    const query = supabaseClient
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('type', addressType)
      .eq('is_default', true);
    
    if (excludeId) {
      query.neq('id', excludeId);
    }
    
    return await query;
  }, []);

  const addAddress = useCallback(async (addressData) => {
    if (!user?.id) return { success: false, error: "User not authenticated" };

    setLoading(true);
    try {
      if (addressData.is_default) {
        await handleDefaultAddressUpdate(user.id, addressData.type);
      }

      const { data, error: insertError } = await supabaseClient
        .from('addresses')
        .insert([{ ...addressData, user_id: user.id }])
        .select();

      if (insertError) throw insertError;

      setAddresses(prev => [...prev, data[0]]);
      return { success: true, data: data[0] };
    } catch (err) {
      console.error("Error adding address:", err);
      setError(err.message || "Failed to add address");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user, handleDefaultAddressUpdate]);

  const updateAddress = useCallback(async (addressId, updates) => {
    if (!user?.id) return { success: false, error: "User not authenticated" };
    
    setLoading(true);
    try {
      if (updates.is_default) {
        await handleDefaultAddressUpdate(user.id, updates.type, addressId);
      }

      const { data, error: updateError } = await supabaseClient
        .from('addresses')
        .update(updates)
        .eq('id', addressId)
        .select();

      if (updateError) throw updateError;

      setAddresses(prev => 
        prev.map(addr => addr.id === addressId ? data[0] : addr)
      );
      return { success: true, data: data[0] };
    } catch (err) {
      console.error("Error updating address:", err);
      setError(err.message || "Failed to update address");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user, handleDefaultAddressUpdate]);

  const setDefaultAddress = useCallback(async (addressId) => {
    if (!user?.id) return { success: false, error: "User not authenticated" };
    
    setLoading(true);
    try {
      // Get the address to determine its type
      const addressToUpdate = addresses.find(addr => addr.id === addressId);
      if (!addressToUpdate) {
        const { data: address, error: fetchError } = await supabaseClient
          .from('addresses')
          .select('type')
          .eq('id', addressId)
          .single();
        
        if (fetchError) throw fetchError;
        
        await handleDefaultAddressUpdate(user.id, address.type);
      } else {
        await handleDefaultAddressUpdate(user.id, addressToUpdate.type);
      }
      
      const { data, error: updateError } = await supabaseClient
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId)
        .select();
      
      if (updateError) throw updateError;

      setAddresses(prev => 
        prev.map(addr => ({
          ...addr,
          is_default: addr.id === addressId ? true : 
            (addr.type === data[0].type ? false : addr.is_default)
        }))
      );
      return { success: true, data: data[0] };
    } catch (err) {
      console.error("Error setting default address:", err);
      setError(err.message || "Failed to set default address");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [addresses, handleDefaultAddressUpdate, user]);

  useEffect(() => {
    setDefaultAddressRef.current = setDefaultAddress;
  }, [setDefaultAddress]);

  const removeAddress = useCallback(async (addressId) => {
    if (!user?.id) return { success: false, error: "User not authenticated" };
    
    setLoading(true);
    try {
      const addressToDelete = addresses.find(addr => addr.id === addressId);
      if (!addressToDelete) {
        throw new Error("Address not found");
      }
      
      const { error: deleteError } = await supabaseClient
        .from('addresses')
        .delete()
        .eq('id', addressId);

      if (deleteError) throw deleteError;

      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      
      if (addressToDelete.is_default) {
        const sameTypeAddresses = addresses.filter(
          addr => addr.id !== addressId && addr.type === addressToDelete.type
        );
        
        if (sameTypeAddresses.length > 0 && setDefaultAddressRef.current) {
          await setDefaultAddressRef.current(sameTypeAddresses[0].id);
        }
      }
      
      return { success: true };
    } catch (err) {
      console.error("Error removing address:", err);
      setError(err.message || "Failed to remove address");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [addresses, user]);

  const signUpNewUser = useCallback(async (email, password) => {
    setLoading(true);
    resetError();

    try {
      const { data, error: signUpError } = await supabaseClient.auth.signUp({
        email: email.toLowerCase().trim(),
        password: password,
      });

      if (signUpError) {
        if (signUpError.message.includes("already exists")) {
          const errorMsg = "Email already exists. Please use a different email.";
          setError(errorMsg);
          return { success: false, error: { message: errorMsg } };
        } else {
          setError(signUpError.message);
          return { success: false, error: signUpError };
        }
      }

      // Update state if signup successful
      setUser(data.user);
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
      setLoading(false);
    }
  }, [resetError]);

  const signInUser = useCallback(async (email, password) => {
    setLoading(true);
    resetError();

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

      setUser(data.user);
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
      setLoading(false);
    }
  }, [resetError]);

  const signOut = useCallback(async () => {
    setLoading(true);
    resetError();

    try {
      const { error: signOutError } = await supabaseClient.auth.signOut();

      if (signOutError) {
        setError(signOutError.message);
        return { success: false, error: signOutError };
      }

      // Clear user data on successful logout
      setUser(null);
      setSession(null);
      setAddresses([]);
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
      setLoading(false);
    }
  }, [resetError]);

  // Function to force sign out on page load/unload
  const forceSignOut = useCallback(async () => {
    try {
      await supabaseClient.auth.signOut();
      setUser(null);
      setSession(null);
      setAddresses([]);
    } catch (err) {
      console.error("Error force signing out:", err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    // Force sign out on component mount (page load)
    forceSignOut();
    
    // Set up event listener for beforeunload only
    const handleBeforeUnload = () => {
      forceSignOut();
    };
    
    // Add only the beforeunload event listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Set up auth state subscription (only active after initial sign out)
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (_event, currentSession) => {
        if (!isMounted) return;
        
        setSession(currentSession);
        setUser(currentSession?.user || null);
        
        if (currentSession?.user) {
          await fetchAddresses(currentSession.user.id);
        } else {
          setAddresses([]);
        }
      }
    );

    // Clean up event listener and subscription
    return () => {
      isMounted = false;
      window.removeEventListener('beforeunload', handleBeforeUnload);
      subscription?.unsubscribe();
      forceSignOut();  // Also called on unmount
    };
  }, [fetchAddresses, forceSignOut]);

  const contextValue = {
    // Auth state
    session,
    user,
    loading,
    error,
    
    // Auth functions
    signUpNewUser,
    signInUser,
    signOut,
    resetError,
    
    // Address state
    addresses,
    
    // Address functions
    fetchAddresses,
    addAddress,
    updateAddress,
    removeAddress,
    setDefaultAddress,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const UserAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("UserAuth must be used within an AuthContextProvider");
  }
  return context;
};