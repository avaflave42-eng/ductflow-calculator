import {
  CalcInputs,
  CalcOutputs,
  DuctCalcWithMeta,
  MasterData,
} from "../types";
import {
  getRowsForId,
  pickLastWhereColLTE,
  interp1,
} from "../masterDataHelpers";

function A7A_calc(inputs: CalcInputs, data: MasterData): CalcOutputs {
  const entry1 = inputs["entry_1"] as number | undefined;
  const entry2 = inputs["entry_2"] as number | undefined;
  const entry3 = inputs["entry_3"] as number | undefined;
  const entry4 = inputs["entry_4"] as number | undefined;

  if (
    entry1 == null ||
    entry2 == null ||
    entry3 == null ||
    entry4 == null
  ) {
    throw new Error("Missing required inputs for A7A.");
  }

  const D = entry1;      // diameter [in]
  const RD = entry2;     // R/D
  const angle = entry3;  // angle [deg]
  const Q = entry4;      // flow [cfm]

  // --- BASIC GEOMETRY ---
  const areaFt2 = (Math.PI * (D / 12) ** 2) / 4;
  const velocity = Q / areaFt2; // [ft/min]

  const rowsA7A = getRowsForId(data, "A7A");

  // Get base loss coefficient from R/D
  const rdRows = rowsA7A
    .filter(
      (r) =>
        typeof r["R/D"] === "number" &&
        typeof r["C"] === "number"
    )
    .sort((a, b) => (a["R/D"] as number) - (b["R/D"] as number));

  const rdRow = pickLastWhereColLTE(rdRows, "R/D", RD);
  if (!rdRow) {
    throw new Error(`A7A: no R/D row <= ${RD}`);
  }
  const lossCoefficientBase = rdRow["C"] as number;

  // Get angle correction factor
  const angleRows = rowsA7A
    .filter(
      (r) =>
        typeof r["ANGLE"] === "number" &&
        typeof r["K"] === "number"
    )
    .sort((a, b) => (a["ANGLE"] as number) - (b["ANGLE"] as number));

  let correctionFactor = 1.0;
  if (angleRows.length > 0) {
    const x = angleRows.map((r) => r["ANGLE"] as number);
    const y = angleRows.map((r) => r["K"] as number);
    correctionFactor = interp1(x, y, angle);
  }

  // Reynolds Number Correction Factor (RNCF) - stub for now
  const reynolds_number = 8.5 * D * velocity;
  const equivalent_diameter = 23766.76 * Math.pow(velocity, -1.000794);
  
  let rnc_factor = 1.0;
  if (velocity < (23766.76 / equivalent_diameter)) {
    const re_scaled = reynolds_number / 1e4;
    // Simplified RNCF table lookup (you'll paste the exact logic later)
    const correction_table_re = [1, 2, 3, 4, 6, 8, 10, 14, 20];
    const correction_table_05 = [1.40, 1.26, 1.19, 1.14, 1.09, 1.06, 1.04, 1.0, 1.0];
    
    const r_d_rounded = RD <= 0.5 ? "0.5" : "0.75";
    if (r_d_rounded === "0.5") {
      rnc_factor = interp1(correction_table_re, correction_table_05, re_scaled);
    }
  }

  const loss_coefficient = lossCoefficientBase * correctionFactor * rnc_factor;
  const velocity_pressure = Math.pow(velocity / 4005, 2);
  const pressure_loss = loss_coefficient * velocity_pressure;

  const results: CalcOutputs = {
    "Output 1: Velocity (ft/min)": velocity,
    "Output 2: Vel. Pres @ V0 (in w.c.)": velocity_pressure,
    "Output 3: Loss Coefficient": loss_coefficient,
    "Output 4: Pressure Loss (in w.c.)": pressure_loss,
  };

  return results;
}

export const A7A_registration: DuctCalcWithMeta = {
  fn: A7A_calc,
  outputType: "standard",
};
