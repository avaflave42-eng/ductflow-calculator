import { DuctCalcWithMeta } from "./types";
import { A7A_registration } from "./ducts/A7A";
import { A7B_calc } from "./ducts/A7B";
import { A7C_calc } from "./ducts/A7C";
import { A7D_calc } from "./ducts/A7D";
import { A7E_calc } from "./ducts/A7E";
import { A7F_calc } from "./ducts/A7F";

export const ductRegistry: Record<string, DuctCalcWithMeta> = {
  A7A: A7A_registration,
  A7B: { fn: A7B_calc, outputType: "standard" },
  A7C: { fn: A7C_calc, outputType: "standard" },
  A7D: { fn: A7D_calc, outputType: "standard" },
  A7E: { fn: A7E_calc, outputType: "standard" },
  A7F: { fn: A7F_calc, outputType: "standard" },
  // later: A8..., A15...
};
