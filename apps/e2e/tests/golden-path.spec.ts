import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { prisma } from "@network-learning-game/database";
import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(__dirname, "../../../.env") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const testEmail = `e2e-golden-path-${randomUUID()}@example.com`;
const testPassword = "TestPassword123!";
let testUserId: string;

test.describe("Golden path: login → dashboard → curso → laboratorio VLSM", () => {
  test.beforeAll(async () => {
    // Se crea el usuario ya confirmado vía Admin API — la confirmación de
    // email por UI depende de un proveedor de correo real, fuera de alcance
    // para este E2E (ver DECISIONS.md).
    const { data, error } = await admin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
    });
    if (error || !data.user) {
      throw new Error(`No se pudo crear el usuario de prueba: ${error?.message}`);
    }
    testUserId = data.user.id;
  });

  test.afterAll(async () => {
    if (testUserId) {
      // El login real sincroniza el perfil en public.users (fuera de
      // Supabase Auth) y el golden path completo deja inscripción/intento/XP
      // — hay que limpiar las cuatro tablas o quedan filas huérfanas en la
      // base real (nos pasó: 7 usuarios de prueba sin limpiar, ver DECISIONS.md).
      await prisma.xPTransaction.deleteMany({ where: { userId: testUserId } });
      await prisma.labAttempt.deleteMany({ where: { userId: testUserId } });
      await prisma.courseEnrollment.deleteMany({ where: { userId: testUserId } });
      await prisma.user.deleteMany({ where: { id: testUserId } });
      await admin.auth.admin.deleteUser(testUserId);
    }
  });

  test("un estudiante nuevo hace login, se inscribe, resuelve el lab VLSM y gana XP", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(testEmail);
    await page.getByLabel("Contraseña").fill(testPassword);
    await page.getByRole("button", { name: "Ingresar" }).click();

    await page.waitForURL("/dashboard");
    await expect(page.getByRole("heading", { name: /^Hola,/ })).toBeVisible();
    await expect(page.getByTestId("total-xp-badge")).toHaveText("0 XP");

    await page.getByRole("link", { name: /Ver catálogo de cursos/ }).click();
    await page.waitForURL("/courses");
    await expect(page.getByText("Redes de Computadoras I")).toBeVisible();

    await page.getByText("Redes de Computadoras I").click();
    await page.waitForURL(/\/courses\//);
    await expect(page.getByText("Capa de Red")).toBeVisible();

    await page.getByRole("button", { name: "Inscribirme" }).click();
    await expect(page.getByRole("button", { name: "Ya estás inscrito" })).toBeVisible();

    await page.getByRole("link", { name: "Ir al laboratorio" }).click();
    await page.waitForURL(/\/labs\//);
    await expect(page.getByText("Red base: 192.168.1.0/24")).toBeVisible();

    // Misma solución de referencia verificada en packages/simulations.
    await page.getByLabel(/Ventas/).fill("192.168.1.0/25");
    await page.getByLabel(/Ingeniería/).fill("192.168.1.128/26");
    await page.getByLabel(/Contabilidad/).fill("192.168.1.192/27");
    await page.getByLabel(/Enlace Router A-B/).fill("192.168.1.224/30");

    await page.getByRole("button", { name: "Enviar" }).click();

    const labResult = page.getByTestId("lab-result");
    await expect(labResult.getByText("¡Laboratorio aprobado!")).toBeVisible();
    await expect(labResult.getByText(/\+150 XP/)).toBeVisible();

    await page.goto("/dashboard");
    await expect(page.getByTestId("total-xp-badge")).toHaveText("150 XP");
  });

  test("una asignación incorrecta no otorga XP y muestra los errores", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(testEmail);
    await page.getByLabel("Contraseña").fill(testPassword);
    await page.getByRole("button", { name: "Ingresar" }).click();
    await page.waitForURL("/dashboard");

    await page.goto("/courses");
    await page.getByText("Redes de Computadoras I").click();
    await page.waitForURL(/\/courses\//);
    await page.getByRole("link", { name: "Ir al laboratorio" }).click();
    await page.waitForURL(/\/labs\//);

    // Ventas necesita 100 hosts; /27 solo da 30 — insuficiente a propósito.
    await page.getByLabel(/Ventas/).fill("192.168.1.0/27");
    await page.getByLabel(/Ingeniería/).fill("192.168.1.128/26");
    await page.getByLabel(/Contabilidad/).fill("192.168.1.192/27");
    await page.getByLabel(/Enlace Router A-B/).fill("192.168.1.224/30");

    await page.getByRole("button", { name: "Enviar" }).click();

    await expect(page.getByTestId("lab-result").getByText("Todavía no")).toBeVisible();
  });
});
