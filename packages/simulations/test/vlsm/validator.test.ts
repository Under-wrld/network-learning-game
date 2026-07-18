import { describe, expect, it } from "vitest";
import { validateVlsmAllocation } from "../../src/vlsm/validator.js";
import type { VlsmExercise } from "../../src/vlsm/types.js";

// Ejercicio VLSM clásico de curso: 192.168.1.0/24 repartido por demanda de
// hosts decreciente (Ventas > Ingeniería > Contabilidad > enlace punto a punto).
const exercise: VlsmExercise = {
  baseNetwork: "192.168.1.0/24",
  requirements: [
    { id: "ventas", label: "Ventas", hostsNeeded: 100 },
    { id: "ingenieria", label: "Ingeniería", hostsNeeded: 50 },
    { id: "contabilidad", label: "Contabilidad", hostsNeeded: 25 },
    { id: "enlace-ab", label: "Enlace Router A-B", hostsNeeded: 2 },
  ],
};

// Solución de referencia: /25, /26, /27, /30 asignados sin solapamiento.
const correctAnswer = [
  { requirementId: "ventas", cidr: "192.168.1.0/25" },
  { requirementId: "ingenieria", cidr: "192.168.1.128/26" },
  { requirementId: "contabilidad", cidr: "192.168.1.192/27" },
  { requirementId: "enlace-ab", cidr: "192.168.1.224/30" },
];

describe("validateVlsmAllocation — asignación correcta", () => {
  it("acepta la solución de referencia con score 100", () => {
    const result = validateVlsmAllocation(exercise, correctAnswer);
    expect(result.correct).toBe(true);
    expect(result.score).toBe(100);
    expect(result.errors).toEqual([]);
  });

  it("acepta un orden de asignación distinto para los mismos bloques", () => {
    const shuffled = [...correctAnswer].reverse();
    const result = validateVlsmAllocation(exercise, shuffled);
    expect(result.correct).toBe(true);
  });
});

describe("validateVlsmAllocation — errores de cobertura", () => {
  it("reporta MISSING cuando falta un requisito", () => {
    const answer = correctAnswer.filter((a) => a.requirementId !== "enlace-ab");
    const result = validateVlsmAllocation(exercise, answer);
    expect(result.correct).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ requirementId: "enlace-ab", code: "MISSING" }),
    );
  });

  it("reporta UNKNOWN_REQUIREMENT para un id que no existe en el ejercicio", () => {
    const answer = [...correctAnswer, { requirementId: "inventado", cidr: "10.0.0.0/24" }];
    const result = validateVlsmAllocation(exercise, answer);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ requirementId: "inventado", code: "UNKNOWN_REQUIREMENT" }),
    );
  });

  it("reporta DUPLICATE cuando un requisito se asigna dos veces", () => {
    const answer = [...correctAnswer, { requirementId: "ventas", cidr: "192.168.1.0/25" }];
    const result = validateVlsmAllocation(exercise, answer);
    expect(result.errors).toContainEqual(expect.objectContaining({ requirementId: "ventas", code: "DUPLICATE" }));
  });
});

describe("validateVlsmAllocation — errores de mecánica de subnetting", () => {
  it("reporta INVALID_CIDR para un CIDR mal formado", () => {
    const answer = correctAnswer.map((a) => (a.requirementId === "ventas" ? { ...a, cidr: "no-es-un-cidr" } : a));
    const result = validateVlsmAllocation(exercise, answer);
    expect(result.errors).toContainEqual(expect.objectContaining({ requirementId: "ventas", code: "INVALID_CIDR" }));
  });

  it("reporta NOT_NETWORK_ADDRESS si el CIDR no es la dirección de red del bloque", () => {
    const answer = correctAnswer.map((a) => (a.requirementId === "ventas" ? { ...a, cidr: "192.168.1.5/25" } : a));
    const result = validateVlsmAllocation(exercise, answer);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ requirementId: "ventas", code: "NOT_NETWORK_ADDRESS" }),
    );
  });

  it("reporta OUTSIDE_BASE_NETWORK si el bloque cae fuera de la red base", () => {
    const answer = correctAnswer.map((a) => (a.requirementId === "ventas" ? { ...a, cidr: "192.168.2.0/25" } : a));
    const result = validateVlsmAllocation(exercise, answer);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ requirementId: "ventas", code: "OUTSIDE_BASE_NETWORK" }),
    );
  });

  it("reporta INSUFFICIENT_HOSTS si el bloque es demasiado chico para el requisito", () => {
    // Ventas necesita 100 hosts; un /27 solo da 30 utilizables.
    const answer = correctAnswer.map((a) => (a.requirementId === "ventas" ? { ...a, cidr: "192.168.1.0/27" } : a));
    const result = validateVlsmAllocation(exercise, answer);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ requirementId: "ventas", code: "INSUFFICIENT_HOSTS" }),
    );
  });

  it("reporta OVERLAP cuando dos bloques válidos se superponen", () => {
    const answer = correctAnswer.map((a) =>
      a.requirementId === "ingenieria" ? { ...a, cidr: "192.168.1.64/26" } : a,
    );
    // 192.168.1.64/26 cubre 64-127, superpuesto con ventas (192.168.1.0/25 = 0-127).
    const result = validateVlsmAllocation(exercise, answer);
    expect(result.correct).toBe(false);
    expect(result.errors.some((e) => e.code === "OVERLAP")).toBe(true);
  });
});

describe("validateVlsmAllocation — puntaje parcial", () => {
  it("da crédito proporcional a las asignaciones mecánicamente válidas", () => {
    // 3 de 4 correctas, 1 con hosts insuficientes.
    const answer = correctAnswer.map((a) => (a.requirementId === "contabilidad" ? { ...a, cidr: "192.168.1.192/29" } : a));
    const result = validateVlsmAllocation(exercise, answer);
    expect(result.correct).toBe(false);
    expect(result.score).toBe(75);
  });
});
