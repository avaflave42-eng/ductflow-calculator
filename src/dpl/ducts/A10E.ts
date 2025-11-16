import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A10E: Converging Junction - Round (Different Diameters, 45° branch)
 * Inputs: D source, D converging, D branch, Q source, Q branch
 * Outputs: Branch and Main calculations
 * Note: Enforces minimum Qb/Qs of 0.2
 */
export function A10E_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const entry_1 = inputs.entry_1 as number; // D source (inches)
  const entry_2 = inputs.entry_2 as number; // D converging (inches)
  const entry_3 = inputs.entry_3 as number; // D branch (inches)
  const entry_4 = inputs.entry_4 as number; // Q source (cfm)
  const entry_5 = inputs.entry_5 as number; // Q branch (cfm)

  // Calculate areas
  const area_source = (Math.PI * Math.pow(entry_1 / 2, 2)) / 144; // ft²
  const area_converging = (Math.PI * Math.pow(entry_2 / 2, 2)) / 144; // ft²
  const area_branch = (Math.PI * Math.pow(entry_3 / 2, 2)) / 144; // ft²

  // Calculate velocities
  const velocity_branch = entry_5 / area_branch;
  const velocity_converged = (entry_4 + entry_5) / area_converging;
  const velocity_source = entry_4 / area_source;

  // Calculate ratios
  const As_Ac = area_source / area_converging;
  const Ab_Ac = area_branch / area_converging;
  let Qb_Qs = entry_5 / entry_4;

  // Enforce minimum Qb/Qs of 0.2
  if (Qb_Qs < 0.2) {
    Qb_Qs = 0.2;
  }

  // --- BRANCH CALCULATIONS (uses A10E data with PATH = "branch") ---
  const branch_data = data.rows.filter((row) => row.id === "A10E" && row.PATH === "branch");

  // Match: As/Ac >= As_Ac, Ab/Ac <= Ab_Ac, Qb/Qs >= Qb_Qs
  const branch_match = branch_data.filter(
    (row) =>
      row["As/Ac"] >= As_Ac &&
      row["Ab/Ac"] <= Ab_Ac &&
      row["Qb/Qs"] >= Qb_Qs
  );

  const branch_loss_coefficient = branch_match.length > 0
    ? branch_match[0].C
    : branch_data[branch_data.length - 1]?.C || 0;

  // --- MAIN CALCULATIONS (uses A10M data with PATH = "main") ---
  const main_data = data.rows.filter((row) => row.id === "A10M" && row.PATH === "main");

  // Match: As/Ac <= As_Ac, Ab/Ac >= Ab_Ac, Qb/Qs <= Qb_Qs
  const main_match = main_data.filter(
    (row) =>
      row["As/Ac"] <= As_Ac &&
      row["Ab/Ac"] >= Ab_Ac &&
      row["Qb/Qs"] <= Qb_Qs
  );

  const main_loss_coefficient = main_match.length > 0
    ? main_match[main_match.length - 1].C
    : main_data[0]?.C || 0;

  // Calculate pressure values
  const branch_velocity_pressure = Math.pow(velocity_branch / 4005, 2);
  const branch_pressure_loss = branch_loss_coefficient * branch_velocity_pressure;

  const main_velocity_pressure = Math.pow(velocity_converged / 4005, 2);
  const main_pressure_loss = main_loss_coefficient * main_velocity_pressure;

  return {
    "Branch: Velocity (fpm)": velocity_branch,
    "Branch: Vel. Pres (in. w.c.)": branch_velocity_pressure,
    "Branch: Loss Coefficient": branch_loss_coefficient,
    "Branch: Pressure Loss (in. w.c.)": branch_pressure_loss,
    "Main: Velocity (fpm)": velocity_converged,
    "Main: Vel. Pres (in. w.c.)": main_velocity_pressure,
    "Main: Loss Coefficient": main_loss_coefficient,
    "Main: Pressure Loss (in. w.c.)": main_pressure_loss,
  };
}
