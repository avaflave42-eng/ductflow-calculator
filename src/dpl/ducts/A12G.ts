import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A12G: Hood Entry with Dynamic Profile
 * Inputs vary based on profile:
 * - Round hood: D1, D, angle, Q, obstruction, n
 * - Rectangular hood: H1, W1, D, angle, Q, obstruction, n
 */
export function A12G_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const profile = inputs.entry_1 as string;

  let D1: number | undefined;
  let H1: number | undefined;
  let W1: number | undefined;
  let D: number;
  let angle: number;
  let Q: number;
  let obstruction: string;
  let n: number | undefined;

  // Extract profile-specific values
  if (profile === "round hood") {
    D1 = inputs.entry_2 as number;
    D = inputs.entry_3 as number;
    angle = inputs.entry_4 as number;
    Q = inputs.entry_5 as number;
    obstruction = inputs.entry_6 as string;
    n = inputs.entry_7 as number | undefined;
  } else {
    // square or rectangular hood
    H1 = inputs.entry_2 as number;
    W1 = inputs.entry_3 as number;
    D = inputs.entry_4 as number;
    angle = inputs.entry_5 as number;
    Q = inputs.entry_6 as number;
    obstruction = inputs.entry_7 as string;
    n = inputs.entry_8 as number | undefined;
  }

  // Calculate downstream area (common to both)
  const A = Math.PI * Math.pow(D / 2, 2);
  const V = Q / (A / 144); // fpm

  // Determine A1 based on profile
  let A1: number;
  if (profile === "round hood" && D1 !== undefined) {
    A1 = Math.PI * Math.pow(D1 / 2, 2);
  } else if (H1 !== undefined && W1 !== undefined) {
    A1 = H1 * W1;
  } else {
    A1 = A; // fallback
  }

  // --- BASE COEFFICIENT LOOKUP ---
  const config_key = profile === "round hood" ? "round hood" : "rect hood";
  const base_data = data.rows.filter(
    (row) => row.id === "A12G" && 
    row.configuration?.toLowerCase() === config_key.toLowerCase() && 
    row.ANGLE === angle
  );

  const C = base_data[0]?.C || 0;

  // --- SCREEN OBSTRUCTION CORRECTION ---
  let loss_coefficient = C;
  if (obstruction === "screen" && n !== undefined) {
    const screen_data = data.rows.filter((row) => row.id === "A14A1");
    const n_vals = [...new Set(screen_data.map((r) => r["n, free area ratio"]))].sort((a, b) => a - b);
    const n_match = n_vals.filter((v) => v <= n).pop() || n_vals[0];
    const screen_row = screen_data.find((row) => row["n, free area ratio"] === n_match);
    const C1 = screen_row?.C || 0;

    const area_ratio_sq = Math.pow(A1 / A, 2);
    loss_coefficient = C + (C1 / area_ratio_sq);
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
