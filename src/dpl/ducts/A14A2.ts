import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A14A2: Screen (Rectangular Duct)
 * Inputs: H, W, Q, n (free area ratio)
 * Uses A14A1 table for n matching (round down)
 */
export function A14A2_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const H = inputs.entry_1 as number;
  const W = inputs.entry_2 as number;
  const Q = inputs.entry_3 as number;
  const n = inputs.entry_4 as number;

  // Calculate velocity
  const A = (H * W) / 144; // ft²
  const V = Q / A; // fpm
  const vp = Math.pow(V / 4005, 2);

  // Find matching n from A14A1 table (round down)
  const a14a1_rows = data.rows.filter((row) => row.id === "A14A1");
  const n_vals = [...new Set(a14a1_rows.map((r) => r["n, free area ratio"]))].sort((a, b) => a - b);
  const n_match = n_vals.filter((v) => v <= n).pop() || n_vals[0];

  const matched_row = a14a1_rows.find((row) => row["n, free area ratio"] === n_match);
  const C = matched_row?.C || 0;

  const pressure_loss = C * vp;

  return {
    "Velocity (fpm)": V,
    "Vel. Pres (in. w.c.)": vp,
    "Loss Coefficient": C,
    "Pressure Loss (in. w.c.)": pressure_loss,
  };
}
