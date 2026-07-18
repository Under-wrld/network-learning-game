import { create } from "zustand";
import type { VlsmAllocation } from "@network-learning-game/simulations";

/**
 * Estado transitorio del laboratorio en curso (ARCHITECTURE.md §3: "Zustand
 * — sesión de laboratorio en curso, UI transitoria"). Nunca persiste al
 * backend hasta que el estudiante envía el intento.
 */
interface LabSessionState {
  allocations: Record<string, string>;
  setAllocation: (requirementId: string, cidr: string) => void;
  reset: () => void;
  toAnswer: () => VlsmAllocation[];
}

export const useLabSessionStore = create<LabSessionState>((set, get) => ({
  allocations: {},
  setAllocation: (requirementId, cidr) =>
    set((state) => ({ allocations: { ...state.allocations, [requirementId]: cidr } })),
  reset: () => set({ allocations: {} }),
  toAnswer: () =>
    Object.entries(get().allocations)
      .filter(([, cidr]) => cidr.trim().length > 0)
      .map(([requirementId, cidr]) => ({ requirementId, cidr: cidr.trim() })),
}));
