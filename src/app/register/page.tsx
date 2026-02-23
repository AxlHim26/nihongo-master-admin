"use client";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { registerAdmin } from "@/lib/lms-api";
import { setToken } from "@/lib/storage";

export default function RegisterAdminPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bootstrapKey, setBootstrapKey] = useState("");

  const registerMutation = useMutation({
    mutationFn: registerAdmin,
    onSuccess: (data) => {
      setToken(data.token);
      router.replace("/courses");
    }
  });

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    registerMutation.mutate({ username, email, password, bootstrapKey });
  };

  return (
    <Container maxWidth="sm" className="flex min-h-screen items-center justify-center py-8">
      <Paper elevation={0} className="w-full rounded-3xl border border-slate-200 p-8">
        <Stack spacing={3} component="form" onSubmit={onSubmit}>
          <Stack spacing={1} alignItems="center">
            <Avatar sx={{ bgcolor: "primary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography variant="h5" fontWeight={700}>
              Create Admin Account
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Register the first admin account using the bootstrap key.
            </Typography>
          </Stack>

          {registerMutation.isError && (
            <Alert severity="error">
              {registerMutation.error instanceof Error
                ? registerMutation.error.message
                : "Registration failed."}
            </Alert>
          )}

          <TextField
            label="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            autoFocus
          />

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            helperText="Minimum 6 characters"
          />

          <TextField
            label="Bootstrap key"
            value={bootstrapKey}
            onChange={(event) => setBootstrapKey(event.target.value)}
            required
            helperText="Set ADMIN_BOOTSTRAP_KEY in backend .env"
          />

          <Button type="submit" variant="contained" size="large" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? "Creating..." : "Create admin"}
          </Button>

          <Box className="text-center text-sm text-slate-600">
            Already have an admin?{" "}
            <Link href="/login" className="font-semibold text-slate-900">
              Sign in
            </Link>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
