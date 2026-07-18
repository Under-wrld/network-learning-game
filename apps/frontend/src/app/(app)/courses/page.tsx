import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { serverApiFetch } from "@/lib/api/server";
import type { CourseSummary } from "@/types/course";

export default async function CoursesPage() {
  const courses = await serverApiFetch<CourseSummary[]>("/courses");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Cursos</h1>
        <p className="text-muted-foreground">Alineados a Computer Networks, 5th Edition (Tanenbaum &amp; Wetherall).</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {courses.map((course) => (
          <Link key={course.id} href={`/courses/${course.slug}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="size-4" />
                  <span className="text-xs">{course.chapterCount} capítulos</span>
                </div>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
