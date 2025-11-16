import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A15E: Rectangular Exit with Turning Vanes or Blades
 * Inputs: H, W, N (number of blades), angle, Q
 * Uses L/R and angle matching (both round up)
 */
export function A15E_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const H = inputs.entry_1 as number;
  const W = inputs.entry_2 as number;
  const N = inputs.entry_3 as number;
  const angle = inputs.entry_4 as number;
  const Q = inputs.entry_5 as number;

  // Calculate velocity
  const A = (H * W) / 144; // ft²
  const V = Q / A; // fpm
  const vp = Math.pow(V / 4005, 2);

  // Calculate L/R
  const perimeter = 2 * (H + W);
  const L_R = (N * W) / perimeter;

  // Find matching L/R and angle (both round up)
  const a15e_rows = data.rows.filter((row) => row.id === "A15E");
  const LR_vals = [...new Set(a15e_rows.map((r) => r["L/R"]))].sort((a, b) => a - b);
  const angle_vals = [...new Set(a15e_rows.map((r) => r.ANGLE))].sort((a, b) => a - b);

  const LR_match = LR_vals.filter((v) => v >= L_R).shift() || LR_vals[LR_vals.length - 1];
  const angle_match = angle_vals.filter((v) => v >= angle).shift() || angle_vals[angle_vals.length - 1];

  const matched_row = a15e_rows.find(
    (row) => row["L/R"] === LR_match && row.ANGLE === angle_match
  );
  const C = matched_row?.C || 0;

  const pressure_loss = C * vp;

  return {
    "Velocity (fpm)": V,
    "Vel. Pres (in. w.c.)": vp,
    "Loss Coefficient": C,
    "Pressure Loss (in. w.c.)": pressure_loss,
  };
}
