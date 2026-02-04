"use client";

import AddIcon from "@mui/icons-material/Add";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import CrudDialog from "@/components/common/crud-dialog";
import { createUser, getUsers } from "@/lib/lms-api";
import { queryKeys } from "@/lib/query-keys";
import type { CreateUserRequest, UserAccount, UserRole } from "@/lib/types";

const initialForm: CreateUserRequest = {
  username: "",
  email: "",
  password: "",
  role: "USER"
};

export default function UserManager() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetRole, setTargetRole] = useState<UserRole>("USER");
  const [form, setForm] = useState<CreateUserRequest>(initialForm);

  const usersQuery = useQuery({
    queryKey: queryKeys.users,
    queryFn: getUsers
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: async () => {
      setDialogOpen(false);
      setForm(initialForm);
      await queryClient.invalidateQueries({ queryKey: queryKeys.users });
    }
  });

  const openDialog = (role: UserRole) => {
    setTargetRole(role);
    setForm((prev) => ({ ...prev, role }));
    setDialogOpen(true);
  };
  const closeDialog = () => {
    if (!createMutation.isPending) {
      setDialogOpen(false);
      setForm(initialForm);
    }
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }
    createMutation.mutate({
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
      role: targetRole
    });
  };

  const canSubmit =
    form.username.trim().length >= 3 &&
    form.email.trim().length > 0 &&
    form.password.length >= 6;

  return (
    <Box className="space-y-6">
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <div>
          <Typography variant="h5" fontWeight={700}>
            User Accounts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create learning accounts for learners or admins.
          </Typography>
        </div>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => openDialog("USER")}>
          New User
        </Button>
      </Stack>

      {usersQuery.isError && (
        <Alert severity="error">Failed to load user accounts. Please try again.</Alert>
      )}

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(usersQuery.data ?? []).map((user: UserAccount) => (
              <TableRow key={user.id} hover>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    size="small"
                    color={user.role === "ADMIN" ? "primary" : "default"}
                  />
                </TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {!usersQuery.isLoading && (usersQuery.data ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No users found yet.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <CrudDialog
        open={dialogOpen}
        title="Create new user"
        onClose={closeDialog}
        onSubmit={handleSubmit}
        submitLabel="Create user"
        loading={createMutation.isPending}
      >
        <Stack spacing={2} className="pt-2">
          {createMutation.isError && (
            <Alert severity="error">
              {(createMutation.error as Error).message || "Failed to create user."}
            </Alert>
          )}
          <TextField
            label="Username"
            value={form.username}
            onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
            fullWidth
            required
          />
          <TextField
            label="Email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            fullWidth
            required
            type="email"
          />
          <TextField
            label="Password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            fullWidth
            required
            type="password"
            helperText="Minimum 6 characters"
          />
        </Stack>
      </CrudDialog>
    </Box>
  );
}
