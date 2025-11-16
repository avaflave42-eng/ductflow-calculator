import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A8A: Round Conical Expansion
 * Inputs: D, D₁, Angle, Flow Rate
 * Uses Re, A1/A, and Angle lookup (no RNCF)
 */
export function A8A_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const entry_1 = inputs.entry_1 as number; // D - Diameter (inches)
  const entry_2 = inputs.entry_2 as number; // D₁ - Diameter 1 (inches)
  const entry_3 = inputs.entry_3 as number; // Angle (degrees)
  const entry_4 = inputs.entry_4 as number; // Flow Rate (cfm)

  // Calculate velocity
  const area = (Math.PI * Math.pow(entry_1 / 2, 2)) / 144; // ft²
  const velocity = entry_4 / area; // ft/min

  // Calculate Reynolds number
  const reynolds_number = 8.56 * entry_1 * velocity;

  // Calculate area ratio (A1/A)
  const area_1 = (Math.PI * Math.pow(entry_2 / 2, 2)) / 144; // ft²
  const area_ratio = area_1 / area;

  // Find matching Re, A1/A, and Angle
  const a8a_rows = data.rows.filter((row) => row.id === "A8A");

  // Match Reynolds number (Re <= reynolds_number)
  const valid_re_rows = a8a_rows.filter((row) => row.Re <= reynolds_number);
  const closest_re = valid_re_rows.length > 0
    ? Math.max(...valid_re_rows.map((row) => row.Re))
    : Math.min(...a8a_rows.map((row) => row.Re));

  const re_filtered = a8a_rows.filter((row) => row.Re === closest_re);

  // Match A1/A (A1/A >= area_ratio)
  const valid_area_rows = re_filtered.filter((row) => row["A1/A"] >= area_ratio);
  const closest_area = valid_area_rows.length > 0
    ? Math.min(...valid_area_rows.map((row) => row["A1/A"]))
    : Math.max(...re_filtered.map((row) => row["A1/A"]));

  const area_filtered = re_filtered.filter((row) => row["A1/A"] === closest_area);

  // Match angle
  let closest_row;
  if (entry_3 < 90) {
    const valid_angle_rows = area_filtered.filter((row) => row.ANGLE >= entry_3);
    closest_row = valid_angle_rows.length > 0
      ? valid_angle_rows.sort((a, b) => a.ANGLE - b.ANGLE)[0]
      : area_filtered.sort((a, b) => b.ANGLE - a.ANGLE)[0];
  } else {
    const valid_angle_rows = area_filtered.filter((row) => row.ANGLE <= entry_3);
    closest_row = valid_angle_rows.length > 0
      ? valid_angle_rows.sort((a, b) => b.ANGLE - a.ANGLE)[0]
      : area_filtered.sort((a, b) => a.ANGLE - b.ANGLE)[0];
  }

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
