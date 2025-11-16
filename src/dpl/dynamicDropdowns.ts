import { MasterData, DuctDefinition, DuctInputField } from "./types";
import { getRowsForId } from "./masterDataHelpers";

/**
 * Extracts dropdown values from master table columns (P-W in Excel)
 * Dropdown columns are named: dropdown_1, dropdown_2, dropdown_3, etc.
 * 
 * For a given duct ID, if dropdown_N has values, then entry_N becomes a select input
 */
export function extractDropdownOptions(
  ductId: string,
  data: MasterData
): Map<string, string[]> {
  const dropdownMap = new Map<string, string[]>();
  
  const rows = getRowsForId(data, ductId);
  if (rows.length === 0) return dropdownMap;

  // Check dropdown columns 1-8 (covers columns P-W in Excel)
  for (let i = 1; i <= 8; i++) {
    const dropdownKey = `dropdown_${i}`;
    const values = new Set<string>();
    
    // Collect all non-null, non-empty dropdown values from all rows
    rows.forEach(row => {
      const value = row[dropdownKey];
      if (value !== null && value !== undefined && value !== "") {
        values.add(String(value));
      }
    });
    
    if (values.size > 0) {
      // Map dropdown_N to entry_N
      const entryKey = `entry_${i}`;
      dropdownMap.set(entryKey, Array.from(values).sort((a, b) => {
        // Try numeric sort first
        const numA = parseFloat(a);
        const numB = parseFloat(b);
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }
        // Fallback to string sort
        return a.localeCompare(b);
      }));
    }
  }
  
  return dropdownMap;
}

/**
 * Applies dynamic dropdowns to a duct definition based on master table data
 */
export function applyDynamicDropdowns(
  ductDef: DuctDefinition,
  data: MasterData
): DuctDefinition {
  const dropdownOptions = extractDropdownOptions(ductDef.id, data);
  
  if (dropdownOptions.size === 0) {
    return ductDef; // No dropdowns, return as-is
  }
  
  // Clone and modify inputs
  const updatedInputs: DuctInputField[] = ductDef.inputs.map(input => {
    const options = dropdownOptions.get(input.entryKey);
    
    if (options && options.length > 0) {
      // Convert to select type
      return {
        ...input,
        type: "select" as const,
        options: options,
      };
    }
    
    return input;
  });
  
  return {
    ...ductDef,
    inputs: updatedInputs,
  };
}
