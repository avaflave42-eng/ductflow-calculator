import { UnitSystem } from "./types";

export class UnitConverter {
  private static readonly MM_PER_IN = 25.4;
  private static readonly FT_PER_M = 3.28084;
  private static readonly CFM_PER_M3HR = 0.588578;
  private static readonly M_PER_S_PER_FTMIN = 0.00508;
  private static readonly PA_PER_INWC = 249.08891;

  // Display → standard units (infer units from label text)
  static inputToStandard(label: string, value: number): number {
    const lower = label.toLowerCase();

    if (lower.includes("(mm)")) {
      return value / this.MM_PER_IN;                 // mm → in
    }
    if (lower.includes("(m/s)")) {
      return value / this.M_PER_S_PER_FTMIN;         // m/s → ft/min
    }
    if (lower.includes("m³/h") || lower.includes("m3/h")) {
      return value / this.CFM_PER_M3HR;              // m³/h → cfm
    }
    if (lower.includes("(pa)")) {
      return value / this.PA_PER_INWC;               // Pa → in. w.c.
    }

    // Default: assume already in standard units
    return value;
  }

  // Standard units → display units (imperial = pass-through, metric = convert)
  static formatOutputForDisplay(
    standardLabel: string,
    standardValue: number | string | null,
    unitSystem: UnitSystem
  ): { label: string; value: string } {
    const isMetric = unitSystem === "metric";

    if (standardValue === null || standardValue === "N/A") {
      return {
        label: this.getDisplayLabel(standardLabel, unitSystem),
        value: "N/A",
      };
    }

    let numeric =
      typeof standardValue === "number"
        ? standardValue
        : Number(standardValue);
    if (Number.isNaN(numeric)) {
      return {
        label: this.getDisplayLabel(standardLabel, unitSystem),
        value: String(standardValue),
      };
    }

    let displayLabel = this.getDisplayLabel(standardLabel, unitSystem);
    const lower = displayLabel.toLowerCase();

    if (isMetric) {
      // velocity
      if (lower.includes("(ft/min)")) {
        numeric *= this.M_PER_S_PER_FTMIN; // ft/min → m/s
        displayLabel = displayLabel.replace("(ft/min)", "(m/s)");
      } else if (lower.includes("(ft/s)")) {
        numeric /= this.FT_PER_M; // ft/s → m/s
        displayLabel = displayLabel.replace("(ft/s)", "(m/s)");
      }

      // flow
      if (lower.includes("(cfm)")) {
        numeric *= this.CFM_PER_M3HR; // cfm → m³/h
        displayLabel = displayLabel.replace("(cfm)", "(m³/h)");
      }

      // length
      if (lower.includes("(in)")) {
        numeric *= this.MM_PER_IN / 1000; // in → m
        displayLabel = displayLabel.replace("(in)", "(m)");
      } else if (lower.includes("(ft)")) {
        const ftToM = 1 / this.FT_PER_M;
        numeric *= ftToM; // ft → m
        displayLabel = displayLabel.replace("(ft)", "(m)");
      }

      // pressure
      if (/in\.?\s*w\.?c\.?/i.test(lower)) {
        numeric *= this.PA_PER_INWC; // in w.c. → Pa
        displayLabel = displayLabel.replace(/in\.?\s*w\.?c\.?/i, "Pa");
      }
    }

    const value = numeric.toFixed(3);
    return { label: displayLabel, value };
  }

  static getDisplayLabel(label: string, unitSystem: UnitSystem): string {
    if (unitSystem === "imperial") return label;
    return label
      .replace("(ft/min)", "(m/s)")
      .replace("(ft/s)", "(m/s)")
      .replace("(cfm)", "(m³/h)")
      .replace("(ft)", "(m)")
      .replace("(in)", "(m)")
      .replace(/in\.?\s*w\.?c\.?/i, "Pa");
  }
}
