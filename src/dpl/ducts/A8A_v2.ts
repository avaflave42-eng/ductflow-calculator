import { CalcInputs, CalcOutputs, MasterData } from "../types";
import { interpolate2D, extract2DPoints } from "../interpolation";

/**
 * A8A_v2: Round Conical Expansion (Interpolated)
 * Uses bilinear interpolation within the closest Re plane
 * Inputs: D, D₁, Angle, Flow Rate
 */
export function A8A_calc_v2(inputs: CalcInputs, data: MasterData): CalcOutputs {
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

  // Find matching Re plane (same as legacy: Re <= reynolds_number, pick max)
  const a8a_rows = data.rows.filter((row) => row.id === "A8A");
  const valid_re_rows = a8a_rows.filter((row) => row.Re <= reynolds_number);
  const closest_re = valid_re_rows.length > 0
    ? Math.max(...valid_re_rows.map((row) => row.Re))
    : Math.min(...a8a_rows.map((row) => row.Re));

  // Get all rows for this Re plane
  const re_plane_rows = a8a_rows.filter((row) => row.Re === closest_re);

  // Create 2D data points for interpolation (A1/A vs ANGLE → C)
  const dataPoints = re_plane_rows.map((row) => ({
    x: row["A1/A"] as number,  // Area ratio
    y: row.ANGLE as number,     // Angle
    z: row.C as number,         // Loss coefficient
  }));

  // Perform bilinear interpolation
  const loss_coefficient = interpolate2D(area_ratio, entry_3, dataPoints);

  // Calculate pressure values
  const velocity_pressure = Math.pow(velocity / 4005, 2);
  const pressure_loss = loss_coefficient * velocity_pressure;

  return {
    "Velocity (fpm)": velocity,
    "Vel. Pres @ V0 (in. w.c.)": velocity_pressure,
    "Loss Coefficient": loss_coefficient,
    "Pressure Loss (in. w.c.)": pressure_loss,
  };
}
