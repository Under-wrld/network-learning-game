import Link from "next/link";
import { type UserProfile, xpToNextLevel } from "@network-learning-game/shared";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { serverApiFetch } from "@/lib/api/server";

export default async function DashboardPage() {
  const profile = await serverApiFetch<UserProfile>("/users/me");
  const progress = xpToNextLevel(profile.totalXp);
  const progressPct =
    progress.xpForNextLevel > 0 ? Math.round((progress.xpIntoLevel / progress.xpForNextLevel) * 100) : 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Hola, {profile.displayName ?? profile.email}</h1>
        <p className="text-muted-foreground">Seguí sumando XP para subir de nivel.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Nivel</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{profile.level}</p>
            <Progress value={progressPct} className="mt-3" />
            <p className="mt-1 text-xs text-muted-foreground">
              {progress.xpIntoLevel} / {progress.xpForNextLevel} XP para el nivel {profile.level + 1}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">XP total</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-xp px-2.5 py-1 text-sm text-xp-foreground">{profile.totalXp} XP</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Racha</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-streak">
              {profile.currentStreak} {profile.currentStreak === 1 ? "día" : "días"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Récord: {profile.longestStreak} días</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium">Seguí aprendiendo</h2>
        <Link href="/courses" className="text-sm text-primary underline-offset-4 hover:underline">
          Ver catálogo de cursos →
        </Link>
      </div>
    </div>
  );
}
