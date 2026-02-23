"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Edges, Float, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

const GRID = 3;
const GAP = 0.06;
const BOX_SIZE = (1 - (GRID - 1) * GAP) / GRID;

/** Pojedynczy mini-sześcian: ciemne szkło (MeshPhysicalMaterial) + neonowe krawędzie */
function MiniCube({ position }: { position: [number, number, number] }) {
  const geom = useMemo(
    () => new THREE.BoxGeometry(BOX_SIZE, BOX_SIZE, BOX_SIZE),
    []
  );
  return (
    <group position={position}>
      <mesh>
        <primitive object={geom} attach="geometry" />
        <meshPhysicalMaterial
          color="#18181b"
          metalness={0.8}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.2}
          envMapIntensity={0.6}
          transparent
          opacity={0.92}
        />
      </mesh>
      <Edges geometry={geom} threshold={5} color="#10b981" />
    </group>
  );
}

/** Siatka 3x3x3 w stylu Rubika + auto-obrót gdy użytkownik nie dotyka */
function RubikGroup({
  groupRef,
  isInteractingRef,
}: {
  groupRef: React.RefObject<THREE.Group | null>;
  isInteractingRef: React.RefObject<boolean>;
}) {
  const cubes = useMemo(() => {
    const out: [number, number, number][] = [];
    const offset = (GRID - 1) / 2;
    for (let x = 0; x < GRID; x++) {
      for (let y = 0; y < GRID; y++) {
        for (let z = 0; z < GRID; z++) {
          out.push([
            (x - offset) * (BOX_SIZE + GAP),
            (y - offset) * (BOX_SIZE + GAP),
            (z - offset) * (BOX_SIZE + GAP),
          ]);
        }
      }
    }
    return out;
  }, []);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group || isInteractingRef.current) return;
    group.rotation.x += delta * 0.12;
    group.rotation.y += delta * 0.18;
  });

  return (
    <group ref={groupRef}>
      {cubes.map((pos, i) => (
        <MiniCube key={i} position={pos} />
      ))}
    </group>
  );
}

/** Śledzi OrbitControls – pauzuje auto-obrót podczas przeciągania */
function InteractionTracker({
  isInteractingRef,
}: {
  isInteractingRef: React.RefObject<boolean>;
}) {
  return (
    <OrbitControls
      enableZoom={false}
      enablePan={false}
      onStart={() => {
        isInteractingRef.current = true;
      }}
      onEnd={() => {
        isInteractingRef.current = false;
      }}
      minPolarAngle={Math.PI / 4}
      maxPolarAngle={Math.PI / 2 + Math.PI / 4}
      dampingFactor={0.08}
      rotateSpeed={0.8}
    />
  );
}

export function HeroCube() {
  const groupRef = useRef<THREE.Group>(null);
  const isInteractingRef = useRef(false);

  return (
    <div
      className="relative h-full w-full border-none bg-transparent"
      style={{ background: "transparent" }}
    >
      <Canvas
        className="h-full w-full"
        style={{ background: "transparent" }}
        camera={{ position: [2.2, 2.2, 2.2], fov: 42 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.setClearAlpha(0);
        }}
      >
        <ambientLight intensity={0.35} />
        {/* Chłodne światło z góry – błękit */}
        <directionalLight
          position={[0, 5, 3]}
          intensity={2}
          color="#0ea5e9"
          castShadow={false}
        />
        {/* Ciepłe światło z dołu – zieleń/szmaragd */}
        <pointLight
          position={[0, -2, 1]}
          intensity={3}
          color="#34d399"
          distance={8}
        />
        <pointLight
          position={[2, 1, 2]}
          intensity={0.4}
          color="#10b981"
          distance={6}
        />
        {/* Lewitacja (Float) + kostka z auto-obrotem */}
        <Float
          speed={1.8}
          rotationIntensity={0}
          floatIntensity={0.4}
        >
          <RubikGroup groupRef={groupRef} isInteractingRef={isInteractingRef} />
        </Float>
        {/* Premium glow / miękki cień pod kostką – bez białego tła, przezroczysty canvas */}
        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.7}
          scale={10}
          blur={2.5}
          far={4}
          color="#4a1d91"
        />
        <InteractionTracker isInteractingRef={isInteractingRef} />
      </Canvas>
    </div>
  );
}
