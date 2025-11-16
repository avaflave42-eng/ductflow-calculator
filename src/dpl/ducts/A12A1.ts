import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A12A1: Round Duct Entry
 * Inputs: t, L, D, Q, obstruction, n, plate_thickness, hole_diameter
 * Uses t/D and L/D matching with optional obstruction correction
 */
export function A12A1_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const t = inputs.entry_1 as number;
  const L = inputs.entry_2 as number;
  const D = inputs.entry_3 as number;
  const Q = inputs.entry_4 as number;
  const obstruction = inputs.entry_5 as string;
  const n = inputs.entry_6 as number | undefined;
  const plate_thickness = inputs.entry_7 as number | undefined;
  const hole_diameter = inputs.entry_8 as number | undefined;

  // Calculate area and velocity
  const A = (Math.PI * Math.pow(D / 2, 2)) / 144; // ft²
  const V = Q / A; // fpm

  // Calculate ratios
  const t_D = t / D;
  const L_D = L / D;

  // --- BASE COEFFICIENT LOOKUP ---
  const base_data = data.rows.filter((row) => row.id === "A12A1");
  
  const tD_vals = [...new Set(base_data.map((r) => r["t/D"]))].sort((a, b) => a - b);
  const LD_vals = [...new Set(base_data.map((r) => r["L/D"]))].sort((a, b) => a - b);

  const tD_match = tD_vals.filter((v) => v <= t_D).pop() || tD_vals[0];
  const LD_match = LD_vals.filter((v) => v >= L_D).shift() || LD_vals[LD_vals.length - 1];

  const matched_row = base_data.find(
    (row) => row["t/D"] === tD_match && row["L/D"] === LD_match
  );
  const C = matched_row?.C || 0;

  // --- OBSTRUCTION CORRECTION ---
  let C1 = 0;
  if (obstruction === "screen" && n !== undefined) {
    const screen_data = data.rows.filter((row) => row.id === "A14A1");
    const n_vals = [...new Set(screen_data.map((r) => r["n, free area ratio"]))].sort((a, b) => a - b);
    const n_match = n_vals.filter((v) => v <= n).pop() || n_vals[0];
    const screen_row = screen_data.find((row) => row["n, free area ratio"] === n_match);
    C1 = screen_row?.C || 0;
  } else if (obstruction === "perforated plate" && n !== undefined && plate_thickness !== undefined && hole_diameter !== undefined) {
    const t_d = plate_thickness / hole_diameter;
    const plate_data = data.rows.filter((row) => row.id === "A14A2");
    const td_vals = [...new Set(plate_data.map((r) => r["t/d"]))].sort((a, b) => a - b);
    const td_match = td_vals.reduce((prev, curr) => 
      Math.abs(curr - t_d) < Math.abs(prev - t_d) ? curr : prev
    );
    const plate_row = plate_data.find((row) => row["t/d"] === td_match);
    C1 = plate_row?.C || 0;
  }

  // Calculate final loss coefficient
  let loss_coefficient = C;
  if (obstruction === "screen" && n !== undefined) {
    const A_s = n * (Math.PI * Math.pow(D / 2, 2));
    const A_ratio = A_s / (Math.PI * Math.pow(D / 2, 2));
    loss_coefficient = C + (C1 / Math.pow(A_ratio, 2));
  } else if (obstruction === "perforated plate" && n !== undefined) {
    loss_coefficient = C + (C1 / Math.pow(n, 2));
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
