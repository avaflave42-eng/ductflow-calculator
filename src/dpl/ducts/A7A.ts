import {
  CalcInputs,
  CalcOutputs,
  DuctCalcWithMeta,
  MasterData,
} from "../types";
import {
  getRowsForId,
  pickLastWhereColLTE,
  pickFirstWhereColGTE,
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

  // --- BASIC GEOMETRY --- (Python lines 36-37)
  const area_in2 = Math.PI * Math.pow(D / 2, 2);  // Cross-sectional area in square inches
  const area_ft2 = area_in2 / 144;                // Convert to square feet
  const velocity = Q / area_ft2;                   // Velocity in ft/min

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

  // Get angle correction factor (Python lines 40-43: first ANGLE >= entry_3)
  const angleRows = rowsA7A
    .filter(
      (r) =>
        typeof r["ANGLE"] === "number" &&
        typeof r["K"] === "number"
    )
    .sort((a, b) => (a["ANGLE"] as number) - (b["ANGLE"] as number));

  const angleRow = pickFirstWhereColGTE(angleRows, "ANGLE", angle);
  if (!angleRow) {
    throw new Error(`A7A: no ANGLE row >= ${angle}`);
  }
  const correctionFactor = angleRow["K"] as number;

  // Reynolds Number Correction Factor (RNCF) (Python lines 45-77)
  const reynolds_number = 8.5 * D * velocity;
  const equivalent_diameter = 23766.76 * Math.pow(velocity, -1.000794);
  
  let rnc_factor = 1.0;
  if (velocity < (23766.76 / equivalent_diameter)) {
    // Define complete RNCF correction table (Python lines 58-64)
    const correction_table = {
      re_values: [1, 2, 3, 4, 6, 8, 10, 14, 20],
      "0.5": [1.40, 1.26, 1.19, 1.14, 1.09, 1.06, 1.04, 1.0, 1.0],
      "0.75": [1.77, 1.64, 1.56, 1.46, 1.38, 1.30, 1.15, 1.0, 1.0]
    };

    const re_scaled = reynolds_number / 1e4;

    // Select R/D column (round to 0.5 or 0.75) (Python line 72)
    const r_d_column = RD <= 0.5 ? "0.5" : "0.75";

    // Find largest Re in table that is <= re_scaled (Python lines 73-77: ROUND DOWN)
    // Python uses np.searchsorted(..., side="right") - 1
    let closest_re_index = 0;
    for (let i = 0; i < correction_table.re_values.length; i++) {
      if (correction_table.re_values[i] <= re_scaled) {
        closest_re_index = i;
      } else {
        break;
      }
    }

    rnc_factor = correction_table[r_d_column as "0.5" | "0.75"][closest_re_index];
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
