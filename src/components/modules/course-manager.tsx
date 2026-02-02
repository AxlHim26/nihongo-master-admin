"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Alert from "@mui/material/Alert";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import ConfirmDialog from "@/components/common/confirm-dialog";
import CrudDialog from "@/components/common/crud-dialog";
import { queryKeys } from "@/lib/query-keys";
import {
  createChapter,
  createCourse,
  createLesson,
  createSection,
  deleteChapter,
  deleteCourse,
  deleteLesson,
  deleteSection,
  getCourses,
  updateChapter,
  updateCourse,
  updateLesson,
  updateSection
} from "@/lib/lms-api";
import type {
  ChapterRequest,
  Course,
  CourseRequest,
  CourseSectionStatus,
  CourseSectionType,
  LessonRequest,
  SectionRequest
} from "@/lib/types";

const sectionTypeOptions: CourseSectionType[] = ["VOCABULARY", "GRAMMAR", "KANJI"];
const sectionStatusOptions: CourseSectionStatus[] = ["ACTIVE", "DRAFT", "UNDER_DEVELOPMENT"];

const initialCourseForm: CourseRequest = { name: "", thumbnailUrl: "", description: "" };
const initialChapterForm: ChapterRequest = { title: "", description: "", chapterOrder: 0 };
const initialSectionForm: SectionRequest = {
  type: "GRAMMAR",
  title: "",
  level: "",
  topic: "",
  status: "ACTIVE",
  sectionOrder: 0
};
const initialLessonForm: LessonRequest = {
  title: "",
  videoUrl: "",
  pdfUrl: "",
  lessonOrder: 0
};

type DeleteTarget = {
  kind: "course" | "chapter" | "section" | "lesson";
  id: number;
  label: string;
};

export default function CourseManager() {
  const queryClient = useQueryClient();

  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [chapterDialogOpen, setChapterDialogOpen] = useState(false);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingChapterId, setEditingChapterId] = useState<number | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);

  const [courseContextId, setCourseContextId] = useState<number | null>(null);
  const [chapterContextId, setChapterContextId] = useState<number | null>(null);
  const [sectionContextId, setSectionContextId] = useState<number | null>(null);

  const [courseForm, setCourseForm] = useState<CourseRequest>(initialCourseForm);
  const [chapterForm, setChapterForm] = useState<ChapterRequest>(initialChapterForm);
  const [sectionForm, setSectionForm] = useState<SectionRequest>(initialSectionForm);
  const [lessonForm, setLessonForm] = useState<LessonRequest>(initialLessonForm);

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const coursesQuery = useQuery({
    queryKey: queryKeys.courses,
    queryFn: () => getCourses(true)
  });

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.courses }),
      queryClient.invalidateQueries({ queryKey: queryKeys.chapters }),
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons }),
      queryClient.invalidateQueries({ queryKey: queryKeys.sections() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.sections("GRAMMAR") }),
      queryClient.invalidateQueries({ queryKey: queryKeys.sections("VOCABULARY") }),
      queryClient.invalidateQueries({ queryKey: queryKeys.sections("KANJI") })
    ]);
  };

  const createCourseMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: async () => {
      setCourseDialogOpen(false);
      setCourseForm(initialCourseForm);
      await invalidateAll();
    }
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CourseRequest }) => updateCourse(id, payload),
    onSuccess: async () => {
      setCourseDialogOpen(false);
      setEditingCourse(null);
      setCourseForm(initialCourseForm);
      await invalidateAll();
    }
  });

  const createChapterMutation = useMutation({
    mutationFn: ({ courseId, payload }: { courseId: number; payload: ChapterRequest }) =>
      createChapter(courseId, payload),
    onSuccess: async () => {
      setChapterDialogOpen(false);
      setChapterForm(initialChapterForm);
      setEditingChapterId(null);
      await invalidateAll();
    }
  });

  const updateChapterMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ChapterRequest }) => updateChapter(id, payload),
    onSuccess: async () => {
      setChapterDialogOpen(false);
      setChapterForm(initialChapterForm);
      setEditingChapterId(null);
      await invalidateAll();
    }
  });

  const createSectionMutation = useMutation({
    mutationFn: ({ chapterId, payload }: { chapterId: number; payload: SectionRequest }) =>
      createSection(chapterId, payload),
    onSuccess: async () => {
      setSectionDialogOpen(false);
      setSectionForm(initialSectionForm);
      setEditingSectionId(null);
      await invalidateAll();
    }
  });

  const updateSectionMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SectionRequest }) => updateSection(id, payload),
    onSuccess: async () => {
      setSectionDialogOpen(false);
      setSectionForm(initialSectionForm);
      setEditingSectionId(null);
      await invalidateAll();
    }
  });

  const createLessonMutation = useMutation({
    mutationFn: ({ sectionId, payload }: { sectionId: number; payload: LessonRequest }) =>
      createLesson(sectionId, payload),
    onSuccess: async () => {
      setLessonDialogOpen(false);
      setLessonForm(initialLessonForm);
      setEditingLessonId(null);
      await invalidateAll();
    }
  });

  const updateLessonMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: LessonRequest }) => updateLesson(id, payload),
    onSuccess: async () => {
      setLessonDialogOpen(false);
      setLessonForm(initialLessonForm);
      setEditingLessonId(null);
      await invalidateAll();
    }
  });

  const deleteCourseMutation = useMutation({ mutationFn: deleteCourse, onSuccess: invalidateAll });
  const deleteChapterMutation = useMutation({ mutationFn: deleteChapter, onSuccess: invalidateAll });
  const deleteSectionMutation = useMutation({ mutationFn: deleteSection, onSuccess: invalidateAll });
  const deleteLessonMutation = useMutation({ mutationFn: deleteLesson, onSuccess: invalidateAll });

  const busy =
    createCourseMutation.isPending ||
    updateCourseMutation.isPending ||
    createChapterMutation.isPending ||
    updateChapterMutation.isPending ||
    createSectionMutation.isPending ||
    updateSectionMutation.isPending ||
    createLessonMutation.isPending ||
    updateLessonMutation.isPending;

  const onOpenCreateCourse = () => {
    setEditingCourse(null);
    setCourseForm(initialCourseForm);
    setCourseDialogOpen(true);
  };

  const onOpenEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      name: course.name,
      description: course.description ?? "",
      thumbnailUrl: course.thumbnailUrl ?? ""
    });
    setCourseDialogOpen(true);
  };

  const onSubmitCourse = () => {
    if (!courseForm.name.trim()) return;
    if (editingCourse) {
      updateCourseMutation.mutate({ id: editingCourse.id, payload: courseForm });
      return;
    }
    createCourseMutation.mutate(courseForm);
  };

  const onOpenCreateChapter = (courseId: number) => {
    setEditingChapterId(null);
    setCourseContextId(courseId);
    setChapterForm(initialChapterForm);
    setChapterDialogOpen(true);
  };

  const onOpenEditChapter = (chapterId: number, title: string, description?: string | null, chapterOrder?: number) => {
    setEditingChapterId(chapterId);
    setChapterForm({
      title,
      description: description ?? "",
      chapterOrder: chapterOrder ?? 0
    });
    setChapterDialogOpen(true);
  };

  const onSubmitChapter = () => {
    if (!chapterForm.title.trim()) return;
    if (editingChapterId) {
      updateChapterMutation.mutate({ id: editingChapterId, payload: chapterForm });
      return;
    }
    if (!courseContextId) return;
    createChapterMutation.mutate({ courseId: courseContextId, payload: chapterForm });
  };

  const onOpenCreateSection = (chapterId: number) => {
    setEditingSectionId(null);
    setChapterContextId(chapterId);
    setSectionForm(initialSectionForm);
    setSectionDialogOpen(true);
  };

  const onOpenEditSection = (
    sectionId: number,
    data: Pick<SectionRequest, "type" | "title" | "level" | "topic" | "status" | "sectionOrder">
  ) => {
    setEditingSectionId(sectionId);
    setSectionForm({
      type: data.type,
      title: data.title,
      level: data.level ?? "",
      topic: data.topic ?? "",
      status: data.status ?? "ACTIVE",
      sectionOrder: data.sectionOrder ?? 0
    });
    setSectionDialogOpen(true);
  };

  const onSubmitSection = () => {
    if (!sectionForm.title.trim()) return;
    if (editingSectionId) {
      updateSectionMutation.mutate({ id: editingSectionId, payload: sectionForm });
      return;
    }
    if (!chapterContextId) return;
    createSectionMutation.mutate({ chapterId: chapterContextId, payload: sectionForm });
  };

  const onOpenCreateLesson = (sectionId: number) => {
    setEditingLessonId(null);
    setSectionContextId(sectionId);
    setLessonForm(initialLessonForm);
    setLessonDialogOpen(true);
  };

  const onOpenEditLesson = (
    lessonId: number,
    data: Pick<LessonRequest, "title" | "videoUrl" | "pdfUrl" | "lessonOrder">
  ) => {
    setEditingLessonId(lessonId);
    setLessonForm({
      title: data.title,
      videoUrl: data.videoUrl ?? "",
      pdfUrl: data.pdfUrl ?? "",
      lessonOrder: data.lessonOrder ?? 0
    });
    setLessonDialogOpen(true);
  };

  const onSubmitLesson = () => {
    if (!lessonForm.title.trim()) return;
    if (editingLessonId) {
      updateLessonMutation.mutate({ id: editingLessonId, payload: lessonForm });
      return;
    }
    if (!sectionContextId) return;
    createLessonMutation.mutate({ sectionId: sectionContextId, payload: lessonForm });
  };

  const onConfirmDelete = () => {
    if (!deleteTarget) return;

    const actionMap = {
      course: deleteCourseMutation,
      chapter: deleteChapterMutation,
      section: deleteSectionMutation,
      lesson: deleteLessonMutation
    };

    actionMap[deleteTarget.kind].mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
      }
    });
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <div>
          <Typography variant="h4" fontWeight={700}>
            Course Tree Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage Course → Chapter → Section → Lesson hierarchy.
          </Typography>
        </div>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onOpenCreateCourse}>
          Add Course
        </Button>
      </Stack>

      {coursesQuery.isError && (
        <Alert severity="error">
          {coursesQuery.error instanceof Error ? coursesQuery.error.message : "Failed to load courses."}
        </Alert>
      )}

      {coursesQuery.data?.length === 0 && (
        <Paper elevation={0} className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
          <Typography>No courses yet. Create your first course.</Typography>
        </Paper>
      )}

      <Stack spacing={2}>
        {coursesQuery.data?.map((course) => (
          <Accordion key={course.id} defaultExpanded disableGutters className="rounded-2xl border border-slate-200">
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box className="flex w-full items-center justify-between gap-3">
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {course.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {course.description || "No description"}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <IconButton size="small" onClick={() => onOpenEditCourse(course)}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() =>
                      setDeleteTarget({ kind: "course", id: course.id, label: `course \"${course.name}\"` })
                    }
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                  <Button size="small" variant="outlined" onClick={() => onOpenCreateChapter(course.id)}>
                    Add Chapter
                  </Button>
                </Stack>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {course.chapters.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No chapters in this course.
                  </Typography>
                ) : (
                  course.chapters.map((chapter) => (
                    <Paper key={chapter.id} elevation={0} className="rounded-xl border border-slate-200 p-4">
                      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                        <Box>
                          <Typography fontWeight={700}>
                            Chapter {chapter.chapterOrder}: {chapter.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {chapter.description || "No description"}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            size="small"
                            onClick={() =>
                              onOpenEditChapter(
                                chapter.id,
                                chapter.title,
                                chapter.description,
                                chapter.chapterOrder
                              )
                            }
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              setDeleteTarget({
                                kind: "chapter",
                                id: chapter.id,
                                label: `chapter \"${chapter.title}\"`
                              })
                            }
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                          <Button size="small" variant="outlined" onClick={() => onOpenCreateSection(chapter.id)}>
                            Add Section
                          </Button>
                        </Stack>
                      </Stack>

                      <Divider className="my-3" />

                      <Stack spacing={1.5}>
                        {chapter.sections.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            No sections in this chapter.
                          </Typography>
                        ) : (
                          chapter.sections.map((section) => (
                            <Paper key={section.id} elevation={0} className="rounded-lg border border-slate-100 p-3">
                              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                                <Box>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography fontWeight={600}>{section.title}</Typography>
                                    <Chip label={section.type} size="small" />
                                    <Chip label={section.status} size="small" variant="outlined" />
                                  </Stack>
                                  <Typography variant="caption" color="text.secondary">
                                    Level: {section.level || "-"} • Topic: {section.topic || "-"}
                                  </Typography>
                                </Box>
                                <Stack direction="row" spacing={1}>
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      onOpenEditSection(section.id, {
                                        type: section.type,
                                        title: section.title,
                                        level: section.level ?? "",
                                        topic: section.topic ?? "",
                                        status: section.status,
                                        sectionOrder: section.sectionOrder
                                      })
                                    }
                                  >
                                    <EditOutlinedIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() =>
                                      setDeleteTarget({
                                        kind: "section",
                                        id: section.id,
                                        label: `section \"${section.title}\"`
                                      })
                                    }
                                  >
                                    <DeleteOutlineIcon fontSize="small" />
                                  </IconButton>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => onOpenCreateLesson(section.id)}
                                  >
                                    Add Lesson
                                  </Button>
                                </Stack>
                              </Stack>

                              <Stack spacing={1} className="mt-2">
                                {section.lessons.length === 0 ? (
                                  <Typography variant="caption" color="text.secondary">
                                    No lessons in this section.
                                  </Typography>
                                ) : (
                                  section.lessons.map((lesson) => (
                                    <Box
                                      key={lesson.id}
                                      className="rounded-md border border-slate-100 bg-slate-50 p-2"
                                    >
                                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                                        <Box>
                                          <Typography variant="body2" fontWeight={600}>
                                            {lesson.lessonOrder}. {lesson.title}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            Video: {lesson.videoUrl || "-"} • PDF: {lesson.pdfUrl || "-"}
                                          </Typography>
                                        </Box>
                                        <Stack direction="row" spacing={1}>
                                          <IconButton
                                            size="small"
                                            onClick={() =>
                                              onOpenEditLesson(lesson.id, {
                                                title: lesson.title,
                                                videoUrl: lesson.videoUrl ?? "",
                                                pdfUrl: lesson.pdfUrl ?? "",
                                                lessonOrder: lesson.lessonOrder
                                              })
                                            }
                                          >
                                            <EditOutlinedIcon fontSize="small" />
                                          </IconButton>
                                          <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() =>
                                              setDeleteTarget({
                                                kind: "lesson",
                                                id: lesson.id,
                                                label: `lesson \"${lesson.title}\"`
                                              })
                                            }
                                          >
                                            <DeleteOutlineIcon fontSize="small" />
                                          </IconButton>
                                        </Stack>
                                      </Stack>
                                    </Box>
                                  ))
                                )}
                              </Stack>
                            </Paper>
                          ))
                        )}
                      </Stack>
                    </Paper>
                  ))
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>

      <CrudDialog
        open={courseDialogOpen}
        title={editingCourse ? "Edit Course" : "Create Course"}
        onClose={() => setCourseDialogOpen(false)}
        onSubmit={onSubmitCourse}
        submitLabel={editingCourse ? "Update" : "Create"}
        loading={busy}
      >
        <Stack spacing={2} className="mt-2">
          <TextField
            label="Name"
            value={courseForm.name}
            onChange={(event) => setCourseForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
          <TextField
            label="Thumbnail URL"
            value={courseForm.thumbnailUrl || ""}
            onChange={(event) =>
              setCourseForm((prev) => ({ ...prev, thumbnailUrl: event.target.value }))
            }
          />
          <TextField
            label="Description"
            value={courseForm.description || ""}
            onChange={(event) => setCourseForm((prev) => ({ ...prev, description: event.target.value }))}
            multiline
            minRows={3}
          />
        </Stack>
      </CrudDialog>

      <CrudDialog
        open={chapterDialogOpen}
        title={editingChapterId ? "Edit Chapter" : "Create Chapter"}
        onClose={() => setChapterDialogOpen(false)}
        onSubmit={onSubmitChapter}
        submitLabel={editingChapterId ? "Update" : "Create"}
        loading={busy}
      >
        <Stack spacing={2} className="mt-2">
          <TextField
            label="Title"
            value={chapterForm.title}
            onChange={(event) => setChapterForm((prev) => ({ ...prev, title: event.target.value }))}
            required
          />
          <TextField
            label="Description"
            value={chapterForm.description || ""}
            onChange={(event) =>
              setChapterForm((prev) => ({ ...prev, description: event.target.value }))
            }
            multiline
            minRows={2}
          />
          <TextField
            label="Order"
            type="number"
            value={chapterForm.chapterOrder ?? 0}
            onChange={(event) =>
              setChapterForm((prev) => ({ ...prev, chapterOrder: Number(event.target.value) }))
            }
          />
        </Stack>
      </CrudDialog>

      <CrudDialog
        open={sectionDialogOpen}
        title={editingSectionId ? "Edit Section" : "Create Section"}
        onClose={() => setSectionDialogOpen(false)}
        onSubmit={onSubmitSection}
        submitLabel={editingSectionId ? "Update" : "Create"}
        loading={busy}
      >
        <Stack spacing={2} className="mt-2">
          <TextField
            select
            label="Section Type"
            value={sectionForm.type}
            onChange={(event) =>
              setSectionForm((prev) => ({ ...prev, type: event.target.value as CourseSectionType }))
            }
          >
            {sectionTypeOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Title"
            value={sectionForm.title}
            onChange={(event) => setSectionForm((prev) => ({ ...prev, title: event.target.value }))}
            required
          />

          <TextField
            label="Level"
            value={sectionForm.level || ""}
            onChange={(event) => setSectionForm((prev) => ({ ...prev, level: event.target.value }))}
          />

          <TextField
            label="Topic"
            value={sectionForm.topic || ""}
            onChange={(event) => setSectionForm((prev) => ({ ...prev, topic: event.target.value }))}
          />

          <TextField
            select
            label="Status"
            value={sectionForm.status}
            onChange={(event) =>
              setSectionForm((prev) => ({
                ...prev,
                status: event.target.value as CourseSectionStatus
              }))
            }
          >
            {sectionStatusOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Order"
            type="number"
            value={sectionForm.sectionOrder ?? 0}
            onChange={(event) =>
              setSectionForm((prev) => ({ ...prev, sectionOrder: Number(event.target.value) }))
            }
          />
        </Stack>
      </CrudDialog>

      <CrudDialog
        open={lessonDialogOpen}
        title={editingLessonId ? "Edit Lesson" : "Create Lesson"}
        onClose={() => setLessonDialogOpen(false)}
        onSubmit={onSubmitLesson}
        submitLabel={editingLessonId ? "Update" : "Create"}
        loading={busy}
      >
        <Stack spacing={2} className="mt-2">
          <TextField
            label="Title"
            value={lessonForm.title}
            onChange={(event) => setLessonForm((prev) => ({ ...prev, title: event.target.value }))}
            required
          />
          <TextField
            label="Video URL"
            value={lessonForm.videoUrl || ""}
            onChange={(event) => setLessonForm((prev) => ({ ...prev, videoUrl: event.target.value }))}
          />
          <TextField
            label="PDF URL"
            value={lessonForm.pdfUrl || ""}
            onChange={(event) => setLessonForm((prev) => ({ ...prev, pdfUrl: event.target.value }))}
          />
          <TextField
            label="Order"
            type="number"
            value={lessonForm.lessonOrder ?? 0}
            onChange={(event) =>
              setLessonForm((prev) => ({ ...prev, lessonOrder: Number(event.target.value) }))
            }
          />
        </Stack>
      </CrudDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Confirm deletion"
        description={deleteTarget ? `Are you sure you want to delete ${deleteTarget.label}?` : ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={onConfirmDelete}
        loading={
          deleteCourseMutation.isPending ||
          deleteChapterMutation.isPending ||
          deleteSectionMutation.isPending ||
          deleteLessonMutation.isPending
        }
      />
    </Stack>
  );
}
