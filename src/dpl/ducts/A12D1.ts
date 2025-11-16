import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A12D1: Conical Entry (Round)
 * Inputs: L, D, Ds, Q, obstruction, n
 * Calculates angle from geometry, uses L/D and angle matching with optional screen correction
 */
export function A12D1_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const L = inputs.entry_1 as number;
  const D = inputs.entry_2 as number;
  const Ds = inputs.entry_3 as number;
  const Q = inputs.entry_4 as number;
  const obstruction = inputs.entry_5 as string;
  const n = inputs.entry_6 as number | undefined;

  // Calculate velocity
  const A = (Math.PI * Math.pow(D / 2, 2)) / 144; // ft²
  const V = Q / A; // fpm

  // Calculate L/D and angle
  const L_D = L / D;
  const angle_rad = 2 * Math.atan((Ds - D) / (2 * L));
  const angle_deg = (angle_rad * 180) / Math.PI;
  const angle_rounded = Math.round(angle_deg);

  // --- BASE COEFFICIENT LOOKUP ---
  const base_data = data.rows.filter((row) => row.id === "A12D1");
  
  const L_D_vals = [...new Set(base_data.map((r) => r["L/D"]))].sort((a, b) => a - b);
  const angle_vals = [...new Set(base_data.map((r) => r.ANGLE))].sort((a, b) => a - b);

  const L_D_match = L_D_vals.filter((v) => v <= L_D).pop() || L_D_vals[0];
  const angle_match = angle_vals.reduce((prev, curr) => 
    Math.abs(curr - angle_rounded) < Math.abs(prev - angle_rounded) ? curr : prev
  );

  const matched_row = base_data.find(
    (row) => row["L/D"] === L_D_match && row.ANGLE === angle_match
  );
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
    const A_total = Math.PI * Math.pow(D / 2, 2);
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
