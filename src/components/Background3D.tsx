import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Box, Torus } from '@react-three/drei';
import * as THREE from 'three';

interface FloatingShapeProps {
  position: [number, number, number];
  rotationSpeed: [number, number, number];
  color: string;
  shape: 'sphere' | 'box' | 'torus';
}

const FloatingShape: React.FC<FloatingShapeProps> = ({ position, rotationSpeed, color, shape }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += rotationSpeed[0];
      meshRef.current.rotation.y += rotationSpeed[1];
      meshRef.current.rotation.z += rotationSpeed[2];
      
      // Gentle floating motion
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.5;
    }
  });

  const shapeProps = {
    ref: meshRef,
    position,
  };

  const material = (
    <meshStandardMaterial 
      color={color} 
      transparent 
      opacity={0.6}
      roughness={0.1}
      metalness={0.8}
      emissive={color}
      emissiveIntensity={0.2}
    />
  );

  switch (shape) {
    case 'sphere':
      return (
        <Sphere {...shapeProps} args={[0.8, 32, 32]}>
          {material}
        </Sphere>
      );
    case 'box':
      return (
        <Box {...shapeProps} args={[1.2, 1.2, 1.2]}>
          {material}
        </Box>
      );
    case 'torus':
      return (
        <Torus {...shapeProps} args={[1, 0.4, 16, 100]}>
          {material}
        </Torus>
      );
    default:
      return null;
  }
};

const Background3D: React.FC = () => {
  const shapes: FloatingShapeProps[] = [
    {
      position: [-8, 2, -5],
      rotationSpeed: [0.01, 0.02, 0],
      color: '#8B5CF6',
      shape: 'sphere',
    },
    {
      position: [8, -2, -8],
      rotationSpeed: [0.02, 0.01, 0.015],
      color: '#A855F7',
      shape: 'box',
    },
    {
      position: [0, 4, -10],
      rotationSpeed: [0.015, 0.025, 0.01],
      color: '#9333EA',
      shape: 'torus',
    },
    {
      position: [-6, -4, -6],
      rotationSpeed: [0.02, 0.01, 0.02],
      color: '#7C3AED',
      shape: 'sphere',
    },
    {
      position: [6, 1, -12],
      rotationSpeed: [0.01, 0.02, 0.01],
      color: '#6D28D9',
      shape: 'box',
    },
  ];

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#8B5CF6" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#A855F7" />
        
        {shapes.map((shape, index) => (
          <FloatingShape key={index} {...shape} />
        ))}
        
        {/* Particle field */}
        <mesh>
          <sphereGeometry args={[20, 32, 32]} />
          <meshBasicMaterial 
            color="#1E1B4B" 
            transparent 
            opacity={0.1}
            side={THREE.BackSide}
          />
        </mesh>
      </Canvas>
    </div>
  );
};

export default Background3D;