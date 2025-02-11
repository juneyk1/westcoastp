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
import { Mail, Lock, Visibility, VisibilityOff} from "@mui/icons-material";
export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    // Add your login logic here
  };

  return (
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
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
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
