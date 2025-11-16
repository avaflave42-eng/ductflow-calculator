import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A7F: Rectangular Elbow (Radiused with Angle < 90°)
 * Inputs: H, W, R, θ (angle), Flow Rate
 * Uses R/W and H/W ratio lookup with angle correction
 */
export function A7F_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const entry_1 = inputs.entry_1 as number; // H - Height (inches)
  const entry_2 = inputs.entry_2 as number; // W - Width (inches)
  const entry_3 = inputs.entry_3 as number; // R - Radius (inches)
  const entry_4 = inputs.entry_4 as number; // θ - Angle (degrees)
  const entry_5 = inputs.entry_5 as number; // Flow Rate (cfm)

  // Calculate velocity
  const area = (entry_1 * entry_2) / 144; // ft²
  const velocity = entry_5 / area; // ft/min

  // Calculate hydraulic diameter and Reynolds Number
  const hydraulic_diameter = (2 * entry_1 * entry_2) / (entry_1 + entry_2);
  const reynolds_number = 8.5 * hydraulic_diameter * velocity;
  const equivalent_diameter = 23766.76 * Math.pow(velocity, -1.000794);

  let rnc_factor = 1.0;

  if (velocity < 23766.76 / equivalent_diameter) {
    // Correction table for RNCF
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

  // Calculate R/W and H/W ratios
  const r_w_ratio = entry_3 / entry_2;
  const h_w_ratio = entry_1 / entry_2;

  // Find closest R/W and H/W in master data
  const a7f_rows = data.rows.filter((row) => row.id === "A7F");

  // Find closest R/W <= r_w_ratio
  const valid_rw_rows = a7f_rows.filter((row) => row["R/W"] <= r_w_ratio);
  const closest_rw = valid_rw_rows.length > 0
    ? Math.max(...valid_rw_rows.map((row) => row["R/W"]))
    : Math.min(...a7f_rows.map((row) => row["R/W"]));

  // Filter rows with the closest R/W
  const rw_filtered = a7f_rows.filter((row) => row["R/W"] === closest_rw);

  // Find closest H/W based on whether h_w_ratio <= 3
  let closest_row;
  if (h_w_ratio <= 3) {
    const valid_hw_rows = rw_filtered.filter((row) => row["H/W"] <= h_w_ratio);
    closest_row = valid_hw_rows.length > 0
      ? valid_hw_rows.sort((a, b) => b["H/W"] - a["H/W"])[0]
      : rw_filtered.sort((a, b) => a["H/W"] - b["H/W"])[0];
  } else {
    const valid_hw_rows = rw_filtered.filter((row) => row["H/W"] >= h_w_ratio);
    closest_row = valid_hw_rows.length > 0
      ? valid_hw_rows.sort((a, b) => a["H/W"] - b["H/W"])[0]
      : rw_filtered.sort((a, b) => b["H/W"] - a["H/W"])[0];
  }

  const loss_coefficient_base = closest_row.C;

  // Apply angle correction if angle < 90 degrees
  const angle_correction_factors: { [key: number]: number } = {
    90: 1.00,
    75: 0.88,
    60: 0.75,
    45: 0.63,
    30: 0.45,
  };

  const angle_keys = Object.keys(angle_correction_factors).map(Number).sort((a, b) => b - a);
  const applicable_angle = angle_keys.find((a) => entry_4 >= a) || 30;
  const angle_correction = angle_correction_factors[applicable_angle];

  // Final coefficient with RNCF and angle correction
  const loss_coefficient = loss_coefficient_base * rnc_factor * angle_correction;

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
