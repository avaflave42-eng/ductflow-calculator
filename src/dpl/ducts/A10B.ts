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

  const Q_source = entry_3;
  const Q_branch = entry_4;
  const Q_converged = Q_source + Q_branch;

  // Areas (ft²)
  const area_main = (Math.PI * Math.pow(entry_1 / 2, 2)) / 144;
  const area_branch = (Math.PI * Math.pow(entry_2 / 2, 2)) / 144;

  // Velocities (fpm)
  const velocity_branch = Q_branch / area_branch;
  const velocity_source = Q_source / area_main;
  const velocity_converged = Q_converged / area_main;

  // Ratios
  const Ab_Ac = area_branch / area_main; // Ab/Ac
  const Qb_Qc = Q_branch / Q_converged; // Qb/Qc

  // ---------------- BRANCH (PATH="branch") ----------------
  const branch_data = data.rows.filter((row) => row.id === "A10B" && row.PATH === "branch");

  if (branch_data.length === 0) {
    throw new Error("No A10B branch data found in master table");
  }

  // Filter rows with Ab/Ac <= target; if none, use all
  const branch_with_ab = branch_data.filter((row) => typeof row["Ab/Ac"] === "number");
  let branch_candidates = branch_with_ab.filter((row) => row["Ab/Ac"] <= Ab_Ac) || [];

  if (branch_candidates.length === 0) {
    branch_candidates = branch_with_ab;
  }

  // Among candidates, pick rows with max Ab/Ac
  const maxAbAc = Math.max(...branch_candidates.map((row) => row["Ab/Ac"]));
  const branch_ab_band = branch_candidates.filter((row) => row["Ab/Ac"] === maxAbAc);

  // Within that band, pick Qb/Qc >= target with smallest Qb/Qc
  const band_with_q = branch_ab_band.filter((row) => typeof row["Qb/Qc"] === "number");
  let branch_row: any;

  const branch_q_ge = band_with_q.filter((row) => row["Qb/Qc"] >= Qb_Qc);
  if (branch_q_ge.length > 0) {
    const minQbQc = Math.min(...branch_q_ge.map((row) => row["Qb/Qc"]));
    branch_row = branch_q_ge.find((row) => row["Qb/Qc"] === minQbQc);
  } else {
    // Fallback: use row with largest Qb/Qc in the band
    const maxQbQc = Math.max(...band_with_q.map((row) => row["Qb/Qc"]));
    branch_row = band_with_q.find((row) => row["Qb/Qc"] === maxQbQc);
  }

  if (!branch_row || typeof branch_row.C !== "number") {
    throw new Error("No valid A10B branch row found for given ratios");
  }

  const branch_loss_coefficient = branch_row.C as number;

  // ---------------- MAIN (PATH="main") ----------------
  const main_data = data.rows.filter((row) => row.id === "A10B" && row.PATH === "main");

  if (main_data.length === 0) {
    throw new Error("No A10B main data found in master table");
  }

  const main_with_q = main_data.filter((row) => typeof row["Qb/Qc"] === "number");

  let main_row: any;
  const main_q_ge = main_with_q.filter((row) => row["Qb/Qc"] >= Qb_Qc);
  if (main_q_ge.length > 0) {
    const minQbQc = Math.min(...main_q_ge.map((row) => row["Qb/Qc"]));
    main_row = main_q_ge.find((row) => row["Qb/Qc"] === minQbQc);
  } else {
    const maxQbQc = Math.max(...main_with_q.map((row) => row["Qb/Qc"]));
    main_row = main_with_q.find((row) => row["Qb/Qc"] === maxQbQc);
  }

  if (!main_row || typeof main_row.C !== "number") {
    throw new Error("No valid A10B main row found for given ratios");
  }

  const main_loss_coefficient = main_row.C as number;

  // ---------------- PRESSURE CALCS ----------------
  const branch_velocity_pressure = Math.pow(velocity_branch / 4005, 2);
  const source_velocity_pressure = Math.pow(velocity_source / 4005, 2);
  const converged_velocity_pressure = Math.pow(velocity_converged / 4005, 2);

  const branch_pressure_loss = branch_loss_coefficient * branch_velocity_pressure;
  // Main uses SOURCE velocity pressure (Pvs)
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
