import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A8E: Rectangular Expansion (Sides Straight)
 * Inputs: H, H₁, W, Angle, Flow Rate
 * Different angle matching logic for < 90 vs >= 90 degrees
 */
export function A8E_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
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
  const a8e_rows = data.rows.filter((row) => row.id === "A8E");

  // Match angle (different logic for < 90 vs >= 90)
  let valid_angle_rows;
  let closest_angle;
  if (entry_4 < 90) {
    valid_angle_rows = a8e_rows.filter((row) => row.ANGLE >= entry_4);
    closest_angle = valid_angle_rows.length > 0
      ? Math.min(...valid_angle_rows.map((row) => row.ANGLE))
      : Math.max(...a8e_rows.map((row) => row.ANGLE));
  } else {
    valid_angle_rows = a8e_rows.filter((row) => row.ANGLE <= entry_4);
    closest_angle = valid_angle_rows.length > 0
      ? Math.max(...valid_angle_rows.map((row) => row.ANGLE))
      : Math.min(...a8e_rows.map((row) => row.ANGLE));
  }

  const angle_filtered = a8e_rows.filter((row) => row.ANGLE === closest_angle);

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
