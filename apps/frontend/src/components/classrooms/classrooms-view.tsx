"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Users } from "lucide-react";
import { z } from "zod";
import { CreateClassroomSchema, JoinClassroomSchema, type Role } from "@network-learning-game/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { apiFetch } from "@/lib/api/client";

interface ClassroomSummary {
  id: string;
  name: string;
  joinCode: string;
  teacherId: string;
  memberCount: number;
}

interface ClassroomsViewProps {
  role: Role;
  classrooms: ClassroomSummary[];
}

type CreateForm = z.infer<typeof CreateClassroomSchema>;
type JoinForm = z.infer<typeof JoinClassroomSchema>;

export function ClassroomsView({ role, classrooms: initialClassrooms }: ClassroomsViewProps) {
  const [classrooms, setClassrooms] = useState(initialClassrooms);

  const createForm = useForm<CreateForm>({ resolver: zodResolver(CreateClassroomSchema) });
  const joinForm = useForm<JoinForm>({ resolver: zodResolver(JoinClassroomSchema) });

  async function onCreate(values: CreateForm) {
    try {
      const classroom = await apiFetch<ClassroomSummary>("/classrooms", {
        method: "POST",
        body: JSON.stringify(values),
      });
      setClassrooms((prev) => [classroom, ...prev]);
      createForm.reset();
      toast.success(`Aula "${classroom.name}" creada — código ${classroom.joinCode}`);
    } catch {
      toast.error("No pudimos crear el aula.");
    }
  }

  async function onJoin(values: JoinForm) {
    try {
      const classroom = await apiFetch<ClassroomSummary>("/classrooms/join", {
        method: "POST",
        body: JSON.stringify(values),
      });
      setClassrooms((prev) => [classroom, ...prev]);
      joinForm.reset();
      toast.success(`Te uniste a "${classroom.name}"`);
    } catch {
      toast.error("Código de aula inválido o ya sos miembro.");
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Aulas</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {role === "TEACHER" ? "Creá un aula y compartí el código con tus estudiantes." : "Unite a un aula con el código que te compartió tu docente."}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {role === "TEACHER" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Crear aula</CardTitle>
              <CardDescription>Genera un código único para que tus estudiantes se unan.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createForm.handleSubmit(onCreate)} className="flex flex-col gap-3 sm:flex-row" noValidate>
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="classroom-name">Nombre</Label>
                  <Input id="classroom-name" placeholder="Redes I - Comisión A" {...createForm.register("name")} />
                  {createForm.formState.errors.name && (
                    <p className="text-sm text-destructive">{createForm.formState.errors.name.message}</p>
                  )}
                </div>
                <Button type="submit" className="sm:self-end" disabled={createForm.formState.isSubmitting}>
                  Crear
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Unirme a un aula</CardTitle>
            <CardDescription>Ingresá el código que te compartieron.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={joinForm.handleSubmit(onJoin)} className="flex flex-col gap-3 sm:flex-row" noValidate>
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="join-code">Código</Label>
                <Input id="join-code" placeholder="ABC123" className="font-mono uppercase" {...joinForm.register("joinCode")} />
                {joinForm.formState.errors.joinCode && (
                  <p className="text-sm text-destructive">{joinForm.formState.errors.joinCode.message}</p>
                )}
              </div>
              <Button type="submit" className="sm:self-end" disabled={joinForm.formState.isSubmitting}>
                Unirme
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">
          {role === "TEACHER" ? "Aulas que dictás" : "Tus aulas"}
        </h2>
        {classrooms.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no tenés aulas.</p>
        ) : (
          <StaggerGroup className="grid gap-4 sm:grid-cols-2">
            {classrooms.map((classroom) => (
              <StaggerItem key={classroom.id}>
                <Card className="card-hover">
                  <CardHeader>
                    <div className="mb-1 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Users className="size-4.5" />
                    </div>
                    <CardTitle className="text-base">{classroom.name}</CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-x-2">
                      <span>
                        Código: <span className="font-mono font-semibold text-foreground">{classroom.joinCode}</span>
                      </span>
                      <span>
                        · {classroom.memberCount} {classroom.memberCount === 1 ? "miembro" : "miembros"}
                      </span>
                    </CardDescription>
                  </CardHeader>
                </Card>
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </div>
    </div>
  );
}
