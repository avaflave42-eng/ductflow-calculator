import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A8I: Rectangular Expansion (Configuration I)
 * Inputs: H, H₁, W, Angle, Flow Rate
 * Simple angle matching (always ANGLE >= entry_4)
 */
export function A8I_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const entry_1 = inputs.entry_1 as number; // H - Height (inches)
  const entry_2 = inputs.entry_2 as number; // H₁ - Height 1 (inches)
  const entry_3 = inputs.entry_3 as number; // W - Width (inches)
  const entry_4 = inputs.entry_4 as number; // Angle (degrees)
  const entry_5 = inputs.entry_5 as number; // Flow Rate (cfm)

  // Calculate velocity
  const area = (entry_1 * entry_3) / 144; // ft²
  const velocity = entry_5 / area; // ft/min

  // Calculate area ratio (A1/A)
  const area_1 = (entry_2 * entry_3) / 144; // ft²
  const area_ratio = area_1 / area;

  // Find matching Angle and A1/A
  const a8i_rows = data.rows.filter((row) => row.id === "A8I");

  // Match angle (ANGLE >= entry_4)
  const valid_angle_rows = a8i_rows.filter((row) => row.ANGLE >= entry_4);
  const closest_angle = valid_angle_rows.length > 0
    ? Math.min(...valid_angle_rows.map((row) => row.ANGLE))
    : Math.max(...a8i_rows.map((row) => row.ANGLE));

  const angle_filtered = a8i_rows.filter((row) => row.ANGLE === closest_angle);

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
