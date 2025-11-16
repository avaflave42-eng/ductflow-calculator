import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A10H: Converging Rectangular Wye
 * Inputs: H, Wb, Ws, Wc, Qs, Qb
 * Different widths for branch, source, and converged sections
 */
export function A10H_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const entry_1 = inputs.entry_1 as number; // H - Height (inches)
  const entry_2 = inputs.entry_2 as number; // Wb - Branch Width (inches)
  const entry_3 = inputs.entry_3 as number; // Ws - Source Width (inches)
  const entry_4 = inputs.entry_4 as number; // Wc - Converged Width (inches)
  const entry_5 = inputs.entry_5 as number; // Qs - Source Flow Rate (cfm)
  const entry_6 = inputs.entry_6 as number; // Qb - Branch Flow Rate (cfm)

  // Calculate areas
  const Ab = (entry_1 * entry_2) / 144; // ft²
  const As = (entry_1 * entry_3) / 144; // ft²
  const Ac = (entry_1 * entry_4) / 144; // ft²

  // Calculate velocities
  const Vb = entry_6 / Ab;
  const Vs = entry_5 / As;
  const Vc = (entry_5 + entry_6) / Ac;

  // Calculate ratios
  const Ab_As = Ab / As;
  const Ab_Ac = Ab / Ac;
  const As_Ac = As / Ac;
  const Qb_Qc = entry_6 / (entry_5 + entry_6);

  // --- BRANCH CALCULATIONS ---
  const branch_data = data.rows.filter((row) => row.id === "A10H" && row.PATH === "branch");

  // Match: Ab/As >= Ab_As, Ab/Ac >= Ab_Ac, Qb/Qc >= Qb_Qc
  const branch_match = branch_data.filter(
    (row) =>
      row["Ab/As"] >= Ab_As &&
      row["Ab/Ac"] >= Ab_Ac &&
      row["Qb/Qc"] >= Qb_Qc
  );

  const branch_loss_coefficient = branch_match.length > 0
    ? branch_match[0].C
    : branch_data[0]?.C || 0;

  // --- MAIN CALCULATIONS ---
  const main_data = data.rows.filter((row) => row.id === "A10H" && row.PATH === "main");

  // Match: As/Ac >= As_Ac, Ab/Ac >= Ab_Ac, Qb/Qc <= Qb_Qc
  const main_match = main_data.filter(
    (row) =>
      row["As/Ac"] >= As_Ac &&
      row["Ab/Ac"] >= Ab_Ac &&
      row["Qb/Qc"] <= Qb_Qc
  );

  const main_loss_coefficient = main_match.length > 0
    ? main_match[0].C
    : main_data[0]?.C || 0;

  // Calculate pressure values
  const branch_velocity_pressure = Math.pow(Vb / 4005, 2);
  const branch_pressure_loss = branch_loss_coefficient * branch_velocity_pressure;

  const main_velocity_pressure = Math.pow(Vc / 4005, 2);
  const main_pressure_loss = main_loss_coefficient * main_velocity_pressure;

  return {
    "Branch: Velocity (fpm)": Vb,
    "Branch: Vel. Pres (in. w.c.)": branch_velocity_pressure,
    "Branch: Loss Coefficient": branch_loss_coefficient,
    "Branch: Pressure Loss (in. w.c.)": branch_pressure_loss,
    "Main: Velocity (fpm)": Vc,
    "Main: Vel. Pres (in. w.c.)": main_velocity_pressure,
    "Main: Loss Coefficient": main_loss_coefficient,
    "Main: Pressure Loss (in. w.c.)": main_pressure_loss,
  };
}
