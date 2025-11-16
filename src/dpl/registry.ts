import { DuctCalcWithMeta } from "./types";
import { A7A_registration } from "./ducts/A7A";
import { A7B_calc } from "./ducts/A7B";
import { A7C_calc } from "./ducts/A7C";
import { A7D_calc } from "./ducts/A7D";
import { A7E_calc } from "./ducts/A7E";
import { A7F_calc } from "./ducts/A7F";
import { A7G_calc } from "./ducts/A7G";
import { A7I_calc } from "./ducts/A7I";
import { A7J_calc } from "./ducts/A7J";
import { A7K_calc } from "./ducts/A7K";
import { A8A_calc } from "./ducts/A8A";
import { A8B_calc } from "./ducts/A8B";
import { A8C_calc } from "./ducts/A8C";
import { A8D_calc } from "./ducts/A8D";

export const ductRegistry: Record<string, DuctCalcWithMeta> = {
  A7A: A7A_registration,
  A7B: { fn: A7B_calc, outputType: "standard" },
  A7C: { fn: A7C_calc, outputType: "standard" },
  A7D: { fn: A7D_calc, outputType: "standard" },
  A7E: { fn: A7E_calc, outputType: "standard" },
  A7F: { fn: A7F_calc, outputType: "standard" },
  A7G: { fn: A7G_calc, outputType: "standard" },
  A7I: { fn: A7I_calc, outputType: "standard" },
  A7J: { fn: A7J_calc, outputType: "standard" },
  A7K: { fn: A7K_calc, outputType: "standard" },
  A8A: { fn: A8A_calc, outputType: "standard" },
  A8B: { fn: A8B_calc, outputType: "standard" },
  A8C: { fn: A8C_calc, outputType: "standard" },
  A8D: { fn: A8D_calc, outputType: "standard" },
  // later: A9..., A15...
};
