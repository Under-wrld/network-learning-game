import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaPg } from "@prisma/adapter-pg";
import { config as loadEnv } from "dotenv";
import { PrismaClient } from "../generated/prisma/client.js";

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

async function main(): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const course = await tx.course.upsert({
      where: { slug: "redes-de-computadoras-i" },
      update: {},
      create: {
        slug: "redes-de-computadoras-i",
        title: "Redes de Computadoras I",
        description: "Curso alineado a Computer Networks, 5th Edition (Tanenbaum & Wetherall).",
        order: 1,
        isPublished: false,
      },
    });

    for (const chapter of TANENBAUM_CHAPTERS) {
      await tx.chapter.upsert({
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
    }
  });
}

main()
  .then(async () => {
    console.log("Seed completado: curso base + 8 capítulos de Tanenbaum.");
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error("Seed falló:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
