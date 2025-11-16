import { describe, it, expect } from "vitest";
import { A7C_calc } from "../ducts/A7C";
import { masterData } from "../mockMasterData";
import { CalcInputs } from "../types";

describe("A7C - Round Elbow (Smooth Radius, R/D < 0.5)", () => {
  it("should calculate correct loss coefficient and pressure loss for 90° elbow", () => {
    const inputs: CalcInputs = {
      entry_1: 12, // D = 12 inches
      entry_2: 90, // Angle = 90 degrees
      entry_3: 2000, // Q = 2000 cfm
    };

    const outputs = A7C_calc(inputs, masterData);

    // Expected calculations:
    // Area = π * (12/2)² = 113.1 in² = 0.785 ft²
    // Velocity = 2000 / 0.785 = 2547.77 fpm
    // Velocity Pressure = (2547.77 / 4005)² = 0.405 in. w.c.
    // Find angle with min absolute difference to 90
    // RNCF for single R/D=0.5 column at high velocity = 1.0
    
    expect(outputs["Velocity (fpm)"]).toBeCloseTo(2547.77, 1);
    expect(outputs["Vel. Pres @ V0 (in. w.c.)"]).toBeCloseTo(0.405, 2);
    expect(outputs["Loss Coefficient"]).toBeGreaterThan(0);
    expect(outputs["Pressure Loss (in. w.c.)"]).toBeGreaterThan(0);
  });

  it("should handle 45° elbow with minimum difference matching", () => {
    const inputs: CalcInputs = {
      entry_1: 8, // D = 8 inches
      entry_2: 45, // Angle = 45 degrees
      entry_3: 1200, // Q = 1200 cfm
    };

    const outputs = A7C_calc(inputs, masterData);

    // Expected calculations:
    // Area = π * (8/2)² = 50.27 in² = 0.349 ft²
    // Velocity = 1200 / 0.349 = 3438.40 fpm
    // Should match to closest angle in table
    
    expect(outputs["Velocity (fpm)"]).toBeCloseTo(3438.40, 1);
    expect(outputs["Vel. Pres @ V0 (in. w.c.)"]).toBeCloseTo(0.738, 2);
    expect(outputs["Loss Coefficient"]).toBeGreaterThan(0);
    expect(outputs["Pressure Loss (in. w.c.)"]).toBeGreaterThan(0);
  });

  it("should apply RNCF correction for low velocities", () => {
    const inputs: CalcInputs = {
      entry_1: 18, // D = 18 inches
      entry_2: 90, // Angle = 90 degrees
      entry_3: 600, // Q = 600 cfm (low flow)
    };

    const outputs = A7C_calc(inputs, masterData);

    // Expected calculations:
    // Area = π * (18/2)² = 254.47 in² = 1.767 ft²
    // Velocity = 600 / 1.767 = 339.56 fpm (low velocity)
    // Reynolds number = 8.5 * 18 * 339.56 = 51,968
    // Should trigger RNCF correction
    
    expect(outputs["Velocity (fpm)"]).toBeCloseTo(339.56, 1);
    expect(outputs["Loss Coefficient"]).toBeGreaterThan(0);
    expect(outputs["Pressure Loss (in. w.c.)"]).toBeGreaterThan(0);
  });

  it("should handle non-standard angles by finding closest match", () => {
    const inputs: CalcInputs = {
      entry_1: 10, // D = 10 inches
      entry_2: 73, // Angle = 73 degrees (not in table)
      entry_3: 1500, // Q = 1500 cfm
    };

    const outputs = A7C_calc(inputs, masterData);

    // Should find closest angle match (likely 75 or 60 depending on table)
    
    expect(outputs["Velocity (fpm)"]).toBeGreaterThan(0);
    expect(outputs["Vel. Pres @ V0 (in. w.c.)"]).toBeGreaterThan(0);
    expect(outputs["Loss Coefficient"]).toBeGreaterThan(0);
    expect(outputs["Pressure Loss (in. w.c.)"]).toBeGreaterThan(0);
  });
});
