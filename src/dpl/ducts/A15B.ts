import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A15B: Exit - Elliptical Opening at End of Rectangular Duct
 * Inputs: H, W, Q, angle
 * Uses angle matching (round up)
 */
export function A15B_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const H = inputs.entry_1 as number;
  const W = inputs.entry_2 as number;
  const Q = inputs.entry_3 as number;
  const angle = inputs.entry_4 as number;

  // Calculate velocity
  const A = (H * W) / 144; // ft²
  const V = Q / A; // fpm
  const vp = Math.pow(V / 4005, 2);

  // Find matching angle (round up)
  const a15b_rows = data.rows.filter((row) => row.id === "A15B");
  const angle_vals = [...new Set(a15b_rows.map((r) => r.ANGLE))].sort((a, b) => a - b);
  const angle_match = angle_vals.filter((v) => v >= angle).shift() || angle_vals[angle_vals.length - 1];

  const matched_row = a15b_rows.find((row) => row.ANGLE === angle_match);
  const C = matched_row?.C || 0;

  const pressure_loss = C * vp;

  return {
    "Velocity (fpm)": V,
    "Vel. Pres (in. w.c.)": vp,
    "Loss Coefficient": C,
    "Pressure Loss (in. w.c.)": pressure_loss,
  };
}
