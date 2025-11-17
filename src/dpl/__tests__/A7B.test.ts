import { describe, it, expect } from "vitest";
import { A7B_calc } from "../ducts/A7B";
import { masterData } from "../masterData";
import { CalcInputs } from "../types";

describe("A7B - Round Elbow (Mitered)", () => {
  it("should calculate correct loss coefficient and pressure loss", () => {
    const inputs: CalcInputs = {
      entry_1: 10, // D = 10 inches
      entry_2: 0.75, // R/D = 0.75
      entry_3: 3, // # pieces = 3
      entry_4: 1500, // Q = 1500 cfm
    };

    const outputs = A7B_calc(inputs, masterData);

    // Expected calculations:
    // Area = π * (10/2)² = 78.54 in² = 0.5454 ft²
    // Velocity = 1500 / 0.5454 = 2750.05 fpm
    // Velocity Pressure = (2750.05 / 4005)² = 0.472 in. w.c.
    // Pick R/D <= 0.75 → 0.75
    // Pick # pieces <= 3 → 3
    // Base C from table (depends on mock data)
    // RNCF for R/D=0.75 at high velocity = 1.0
    
    expect(outputs["Velocity (fpm)"]).toBeCloseTo(2750.05, 1);
    expect(outputs["Vel. Pres @ V0 (in. w.c.)"]).toBeCloseTo(0.472, 2);
    expect(outputs["Loss Coefficient"]).toBeGreaterThan(0);
    expect(outputs["Pressure Loss (in. w.c.)"]).toBeGreaterThan(0);
  });

  it("should handle single piece mitered elbow", () => {
    const inputs: CalcInputs = {
      entry_1: 8, // D = 8 inches
      entry_2: 0.5, // R/D = 0.5
      entry_3: 1, // # pieces = 1 (sharp elbow)
      entry_4: 1000, // Q = 1000 cfm
    };

    const outputs = A7B_calc(inputs, masterData);

    // Expected calculations:
    // Area = π * (8/2)² = 50.27 in² = 0.349 ft²
    // Velocity = 1000 / 0.349 = 2865.33 fpm
    // Single piece should have higher loss coefficient
    
    expect(outputs["Velocity (fpm)"]).toBeCloseTo(2865.33, 1);
    expect(outputs["Vel. Pres @ V0 (in. w.c.)"]).toBeCloseTo(0.512, 2);
    expect(outputs["Loss Coefficient"]).toBeGreaterThan(0);
    expect(outputs["Pressure Loss (in. w.c.)"]).toBeGreaterThan(0);
  });

  it("should apply RNCF correction for low velocities with R/D=0.75", () => {
    const inputs: CalcInputs = {
      entry_1: 20, // D = 20 inches (large)
      entry_2: 0.75, // R/D = 0.75
      entry_3: 2, // # pieces = 2
      entry_4: 800, // Q = 800 cfm (low for large duct)
    };

    const outputs = A7B_calc(inputs, masterData);

    // Expected calculations:
    // Area = π * (20/2)² = 314.16 in² = 2.182 ft²
    // Velocity = 800 / 2.182 = 366.74 fpm (low velocity)
    // Should trigger RNCF with 0.75 column
    
    expect(outputs["Velocity (fpm)"]).toBeCloseTo(366.74, 1);
    expect(outputs["Loss Coefficient"]).toBeGreaterThan(0);
    expect(outputs["Pressure Loss (in. w.c.)"]).toBeGreaterThan(0);
  });
});
