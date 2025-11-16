import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A7B: Round Elbow (Mitered)
 * Inputs: Diameter, R/D, # pieces, Flow Rate
 * RNCF with two R/D columns (0.5 and 0.75)
 */
export function A7B_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const entry_1 = inputs.entry_1 as number; // Diameter (inches)
  const entry_2 = inputs.entry_2 as number; // R/D
  const entry_3 = inputs.entry_3 as number; // # pieces
  const entry_4 = inputs.entry_4 as number; // Flow Rate (cfm)

  // Calculate velocity
  const area = Math.PI * Math.pow(entry_1 / 2, 2); // in²
  const velocity = entry_4 / (area / 144); // ft/min

  // Calculate Reynolds Number Correction Factor (RNCF)
  const reynolds_number = 8.5 * entry_1 * velocity;
  const equivalent_diameter = 23766.76 * Math.pow(velocity, -1.000794);

  let rnc_factor = 1.0;

  if (velocity < 23766.76 / equivalent_diameter) {
    // Correction table for RNCF
    const correction_table: { [key: number]: { "0.5": number; "0.75": number } } = {
      1: { "0.5": 1.40, "0.75": 1.77 },
      2: { "0.5": 1.26, "0.75": 1.64 },
      3: { "0.5": 1.19, "0.75": 1.56 },
      4: { "0.5": 1.14, "0.75": 1.46 },
      6: { "0.5": 1.09, "0.75": 1.38 },
      8: { "0.5": 1.06, "0.75": 1.30 },
      10: { "0.5": 1.04, "0.75": 1.15 },
      14: { "0.5": 1.0, "0.75": 1.0 },
      20: { "0.5": 1.0, "0.75": 1.0 },
    };

    const re_scaled = reynolds_number / 1e4;
    const r_d_column = entry_2 <= 0.5 ? "0.5" : "0.75";

    // Find closest Re
    const re_keys = Object.keys(correction_table).map(Number).sort((a, b) => a - b);
    let closest_re = re_keys[0];
    for (const re of re_keys) {
      if (re <= re_scaled) closest_re = re;
      else break;
    }

    rnc_factor = correction_table[closest_re][r_d_column];
  }

  // Find closest R/D and # pieces in master data
  const a7b_rows = data.rows.filter((row) => row.id === "A7B");

  // Find rows with R/D <= entry_2
  const valid_rd_rows = a7b_rows
    .filter((row) => row["R/D"] <= entry_2)
    .sort((a, b) => (a["R/D"] - b["R/D"]) || (a["# pieces"] - b["# pieces"]));

  if (valid_rd_rows.length === 0) {
    throw new Error(`No valid R/D value less than or equal to ${entry_2}`);
  }

  // Find rows with # pieces <= entry_3
  const valid_pieces_rows = valid_rd_rows.filter((row) => row["# pieces"] <= entry_3);

  if (valid_pieces_rows.length === 0) {
    throw new Error(`No valid # pieces value less than or equal to ${entry_3}`);
  }

  const closest_row = valid_pieces_rows[valid_pieces_rows.length - 1];
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
