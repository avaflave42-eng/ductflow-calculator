import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A13D: Rectangular Exit Transition
 * Inputs: H, W, H_1, W_1, L, Q, obstruction, n
 * Uses max of lateral and vertical angles with As/A ratio matching
 */
export function A13D_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const H = inputs.entry_1 as number;
  const W = inputs.entry_2 as number;
  const H_1 = inputs.entry_3 as number;
  const W_1 = inputs.entry_4 as number;
  const L = inputs.entry_5 as number;
  const Q = inputs.entry_6 as number;
  const obstruction = inputs.entry_7 as string;
  const n = inputs.entry_8 as number | undefined;

  // Calculate areas
  const A = H * W;
  const A_s = H_1 * W_1;
  const area_ratio = A_s / A;

  // Calculate velocity
  const V = Q / (A / 144); // fpm
  const vp = Math.pow(V / 4005, 2);

  // Compute angles
  const lateral_angle = (2 * Math.atan((W_1 - W) / (2 * L)) * 180) / Math.PI;
  const vertical_angle = (2 * Math.atan((H_1 - H) / (2 * L)) * 180) / Math.PI;
  const angle = Math.max(lateral_angle, vertical_angle);

  // --- BASE COEFFICIENT LOOKUP ---
  const base_data = data.rows.filter((row) => row.id === "A13D");
  const angle_vals = [...new Set(base_data.map((r) => r.ANGLE))].sort((a, b) => a - b);

  // Round angle based on threshold
  let angle_rounded: number;
  if (angle <= 30) {
    angle_rounded = angle_vals.filter((v) => v <= angle).pop() || angle_vals[0];
  } else {
    angle_rounded = angle_vals.filter((v) => v >= angle).shift() || angle_vals[angle_vals.length - 1];
  }

  // Round area ratio down
  const ar_vals = [...new Set(base_data.map((r) => r["As/A"]))].sort((a, b) => a - b);
  const ar_rounded = ar_vals.filter((v) => v <= area_ratio).pop() || ar_vals[0];

  const matched_row = base_data.find(
    (row) => row.ANGLE === angle_rounded && row["As/A"] === ar_rounded
  );
  const C = matched_row?.C || 0;

  // --- SCREEN OBSTRUCTION CORRECTION ---
  let loss_coefficient = C;
  if (obstruction === "screen" && n !== undefined) {
    const screen_data = data.rows.filter((row) => row.id === "A14A1");
    const n_vals = [...new Set(screen_data.map((r) => r["n, free area ratio"]))].sort((a, b) => a - b);
    const n_match = n_vals.filter((v) => v <= n).pop() || n_vals[0];
    const screen_row = screen_data.find((row) => row["n, free area ratio"] === n_match);
    const C1 = screen_row?.C || 0;

    loss_coefficient = C + (C1 / Math.pow(area_ratio, 2));
  }

  // Calculate pressure loss
  const pressure_loss = loss_coefficient * vp;

  return {
    "Velocity (fpm)": V,
    "Vel. Pres (in. w.c.)": vp,
    "Loss Coefficient": loss_coefficient,
    "Pressure Loss (in. w.c.)": pressure_loss,
  };
}
