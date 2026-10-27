"use client";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { stops } from "./tourStops";

const W = 3, H = 4; // plano de la foto (proporción 765×1020)

function Room({ index, still }: { index: number; still: boolean }) {
  const [map, depth] = useLoader(THREE.TextureLoader, ["/tour/sala.jpg", "/tour/sala-depth.png"]);
  useMemo(() => { map.colorSpace = THREE.SRGBColorSpace; }, [map]);
  const look = useRef(new THREE.Vector3());
  useFrame(({ camera, pointer, clock }, dt) => {
    const s = stops[index];
    const k = 1 - Math.exp(-dt * (still ? 20 : 2.2)); // suavizado del movimiento
    const sway = still ? 0 : Math.sin(clock.elapsedTime * 0.4) * 0.03;
    const [x, y, z] = s.cam;
    camera.position.x += (x + pointer.x * 0.18 + sway - camera.position.x) * k;
    camera.position.y += (y + pointer.y * 0.12 - camera.position.y) * k;
    camera.position.z += (z - camera.position.z) * k;
    look.current.x += (s.look[0] - look.current.x) * k;
    look.current.y += (s.look[1] - look.current.y) * k;
    camera.lookAt(look.current.x, look.current.y, 0);
  });
  return (
    <mesh>
      <planeGeometry args={[W, H, 150, 200]} />
      <meshStandardMaterial color="#000" emissive="#fff" emissiveMap={map} displacementMap={depth} displacementScale={0.75} displacementBias={-0.45} />
    </mesh>
  );
}

export default function TourScene({ index, still }: { index: number; still: boolean }) {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 4.6], fov: 45 }}>
      <Room index={index} still={still} />
    </Canvas>
  );
}
