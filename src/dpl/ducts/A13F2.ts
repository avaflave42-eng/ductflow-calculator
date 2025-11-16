import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A13F2: Round Duct Exit with Angle
 * Inputs: D, angle, v, Q, obstruction, n
 * Uses angle and V/V0 matching with optional screen correction (adds C1 directly)
 */
export function A13F2_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const D = inputs.entry_1 as number;
  const angle = inputs.entry_2 as number;
  const v = inputs.entry_3 as number; // reference velocity (fpm)
  const Q = inputs.entry_4 as number;
  const obstruction = inputs.entry_5 as string;
  const n = inputs.entry_6 as number | undefined;

  // Calculate area and velocity
  const A = Math.PI * Math.pow(D / 2, 2); // in²
  const V = Q / (A / 144); // fpm
  const vv_ratio = V / v;

  // --- BASE COEFFICIENT LOOKUP ---
  const base_data = data.rows.filter((row) => row.id === "A13F2");
  
  const angle_vals = [...new Set(base_data.map((r) => r.ANGLE))].sort((a, b) => a - b);
  const vv_vals = [...new Set(base_data.map((r) => r["V/V0"]))].sort((a, b) => a - b);

  // Round angle down
  const angle_match = angle_vals.filter((v) => v <= angle).pop() || angle_vals[0];
  
  // Round V/V0 up
  const vv_match = vv_vals.filter((v) => v >= vv_ratio).shift() || vv_vals[vv_vals.length - 1];

  const matched_row = base_data.find(
    (row) => row.ANGLE === angle_match && row["V/V0"] === vv_match
  );
  const C = matched_row?.C || 0;

  // --- SCREEN OBSTRUCTION CORRECTION (adds C1 directly) ---
  let loss_coefficient = C;
  if (obstruction === "screen" && n !== undefined) {
    const screen_data = data.rows.filter((row) => row.id === "A14A1");
    const n_vals = [...new Set(screen_data.map((r) => r["n, free area ratio"]))].sort((a, b) => a - b);
    const n_match = n_vals.filter((v) => v <= n).pop() || n_vals[0];
    const screen_row = screen_data.find((row) => row["n, free area ratio"] === n_match);
    const C1 = screen_row?.C || 0;

    loss_coefficient = C + C1;
  }

  // Calculate pressure loss
  const vp = Math.pow(V / 4005, 2);
  const total_loss = loss_coefficient * vp;

  return {
    "Velocity (fpm)": V,
    "Vel. Pres (in. w.c.)": vp,
    "Loss Coefficient": loss_coefficient,
    "Pressure Loss (in. w.c.)": total_loss,
  };
}
