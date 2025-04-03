import React, { createContext, useState, useEffect, useContext } from "react";
import { supabaseClient } from "../services/supabaseClient"; // Import Supabase client

// Create context for auth state management
const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  // User's active session information
  const [session, setSession] = useState(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const resetError = () => setError(null);

  const signUpNewUser = async (email, password) => {
    setLoading(true);
    resetError();

    try {
      // Call Supabase auth API to create new account
      const { data, error: signUpError } = await supabaseClient.auth.signUp({
        email: email.toLowerCase(),
        password: password,
      });

      if (signUpError) {
        if (signUpError.message.includes("already exists")) {
          // Specific error handling for duplicate email
          setError("Email already exists. Please use a different email.");
          return { success: false, error: { message: "Email already exists" } };
        } else {
          // Handle other Supabase errors
          setError(signUpError.message);
          return { success: false, error: signUpError };
        }
      }

      setUser(data.user);
      return { success: true, data };
    } catch (err) {
      // Handle unexpected errors
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
      // Authenticate with Supabase using email/password
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
      // Call Supabase to end the user session
      const { error: signOutError } = await supabaseClient.auth.signOut();

      if (signOutError) {
        setError(signOutError.message);
        return { success: false, error: signOutError };
      }

      setUser(null);
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
        // Get current session from Supabase
        const { data, error: sessionError } =
          await supabaseClient.auth.getSession();

        if (sessionError) {
          console.error("Error fetching session:", sessionError);
        }

        setSession(data.session);
        setUser(data.session?.user || null);
      } catch (err) {
        console.error("Error fetching session:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);
    });

    // Cleanup subscription when component unmounts
    return () => subscription?.unsubscribe();
  }, []);

  // Context value containing auth state and functions
  const value = {
    signUpNewUser,
    signInUser,
    signOut,
    session,
    user,
    loading,
    error,
    resetError,
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
