export const queryKeys = {
  courses: ["courses"] as const,
  chapters: ["chapters"] as const,
  sections: (type?: string) => ["sections", type ?? "all"] as const,
  lessons: ["lessons"] as const,
  users: ["users"] as const
};
