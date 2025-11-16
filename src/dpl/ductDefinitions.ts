import { DuctDefinition } from "./types";

// Helper to create placeholder duct definition
const createPlaceholderDuct = (
  id: string,
  fitting: string,
  fittingType: string,
  caseName: string,
  shape: "round" | "rectangular"
): DuctDefinition => ({
  id,
  fitting,
  fittingType,
  name: `${id} - ${caseName}`,
  shape,
  inputs: [
    { entryKey: "entry_1", label: "Input 1", type: "number", unitHint: "TBD" },
    { entryKey: "entry_2", label: "Input 2", type: "number", unitHint: "TBD" },
    { entryKey: "entry_3", label: "Input 3", type: "number", unitHint: "TBD" },
    { entryKey: "entry_4", label: "Input 4", type: "number", unitHint: "TBD" },
  ],
  outputs: [
    { key: "output_1", label: "Velocity (ft/min)" },
    { key: "output_2", label: "Vel. Pres @ V0 (in w.c.)" },
    { key: "output_3", label: "Loss Coefficient" },
    { key: "output_4", label: "Pressure Loss (in w.c.)" },
  ],
});

export const ductDefinitions: DuctDefinition[] = [
  // Round > Elbows
  {
    id: "A7A",
    fitting: "Elbow",
    fittingType: "Round, Smooth Radius",
    name: "A7A - Round Elbow, Smooth Radius, 90°",
    shape: "round",
    inputs: [
      { entryKey: "entry_1", label: "D (in)", type: "number", unitHint: "Diameter" },
      { entryKey: "entry_2", label: "R/D", type: "number", unitHint: "Radius to Diameter ratio" },
      { entryKey: "entry_3", label: "Angle (deg)", type: "number", unitHint: "Bend angle" },
      { entryKey: "entry_4", label: "Q (cfm)", type: "number", unitHint: "Flow rate" },
    ],
    outputs: [
      { key: "output_1", label: "Velocity (ft/min)" },
      { key: "output_2", label: "Vel. Pres @ V0 (in w.c.)" },
      { key: "output_3", label: "Loss Coefficient" },
      { key: "output_4", label: "Pressure Loss (in w.c.)" },
    ],
  },
  {
    id: "A7B",
    fitting: "Elbow",
    fittingType: "Round, Mitered",
    name: "A7B - Round Elbow, Mitered",
    shape: "round",
    inputs: [
      { entryKey: "entry_1", label: "D (in)", type: "number", unitHint: "Diameter" },
      { entryKey: "entry_2", label: "R/D", type: "number", unitHint: "Radius to Diameter ratio" },
      { entryKey: "entry_3", label: "# pieces", type: "number", unitHint: "Number of pieces" },
      { entryKey: "entry_4", label: "Q (cfm)", type: "number", unitHint: "Flow rate" },
    ],
    outputs: [
      { key: "output_1", label: "Velocity (fpm)" },
      { key: "output_2", label: "Vel. Pres @ V0 (in. w.c.)" },
      { key: "output_3", label: "Loss Coefficient" },
      { key: "output_4", label: "Pressure Loss (in. w.c.)" },
    ],
  },
  {
    id: "A7C",
    fitting: "Elbow",
    fittingType: "Round, Smooth Radius (R/D < 0.5)",
    name: "A7C - Round Elbow, Smooth Radius (R/D < 0.5)",
    shape: "round",
    inputs: [
      { entryKey: "entry_1", label: "D (in)", type: "number", unitHint: "Diameter" },
      { entryKey: "entry_2", label: "Angle (deg)", type: "number", unitHint: "Bend angle" },
      { entryKey: "entry_3", label: "Q (cfm)", type: "number", unitHint: "Flow rate" },
    ],
    outputs: [
      { key: "output_1", label: "Velocity (fpm)" },
      { key: "output_2", label: "Vel. Pres @ V0 (in. w.c.)" },
      { key: "output_3", label: "Loss Coefficient" },
      { key: "output_4", label: "Pressure Loss (in. w.c.)" },
    ],
  },
  {
    id: "A7D",
    fitting: "Elbow",
    fittingType: "Rectangular, Mitered",
    name: "A7D - Rectangular Elbow, Mitered",
    shape: "rectangular",
    inputs: [
      { entryKey: "entry_1", label: "H (in)", type: "number", unitHint: "Height" },
      { entryKey: "entry_2", label: "W (in)", type: "number", unitHint: "Width" },
      { entryKey: "entry_3", label: "Angle (deg)", type: "number", unitHint: "Bend angle" },
      { entryKey: "entry_4", label: "Q (cfm)", type: "number", unitHint: "Flow rate" },
    ],
    outputs: [
      { key: "output_1", label: "Velocity (fpm)" },
      { key: "output_2", label: "Vel. Pres @ V0 (in. w.c.)" },
      { key: "output_3", label: "Loss Coefficient" },
      { key: "output_4", label: "Pressure Loss (in. w.c.)" },
    ],
  },
  {
    id: "A7E",
    fitting: "Elbow",
    fittingType: "Rectangular, Radiused",
    name: "A7E - Rectangular Elbow, Radiused",
    shape: "rectangular",
    inputs: [
      { entryKey: "entry_1", label: "W₁ (in)", type: "number", unitHint: "Inner width" },
      { entryKey: "entry_2", label: "W (in)", type: "number", unitHint: "Width" },
      { entryKey: "entry_3", label: "H (in)", type: "number", unitHint: "Height" },
      { entryKey: "entry_4", label: "Q (cfm)", type: "number", unitHint: "Flow rate" },
    ],
    outputs: [
      { key: "output_1", label: "Velocity (fpm)" },
      { key: "output_2", label: "Vel. Pres @ V0 (in. w.c.)" },
      { key: "output_3", label: "Loss Coefficient" },
      { key: "output_4", label: "Pressure Loss (in. w.c.)" },
    ],
  },
  {
    id: "A7F",
    fitting: "Elbow",
    fittingType: "Rectangular, Radiused (Angle < 90°)",
    name: "A7F - Rectangular Elbow, Radiused (Angle < 90°)",
    shape: "rectangular",
    inputs: [
      { entryKey: "entry_1", label: "H (in)", type: "number", unitHint: "Height" },
      { entryKey: "entry_2", label: "W (in)", type: "number", unitHint: "Width" },
      { entryKey: "entry_3", label: "R (in)", type: "number", unitHint: "Radius" },
      { entryKey: "entry_4", label: "θ (deg)", type: "number", unitHint: "Angle" },
      { entryKey: "entry_5", label: "Q (cfm)", type: "number", unitHint: "Flow rate" },
    ],
    outputs: [
      { key: "output_1", label: "Velocity (fpm)" },
      { key: "output_2", label: "Vel. Pres @ V0 (in. w.c.)" },
      { key: "output_3", label: "Loss Coefficient" },
      { key: "output_4", label: "Pressure Loss (in. w.c.)" },
    ],
  },

  // Round > Transitions (Diverging Flow)
  {
    id: "A8A",
    fitting: "Transition",
    fittingType: "Conical Expansion",
    name: "A8A - Conical Expansion",
    shape: "round",
    inputs: [
      { entryKey: "entry_1", label: "D (in)", type: "number", unitHint: "Diameter" },
      { entryKey: "entry_2", label: "D₁ (in)", type: "number", unitHint: "Expanded diameter" },
      { entryKey: "entry_3", label: "Angle (deg)", type: "number", unitHint: "Expansion angle" },
      { entryKey: "entry_4", label: "Q (cfm)", type: "number", unitHint: "Flow rate" },
    ],
    outputs: [
      { key: "output_1", label: "Velocity (fpm)" },
      { key: "output_2", label: "Vel. Pres @ V0 (in. w.c.)" },
      { key: "output_3", label: "Loss Coefficient" },
      { key: "output_4", label: "Pressure Loss (in. w.c.)" },
    ],
  },
  {
    id: "A8C",
    fitting: "Transition",
    fittingType: "Round to Rectangular",
    name: "A8C - Round to Rectangular Expansion",
    shape: "round",
    inputs: [
      { entryKey: "entry_1", label: "H (in)", type: "number", unitHint: "Height" },
      { entryKey: "entry_2", label: "W (in)", type: "number", unitHint: "Width" },
      { entryKey: "entry_3", label: "D (in)", type: "number", unitHint: "Diameter" },
      { entryKey: "entry_4", label: "L (in)", type: "number", unitHint: "Length" },
      { entryKey: "entry_5", label: "Q (cfm)", type: "number", unitHint: "Flow rate" },
    ],
    outputs: [
      { key: "output_1", label: "Velocity (fpm)" },
      { key: "output_2", label: "Vel. Pres @ V0 (in. w.c.)" },
      { key: "output_3", label: "Loss Coefficient" },
      { key: "output_4", label: "Pressure Loss (in. w.c.)" },
    ],
  },

  // Round > Transitions (Converging Flow)
  createPlaceholderDuct("A9A1", "Transition", "Conical Contraction", "Conical Contraction", "round"),
  createPlaceholderDuct("A9B1", "Transition", "Stepped Conical Contraction", "Stepped Conical Contraction", "round"),
  createPlaceholderDuct("A9D", "Transition", "Round to Rectangular", "Round to Rectangular Contraction", "round"),

  // Round > Converging Junctions
  createPlaceholderDuct("A10A", "Junction", "Converging Tee, Round", "Converging Tee, Round", "round"),
  createPlaceholderDuct("A10B", "Junction", "Converging Wye, Round", "Converging Wye, Round", "round"),
  createPlaceholderDuct("A10E", "Junction", "Converging Wye, Rectangular Main to Round Branch", "Converging Wye, Rectangular Main to Round Branch", "round"),
  createPlaceholderDuct("A10I1", "Junction", "Converging 45° Wye, Round", "Converging 45° Wye, Round", "round"),

  // Round > Diverging Junctions
  createPlaceholderDuct("A11A", "Junction", "Tee, Round, Straight Main, Conical Branch, 0°", "Tee, Round, Straight Main, Conical Branch, 0°", "round"),
  createPlaceholderDuct("A11B", "Junction", "Tee, Round, Straight Main, Conical Branch, 30°", "Tee, Round, Straight Main, Conical Branch, 30°", "round"),
  createPlaceholderDuct("A11C", "Junction", "Tee, Round, Straight Main, Conical Branch, 45°", "Tee, Round, Straight Main, Conical Branch, 45°", "round"),
  createPlaceholderDuct("A11D", "Junction", "Tee, Round, Straight Main, Conical Branch, 60°", "Tee, Round, Straight Main, Conical Branch, 60°", "round"),
  createPlaceholderDuct("A11E", "Junction", "Tee, Round, Straight Main, Conical Branch, 90°", "Tee, Round, Straight Main, Conical Branch, 90°", "round"),
  createPlaceholderDuct("A11F", "Junction", "Tee, Round, Straight Main, Tapered Branch, 90°", "Tee, Round, Straight Main, Tapered Branch, 90°", "round"),
  createPlaceholderDuct("A11G", "Junction", "Tee, Round, Straight Main, Round Branch, 45°", "Tee, Round, Straight Main, Round Branch, 45°", "round"),
  createPlaceholderDuct("A11H", "Junction", "Wye, Round, 45°, Curved Main", "Wye, Round, 45°, Curved Main", "round"),
  createPlaceholderDuct("A11I", "Junction", "Wye, Round, 45°, Rectangular Main", "Wye, Round, 45°, Rectangular Main", "round"),
  createPlaceholderDuct("A11J", "Junction", "Tee, Round Reducer", "Tee, Round Reducer", "round"),
  createPlaceholderDuct("A11K", "Junction", "Tee, Rectangular Main to Round Branch, Conical", "Tee, Rectangular Main to Round Branch, Conical", "round"),
  createPlaceholderDuct("A11L", "Junction", "Wye, Round, 45°, Converging Reducer", "Wye, Round, 45°, Converging Reducer", "round"),
  createPlaceholderDuct("A11M", "Junction", "Tee, Round, Tapered Main, Round Branch, 90°", "Tee, Round, Tapered Main, Round Branch, 90°", "round"),

  // Round > Entries
  createPlaceholderDuct("A12A", "Entry", "Round, Free Discharge", "Entry, Round, Free Discharge", "round"),
  createPlaceholderDuct("A12B", "Entry", "Round, Flush", "Entry, Round, Flush", "round"),
  createPlaceholderDuct("A12C", "Entry", "Round, Radiused", "Entry, Round, Radiused", "round"),
  createPlaceholderDuct("A12D", "Entry", "Round, Bellmouth", "Entry, Round, Bellmouth", "round"),
  createPlaceholderDuct("A12E", "Entry", "Round, Conical", "Entry, Round, Conical", "round"),
  createPlaceholderDuct("A12F", "Entry", "Intake Hood", "Intake Hood", "round"),
  createPlaceholderDuct("A12G", "Entry", "Hood, Tapered, Flanged or Unflanged", "Hood, Tapered, Flanged or Unflanged", "round"),

  // Rectangular > Elbows (already defined A7D, A7E, A7F above)
  {
    id: "A7G",
    fitting: "Elbow",
    fittingType: "Rectangular, Smooth Radius with Splitter Vanes",
    name: "A7G - Rectangular Elbow with Splitter Vanes",
    shape: "rectangular",
    inputs: [
      { entryKey: "entry_1", label: "H (in)", type: "number", unitHint: "Height" },
      { entryKey: "entry_2", label: "W (in)", type: "number", unitHint: "Width" },
      { entryKey: "entry_3", label: "R (in)", type: "number", unitHint: "Radius" },
      { entryKey: "entry_4", label: "# Vanes", type: "number", unitHint: "Number of vanes" },
      { entryKey: "entry_5", label: "Angle (deg)", type: "number", unitHint: "Bend angle" },
      { entryKey: "entry_6", label: "Q (cfm)", type: "number", unitHint: "Flow rate" },
    ],
    outputs: [
      { key: "output_1", label: "Velocity (fpm)" },
      { key: "output_2", label: "Vel. Pres @ V0 (in. w.c.)" },
      { key: "output_3", label: "Loss Coefficient" },
      { key: "output_4", label: "Pressure Loss (in. w.c.)" },
    ],
  },
  createPlaceholderDuct("A7H1", "Elbow", "Mitered with Single Thickness Turning Vanes", "Mitered with Single Thickness Turning Vanes", "rectangular"),
  createPlaceholderDuct("A7H2", "Elbow", "Mitered with Double Thickness Turning Vanes", "Mitered with Double Thickness Turning Vanes", "rectangular"),
  {
    id: "A7I",
    fitting: "Elbow",
    fittingType: "Rectangular, Z-Shaped",
    name: "A7I - Rectangular Offset (Z-Shaped)",
    shape: "rectangular",
    inputs: [
      { entryKey: "entry_1", label: "H (in)", type: "number", unitHint: "Height" },
      { entryKey: "entry_2", label: "W (in)", type: "number", unitHint: "Width" },
      { entryKey: "entry_3", label: "L (in)", type: "number", unitHint: "Length" },
      { entryKey: "entry_4", label: "Q (cfm)", type: "number", unitHint: "Flow rate" },
    ],
    outputs: [
      { key: "output_1", label: "Velocity (fpm)" },
      { key: "output_2", label: "Vel. Pres @ V0 (in. w.c.)" },
      { key: "output_3", label: "Loss Coefficient" },
      { key: "output_4", label: "Pressure Loss (in. w.c.)" },
    ],
  },
  {
    id: "A7J",
    fitting: "Elbow",
    fittingType: "Rectangular, Different Planes",
    name: "A7J - Rectangular Offset (Different Planes)",
    shape: "rectangular",
    inputs: [
      { entryKey: "entry_1", label: "H (in)", type: "number", unitHint: "Height" },
      { entryKey: "entry_2", label: "W (in)", type: "number", unitHint: "Width" },
      { entryKey: "entry_3", label: "L (in)", type: "number", unitHint: "Length" },
      { entryKey: "entry_4", label: "Q (cfm)", type: "number", unitHint: "Flow rate" },
    ],
    outputs: [
      { key: "output_1", label: "Velocity (fpm)" },
      { key: "output_2", label: "Vel. Pres @ V0 (in. w.c.)" },
      { key: "output_3", label: "Loss Coefficient" },
      { key: "output_4", label: "Pressure Loss (in. w.c.)" },
    ],
  },
  {
    id: "A7K",
    fitting: "Elbow",
    fittingType: "Round Offset",
    name: "A7K - Round Offset",
    shape: "round",
    inputs: [
      { entryKey: "entry_1", label: "D (in)", type: "number", unitHint: "Diameter" },
      { entryKey: "entry_2", label: "L (in)", type: "number", unitHint: "Length" },
      { entryKey: "entry_3", label: "Q (cfm)", type: "number", unitHint: "Flow rate" },
    ],
    outputs: [
      { key: "output_1", label: "Velocity (fpm)" },
      { key: "output_2", label: "Vel. Pres @ V0 (in. w.c.)" },
      { key: "output_3", label: "Loss Coefficient" },
      { key: "output_4", label: "Pressure Loss (in. w.c.)" },
    ],
  },
  createPlaceholderDuct("A7L", "Elbow", "Wye or Tee Shape", "Wye or Tee Shape", "rectangular"),

  // Rectangular > Transitions (Diverging Flow)
  {
    id: "A8B",
    fitting: "Transition",
    fittingType: "Pyramidal Expansion",
    name: "A8B - Rectangular Expansion",
    shape: "rectangular",
    inputs: [
      { entryKey: "entry_1", label: "H (in)", type: "number", unitHint: "Height" },
      { entryKey: "entry_2", label: "W (in)", type: "number", unitHint: "Width" },
      { entryKey: "entry_3", label: "H₁ (in)", type: "number", unitHint: "Height 1" },
      { entryKey: "entry_4", label: "W₁ (in)", type: "number", unitHint: "Width 1" },
      { entryKey: "entry_5", label: "Angle (deg)", type: "number", unitHint: "Expansion angle" },
      { entryKey: "entry_6", label: "Q (cfm)", type: "number", unitHint: "Flow rate" },
    ],
    outputs: [
      { key: "output_1", label: "Velocity (fpm)" },
      { key: "output_2", label: "Vel. Pres @ V0 (in. w.c.)" },
      { key: "output_3", label: "Loss Coefficient" },
      { key: "output_4", label: "Pressure Loss (in. w.c.)" },
    ],
  },
  {
    id: "A8D",
    fitting: "Transition",
    fittingType: "Rectangular to Round",
    name: "A8D - Rectangular to Round Transition",
    shape: "rectangular",
    inputs: [
      { entryKey: "entry_1", label: "H (in)", type: "number", unitHint: "Height" },
      { entryKey: "entry_2", label: "W (in)", type: "number", unitHint: "Width" },
      { entryKey: "entry_3", label: "D (in)", type: "number", unitHint: "Diameter" },
      { entryKey: "entry_4", label: "L (in)", type: "number", unitHint: "Length" },
      { entryKey: "entry_5", label: "Q (cfm)", type: "number", unitHint: "Flow rate" },
    ],
    outputs: [
      { key: "output_1", label: "Velocity (fpm)" },
      { key: "output_2", label: "Vel. Pres @ V0 (in. w.c.)" },
      { key: "output_3", label: "Loss Coefficient" },
      { key: "output_4", label: "Pressure Loss (in. w.c.)" },
    ],
  },
  createPlaceholderDuct("A8E", "Transition", "Rectangular, Sides Straight", "Rectangular, Sides Straight", "rectangular"),
  createPlaceholderDuct("A8F", "Transition", "Symmetric at Fan with Duct Sides Straight", "Symmetric at Fan with Duct Sides Straight", "rectangular"),
  createPlaceholderDuct("A8G", "Transition", "Asymmetric at Fan with Sides Straight, Top Level", "Asymmetric at Fan with Sides Straight, Top Level", "rectangular"),
  createPlaceholderDuct("A8H", "Transition", "Asymmetric at Fan with Sides Straight, Top 10° Down", "Asymmetric at Fan with Sides Straight, Top 10° Down", "rectangular"),
  createPlaceholderDuct("A8I", "Transition", "Asymmetric at Fan with Sides Straight, Top 10° Up", "Asymmetric at Fan with Sides Straight, Top 10° Up", "rectangular"),
  createPlaceholderDuct("A8J", "Transition", "Pyramidal at Fan with Duct", "Pyramidal at Fan with Duct", "rectangular"),

  // Rectangular > Transitions (Converging Flow)
  createPlaceholderDuct("A9A2", "Transition", "Pyramidal Contraction", "Pyramidal Contraction", "rectangular"),
  createPlaceholderDuct("A9B2", "Transition", "Stepped Pyramidal Contraction", "Stepped Pyramidal Contraction", "rectangular"),
  createPlaceholderDuct("A9C", "Transition", "Rectangular Slot to Round", "Rectangular Slot to Round", "rectangular"),

  // Rectangular > Converging Junctions
  createPlaceholderDuct("A10C", "Junction", "Tee, Round Branch to Rectangular Main", "Tee, Round Branch to Rectangular Main", "rectangular"),
  createPlaceholderDuct("A10D", "Junction", "Tee, Rectangular Main & Branch", "Tee, Rectangular Main & Branch", "rectangular"),
  createPlaceholderDuct("A10F", "Junction", "Tee, 45° Entry Branch to Rectangular Main", "Tee, 45° Entry Branch to Rectangular Main", "rectangular"),
  createPlaceholderDuct("A10G", "Junction", "Symmetrical Wye, Dovetail", "Symmetrical Wye, Dovetail", "rectangular"),
  createPlaceholderDuct("A10H", "Junction", "Converging Rectangular Wye", "Converging Rectangular Wye", "rectangular"),
  createPlaceholderDuct("A10I2", "Junction", "Symmetrical Wye", "Symmetrical Wye", "rectangular"),

  // Rectangular > Diverging Junctions
  createPlaceholderDuct("A11N", "Junction", "Tee, 45° Rectangular Main & Branch", "Tee, 45° Rectangular Main & Branch", "rectangular"),
  createPlaceholderDuct("A11O", "Junction", "Tee, 45° Entry, Rectangular Main & Branch with Damper", "Tee, 45° Entry, Rectangular Main & Branch with Damper", "rectangular"),
  createPlaceholderDuct("A11P", "Junction", "Tee, Rectangular Main & Branch", "Tee, Rectangular Main & Branch", "rectangular"),
  createPlaceholderDuct("A11Q", "Junction", "Tee, Rectangular Main & Branch with Damper", "Tee, Rectangular Main & Branch with Damper", "rectangular"),
  createPlaceholderDuct("A11R", "Junction", "Tee, Rectangular Main & Branch with Extractor", "Tee, Rectangular Main & Branch with Extractor", "rectangular"),
  createPlaceholderDuct("A11S", "Junction", "Tee, Rectangular Main to Round Branch", "Tee, Rectangular Main to Round Branch", "rectangular"),
  createPlaceholderDuct("A11T", "Junction", "Rectangular Wye, Main Straight", "Rectangular Wye, Main Straight", "rectangular"),
  createPlaceholderDuct("A11U", "Junction", "Tee, Rectangular Main to Conical Branch", "Tee, Rectangular Main to Conical Branch", "rectangular"),
  createPlaceholderDuct("A11V", "Junction", "90° Curved Rectangular Wye", "90° Curved Rectangular Wye", "rectangular"),
  createPlaceholderDuct("A11W", "Junction", "Symmetrical Wye, Dovetail", "Symmetrical Wye, Dovetail", "rectangular"),
];
