import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A13E2: Rectangular Exit
 * Inputs: H, W, L, R, Q, obstruction, n
 * Uses R/W and L/W matching with optional screen correction
 */
export function A13E2_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const H = inputs.entry_1 as number;
  const W = inputs.entry_2 as number;
  const L = inputs.entry_3 as number;
  const R = inputs.entry_4 as number;
  const Q = inputs.entry_5 as number;
  const obstruction = inputs.entry_6 as string;
  const n = inputs.entry_7 as number | undefined;

  // Calculate area and velocity
  const A = H * W;
  const V = Q / (A / 144); // fpm

  // Calculate ratios
  const R_W = R / W;
  const L_W = L / W;

  // --- BASE COEFFICIENT LOOKUP ---
  const base_data = data.rows.filter((row) => row.id === "A13E2");
  
  const RW_vals = [...new Set(base_data.map((r) => r["R/W"]))].sort((a, b) => a - b);
  const LW_vals = [...new Set(base_data.map((r) => r["L/W"]))].sort((a, b) => a - b);

  const RW_match = RW_vals.filter((v) => v <= R_W).pop() || RW_vals[0];
  const LW_match = LW_vals.filter((v) => v <= L_W).pop() || LW_vals[0];

  const matched_row = base_data.find(
    (row) => row["R/W"] === RW_match && row["L/W"] === LW_match
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

    loss_coefficient = C + C1;
  }

  // Calculate pressure loss
  const vp = Math.pow(V / 4005, 2);
  const pressure_loss = loss_coefficient * vp;

  return {
    "Velocity (fpm)": V,
    "Vel. Pres (in. w.c.)": vp,
    "Loss Coefficient": loss_coefficient,
    "Pressure Loss (in. w.c.)": pressure_loss,
  };
}
