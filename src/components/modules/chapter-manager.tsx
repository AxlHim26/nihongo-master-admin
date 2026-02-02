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
import { createChapter, deleteChapter, getChapters, getCourses, updateChapter } from "@/lib/lms-api";
import type { ChapterRequest, CourseChapter } from "@/lib/types";

const initialForm: ChapterRequest = {
  title: "",
  description: "",
  chapterOrder: 0
};

export default function ChapterManager() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<CourseChapter | null>(null);
  const [courseId, setCourseId] = useState<number | "">("");
  const [form, setForm] = useState<ChapterRequest>(initialForm);
  const [deleteTarget, setDeleteTarget] = useState<CourseChapter | null>(null);

  const chaptersQuery = useQuery({ queryKey: queryKeys.chapters, queryFn: getChapters });
  const coursesQuery = useQuery({ queryKey: queryKeys.courses, queryFn: () => getCourses(false) });

  const courseNameMap = useMemo(() => {
    return new Map((coursesQuery.data ?? []).map((course) => [course.id, course.name]));
  }, [coursesQuery.data]);

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.chapters }),
      queryClient.invalidateQueries({ queryKey: queryKeys.courses })
    ]);
  };

  const createMutation = useMutation({
    mutationFn: ({ courseId: targetCourseId, payload }: { courseId: number; payload: ChapterRequest }) =>
      createChapter(targetCourseId, payload),
    onSuccess: async () => {
      setDialogOpen(false);
      setForm(initialForm);
      setCourseId("");
      await invalidateAll();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ChapterRequest }) => updateChapter(id, payload),
    onSuccess: async () => {
      setDialogOpen(false);
      setEditingChapter(null);
      setForm(initialForm);
      await invalidateAll();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteChapter,
    onSuccess: async () => {
      setDeleteTarget(null);
      await invalidateAll();
    }
  });

  const onOpenCreate = () => {
    setEditingChapter(null);
    setForm(initialForm);
    setDialogOpen(true);
  };

  const onOpenEdit = (chapter: CourseChapter) => {
    setEditingChapter(chapter);
    setForm({
      title: chapter.title,
      description: chapter.description ?? "",
      chapterOrder: chapter.chapterOrder
    });
    setDialogOpen(true);
  };

  const onSubmit = () => {
    if (!form.title.trim()) return;

    if (editingChapter) {
      updateMutation.mutate({ id: editingChapter.id, payload: form });
      return;
    }

    if (!courseId) return;
    createMutation.mutate({ courseId, payload: form });
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <div>
          <Typography variant="h4" fontWeight={700}>
            Chapter Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            CRUD chapters within selected courses.
          </Typography>
        </div>
        <Button startIcon={<AddIcon />} variant="contained" onClick={onOpenCreate}>
          Add Chapter
        </Button>
      </Stack>

      {(chaptersQuery.isError || coursesQuery.isError) && (
        <Alert severity="error">Failed to load chapter data.</Alert>
      )}

      <Paper elevation={0} className="rounded-2xl border border-slate-200">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Chapter</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Order</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {chaptersQuery.data?.map((chapter) => (
              <TableRow key={chapter.id}>
                <TableCell>
                  <Typography fontWeight={600}>{chapter.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {chapter.description || "No description"}
                  </Typography>
                </TableCell>
                <TableCell>{courseNameMap.get(chapter.courseId) ?? `#${chapter.courseId}`}</TableCell>
                <TableCell>{chapter.chapterOrder}</TableCell>
                <TableCell align="right">
                  <Button size="small" startIcon={<EditOutlinedIcon />} onClick={() => onOpenEdit(chapter)}>
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => setDeleteTarget(chapter)}
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
        title={editingChapter ? "Edit Chapter" : "Create Chapter"}
        onClose={() => setDialogOpen(false)}
        onSubmit={onSubmit}
        submitLabel={editingChapter ? "Update" : "Create"}
        loading={createMutation.isPending || updateMutation.isPending}
      >
        <Stack spacing={2} className="mt-2">
          {!editingChapter && (
            <TextField
              select
              label="Course"
              value={courseId}
              onChange={(event) => setCourseId(Number(event.target.value))}
              required
            >
              {(coursesQuery.data ?? []).map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.name}
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
            label="Description"
            value={form.description ?? ""}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            multiline
            minRows={2}
          />

          <TextField
            label="Order"
            type="number"
            value={form.chapterOrder ?? 0}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, chapterOrder: Number(event.target.value) }))
            }
          />
        </Stack>
      </CrudDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete chapter"
        description={
          deleteTarget ? `Delete chapter \"${deleteTarget.title}\" and all nested content?` : ""
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </Stack>
  );
}
