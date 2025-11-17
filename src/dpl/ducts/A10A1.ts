import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A10A1: Converging Junction - Round Ducts (45° branch)
 * Inputs: D main, D branch, Q source, Q branch
 * Outputs: Branch and Main calculations
 */
export function A10A1_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const entry_1 = inputs.entry_1 as number; // D main (inches)
  const entry_2 = inputs.entry_2 as number; // D branch (inches)
  const entry_3 = inputs.entry_3 as number; // Q source (cfm)
  const entry_4 = inputs.entry_4 as number; // Q branch (cfm)

  // Calculate areas
  const area_main = (Math.PI * Math.pow(entry_1 / 2, 2)) / 144; // ft²
  const area_branch = (Math.PI * Math.pow(entry_2 / 2, 2)) / 144; // ft²

  // Calculate velocities
  const velocity_branch = entry_4 / area_branch;
  const velocity_source = entry_3 / area_main;
  const velocity_converged = (entry_3 + entry_4) / area_main;

  // --- BRANCH CALCULATIONS (uses A10A1 data) ---
  const vb_vc_ratio = velocity_branch / velocity_converged;
  const ab_ac_ratio = area_branch / area_main;

  const branch_data = data.rows.filter((row) => row.id === "A10A1");
  const vb_vc_sorted = branch_data.sort((a, b) => a["Vb/Vc"] - b["Vb/Vc"]);
  const valid_vb_vc = vb_vc_sorted.filter((row) => row["Vb/Vc"] >= vb_vc_ratio);
  const branch_vb_vc_row = valid_vb_vc.length > 0
    ? valid_vb_vc[0]
    : vb_vc_sorted[vb_vc_sorted.length - 1];

  const ab_ac_sorted = branch_data.sort((a, b) => a["Ab/Ac"] - b["Ab/Ac"]);
  const valid_ab_ac = ab_ac_sorted.filter((row) => row["Ab/Ac"] >= ab_ac_ratio);
  const branch_ab_ac_row = valid_ab_ac.length > 0
    ? valid_ab_ac[0]
    : ab_ac_sorted[ab_ac_sorted.length - 1];

  const branch_loss_coefficient = branch_ab_ac_row.C;

  // --- MAIN CALCULATIONS (uses A10A2 data) ---
  const vs_vc_ratio = velocity_source / velocity_converged;

  const main_data = data.rows.filter((row) => row.id === "A10A2");
  const vs_vc_sorted = main_data.sort((a, b) => a["Vs/Vc"] - b["Vs/Vc"]);
  const valid_vs_vc = vs_vc_sorted.filter((row) => row["Vs/Vc"] >= vs_vc_ratio);
  const main_vs_vc_row = valid_vs_vc.length > 0
    ? valid_vs_vc[0]
    : vs_vc_sorted[vs_vc_sorted.length - 1];

  const main_ab_ac_sorted = main_data.sort((a, b) => a["Ab/Ac"] - b["Ab/Ac"]);
  const valid_main_ab_ac = main_ab_ac_sorted.filter((row) => row["Ab/Ac"] >= ab_ac_ratio);
  const main_ab_ac_row = valid_main_ab_ac.length > 0
    ? valid_main_ab_ac[0]
    : main_ab_ac_sorted[main_ab_ac_sorted.length - 1];

  const main_loss_coefficient = main_ab_ac_row.C;

  // --- VELOCITY PRESSURES ---
  const branch_velocity_pressure = Math.pow(velocity_branch / 4005, 2);

  // Main: source and converged velocity pressures
  const main_source_velocity_pressure = Math.pow(velocity_source / 4005, 2);     // Pvs
  const main_converged_velocity_pressure = Math.pow(velocity_converged / 4005, 2); // Pvc

  // Losses
  const branch_pressure_loss = branch_loss_coefficient * branch_velocity_pressure;

  // IMPORTANT: main pressure loss uses SOURCE VP (Pvs), not converged VP
  const main_pressure_loss = main_loss_coefficient * main_source_velocity_pressure;

  return {
    "Branch: Velocity (fpm)": velocity_branch,
    "Branch: Vel. Pres (in. w.c.)": branch_velocity_pressure,
    "Branch: Loss Coefficient": branch_loss_coefficient,
    "Branch: Pressure Loss (in. w.c.)": branch_pressure_loss,

    "Main, Source: Velocity (fpm)": velocity_source,
    "Main, Converged: Velocity (fpm)": velocity_converged,
    "Main: Source Vel. Pres (in. w.c.)": main_source_velocity_pressure,
    "Main: Converged Vel. Pres (in. w.c.)": main_converged_velocity_pressure,
    "Main: Loss Coefficient": main_loss_coefficient,
    "Main: Pressure Loss (in. w.c.)": main_pressure_loss,
  };
}
