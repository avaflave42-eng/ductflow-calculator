import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A9C: Round to Rectangular Transition
 * Inputs: D (round), H₁, W₁ (rectangular), Flow Rate
 * Uses Reynolds number matching
 */
export function A9C_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const entry_1 = inputs.entry_1 as number; // D - Diameter (inches)
  const entry_2 = inputs.entry_2 as number; // H₁ - Height (inches)
  const entry_3 = inputs.entry_3 as number; // W₁ - Width (inches)
  const entry_4 = inputs.entry_4 as number; // Flow Rate (cfm)

  // Calculate areas
  const area_round = (Math.PI * Math.pow(entry_1 / 2, 2)) / 144; // ft²
  const area_rect = (entry_2 * entry_3) / 144; // ft²

  // Check for area mismatch
  const area_flag = area_round > area_rect
    ? "Area of round section exceeds area of rectangular section"
    : null;

  // Calculate velocity using rectangular section
  const velocity = entry_4 / area_rect; // ft/min

  // Calculate Reynolds number
  const reynolds_number = 8.56 * entry_1 * velocity;

  // Find matching Reynolds number
  const a9c_rows = data.rows.filter((row) => row.id === "A9C");

  // Match Re (Re <= reynolds_number, take largest)
  const re_sorted = a9c_rows.sort((a, b) => a.Re - b.Re);
  const valid_re = re_sorted.filter((row) => row.Re <= reynolds_number);
  const closest_re_row = valid_re.length > 0
    ? valid_re[valid_re.length - 1]
    : re_sorted[0];

  const loss_coefficient = closest_re_row.C;
  const velocity_pressure = Math.pow(velocity / 4005, 2);
  const pressure_loss = loss_coefficient * velocity_pressure;

  return {
    "Velocity (fpm)": velocity,
    "Vel. Pres @ V0 (in. w.c.)": velocity_pressure,
    "Loss Coefficient": loss_coefficient,
    "Pressure Loss (in. w.c.)": pressure_loss,
    "Flag": area_flag,
  };
}
