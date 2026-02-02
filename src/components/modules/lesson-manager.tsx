"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
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
import { createLesson, deleteLesson, getLessons, getSections, updateLesson } from "@/lib/lms-api";
import type { CourseLesson, LessonRequest } from "@/lib/types";

const initialForm: LessonRequest = {
  title: "",
  videoUrl: "",
  pdfUrl: "",
  lessonOrder: 0
};

export default function LessonManager() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CourseLesson | null>(null);
  const [sectionId, setSectionId] = useState<number | "">("");
  const [form, setForm] = useState<LessonRequest>(initialForm);
  const [deleteTarget, setDeleteTarget] = useState<CourseLesson | null>(null);

  const lessonsQuery = useQuery({ queryKey: queryKeys.lessons, queryFn: getLessons });
  const sectionsQuery = useQuery({ queryKey: queryKeys.sections(), queryFn: () => getSections() });

  const sectionNameMap = useMemo(() => {
    return new Map((sectionsQuery.data ?? []).map((section) => [section.id, section.title]));
  }, [sectionsQuery.data]);

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons }),
      queryClient.invalidateQueries({ queryKey: queryKeys.courses }),
      queryClient.invalidateQueries({ queryKey: queryKeys.sections() })
    ]);
  };

  const createMutation = useMutation({
    mutationFn: ({ sectionId: targetSectionId, payload }: { sectionId: number; payload: LessonRequest }) =>
      createLesson(targetSectionId, payload),
    onSuccess: async () => {
      setDialogOpen(false);
      setForm(initialForm);
      setSectionId("");
      await invalidateAll();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: LessonRequest }) => updateLesson(id, payload),
    onSuccess: async () => {
      setDialogOpen(false);
      setEditing(null);
      setForm(initialForm);
      await invalidateAll();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLesson,
    onSuccess: async () => {
      setDeleteTarget(null);
      await invalidateAll();
    }
  });

  const onOpenCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setDialogOpen(true);
  };

  const onOpenEdit = (lesson: CourseLesson) => {
    setEditing(lesson);
    setForm({
      title: lesson.title,
      videoUrl: lesson.videoUrl ?? "",
      pdfUrl: lesson.pdfUrl ?? "",
      lessonOrder: lesson.lessonOrder
    });
    setDialogOpen(true);
  };

  const onSubmit = () => {
    if (!form.title.trim()) return;
    if (editing) {
      updateMutation.mutate({ id: editing.id, payload: form });
      return;
    }

    if (!sectionId) return;
    createMutation.mutate({ sectionId, payload: form });
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <div>
          <Typography variant="h4" fontWeight={700}>
            Lesson Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage lessons with title + video URL + PDF URL.
          </Typography>
        </div>
        <Button startIcon={<AddIcon />} variant="contained" onClick={onOpenCreate}>
          Add Lesson
        </Button>
      </Stack>

      {(lessonsQuery.isError || sectionsQuery.isError) && (
        <Alert severity="error">Failed to load lesson data.</Alert>
      )}

      <Paper elevation={0} className="rounded-2xl border border-slate-200">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Lesson</TableCell>
              <TableCell>Section</TableCell>
              <TableCell>Media</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lessonsQuery.data?.map((lesson) => (
              <TableRow key={lesson.id}>
                <TableCell>
                  <Typography fontWeight={600}>{lesson.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Order: {lesson.lessonOrder}
                  </Typography>
                </TableCell>
                <TableCell>{sectionNameMap.get(lesson.sectionId) ?? `#${lesson.sectionId}`}</TableCell>
                <TableCell>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Video: {lesson.videoUrl || "-"}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    PDF: {lesson.pdfUrl || "-"}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Button size="small" startIcon={<EditOutlinedIcon />} onClick={() => onOpenEdit(lesson)}>
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => setDeleteTarget(lesson)}
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
        title={editing ? "Edit Lesson" : "Create Lesson"}
        onClose={() => setDialogOpen(false)}
        onSubmit={onSubmit}
        submitLabel={editing ? "Update" : "Create"}
        loading={createMutation.isPending || updateMutation.isPending}
      >
        <Stack spacing={2} className="mt-2">
          {!editing && (
            <TextField
              select
              label="Section"
              value={sectionId}
              onChange={(event) => setSectionId(Number(event.target.value))}
              required
            >
              {(sectionsQuery.data ?? []).map((section) => (
                <MenuItem key={section.id} value={section.id}>
                  [{section.type}] {section.title}
                </MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            label="Title"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            required
          />

          <TextField
            label="Video URL"
            value={form.videoUrl ?? ""}
            onChange={(event) => setForm((prev) => ({ ...prev, videoUrl: event.target.value }))}
          />

          <TextField
            label="PDF URL"
            value={form.pdfUrl ?? ""}
            onChange={(event) => setForm((prev) => ({ ...prev, pdfUrl: event.target.value }))}
          />

          <TextField
            label="Order"
            type="number"
            value={form.lessonOrder ?? 0}
            onChange={(event) => setForm((prev) => ({ ...prev, lessonOrder: Number(event.target.value) }))}
          />
        </Stack>
      </CrudDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete lesson"
        description={deleteTarget ? `Delete lesson \"${deleteTarget.title}\"?` : ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </Stack>
  );
}
