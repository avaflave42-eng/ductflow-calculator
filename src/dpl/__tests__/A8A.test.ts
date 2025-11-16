import { describe, it, expect } from "vitest";
import { A8A_calc } from "../ducts/A8A";
import { A8A_calc_v2 } from "../ducts/A8A_v2";
import { masterData } from "../mockMasterData";
import { CalcInputs } from "../types";

describe("A8A - Round Conical Expansion", () => {
  describe("Legacy Mode (A8A_calc)", () => {
    it("should calculate correct loss coefficient and pressure loss", () => {
      const inputs: CalcInputs = {
        entry_1: 12, // D = 12 inches (upstream)
        entry_2: 18, // D₁ = 18 inches (downstream, larger)
        entry_3: 30, // Angle = 30 degrees
        entry_4: 2000, // Q = 2000 cfm
      };

      const outputs = A8A_calc(inputs, masterData);

      // Expected calculations:
      // Area = π * (12/2)² = 113.1 in² = 0.785 ft²
      // Area_1 = π * (18/2)² = 254.47 in² = 1.767 ft²
      // Velocity = 2000 / 0.785 = 2547.77 fpm (upstream)
      // Area Ratio A1/A = 1.767 / 0.785 = 2.25
      // Reynolds = 8.5 * 12 * 2547.77 = 259,874
      // Should match Re=200000 (or 50000), A1/A between 2.0 and 2.5, ANGLE=30
      
      expect(outputs["Velocity (fpm)"]).toBeCloseTo(2547.77, 1);
      expect(outputs["Vel. Pres @ V0 (in. w.c.)"]).toBeCloseTo(0.405, 2);
      expect(outputs["Loss Coefficient"]).toBeGreaterThan(0);
      expect(outputs["Loss Coefficient"]).toBeLessThan(0.5); // Reasonable range
      expect(outputs["Pressure Loss (in. w.c.)"]).toBeGreaterThan(0);
    });

    it("should handle high expansion ratio", () => {
      const inputs: CalcInputs = {
        entry_1: 10, // D = 10 inches
        entry_2: 20, // D₁ = 20 inches (2x expansion)
        entry_3: 45, // Angle = 45 degrees
        entry_4: 1500, // Q = 1500 cfm
      };

      const outputs = A8A_calc(inputs, masterData);

      // Area ratio = 4.0 (diameter ratio squared)
      // Should match A1/A = 4.0 row
      
      expect(outputs["Velocity (fpm)"]).toBeGreaterThan(0);
      expect(outputs["Loss Coefficient"]).toBeGreaterThan(0);
      expect(outputs["Pressure Loss (in. w.c.)"]).toBeGreaterThan(0);
    });

    it("should handle small angle expansion", () => {
      const inputs: CalcInputs = {
        entry_1: 12, // D = 12 inches
        entry_2: 15, // D₁ = 15 inches (modest expansion)
        entry_3: 10, // Angle = 10 degrees (gradual)
        entry_4: 2000, // Q = 2000 cfm
      };

      const outputs = A8A_calc(inputs, masterData);

      // Small angle should result in lower loss coefficient
      
      expect(outputs["Velocity (fpm)"]).toBeGreaterThan(0);
      expect(outputs["Loss Coefficient"]).toBeGreaterThan(0);
      expect(outputs["Loss Coefficient"]).toBeLessThan(0.3); // Should be low for gradual expansion
      expect(outputs["Pressure Loss (in. w.c.)"]).toBeGreaterThan(0);
    });
  });

  describe("Interpolated Mode (A8A_calc_v2)", () => {
    it("should calculate smooth interpolated values", () => {
      const inputs: CalcInputs = {
        entry_1: 12, // D = 12 inches
        entry_2: 18, // D₁ = 18 inches
        entry_3: 30, // Angle = 30 degrees
        entry_4: 2000, // Q = 2000 cfm
      };

      const outputs = A8A_calc_v2(inputs, masterData);

      // Should use bilinear interpolation for smoother results
      
      expect(outputs["Velocity (fpm)"]).toBeCloseTo(2547.77, 1);
      expect(outputs["Vel. Pres @ V0 (in. w.c.)"]).toBeCloseTo(0.405, 2);
      expect(outputs["Loss Coefficient"]).toBeGreaterThan(0);
      expect(outputs["Pressure Loss (in. w.c.)"]).toBeGreaterThan(0);
    });

    it("should handle interpolation between table values", () => {
      const inputs: CalcInputs = {
        entry_1: 11, // D = 11 inches
        entry_2: 16.5, // D₁ = 16.5 inches (A1/A = 2.25, between 2.0 and 2.5)
        entry_3: 25, // Angle = 25 degrees (between 20 and 30)
        entry_4: 1800, // Q = 1800 cfm
      };

      const outputs = A8A_calc_v2(inputs, masterData);

      // Should interpolate smoothly between adjacent table values
      
      expect(outputs["Velocity (fpm)"]).toBeGreaterThan(0);
      expect(outputs["Loss Coefficient"]).toBeGreaterThan(0);
      expect(outputs["Pressure Loss (in. w.c.)"]).toBeGreaterThan(0);
    });

    it("should produce similar results to legacy for exact table matches", () => {
      const inputs: CalcInputs = {
        entry_1: 10, // D = 10 inches
        entry_2: 20, // D₁ = 20 inches (A1/A = 4.0, exact match)
        entry_3: 45, // Angle = 45 degrees (exact match)
        entry_4: 1500, // Q = 1500 cfm
      };

      const outputsLegacy = A8A_calc(inputs, masterData);
      const outputsV2 = A8A_calc_v2(inputs, masterData);

      // When inputs exactly match table values, both should be very close
      
      expect(outputsV2["Velocity (fpm)"]).toBeCloseTo(
        outputsLegacy["Velocity (fpm)"] as number,
        1
      );
      expect(outputsV2["Loss Coefficient"]).toBeCloseTo(
        outputsLegacy["Loss Coefficient"] as number,
        2
      );
    });
  });

  describe("Legacy vs Interpolated Comparison", () => {
    it("should produce results in similar ranges", () => {
      const inputs: CalcInputs = {
        entry_1: 12,
        entry_2: 17,
        entry_3: 35,
        entry_4: 2000,
      };

      const outputsLegacy = A8A_calc(inputs, masterData);
      const outputsV2 = A8A_calc_v2(inputs, masterData);

      // Both should produce reasonable results
      expect(outputsLegacy["Loss Coefficient"]).toBeGreaterThan(0);
      expect(outputsV2["Loss Coefficient"]).toBeGreaterThan(0);
      
      // Should be within reasonable tolerance (interpolation smooths values)
      const legacyC = outputsLegacy["Loss Coefficient"] as number;
      const v2C = outputsV2["Loss Coefficient"] as number;
      const diff = Math.abs(legacyC - v2C);
      expect(diff).toBeLessThan(0.5); // Within 0.5 difference is reasonable
    });
  });
});
