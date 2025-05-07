import React, { useState, useEffect } from "react";
import { useUserAuth } from "../contexts/AuthContexts";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  IconButton,
  Box,
  InputAdornment,
  Stack,
  Link,
  LinearProgress,
} from "@mui/material";
import { Mail, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Header from "./header";
import Appendices from "./Appendices";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const navigate = useNavigate();
  const { signUpNewUser, error: authError, resetError, } = useUserAuth();

  useEffect(() => {
    if (authError) {
      setLocalError(authError);
      console.log("Auth error detected:", authError);
    }
  }, [authError]);

  useEffect(() => {
    return () => {
      resetError();
    };
  }, [resetError]);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLocalError("");
    resetError();
    setIsSubmitting(true);

    try {
      const response = await signUpNewUser(email, password);
      if (!response.success) {
        if (response.error && typeof response.error === "object") {
          setLocalError(
            response.error.message || "Signup failed. Please try again."
          );
        } else if (typeof response.error === "string") {
          setLocalError(response.error);
        } else {
          setLocalError("Signup failed. Please try again.");
        }
        setIsSubmitting(false);
        return;
      }
      navigate("/");
    } catch (err) {
      setLocalError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isProcessing = isSubmitting;
  const isPasswordStrongEnough = passwordStrength === 5;

  return (
    <div>
      <Header title="Sign Up" />
      <div className="py-[50px]">
        <Card sx={{ maxWidth: 400, mx: "auto", width: "100%" }}>
          <CardContent>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h5" component="h1" gutterBottom>
                  Create Your Account
                </Typography>
                <Typography color="text.secondary">
                  Enter your email and password to sign up
                </Typography>
              </Box>

              <form onSubmit={handleSignup} noValidate>
                <Stack spacing={3}>
                  {(localError || authError) && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {localError || authError}
                    </Alert>
                  )}

                  <TextField
                    fullWidth
                    id="email"
                    label="Email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (localError) setLocalError("");
                      if (authError) resetError();
                    }}
                    placeholder="your.email@example.com"
                    required
                    disabled={isProcessing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Mail />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    id="password"
                    label="Password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={isProcessing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            disabled={isProcessing}
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <LinearProgress
                    variant="determinate"
                    value={(passwordStrength / 5) * 100}
                  />
                  <Typography variant="caption">
                    Password Strength: {passwordStrength}/5 (8+ chars, 1
                    uppercase, 1 lowercase, 1 number, 1 symbol)
                  </Typography>

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={
                      !email ||
                      !password ||
                      isProcessing ||
                      !isPasswordStrongEnough
                    }
                  >
                    {isProcessing ? "Signing up..." : "Sign up"}
                  </Button>
                </Stack>
              </form>

              <Stack spacing={2} alignItems="center">
                <Typography variant="body2">
                  Already have an account?{" "}
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => navigate("/login")}
                    disabled={isProcessing}
                  >
                    Log in
                  </Link>
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </div>
      <Appendices />
    </div>
  );
}
