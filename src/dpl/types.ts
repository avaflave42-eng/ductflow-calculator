export type UnitSystem = "imperial" | "metric";

export interface DuctInputField {
  entryKey: string;            // e.g. "entry_1"
  label: string;               // e.g. "D (in)", "Q (cfm)"
  type: "number" | "select" | "text";
  unitHint?: string;
  options?: string[];          // for dropdowns
}

export interface DuctOutputField {
  key: string;                 // e.g. "output_1"
  label: string;               // e.g. "Pressure Loss (in. w.c.)"
}

export interface DuctDefinition {
  id: string;                  // "A7A"
  fitting: string;             // e.g. "Elbow"
  fittingType: string;         // e.g. "90°"
  name: string;                // human-readable name
  shape?: string;              // "rectangular", "round", etc.
  path?: string;               // "branch", "main", etc.
  inputs: DuctInputField[];
  outputs: DuctOutputField[];
}

export type OutputType = "standard" | "branch_main" | "dual_branch";

export interface DuctConstraint {
  ductId: string;              // e.g. "A11P"
  entryKey: string;            // "entry_3"
  type: "compare_to_entry" | "simple";
  operator: "<" | ">" | "<=" | ">=" | "==" | "!=";
  valueExpr: string;           // e.g. "entry_1 - 1.9999" or "12.0"
  message: string;             // user-facing error text
}

export interface CalcInputs {
  [entryKey: string]: number | string;
}

export interface CalcOutputs {
  [label: string]: number | string | null;
}

export interface MasterTableRow {
  id: string;                  // duct ID, equivalent to Excel "ID"
  [key: string]: any;          // other columns from Master Table
}

export interface MasterData {
  rows: MasterTableRow[];
}

export type DuctCalcFn = (
  inputs: CalcInputs,
  data: MasterData
) => CalcOutputs & { _meta?: { [key: string]: any } };

export interface DuctCalcWithMeta {
  fn: DuctCalcFn;
  outputType: OutputType;
}
