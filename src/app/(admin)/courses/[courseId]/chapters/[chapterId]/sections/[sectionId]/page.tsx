import CourseManager from "@/components/modules/course-manager";

type SectionDetailPageProps = {
  params: Promise<{
    courseId: string;
    chapterId: string;
    sectionId: string;
  }>;
};

const parseId = (value: string) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export default async function SectionDetailPage({ params }: SectionDetailPageProps) {
  const { courseId, chapterId, sectionId } = await params;

  return (
    <CourseManager
      routeCourseId={parseId(courseId)}
      routeChapterId={parseId(chapterId)}
      routeSectionId={parseId(sectionId)}
    />
  );
}
