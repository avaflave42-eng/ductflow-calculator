import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A9B2: Rectangular Pyramidal Contraction with L/D and Angle
 * Inputs: H, W, H₁, W₁, L, Angle, Flow Rate
 * Uses hydraulic diameter for L/D calculation
 */
export function A9B2_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const entry_1 = inputs.entry_1 as number; // H - Height (inches)
  const entry_2 = inputs.entry_2 as number; // W - Width (inches)
  const entry_3 = inputs.entry_3 as number; // H₁ - Height 1 (inches)
  const entry_4 = inputs.entry_4 as number; // W₁ - Width 1 (inches)
  const entry_5 = inputs.entry_5 as number; // L - Length (inches)
  const entry_6 = inputs.entry_6 as number; // Angle (degrees)
  const entry_7 = inputs.entry_7 as number; // Flow Rate (cfm)

  // Calculate hydraulic diameters
  const hydraulic_diameter = (2 * entry_1 * entry_2) / (entry_1 + entry_2);
  const hydraulic_diameter_1 = (2 * entry_3 * entry_4) / (entry_3 + entry_4);

  // Calculate velocity using downstream dimensions
  const area_1 = (entry_3 * entry_4) / 144; // ft²
  const velocity = entry_7 / area_1; // ft/min

  // Calculate L/D ratio
  const length_diameter_ratio = entry_5 / hydraulic_diameter;

  // Find matching L/D and Angle
  const a9b2_rows = data.rows.filter((row) => row.id === "A9B2");

  // Match L/D (L/D <= length_diameter_ratio, take largest)
  const ld_sorted = a9b2_rows.sort((a, b) => a["L/D"] - b["L/D"]);
  const valid_ld = ld_sorted.filter((row) => row["L/D"] <= length_diameter_ratio);
  const closest_ld_value = valid_ld.length > 0
    ? valid_ld[valid_ld.length - 1]["L/D"]
    : ld_sorted[0]["L/D"];

  const ld_filtered = a9b2_rows.filter((row) => row["L/D"] === closest_ld_value);

  // Match Angle within the L/D group
  const angle_sorted = ld_filtered.sort((a, b) => a.ANGLE - b.ANGLE);
  let closest_angle_row;
  if (entry_6 < 60) {
    // For angles < 60, round down (ANGLE <= entry_6)
    const valid_angle = angle_sorted.filter((row) => row.ANGLE <= entry_6);
    closest_angle_row = valid_angle.length > 0
      ? valid_angle[valid_angle.length - 1]
      : angle_sorted[0];
  } else {
    // For angles >= 60, round up (ANGLE >= entry_6)
    const valid_angle = angle_sorted.filter((row) => row.ANGLE >= entry_6);
    closest_angle_row = valid_angle.length > 0
      ? valid_angle[0]
      : angle_sorted[angle_sorted.length - 1];
  }

  const loss_coefficient_base = closest_angle_row.C;

  // Apply A/A1 correction if available
  const area = (entry_1 * entry_2) / 144; // ft²
  const area_ratio = area / area_1; // A/A1

  let loss_coefficient = loss_coefficient_base;
  if (closest_angle_row["A/A1"] !== undefined) {
    const correction_factor = area_ratio / closest_angle_row["A/A1"];
    loss_coefficient = loss_coefficient_base * Math.pow(correction_factor, 2);
  }

  const velocity_pressure = Math.pow(velocity / 4005, 2);
  const pressure_loss = loss_coefficient * velocity_pressure;

  return {
    "Velocity (fpm)": velocity,
    "Vel. Pres @ V0 (in. w.c.)": velocity_pressure,
    "Loss Coefficient": loss_coefficient,
    "Pressure Loss (in. w.c.)": pressure_loss,
  };
}
