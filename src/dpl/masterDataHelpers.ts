import { MasterData, MasterTableRow } from "./types";

export function getRowsForId(data: MasterData, ductId: string): MasterTableRow[] {
  return data.rows.filter((row) => row.id === ductId);
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
