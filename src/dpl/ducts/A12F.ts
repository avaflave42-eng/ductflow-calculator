import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A12F: Conical Diverging Entry (Round)
 * Inputs: L, D, Ds, theta, Q, obstruction, n
 * Calculates upstream diameter from geometry, uses L/D and angle matching
 */
export function A12F_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const L = inputs.entry_1 as number;
  const D = inputs.entry_2 as number;
  const Ds = inputs.entry_3 as number;
  const theta = inputs.entry_4 as number;
  const Q = inputs.entry_5 as number;
  const obstruction = inputs.entry_6 as string;
  const n = inputs.entry_7 as number | undefined;

  // Convert theta to radians
  const theta_rad = (theta * Math.PI) / 180;

  // Calculate upstream diameter
  const D_up = Ds - (2 * D) / Math.tan(theta_rad / 2);

  // Calculate area and velocity
  const A = (Math.PI * Math.pow(D_up / 2, 2)) / 144; // ft²
  const V = Q / A; // fpm

  // Calculate L/D ratio
  const L_D = L / D_up;

  // --- BASE COEFFICIENT LOOKUP ---
  const base_data = data.rows.filter((row) => row.id === "A12F");
  
  const LD_vals = [...new Set(base_data.map((r) => r["L/D"]))].sort((a, b) => a - b);
  const LD_match = LD_vals.filter((v) => v <= L_D).pop() || LD_vals[0];

  const matched_row = base_data.find(
    (row) => row["L/D"] === LD_match && row.ANGLE === theta
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

    const A_total = Math.PI * Math.pow(D_up / 2, 2);
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
