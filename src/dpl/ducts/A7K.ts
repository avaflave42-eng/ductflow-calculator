import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A7K: Round Offset
 * Inputs: Diameter, Length, Flow Rate
 * Uses L/D ratio lookup with RNCF
 */
export function A7K_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const entry_1 = inputs.entry_1 as number; // Diameter (inches)
  const entry_2 = inputs.entry_2 as number; // Length (inches)
  const entry_3 = inputs.entry_3 as number; // Flow Rate (cfm)

  // Calculate velocity
  const area = Math.PI * Math.pow(entry_1 / 2, 2); // in²
  const velocity = entry_3 / (area / 144); // ft/min

  // Calculate Reynolds Number
  const reynolds_number = 8.5 * entry_1 * velocity;
  const equivalent_diameter = 23766.76 * Math.pow(velocity, -1.000794);

  let rnc_factor = 1.0;

  if (velocity < 23766.76 / equivalent_diameter) {
    const correction_table: { [key: number]: number } = {
      1: 1.40, 2: 1.26, 3: 1.19, 4: 1.14, 6: 1.09,
      8: 1.06, 10: 1.04, 14: 1.0, 20: 1.0,
    };

    const re_scaled = reynolds_number / 1e4;
    const re_keys = Object.keys(correction_table).map(Number).sort((a, b) => a - b);
    let closest_re = re_keys[0];
    for (const re of re_keys) {
      if (re <= re_scaled) closest_re = re;
      else break;
    }
    rnc_factor = correction_table[closest_re];
  }

  // Calculate L/D ratio
  const length_diameter_ratio = entry_2 / entry_1;

  // Find L/D coefficient
  const a7k_rows = data.rows.filter((row) => row.id === "A7K");
  const ld_data = a7k_rows.map((row) => ({ "L/D": row["L/D"], C: row.C }))
    .filter((row) => row["L/D"] != null)
    .sort((a, b) => a["L/D"] - b["L/D"]);

  // Find smallest L/D >= length_diameter_ratio
  const valid_ld = ld_data.filter((row) => row["L/D"] >= length_diameter_ratio);
  const ld_row = valid_ld.length > 0
    ? valid_ld[0]
    : ld_data[ld_data.length - 1];

  const loss_coefficient_base = ld_row.C;

  // Final coefficient
  const loss_coefficient = loss_coefficient_base * rnc_factor;
  const velocity_pressure = Math.pow(velocity / 4005, 2);
  const pressure_loss = loss_coefficient * velocity_pressure;

  return {
    "Velocity (fpm)": velocity,
    "Vel. Pres @ V0 (in. w.c.)": velocity_pressure,
    "Loss Coefficient": loss_coefficient,
    "Pressure Loss (in. w.c.)": pressure_loss,
  };
}
