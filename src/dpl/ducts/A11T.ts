import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A11T: Diverging 90° Tap with Variable Geometry
 * Inputs: H, W main, W branch, Qc, Qb, angle
 * Complex angle-based filtering with As/Ac grouping
 */
export function A11T_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const H = inputs.entry_1 as number;
  const W_main = inputs.entry_2 as number;
  const W_branch = inputs.entry_3 as number;
  const Qc = inputs.entry_4 as number;
  const Qb = inputs.entry_5 as number;
  const angle = inputs.entry_6 as number;

  // Calculate areas (ft²)
  const A_main = (H * W_main) / 144;
  const A_branch = (H * W_branch) / 144;
  const A_source = (H * (W_main - W_branch)) / 144;

  // Calculate velocities (fpm)
  const Vc = Qc / A_main;
  const Vb = Qb / A_branch;
  const Vs = (Qc - Qb) / A_source;

  // Velocity pressures (in. w.c.)
  const Pvb = Math.pow(Vb / 4005, 2);
  const Pvs = Math.pow(Vs / 4005, 2);
  const Pvc = Math.pow(Vc / 4005, 2);

  // Ratios
  const Vb_Vc = Vb / Vc;
  const Vs_Vc = Vs / Vc;
  const As_Ac = A_source / A_main;

  // --- BRANCH CALCULATIONS ---
  const branch_data = data.rows.filter(
    (row) => row.id === "A11T" && row.PATH === "branch" && row.ANGLE === angle
  );

  const branch_with_diff = branch_data.map((row) => ({
    row,
    diff: Math.abs(row["Vb/Vc"] - Vb_Vc),
  }));
  const closest_branch = branch_with_diff.sort((a, b) => a.diff - b.diff)[0];
  const C_branch = closest_branch?.row.C || 0;
  const branch_loss = C_branch * Pvb;

  // --- MAIN CALCULATIONS ---
  let main_data = data.rows.filter((row) => row.id === "A11T" && row.PATH === "main");

  // Filter based on angle category
  if ([15, 30, 45, 60].includes(angle)) {
    main_data = main_data.filter((row) => row.ANGLE === "15-60");
  } else if (angle === 90) {
    main_data = main_data.filter((row) => row.ANGLE === "90");

    // Further filter by As/Ac grouping for angle 90
    if (As_Ac <= 0.4) {
      main_data = main_data.filter((row) => row["As/Ac"] === "0.1-0.4");
    } else if (As_Ac <= 0.6) {
      main_data = main_data.filter((row) => row["As/Ac"] === "0.5-0.6");
    } else {
      main_data = main_data.filter((row) => row["As/Ac"] === "0.7-0.9");
    }
  }

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
