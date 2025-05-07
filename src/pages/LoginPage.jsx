import React, { useState, useEffect } from "react";
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
import { useUserAuth } from "../contexts/AuthContexts";
import Header from "./header";
import Appendices from "./Appendices";
import "./LoginPage.css";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const navigate = useNavigate();
  const { signInUser, error: authError, resetError, loading } = useUserAuth();

  // Debug logging to trace loading state
  useEffect(() => {
    console.log("Auth loading state:", loading);
  }, [loading]);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError("");
    resetError();
    setIsSubmitting(true);

    try {
      const response = await signInUser(email, password);
      if (!response.success) {
        if (response.error && typeof response.error === "object") {
          setLocalError(
            response.error.message || "Login failed. Please try again."
          );
        } else if (typeof response.error === "string") {
          setLocalError(response.error);
        } else {
          setLocalError("Login failed. Please try again.");
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

  // Only disable fields during form submission, not during general loading
  const isButtonDisabled =
    isSubmitting || !email || !password || !calculatePasswordStrength(password);
  const isPasswordStrongEnough = passwordStrength === 5;

  return (
    <div>
      <Header />
      <div className="py-[50px]">
        <Card sx={{ maxWidth: 400, mx: "auto", width: "100%" }}>
          <CardContent>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h5" component="h1" gutterBottom>
                  Welcome back
                </Typography>
                <Typography color="text.secondary">
                  Enter your credentials to access your account
                </Typography>
              </Box>

              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  {localError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {localError}
                    </Alert>
                  )}

                  <TextField
                    fullWidth
                    id="email"
                    label="Email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john.doe@example.com"
                    required
                    disabled={isSubmitting} // Only disable during form submission
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
                    disabled={isSubmitting} // Only disable during form submission
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
                            disabled={isSubmitting}
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
                      isSubmitting ||
                      !email ||
                      !password ||
                      !isPasswordStrongEnough
                    }
                  >
                    {isSubmitting ? "Signing in..." : "Sign in"}
                  </Button>
                </Stack>
              </form>

              <Stack spacing={2} alignItems="center">
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate("/forgot-password")}
                  disabled={isSubmitting}
                >
                  Forgot your password?
                </Link>

                <Typography variant="body2" align="center">
                  Don't have an account?{" "}
                  <Link
                    component="button"
                    onClick={() => navigate("/signup")}
                    disabled={isSubmitting}
                  >
                    Sign up
                  </Link>
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </div>
      <div className="main-container" py-50>
        <Appendices className="appendices" />
      </div>
    </div>
  );
}
