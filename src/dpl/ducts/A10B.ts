import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A10B: Converging Junction - Round Ducts (30° branch)
 * Inputs: D main, D branch, Q source, Q branch
 * Outputs: Branch and Main calculations
 */
export function A10B_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const entry_1 = inputs.entry_1 as number; // D main (inches)
  const entry_2 = inputs.entry_2 as number; // D branch (inches)
  const entry_3 = inputs.entry_3 as number; // Q source (cfm)
  const entry_4 = inputs.entry_4 as number; // Q branch (cfm)

  // Calculate areas
  const area_main = (Math.PI * Math.pow(entry_1 / 2, 2)) / 144; // ft²
  const area_branch = (Math.PI * Math.pow(entry_2 / 2, 2)) / 144; // ft²
  const Q_converged = entry_3 + entry_4;

  // Calculate velocities
  const velocity_branch = entry_4 / area_branch;
  const velocity_source = entry_3 / area_main;
  const velocity_converged = Q_converged / area_main;

  // --- BRANCH CALCULATIONS ---
  const Qb_Qc = entry_4 / Q_converged;
  const Ab_Ac = area_branch / area_main;

  const branch_data = data.rows.filter((row) => row.id === "A10B" && row.PATH === "branch");
  
  // Find best matching row based on both Qb/Qc and Ab/Ac
  const branch_with_diff = branch_data.map((row) => ({
    row,
    qb_diff: Math.abs(row["Qb/Qc"] - Qb_Qc),
    ab_diff: Math.abs(row["Ab/Ac"] - Ab_Ac),
  }));
  
  const closest_branch = branch_with_diff.sort((a, b) => {
    // Prioritize Qb/Qc match, then Ab/Ac
    if (a.qb_diff !== b.qb_diff) return a.qb_diff - b.qb_diff;
    return a.ab_diff - b.ab_diff;
  })[0];

  const branch_loss_coefficient = closest_branch?.row.C || 0;

  // --- MAIN CALCULATIONS ---
  const main_data = data.rows.filter((row) => row.id === "A10B" && row.PATH === "main");

  // Find best matching row based on both Qb/Qc and Ab/Ac
  const main_with_diff = main_data.map((row) => ({
    row,
    qb_diff: Math.abs(row["Qb/Qc"] - Qb_Qc),
    ab_diff: Math.abs(row["Ab/Ac"] - Ab_Ac),
  }));
  
  const closest_main = main_with_diff.sort((a, b) => {
    // Prioritize Qb/Qc match, then Ab/Ac
    if (a.qb_diff !== b.qb_diff) return a.qb_diff - b.qb_diff;
    return a.ab_diff - b.ab_diff;
  })[0];

  const main_loss_coefficient = closest_main?.row.C || 0;

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
    "Main, Source: Velocity (fpm)": velocity_source,
    "Main, Converged: Velocity (fpm)": velocity_converged,
    "Main: Vel. Pres (in. w.c.)": main_velocity_pressure,
    "Main: Loss Coefficient": main_loss_coefficient,
    "Main: Pressure Loss (in. w.c.)": main_pressure_loss,
  };
}
