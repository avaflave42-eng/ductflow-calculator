export interface DuctNode3D {
  id: string;
  typeId: string;                      // "A8A", "A11E", "Straight", etc.
  position: [number, number, number];  // world coords (ft)
  rotation: [number, number, number];  // Euler radians
  inputs: Record<string, number | string>;
  outputs?: any;

  connectors: {
    id: string;                         // e.g. "in" | "out"
    position: [number, number, number]; // local coords
    direction: [number, number, number]; // normalized vector
  }[];
}

export interface DuctConnection {
  id: string;
  from: string;
  to: string;
  length: number;   // ft
  deltaZ: number;   // elevation change
}

export interface DuctNetwork3D {
  nodes: DuctNode3D[];
  connections: DuctConnection[];
}
