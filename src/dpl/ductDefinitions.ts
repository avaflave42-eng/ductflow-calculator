import { DuctDefinition } from "./types";

export const ductDefinitions: DuctDefinition[] = [
  {
    id: "A7A",
    fitting: "Elbow",
    fittingType: "Round, Smooth Radius",
    name: "A7A - Round Elbow, Smooth Radius, 90°",
    shape: "round",
    inputs: [
      {
        entryKey: "entry_1",
        label: "D (in)",
        type: "number",
        unitHint: "Diameter",
      },
      {
        entryKey: "entry_2",
        label: "R/D",
        type: "number",
        unitHint: "Radius to Diameter ratio",
      },
      {
        entryKey: "entry_3",
        label: "Angle (deg)",
        type: "number",
        unitHint: "Bend angle",
      },
      {
        entryKey: "entry_4",
        label: "Q (cfm)",
        type: "number",
        unitHint: "Flow rate",
      },
    ],
    outputs: [
      { key: "output_1", label: "Velocity (ft/min)" },
      { key: "output_2", label: "Vel. Pres @ V0 (in w.c.)" },
      { key: "output_3", label: "Loss Coefficient" },
      { key: "output_4", label: "Pressure Loss (in w.c.)" },
    ],
  },
  // Add more duct definitions later (A7B, A7C, etc.)
];
