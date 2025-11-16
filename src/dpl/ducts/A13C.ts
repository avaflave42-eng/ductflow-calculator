import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A13C: Rectangular Conical Exit with/without Wall
 * Inputs: H, Hs, W, angle, Q, obstruction, n
 * Uses angle and As/A ratio matching with optional screen correction
 */
export function A13C_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const H = inputs.entry_1 as number;
  const Hs = inputs.entry_2 as number;
  const W = inputs.entry_3 as number;
  const angle = inputs.entry_4 as number;
  const Q = inputs.entry_5 as number;
  const obstruction = inputs.entry_6 as string;
  const n = inputs.entry_7 as number | undefined;

  // Calculate areas
  const A = H * W;
  const As = Hs * W;
  const A_ratio = As / A;

  // Calculate velocity
  const V = Q / (A / 144); // fpm
  const vp = Math.pow(V / 4005, 2);

  // --- BASE COEFFICIENT LOOKUP ---
  const base_data = data.rows.filter((row) => row.id === "A13C");
  
  const angle_vals = [...new Set(base_data.map((r) => r.ANGLE))].sort((a, b) => a - b);
  // Round angle up
  const angle_match = angle_vals.filter((v) => v >= angle).shift() || angle_vals[angle_vals.length - 1];

  // Filter by matched angle
  const angle_filtered = base_data.filter((row) => row.ANGLE === angle_match);
  const ratio_vals = [...new Set(angle_filtered.map((r) => r["As/A"]))].sort((a, b) => a - b);

  // Area ratio rounding based on angle threshold
  let ratio_match: number;
  if (angle <= 20) {
    // Round down for angles <= 20
    ratio_match = ratio_vals.filter((v) => v <= A_ratio).pop() || ratio_vals[0];
  } else {
    // Nearest for angles > 20
    ratio_match = ratio_vals.reduce((prev, curr) => 
      Math.abs(curr - A_ratio) < Math.abs(prev - A_ratio) ? curr : prev
    );
  }

  const matched_row = base_data.find(
    (row) => row.ANGLE === angle_match && row["As/A"] === ratio_match
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

    loss_coefficient = C + (C1 / Math.pow(As / A, 2));
  }

  // Calculate pressure loss
  const pressure_loss = loss_coefficient * vp;

  return {
    "Velocity (fpm)": V,
    "Vel. Pres (in. w.c.)": vp,
    "Loss Coefficient": loss_coefficient,
    "Pressure Loss (in. w.c.)": pressure_loss,
  };
}
