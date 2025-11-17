import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A11A: Diverging Junction - Round Tee or Wye
 * Inputs: D main, D branch, Angle, Qc, Qb
 * Uses angle-specific lookup
 */
export function A11A_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const entry_1 = inputs.entry_1 as number; // D main (inches)
  const entry_2 = inputs.entry_2 as number; // D branch (inches)
  const entry_3 = inputs.entry_3 as number; // Angle (degrees)
  const entry_4 = inputs.entry_4 as number; // Qc - Converged flow (cfm)
  const entry_5 = inputs.entry_5 as number; // Qb - Branch flow (cfm)

  // Calculate areas
  const A_main = (Math.PI * Math.pow(entry_1 / 2, 2)) / 144; // ft²
  const A_branch = (Math.PI * Math.pow(entry_2 / 2, 2)) / 144; // ft²

  // Calculate velocities
  const Vc = entry_4 / A_main;
  const Vs = (entry_4 - entry_5) / A_main;
  const Vb = entry_5 / A_branch;

  // Velocity pressures
  const Pvb = Math.pow(Vb / 4005, 2);
  const Pvs = Math.pow(Vs / 4005, 2);
  const Pvc = Math.pow(Vc / 4005, 2);

  // --- BRANCH CALCULATIONS ---
  const angle_name = `Tee or Wye, ${Math.round(entry_3)}°`;
  const branch_data = data.rows.filter(
    (row) => row.id === "A11A" && row.PATH === "branch" && row.NAME === angle_name
  );

  const Ab_Ac = A_branch / A_main;
  const Qb_Qc = entry_5 / entry_4;

  // Match: Ab/Ac >= Ab_Ac AND Qb/Qc >= Qb_Qc, take smallest
  const branch_filtered = branch_data.filter(
    (row) => row["Ab/Ac"] >= Ab_Ac && row["Qb/Qc"] >= Qb_Qc
  );
  const branch_row = branch_filtered.length > 0
    ? branch_filtered.sort((a, b) => {
        const diff_a = a["Ab/Ac"] + a["Qb/Qc"];
        const diff_b = b["Ab/Ac"] + b["Qb/Qc"];
        return diff_a - diff_b;
      })[0]
    : branch_data[0];

  const C_branch = branch_row?.C || 0;
  const branch_loss = C_branch * Pvb;

  // --- MAIN CALCULATIONS ---
  const main_data = data.rows.filter(
    (row) => row.id === "A11A" && row.PATH === "main" && row.NAME === "Tee or Wye, Main"
  );

  const Vs_Vc = Vs / Vc;

  // Match: Vs/Vc >= Vs_Vc, take smallest
  const main_filtered = main_data.filter((row) => row["Vs/Vc"] >= Vs_Vc);
  const main_row = main_filtered.length > 0
    ? main_filtered.sort((a, b) => a["Vs/Vc"] - b["Vs/Vc"])[0]
    : main_data[0];

  const C_main = main_row?.C || 0;
  const main_loss = C_main * Pvc;

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
