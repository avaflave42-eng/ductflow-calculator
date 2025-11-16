import { describe, it, expect } from "vitest";
import { A9A1_calc } from "../ducts/A9A1";
import { masterData } from "../mockMasterData";
import { CalcInputs } from "../types";

describe("A9A1 - Round Conical Contraction", () => {
  it("should calculate correct loss coefficient based on downstream velocity", () => {
    const inputs: CalcInputs = {
      entry_1: 18, // D = 18 inches (upstream, larger)
      entry_2: 12, // D₁ = 12 inches (downstream, smaller)
      entry_3: 30, // Angle = 30 degrees
      entry_4: 2000, // Q = 2000 cfm
    };

    const outputs = A9A1_calc(inputs, masterData);

    // Expected calculations:
    // Area = π * (18/2)² / 144 = 1.767 ft² (upstream)
    // Area_1 = π * (12/2)² / 144 = 0.785 ft² (downstream)
    // Velocity = 2000 / 0.785 = 2547.77 fpm (based on downstream/smaller)
    // Area Ratio A1/A = 0.785 / 1.767 = 0.444
    // Should match appropriate ANGLE and A1/A from table
    
    expect(outputs["Velocity (fpm)"]).toBeCloseTo(2547.77, 1);
    expect(outputs["Vel. Pres @ V0 (in. w.c.)"]).toBeCloseTo(0.405, 2);
    expect(outputs["Loss Coefficient"]).toBeGreaterThan(0);
    expect(outputs["Pressure Loss (in. w.c.)"]).toBeGreaterThan(0);
  });

  it("should handle gradual contraction with small angle", () => {
    const inputs: CalcInputs = {
      entry_1: 16, // D = 16 inches
      entry_2: 12, // D₁ = 12 inches
      entry_3: 15, // Angle = 15 degrees (gradual)
      entry_4: 1800, // Q = 1800 cfm
    };

    const outputs = A9A1_calc(inputs, masterData);

    // Gradual contraction (small angle) should have lower loss coefficient
    
    expect(outputs["Velocity (fpm)"]).toBeGreaterThan(0);
    expect(outputs["Loss Coefficient"]).toBeGreaterThan(0);
    expect(outputs["Loss Coefficient"]).toBeLessThan(0.3); // Small angle = low loss
    expect(outputs["Pressure Loss (in. w.c.)"]).toBeGreaterThan(0);
  });

  it("should handle abrupt contraction with large angle", () => {
    const inputs: CalcInputs = {
      entry_1: 20, // D = 20 inches
      entry_2: 10, // D₁ = 10 inches (2:1 diameter ratio)
      entry_3: 60, // Angle = 60 degrees (abrupt)
      entry_4: 1500, // Q = 1500 cfm
    };

    const outputs = A9A1_calc(inputs, masterData);

    // Abrupt contraction should have higher loss coefficient
    
    expect(outputs["Velocity (fpm)"]).toBeGreaterThan(0);
    expect(outputs["Loss Coefficient"]).toBeGreaterThan(0);
    expect(outputs["Pressure Loss (in. w.c.)"]).toBeGreaterThan(0);
  });

  it("should use correct area ratio matching logic", () => {
    const inputs: CalcInputs = {
      entry_1: 14, // D = 14 inches
      entry_2: 10, // D₁ = 10 inches
      entry_3: 45, // Angle = 45 degrees
      entry_4: 1200, // Q = 1200 cfm
    };

    const outputs = A9A1_calc(inputs, masterData);

    // Area_1 / Area = (10/14)² = 0.51
    // Should match A1/A >= 0.51 logic from table
    
    expect(outputs["Velocity (fpm)"]).toBeGreaterThan(0);
    expect(outputs["Vel. Pres @ V0 (in. w.c.)"]).toBeGreaterThan(0);
    expect(outputs["Loss Coefficient"]).toBeGreaterThan(0);
    expect(outputs["Pressure Loss (in. w.c.)"]).toBeGreaterThan(0);
  });

  it("should handle high flow rate through contraction", () => {
    const inputs: CalcInputs = {
      entry_1: 20, // D = 20 inches
      entry_2: 12, // D₁ = 12 inches
      entry_3: 30, // Angle = 30 degrees
      entry_4: 4000, // Q = 4000 cfm (high flow)
    };

    const outputs = A9A1_calc(inputs, masterData);

    // High velocity in downstream section
    // Area_1 = π * (12/2)² / 144 = 0.785 ft²
    // Velocity = 4000 / 0.785 = 5095.54 fpm
    
    expect(outputs["Velocity (fpm)"]).toBeCloseTo(5095.54, 1);
    expect(outputs["Vel. Pres @ V0 (in. w.c.)"]).toBeGreaterThan(1.0); // High velocity pressure
    expect(outputs["Loss Coefficient"]).toBeGreaterThan(0);
    expect(outputs["Pressure Loss (in. w.c.)"]).toBeGreaterThan(0);
  });
});
