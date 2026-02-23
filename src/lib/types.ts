export type CourseSectionType = "VOCABULARY" | "GRAMMAR" | "KANJI";

export type ApiResponse<T> = {
  status: number;
  message: string;
  data: T;
  errorCode?: string;
};

export type CourseLesson = {
  id: number;
  sectionId: number;
  title: string;
  videoUrl?: string | null;
  pdfUrl?: string | null;
  lessonOrder: number;
};

export type CourseSection = {
  id: number;
  chapterId: number;
  type: CourseSectionType;
  title: string;
  sectionOrder: number;
  lessons: CourseLesson[];
};

export type CourseChapter = {
  id: number;
  courseId: number;
  title: string;
  description?: string | null;
  chapterOrder: number;
  sections: CourseSection[];
};

export type Course = {
  id: number;
  thumbnailUrl?: string | null;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  chapters: CourseChapter[];
};

export type CourseRequest = {
  thumbnailUrl?: string;
  name: string;
  description?: string;
};

export type ChapterRequest = {
  title: string;
  description?: string;
  chapterOrder?: number;
};

export type SectionRequest = {
  type: CourseSectionType;
  sectionOrder?: number;
};

export type LessonRequest = {
  title: string;
  videoUrl?: string;
  pdfUrl?: string;
  lessonOrder?: number;
};

export type AdminLoginRequest = {
  username: string;
  password: string;
};

export type AdminLoginResponse = {
  token: string;
};

export type AdminRegisterRequest = {
  username: string;
  email: string;
  password: string;
  bootstrapKey: string;
};

export type UserRole = "USER" | "ADMIN";

export type UserAccount = {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserRequest = {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
};
