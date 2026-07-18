export interface Lab {
  id: string;
  levelId: string;
  title: string;
  description: string;
  simulatorKey: string;
  initialState: Record<string, unknown>;
  maxXp: number;
}
