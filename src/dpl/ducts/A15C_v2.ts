import { CalcInputs, CalcOutputs, MasterData } from "../types";
import { interpolate1D, extract1DPoints } from "../interpolation";

/**
 * A15C V2: Exit - Segmental Opening in Round Duct (INTERPOLATED)
 * Inputs: D, h (segment height), Q
 * Uses 1D linear interpolation on h/D ratio
 */
export function A15C_calc_v2(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const D = inputs.entry_1 as number;
  const h = inputs.entry_2 as number;
  const Q = inputs.entry_3 as number;

  // Calculate velocity
  const A = (Math.PI * Math.pow(D / 2, 2)) / 144; // ft²
  const V = Q / A; // fpm
  const vp = Math.pow(V / 4005, 2);

  // Calculate h/D ratio
  const h_D = h / D;

  // Get all A15C rows and extract h/D vs C data points
  const a15c_rows = data.rows.filter((row) => row.id === "A15C");
  const points = extract1DPoints(a15c_rows, "h/D", "C");

  // Interpolate C value based on h/D ratio
  const C = interpolate1D(h_D, points);

  const pressure_loss = C * vp;

  return {
    "Velocity (fpm)": V,
    "Vel. Pres (in. w.c.)": vp,
    "Loss Coefficient": C,
    "Pressure Loss (in. w.c.)": pressure_loss,
  };
}
