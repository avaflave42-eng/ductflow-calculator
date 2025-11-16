import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A12E2: Rectangular Conical Bellmouth with End Wall
 * Inputs: L, H, W, Hs, Ws, Q, obstruction, n
 * Uses equivalent diameter for L/D and angle matching with optional screen correction
 */
export function A12E2_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const L = inputs.entry_1 as number;
  const H = inputs.entry_2 as number;
  const W = inputs.entry_3 as number;
  const Hs = inputs.entry_4 as number;
  const Ws = inputs.entry_5 as number;
  const Q = inputs.entry_6 as number;
  const obstruction = inputs.entry_7 as string;
  const n = inputs.entry_8 as number | undefined;

  // Calculate equivalent diameters
  const D1 = 1 / (2 * (H + W) / (H * W));
  const D2 = 1 / (2 * (Hs + Ws) / (Hs * Ws));

  // Calculate area and velocity (using circular equivalent)
  const A = (Math.PI * Math.pow(D1 / 2, 2)) / 144; // ft²
  const V = Q / A; // fpm

  // Calculate angle
  const angle_deg = 2 * (Math.atan((D2 - D1) / (2 * L)) * 180 / Math.PI);
  const angle_rounded = Math.round(angle_deg);

  // Calculate L/D
  const L_D = L / D1;

  // --- BASE COEFFICIENT LOOKUP ---
  const base_data = data.rows.filter((row) => row.id === "A12E2");
  
  const LD_vals = [...new Set(base_data.map((r) => r["L/D"]))].sort((a, b) => a - b);
  const ANG_vals = [...new Set(base_data.map((r) => r.ANGLE))].sort((a, b) => a - b);

  const LD_match = LD_vals.filter((v) => v <= L_D).pop() || LD_vals[0];
  const ANG_match = ANG_vals.reduce((prev, curr) => 
    Math.abs(curr - angle_rounded) < Math.abs(prev - angle_rounded) ? curr : prev
  );

  const matched_row = base_data.find(
    (row) => row["L/D"] === LD_match && row.ANGLE === ANG_match
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

    const A_total = Math.PI * Math.pow(D1 / 2, 2);
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
