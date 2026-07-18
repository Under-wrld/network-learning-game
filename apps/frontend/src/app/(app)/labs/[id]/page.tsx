import { notFound } from "next/navigation";
import { VlsmExerciseSchema } from "@network-learning-game/simulations";
import { VlsmSimulator } from "@/components/labs/vlsm-simulator";
import { ApiError } from "@/lib/api/client";
import { serverApiFetch } from "@/lib/api/server";
import type { Lab } from "@/types/lab";

export default async function LabPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let lab: Lab;
  try {
    lab = await serverApiFetch<Lab>(`/labs/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  if (lab.simulatorKey !== "vlsm") {
    // Único motor implementado hoy (ver DECISIONS.md); otros simuladores quedan en backlog.
    notFound();
  }

  const exercise = VlsmExerciseSchema.parse(lab.initialState);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{lab.title}</h1>
        <p className="mt-1 text-muted-foreground">{lab.description}</p>
      </div>
      <VlsmSimulator labId={lab.id} exercise={exercise} maxXp={lab.maxXp} />
    </div>
  );
}
