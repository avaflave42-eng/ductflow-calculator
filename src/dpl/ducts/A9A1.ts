import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A9A1: Round Conical Contraction
 * Inputs: D, D₁, Angle, Flow Rate
 * Velocity based on downstream (smaller) diameter
 */
export function A9A1_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const entry_1 = inputs.entry_1 as number; // D - Diameter (inches)
  const entry_2 = inputs.entry_2 as number; // D₁ - Diameter 1 (inches, downstream)
  const entry_3 = inputs.entry_3 as number; // Angle (degrees)
  const entry_4 = inputs.entry_4 as number; // Flow Rate (cfm)

  // Calculate velocity using downstream diameter (D₁)
  const area_1 = (Math.PI * Math.pow(entry_2 / 2, 2)) / 144; // ft²
  const velocity = entry_4 / area_1; // ft/min

  // Calculate area ratio (A1/A)
  const area = (Math.PI * Math.pow(entry_1 / 2, 2)) / 144; // ft²
  const area_ratio = area_1 / area;

  // Find matching Angle and A1/A
  const a9a1_rows = data.rows.filter((row) => row.id === "A9A1");

  // Match angle (ANGLE >= entry_3)
  const valid_angle_rows = a9a1_rows.filter((row) => row.ANGLE >= entry_3);
  const closest_angle = valid_angle_rows.length > 0
    ? Math.min(...valid_angle_rows.map((row) => row.ANGLE))
    : Math.max(...a9a1_rows.map((row) => row.ANGLE));

  const angle_filtered = a9a1_rows.filter((row) => row.ANGLE === closest_angle);

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
