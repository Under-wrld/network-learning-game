import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-4 text-center">
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight">
        Aprendé <span className="text-primary">Redes de Computadoras I</span> jugando
      </h1>
      <p className="max-w-xl text-muted-foreground">
        Simuladores interactivos, XP, rachas y rankings — alineado a Computer Networks, 5th Edition (Tanenbaum &amp;
        Wetherall).
      </p>
      <div className="flex gap-3">
        <Button render={<Link href="/register" />} size="lg">
          Empezar gratis
        </Button>
        <Button render={<Link href="/login" />} variant="outline" size="lg">
          Ya tengo cuenta
        </Button>
      </div>
    </div>
  );
}
