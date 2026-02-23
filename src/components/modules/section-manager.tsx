"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import ConfirmDialog from "@/components/common/confirm-dialog";
import CrudDialog from "@/components/common/crud-dialog";
import { queryKeys } from "@/lib/query-keys";
import { createSection, deleteSection, getChapters, getSections, updateSection } from "@/lib/lms-api";
import type {
  CourseSection,
  CourseSectionType,
  SectionRequest
} from "@/lib/types";

const initialForm = (type: CourseSectionType): SectionRequest => ({
  type,
  sectionOrder: 0
});

export default function SectionManager({
  type,
  title,
  underDevelopment = false
}: {
  type: CourseSectionType;
  title: string;
  underDevelopment?: boolean;
}) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CourseSection | null>(null);
  const [chapterId, setChapterId] = useState<number | "">("");
  const [form, setForm] = useState<SectionRequest>(initialForm(type));
  const [deleteTarget, setDeleteTarget] = useState<CourseSection | null>(null);

  const sectionsQuery = useQuery({
    queryKey: queryKeys.sections(type),
    queryFn: () => getSections(type)
  });

  const chaptersQuery = useQuery({
    queryKey: queryKeys.chapters,
    queryFn: getChapters
  });

  const chapterNameMap = useMemo(() => {
    return new Map((chaptersQuery.data ?? []).map((chapter) => [chapter.id, chapter.title]));
  }, [chaptersQuery.data]);

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.sections(type) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.sections() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.courses })
    ]);
  };

  const createMutation = useMutation({
    mutationFn: ({ chapterId: targetChapterId, payload }: { chapterId: number; payload: SectionRequest }) =>
      createSection(targetChapterId, payload),
    onSuccess: async () => {
      setDialogOpen(false);
      setForm(initialForm(type));
      setChapterId("");
      await invalidateAll();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SectionRequest }) => updateSection(id, payload),
    onSuccess: async () => {
      setDialogOpen(false);
      setEditing(null);
      setForm(initialForm(type));
      await invalidateAll();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSection,
    onSuccess: async () => {
      setDeleteTarget(null);
      await invalidateAll();
    }
  });

  const onOpenCreate = () => {
    setEditing(null);
    setForm(initialForm(type));
    setDialogOpen(true);
  };

  const onOpenEdit = (section: CourseSection) => {
    setEditing(section);
    setForm({
      type: section.type,
      sectionOrder: section.sectionOrder
    });
    setDialogOpen(true);
  };

  const onSubmit = () => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, payload: form });
      return;
    }
    if (!chapterId) return;
    createMutation.mutate({ chapterId, payload: form });
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <div>
          <Typography variant="h4" fontWeight={700}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage {type.toLowerCase()} topics and metadata.
          </Typography>
        </div>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={onOpenCreate}
          disabled={underDevelopment}
        >
          Add {type}
        </Button>
      </Stack>

      {underDevelopment && (
        <Alert severity="info">
          Vocabulary module UI is marked as <strong>Feature under development</strong>. Data structure
          and backend APIs are ready.
        </Alert>
      )}

      {sectionsQuery.isError && <Alert severity="error">Failed to load sections.</Alert>}

      <Paper elevation={0} className="rounded-2xl border border-slate-200">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Chapter</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sectionsQuery.data?.map((section) => (
              <TableRow key={section.id}>
                <TableCell>
                  <Typography fontWeight={600}>{section.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Order: {section.sectionOrder}
                  </Typography>
                </TableCell>
                <TableCell>{chapterNameMap.get(section.chapterId) ?? `#${section.chapterId}`}</TableCell>
                <TableCell>
                  <Chip label={section.type} size="small" />
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    startIcon={<EditOutlinedIcon />}
                    onClick={() => onOpenEdit(section)}
                    disabled={underDevelopment}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => setDeleteTarget(section)}
                    disabled={underDevelopment}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <CrudDialog
        open={dialogOpen}
        title={editing ? `Edit ${type} section` : `Create ${type} section`}
        onClose={() => setDialogOpen(false)}
        onSubmit={onSubmit}
        submitLabel={editing ? "Update" : "Create"}
        loading={createMutation.isPending || updateMutation.isPending}
      >
        <Stack spacing={2} className="mt-2">
          {!editing && (
            <TextField
              select
              label="Chapter"
              value={chapterId}
              onChange={(event) => setChapterId(Number(event.target.value))}
              required
            >
              {(chaptersQuery.data ?? []).map((chapter) => (
                <MenuItem key={chapter.id} value={chapter.id}>
                  {chapter.title}
                </MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            label="Order"
            type="number"
            value={form.sectionOrder ?? 0}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, sectionOrder: Number(event.target.value) }))
            }
          />
        </Stack>
      </CrudDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete section"
        description={
          deleteTarget ? `Delete section \"${deleteTarget.title}\" and all lessons?` : ""
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </Stack>
  );
}
