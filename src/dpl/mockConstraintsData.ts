import { DuctConstraint } from "./types";

// Constraints parsed from Excel "Constraints" sheet
// These define validation rules for duct calculations
export const constraintsByDuct: Record<string, DuctConstraint[]> = {
  A11P: [
    {
      ductId: "A11P",
      entryKey: "entry_3",
      type: "compare_to_entry",
      operator: "<",
      valueExpr: "entry_1 - 1.9999",
      message: "Branch height must be at least 2 inches smaller than main height."
    }
  ],
  A8A: [
    {
      ductId: "A8A",
      entryKey: "entry_1",
      type: "compare_to_entry",
      operator: "<",
      valueExpr: "entry_2",
      message: "Upstream diameter must be less than downstream diameter."
    },
    {
      ductId: "A8A",
      entryKey: "entry_2",
      type: "compare_to_entry",
      operator: "<",
      valueExpr: "entry_3",
      message: "Upstream height must be less than downstream height."
    },
    {
      ductId: "A8A",
      entryKey: "entry_3",
      type: "compare_to_entry",
      operator: "<",
      valueExpr: "entry_4",
      message: "Upstream width must be less than downstream width."
    }
  ],
  // Add more duct constraints as they're defined in the Excel sheet
  // A7A has no constraints, so it's not included here
};

// Helper function to get constraints for a specific duct
export function getConstraintsForDuct(ductId: string): DuctConstraint[] {
  return constraintsByDuct[ductId] || [];
}
