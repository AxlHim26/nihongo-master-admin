import CourseManager from "@/components/modules/course-manager";

type CourseDetailPageProps = {
  params: Promise<{
    courseId: string;
  }>;
};

const parseId = (value: string) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { courseId } = await params;

  return <CourseManager routeCourseId={parseId(courseId)} routeChapterId={null} routeSectionId={null} />;
}
