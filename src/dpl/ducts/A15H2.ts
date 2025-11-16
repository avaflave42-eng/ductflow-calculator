import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A15H2: Obstruction in Rectangular Duct with Protruding Elements
 * Inputs: H, L (also width), d (obstruction diameter), y (offset), Q
 * Uses A15H1 for base coefficient (Re round down, S_m/A round up)
 * Uses A15H2 for correction factor K based on y/H
 * Total C = K * base_C
 */
export function A15H2_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const H = inputs.entry_1 as number;
  const L = inputs.entry_2 as number; // Width of duct
  const d = inputs.entry_3 as number;
  const y = inputs.entry_4 as number;
  const Q = inputs.entry_5 as number;

  // Calculate velocity and equivalent diameter
  const A = (H * L) / 144; // ft²
  const D_eq = (2 * H * L) / (H + L); // Equivalent diameter
  const V = Q / A; // fpm
  const Re = 8.5 * D_eq * V;
  const vp = Math.pow(V / 4005, 2);

  // Calculate S_m/A
  const S_m = d * L; // in²
  const Sm_A = S_m / (A * 144); // Convert A back to in² for ratio

  // Calculate y/H for correction factor
  const y_H = y / H;

  // --- BASE COEFFICIENT from A15H1 ---
  const base_data = data.rows.filter((row) => row.id === "A15H1");
  const Re_vals = [...new Set(base_data.map((r) => r.Re))].sort((a, b) => a - b);
  const SmA_vals = [...new Set(base_data.map((r) => r["S_m/A"]))].sort((a, b) => a - b);

  // Re: round down, S_m/A: round up
  const Re_match = Re_vals.filter((v) => v <= Re).pop() || Re_vals[0];
  const SmA_match = SmA_vals.filter((v) => v >= Sm_A).shift() || SmA_vals[SmA_vals.length - 1];

  const base_row = base_data.find(
    (row) => row.Re === Re_match && row["S_m/A"] === SmA_match
  );
  const base_C = base_row?.C || 0;

  // --- CORRECTION FACTOR K from A15H2 ---
  const k_data = data.rows.filter((row) => row.id === "A15H2");
  const yH_vals = [...new Set(k_data.map((r) => r["y/D or y/H"]))].sort((a, b) => a - b);
  const yH_match = yH_vals.filter((v) => v <= y_H).pop() || yH_vals[0];

  const k_row = k_data.find((row) => row["y/D or y/H"] === yH_match);
  const K = k_row?.K || 1;

  // Calculate total loss coefficient and pressure loss
  const total_C = K * base_C;
  const pressure_loss = total_C * vp;

  return {
    "Velocity (fpm)": V,
    "Vel. Pres (in. w.c.)": vp,
    "Loss Coefficient": total_C,
    "Pressure Loss (in. w.c.)": pressure_loss,
  };
}
