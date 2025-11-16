import { Scene3D } from './Scene3D';
import { useDuctStore } from './useDuctStore';
import { Line } from '@react-three/drei';

export const Duct3DCanvas = () => {
  const nodes = useDuctStore((state) => state.nodes);
  const connections = useDuctStore((state) => state.connections);

  return (
    <Scene3D>
      {/* Render placeholder nodes */}
      {nodes.map((node) => (
        <mesh key={node.id} position={node.position}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      ))}

      {/* Render connections as simple lines */}
      {connections.map((conn) => {
        const fromNode = nodes.find(n => n.id === conn.from);
        const toNode = nodes.find(n => n.id === conn.to);
        
        if (!fromNode || !toNode) return null;

        return (
          <Line
            key={conn.id}
            points={[fromNode.position, toNode.position]}
            color="cyan"
            lineWidth={2}
          />
        );
      })}
    </Scene3D>
  );
};
