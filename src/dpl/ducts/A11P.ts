import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A11P: Diverging Junction - Rectangular
 * Inputs: H main, W main, H branch, W branch, Qc, Qb
 * Uses special filtering logic for Vb/Vc and Qb/Qc
 */
export function A11P_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const H_main = inputs.entry_1 as number;
  const W_main = inputs.entry_2 as number;
  const H_branch = inputs.entry_3 as number;
  const W_branch = inputs.entry_4 as number;
  const Qc = inputs.entry_5 as number;
  const Qb = inputs.entry_6 as number;

  // Optional height warning
  let height_warning: string | null = null;
  if (H_branch >= H_main - 2) {
    height_warning = "Warning: Branch height should be at least 2 inches smaller than main height.";
  }

  // Calculate areas (ft²)
  const A_main = (H_main * W_main) / 144;
  const A_branch = (H_branch * W_branch) / 144;

  // Calculate velocities (fpm)
  const Vc = Qc / A_main;
  const Vs = (Qc - Qb) / A_main;
  const Vb = Qb / A_branch;

  // Velocity pressures (in. w.c.)
  const Pvb = Math.pow(Vb / 4005, 2);
  const Pvs = Math.pow(Vs / 4005, 2);
  const Pvc = Math.pow(Vc / 4005, 2);

  // Ratios
  const Vb_Vc = Vb / Vc;
  const Qb_Qc = Qb / Qc;
  const Vs_Vc = Vs / Vc;

  // --- BRANCH CALCULATIONS ---
  const branch_data = data.rows.filter((row) => row.id === "A11P" && row.PATH === "branch");

  const branch_with_diff = branch_data.map((row) => {
    const row_vb_vc = row["Vb/Vc"];
    const row_qb_qc = row["Qb/Qc"];

    // Special filtering: Vb/Vc must be >= calculated value
    const vb_vc_diff = row_vb_vc >= Vb_Vc ? Math.abs(row_vb_vc - Vb_Vc) : Infinity;

    // Special filtering for Qb/Qc based on threshold
    let qb_qc_diff: number;
    if (Qb_Qc < 0.5) {
      // If Qb/Qc < 0.5, use row values >= calculated
      qb_qc_diff = row_qb_qc >= Qb_Qc ? Math.abs(row_qb_qc - Qb_Qc) : Infinity;
    } else {
      // If Qb/Qc >= 0.5, use row values <= calculated
      qb_qc_diff = row_qb_qc <= Qb_Qc ? Math.abs(row_qb_qc - Qb_Qc) : Infinity;
    }

    return {
      row,
      vb_vc_diff,
      qb_qc_diff,
    };
  });

  const closest_branch = branch_with_diff.sort(
    (a, b) => a.vb_vc_diff - b.vb_vc_diff || a.qb_qc_diff - b.qb_qc_diff
  )[0];
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

  if (height_warning) {
    result["Warning"] = height_warning;
  }

  return result;
}
