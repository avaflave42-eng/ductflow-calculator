import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A13E1: Circular Duct Exit with Wall Opening
 * Inputs: D, L, Q, obstruction, n
 * Uses L/D matching with optional screen correction (adds C1 directly)
 */
export function A13E1_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const D = inputs.entry_1 as number;
  const L = inputs.entry_2 as number;
  const Q = inputs.entry_3 as number;
  const obstruction = inputs.entry_4 as string;
  const n = inputs.entry_5 as number | undefined;

  // Calculate area and velocity
  const A = (Math.PI * Math.pow(D / 2, 2)) / 144; // ft²
  const V = Q / A; // fpm
  const vp = Math.pow(V / 4005, 2);

  // Calculate L/D ratio
  const L_D = L / D;

  // --- BASE COEFFICIENT LOOKUP ---
  const base_data = data.rows.filter((row) => row.id === "A13E1");
  const LD_vals = [...new Set(base_data.map((r) => r["L/D"]))].sort((a, b) => a - b);
  
  // Round up L/D
  const LD_match = LD_vals.filter((v) => v >= L_D).shift() || LD_vals[LD_vals.length - 1];

  const matched_row = base_data.find((row) => row["L/D"] === LD_match);
  const C = matched_row?.C || 0;

  // --- SCREEN OBSTRUCTION CORRECTION (adds C1 directly) ---
  let total_C = C;
  if (obstruction === "screen" && n !== undefined) {
    const screen_data = data.rows.filter((row) => row.id === "A14A1");
    const n_vals = [...new Set(screen_data.map((r) => r["n, free area ratio"]))].sort((a, b) => a - b);
    const n_match = n_vals.filter((v) => v <= n).pop() || n_vals[0];
    const screen_row = screen_data.find((row) => row["n, free area ratio"] === n_match);
    const C_screen = screen_row?.C || 0;

    total_C = C + C_screen;
  }

  // Calculate pressure loss
  const pressure_loss = total_C * vp;

  return {
    "Velocity (fpm)": V,
    "Vel. Pres (in. w.c.)": vp,
    "Loss Coefficient": total_C,
    "Pressure Loss (in. w.c.)": pressure_loss,
  };
}
