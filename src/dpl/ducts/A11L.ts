import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A11L: Diverging Junction - Round Tee
 * Inputs: D main, D branch, Qc, Qb
 * Uses Vb/Vc matching for branch
 */
export function A11L_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const entry_1 = inputs.entry_1 as number; // D main (inches)
  const entry_2 = inputs.entry_2 as number; // D branch (inches)
  const entry_3 = inputs.entry_3 as number; // Qc - Converged flow (cfm)
  const entry_4 = inputs.entry_4 as number; // Qb - Branch flow (cfm)

  // Calculate areas
  const A_main = (Math.PI * Math.pow(entry_1 / 2, 2)) / 144; // ft²
  const A_branch = (Math.PI * Math.pow(entry_2 / 2, 2)) / 144; // ft²

  // Calculate velocities
  const Vc = entry_3 / A_main;
  const Vs = (entry_3 - entry_4) / A_main;
  const Vb = entry_4 / A_branch;

  // Velocity pressures
  const Pvb = Math.pow(Vb / 4005, 2);
  const Pvs = Math.pow(Vs / 4005, 2);
  const Pvc = Math.pow(Vc / 4005, 2);

  // --- BRANCH CALCULATIONS ---
  const branch_data = data.rows.filter((row) => row.id === "A11L" && row.PATH === "branch");
  const Vb_Vc = Vb / Vc;

  const branch_with_diff = branch_data.map((row) => ({
    row,
    diff: Math.abs(row["Vb/Vc"] - Vb_Vc),
  }));
  const closest_branch = branch_with_diff.sort((a, b) => a.diff - b.diff)[0];
  const C_branch = closest_branch?.row.C || 0;
  const branch_loss = C_branch * Pvb;

  // --- MAIN CALCULATIONS (uses A11A main data) ---
  const main_data = data.rows.filter(
    (row) => row.id === "A11A" && row.PATH === "main" && row.NAME === "Tee or Wye, Main"
  );
  const Vs_Vc = Vs / Vc;

  const main_with_diff = main_data.map((row) => ({
    row,
    diff: Math.abs(row["Vs/Vc"] - Vs_Vc),
  }));
  const closest_main = main_with_diff.sort((a, b) => a.diff - b.diff)[0];
  const C_main = closest_main?.row.C || 0;
  const main_loss = C_main * Pvs;

  return {
    "Branch: Velocity (fpm)": Vb,
    "Branch: Vel. Pres (in. w.c.)": Pvb,
    "Branch: Loss Coefficient": C_branch,
    "Branch: Pressure Loss (in. w.c.)": branch_loss,
    "Main: Source Velocity (fpm)": Vs,
    "Main: Converged Velocity (fpm)": Vc,
    "Main: Source Vel. Pres (in. w.c.)": Pvs,
    "Main: Converged Vel. Pres (in. w.c.)": Pvc,
    "Main: Loss Coefficient": C_main,
    "Main: Pressure Loss (in. w.c.)": main_loss,
  };
}
