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
import { A8E_calc } from "./ducts/A8E";
import { A8F_calc } from "./ducts/A8F";
import { A8G_calc } from "./ducts/A8G";
import { A8H_calc } from "./ducts/A8H";
import { A8I_calc } from "./ducts/A8I";
import { A8J_calc } from "./ducts/A8J";
import { A9A1_calc } from "./ducts/A9A1";
import { A9A2_calc } from "./ducts/A9A2";
import { A9B1_calc } from "./ducts/A9B1";
import { A9B2_calc } from "./ducts/A9B2";
import { A9C_calc } from "./ducts/A9C";
import { A10A1_calc } from "./ducts/A10A1";
import { A10B_calc } from "./ducts/A10B";
import { A10C_calc } from "./ducts/A10C";
import { A10D_calc } from "./ducts/A10D";
import { A10E_calc } from "./ducts/A10E";
import { A10F_calc } from "./ducts/A10F";
import { A10H_calc } from "./ducts/A10H";
import { A10I1_calc } from "./ducts/A10I1";
import { A10I2_calc } from "./ducts/A10I2";
import { A11A_calc } from "./ducts/A11A";
import { A11B_calc } from "./ducts/A11B";
import { A11C_calc } from "./ducts/A11C";
import { A11D_calc } from "./ducts/A11D";
import { A11E_calc } from "./ducts/A11E";
import { A11F_calc } from "./ducts/A11F";
import { A11G_calc } from "./ducts/A11G";
import { A11H_calc } from "./ducts/A11H";
import { A11I_calc } from "./ducts/A11I";
import { A11J_calc } from "./ducts/A11J";
import { A11K_calc } from "./ducts/A11K";
import { A11L_calc } from "./ducts/A11L";
import { A11N_calc } from "./ducts/A11N";
import { A11O_calc } from "./ducts/A11O";
import { A11P_calc } from "./ducts/A11P";
import { A11Q_calc } from "./ducts/A11Q";
import { A11R_calc } from "./ducts/A11R";
import { A11S_calc } from "./ducts/A11S";
import { A11T_calc } from "./ducts/A11T";
import { A11U_calc } from "./ducts/A11U";
import { A11V_calc } from "./ducts/A11V";
import { A11W_calc } from "./ducts/A11W";
import { A11X_calc } from "./ducts/A11X";
import { A12A1_calc } from "./ducts/A12A1";
import { A12A2_calc } from "./ducts/A12A2";
import { A12B_calc } from "./ducts/A12B";
import { A12C_calc } from "./ducts/A12C";
import { A12D1_calc } from "./ducts/A12D1";

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
  A8E: { fn: A8E_calc, outputType: "standard" },
  A8F: { fn: A8F_calc, outputType: "standard" },
  A8G: { fn: A8G_calc, outputType: "standard" },
  A8H: { fn: A8H_calc, outputType: "standard" },
  A8I: { fn: A8I_calc, outputType: "standard" },
  A8J: { fn: A8J_calc, outputType: "standard" },
  A9A1: { fn: A9A1_calc, outputType: "standard" },
  A9A2: { fn: A9A2_calc, outputType: "standard" },
  A9B1: { fn: A9B1_calc, outputType: "standard" },
  A9B2: { fn: A9B2_calc, outputType: "standard" },
  A9C: { fn: A9C_calc, outputType: "standard" },
  A10A1: { fn: A10A1_calc, outputType: "branch_main" },
  A10B: { fn: A10B_calc, outputType: "branch_main" },
  A10C: { fn: A10C_calc, outputType: "branch_main" },
  A10D: { fn: A10D_calc, outputType: "branch_main" },
  A10E: { fn: A10E_calc, outputType: "branch_main" },
  A10F: { fn: A10F_calc, outputType: "branch_main" },
  A10H: { fn: A10H_calc, outputType: "branch_main" },
  A10I1: { fn: A10I1_calc, outputType: "dual_branch" },
  A10I2: { fn: A10I2_calc, outputType: "dual_branch" },
  A11A: { fn: A11A_calc, outputType: "branch_main" },
  A11B: { fn: A11B_calc, outputType: "branch_main" },
  A11C: { fn: A11C_calc, outputType: "branch_main" },
  A11D: { fn: A11D_calc, outputType: "branch_main" },
  A11E: { fn: A11E_calc, outputType: "branch_main" },
  A11F: { fn: A11F_calc, outputType: "branch_main" },
  A11G: { fn: A11G_calc, outputType: "branch_main" },
  A11H: { fn: A11H_calc, outputType: "branch_main" },
  A11I: { fn: A11I_calc, outputType: "branch_main" },
  A11J: { fn: A11J_calc, outputType: "branch_main" },
  A11K: { fn: A11K_calc, outputType: "branch_main" },
  A11L: { fn: A11L_calc, outputType: "branch_main" },
  A11N: { fn: A11N_calc, outputType: "branch_main" },
  A11O: { fn: A11O_calc, outputType: "branch_main" },
  A11P: { fn: A11P_calc, outputType: "branch_main" },
  A11Q: { fn: A11Q_calc, outputType: "branch_main" },
  A11R: { fn: A11R_calc, outputType: "branch_main" },
  A11S: { fn: A11S_calc, outputType: "branch_main" },
  A11T: { fn: A11T_calc, outputType: "branch_main" },
  A11U: { fn: A11U_calc, outputType: "branch_main" },
  A11V: { fn: A11V_calc, outputType: "branch_main" },
  A11W: { fn: A11W_calc, outputType: "dual_branch" },
  A11X: { fn: A11X_calc, outputType: "dual_branch" },
  A12A1: { fn: A12A1_calc, outputType: "standard" },
  A12A2: { fn: A12A2_calc, outputType: "standard" },
  A12B: { fn: A12B_calc, outputType: "standard" },
  A12C: { fn: A12C_calc, outputType: "standard" },
  A12D1: { fn: A12D1_calc, outputType: "standard" },
};
