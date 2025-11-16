import { CalcInputs, CalcOutputs, MasterData } from "../types";
import { interpolate1D, extract1DPoints } from "../interpolation";

/**
 * A15A V2: Exit - Elliptical Opening at End of Round Duct (INTERPOLATED)
 * Inputs: D, Q, angle
 * Uses 1D linear interpolation on angle
 */
export function A15A_calc_v2(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const D = inputs.entry_1 as number;
  const Q = inputs.entry_2 as number;
  const angle = inputs.entry_3 as number;

  // Calculate velocity
  const A = (Math.PI * Math.pow(D / 2, 2)) / 144; // ft²
  const V = Q / A; // fpm
  const vp = Math.pow(V / 4005, 2);

  // Get all A15A rows and extract angle vs C data points
  const a15a_rows = data.rows.filter((row) => row.id === "A15A");
  const points = extract1DPoints(a15a_rows, "ANGLE", "C");

  // Interpolate C value based on angle
  const C = interpolate1D(angle, points);

  const pressure_loss = C * vp;

  return {
    "Velocity (fpm)": V,
    "Vel. Pres (in. w.c.)": vp,
    "Loss Coefficient": C,
    "Pressure Loss (in. w.c.)": pressure_loss,
  };
}
