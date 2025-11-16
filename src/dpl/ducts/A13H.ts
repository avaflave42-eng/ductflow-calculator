import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A13H: Rectangular Exit with Varying Both Dimensions
 * Inputs: H, W, H1, W1, angle, Q, obstruction, n
 * Uses angle and A1/A ratio matching with optional screen correction
 */
export function A13H_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const H = inputs.entry_1 as number;
  const W = inputs.entry_2 as number;
  const H1 = inputs.entry_3 as number;
  const W1 = inputs.entry_4 as number;
  const angle = inputs.entry_5 as number;
  const Q = inputs.entry_6 as number;
  const obstruction = inputs.entry_7 as string;
  const n = inputs.entry_8 as number | undefined;

  // Calculate areas and velocity
  const A = H * W;
  const A1 = H1 * W1;
  const V = Q / (A / 144); // fpm
  const ratio = A1 / A;

  // --- BASE COEFFICIENT LOOKUP ---
  const base_data = data.rows.filter((row) => row.id === "A13H");
  
  const angle_vals = [...new Set(base_data.map((r) => r.ANGLE))].sort((a, b) => a - b);
  
  // Round angle up
  const angle_rounded = angle_vals.filter((v) => v >= angle).shift() || angle_vals[angle_vals.length - 1];

  // Filter by matched angle
  const angle_filtered = base_data.filter((row) => row.ANGLE === angle_rounded);
  const ratio_vals = [...new Set(angle_filtered.map((r) => r["A1/A"]))].sort((a, b) => a - b);

  // Round ratio down
  const ratio_match = ratio_vals.filter((v) => v <= ratio).pop() || ratio_vals[0];

  const matched_row = base_data.find(
    (row) => row.ANGLE === angle_rounded && row["A1/A"] === ratio_match
  );
  const C = matched_row?.C || 0;

  // --- SCREEN OBSTRUCTION CORRECTION ---
  let total_loss_coefficient = C;
  if (obstruction === "screen" && n !== undefined) {
    const screen_data = data.rows.filter((row) => row.id === "A14A1");
    const n_vals = [...new Set(screen_data.map((r) => r["n, free area ratio"]))].sort((a, b) => a - b);
    const n_match = n_vals.filter((v) => v <= n).pop() || n_vals[0];
    const screen_row = screen_data.find((row) => row["n, free area ratio"] === n_match);
    const C_screen = screen_row?.C || 0;

    total_loss_coefficient = C + (C_screen / Math.pow(A1 / A, 2));
  }

  // Calculate pressure loss
  const vp = Math.pow(V / 4005, 2);
  const pressure_loss = total_loss_coefficient * vp;

  return {
    "Velocity (fpm)": V,
    "Vel. Pres (in. w.c.)": vp,
    "Loss Coefficient": total_loss_coefficient,
    "Pressure Loss (in. w.c.)": pressure_loss,
  };
}
