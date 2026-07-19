import { notFound } from "next/navigation";
import { VlsmExerciseSchema } from "@network-learning-game/simulations";
import { VlsmSimulator } from "@/components/labs/vlsm-simulator";
import { FadeIn } from "@/components/motion/reveal";
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
    <div className="space-y-8">
      <FadeIn>
        <h1 className="text-3xl font-semibold tracking-tight wrap-break-word sm:text-4xl">{lab.title}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{lab.description}</p>
      </FadeIn>
      <FadeIn delay={0.08}>
        <VlsmSimulator labId={lab.id} exercise={exercise} maxXp={lab.maxXp} />
      </FadeIn>
    </div>
  );
}
