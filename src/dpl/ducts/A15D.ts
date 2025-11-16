import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A15D: Exit - Segmental Opening in Rectangular Duct
 * Inputs: H, W, h (segment height), Q
 * Uses H/W (nearest) and h/H (round down) matching
 */
export function A15D_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const H = inputs.entry_1 as number;
  const W = inputs.entry_2 as number;
  const h = inputs.entry_3 as number;
  const Q = inputs.entry_4 as number;

  // Calculate velocity
  const A = (H * W) / 144; // ft²
  const V = Q / A; // fpm
  const vp = Math.pow(V / 4005, 2);

  // Calculate ratios
  const H_W = H / W;
  const h_H = h / H;

  // Find matching H/W (nearest) and h/H (round down)
  const a15d_rows = data.rows.filter((row) => row.id === "A15D");
  const HW_vals = [...new Set(a15d_rows.map((r) => r["H/W"]))];
  const HW_match = HW_vals.reduce((prev, curr) => 
    Math.abs(curr - H_W) < Math.abs(prev - H_W) ? curr : prev
  );

  const hH_vals = [...new Set(a15d_rows.map((r) => r["h/H"]))].sort((a, b) => a - b);
  const hH_match = hH_vals.filter((v) => v <= h_H).pop() || hH_vals[0];

  const matched_row = a15d_rows.find(
    (row) => row["H/W"] === HW_match && row["h/H"] === hH_match
  );
  const C = matched_row?.C || 0;

  const pressure_loss = C * vp;

  return {
    "Velocity (fpm)": V,
    "Vel. Pres (in. w.c.)": vp,
    "Loss Coefficient": C,
    "Pressure Loss (in. w.c.)": pressure_loss,
  };
}
