import Link from "next/link";
import { ArrowRight, BookOpen, Network } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { serverApiFetch } from "@/lib/api/server";
import type { CourseSummary } from "@/types/course";

export default async function CoursesPage() {
  const courses = await serverApiFetch<CourseSummary[]>("/courses");

  return (
    <div className="space-y-10">
      <FadeIn>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Cursos</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Alineados a Computer Networks, 5th Edition (Tanenbaum &amp; Wetherall).
        </p>
      </FadeIn>

      <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <StaggerItem key={course.id}>
            <Link href={`/courses/${course.slug}`} className="block h-full">
              <Card className="card-hover h-full overflow-hidden py-0">
                <div className="mesh-glow flex h-32 items-center justify-center bg-primary/8">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-background/80 text-primary shadow-soft backdrop-blur">
                    <Network className="size-6" />
                  </span>
                </div>
                <CardHeader className="pt-5">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <BookOpen className="size-3.5" />
                    {course.chapterCount} capítulos
                  </div>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-5">
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Ver curso <ArrowRight className="size-3.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </div>
  );
}
