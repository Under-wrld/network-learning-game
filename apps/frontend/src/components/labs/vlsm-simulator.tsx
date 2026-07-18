"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { validateVlsmAllocation, type VlsmExercise } from "@network-learning-game/simulations";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api/client";
import { useLabSessionStore } from "@/store/lab-session.store";
import type { LabAttemptResult } from "@/types/lab";

interface VlsmSimulatorProps {
  labId: string;
  exercise: VlsmExercise;
  maxXp: number;
}

export function VlsmSimulator({ labId, exercise, maxXp }: VlsmSimulatorProps) {
  const { allocations, setAllocation, toAnswer, reset } = useLabSessionStore();
  const [result, setResult] = useState<LabAttemptResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Evita que el borrador de un lab anterior se filtre a este.
  useEffect(() => {
    reset();
    setResult(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labId]);

  const liveValidation = useMemo(() => {
    const answer = toAnswer();
    if (answer.length === 0) return null;
    return validateVlsmAllocation(exercise, answer);
  }, [allocations, exercise, toAnswer]);

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const attempt = await apiFetch<LabAttemptResult>(`/labs/${labId}/attempts`, {
        method: "POST",
        body: JSON.stringify(toAnswer()),
      });
      setResult(attempt);
      if (attempt.status === "PASSED") {
        toast.success(attempt.xpAwarded > 0 ? `¡Correcto! +${attempt.xpAwarded} XP` : "¡Correcto de nuevo!");
      } else {
        toast.error("Todavía hay errores en tu asignación.");
      }
    } catch {
      toast.error("No pudimos validar tu intento. Intentá de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader>
          <CardTitle>Red base: {exercise.baseNetwork}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {exercise.requirements.map((requirement) => {
            const fieldError = liveValidation?.errors.find((e) => e.requirementId === requirement.id);
            return (
              <div key={requirement.id} className="space-y-1.5">
                <Label htmlFor={requirement.id}>
                  {requirement.label} <span className="text-muted-foreground">({requirement.hostsNeeded} hosts)</span>
                </Label>
                <Input
                  id={requirement.id}
                  placeholder="p. ej. 192.168.1.0/25"
                  value={allocations[requirement.id] ?? ""}
                  onChange={(event) => setAllocation(requirement.id, event.target.value)}
                  aria-invalid={Boolean(fieldError)}
                />
                {fieldError && <p className="text-sm text-destructive">{fieldError.message}</p>}
              </div>
            );
          })}

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Validando..." : "Enviar"}
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                reset();
                setResult(null);
              }}
            >
              Reiniciar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Recompensa</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-xp px-2.5 py-1 text-sm text-xp-foreground">{maxXp} XP</Badge>
          </CardContent>
        </Card>

        {result && (
          <Alert variant={result.status === "PASSED" ? "default" : "destructive"}>
            {result.status === "PASSED" ? (
              <CheckCircle2 className="size-4 text-success" />
            ) : (
              <XCircle className="size-4" />
            )}
            <AlertTitle>{result.status === "PASSED" ? "¡Laboratorio aprobado!" : "Todavía no"}</AlertTitle>
            <AlertDescription>
              <p>
                Puntaje: {result.score}/100
                {result.xpAwarded > 0 && ` — +${result.xpAwarded} XP`}
              </p>
              {result.errors.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  {result.errors.map((error, index) => (
                    <li key={index}>{error.message}</li>
                  ))}
                </ul>
              )}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
