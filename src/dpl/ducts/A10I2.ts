import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A10I2: Symmetrical Rectangular Wye
 * Inputs: H, W branch, Angle, Q1b, Q2b
 * Outputs: Branch 1 (4), Branch 2 (4), Main (2)
 */
export function A10I2_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const entry_1 = inputs.entry_1 as number; // H - Height (inches)
  const entry_2 = inputs.entry_2 as number; // W branch - Branch Width (inches)
  const entry_3 = inputs.entry_3 as number; // Angle (degrees)
  const entry_4 = inputs.entry_4 as number; // Q1b - Branch 1 flow (cfm)
  const entry_5 = inputs.entry_5 as number; // Q2b - Branch 2 flow (cfm)

  // Calculate areas
  const A_branch = (entry_1 * entry_2) / 144; // ft²
  const A_main = 2 * A_branch;
  const Qc = entry_4 + entry_5;

  // Main velocity
  const Vc = Qc / A_main;
  const VPc = Math.pow(Vc / 4005, 2);

  // Helper function to compute branch outputs
  const computeBranch = (qb: number, label: string): Record<string, number> => {
    const qb_qc_ratio = qb / Qc;

    // Find matching row: ANGLE >= entry_3 AND Q_1b/Qc >= qb_qc_ratio
    const a10i2_data = data.rows.filter((row) => row.id === "A10I2");
    const valid_rows = a10i2_data.filter(
      (row) =>
        row.ANGLE >= entry_3 &&
        row["Q_1b/Qc or Q_2b/Qc"] >= qb_qc_ratio
    );

    const selected_row = valid_rows.length > 0
      ? valid_rows.sort((a, b) => {
          // Sort by ANGLE first, then by Q ratio
          if (a.ANGLE !== b.ANGLE) return a.ANGLE - b.ANGLE;
          return a["Q_1b/Qc or Q_2b/Qc"] - b["Q_1b/Qc or Q_2b/Qc"];
        })[0]
      : a10i2_data[a10i2_data.length - 1];

    const C = selected_row.C;
    const Vb = qb / A_branch;
    const VPb = Math.pow(Vb / 4005, 2);
    const P_loss = C * VPb;

    return {
      [`${label}: Velocity (fpm)`]: Vb,
      [`${label}: Vel. Pres (in. w.c.)`]: VPb,
      [`${label}: Loss Coefficient`]: C,
      [`${label}: Pressure Loss (in. w.c.)`]: P_loss,
    };
  };

  // Compute outputs for both branches
  const branch1 = computeBranch(entry_4, "Branch 1");
  const branch2 = computeBranch(entry_5, "Branch 2");

  return {
    ...branch1,
    ...branch2,
    "Main, Converged: Velocity (fpm)": Vc,
    "Main: Vel. Pres (in. w.c.)": VPc,
  };
}
