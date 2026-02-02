import { apiRequest } from "@/lib/api-client";
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  ChapterRequest,
  Course,
  CourseChapter,
  CourseLesson,
  CourseRequest,
  CourseSection,
  CourseSectionType,
  LessonRequest,
  SectionRequest
} from "@/lib/types";

export const loginAdmin = (payload: AdminLoginRequest) =>
  apiRequest<AdminLoginResponse>("/api/v1/auth/authenticate", {
    method: "POST",
    body: JSON.stringify(payload)
  }, false);

export const getCourses = (tree = true) =>
  apiRequest<Course[]>(`/api/v1/courses?tree=${tree}`);

export const createCourse = (payload: CourseRequest) =>
  apiRequest<Course>("/api/v1/courses", {
    method: "POST",
    body: JSON.stringify(payload)
  });

export const updateCourse = (id: number, payload: CourseRequest) =>
  apiRequest<Course>(`/api/v1/courses/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });

export const deleteCourse = (id: number) =>
  apiRequest<void>(`/api/v1/courses/${id}`, {
    method: "DELETE"
  });

export const getChapters = () => apiRequest<CourseChapter[]>("/api/v1/chapters");

export const createChapter = (courseId: number, payload: ChapterRequest) =>
  apiRequest<CourseChapter>(`/api/v1/courses/${courseId}/chapters`, {
    method: "POST",
    body: JSON.stringify(payload)
  });

export const updateChapter = (id: number, payload: ChapterRequest) =>
  apiRequest<CourseChapter>(`/api/v1/chapters/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });

export const deleteChapter = (id: number) =>
  apiRequest<void>(`/api/v1/chapters/${id}`, {
    method: "DELETE"
  });

export const getSections = (type?: CourseSectionType) =>
  apiRequest<CourseSection[]>(`/api/v1/sections${type ? `?type=${type}` : ""}`);

export const createSection = (chapterId: number, payload: SectionRequest) =>
  apiRequest<CourseSection>(`/api/v1/chapters/${chapterId}/sections`, {
    method: "POST",
    body: JSON.stringify(payload)
  });

export const updateSection = (id: number, payload: SectionRequest) =>
  apiRequest<CourseSection>(`/api/v1/sections/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });

export const deleteSection = (id: number) =>
  apiRequest<void>(`/api/v1/sections/${id}`, {
    method: "DELETE"
  });

export const getLessons = () => apiRequest<CourseLesson[]>("/api/v1/lessons");

export const createLesson = (sectionId: number, payload: LessonRequest) =>
  apiRequest<CourseLesson>(`/api/v1/sections/${sectionId}/lessons`, {
    method: "POST",
    body: JSON.stringify(payload)
  });

export const updateLesson = (id: number, payload: LessonRequest) =>
  apiRequest<CourseLesson>(`/api/v1/lessons/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });

export const deleteLesson = (id: number) =>
  apiRequest<void>(`/api/v1/lessons/${id}`, {
    method: "DELETE"
  });
