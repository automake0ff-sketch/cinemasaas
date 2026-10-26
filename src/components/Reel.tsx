"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
function Spinning({ still }: { still: boolean }) {
  const g = useRef<Group>(null);
  useFrame((_, d) => { if (g.current && !still) g.current.rotation.z += d * 0.25; });
  return (
    <group ref={g} rotation={[0.3, 0.4, 0]}>
      <mesh><cylinderGeometry args={[1.6, 1.6, 0.25, 48]} /><meshStandardMaterial color="#D7AE68" metalness={0.9} roughness={0.3} /></mesh>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[Math.cos(i * Math.PI / 3) * 1, 0, Math.sin(i * Math.PI / 3) * 1]}>
          <cylinderGeometry args={[0.3, 0.3, 0.3, 24]} /><meshStandardMaterial color="#090B10" />
        </mesh>
      ))}
    </group>
  );
}
export default function Reel({ still }: { still: boolean }) {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 5], fov: 40 }}>
      <ambientLight intensity={0.4} /><pointLight position={[3, 3, 4]} intensity={60} color="#ffcf8a" />
      <Spinning still={still} />
    </Canvas>
  );
}
