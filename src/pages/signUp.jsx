import React from "react";
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
} from "@mui/material";
import { Mail, Lock, Visibility, VisibilityOff, Person, Warehouse } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [billingAddress, setBillingAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");

  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/subscribe");
  };

  return (
    <div className="py-[50px]">
      <Card sx={{ maxWidth: 400, mx: "auto", width: "100%" }}>
        <CardContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h5" component="h1" gutterBottom>
                Welcome to the West Coast
              </Typography>
              <Typography color="text.secondary">
                Enter your credentials to create your account
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                <TextField
                  fullWidth
                  id="Full Name"
                  label="Full Name"
                  name="Full Name"
                  type="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  id="billing"
                  label="Billing Address"
                  name="Billing Address"
                  type="Billing Address"
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  placeholder="21 Park Lane Circle in Toronto, Canada"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Warehouse />
                      </InputAdornment>
                    ),
                  }}
                />

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
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                >
                  Sign in
                </Button>
              </Stack>
            </form>

            <Stack spacing={2} alignItems="center">
              <Link
                component="button"
                variant="body2"
                onClick={() => {
                  /* Add forgot password logic */
                }}
              >
                Forgot your password?
              </Link>

              <Typography variant="body2" align="center">
                Don't have an account?{" "}
                <Link
                  component="button"
                  onClick={() => {
                    /* Add sign up logic */
                  }}
                >
                  Sign up
                </Link>
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </div>
  );
}
