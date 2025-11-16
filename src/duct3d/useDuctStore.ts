import { create } from 'zustand';
import { DuctNode3D, DuctConnection } from './types';

interface DuctStore {
  nodes: DuctNode3D[];
  connections: DuctConnection[];
  
  addNode: (node: DuctNode3D) => void;
  updateNode: (id: string, patch: Partial<DuctNode3D>) => void;
  addConnection: (conn: DuctConnection) => void;
  removeNode: (id: string) => void;
  removeConnection: (id: string) => void;
  resetNetwork: () => void;
}

export const useDuctStore = create<DuctStore>((set) => ({
  nodes: [],
  connections: [],
  
  addNode: (node) => set((state) => ({
    nodes: [...state.nodes, node]
  })),
  
  updateNode: (id, patch) => set((state) => ({
    nodes: state.nodes.map(node => 
      node.id === id ? { ...node, ...patch } : node
    )
  })),
  
  addConnection: (conn) => set((state) => ({
    connections: [...state.connections, conn]
  })),
  
  removeNode: (id) => set((state) => ({
    nodes: state.nodes.filter(node => node.id !== id),
    connections: state.connections.filter(
      conn => conn.from !== id && conn.to !== id
    )
  })),
  
  removeConnection: (id) => set((state) => ({
    connections: state.connections.filter(conn => conn.id !== id)
  })),
  
  resetNetwork: () => set({ nodes: [], connections: [] })
}));
