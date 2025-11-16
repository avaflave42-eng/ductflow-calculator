import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A10D: Converging Junction - Rectangular (30° branch, Ab = Ac/2)
 * Inputs: Main Height, Main Width, Q source, Q branch
 * Outputs: Branch and Main calculations
 * Error check: Qb/Qs >= 0.4
 */
export function A10D_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
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
  const qb_qc_ratio = entry_4 / Q_converged;
  const qb_qs_ratio = entry_4 / entry_3;

  // ERROR CHECK: Qb/Qs must be >= 0.4
  if (qb_qs_ratio < 0.4) {
    return {
      "Error": "Invalid Input: Qb/Qs must be at least 0.4. Increase branch flow rate (Qb) or decrease source flow rate (Qs).",
    };
  }

  // --- BRANCH CALCULATIONS (uses A10D data with PATH = "branch") ---
  const branch_data = data.rows.filter((row) => row.id === "A10D" && row.PATH === "branch");

  // Match Vc (<= velocity_converged, take largest)
  const vc_sorted = branch_data.sort((a, b) => a.Vc - b.Vc);
  const valid_vc = vc_sorted.filter((row) => row.Vc <= velocity_converged);
  const branch_vc_row = valid_vc.length > 0
    ? valid_vc[valid_vc.length - 1]
    : vc_sorted[0];

  // Match Qb/Qc (>= qb_qc_ratio, take smallest)
  const qb_qc_sorted = branch_data.sort((a, b) => a["Qb/Qc"] - b["Qb/Qc"]);
  const valid_qb_qc = qb_qc_sorted.filter((row) => row["Qb/Qc"] >= qb_qc_ratio);
  const branch_qb_qc_row = valid_qb_qc.length > 0
    ? valid_qb_qc[0]
    : qb_qc_sorted[qb_qc_sorted.length - 1];

  const branch_loss_coefficient = branch_qb_qc_row.C;

  // --- MAIN CALCULATIONS (uses A10M data with PATH = "main") ---
  const main_data = data.rows.filter((row) => row.id === "A10M" && row.PATH === "main");

  const as_ac_ratio = 1.0;
  const ab_ac_ratio = 0.5;

  // Find closest As/Ac and Ab/Ac match
  const main_with_diff = main_data.map((row) => ({
    ...row,
    as_ac_diff: Math.abs(row["As/Ac"] - as_ac_ratio),
    ab_ac_diff: Math.abs(row["Ab/Ac"] - ab_ac_ratio),
  }));

  const closest_main_row = main_with_diff.sort((a, b) => {
    const diff_a = a.as_ac_diff + a.ab_ac_diff;
    const diff_b = b.as_ac_diff + b.ab_ac_diff;
    return diff_a - diff_b;
  })[0];

  // Match Qb/Qc (>= qb_qc_ratio, take smallest)
  const main_qb_qc_sorted = main_data.sort((a, b) => a["Qb/Qc"] - b["Qb/Qc"]);
  const valid_main_qb_qc = main_qb_qc_sorted.filter((row) => row["Qb/Qc"] >= qb_qc_ratio);
  const main_qb_qc_row = valid_main_qb_qc.length > 0
    ? valid_main_qb_qc[0]
    : main_qb_qc_sorted[main_qb_qc_sorted.length - 1];

  const main_loss_coefficient = main_qb_qc_row.C;

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
