import {
  CalcInputs,
  CalcOutputs,
  DuctCalcWithMeta,
  DuctConstraint,
  DuctDefinition,
  MasterData,
  UnitSystem,
} from "./types";
import { UnitConverter } from "./unitConverter";

export type CalculationMode = "legacy" | "interpolated";

export interface CalculationContext {
  duct: DuctDefinition;
  unitSystem: UnitSystem;
  constraints: DuctConstraint[];
  masterData: MasterData;
  registry: Record<string, DuctCalcWithMeta>;
  mode?: CalculationMode;
}

export function runDuctCalculation(
  rawInputValues: Record<string, string>, // label -> raw form input
  ctx: CalculationContext
): { outputs?: CalcOutputs; errors?: string[]; outputType?: string } {
  const errors: string[] = [];
  const calcInputs: CalcInputs = {};

  // 1) Convert display inputs → standard units
  for (const field of ctx.duct.inputs) {
    const raw = (rawInputValues[field.label] ?? "").trim();
    if (!raw) continue;

    if (field.type === "number") {
      const parsed = Number(raw);
      if (Number.isNaN(parsed)) {
        errors.push(`Invalid number for "${field.label}".`);
        continue;
      }
      const standardVal = UnitConverter.inputToStandard(field.label, parsed);
      calcInputs[field.entryKey] = standardVal;
    } else {
      calcInputs[field.entryKey] = raw;
    }
  }

  // 2) Apply Constraints sheet logic
  for (const c of ctx.constraints) {
    const val = calcInputs[c.entryKey];
    if (val == null || typeof val !== "number") continue;

    let rhs: number;
    if (c.type === "compare_to_entry") {
      const expr = c.valueExpr.replace(/entry_(\d+)/g, (_m, n) => {
        const key = `entry_${n}`;
        const v = calcInputs[key];
        return typeof v === "number" ? String(v) : "0";
      });
      try {
        // eslint-disable-next-line no-new-func
        rhs = new Function(`return ${expr};`)();
      } catch {
        continue;
      }
    } else {
      rhs = Number(c.valueExpr);
      if (Number.isNaN(rhs)) continue;
    }

    const lhs = val;
    let ok = true;
    switch (c.operator) {
      case "<": ok = lhs < rhs; break;
      case "<=": ok = lhs <= rhs; break;
      case ">": ok = lhs > rhs; break;
      case ">=": ok = lhs >= rhs; break;
      case "==": ok = lhs === rhs; break;
      case "!=": ok = lhs !== rhs; break;
    }

    if (!ok) errors.push(c.message);
  }

  if (errors.length) {
    return { errors };
  }

  // 3) Look up the duct function and call it
  const registration = ctx.registry[ctx.duct.id];
  if (!registration) {
    return {
      errors: [`No calculation function registered for duct "${ctx.duct.id}".`],
    };
  }

  const { fn, fn_v2, outputType } = registration;
  
  // Use v2 interpolated function if mode is interpolated and it exists
  const calcFn = (ctx.mode === "interpolated" && fn_v2) ? fn_v2 : fn;
  const rawOutputs = calcFn(calcInputs, ctx.masterData);

  return {
    outputs: rawOutputs,
    errors: errors.length ? errors : undefined,
    outputType,
  };
}
