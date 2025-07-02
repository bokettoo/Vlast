import React, { useRef, useEffect } from 'react';
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
  const frameCount = useRef(0);
  const isVisible = useRef(true);

  // Pause animation when tab is hidden
  useEffect(() => {
    const handleVisibility = () => {
      isVisible.current = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  useFrame((state) => {
    if (!isVisible.current) return;
    frameCount.current = (frameCount.current + 1) % 3; // Throttle: update every 3rd frame
    if (frameCount.current !== 0) return;
    if (meshRef.current) {
      meshRef.current.rotation.x += rotationSpeed[0];
      meshRef.current.rotation.y += rotationSpeed[1];
      meshRef.current.rotation.z += rotationSpeed[2];
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
      opacity={0.5} // Slightly more transparent
      roughness={0.2}
      metalness={0.5}
      emissive={color}
      emissiveIntensity={0.1}
    />
  );

  switch (shape) {
    case 'sphere':
      return (
        <Sphere {...shapeProps} args={[0.8, 12, 12]}>{/* Lowered segments */}
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
        <Torus {...shapeProps} args={[1, 0.4, 8, 32]}>{/* Lowered segments */}
          {material}
        </Torus>
      );
    default:
      return null;
  }
};

const Background3D: React.FC = () => {
  // Only 2 shapes for less GPU load
  const shapes: FloatingShapeProps[] = [
    {
      position: [-6, 2, -5],
      rotationSpeed: [0.01, 0.01, 0],
      color: '#8B5CF6',
      shape: 'sphere',
    },
    {
      position: [6, -2, -8],
      rotationSpeed: [0.01, 0.01, 0.01],
      color: '#A855F7',
      shape: 'box',
    },
  ];

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.2} /> {/* Only ambient light */}
        {/* No point lights for less GPU usage */}
        {shapes.map((shape, index) => (
          <FloatingShape key={index} {...shape} />
        ))}
        {/* Particle field - lower geometry */}
        <mesh>
          <sphereGeometry args={[20, 8, 8]} />
          <meshBasicMaterial 
            color="#1E1B4B" 
            transparent 
            opacity={0.08}
            side={THREE.BackSide}
          />
        </mesh>
      </Canvas>
    </div>
  );
};

export default Background3D;