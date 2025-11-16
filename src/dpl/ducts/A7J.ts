import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A7J: Rectangular Offset (Different Configuration)
 * Inputs: H, W, L, Flow Rate
 * Uses L/W ratio lookup with RNCF
 */
export function A7J_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const entry_1 = inputs.entry_1 as number; // H - Height (inches)
  const entry_2 = inputs.entry_2 as number; // W - Width (inches)
  const entry_3 = inputs.entry_3 as number; // L - Length (inches)
  const entry_4 = inputs.entry_4 as number; // Flow Rate (cfm)

  // Calculate velocity
  const area = (entry_1 * entry_2) / 144; // ft²
  const velocity = entry_4 / area; // ft/min

  // Calculate hydraulic diameter and Reynolds Number
  const hydraulic_diameter = (2 * entry_1 * entry_2) / (entry_1 + entry_2);
  const reynolds_number = 8.5 * hydraulic_diameter * velocity;
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

  // Calculate L/W ratio
  const l_w_ratio = entry_3 / entry_2;

  // Find L/W coefficient
  const a7j_rows = data.rows.filter((row) => row.id === "A7J");
  const lw_data = a7j_rows.map((row) => ({ "L/W": row["L/W"], C: row.C }))
    .filter((row) => row["L/W"] != null)
    .sort((a, b) => a["L/W"] - b["L/W"]);

  let lw_row;
  if (l_w_ratio <= 1.2) {
    const valid_lw = lw_data.filter((row) => row["L/W"] <= l_w_ratio);
    lw_row = valid_lw.length > 0
      ? valid_lw[valid_lw.length - 1]
      : lw_data[0];
  } else {
    const valid_lw = lw_data.filter((row) => row["L/W"] >= l_w_ratio);
    lw_row = valid_lw.length > 0
      ? valid_lw[0]
      : lw_data[lw_data.length - 1];
  }

  const loss_coefficient_base = lw_row.C;

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
