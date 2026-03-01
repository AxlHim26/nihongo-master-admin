"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
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

import ConfirmDialog from "@/components/common/confirm-dialog";
import CrudDialog from "@/components/common/crud-dialog";
import { createUser, deleteUser, getUsers, updateUser } from "@/lib/lms-api";
import { queryKeys } from "@/lib/query-keys";
import type { CreateUserRequest, UpdateUserRequest, UserAccount, UserRole } from "@/lib/types";

const initialForm: CreateUserRequest = {
  username: "",
  email: "",
  password: "",
  role: "USER"
};

export default function UserManager() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CreateUserRequest>(initialForm);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserAccount | null>(null);

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

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUserRequest }) =>
      updateUser(id, payload),
    onSuccess: async () => {
      setDialogOpen(false);
      setEditingUser(null);
      setForm(initialForm);
      await queryClient.invalidateQueries({ queryKey: queryKeys.users });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: async () => {
      setDeleteTarget(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.users });
    }
  });

  const openCreateDialog = () => {
    setEditingUser(null);
    setForm(initialForm);
    setDialogOpen(true);
  };

  const openEditDialog = (user: UserAccount) => {
    setEditingUser(user);
    setForm({
      username: user.username,
      email: user.email,
      password: "",
      role: user.role
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (!createMutation.isPending && !updateMutation.isPending) {
      setDialogOpen(false);
      setEditingUser(null);
      setForm(initialForm);
    }
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }
    if (editingUser) {
      const payload: UpdateUserRequest = {
        username: form.username.trim(),
        email: form.email.trim(),
        role: form.role
      };
      const normalizedPassword = form.password.trim();
      if (normalizedPassword.length > 0) {
        payload.password = normalizedPassword;
      }
      updateMutation.mutate({ id: editingUser.id, payload });
      return;
    }

    createMutation.mutate({
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role
    });
  };

  const canSubmit =
    form.username.trim().length >= 3 &&
    form.email.trim().length > 0 &&
    (editingUser ? form.password.trim().length === 0 || form.password.length >= 6 : form.password.length >= 6);

  const mutationError = createMutation.error ?? updateMutation.error;
  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <Box className="space-y-6">
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        className="admin-panel px-4 py-3"
      >
        <div>
          <Typography variant="h5" fontWeight={700}>
            User Accounts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage learner/admin accounts and permissions.
          </Typography>
        </div>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
          New User
        </Button>
      </Stack>

      {usersQuery.isError && (
        <Alert severity="error">Failed to load user accounts. Please try again.</Alert>
      )}
      {deleteMutation.isError && (
        <Alert severity="error">
          {(deleteMutation.error as Error).message || "Failed to delete user."}
        </Alert>
      )}

      <TableContainer component={Paper} variant="outlined" className="admin-panel overflow-hidden rounded-2xl">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
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
                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <IconButton size="small" onClick={() => openEditDialog(user)}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteTarget(user)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {!usersQuery.isLoading && (usersQuery.data ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
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
        title={editingUser ? "Edit user" : "Create new user"}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        submitLabel={editingUser ? "Update user" : "Create user"}
        loading={isMutating}
      >
        <Stack spacing={2} className="pt-2">
          {mutationError && (
            <Alert severity="error">
              {(mutationError as Error).message || "Failed to save user."}
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
            select
            label="Role"
            value={form.role}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, role: event.target.value as UserRole }))
            }
            fullWidth
          >
            <MenuItem value="USER">USER</MenuItem>
            <MenuItem value="ADMIN">ADMIN</MenuItem>
          </TextField>
          <TextField
            label="Password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            fullWidth
            required={!editingUser}
            type="password"
            helperText={editingUser ? "Leave empty to keep current password" : "Minimum 6 characters"}
          />
        </Stack>
      </CrudDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete user"
        description={
          deleteTarget
            ? `Delete user "${deleteTarget.username}"? This action cannot be undone.`
            : ""
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}
