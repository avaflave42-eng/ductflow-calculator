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
    
    // A8A series - Round Conical Expansion (3D lookup: Re -> A1/A -> ANGLE -> C)
    // Re = 50,000
    { id: "A8A", Re: 50000, "A1/A": 1.5, ANGLE: 10, C: 0.12 },
    { id: "A8A", Re: 50000, "A1/A": 1.5, ANGLE: 20, C: 0.15 },
    { id: "A8A", Re: 50000, "A1/A": 1.5, ANGLE: 30, C: 0.19 },
    { id: "A8A", Re: 50000, "A1/A": 1.5, ANGLE: 45, C: 0.25 },
    { id: "A8A", Re: 50000, "A1/A": 1.5, ANGLE: 60, C: 0.32 },
    { id: "A8A", Re: 50000, "A1/A": 1.5, ANGLE: 90, C: 0.45 },
    { id: "A8A", Re: 50000, "A1/A": 2.0, ANGLE: 10, C: 0.14 },
    { id: "A8A", Re: 50000, "A1/A": 2.0, ANGLE: 20, C: 0.18 },
    { id: "A8A", Re: 50000, "A1/A": 2.0, ANGLE: 30, C: 0.23 },
    { id: "A8A", Re: 50000, "A1/A": 2.0, ANGLE: 45, C: 0.31 },
    { id: "A8A", Re: 50000, "A1/A": 2.0, ANGLE: 60, C: 0.39 },
    { id: "A8A", Re: 50000, "A1/A": 2.0, ANGLE: 90, C: 0.55 },
    { id: "A8A", Re: 50000, "A1/A": 2.5, ANGLE: 10, C: 0.16 },
    { id: "A8A", Re: 50000, "A1/A": 2.5, ANGLE: 20, C: 0.21 },
    { id: "A8A", Re: 50000, "A1/A": 2.5, ANGLE: 30, C: 0.27 },
    { id: "A8A", Re: 50000, "A1/A": 2.5, ANGLE: 45, C: 0.36 },
    { id: "A8A", Re: 50000, "A1/A": 2.5, ANGLE: 60, C: 0.46 },
    { id: "A8A", Re: 50000, "A1/A": 2.5, ANGLE: 90, C: 0.65 },
    { id: "A8A", Re: 50000, "A1/A": 3.0, ANGLE: 10, C: 0.18 },
    { id: "A8A", Re: 50000, "A1/A": 3.0, ANGLE: 20, C: 0.24 },
    { id: "A8A", Re: 50000, "A1/A": 3.0, ANGLE: 30, C: 0.31 },
    { id: "A8A", Re: 50000, "A1/A": 3.0, ANGLE: 45, C: 0.42 },
    { id: "A8A", Re: 50000, "A1/A": 3.0, ANGLE: 60, C: 0.53 },
    { id: "A8A", Re: 50000, "A1/A": 3.0, ANGLE: 90, C: 0.75 },
    { id: "A8A", Re: 50000, "A1/A": 4.0, ANGLE: 10, C: 0.22 },
    { id: "A8A", Re: 50000, "A1/A": 4.0, ANGLE: 20, C: 0.29 },
    { id: "A8A", Re: 50000, "A1/A": 4.0, ANGLE: 30, C: 0.38 },
    { id: "A8A", Re: 50000, "A1/A": 4.0, ANGLE: 45, C: 0.51 },
    { id: "A8A", Re: 50000, "A1/A": 4.0, ANGLE: 60, C: 0.65 },
    { id: "A8A", Re: 50000, "A1/A": 4.0, ANGLE: 90, C: 0.92 },
    
    // Re = 200,000
    { id: "A8A", Re: 200000, "A1/A": 1.5, ANGLE: 10, C: 0.10 },
    { id: "A8A", Re: 200000, "A1/A": 1.5, ANGLE: 20, C: 0.13 },
    { id: "A8A", Re: 200000, "A1/A": 1.5, ANGLE: 30, C: 0.16 },
    { id: "A8A", Re: 200000, "A1/A": 1.5, ANGLE: 45, C: 0.21 },
    { id: "A8A", Re: 200000, "A1/A": 1.5, ANGLE: 60, C: 0.27 },
    { id: "A8A", Re: 200000, "A1/A": 1.5, ANGLE: 90, C: 0.38 },
    { id: "A8A", Re: 200000, "A1/A": 2.0, ANGLE: 10, C: 0.12 },
    { id: "A8A", Re: 200000, "A1/A": 2.0, ANGLE: 20, C: 0.15 },
    { id: "A8A", Re: 200000, "A1/A": 2.0, ANGLE: 30, C: 0.19 },
    { id: "A8A", Re: 200000, "A1/A": 2.0, ANGLE: 45, C: 0.26 },
    { id: "A8A", Re: 200000, "A1/A": 2.0, ANGLE: 60, C: 0.33 },
    { id: "A8A", Re: 200000, "A1/A": 2.0, ANGLE: 90, C: 0.47 },
    { id: "A8A", Re: 200000, "A1/A": 2.5, ANGLE: 10, C: 0.14 },
    { id: "A8A", Re: 200000, "A1/A": 2.5, ANGLE: 20, C: 0.18 },
    { id: "A8A", Re: 200000, "A1/A": 2.5, ANGLE: 30, C: 0.23 },
    { id: "A8A", Re: 200000, "A1/A": 2.5, ANGLE: 45, C: 0.31 },
    { id: "A8A", Re: 200000, "A1/A": 2.5, ANGLE: 60, C: 0.39 },
    { id: "A8A", Re: 200000, "A1/A": 2.5, ANGLE: 90, C: 0.55 },
    { id: "A8A", Re: 200000, "A1/A": 3.0, ANGLE: 10, C: 0.15 },
    { id: "A8A", Re: 200000, "A1/A": 3.0, ANGLE: 20, C: 0.20 },
    { id: "A8A", Re: 200000, "A1/A": 3.0, ANGLE: 30, C: 0.26 },
    { id: "A8A", Re: 200000, "A1/A": 3.0, ANGLE: 45, C: 0.35 },
    { id: "A8A", Re: 200000, "A1/A": 3.0, ANGLE: 60, C: 0.45 },
    { id: "A8A", Re: 200000, "A1/A": 3.0, ANGLE: 90, C: 0.64 },
    { id: "A8A", Re: 200000, "A1/A": 4.0, ANGLE: 10, C: 0.19 },
    { id: "A8A", Re: 200000, "A1/A": 4.0, ANGLE: 20, C: 0.25 },
    { id: "A8A", Re: 200000, "A1/A": 4.0, ANGLE: 30, C: 0.32 },
    { id: "A8A", Re: 200000, "A1/A": 4.0, ANGLE: 45, C: 0.43 },
    { id: "A8A", Re: 200000, "A1/A": 4.0, ANGLE: 60, C: 0.55 },
    { id: "A8A", Re: 200000, "A1/A": 4.0, ANGLE: 90, C: 0.78 },
    
    // Re = 600,000
    { id: "A8A", Re: 600000, "A1/A": 1.5, ANGLE: 10, C: 0.09 },
    { id: "A8A", Re: 600000, "A1/A": 1.5, ANGLE: 20, C: 0.11 },
    { id: "A8A", Re: 600000, "A1/A": 1.5, ANGLE: 30, C: 0.14 },
    { id: "A8A", Re: 600000, "A1/A": 1.5, ANGLE: 45, C: 0.19 },
    { id: "A8A", Re: 600000, "A1/A": 1.5, ANGLE: 60, C: 0.24 },
    { id: "A8A", Re: 600000, "A1/A": 1.5, ANGLE: 90, C: 0.34 },
    { id: "A8A", Re: 600000, "A1/A": 2.0, ANGLE: 10, C: 0.10 },
    { id: "A8A", Re: 600000, "A1/A": 2.0, ANGLE: 20, C: 0.13 },
    { id: "A8A", Re: 600000, "A1/A": 2.0, ANGLE: 30, C: 0.17 },
    { id: "A8A", Re: 600000, "A1/A": 2.0, ANGLE: 45, C: 0.23 },
    { id: "A8A", Re: 600000, "A1/A": 2.0, ANGLE: 60, C: 0.29 },
    { id: "A8A", Re: 600000, "A1/A": 2.0, ANGLE: 90, C: 0.41 },
    { id: "A8A", Re: 600000, "A1/A": 2.5, ANGLE: 10, C: 0.12 },
    { id: "A8A", Re: 600000, "A1/A": 2.5, ANGLE: 20, C: 0.15 },
    { id: "A8A", Re: 600000, "A1/A": 2.5, ANGLE: 30, C: 0.20 },
    { id: "A8A", Re: 600000, "A1/A": 2.5, ANGLE: 45, C: 0.27 },
    { id: "A8A", Re: 600000, "A1/A": 2.5, ANGLE: 60, C: 0.34 },
    { id: "A8A", Re: 600000, "A1/A": 2.5, ANGLE: 90, C: 0.48 },
    { id: "A8A", Re: 600000, "A1/A": 3.0, ANGLE: 10, C: 0.13 },
    { id: "A8A", Re: 600000, "A1/A": 3.0, ANGLE: 20, C: 0.17 },
    { id: "A8A", Re: 600000, "A1/A": 3.0, ANGLE: 30, C: 0.22 },
    { id: "A8A", Re: 600000, "A1/A": 3.0, ANGLE: 45, C: 0.30 },
    { id: "A8A", Re: 600000, "A1/A": 3.0, ANGLE: 60, C: 0.38 },
    { id: "A8A", Re: 600000, "A1/A": 3.0, ANGLE: 90, C: 0.54 },
    { id: "A8A", Re: 600000, "A1/A": 4.0, ANGLE: 10, C: 0.16 },
    { id: "A8A", Re: 600000, "A1/A": 4.0, ANGLE: 20, C: 0.21 },
    { id: "A8A", Re: 600000, "A1/A": 4.0, ANGLE: 30, C: 0.27 },
    { id: "A8A", Re: 600000, "A1/A": 4.0, ANGLE: 45, C: 0.37 },
    { id: "A8A", Re: 600000, "A1/A": 4.0, ANGLE: 60, C: 0.47 },
    { id: "A8A", Re: 600000, "A1/A": 4.0, ANGLE: 90, C: 0.66 },
    
    // A10 series - Converging Junctions with proper input labels
    {
      id: "A10A1",
      Input_1: "D_c (in)",
      Input_2: "D_b (in)",
      Input_3: "Q_c (cfm)",
      Input_4: "Q_b (cfm)",
      C: 0.5
    },
    {
      id: "A10B",
      Input_1: "D_c (in)",
      Input_2: "D_b (in)",
      Input_3: "Q_c (cfm)",
      Input_4: "Q_b (cfm)",
      C: 0.5
    },
    {
      id: "A10C",
      Input_1: "D_c (in)",
      Input_2: "D_b (in)",
      Input_3: "Q_c (cfm)",
      Input_4: "Q_b (cfm)",
      C: 0.5
    },
    {
      id: "A10D",
      Input_1: "D_c (in)",
      Input_2: "D_b (in)",
      Input_3: "Q_c (cfm)",
      Input_4: "Q_b (cfm)",
      C: 0.5
    },
    {
      id: "A10E",
      Input_1: "D_c (in)",
      Input_2: "D_b (in)",
      Input_3: "Q_c (cfm)",
      Input_4: "Q_b (cfm)",
      C: 0.5
    },
    {
      id: "A10F",
      Input_1: "D_c (in)",
      Input_2: "D_b (in)",
      Input_3: "Q_c (cfm)",
      Input_4: "Q_b (cfm)",
      C: 0.5
    },
    {
      id: "A10H",
      Input_1: "D_c (in)",
      Input_2: "D_b (in)",
      Input_3: "Q_c (cfm)",
      Input_4: "Q_b (cfm)",
      C: 0.5
    },
    {
      id: "A10I1",
      Input_1: "D_c (in)",
      Input_2: "D_b1 (in)",
      Input_3: "D_b2 (in)",
      Input_4: "Angle (deg)",
      Input_5: "Q_c (cfm)",
      Input_6: "Q_b1 (cfm)",
      Input_7: "Q_b2 (cfm)",
      C: 0.5
    },
    {
      id: "A10I2",
      Input_1: "H_c (in)",
      Input_2: "W_c (in)",
      Input_3: "H_b (in)",
      Input_4: "W_b (in)",
      Input_5: "Angle (deg)",
      Input_6: "Q_c (cfm)",
      Input_7: "Q_b1 (cfm)",
      Input_8: "Q_b2 (cfm)",
      C: 0.5
    },

    // A11 series - Diverging Junctions with proper input labels
    {
      id: "A11A",
      Input_1: "D_c (in)",
      Input_2: "D_b (in)",
      Input_3: "Q_c (cfm)",
      Input_4: "Q_b (cfm)",
      C: 0.5
    },
    {
      id: "A11B",
      Input_1: "D_c (in)",
      Input_2: "D_b (in)",
      Input_3: "Q_c (cfm)",
      Input_4: "Q_b (cfm)",
      C: 0.5
    },
    {
      id: "A11C",
      Input_1: "D_c (in)",
      Input_2: "D_b (in)",
      Input_3: "Q_c (cfm)",
      Input_4: "Q_b (cfm)",
      C: 0.5
    },
    {
      id: "A11D",
      Input_1: "D_c (in)",
      Input_2: "D_b (in)",
      Input_3: "Q_c (cfm)",
      Input_4: "Q_b (cfm)",
      C: 0.5
    },
    {
      id: "A11E",
      Input_1: "D_c (in)",
      Input_2: "D_b (in)",
      Input_3: "Q_c (cfm)",
      Input_4: "Q_b (cfm)",
      C: 0.5
    },
    {
      id: "A11F",
      Input_1: "D_c (in)",
      Input_2: "D_b (in)",
      Input_3: "Q_c (cfm)",
      Input_4: "Q_b (cfm)",
      C: 0.5
    },
    {
      id: "A11G",
      Input_1: "D_c (in)",
      Input_2: "D_b (in)",
      Input_3: "Q_c (cfm)",
      Input_4: "Q_b (cfm)",
      C: 0.5
    },
    {
      id: "A11H",
      Input_1: "D_c (in)",
      Input_2: "D_b (in)",
      Input_3: "Q_c (cfm)",
      Input_4: "Q_b (cfm)",
      C: 0.5
    },
    {
      id: "A11I",
      Input_1: "D_c (in)",
      Input_2: "D_b (in)",
      Input_3: "Q_c (cfm)",
      Input_4: "Q_b (cfm)",
      C: 0.5
    },
    {
      id: "A11J",
      Input_1: "D_c (in)",
      Input_2: "D_b (in)",
      Input_3: "Q_c (cfm)",
      Input_4: "Q_b (cfm)",
      C: 0.5
    },
    {
      id: "A11K",
      Input_1: "D_c (in)",
      Input_2: "D_b (in)",
      Input_3: "Q_c (cfm)",
      Input_4: "Q_b (cfm)",
      C: 0.5
    },
    {
      id: "A11L",
      Input_1: "D_c (in)",
      Input_2: "D_b (in)",
      Input_3: "Q_c (cfm)",
      Input_4: "Q_b (cfm)",
      C: 0.5
    },
    {
      id: "A11N",
      Input_1: "H_c (in)",
      Input_2: "W_c (in)",
      Input_3: "H_b (in)",
      Input_4: "W_b (in)",
      Input_5: "Q_c (cfm)",
      Input_6: "Q_b (cfm)",
      C: 0.5
    },
    {
      id: "A11O",
      Input_1: "H_c (in)",
      Input_2: "W_c (in)",
      Input_3: "H_b (in)",
      Input_4: "W_b (in)",
      Input_5: "Q_c (cfm)",
      Input_6: "Q_b (cfm)",
      C: 0.5
    },
    {
      id: "A11P",
      Input_1: "H_c (in)",
      Input_2: "W_c (in)",
      Input_3: "H_b (in)",
      Input_4: "W_b (in)",
      Input_5: "Q_c (cfm)",
      Input_6: "Q_b (cfm)",
      C: 0.5
    },
    {
      id: "A11Q",
      Input_1: "H_c (in)",
      Input_2: "W_c (in)",
      Input_3: "H_b (in)",
      Input_4: "W_b (in)",
      Input_5: "Q_c (cfm)",
      Input_6: "Q_b (cfm)",
      C: 0.5
    },
    {
      id: "A11R",
      Input_1: "H_c (in)",
      Input_2: "W_c (in)",
      Input_3: "H_b (in)",
      Input_4: "W_b (in)",
      Input_5: "Q_c (cfm)",
      Input_6: "Q_b (cfm)",
      C: 0.5
    },
    {
      id: "A11S",
      Input_1: "H_c (in)",
      Input_2: "W_c (in)",
      Input_3: "H_b (in)",
      Input_4: "W_b (in)",
      Input_5: "Q_c (cfm)",
      Input_6: "Q_b (cfm)",
      C: 0.5
    },
    {
      id: "A11T",
      Input_1: "H_c (in)",
      Input_2: "W_c (in)",
      Input_3: "H_b (in)",
      Input_4: "W_b (in)",
      Input_5: "Q_c (cfm)",
      Input_6: "Q_b (cfm)",
      C: 0.5
    },
    {
      id: "A11U",
      Input_1: "H_c (in)",
      Input_2: "W_c (in)",
      Input_3: "H_b (in)",
      Input_4: "W_b (in)",
      Input_5: "Q_c (cfm)",
      Input_6: "Q_b (cfm)",
      C: 0.5
    },
    {
      id: "A11V",
      Input_1: "H_c (in)",
      Input_2: "W_c (in)",
      Input_3: "H_b (in)",
      Input_4: "W_b (in)",
      Input_5: "Q_c (cfm)",
      Input_6: "Q_b (cfm)",
      C: 0.5
    },
    {
      id: "A11W",
      Input_1: "H_c (in)",
      Input_2: "W_c (in)",
      Input_3: "H_b (in)",
      Input_4: "W_b (in)",
      Input_5: "Q_c (cfm)",
      Input_6: "Q_b (cfm)",
      C: 0.5
    },
    {
      id: "A11X",
      Input_1: "H_c (in)",
      Input_2: "W_c (in)",
      Input_3: "H_b (in)",
      Input_4: "W_b (in)",
      Input_5: "Q_c (cfm)",
      Input_6: "Q_b (cfm)",
      C: 0.5
    },
  ],
};
