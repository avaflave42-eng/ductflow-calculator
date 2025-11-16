import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A8C: Round to Rectangular Expansion
 * Inputs: H, W, D, L, Flow Rate
 * Calculates angle from geometry, uses A8B lookup table
 */
export function A8C_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const entry_1 = inputs.entry_1 as number; // H - Height (inches)
  const entry_2 = inputs.entry_2 as number; // W - Width (inches)
  const entry_3 = inputs.entry_3 as number; // D - Diameter (inches)
  const entry_4 = inputs.entry_4 as number; // L - Length (inches)
  const entry_5 = inputs.entry_5 as number; // Flow Rate (cfm)

  // Calculate areas
  const area_round = (Math.PI * Math.pow(entry_3 / 2, 2)) / 144; // ft²
  const area_rect = (entry_1 * entry_2) / 144; // ft²

  // Velocity based on round area
  const velocity = entry_5 / area_round; // ft/min

  // Calculate angle
  const tan_half_theta = (1.13 * Math.sqrt(entry_1 * entry_2) - entry_3) / (2 * entry_4);
  const theta_deg = (2 * Math.atan(tan_half_theta) * 180) / Math.PI;

  // Area ratio
  const area_ratio = area_rect / area_round;

  // Use A8B lookup table (same data structure)
  const a8b_rows = data.rows.filter((row) => row.id === "A8B");

  // Match angle (ANGLE >= theta_deg)
  const valid_angle_rows = a8b_rows.filter((row) => row.ANGLE >= theta_deg);
  const closest_angle = valid_angle_rows.length > 0
    ? Math.min(...valid_angle_rows.map((row) => row.ANGLE))
    : Math.max(...a8b_rows.map((row) => row.ANGLE));

  const angle_filtered = a8b_rows.filter((row) => row.ANGLE === closest_angle);

  // Match A1/A (A1/A >= area_ratio)
  const valid_area_rows = angle_filtered.filter((row) => row["A1/A"] >= area_ratio);
  const closest_row = valid_area_rows.length > 0
    ? valid_area_rows.sort((a, b) => a["A1/A"] - b["A1/A"])[0]
    : angle_filtered.sort((a, b) => b["A1/A"] - a["A1/A"])[0];

  const loss_coefficient = closest_row.C;
  const velocity_pressure = Math.pow(velocity / 4005, 2);
  const pressure_loss = loss_coefficient * velocity_pressure;

  return {
    "Velocity (fpm)": velocity,
    "Vel. Pres @ V0 (in. w.c.)": velocity_pressure,
    "Loss Coefficient": loss_coefficient,
    "Pressure Loss (in. w.c.)": pressure_loss,
  };
}
