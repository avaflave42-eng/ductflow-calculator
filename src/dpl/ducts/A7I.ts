import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A7I: Rectangular Offset
 * Inputs: H, W, L, Flow Rate
 * Uses L/H and W/H ratio lookup with RNCF
 */
export function A7I_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
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

  // Calculate L/H and W/H ratios
  const l_h_ratio = entry_3 / entry_1;
  const w_h_ratio = entry_2 / entry_1;

  // Find L/H coefficient
  const a7i_rows = data.rows.filter((row) => row.id === "A7I");
  const lh_data = a7i_rows.map((row) => ({ "L/H": row["L/H"], C: row.C }))
    .filter((row) => row["L/H"] != null)
    .sort((a, b) => a["L/H"] - b["L/H"]);

  let lh_row;
  if (l_h_ratio <= 2) {
    const valid_lh = lh_data.filter((row) => row["L/H"] <= l_h_ratio);
    lh_row = valid_lh.length > 0
      ? valid_lh[valid_lh.length - 1]
      : lh_data[0];
  } else {
    const valid_lh = lh_data.filter((row) => row["L/H"] >= l_h_ratio);
    lh_row = valid_lh.length > 0
      ? valid_lh[0]
      : lh_data[lh_data.length - 1];
  }

  const loss_coefficient_base = lh_row.C;

  // Find W/H correction factor
  const wh_data = a7i_rows.map((row) => ({ "W/H": row["W/H"], C: row.C }))
    .filter((row) => row["W/H"] != null)
    .sort((a, b) => a["W/H"] - b["W/H"]);

  const valid_wh = wh_data.filter((row) => row["W/H"] <= w_h_ratio);
  const wh_row = valid_wh.length > 0
    ? valid_wh[valid_wh.length - 1]
    : wh_data[0];

  const wh_correction_factor = wh_row.C;

  // Final coefficient
  const loss_coefficient = loss_coefficient_base * wh_correction_factor * rnc_factor;
  const velocity_pressure = Math.pow(velocity / 4005, 2);
  const pressure_loss = loss_coefficient * velocity_pressure;

  return {
    "Velocity (fpm)": velocity,
    "Vel. Pres @ V0 (in. w.c.)": velocity_pressure,
    "Loss Coefficient": loss_coefficient,
    "Pressure Loss (in. w.c.)": pressure_loss,
  };
}
