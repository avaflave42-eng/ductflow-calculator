import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A7C: Round Elbow (Smooth Radius, R/D < 0.5)
 * Inputs: Diameter, Angle, Flow Rate
 * RNCF with single R/D column (0.5)
 */
export function A7C_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const entry_1 = inputs.entry_1 as number; // Diameter (inches)
  const entry_2 = inputs.entry_2 as number; // Angle (degrees)
  const entry_3 = inputs.entry_3 as number; // Flow Rate (cfm)

  // Calculate velocity
  const area = Math.PI * Math.pow(entry_1 / 2, 2); // in²
  const velocity = entry_3 / (area / 144); // ft/min

  // Calculate Reynolds Number Correction Factor (RNCF)
  const reynolds_number = 8.5 * entry_1 * velocity;
  const equivalent_diameter = 23766.76 * Math.pow(velocity, -1.000794);

  let rnc_factor = 1.0;

  if (velocity < 23766.76 / equivalent_diameter) {
    // Correction table for RNCF (single column for R/D = 0.5)
    const correction_table: { [key: number]: number } = {
      1: 1.40,
      2: 1.26,
      3: 1.19,
      4: 1.14,
      6: 1.09,
      8: 1.06,
      10: 1.04,
      14: 1.0,
      20: 1.0,
    };

    const re_scaled = reynolds_number / 1e4;

    // Find closest Re
    const re_keys = Object.keys(correction_table).map(Number).sort((a, b) => a - b);
    let closest_re = re_keys[0];
    for (const re of re_keys) {
      if (re <= re_scaled) closest_re = re;
      else break;
    }

    rnc_factor = correction_table[closest_re];
  }

  // Find closest angle in master data
  const a7c_rows = data.rows.filter((row) => row.id === "A7C");

  // Find angle with minimum absolute difference
  let closest_row = a7c_rows[0];
  let min_diff = Math.abs(a7c_rows[0].ANGLE - entry_2);

  for (const row of a7c_rows) {
    const diff = Math.abs(row.ANGLE - entry_2);
    if (diff < min_diff) {
      min_diff = diff;
      closest_row = row;
    }
  }

  const loss_coefficient_base = closest_row.C;

  // Final coefficient with RNCF
  const loss_coefficient = loss_coefficient_base * rnc_factor;

  // Velocity pressure
  const velocity_pressure = Math.pow(velocity / 4005, 2);

  // Pressure loss
  const pressure_loss = loss_coefficient * velocity_pressure;

  return {
    "Velocity (fpm)": velocity,
    "Vel. Pres @ V0 (in. w.c.)": velocity_pressure,
    "Loss Coefficient": loss_coefficient,
    "Pressure Loss (in. w.c.)": pressure_loss,
  };
}
