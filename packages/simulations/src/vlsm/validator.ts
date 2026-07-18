import {
  broadcastAddress,
  doCidrsOverlap,
  isIpInCidr,
  isValidCidr,
  networkAddress,
  parseCidr,
  usableHostCount,
} from "@network-learning-game/shared";
import type { VlsmAllocation, VlsmExercise, VlsmValidationError, VlsmValidationResult } from "./types.js";

/** ¿El bloque `inner` está completamente contenido dentro de `outer`? */
function isCidrWithinBase(inner: string, outer: string): boolean {
  const innerParsed = parseCidr(inner);
  const outerParsed = parseCidr(outer);
  if (innerParsed.prefixLength < outerParsed.prefixLength) return false;
  return isIpInCidr(networkAddress(inner), outer) && isIpInCidr(broadcastAddress(inner), outer);
}

/**
 * Motor determinista de validación VLSM/subnetting (Capa de Red, Tanenbaum
 * cap. 5). Puro y sin efectos secundarios: se usa tanto para feedback en
 * vivo en el frontend como para la validación server-side autoritativa
 * (apps/backend, módulo Simulator Engine) — ver ARCHITECTURE.md §4.
 */
export function validateVlsmAllocation(exercise: VlsmExercise, answer: VlsmAllocation[]): VlsmValidationResult {
  const errors: VlsmValidationError[] = [];
  const requirementIds = new Set(exercise.requirements.map((requirement) => requirement.id));
  const answeredIds = new Set(answer.map((allocation) => allocation.requirementId));

  for (const requirement of exercise.requirements) {
    if (!answeredIds.has(requirement.id)) {
      errors.push({
        requirementId: requirement.id,
        code: "MISSING",
        message: `Falta asignar una subred para "${requirement.label}"`,
      });
    }
  }

  const seenIds = new Set<string>();
  const validCidrByRequirement = new Map<string, string>();

  for (const allocation of answer) {
    if (!requirementIds.has(allocation.requirementId)) {
      errors.push({
        requirementId: allocation.requirementId,
        code: "UNKNOWN_REQUIREMENT",
        message: `"${allocation.requirementId}" no es un requisito de este ejercicio`,
      });
      continue;
    }
    if (seenIds.has(allocation.requirementId)) {
      errors.push({
        requirementId: allocation.requirementId,
        code: "DUPLICATE",
        message: `Asignaste más de una subred a "${allocation.requirementId}"`,
      });
      continue;
    }
    seenIds.add(allocation.requirementId);

    const requirement = exercise.requirements.find((r) => r.id === allocation.requirementId);
    if (!requirement) continue;

    if (!isValidCidr(allocation.cidr)) {
      errors.push({
        requirementId: allocation.requirementId,
        code: "INVALID_CIDR",
        message: `"${allocation.cidr}" no es un CIDR válido`,
      });
      continue;
    }

    const parsed = parseCidr(allocation.cidr);
    const correctNetworkAddress = networkAddress(allocation.cidr);
    if (parsed.address !== correctNetworkAddress) {
      errors.push({
        requirementId: allocation.requirementId,
        code: "NOT_NETWORK_ADDRESS",
        message: `"${allocation.cidr}" no es una dirección de red; la dirección de red de ese bloque es ${correctNetworkAddress}/${parsed.prefixLength}`,
      });
      continue;
    }

    if (!isCidrWithinBase(allocation.cidr, exercise.baseNetwork)) {
      errors.push({
        requirementId: allocation.requirementId,
        code: "OUTSIDE_BASE_NETWORK",
        message: `"${allocation.cidr}" no está contenido dentro de ${exercise.baseNetwork}`,
      });
      continue;
    }

    const usable = usableHostCount(parsed.prefixLength);
    if (usable < requirement.hostsNeeded) {
      errors.push({
        requirementId: allocation.requirementId,
        code: "INSUFFICIENT_HOSTS",
        message: `"${requirement.label}" necesita ${requirement.hostsNeeded} hosts, pero /${parsed.prefixLength} solo permite ${usable}`,
      });
      continue;
    }

    validCidrByRequirement.set(allocation.requirementId, allocation.cidr);
  }

  const validEntries = [...validCidrByRequirement.entries()];
  for (let i = 0; i < validEntries.length; i++) {
    for (let j = i + 1; j < validEntries.length; j++) {
      const [idA, cidrA] = validEntries[i]!;
      const [idB, cidrB] = validEntries[j]!;
      if (doCidrsOverlap(cidrA, cidrB)) {
        errors.push({ code: "OVERLAP", message: `Las subredes de "${idA}" y "${idB}" se superponen` });
      }
    }
  }

  const correct = errors.length === 0 && answeredIds.size === requirementIds.size;
  const score = correct
    ? 100
    : Math.round((validCidrByRequirement.size / exercise.requirements.length) * 100);

  return { correct, score, errors };
}
