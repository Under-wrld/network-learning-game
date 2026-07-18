import { Card, CardContent } from "@/components/ui/card";
import { serverApiFetch } from "@/lib/api/server";

interface LeaderboardRow {
  rank: number;
  userId: string;
  displayName: string | null;
  xp: number;
}

export default async function LeaderboardPage() {
  const rows = await serverApiFetch<LeaderboardRow[]>("/leaderboard/global?limit=50");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Ranking global</h1>
        <p className="text-muted-foreground">Los estudiantes con más XP.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Todavía no hay datos.</p>
          ) : (
            <ol>
              {rows.map((row) => (
                <li
                  key={row.userId}
                  className="flex items-center justify-between border-b px-4 py-3 text-sm last:border-b-0"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-6 text-right font-mono text-muted-foreground">{row.rank}</span>
                    <span className="font-medium">{row.displayName ?? "Estudiante"}</span>
                  </span>
                  <span className="font-semibold">{row.xp} XP</span>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
