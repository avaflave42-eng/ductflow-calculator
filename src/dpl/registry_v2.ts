/**
 * V2 Registry - Interpolated calculation functions
 * Maps duct IDs to their interpolated calculation functions
 */

import { A15A_calc_v2 } from "./ducts/A15A_v2";
import { A15B_calc_v2 } from "./ducts/A15B_v2";
import { A15C_calc_v2 } from "./ducts/A15C_v2";
import { A15G_calc_v2 } from "./ducts/A15G_v2";
import { A14A1_calc_v2 } from "./ducts/A14A1_v2";
import { A8A_calc_v2 } from "./ducts/A8A_v2";

export const calcRegistry_v2: Record<string, Function> = {
  A8A: A8A_calc_v2,
  A14A1: A14A1_calc_v2,
  A15A: A15A_calc_v2,
  A15B: A15B_calc_v2,
  A15C: A15C_calc_v2,
  A15G: A15G_calc_v2,
};
