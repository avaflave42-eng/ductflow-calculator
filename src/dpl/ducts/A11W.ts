import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A11W: Symmetrical Wye, Dovetail
 * Inputs: H, W, Ab/Ac (area ratio), Qc
 * Produces dual_branch output (both branches identical)
 */
export function A11W_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const H = inputs.entry_1 as number;
  const Wc = inputs.entry_2 as number;
  const area_ratio = inputs.entry_3 as number; // Branch Area / Main Area
  const Qc = inputs.entry_4 as number;

  // Calculate areas (ft²)
  const A_main = (H * Wc) / 144;
  const A_branch = area_ratio * A_main;

  // Calculate velocities (fpm)
  const Vc = Qc / A_main;
  const Vb = (Qc / 2) / A_branch; // Each branch gets half the total flow

  // Velocity pressures (in. w.c.)
  const VPc = Math.pow(Vc / 4005, 2);
  const VPb = Math.pow(Vb / 4005, 2);

  // --- BRANCH LOSS COEFFICIENT ---
  const branch_data = data.rows.filter((row) => row.id === "A11W");

  // Find exact match for area ratio (rounded to 4 decimals)
  const matched_row = branch_data.find((row) => {
    const row_ratio = row["A_1b/Ac or A_2b/Ac"];
    return Math.abs(row_ratio - area_ratio) < 0.0001;
  });

  const C_branch = matched_row?.C || 0;
  const branch_loss = C_branch * VPb;

  return {
    "Branch 1: Velocity (fpm)": Vb,
    "Branch 1: Vel. Pres (in. w.c.)": VPb,
    "Branch 1: Loss Coefficient": C_branch,
    "Branch 1: Pressure Loss (in. w.c.)": branch_loss,
    "Branch 2: Velocity (fpm)": Vb,
    "Branch 2: Vel. Pres (in. w.c.)": VPb,
    "Branch 2: Loss Coefficient": C_branch,
    "Branch 2: Pressure Loss (in. w.c.)": branch_loss,
    "Main: Converged Velocity (fpm)": Vc,
    "Main: Converged Vel. Pres (in. w.c.)": VPc,
  };
}
