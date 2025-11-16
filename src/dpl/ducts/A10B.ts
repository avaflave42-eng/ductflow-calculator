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
  
  // Match Qb/Qc (>= Qb_Qc, take smallest)
  const branch_q_sorted = branch_data.sort((a, b) => a["Qb/Qc"] - b["Qb/Qc"]);
  const valid_branch_q = branch_q_sorted.filter((row) => row["Qb/Qc"] >= Qb_Qc);
  const closest_branch_q = valid_branch_q.length > 0
    ? valid_branch_q[0]
    : branch_q_sorted[branch_q_sorted.length - 1];

  // Match Ab/Ac (<= Ab_Ac, take largest)
  const branch_a_sorted = branch_data.sort((a, b) => a["Ab/Ac"] - b["Ab/Ac"]);
  const valid_branch_a = branch_a_sorted.filter((row) => row["Ab/Ac"] <= Ab_Ac);
  const closest_branch_a = valid_branch_a.length > 0
    ? valid_branch_a[valid_branch_a.length - 1]
    : branch_a_sorted[0];

  const branch_loss_coefficient = closest_branch_q.C * closest_branch_a.C;

  // --- MAIN CALCULATIONS ---
  const main_data = data.rows.filter((row) => row.id === "A10B" && row.PATH === "main");

  // Match Qb/Qc (>= Qb_Qc, take smallest)
  const main_q_sorted = main_data.sort((a, b) => a["Qb/Qc"] - b["Qb/Qc"]);
  const valid_main_q = main_q_sorted.filter((row) => row["Qb/Qc"] >= Qb_Qc);
  const closest_main_q = valid_main_q.length > 0
    ? valid_main_q[0]
    : main_q_sorted[main_q_sorted.length - 1];

  // Match Ab/Ac (<= Ab_Ac, take largest)
  const main_a_sorted = main_data.sort((a, b) => a["Ab/Ac"] - b["Ab/Ac"]);
  const valid_main_a = main_a_sorted.filter((row) => row["Ab/Ac"] <= Ab_Ac);
  const closest_main_a = valid_main_a.length > 0
    ? valid_main_a[valid_main_a.length - 1]
    : main_a_sorted[0];

  const main_loss_coefficient = closest_main_q.C * closest_main_a.C;

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
