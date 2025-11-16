import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A11X: Symmetrical Wye - Rectangular
 * Inputs: H, Wc, angle, Qb1, Qb2
 * Produces dual_branch output with angle and Vb/Vc filtering
 */
export function A11X_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const H = inputs.entry_1 as number;
  const Wc = inputs.entry_2 as number;
  const theta = inputs.entry_3 as number; // angle in degrees
  const Qb1 = inputs.entry_4 as number;
  const Qb2 = inputs.entry_5 as number;

  // Calculate areas (ft²)
  const H_ft = H / 12;
  const Wc_ft = Wc / 12;
  const A_main = H_ft * Wc_ft;
  const A_branch = A_main / 2;
  const Qc = Qb1 + Qb2;

  // Main velocities
  const Vc = Qc / A_main;
  const VPc = Math.pow(Vc / 4005, 2);

  // Helper function to compute branch outputs
  const computeBranch = (qb: number) => {
    const Vb = qb / A_branch;
    const VPb = Math.pow(Vb / 4005, 2);
    const Vb_Vc = Vb / Vc;

    const branch_data = data.rows.filter((row) => row.id === "A11X");

    // Filter: ANGLE >= theta and Vb/Vc >= calculated
    const filtered = branch_data.filter((row) => {
      const row_angle = row.ANGLE;
      const row_vb_vc = row["V_1b/Vc or V_2b/Vc"];
      return row_angle >= theta && row_vb_vc >= Vb_Vc;
    });

    let matched_row;
    if (filtered.length === 0) {
      // Fall back to last row if no match
      matched_row = branch_data[branch_data.length - 1];
    } else {
      // Sort by ANGLE then by Vb/Vc and take first
      matched_row = filtered.sort((a, b) => {
        if (a.ANGLE !== b.ANGLE) return a.ANGLE - b.ANGLE;
        return a["V_1b/Vc or V_2b/Vc"] - b["V_1b/Vc or V_2b/Vc"];
      })[0];
    }

    const C = matched_row?.C || 0;
    const P_loss = C * VPb;

    return {
      Vb,
      VPb,
      C,
      P_loss,
    };
  };

  const branch1 = computeBranch(Qb1);
  const branch2 = computeBranch(Qb2);

  return {
    "Branch 1: Velocity (fpm)": branch1.Vb,
    "Branch 1: Vel. Pres (in. w.c.)": branch1.VPb,
    "Branch 1: Loss Coefficient": branch1.C,
    "Branch 1: Pressure Loss (in. w.c.)": branch1.P_loss,
    "Branch 2: Velocity (fpm)": branch2.Vb,
    "Branch 2: Vel. Pres (in. w.c.)": branch2.VPb,
    "Branch 2: Loss Coefficient": branch2.C,
    "Branch 2: Pressure Loss (in. w.c.)": branch2.P_loss,
    "Main: Converged Velocity (fpm)": Vc,
    "Main: Converged Vel. Pres (in. w.c.)": VPc,
  };
}
