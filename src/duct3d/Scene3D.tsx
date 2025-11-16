import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ReactNode } from 'react';

interface Scene3DProps {
  children?: ReactNode;
}

export const Scene3D = ({ children }: Scene3DProps) => {
  return (
    <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
      <color attach="background" args={["#111"]} />
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      
      <gridHelper args={[200, 50, "#666", "#333"]} />
      
      <OrbitControls />
      
      {children}
    </Canvas>
  );
};
