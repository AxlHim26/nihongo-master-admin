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
import { useRouter } from "next/navigation";
import { useState } from "react";

import { loginAdmin } from "@/lib/lms-api";
import { setToken } from "@/lib/storage";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: loginAdmin,
    onSuccess: (data) => {
      setToken(data.token);
      router.replace("/courses");
    }
  });

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    loginMutation.mutate({ username, password });
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
              Admin Login
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in with admin account from `nihongo-master-be`
            </Typography>
          </Stack>

          {loginMutation.isError && (
            <Alert severity="error">
              {loginMutation.error instanceof Error
                ? loginMutation.error.message
                : "Login failed."}
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
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <Button type="submit" variant="contained" size="large" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Signing in..." : "Sign in"}
          </Button>

          <Box className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            Ensure your user has role <strong>ADMIN</strong> in backend database.
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
