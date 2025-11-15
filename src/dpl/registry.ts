import { DuctCalcWithMeta } from "./types";
import { A7A_registration } from "./ducts/A7A";

export const ductRegistry: Record<string, DuctCalcWithMeta> = {
  A7A: A7A_registration,
  // later: A7B, A7C, A8..., A15...
};
