import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A12B: Bellmouth Entry (Round)
 * Inputs: R, D, Ds, Q, obstruction, n
 * Uses R/D matching with optional screen obstruction correction
 */
export function A12B_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const R = inputs.entry_1 as number;
  const D = inputs.entry_2 as number;
  const Ds = inputs.entry_3 as number;
  const Q = inputs.entry_4 as number;
  const obstruction = inputs.entry_5 as string;
  const n = inputs.entry_6 as number | undefined;

  // Calculate velocity based on exit diameter
  const A = (Math.PI * Math.pow(Ds / 2, 2)) / 144; // ft²
  const V = Q / A; // fpm

  const R_D = R / D;

  // --- BASE COEFFICIENT LOOKUP ---
  const base_data = data.rows.filter((row) => row.id === "A12B");
  const r_d_vals = [...new Set(base_data.map((r) => r["R/D"]))].sort((a, b) => a - b);
  const r_d_match = r_d_vals.filter((v) => v <= R_D).pop() || r_d_vals[0];

  const matched_row = base_data.find((row) => row["R/D"] === r_d_match);
  const C = matched_row?.C || 0;

  // --- SCREEN OBSTRUCTION CORRECTION ---
  let C1 = 0;
  if (obstruction === "screen" && n !== undefined) {
    const screen_data = data.rows.filter((row) => row.id === "A14A1");
    const n_vals = [...new Set(screen_data.map((r) => r["n, free area ratio"]))].sort((a, b) => a - b);
    const n_match = n_vals.filter((v) => v <= n).pop() || n_vals[0];
    const screen_row = screen_data.find((row) => row["n, free area ratio"] === n_match);
    C1 = screen_row?.C || 0;
  }

  // Calculate final loss coefficient
  let loss_coefficient = C;
  if (obstruction === "screen" && n !== undefined) {
    const A_total = Math.PI * Math.pow(Ds / 2, 2);
    const A_s = n * A_total;
    const A_ratio = A_s / A_total;
    loss_coefficient = C + (C1 / Math.pow(A_ratio, 2));
  }

  // Calculate pressure loss
  const VP = Math.pow(V / 4005, 2);
  const pressure_loss = loss_coefficient * VP;

  return {
    "Velocity (fpm)": V,
    "Vel. Pres (in. w.c.)": VP,
    "Loss Coefficient": loss_coefficient,
    "Pressure Loss (in. w.c.)": pressure_loss,
  };
}
