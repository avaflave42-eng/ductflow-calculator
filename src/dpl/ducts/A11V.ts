import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A11V: 90° Curved Rectangular Wye
 * Inputs: H, Wc, Wb, Ws, Qc, Qb
 * Uses Ab/As, Ab/Ac, and Qb/Qc triple matching
 */
export function A11V_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const H = inputs.entry_1 as number;
  const W_c = inputs.entry_2 as number;
  const W_b = inputs.entry_3 as number;
  const W_s = inputs.entry_4 as number;
  const Q_c = inputs.entry_5 as number;
  const Q_b = inputs.entry_6 as number;

  // Calculate areas (in² then convert to ft²)
  const A_c_in2 = H * W_c;
  const A_s_in2 = H * W_s;
  const A_b_in2 = H * W_b;
  const A_c = A_c_in2 / 144;
  const A_s = A_s_in2 / 144;
  const A_b = A_b_in2 / 144;

  // Calculate velocities (fpm)
  const V_c = Q_c / A_c;
  const V_b = Q_b / A_b;
  const V_s = (Q_c - Q_b) / A_s;

  // Velocity pressures (in. w.c.)
  const Pvc = Math.pow(V_c / 4005, 2);
  const Pvb = Math.pow(V_b / 4005, 2);
  const Pvs = Math.pow(V_s / 4005, 2);

  // Ratios
  const Ab_As = A_b_in2 / A_s_in2;
  const Ab_Ac = A_b_in2 / A_c_in2;
  const Qb_Qc = Q_b / Q_c;
  const Vs_Vc = V_s / V_c;

  // --- BRANCH CALCULATIONS ---
  const branch_data = data.rows.filter((row) => row.id === "A11V" && row.PATH === "branch");

  const branch_with_diff = branch_data.map((row) => {
    const row_qb_qc = row["Qb/Qc"];
    
    // Special Qb/Qc filtering logic
    let qb_qc_diff: number;
    if (Qb_Qc <= 0.7) {
      qb_qc_diff = Math.abs(row_qb_qc - Qb_Qc);
    } else {
      // If Qb_Qc > 0.7, use rows >= Qb_Qc
      qb_qc_diff = row_qb_qc >= Qb_Qc ? row_qb_qc - Qb_Qc : Infinity;
    }

    return {
      row,
      ab_as_diff: Math.abs(row["Ab/As"] - Ab_As),
      ab_ac_diff: Math.abs(row["Ab/Ac"] - Ab_Ac),
      qb_qc_diff,
    };
  });

  const closest_branch = branch_with_diff.sort(
    (a, b) => a.ab_as_diff - b.ab_as_diff || a.ab_ac_diff - b.ab_ac_diff || a.qb_qc_diff - b.qb_qc_diff
  )[0];
  const C_branch = closest_branch?.row.C || 0;
  const branch_loss = C_branch * Pvb;

  // --- MAIN CALCULATIONS ---
  const main_data = data.rows.filter((row) => row.id === "A11V" && row.PATH === "main");

  const main_with_diff = main_data.map((row) => {
    const row_qb_qc = row["Qb/Qc"];
    
    // Same Qb/Qc filtering logic for main
    let qb_qc_diff: number;
    if (Qb_Qc <= 0.7) {
      qb_qc_diff = Math.abs(row_qb_qc - Qb_Qc);
    } else {
      qb_qc_diff = row_qb_qc >= Qb_Qc ? row_qb_qc - Qb_Qc : Infinity;
    }

    return {
      row,
      ab_as_diff: Math.abs(row["Ab/As"] - Ab_As),
      ab_ac_diff: Math.abs(row["Ab/Ac"] - Ab_Ac),
      qb_qc_diff,
    };
  });

  const closest_main = main_with_diff.sort(
    (a, b) => a.ab_as_diff - b.ab_as_diff || a.ab_ac_diff - b.ab_ac_diff || a.qb_qc_diff - b.qb_qc_diff
  )[0];
  const C_main = closest_main?.row.C || 0;
  const main_loss = C_main * Pvs;

  return {
    "Branch: Velocity (fpm)": V_b,
    "Branch: Vel. Pres (in. w.c.)": Pvb,
    "Branch: Loss Coefficient": C_branch,
    "Branch: Pressure Loss (in. w.c.)": branch_loss,
    "Main: Source Velocity (fpm)": V_s,
    "Main: Converged Velocity (fpm)": V_c,
    "Main: Source Vel. Pres (in. w.c.)": Pvs,
    "Main: Converged Vel. Pres (in. w.c.)": Pvc,
    "Main: Loss Coefficient": C_main,
    "Main: Pressure Loss (in. w.c.)": main_loss,
  };
}
