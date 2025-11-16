import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A7E: Rectangular Elbow (Radiused)
 * Inputs: W₁, W, H, Flow Rate
 * Uses W₁/W and H/W ratio lookup
 */
export function A7E_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const entry_1 = inputs.entry_1 as number; // W₁ (inches)
  const entry_2 = inputs.entry_2 as number; // W (inches)
  const entry_3 = inputs.entry_3 as number; // H (inches)
  const entry_4 = inputs.entry_4 as number; // Flow Rate (cfm)

  // Calculate velocity
  const area = (entry_2 * entry_3) / 144; // ft²
  const velocity = entry_4 / area; // ft/min

  // Calculate hydraulic diameter and Reynolds Number
  const hydraulic_diameter = (2 * entry_2 * entry_3) / (entry_2 + entry_3);
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

  // Calculate W₁/W and H/W ratios
  const w1_w_ratio = entry_1 / entry_2;
  const h_w_ratio = entry_3 / entry_2;

  // Find closest W₁/W and H/W in master data
  const a7e_rows = data.rows.filter((row) => row.id === "A7E");

  // Find closest W₁/W <= w1_w_ratio
  const valid_w1w_rows = a7e_rows.filter((row) => row["W₁/W"] <= w1_w_ratio);
  const closest_w1w = valid_w1w_rows.length > 0
    ? Math.max(...valid_w1w_rows.map((row) => row["W₁/W"]))
    : Math.min(...a7e_rows.map((row) => row["W₁/W"]));

  // Filter rows with the closest W₁/W
  const w1w_filtered = a7e_rows.filter((row) => row["W₁/W"] === closest_w1w);

  // Find closest H/W <= h_w_ratio within the W₁/W group
  const valid_hw_rows = w1w_filtered.filter((row) => row["H/W"] <= h_w_ratio);
  const closest_row = valid_hw_rows.length > 0
    ? valid_hw_rows.sort((a, b) => b["H/W"] - a["H/W"])[0]
    : w1w_filtered.sort((a, b) => a["H/W"] - b["H/W"])[0];

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
