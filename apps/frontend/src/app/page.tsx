import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, FlaskConical, Network, Sparkles, Trophy, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { createClient } from "@/lib/supabase/server";

const FEATURES = [
  {
    icon: FlaskConical,
    title: "Simuladores interactivos",
    description:
      "Practicá VLSM, subnetting y direccionamiento con validación en tiempo real — la misma lógica que corre en el servidor.",
  },
  {
    icon: Sparkles,
    title: "Progresión con XP y rachas",
    description: "Cada laboratorio aprobado suma experiencia real. Subí de nivel y mantené tu racha diaria activa.",
  },
  {
    icon: Users,
    title: "Aulas colaborativas",
    description: "Docentes crean aulas con un código único; los estudiantes se unen y avanzan juntos por el temario.",
  },
  {
    icon: Trophy,
    title: "Ranking global",
    description: "Comparás tu progreso con el resto de la clase o con toda la plataforma, en tiempo real.",
  },
];

const CHAPTERS = [
  "Introducción a redes",
  "Capa Física",
  "Enlace de Datos",
  "Subcapa MAC",
  "Capa de Red",
  "Capa de Transporte",
  "Capa de Aplicación",
  "Seguridad en Redes",
];

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-heading text-base font-semibold tracking-tight">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Network className="size-4" />
            </span>
            Redes I
          </Link>
          <div className="flex items-center gap-2">
            <Button nativeButton={false} render={<Link href="/login" />} variant="ghost" size="sm">
              Iniciar sesión
            </Button>
            <Button nativeButton={false} render={<Link href="/register" />} size="sm">
              Empezar gratis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mesh-glow overflow-hidden px-4 pt-20 pb-24 sm:px-6 sm:pt-28 sm:pb-32">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <FadeIn>
            <Badge variant="outline" className="mb-6 border-border/80 bg-background/60 px-4 py-1.5 text-muted-foreground backdrop-blur">
              Alineado a Computer Networks, 5th Edition (Tanenbaum &amp; Wetherall)
            </Badge>
          </FadeIn>
          <FadeIn delay={0.08}>
            <h1 className="text-balance text-5xl font-semibold tracking-tight text-foreground sm:text-6xl md:text-7xl">
              Aprendé <span className="text-primary">Redes de Computadoras</span> jugando de verdad
            </h1>
          </FadeIn>
          <FadeIn delay={0.16}>
            <p className="mt-6 max-w-2xl text-lg text-balance text-muted-foreground sm:text-xl">
              Simuladores interactivos, progresión con XP, rachas diarias y rankings — una plataforma pensada para que
              el subnetting, la Capa de Red y el resto del temario se aprendan resolviendo, no memorizando.
            </p>
          </FadeIn>
          <FadeIn delay={0.24}>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button nativeButton={false} render={<Link href="/register" />} size="lg">
                Empezar gratis
              </Button>
              <Button nativeButton={false} render={<Link href="/login" />} variant="outline" size="lg">
                Ya tengo cuenta
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Feature grid */}
      <section className="border-t border-border/60 bg-surface px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Todo lo que necesitás para dominar Redes I</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Cuatro piezas que trabajan juntas para que el aprendizaje se sienta como un juego, no como una obligación.
            </p>
          </FadeIn>

          <StaggerGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <StaggerItem key={feature.title}>
                <Card className="card-hover h-full">
                  <CardHeader>
                    <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <feature.icon className="size-5" />
                    </div>
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                    <CardDescription className="leading-relaxed">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Curriculum preview */}
      <section className="border-t border-border/60 px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
            <FadeIn className="max-w-xl">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">
                <BookOpen className="size-4" />
                Temario completo
              </div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">8 capítulos, un solo hilo conductor</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Desde los fundamentos hasta seguridad en redes, cada capítulo trae niveles con laboratorios prácticos y
                evaluación automática.
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <Button nativeButton={false} render={<Link href="/register" />} variant="outline" size="lg">
                Ver el catálogo completo
              </Button>
            </FadeIn>
          </div>

          <StaggerGroup className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CHAPTERS.map((chapter, index) => (
              <StaggerItem key={chapter}>
                <div className="card-hover flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-sm font-semibold text-muted-foreground">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium">{chapter}</span>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/60 bg-surface px-4 py-20 sm:px-6 sm:py-28">
        <FadeIn className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-3xl border border-border/60 bg-card px-8 py-16 text-center shadow-elevated">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Empezá tu primer laboratorio hoy</h2>
          <p className="max-w-xl text-lg text-muted-foreground">
            Gratis, sin tarjeta de crédito. Registrate y resolvé tu primer ejercicio de VLSM en minutos.
          </p>
          <Button nativeButton={false} render={<Link href="/register" />} size="lg">
            Crear cuenta gratis
          </Button>
        </FadeIn>
      </section>

      <footer className="border-t border-border/60 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Redes I — Plataforma Gamificada</span>
          <span>Alineado a Computer Networks, 5th Edition (Tanenbaum &amp; Wetherall)</span>
        </div>
      </footer>
    </div>
  );
}
