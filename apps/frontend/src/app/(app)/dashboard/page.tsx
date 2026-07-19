import Link from "next/link";
import { ArrowRight, Flame, Sparkles, TrendingUp } from "lucide-react";
import { type UserProfile, xpToNextLevel } from "@network-learning-game/shared";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { serverApiFetch } from "@/lib/api/server";

export default async function DashboardPage() {
  const profile = await serverApiFetch<UserProfile>("/users/me");
  const progress = xpToNextLevel(profile.totalXp);
  const progressPct =
    progress.xpForNextLevel > 0 ? Math.round((progress.xpIntoLevel / progress.xpForNextLevel) * 100) : 100;

  return (
    <div className="space-y-10">
      <FadeIn>
        <h1 className="text-3xl font-semibold tracking-tight wrap-break-word sm:text-4xl">
          Hola, {profile.displayName ?? profile.email}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">Seguí sumando XP para subir de nivel.</p>
      </FadeIn>

      <StaggerGroup className="grid gap-5 sm:grid-cols-3">
        <StaggerItem>
          <Card className="card-hover h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Nivel</CardTitle>
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <TrendingUp className="size-4" />
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold tracking-tight">{profile.level}</p>
              <Progress value={progressPct} className="mt-4" />
              <p className="mt-2 text-xs text-muted-foreground">
                {progress.xpIntoLevel} / {progress.xpForNextLevel} XP para el nivel {profile.level + 1}
              </p>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card className="card-hover h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">XP total</CardTitle>
                <span className="flex size-9 items-center justify-center rounded-xl bg-xp/20 text-xp-foreground">
                  <Sparkles className="size-4" />
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold tracking-tight">{profile.totalXp}</p>
              <Badge data-testid="total-xp-badge" className="mt-4 bg-xp text-xp-foreground">
                {profile.totalXp} XP
              </Badge>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card className="card-hover h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Racha</CardTitle>
                <span className="flex size-9 items-center justify-center rounded-xl bg-streak/15 text-streak">
                  <Flame className="size-4" />
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold tracking-tight text-streak">
                {profile.currentStreak} <span className="text-lg font-medium text-muted-foreground">{profile.currentStreak === 1 ? "día" : "días"}</span>
              </p>
              <p className="mt-4 text-xs text-muted-foreground">Récord: {profile.longestStreak} días</p>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerGroup>

      <FadeIn delay={0.1}>
        <Link
          href="/courses"
          className="card-hover group flex items-center justify-between rounded-2xl border border-border/60 bg-card p-6 shadow-soft"
        >
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Seguí aprendiendo</h2>
            <p className="mt-1 text-sm text-muted-foreground">Explorá el catálogo y continuá donde lo dejaste.</p>
          </div>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-300 group-hover:translate-x-1">
            <ArrowRight className="size-4" />
          </span>
        </Link>
      </FadeIn>
    </div>
  );
}
