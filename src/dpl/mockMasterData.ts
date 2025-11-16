import { MasterData } from "./types";

// Minimal stub for testing
// Real data from Excel will include Input_1, Input_2, etc. columns with label names
export const masterData: MasterData = {
  rows: [
    // A7A rows with complete dropdown values and input labels
    { 
      id: "A7A", 
      "R/D": 0.5, 
      C: 0.27, 
      ANGLE: 20, 
      K: 0.31, 
      dropdown_2: "1", 
      dropdown_3: "20",
      Input_1: "D (in)",
      Input_2: "R/D",
      Input_3: "Angle (deg)",
      Input_4: "Q (cfm)"
    },
    { id: "A7A", "R/D": 0.5, C: 0.27, ANGLE: 30, K: 0.45, dropdown_2: "1", dropdown_3: "30" },
    { id: "A7A", "R/D": 0.75, C: 0.22, ANGLE: 45, K: 0.60, dropdown_2: "1.5", dropdown_3: "45" },
    { id: "A7A", "R/D": 0.75, C: 0.22, ANGLE: 60, K: 0.78, dropdown_2: "1.5", dropdown_3: "60" },
    { id: "A7A", "R/D": 1.0, C: 0.19, ANGLE: 75, K: 0.90, dropdown_3: "75" },
    { id: "A7A", "R/D": 1.5, C: 0.17, ANGLE: 90, K: 1.00, dropdown_3: "90" },
    { id: "A7A", "R/D": 2.0, C: 0.15, ANGLE: 110, K: 1.10, dropdown_3: "110" },
    { id: "A7A", "R/D": 3.0, C: 0.13, ANGLE: 130, K: 1.20, dropdown_3: "130" },
    { id: "A7A", "R/D": 3.0, C: 0.13, ANGLE: 150, K: 1.30, dropdown_3: "150" },
    { id: "A7A", "R/D": 3.0, C: 0.13, ANGLE: 180, K: 1.40, dropdown_3: "180" },
    
    // A11D example with input labels
    {
      id: "A11D",
      Input_1: "D_c (in)",
      Input_2: "D_b (in)",
      Input_3: "Q_c (cfm)",
      Input_4: "Q_b (cfm)",
      C: 0.5
    },
    
    // A11E example
    {
      id: "A11E",
      Input_1: "D_c (in)",
      Input_2: "D_b (in)",
      Input_3: "Q_c (cfm)",
      Input_4: "Q_b (cfm)",
      C: 0.5
    },
  ],
};
