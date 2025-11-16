import { CalcInputs, CalcOutputs, MasterData } from "../types";
import { interpolate1D, extract1DPoints } from "../interpolation";

/**
 * A14A1 V2: Screen (Round Duct) (INTERPOLATED)
 * Inputs: D, Q, n (free area ratio)
 * Uses 1D linear interpolation on n
 */
export function A14A1_calc_v2(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const D = inputs.entry_1 as number;
  const Q = inputs.entry_2 as number;
  const n = inputs.entry_3 as number;

  // Calculate velocity
  const A = (Math.PI * Math.pow(D / 2, 2)) / 144; // ft²
  const V = Q / A; // fpm
  const vp = Math.pow(V / 4005, 2);

  // Get all A14A1 rows and extract n vs C data points
  const a14a1_rows = data.rows.filter((row) => row.id === "A14A1");
  const points = extract1DPoints(a14a1_rows, "n, free area ratio", "C");

  // Interpolate C value based on n
  const C = interpolate1D(n, points);

  const pressure_loss = C * vp;

  return {
    "Velocity (fpm)": V,
    "Vel. Pres (in. w.c.)": vp,
    "Loss Coefficient": C,
    "Pressure Loss (in. w.c.)": pressure_loss,
  };
}
