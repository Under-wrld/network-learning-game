import { Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import { serverApiFetch } from "@/lib/api/server";

interface LeaderboardRow {
  rank: number;
  userId: string;
  displayName: string | null;
  xp: number;
}

const RANK_STYLES: Record<number, string> = {
  1: "bg-xp text-xp-foreground",
  2: "bg-muted-foreground/20 text-foreground",
  3: "bg-streak/20 text-streak",
};

export default async function LeaderboardPage() {
  const rows = await serverApiFetch<LeaderboardRow[]>("/leaderboard/global?limit=50");

  return (
    <div className="space-y-10">
      <FadeIn>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Ranking global</h1>
        <p className="mt-2 text-lg text-muted-foreground">Los estudiantes con más XP.</p>
      </FadeIn>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">Todavía no hay datos.</p>
          ) : (
            <StaggerGroup>
              <ol>
                {rows.map((row) => (
                  <StaggerItem key={row.userId}>
                    <li className="flex items-center justify-between border-b border-border/60 px-6 py-4 text-sm transition-colors last:border-b-0 hover:bg-muted/40">
                      <span className="flex items-center gap-4">
                        <span
                          className={cn(
                            "flex size-9 items-center justify-center rounded-full font-mono text-sm font-semibold text-muted-foreground",
                            row.rank <= 3 ? RANK_STYLES[row.rank] : "bg-muted",
                          )}
                        >
                          {row.rank <= 3 ? <Trophy className="size-4" /> : row.rank}
                        </span>
                        <span className="font-medium">{row.displayName ?? "Estudiante"}</span>
                      </span>
                      <span className="font-mono font-semibold tabular-nums">{row.xp} XP</span>
                    </li>
                  </StaggerItem>
                ))}
              </ol>
            </StaggerGroup>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
