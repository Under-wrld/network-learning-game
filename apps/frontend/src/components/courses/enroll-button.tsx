"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/api/client";

interface EnrollButtonProps {
  courseSlug: string;
}

export function EnrollButton({ courseSlug }: EnrollButtonProps) {
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleEnroll() {
    setIsSubmitting(true);
    try {
      await apiFetch(`/courses/${courseSlug}/enroll`, { method: "POST" });
      setIsEnrolled(true);
      toast.success("¡Te inscribiste al curso!");
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setIsEnrolled(true);
      } else {
        toast.error("No pudimos completar la inscripción. Intentá de nuevo.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isEnrolled) {
    return (
      <Button disabled variant="secondary">
        Ya estás inscrito
      </Button>
    );
  }

  return (
    <Button onClick={handleEnroll} disabled={isSubmitting}>
      {isSubmitting ? "Inscribiendo..." : "Inscribirme"}
    </Button>
  );
}
