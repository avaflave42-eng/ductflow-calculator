import { MasterData } from "./types";

// Minimal stub for A7A testing
// You'll replace this with real data from Excel later
export const masterData: MasterData = {
  rows: [
    // A7A rows with R/D and C values, plus dropdown columns
    { id: "A7A", "R/D": 0.5, C: 0.27, ANGLE: 20, K: 0.31, dropdown_2: "0.5", dropdown_3: "20" },
    { id: "A7A", "R/D": 0.75, C: 0.22, ANGLE: 30, K: 0.45, dropdown_2: "0.75", dropdown_3: "30" },
    { id: "A7A", "R/D": 1.0, C: 0.19, ANGLE: 45, K: 0.60, dropdown_3: "45" },
    { id: "A7A", "R/D": 1.5, C: 0.17, ANGLE: 60, K: 0.78, dropdown_3: "60" },
    { id: "A7A", "R/D": 2.0, C: 0.15, ANGLE: 75, K: 0.90, dropdown_3: "75" },
    { id: "A7A", "R/D": 3.0, C: 0.13, ANGLE: 90, K: 1.00, dropdown_3: "90" },
  ],
};
