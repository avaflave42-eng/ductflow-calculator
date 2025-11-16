import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A13A: Exit - Round Conical
 * Inputs: L, D, Ds, theta, Q, obstruction, n
 * Uses L/D and angle matching with optional screen correction
 */
export function A13A_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const L = inputs.entry_1 as number;
  const D = inputs.entry_2 as number;
  const Ds = inputs.entry_3 as number;
  const theta = inputs.entry_4 as number;
  const Q = inputs.entry_5 as number;
  const obstruction = inputs.entry_6 as string;
  const n = inputs.entry_7 as number | undefined;

  // Calculate areas
  const A = Math.PI * Math.pow(D / 2, 2); // in²
  const A1 = Math.PI * Math.pow(Ds / 2, 2); // in²

  // Calculate velocity
  const V = Q / (A / 144); // fpm

  // Calculate L/D ratio
  const LD = L / D;

  // --- BASE COEFFICIENT LOOKUP ---
  const base_data = data.rows.filter((row) => row.id === "A13A");
  
  const LD_vals = [...new Set(base_data.map((r) => r["L/D"]))].sort((a, b) => a - b);
  const LD_match = LD_vals.filter((v) => v <= LD).pop() || LD_vals[0];

  const matched_row = base_data.find(
    (row) => row["L/D"] === LD_match && row.ANGLE === theta
  );
  const C_base = matched_row?.C || 0;

  // --- SCREEN OBSTRUCTION CORRECTION ---
  let C_total = C_base;
  if (obstruction?.trim().toLowerCase() === "screen" && n !== undefined) {
    const screen_data = data.rows.filter((row) => row.id === "A14A1");
    const n_vals = [...new Set(screen_data.map((r) => r["n, free area ratio"]))].sort((a, b) => a - b);
    const n_match = n_vals.filter((v) => v <= n).pop() || n_vals[0];
    const screen_row = screen_data.find((row) => row["n, free area ratio"] === n_match);
    const C1 = screen_row?.C || 0;

    const As_A_ratio = A1 / A;
    C_total = C_base + (C1 / Math.pow(As_A_ratio, 2));
  }

  // Calculate pressure loss
  const VP = Math.pow(V / 4005, 2);
  const pressure_loss = C_total * VP;

  return {
    "Velocity (fpm)": V,
    "Vel. Pres (in. w.c.)": VP,
    "Loss Coefficient": C_total,
    "Pressure Loss (in. w.c.)": pressure_loss,
  };
}
