import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaPg } from "@prisma/adapter-pg";
import { config as loadEnv } from "dotenv";
import { CHAPTER_01_INTRODUCCION } from "../content/chapter-01-introduccion.js";
import type { ChapterContent } from "../content/types.js";
import { Prisma, PrismaClient } from "../generated/prisma/client.js";

// Self-contido: puede ejecutarse tanto vía `prisma migrate dev` (que ya
// cargó .env desde prisma.config.ts) como directamente con `tsx prisma/seed.ts`.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(__dirname, "../../../.env") });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL no está definido. Completa el .env de la raíz antes de sembrar.");
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

// Contenido curricular real (CLAUDE.md §6, referencia Tanenbaum) — no inventado.
const TANENBAUM_CHAPTERS = [
  {
    order: 1,
    tanenbaumChapter: 1,
    title: "Introducción",
    description: "Usos de redes, taxonomías de hardware/software, el modelo OSI vs. TCP/IP.",
  },
  {
    order: 2,
    tanenbaumChapter: 2,
    title: "Capa Física",
    description: "Análisis de Fourier, medios guiados, medios inalámbricos, PSTN, conmutación, DSL, FTTH.",
  },
  {
    order: 3,
    tanenbaumChapter: 3,
    title: "Capa de Enlace de Datos",
    description: "Framing, detección y corrección de errores (CRC, Hamming), protocolos de ventana deslizante.",
  },
  {
    order: 4,
    tanenbaumChapter: 4,
    title: "Subcapa de Acceso al Medio (MAC)",
    description: "Ethernet 802.3 clásico y conmutado, Wi-Fi 802.11, switching, VLANs.",
  },
  {
    order: 5,
    tanenbaumChapter: 5,
    title: "Capa de Red",
    description: "Conmutación de paquetes, algoritmos de enrutamiento, OSPF, BGP, IPv4/IPv6, subnetting, ICMP.",
  },
  {
    order: 6,
    tanenbaumChapter: 6,
    title: "Capa de Transporte",
    description: "API de sockets, UDP, RPC, estructura de segmentos TCP, gestión de conexión, control de congestión.",
  },
  {
    order: 7,
    tanenbaumChapter: 7,
    title: "Capa de Aplicación",
    description: "DNS, correo SMTP/IMAP, HTTP/HTTPS, streaming, CDNs, arquitecturas P2P.",
  },
  {
    order: 8,
    tanenbaumChapter: 8,
    title: "Seguridad en Redes",
    description: "Criptografía AES/RSA, firmas digitales, IPSec, firewalls, VPNs, TLS/SSL.",
  },
] as const;

// Ejercicio VLSM de referencia — verificado por los tests de
// packages/simulations/test/vlsm/validator.test.ts (solución conocida:
// /25, /26, /27, /30 sin solapamiento dentro de 192.168.1.0/24).
const VLSM_EXERCISE = {
  baseNetwork: "192.168.1.0/24",
  requirements: [
    { id: "ventas", label: "Ventas", hostsNeeded: 100 },
    { id: "ingenieria", label: "Ingeniería", hostsNeeded: 50 },
    { id: "contabilidad", label: "Contabilidad", hostsNeeded: 25 },
    { id: "enlace-ab", label: "Enlace Router A-B", hostsNeeded: 2 },
  ],
};

/**
 * Siembra un capítulo de contenido gamificado completo: un Level por
 * sub-tema (con su lectura en `content` + su mini-quiz como Assessment) más
 * un Level final para el Boss Battle. `Assessment` no tiene una unique
 * constraint natural (a diferencia de Level, que sí la tiene en
 * `[chapterId, order]`), así que se resuelve con find-then-branch — mismo
 * patrón que ya usa este archivo para Lab más abajo.
 */
async function seedChapterContent(
  tx: Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0],
  chapterId: string,
  chapterContent: ChapterContent,
): Promise<void> {
  async function upsertQuizAssessment(
    levelId: string,
    data: { title: string; questions: Prisma.InputJsonValue; passingScore: number; maxXp: number },
  ): Promise<void> {
    const existing = await tx.assessment.findFirst({ where: { levelId, type: "QUIZ" } });
    if (existing) {
      await tx.assessment.update({ where: { id: existing.id }, data });
    } else {
      await tx.assessment.create({ data: { levelId, type: "QUIZ", ...data } });
    }
  }

  for (const levelContent of chapterContent.levels) {
    const readingContent = {
      sections: levelContent.sections,
      realWorldApplication: levelContent.realWorldApplication,
    } as unknown as Prisma.InputJsonValue;

    const level = await tx.level.upsert({
      where: { chapterId_order: { chapterId, order: levelContent.order } },
      update: {
        title: levelContent.title,
        description: levelContent.description,
        xpReward: levelContent.xpReward,
        content: readingContent,
      },
      create: {
        chapterId,
        order: levelContent.order,
        title: levelContent.title,
        description: levelContent.description,
        xpReward: levelContent.xpReward,
        content: readingContent,
      },
    });

    await upsertQuizAssessment(level.id, {
      title: `Mini-Quiz: ${levelContent.title}`,
      questions: levelContent.miniQuiz as unknown as Prisma.InputJsonValue,
      passingScore: 70,
      maxXp: levelContent.xpReward,
    });
  }

  const bossOrder = chapterContent.levels.length + 1;
  const bossLevel = await tx.level.upsert({
    where: { chapterId_order: { chapterId, order: bossOrder } },
    update: {
      title: chapterContent.bossBattle.title,
      description: chapterContent.bossBattle.description,
      xpReward: chapterContent.bossBattle.maxXp,
      content: Prisma.DbNull,
    },
    create: {
      chapterId,
      order: bossOrder,
      title: chapterContent.bossBattle.title,
      description: chapterContent.bossBattle.description,
      xpReward: chapterContent.bossBattle.maxXp,
      content: Prisma.DbNull,
    },
  });

  await upsertQuizAssessment(bossLevel.id, {
    title: chapterContent.bossBattle.title,
    questions: chapterContent.bossBattle.questions as unknown as Prisma.InputJsonValue,
    passingScore: chapterContent.bossBattle.passingScore,
    maxXp: chapterContent.bossBattle.maxXp,
  });
}

async function main(): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const course = await tx.course.upsert({
      where: { slug: "redes-de-computadoras-i" },
      update: { isPublished: true },
      create: {
        slug: "redes-de-computadoras-i",
        title: "Redes de Computadoras I",
        description: "Curso alineado a Computer Networks, 5th Edition (Tanenbaum & Wetherall).",
        order: 1,
        isPublished: true,
      },
    });

    let networkChapterId: string | null = null;
    let introChapterId: string | null = null;

    for (const chapter of TANENBAUM_CHAPTERS) {
      const upserted = await tx.chapter.upsert({
        where: { courseId_order: { courseId: course.id, order: chapter.order } },
        update: {
          title: chapter.title,
          description: chapter.description,
          tanenbaumChapter: chapter.tanenbaumChapter,
        },
        create: {
          courseId: course.id,
          title: chapter.title,
          description: chapter.description,
          tanenbaumChapter: chapter.tanenbaumChapter,
          order: chapter.order,
        },
      });
      if (chapter.tanenbaumChapter === 5) {
        networkChapterId = upserted.id;
      }
      if (chapter.tanenbaumChapter === 1) {
        introChapterId = upserted.id;
      }
    }

    if (!networkChapterId) {
      throw new Error("No se encontró el capítulo de Capa de Red recién sembrado");
    }
    if (!introChapterId) {
      throw new Error("No se encontró el capítulo de Introducción recién sembrado");
    }

    await seedChapterContent(tx, introChapterId, CHAPTER_01_INTRODUCCION);

    const level = await tx.level.upsert({
      where: { chapterId_order: { chapterId: networkChapterId, order: 1 } },
      update: {},
      create: {
        chapterId: networkChapterId,
        title: "Subnetting con VLSM",
        description:
          "Dado un bloque de direcciones IPv4, dividilo en subredes de tamaño variable (VLSM) que cubran cada requisito de hosts sin desperdiciar direcciones ni solaparse.",
        order: 1,
        xpReward: 150,
      },
    });

    const existingLab = await tx.lab.findFirst({ where: { levelId: level.id, simulatorKey: "vlsm" } });
    if (existingLab) {
      await tx.lab.update({
        where: { id: existingLab.id },
        data: {
          title: "VLSM: red de la sucursal",
          description:
            "Una sucursal necesita 4 subredes con distintos requisitos de hosts. Asigná un bloque CIDR a cada una dentro de 192.168.1.0/24, sin desperdiciar direcciones ni solapar bloques.",
          initialState: VLSM_EXERCISE,
          validationCriteria: { requireExact: true },
          maxXp: 150,
        },
      });
    } else {
      await tx.lab.create({
        data: {
          levelId: level.id,
          title: "VLSM: red de la sucursal",
          description:
            "Una sucursal necesita 4 subredes con distintos requisitos de hosts. Asigná un bloque CIDR a cada una dentro de 192.168.1.0/24, sin desperdiciar direcciones ni solapar bloques.",
          simulatorKey: "vlsm",
          initialState: VLSM_EXERCISE,
          validationCriteria: { requireExact: true },
          maxXp: 150,
        },
      });
    }
  });
}

main()
  .then(async () => {
    console.log(
      "Seed completado: curso base + 8 capítulos de Tanenbaum + laboratorio VLSM + contenido gamificado del Capítulo 1.",
    );
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error("Seed falló:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
