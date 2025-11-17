import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A10F: Converging Junction - Rectangular (45° branch, Ab = Ac/2)
 * Same as A10C but different data table
 * Inputs: Main Height, Main Width, Q source, Q branch
 * Error check: Qb/Qs >= 0.4
 */
export function A10F_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const entry_1 = inputs.entry_1 as number; // Main Height (inches)
  const entry_2 = inputs.entry_2 as number; // Main Width (inches)
  const entry_3 = inputs.entry_3 as number; // Q source (cfm)
  const entry_4 = inputs.entry_4 as number; // Q branch (cfm)

  // Calculate areas
  const area_main = (entry_1 * entry_2) / 144; // ft²
  const area_branch = area_main / 2; // Ab = Ac/2

  // Calculate flow rates and velocities
  const Q_converged = entry_3 + entry_4;
  const velocity_source = entry_3 / area_main;
  const velocity_converged = Q_converged / area_main;
  const velocity_branch = entry_4 / area_branch;

  // Calculate ratios
  const As_Ac = 1.0; // Source and converged are the same dimensions
  const Ab_Ac = 0.5; // Branch area is half the main
  const Qb_Qc = entry_4 / Q_converged;
  const Qb_Qs = entry_4 / entry_3;

  // ERROR CHECK: Qb/Qs must be >= 0.4
  if (Qb_Qs < 0.4) {
    return {
      "Error": "Invalid Input: Qb/Qs must be at least 0.4. Increase branch flow rate (Qb) or decrease source flow rate (Qs).",
    };
  }

  // --- BRANCH CALCULATIONS (uses A10F data with PATH = "branch") ---
  const branch_data = data.rows.filter((row) => row.id === "A10F" && row.PATH === "branch");

  // Match Vc (<= velocity_converged, take largest)
  const vc_sorted = branch_data.sort((a, b) => a.Vc - b.Vc);
  const valid_vc = vc_sorted.filter((row) => row.Vc <= velocity_converged);
  const branch_vc_row = valid_vc.length > 0
    ? valid_vc[valid_vc.length - 1]
    : vc_sorted[0];

  // Match Qb/Qc (>= Qb_Qc, take smallest)
  const qb_qc_sorted = branch_data.sort((a, b) => a["Qb/Qc"] - b["Qb/Qc"]);
  const valid_qb_qc = qb_qc_sorted.filter((row) => row["Qb/Qc"] >= Qb_Qc);
  const branch_qb_qc_row = valid_qb_qc.length > 0
    ? valid_qb_qc[0]
    : qb_qc_sorted[qb_qc_sorted.length - 1];

  const branch_loss_coefficient = branch_qb_qc_row.C;

  // --- MAIN CALCULATIONS (uses A10M data with PATH = "main") ---
  const main_data = data.rows.filter((row) => row.id === "A10M" && row.PATH === "main");

  // Match closest As/Ac
  const main_as_ac_diff = main_data.map((row) => ({
    row,
    diff: Math.abs(row["As/Ac"] - As_Ac),
  }));
  const main_as_ac_row = main_as_ac_diff.sort((a, b) => a.diff - b.diff)[0];

  // Match: Ab/Ac >= Ab_Ac
  const main_ab_ac_match = main_data.filter((row) => row["Ab/Ac"] >= Ab_Ac);
  const main_ab_ac_row =
    main_ab_ac_match.length > 0 ? main_ab_ac_match[0] : main_data[main_data.length - 1];

  // Match: Qb/Qs <= Qb_Qs
  const main_qb_qs_match = main_data.filter((row) => row["Qb/Qs"] <= Qb_Qs);
  const main_loss_coefficient =
    main_qb_qs_match.length > 0 
      ? main_qb_qs_match[main_qb_qs_match.length - 1].C 
      : main_data[0]?.C || 0;

  // Calculate pressure values
  const branch_velocity_pressure = Math.pow(velocity_branch / 4005, 2);
  const branch_pressure_loss = branch_loss_coefficient * branch_velocity_pressure;

  const source_velocity_pressure = Math.pow(velocity_source / 4005, 2);
  const converged_velocity_pressure = Math.pow(velocity_converged / 4005, 2);
  const main_pressure_loss = main_loss_coefficient * source_velocity_pressure;

  return {
    "Branch: Velocity (fpm)": velocity_branch,
    "Branch: Vel. Pres (in. w.c.)": branch_velocity_pressure,
    "Branch: Loss Coefficient": branch_loss_coefficient,
    "Branch: Pressure Loss (in. w.c.)": branch_pressure_loss,
    "Main, Source: Velocity (fpm)": velocity_source,
    "Main, Converged: Velocity (fpm)": velocity_converged,
    "Main, Source: Vel. Pres (in. w.c.)": source_velocity_pressure,
    "Main, Converged: Vel. Pres (in. w.c.)": converged_velocity_pressure,
    "Main: Loss Coefficient": main_loss_coefficient,
    "Main: Pressure Loss (in. w.c.)": main_pressure_loss,
  };
}
