import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A15C: Exit - Segmental Opening in Round Duct
 * Inputs: D, h (segment height), Q
 * Uses h/D matching (round down)
 */
export function A15C_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const D = inputs.entry_1 as number;
  const h = inputs.entry_2 as number;
  const Q = inputs.entry_3 as number;

  // Calculate velocity
  const A = (Math.PI * Math.pow(D / 2, 2)) / 144; // ft²
  const V = Q / A; // fpm
  const vp = Math.pow(V / 4005, 2);

  // Calculate h/D ratio
  const h_D = h / D;

  // Find matching h/D (round down)
  const a15c_rows = data.rows.filter((row) => row.id === "A15C");
  const hD_vals = [...new Set(a15c_rows.map((r) => r["h/D"]))].sort((a, b) => a - b);
  const hD_match = hD_vals.filter((v) => v <= h_D).pop() || hD_vals[0];

  const matched_row = a15c_rows.find((row) => row["h/D"] === hD_match);
  const C = matched_row?.C || 0;

  const pressure_loss = C * vp;

  return {
    "Velocity (fpm)": V,
    "Vel. Pres (in. w.c.)": vp,
    "Loss Coefficient": C,
    "Pressure Loss (in. w.c.)": pressure_loss,
  };
}
