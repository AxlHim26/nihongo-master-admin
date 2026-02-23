import CourseManager from "@/components/modules/course-manager";

type ChapterDetailPageProps = {
  params: Promise<{
    courseId: string;
    chapterId: string;
  }>;
};

const parseId = (value: string) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export default async function ChapterDetailPage({ params }: ChapterDetailPageProps) {
  const { courseId, chapterId } = await params;

  return (
    <CourseManager
      routeCourseId={parseId(courseId)}
      routeChapterId={parseId(chapterId)}
      routeSectionId={null}
    />
  );
}
