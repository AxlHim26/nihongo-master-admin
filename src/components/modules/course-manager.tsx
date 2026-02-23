"use client";

import AddIcon from "@mui/icons-material/Add";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import PlayCircleRoundedIcon from "@mui/icons-material/PlayCircleRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { memo, useCallback, useMemo, useState } from "react";

import ConfirmDialog from "@/components/common/confirm-dialog";
import CrudDialog from "@/components/common/crud-dialog";
import {
  createChapter,
  createCourse,
  createLesson,
  deleteChapter,
  deleteCourse,
  deleteLesson,
  getCourses,
  updateChapter,
  updateCourse,
  updateLesson,
} from "@/lib/lms-api";
import { queryKeys } from "@/lib/query-keys";
import type {
  ChapterRequest,
  Course,
  CourseChapter,
  CourseLesson,
  CourseRequest,
  CourseSection,
  CourseSectionType,
  LessonRequest,
} from "@/lib/types";

const initialCourseForm: CourseRequest = { name: "", thumbnailUrl: "", description: "" };
const initialChapterForm: ChapterRequest = { title: "", description: "", chapterOrder: 0 };
const initialLessonForm: LessonRequest = {
  title: "",
  videoUrl: "",
  pdfUrl: "",
  lessonOrder: 0,
};

type DeleteTarget = {
  kind: "course" | "chapter" | "lesson";
  id: number;
  label: string;
};

const findCourse = (courses: Course[], courseId: number | null) =>
  courses.find((course) => course.id === courseId) ?? null;

const findChapter = (course: Course | null, chapterId: number | null) =>
  course?.chapters.find((chapter) => chapter.id === chapterId) ?? null;

const findSection = (chapter: CourseChapter | null, sectionId: number | null) =>
  chapter?.sections.find((section) => section.id === sectionId) ?? null;

const lessonCountByCourse = (course: Course) =>
  course.chapters.reduce(
    (sum, chapter) => sum + chapter.sections.reduce((acc, section) => acc + section.lessons.length, 0),
    0,
  );

const sectionIconMap: Record<CourseSectionType, React.ReactNode> = {
  VOCABULARY: <AutoStoriesRoundedIcon fontSize="small" />,
  GRAMMAR: <MenuBookRoundedIcon fontSize="small" />,
  KANJI: <SchoolRoundedIcon fontSize="small" />,
};

type CourseManagerProps = {
  routeCourseId?: number | null;
  routeChapterId?: number | null;
  routeSectionId?: number | null;
};

const toNullableId = (value: number | null | undefined) =>
  typeof value === "number" && Number.isInteger(value) && value > 0 ? value : null;

const coursePath = (courseId: number) => `/courses/${courseId}`;
const chapterPath = (courseId: number, chapterId: number) => `/courses/${courseId}/chapters/${chapterId}`;
const sectionPath = (courseId: number, chapterId: number, sectionId: number) =>
  `/courses/${courseId}/chapters/${chapterId}/sections/${sectionId}`;

export default function CourseManager({
  routeCourseId,
  routeChapterId,
  routeSectionId,
}: CourseManagerProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [chapterDialogOpen, setChapterDialogOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingChapterId, setEditingChapterId] = useState<number | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);

  const [courseContextId, setCourseContextId] = useState<number | null>(null);
  const [sectionContextId, setSectionContextId] = useState<number | null>(null);

  const [courseForm, setCourseForm] = useState<CourseRequest>(initialCourseForm);
  const [chapterForm, setChapterForm] = useState<ChapterRequest>(initialChapterForm);
  const [lessonForm, setLessonForm] = useState<LessonRequest>(initialLessonForm);

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const coursesQuery = useQuery({
    queryKey: queryKeys.courses,
    queryFn: () => getCourses(true),
  });

  const selectedCourseId = toNullableId(routeCourseId);
  const selectedChapterId = toNullableId(routeChapterId);
  const selectedSectionId = toNullableId(routeSectionId);

  const courses = useMemo(() => coursesQuery.data ?? [], [coursesQuery.data]);
  const selectedCourse = useMemo(() => findCourse(courses, selectedCourseId), [courses, selectedCourseId]);
  const selectedChapter = useMemo(
    () => findChapter(selectedCourse, selectedChapterId),
    [selectedCourse, selectedChapterId],
  );
  const selectedSection = useMemo(
    () => findSection(selectedChapter, selectedSectionId),
    [selectedChapter, selectedSectionId],
  );

  const showCourses = selectedCourseId === null;
  const showChapters = selectedCourseId !== null && selectedChapterId === null;
  const showSections =
    selectedCourseId !== null && selectedChapterId !== null && selectedSectionId === null;
  const showLessons =
    selectedCourseId !== null && selectedChapterId !== null && selectedSectionId !== null;

  const backPath = useMemo(() => {
    if (showChapters) {
      return "/courses";
    }
    if (showSections && selectedCourse) {
      return coursePath(selectedCourse.id);
    }
    if (showLessons && selectedCourse && selectedChapter) {
      return chapterPath(selectedCourse.id, selectedChapter.id);
    }
    return null;
  }, [selectedChapter, selectedCourse, showChapters, showLessons, showSections]);

  const getNextChapterOrder = useCallback(
    (courseId: number) => {
      const course = findCourse(courses, courseId);
      const maxOrder = course?.chapters.reduce((max, chapter) => Math.max(max, chapter.chapterOrder ?? 0), 0) ?? 0;
      return maxOrder + 1;
    },
    [courses],
  );

  const getNextLessonOrder = useCallback(
    (sectionId: number) => {
      let section: CourseSection | null = null;
      for (const course of courses) {
        for (const chapter of course.chapters) {
          const found = chapter.sections.find((item) => item.id === sectionId);
          if (found) {
            section = found;
            break;
          }
        }
      }
      const maxOrder = section?.lessons.reduce((max, lesson) => Math.max(max, lesson.lessonOrder ?? 0), 0) ?? 0;
      return maxOrder + 1;
    },
    [courses],
  );

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.courses }),
      queryClient.invalidateQueries({ queryKey: queryKeys.chapters }),
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons }),
      queryClient.invalidateQueries({ queryKey: queryKeys.sections() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.sections("GRAMMAR") }),
      queryClient.invalidateQueries({ queryKey: queryKeys.sections("VOCABULARY") }),
      queryClient.invalidateQueries({ queryKey: queryKeys.sections("KANJI") }),
    ]);
  };

  const createCourseMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: async () => {
      setCourseDialogOpen(false);
      setCourseForm(initialCourseForm);
      await invalidateAll();
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CourseRequest }) => updateCourse(id, payload),
    onSuccess: async () => {
      setCourseDialogOpen(false);
      setEditingCourse(null);
      setCourseForm(initialCourseForm);
      await invalidateAll();
    },
  });

  const createChapterMutation = useMutation({
    mutationFn: ({ courseId, payload }: { courseId: number; payload: ChapterRequest }) =>
      createChapter(courseId, payload),
    onSuccess: async () => {
      setChapterDialogOpen(false);
      setChapterForm(initialChapterForm);
      setEditingChapterId(null);
      await invalidateAll();
    },
  });

  const updateChapterMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ChapterRequest }) => updateChapter(id, payload),
    onSuccess: async () => {
      setChapterDialogOpen(false);
      setChapterForm(initialChapterForm);
      setEditingChapterId(null);
      await invalidateAll();
    },
  });

  const createLessonMutation = useMutation({
    mutationFn: ({ sectionId, payload }: { sectionId: number; payload: LessonRequest }) =>
      createLesson(sectionId, payload),
    onSuccess: async () => {
      setLessonDialogOpen(false);
      setLessonForm(initialLessonForm);
      setEditingLessonId(null);
      await invalidateAll();
    },
  });

  const updateLessonMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: LessonRequest }) => updateLesson(id, payload),
    onSuccess: async () => {
      setLessonDialogOpen(false);
      setLessonForm(initialLessonForm);
      setEditingLessonId(null);
      await invalidateAll();
    },
  });

  const deleteCourseMutation = useMutation({ mutationFn: deleteCourse, onSuccess: invalidateAll });
  const deleteChapterMutation = useMutation({ mutationFn: deleteChapter, onSuccess: invalidateAll });
  const deleteLessonMutation = useMutation({ mutationFn: deleteLesson, onSuccess: invalidateAll });

  const busy =
    createCourseMutation.isPending ||
    updateCourseMutation.isPending ||
    createChapterMutation.isPending ||
    updateChapterMutation.isPending ||
    createLessonMutation.isPending ||
    updateLessonMutation.isPending;

  const onOpenCreateCourse = useCallback(() => {
    setEditingCourse(null);
    setCourseForm(initialCourseForm);
    setCourseDialogOpen(true);
  }, []);

  const onOpenEditCourse = useCallback((course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      name: course.name,
      description: course.description ?? "",
      thumbnailUrl: course.thumbnailUrl ?? "",
    });
    setCourseDialogOpen(true);
  }, []);

  const onSubmitCourse = () => {
    if (!courseForm.name.trim()) return;
    if (editingCourse) {
      updateCourseMutation.mutate({ id: editingCourse.id, payload: courseForm });
      return;
    }
    createCourseMutation.mutate(courseForm);
  };

  const onOpenCreateChapter = useCallback((courseId: number) => {
    setEditingChapterId(null);
    setCourseContextId(courseId);
    setChapterForm({ ...initialChapterForm, chapterOrder: getNextChapterOrder(courseId) });
    setChapterDialogOpen(true);
  }, [getNextChapterOrder]);

  const onOpenEditChapter = useCallback((chapter: CourseChapter) => {
    setEditingChapterId(chapter.id);
    setChapterForm({
      title: chapter.title,
      description: chapter.description ?? "",
      chapterOrder: chapter.chapterOrder,
    });
    setChapterDialogOpen(true);
  }, []);

  const onSubmitChapter = () => {
    if (!chapterForm.title.trim()) return;
    if (editingChapterId) {
      updateChapterMutation.mutate({ id: editingChapterId, payload: chapterForm });
      return;
    }
    if (!courseContextId) return;

    createChapterMutation.mutate({
      courseId: courseContextId,
      payload: {
        ...chapterForm,
        chapterOrder: chapterForm.chapterOrder ?? getNextChapterOrder(courseContextId),
      },
    });
  };

  const onOpenCreateLesson = useCallback((sectionId: number) => {
    setEditingLessonId(null);
    setSectionContextId(sectionId);
    setLessonForm({ ...initialLessonForm, lessonOrder: getNextLessonOrder(sectionId) });
    setLessonDialogOpen(true);
  }, [getNextLessonOrder]);

  const onOpenEditLesson = useCallback((lesson: CourseLesson) => {
    setEditingLessonId(lesson.id);
    setLessonForm({
      title: lesson.title,
      videoUrl: lesson.videoUrl ?? "",
      pdfUrl: lesson.pdfUrl ?? "",
      lessonOrder: lesson.lessonOrder,
    });
    setLessonDialogOpen(true);
  }, []);

  const onSubmitLesson = () => {
    if (!lessonForm.title.trim()) return;
    if (editingLessonId) {
      updateLessonMutation.mutate({ id: editingLessonId, payload: lessonForm });
      return;
    }
    if (!sectionContextId) return;

    createLessonMutation.mutate({
      sectionId: sectionContextId,
      payload: {
        ...lessonForm,
        lessonOrder: lessonForm.lessonOrder ?? getNextLessonOrder(sectionContextId),
      },
    });
  };

  const onConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;

    const actionMap = {
      course: deleteCourseMutation,
      chapter: deleteChapterMutation,
      lesson: deleteLessonMutation,
    };

    actionMap[deleteTarget.kind].mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
      },
    });
  }, [deleteChapterMutation, deleteCourseMutation, deleteLessonMutation, deleteTarget]);

  const handleBack = useCallback(() => {
    if (backPath) {
      router.push(backPath);
    }
  }, [backPath, router]);

  const handleSelectCourse = useCallback(
    (courseId: number) => {
      router.push(coursePath(courseId));
    },
    [router],
  );

  const handleEditCourse = useCallback(
    (courseId: number) => {
      const course = findCourse(courses, courseId);
      if (course) {
        onOpenEditCourse(course);
      }
    },
    [courses, onOpenEditCourse],
  );

  const handleDeleteCourse = useCallback(
    (courseId: number, courseName: string) => {
      setDeleteTarget({ kind: "course", id: courseId, label: `course \"${courseName}\"` });
    },
    [],
  );

  const handleSelectChapter = useCallback(
    (chapterId: number) => {
      if (!selectedCourse) {
        return;
      }
      router.push(chapterPath(selectedCourse.id, chapterId));
    },
    [router, selectedCourse],
  );

  const handleEditChapter = useCallback(
    (chapterId: number) => {
      const chapter = selectedCourse?.chapters.find((item) => item.id === chapterId);
      if (chapter) {
        onOpenEditChapter(chapter);
      }
    },
    [onOpenEditChapter, selectedCourse],
  );

  const handleDeleteChapter = useCallback(
    (chapterId: number, chapterTitle: string) => {
      setDeleteTarget({ kind: "chapter", id: chapterId, label: `chapter \"${chapterTitle}\"` });
    },
    [],
  );

  const handleSelectSection = useCallback(
    (sectionId: number) => {
      if (!selectedCourse || !selectedChapter) {
        return;
      }
      router.push(sectionPath(selectedCourse.id, selectedChapter.id, sectionId));
    },
    [router, selectedChapter, selectedCourse],
  );

  const handleOpenCreateLesson = useCallback(
    (sectionId: number) => {
      onOpenCreateLesson(sectionId);
    },
    [onOpenCreateLesson],
  );

  const handleEditLesson = useCallback(
    (lessonId: number) => {
      const lesson = selectedSection?.lessons.find((item) => item.id === lessonId);
      if (lesson) {
        onOpenEditLesson(lesson);
      }
    },
    [onOpenEditLesson, selectedSection],
  );

  const handleDeleteLesson = useCallback(
    (lessonId: number, lessonTitle: string) => {
      setDeleteTarget({ kind: "lesson", id: lessonId, label: `lesson \"${lessonTitle}\"` });
    },
    [],
  );

  return (
    <Stack spacing={3}>
      {showCourses ? (
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <div>
            <Typography variant="h4" fontWeight={700}>
              Course Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage the Course → Chapter → Section → Lesson structure.
            </Typography>
          </div>

          <Button variant="contained" startIcon={<AddIcon />} onClick={onOpenCreateCourse}>
            Add course
          </Button>
        </Stack>
      ) : (
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          {backPath && (
            <IconButton aria-label="Go back" onClick={handleBack}>
              <ArrowBackRoundedIcon />
            </IconButton>
          )}
          {showChapters && selectedCourse && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => onOpenCreateChapter(selectedCourse.id)}
            >
              Add chapter
            </Button>
          )}
          {showLessons && selectedSection && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenCreateLesson(selectedSection.id)}
            >
              Add lesson
            </Button>
          )}
        </Stack>
      )}

      {coursesQuery.isError && (
        <Alert severity="error">
          {coursesQuery.error instanceof Error ? coursesQuery.error.message : "Failed to load courses."}
        </Alert>
      )}

      {!coursesQuery.isLoading && courses.length === 0 && (
        <Paper elevation={0} className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
          <Typography>No courses yet. Create your first course.</Typography>
        </Paper>
      )}

      {showChapters && !selectedCourse && (
        <Alert severity="warning">
          Course not found from this route. Please go back to the course list.
        </Alert>
      )}

      {showSections && (!selectedCourse || !selectedChapter) && (
        <Alert severity="warning">
          Chapter not found from this route. Please go back to the chapter list.
        </Alert>
      )}

      {showLessons && (!selectedCourse || !selectedChapter || !selectedSection) && (
        <Alert severity="warning">
          Section not found from this route. Please go back to the section list.
        </Alert>
      )}

      {showCourses && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              courseId={course.id}
              courseName={course.name}
              description={course.description}
              chapterCount={course.chapters.length}
              lessonCount={lessonCountByCourse(course)}
              onSelect={handleSelectCourse}
              onEdit={handleEditCourse}
              onDelete={handleDeleteCourse}
            />
          ))}
        </div>
      )}

      {showChapters && selectedCourse && (
        <Stack spacing={2}>
          {selectedCourse.chapters.length === 0 ? (
            <Alert severity="info">This course has no chapters yet.</Alert>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {selectedCourse.chapters.map((chapter) => (
                <ChapterCard
                  key={chapter.id}
                  chapterId={chapter.id}
                  chapterTitle={chapter.title}
                  description={chapter.description}
                  sectionCount={chapter.sections.length}
                  onSelect={handleSelectChapter}
                  onEdit={handleEditChapter}
                  onDelete={handleDeleteChapter}
                />
              ))}
            </div>
          )}
        </Stack>
      )}

      {showSections && selectedCourse && selectedChapter && (
        <Stack spacing={2}>
          {selectedChapter.sections.length === 0 ? (
            <Alert severity="info">This chapter has no sections yet.</Alert>
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              {selectedChapter.sections.map((section) => (
                <SectionCard
                  key={section.id}
                  sectionId={section.id}
                  sectionTitle={section.title}
                  sectionType={section.type}
                  lessonCount={section.lessons.length}
                  onSelect={handleSelectSection}
                />
              ))}
            </div>
          )}
        </Stack>
      )}

      {showLessons && selectedCourse && selectedChapter && selectedSection && (
        <Stack spacing={2}>
          {selectedSection.lessons.length === 0 ? (
            <Alert severity="info">This section has no lessons yet.</Alert>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {selectedSection.lessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lessonId={lesson.id}
                  lessonTitle={lesson.title}
                  videoUrl={lesson.videoUrl}
                  pdfUrl={lesson.pdfUrl}
                  onEdit={handleEditLesson}
                  onDelete={handleDeleteLesson}
                />
              ))}
            </div>
          )}
        </Stack>
      )}

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
            onChange={(event) => setCourseForm((prev) => ({ ...prev, thumbnailUrl: event.target.value }))}
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
            onChange={(event) => setChapterForm((prev) => ({ ...prev, description: event.target.value }))}
            multiline
            minRows={2}
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
            label="Video ID or URL"
            value={lessonForm.videoUrl || ""}
            onChange={(event) => setLessonForm((prev) => ({ ...prev, videoUrl: event.target.value }))}
            helperText="Enter numeric ID to stream via /api/v1/videos/{id}/stream"
          />
          <TextField
            label="PDF URL"
            value={lessonForm.pdfUrl || ""}
            onChange={(event) => setLessonForm((prev) => ({ ...prev, pdfUrl: event.target.value }))}
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
          deleteLessonMutation.isPending
        }
      />
    </Stack>
  );
}

type CourseCardProps = {
  courseId: number;
  courseName: string;
  description?: string | null;
  chapterCount: number;
  lessonCount: number;
  onSelect: (courseId: number) => void;
  onEdit: (courseId: number) => void;
  onDelete: (courseId: number, courseName: string) => void;
};

const CourseCard = memo(function CourseCard({
  courseId,
  courseName,
  description,
  chapterCount,
  lessonCount,
  onSelect,
  onEdit,
  onDelete,
}: CourseCardProps) {
  return (
    <Paper
      elevation={0}
      onClick={() => onSelect(courseId)}
      className="group relative aspect-[5/4] cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-[2px] hover:border-blue-200 hover:shadow-lg"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_42%),linear-gradient(160deg,rgba(15,23,42,0.03),transparent_55%)]" />
      <Stack className="relative h-full" spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Typography variant="h6" fontWeight={700} className="line-clamp-2">
            {courseName}
          </Typography>
          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(courseId);
              }}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(courseId, courseName);
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>

        <Typography variant="body2" color="text.secondary" className="line-clamp-4">
          {description || "No description"}
        </Typography>

        <div className="mt-auto flex flex-wrap items-center gap-2">
          <Chip size="small" label={`${chapterCount} chapter`} />
          <Chip size="small" label={`${lessonCount} lesson`} />
        </div>
      </Stack>
    </Paper>
  );
});

type ChapterCardProps = {
  chapterId: number;
  chapterTitle: string;
  description?: string | null;
  sectionCount: number;
  onSelect: (chapterId: number) => void;
  onEdit: (chapterId: number) => void;
  onDelete: (chapterId: number, chapterTitle: string) => void;
};

const ChapterCard = memo(function ChapterCard({
  chapterId,
  chapterTitle,
  description,
  sectionCount,
  onSelect,
  onEdit,
  onDelete,
}: ChapterCardProps) {
  return (
    <Paper
      elevation={0}
      onClick={() => onSelect(chapterId)}
      className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-200"
    >
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Typography variant="subtitle1" fontWeight={700} className="line-clamp-2">
            {chapterTitle}
          </Typography>
          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(chapterId);
              }}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(chapterId, chapterTitle);
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>

        <Typography variant="body2" color="text.secondary" className="line-clamp-3">
          {description || "No description"}
        </Typography>

        <div className="flex items-center gap-2 pt-1">
          <Chip size="small" label={`${sectionCount} section`} />
        </div>
      </Stack>
    </Paper>
  );
});

type SectionCardProps = {
  sectionId: number;
  sectionTitle: string;
  sectionType: CourseSectionType;
  lessonCount: number;
  onSelect: (sectionId: number) => void;
};

const SectionCard = memo(function SectionCard({
  sectionId,
  sectionTitle,
  sectionType,
  lessonCount,
  onSelect,
}: SectionCardProps) {
  return (
    <Paper
      elevation={0}
      onClick={() => onSelect(sectionId)}
      className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-200"
    >
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack direction="row" spacing={1} alignItems="center">
            {sectionIconMap[sectionType]}
            <Typography variant="subtitle1" fontWeight={700}>
              {sectionTitle}
            </Typography>
          </Stack>
          <Chip size="small" label={sectionType} />
        </Stack>

        <div className="flex items-center gap-2 pt-1">
          <Chip size="small" label={`${lessonCount} lesson`} />
        </div>
      </Stack>
    </Paper>
  );
});

type LessonCardProps = {
  lessonId: number;
  lessonTitle: string;
  videoUrl?: string | null;
  pdfUrl?: string | null;
  onEdit: (lessonId: number) => void;
  onDelete: (lessonId: number, lessonTitle: string) => void;
};

const LessonCard = memo(function LessonCard({
  lessonId,
  lessonTitle,
  videoUrl,
  pdfUrl,
  onEdit,
  onDelete,
}: LessonCardProps) {
  return (
    <Paper elevation={0} className="rounded-2xl border border-slate-200 bg-white p-4">
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack direction="row" spacing={1} alignItems="center">
            <PlayCircleRoundedIcon fontSize="small" />
            <Typography variant="subtitle1" fontWeight={700}>
              {lessonTitle}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" onClick={() => onEdit(lessonId)}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" color="error" onClick={() => onDelete(lessonId, lessonTitle)}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>

        <Typography variant="body2" color="text.secondary" className="break-all">
          Video: {videoUrl || "-"}
        </Typography>
        <Typography variant="body2" color="text.secondary" className="break-all">
          PDF: {pdfUrl || "-"}
        </Typography>
      </Stack>
    </Paper>
  );
});
