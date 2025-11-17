import { describe, it, expect } from "vitest";
import { A7A_registration } from "../ducts/A7A";
import { masterData } from "../masterData";
import { CalcInputs } from "../types";

describe("A7A - Round Elbow (R/D)", () => {
  it("should calculate correct loss coefficient and pressure loss for typical case", () => {
    const inputs: CalcInputs = {
      entry_1: 12, // D = 12 inches
      entry_2: 0.75, // R/D = 0.75
      entry_3: 90, // Angle = 90 degrees
      entry_4: 2000, // Q = 2000 cfm
    };

    const outputs = A7A_registration.fn(inputs, masterData);

    // Expected calculations:
    // Area = π * (12/2)² = 113.1 in² = 0.785 ft²
    // Velocity = 2000 / 0.785 = 2547.77 fpm
    // Velocity Pressure = (2547.77 / 4005)² = 0.405 in. w.c.
    // Base C from R/D=0.75 row: 0.22
    // K from ANGLE=90: 1.0
    // Reynolds number check (high velocity, so RNCF = 1.0)
    // Loss Coefficient = 0.22 * 1.0 * 1.0 = 0.22
    // Pressure Loss = 0.22 * 0.405 = 0.089 in. w.c.

    expect(outputs["Output 1: Velocity (ft/min)"]).toBeCloseTo(2547.77, 1);
    expect(outputs["Output 2: Vel. Pres @ V0 (in w.c.)"]).toBeCloseTo(0.405, 2);
    expect(outputs["Output 3: Loss Coefficient"]).toBeCloseTo(0.22, 2);
    expect(outputs["Output 4: Pressure Loss (in w.c.)"]).toBeCloseTo(0.089, 2);
  });

  it("should calculate correct values for smaller diameter and lower velocity", () => {
    const inputs: CalcInputs = {
      entry_1: 6, // D = 6 inches
      entry_2: 0.5, // R/D = 0.5
      entry_3: 45, // Angle = 45 degrees
      entry_4: 500, // Q = 500 cfm
    };

    const outputs = A7A_registration.fn(inputs, masterData);

    // Expected calculations:
    // Area = π * (6/2)² = 28.27 in² = 0.196 ft²
    // Velocity = 500 / 0.196 = 2551.02 fpm
    // Velocity Pressure = (2551.02 / 4005)² = 0.406 in. w.c.
    // Base C from R/D=0.5 row: 0.27
    // K from ANGLE=45 or 60: 0.60 (picks ANGLE >= 45, which is 45)
    // Loss Coefficient = 0.27 * 0.60 * 1.0 = 0.162
    // Pressure Loss = 0.162 * 0.406 = 0.066 in. w.c.

    expect(outputs["Output 1: Velocity (ft/min)"]).toBeCloseTo(2551.02, 1);
    expect(outputs["Output 2: Vel. Pres @ V0 (in w.c.)"]).toBeCloseTo(0.406, 2);
    expect(outputs["Output 3: Loss Coefficient"]).toBeCloseTo(0.162, 2);
    expect(outputs["Output 4: Pressure Loss (in w.c.)"]).toBeCloseTo(0.066, 2);
  });

  it("should handle RNCF correction for low velocities", () => {
    const inputs: CalcInputs = {
      entry_1: 24, // D = 24 inches (large diameter)
      entry_2: 1.0, // R/D = 1.0
      entry_3: 90, // Angle = 90 degrees
      entry_4: 1000, // Q = 1000 cfm (low flow for large duct)
    };

    const outputs = A7A_registration.fn(inputs, masterData);

    // Expected calculations:
    // Area = π * (24/2)² = 452.39 in² = 3.142 ft²
    // Velocity = 1000 / 3.142 = 318.31 fpm (very low velocity)
    // This should trigger RNCF correction
    // Reynolds number = 8.5 * 24 * 318.31 = 64,890
    // Re_scaled = 6.489 (in units of 10^4)
    // For R/D=1.0 → use 0.75 column: at Re=6, RNCF=1.38
    // Base C from R/D=1.0: 0.19
    // K from ANGLE=90: 1.0
    // Loss Coefficient = 0.19 * 1.0 * 1.38 ≈ 0.262
    // Velocity Pressure = (318.31 / 4005)² = 0.00632 in. w.c.
    // Pressure Loss = 0.262 * 0.00632 = 0.00166 in. w.c.

    expect(outputs["Output 1: Velocity (ft/min)"]).toBeCloseTo(318.31, 1);
    expect(outputs["Output 2: Vel. Pres @ V0 (in w.c.)"]).toBeCloseTo(0.00632, 4);
    expect(outputs["Output 3: Loss Coefficient"]).toBeGreaterThan(0.19); // Should be > base due to RNCF
    expect(outputs["Output 4: Pressure Loss (in w.c.)"]).toBeCloseTo(0.00166, 4);
  });
});
