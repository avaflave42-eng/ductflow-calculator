import { CalcInputs, CalcOutputs, MasterData } from "../types";

/**
 * A13F1: Rectangular Exit with Aspect Ratio
 * Inputs: H, W, angle, v_ref, Q, obstruction, n
 * Uses H/W aspect ratio grouping, angle, and V/V0 matching
 */
export function A13F1_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const H = inputs.entry_1 as number;
  const W = inputs.entry_2 as number;
  const angle = inputs.entry_3 as number;
  const v_ref = inputs.entry_4 as number; // fps
  const Q = inputs.entry_5 as number;
  const obstruction = inputs.entry_6 as string;
  const n = inputs.entry_7 as number | undefined;

  // Calculate area and velocity
  const A = H * W;
  const V = Q / (A / 144); // fpm
  const V_fps = V / 60; // convert to fps
  const V_V0 = V_fps / v_ref;

  // Calculate aspect ratio
  const aspect_ratio = H / W;

  // --- FILTER BY ASPECT RATIO GROUP ---
  let aspect_group: string;
  if (aspect_ratio <= 0.2) {
    aspect_group = "0.1-0.2";
  } else if (aspect_ratio <= 2.0) {
    aspect_group = "0.5-2.0";
  } else {
    aspect_group = "5-10";
  }

  const base_data = data.rows.filter(
    (row) => row.id === "A13F1" && row["H/W"] === aspect_group
  );

  const angle_vals = [...new Set(base_data.map((r) => r.ANGLE))].sort((a, b) => a - b);
  const VV_vals = [...new Set(base_data.map((r) => r["V/V0"]))].sort((a, b) => a - b);

  // Round angle down
  const angle_match = angle_vals.filter((v) => v <= angle).pop() || angle_vals[0];
  
  // Round V/V0 up
  const VV_match = VV_vals.filter((v) => v >= V_V0).shift() || VV_vals[VV_vals.length - 1];

  const matched_row = base_data.find(
    (row) => row.ANGLE === angle_match && row["V/V0"] === VV_match
  );
  const C = matched_row?.C || 0;

  // --- SCREEN OBSTRUCTION CORRECTION ---
  let C_total = C;
  if (obstruction === "screen" && n !== undefined) {
    const screen_data = data.rows.filter((row) => row.id === "A14A1");
    const n_vals = [...new Set(screen_data.map((r) => r["n, free area ratio"]))].sort((a, b) => a - b);
    const n_match = n_vals.filter((v) => v <= n).pop() || n_vals[0];
    const screen_row = screen_data.find((row) => row["n, free area ratio"] === n_match);
    const C1 = screen_row?.C || 0;

    C_total = C + C1;
  }

  // Calculate pressure loss
  const vp = Math.pow(V / 4005, 2);
  const pressure_loss = C_total * vp;

  return {
    "Velocity (fpm)": V,
    "Velocity Ratio (V/V0)": V_V0,
    "Loss Coefficient": C_total,
    "Pressure Loss (in. w.c.)": pressure_loss,
  };
}
