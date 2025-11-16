import { MasterData, MasterTableRow, DuctDefinition } from "./types";

export function getRowsForId(data: MasterData, ductId: string): MasterTableRow[] {
  return data.rows.filter((row) => row.id === ductId);
}

/**
 * Extract input labels from master table for a given duct ID
 * Looks for Input_1, Input_2, etc. columns that have non-N/A values
 */
export function getInputLabelsFromMasterData(
  data: MasterData,
  ductId: string
): Record<string, string> {
  const rows = getRowsForId(data, ductId);
  if (rows.length === 0) return {};

  const firstRow = rows[0];
  const labels: Record<string, string> = {};

  // Check for Input_1 through Input_10
  for (let i = 1; i <= 10; i++) {
    const colName = `Input_${i}`;
    if (firstRow[colName] && firstRow[colName] !== "N/A") {
      labels[`entry_${i}`] = String(firstRow[colName]);
    }
  }

  return labels;
}

/**
 * Apply input labels from master data to a duct definition
 */
export function applyInputLabelsFromMasterData(
  ductDef: DuctDefinition,
  data: MasterData
): DuctDefinition {
  const labels = getInputLabelsFromMasterData(data, ductDef.id);
  
  if (Object.keys(labels).length === 0) {
    return ductDef; // No labels found, return as-is
  }

  const updatedInputs = ductDef.inputs.map((input) => {
    const label = labels[input.entryKey];
    if (label) {
      return { ...input, label };
    }
    return input;
  });

  return {
    ...ductDef,
    inputs: updatedInputs,
  };
}

export function pickLastWhereColLTE(
  rows: MasterTableRow[],
  column: string,
  target: number
): MasterTableRow | undefined {
  return rows
    .filter((r) => typeof r[column] === "number" && (r[column] as number) <= target)
    .sort((a, b) => (a[column] as number) - (b[column] as number))
    .pop();
}

export function pickFirstWhereColGTE(
  rows: MasterTableRow[],
  column: string,
  target: number
): MasterTableRow | undefined {
  return rows
    .filter((r) => typeof r[column] === "number" && (r[column] as number) >= target)
    .sort((a, b) => (a[column] as number) - (b[column] as number))
    [0];
}

export function interp1(x: number[], y: number[], xTarget: number): number {
  if (x.length !== y.length || x.length === 0) {
    throw new Error("interp1: x and y must be same non-zero length");
  }
  if (xTarget <= x[0]) return y[0];
  if (xTarget >= x[x.length - 1]) return y[y.length - 1];

  for (let i = 0; i < x.length - 1; i++) {
    const x0 = x[i];
    const x1 = x[i + 1];
    if (xTarget >= x0 && xTarget <= x1) {
      const t = (xTarget - x0) / (x1 - x0);
      const y0 = y[i];
      const y1 = y[i + 1];
      return y0 + t * (y1 - y0);
    }
  }
  return y[y.length - 1];
}
