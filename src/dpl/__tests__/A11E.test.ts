import { describe, it, expect } from "vitest";
import { A11E_calc } from "../ducts/A11E";
import { masterData } from "../mockMasterData";
import { CalcInputs } from "../types";

describe("A11E - Diverging Junction Round Tee", () => {
  it("should calculate branch and main losses correctly", () => {
    const inputs: CalcInputs = {
      entry_1: 12, // D main = 12 inches
      entry_2: 8, // D branch = 8 inches
      entry_3: 2000, // Qc = 2000 cfm (converged/total flow)
      entry_4: 800, // Qb = 800 cfm (branch flow)
    };

    const outputs = A11E_calc(inputs, masterData);

    // Expected calculations:
    // A_main = π * (12/2)² / 144 = 0.785 ft²
    // A_branch = π * (8/2)² / 144 = 0.349 ft²
    // Vc = 2000 / 0.785 = 2547.77 fpm
    // Vs = (2000 - 800) / 0.785 = 1528.66 fpm
    // Vb = 800 / 0.349 = 2292.26 fpm
    // Vb/Vc = 2292.26 / 2547.77 = 0.900
    
    expect(outputs["Branch: Velocity (fpm)"]).toBeCloseTo(2292.26, 1);
    expect(outputs["Main: Source Velocity (fpm)"]).toBeCloseTo(1528.66, 1);
    expect(outputs["Main: Converged Velocity (fpm)"]).toBeCloseTo(2547.77, 1);
    expect(outputs["Branch: Loss Coefficient"]).toBeGreaterThan(0);
    expect(outputs["Main: Loss Coefficient"]).toBeGreaterThan(0);
    expect(outputs["Branch: Pressure Loss (in. w.c.)"]).toBeGreaterThan(0);
    expect(outputs["Main: Pressure Loss (in. w.c.)"]).toBeGreaterThan(0);
  });

  it("should handle small branch flow ratio", () => {
    const inputs: CalcInputs = {
      entry_1: 14, // D main = 14 inches
      entry_2: 6, // D branch = 6 inches
      entry_3: 3000, // Qc = 3000 cfm
      entry_4: 500, // Qb = 500 cfm (small branch)
    };

    const outputs = A11E_calc(inputs, masterData);

    // Small Qb/Qc ratio should result in specific loss characteristics
    
    expect(outputs["Branch: Velocity (fpm)"]).toBeGreaterThan(0);
    expect(outputs["Main: Source Velocity (fpm)"]).toBeGreaterThan(0);
    expect(outputs["Main: Converged Velocity (fpm)"]).toBeGreaterThan(0);
    expect(outputs["Branch: Loss Coefficient"]).toBeGreaterThan(0);
    expect(outputs["Main: Loss Coefficient"]).toBeGreaterThan(0);
  });

  it("should handle large branch flow ratio", () => {
    const inputs: CalcInputs = {
      entry_1: 12, // D main = 12 inches
      entry_2: 10, // D branch = 10 inches (large branch)
      entry_3: 2000, // Qc = 2000 cfm
      entry_4: 1500, // Qb = 1500 cfm (most flow goes to branch)
    };

    const outputs = A11E_calc(inputs, masterData);

    // Large Qb/Qc ratio (0.75) should affect loss coefficients
    
    expect(outputs["Branch: Velocity (fpm)"]).toBeGreaterThan(0);
    expect(outputs["Main: Source Velocity (fpm)"]).toBeGreaterThan(0);
    expect(outputs["Main: Converged Velocity (fpm)"]).toBeGreaterThan(0);
    expect(outputs["Branch: Loss Coefficient"]).toBeGreaterThan(0);
    expect(outputs["Main: Loss Coefficient"]).toBeGreaterThan(0);
  });

  it("should calculate velocity pressures correctly", () => {
    const inputs: CalcInputs = {
      entry_1: 10, // D main = 10 inches
      entry_2: 8, // D branch = 8 inches
      entry_3: 1500, // Qc = 1500 cfm
      entry_4: 600, // Qb = 600 cfm
    };

    const outputs = A11E_calc(inputs, masterData);

    // Verify velocity pressures are calculated with correct formula
    // VP = (V / 4005)²
    const Vb = outputs["Branch: Velocity (fpm)"] as number;
    const PVb = outputs["Branch: Vel. Pres (in. w.c.)"] as number;
    const expectedPVb = Math.pow(Vb / 4005, 2);
    
    expect(PVb).toBeCloseTo(expectedPVb, 4);
    
    const Vc = outputs["Main: Converged Velocity (fpm)"] as number;
    const PVc = outputs["Main: Converged Vel. Pres (in. w.c.)"] as number;
    const expectedPVc = Math.pow(Vc / 4005, 2);
    
    expect(PVc).toBeCloseTo(expectedPVc, 4);
  });

  it("should handle equal diameter main and branch", () => {
    const inputs: CalcInputs = {
      entry_1: 12, // D main = 12 inches
      entry_2: 12, // D branch = 12 inches (same size)
      entry_3: 2400, // Qc = 2400 cfm
      entry_4: 1200, // Qb = 1200 cfm (50/50 split)
    };

    const outputs = A11E_calc(inputs, masterData);

    // Equal split with equal diameters
    
    expect(outputs["Branch: Velocity (fpm)"]).toBeGreaterThan(0);
    expect(outputs["Main: Source Velocity (fpm)"]).toBeGreaterThan(0);
    expect(outputs["Main: Converged Velocity (fpm)"]).toBeGreaterThan(0);
    expect(outputs["Branch: Loss Coefficient"]).toBeGreaterThan(0);
    expect(outputs["Main: Loss Coefficient"]).toBeGreaterThan(0);
  });
});
