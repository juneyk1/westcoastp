import React, { createContext, useState, useEffect, useContext } from "react";
import { supabaseClient } from "../services/supabaseClient";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addresses, setAddresses] = useState([]);

  const resetError = () => setError(null);

  // Enhanced fetchAddresses with type-specific defaults
  const fetchAddresses = async (userId) => {
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
    } catch (err) {
      console.error("Error fetching addresses:", err);
      setError(err.message || "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  // Enhanced addAddress with type-specific default handling
  const addAddress = async (addressData) => {
    if (!user?.id) return { success: false, error: "User not authenticated" };

    setLoading(true);
    try {
      // If setting as default, first unset any existing default of the same type
      if (addressData.is_default) {
        await supabaseClient
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('type', addressData.type)
          .eq('is_default', true);
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
  };

  // Enhanced updateAddress with type-specific default handling
  const updateAddress = async (addressId, updates) => {
    setLoading(true);
    try {
      // If setting as default, first unset any existing default of the same type
      if (updates.is_default) {
        await supabaseClient
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('type', updates.type)
          .eq('is_default', true)
          .neq('id', addressId);
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
  };

  // Enhanced removeAddress with default address handling
  const removeAddress = async (addressId) => {
    setLoading(true);
    try {
      // First check if this is a default address
      const addressToDelete = addresses.find(addr => addr.id === addressId);
      
      const { error: deleteError } = await supabaseClient
        .from('addresses')
        .delete()
        .eq('id', addressId);

      if (deleteError) throw deleteError;

      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      
      // If we deleted a default address, set a new default if available
      if (addressToDelete?.is_default) {
        const sameTypeAddresses = addresses.filter(
          addr => addr.id !== addressId && addr.type === addressToDelete.type
        );
        
        if (sameTypeAddresses.length > 0) {
          await setDefaultAddress(sameTypeAddresses[0].id);
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
  };

  // Enhanced setDefaultAddress with type-specific handling
  const setDefaultAddress = async (addressId) => {
    setLoading(true);
    try {
      // First get the address to determine its type
      const { data: address, error: fetchError } = await supabaseClient
        .from('addresses')
        .select('type')
        .eq('id', addressId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Unset current default of the same type
      await supabaseClient
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('type', address.type)
        .eq('is_default', true);
      
      // Set new default
      const { data, error: updateError } = await supabaseClient
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId)
        .select();
      
      if (updateError) throw updateError;

      setAddresses(prev => 
        prev.map(addr => ({
          ...addr,
          is_default: addr.id === addressId
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
  };

  // Auth functions remain the same
  const signUpNewUser = async (email, password) => {
    setLoading(true);
    resetError();

    try {
      const { data, error: signUpError } = await supabaseClient.auth.signUp({
        email: email.toLowerCase(),
        password: password,
      });

      if (signUpError) {
        if (signUpError.message.includes("already exists")) {
          setError("Email already exists. Please use a different email.");
          return { success: false, error: { message: "Email already exists" } };
        } else {
          setError(signUpError.message);
          return { success: false, error: signUpError };
        }
      }

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
  };

  const signInUser = async (email, password) => {
    setLoading(true);
    resetError();

    try {
      const { data, error: signInError } =
        await supabaseClient.auth.signInWithPassword({
          email: email.toLowerCase(),
          password: password,
        });

      if (signInError) {
        setError(signInError.message);
        return { success: false, error: signInError };
      }

      setUser(data.user);
      await fetchAddresses(data.user.id);
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
  };

  const signOut = async () => {
    setLoading(true);
    resetError();

    try {
      const { error: signOutError } = await supabaseClient.auth.signOut();

      if (signOutError) {
        setError(signOutError.message);
        return { success: false, error: signOutError };
      }

      setUser(null);
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
  };

  // Initialize auth state and set up listener for auth changes
  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);
      try {
        const { data, error: sessionError } = await supabaseClient.auth.getSession();
        if (sessionError) console.error("Error fetching session:", sessionError);

        setSession(data.session);
        setUser(data.session?.user || null);
        if (data.session?.user) {
          await fetchAddresses(data.session.user.id);
        }
      } catch (err) {
        console.error("Error fetching session:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);
      if (currentSession?.user) {
        await fetchAddresses(currentSession.user.id);
      } else {
        setAddresses([]);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Context value
  const value = {
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const UserAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("UserAuth must be used within an AuthContextProvider");
  }
  return context;
};