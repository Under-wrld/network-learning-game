import Link from "next/link";
import { notFound } from "next/navigation";
import { FlaskConical, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EnrollButton } from "@/components/courses/enroll-button";
import { ApiError } from "@/lib/api/client";
import { serverApiFetch } from "@/lib/api/server";
import type { CourseDetail } from "@/types/course";

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let course: CourseDetail;
  try {
    course = await serverApiFetch<CourseDetail>(`/courses/${slug}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{course.title}</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">{course.description}</p>
        </div>
        <EnrollButton courseSlug={course.slug} />
      </div>

      <div className="space-y-4">
        {course.chapters.map((chapter) => (
          <Card key={chapter.id}>
            <CardHeader>
              <div className="flex items-center gap-2">
                {chapter.tanenbaumChapter && <Badge variant="outline">Cap. {chapter.tanenbaumChapter}</Badge>}
                <CardTitle>{chapter.title}</CardTitle>
              </div>
              <CardDescription>{chapter.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {chapter.levels.length === 0 ? (
                <p className="text-sm text-muted-foreground">Contenido próximamente.</p>
              ) : (
                <ul className="space-y-2">
                  {chapter.levels.map((level) => (
                    <li
                      key={level.id}
                      className="flex items-center justify-between rounded-lg border p-3 text-sm"
                    >
                      <div>
                        <p className="font-medium">{level.title}</p>
                        <p className="text-muted-foreground">{level.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-xp text-xp-foreground">
                          <Sparkles className="size-3" /> {level.xpReward} XP
                        </Badge>
                        {level.labId && (
                          <Link
                            href={`/labs/${level.labId}`}
                            className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
                          >
                            <FlaskConical className="size-4" /> Ir al laboratorio
                          </Link>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
