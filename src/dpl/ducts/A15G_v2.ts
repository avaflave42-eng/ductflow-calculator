import { CalcInputs, CalcOutputs, MasterData } from "../types";
import { interpolate1D, extract1DPoints } from "../interpolation";

/**
 * A15G V2: Rectangular Exit without Blades (INTERPOLATED)
 * Inputs: H, W, angle, Q
 * Uses 1D linear interpolation on angle
 */
export function A15G_calc_v2(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const H = inputs.entry_1 as number;
  const W = inputs.entry_2 as number;
  const angle = inputs.entry_3 as number;
  const Q = inputs.entry_4 as number;

  // Calculate velocity
  const A = (H * W) / 144; // ft²
  const V = Q / A; // fpm
  const vp = Math.pow(V / 4005, 2);

  // Get all A15G rows and extract angle vs C data points
  const a15g_rows = data.rows.filter((row) => row.id === "A15G");
  const points = extract1DPoints(a15g_rows, "ANGLE", "C");

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
