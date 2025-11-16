import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A13B: Conical Exit with/without Wall
 * Inputs: L, D, Ds, Q, obstruction, n
 * Uses angle and As/A ratio matching with optional screen correction
 */
export function A13B_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const L = inputs.entry_1 as number;
  const D = inputs.entry_2 as number;
  const Ds = inputs.entry_3 as number;
  const Q = inputs.entry_4 as number;
  const obstruction = inputs.entry_5 as string;
  const n = inputs.entry_6 as number | undefined;

  // Calculate areas
  const A = Math.PI * Math.pow(D / 2, 2);
  const As = Math.PI * Math.pow(Ds / 2, 2);
  const A_ratio = As / A;

  // Calculate angle
  const angle = (2 * Math.atan((Ds - D) / (2 * L)) * 180) / Math.PI;

  // Calculate velocity
  const V = Q / (A / 144); // fpm

  // --- BASE COEFFICIENT LOOKUP ---
  const base_data = data.rows.filter((row) => row.id === "A13B");
  
  const angle_vals = [...new Set(base_data.map((r) => r.ANGLE))].sort((a, b) => a - b);
  const A_ratio_vals = [...new Set(base_data.map((r) => r["As/A"]))].sort((a, b) => a - b);

  // Match angle: use values >= calculated angle
  const angle_match = angle_vals.filter((v) => v >= angle).shift() || angle_vals[angle_vals.length - 1];

  // Match As/A ratio based on angle threshold
  let A_ratio_match: number;
  if (angle < 45) {
    // For angles < 45, use values <= calculated ratio
    A_ratio_match = A_ratio_vals.filter((v) => v <= A_ratio).pop() || A_ratio_vals[0];
  } else {
    // For angles >= 45, use nearest value
    A_ratio_match = A_ratio_vals.reduce((prev, curr) => 
      Math.abs(curr - A_ratio) < Math.abs(prev - A_ratio) ? curr : prev
    );
  }

  const matched_row = base_data.find(
    (row) => row.ANGLE === angle_match && row["As/A"] === A_ratio_match
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

    const area_ratio_sq = Math.pow(As / A, 2);
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
