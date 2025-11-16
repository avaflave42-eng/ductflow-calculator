import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A11U: Diverging Junction - Rectangular Main with Circular Branch
 * Inputs: W main, H main, D branch, Qc, Qb
 * Uses Vb/Vc matching for branch
 */
export function A11U_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const W_main = inputs.entry_1 as number;
  const H_main = inputs.entry_2 as number;
  const D_branch = inputs.entry_3 as number;
  const Qc = inputs.entry_4 as number;
  const Qb = inputs.entry_5 as number;

  // Optional diameter warning
  let warning_message: string | null = null;
  if (D_branch >= W_main - 2) {
    warning_message = "Warning: Branch diameter should be at least 2 inches smaller than main width.";
  }

  // Calculate areas (ft²)
  const A_main = (W_main * H_main) / 144;
  const A_branch = (Math.PI * Math.pow(D_branch / 24, 2)); // D/2 then squared

  // Calculate velocities (fpm)
  const Vc = Qc / A_main;
  const Vb = Qb / A_branch;
  const Vs = (Qc - Qb) / A_main;

  // Velocity pressures (in. w.c.)
  const Pvb = Math.pow(Vb / 4005, 2);
  const Pvs = Math.pow(Vs / 4005, 2);
  const Pvc = Math.pow(Vc / 4005, 2);

  // Ratios
  const Vb_Vc = Vb / Vc;
  const Vs_Vc = Vs / Vc;

  // --- BRANCH CALCULATIONS ---
  const branch_data = data.rows.filter((row) => row.id === "A11U" && row.PATH === "branch");

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

  const main_with_diff = main_data.map((row) => ({
    row,
    diff: Math.abs(row["Vs/Vc"] - Vs_Vc),
  }));
  const closest_main = main_with_diff.sort((a, b) => a.diff - b.diff)[0];
  const C_main = closest_main?.row.C || 0;
  const main_loss = C_main * Pvs;

  const result: CalcOutputs = {
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

  if (warning_message) {
    result["Warning"] = warning_message;
  }

  return result;
}
