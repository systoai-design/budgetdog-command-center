"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneStore } from "@/store/useSceneStore";
import { Float } from "@react-three/drei";

// Number of instances for our swarm
const COUNT = 1200;

function ParticleSwarm() {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const { viewport } = useThree();

    // Generate random data for instances only once
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < COUNT; i++) {
            // Random spherical distribution
            const r = 15;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta) + (Math.random() - 0.5) * 10;
            const z = r * Math.cos(phi) - 5; // pushed back slightly

            // Individual physics characteristics
            const speedX = Math.random() * 0.2 + 0.1;
            const speedY = Math.random() * 0.2 + 0.1;
            const speedZ = Math.random() * 0.2 + 0.1;

            // Individual rotation speeds
            const rotX = Math.random() * 0.02 - 0.01;
            const rotY = Math.random() * 0.02 - 0.01;
            const rotZ = Math.random() * 0.02 - 0.01;

            const scale = Math.random() * 0.15 + 0.05;

            temp.push({
                x, y, z,
                speedX, speedY, speedZ,
                rotX, rotY, rotZ,
                scale,
                timeOffset: Math.random() * 100
            });
        }
        return temp;
    }, []);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state) => {
        if (!meshRef.current) return;

        // 1. Antigravity Perpetual Micro-motion (Sine wave offsets)
        particles.forEach((p, i) => {
            const time = state.clock.elapsedTime + p.timeOffset;

            // Float using noise/sine combinations
            dummy.position.set(
                p.x + Math.sin(time * p.speedX) * 2,
                p.y + Math.cos(time * p.speedY) * 2,
                p.z + Math.sin(time * p.speedZ) * 2
            );

            // Perpetual rotation
            dummy.rotation.x += p.rotX;
            dummy.rotation.y += p.rotY;
            dummy.rotation.z += p.rotZ;

            dummy.scale.set(p.scale, p.scale, p.scale);
            dummy.updateMatrix();

            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
            {/* Crystal / Glass visual */}
            <icosahedronGeometry args={[1, 1]} />
            <meshPhysicalMaterial
                color="#ffffff"
                transmission={0.9}
                opacity={1}
                metalness={0.1}
                roughness={0.1}
                ior={1.5}
                thickness={0.5}
                clearcoat={1}
            />
        </instancedMesh>
    );
}

function Rig() {
    const { camera } = useThree();
    const target = useMemo(() => new THREE.Vector3(), []);

    useFrame(() => {
        const { pointer, scrollY } = useSceneStore.getState();

        // Target camera position based purely on normalized pointer (decoupled from DOM render)
        // Adjust scroll impact
        const scrollOffset = scrollY * 0.01;

        target.set(
            (pointer.x * 2),
            (pointer.y * 2) - scrollOffset,
            5 // base Z
        );

        // 2. ANTIGRAVITY LERPING: Camera must NEVER snap 1:1. Always linear interpolate.
        camera.position.lerp(target, 0.05);

        // Make camera look at center, with slight lerped drift
        const lookTarget = new THREE.Vector3(pointer.x * 0.5, pointer.y * 0.5 - scrollOffset * 0.5, 0);

        // Using a quaternion slerp for extremely smooth camera rotation
        const currentQuat = camera.quaternion.clone();
        camera.lookAt(lookTarget);
        const targetQuat = camera.quaternion.clone();

        camera.quaternion.copy(currentQuat).slerp(targetQuat, 0.05);
    });

    return null;
}

export function CanvasBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 bg-[#020202]">
            <Canvas
                camera={{ position: [0, 0, 5], fov: 45 }}
                gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
                dpr={[1, 2]} // clamp pixel ratio for performance
            >
                {/* Mysterious low-key lighting for Apple aesthetic */}
                <ambientLight intensity={0.5} />

                {/* Subtle warm rim light */}
                <directionalLight position={[10, 10, 5]} intensity={1} color="#facc15" />
                {/* Subtle cool fill light */}
                <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#cbd5e1" />

                <Rig />
                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <ParticleSwarm />
                </Float>
            </Canvas>
        </div>
    );
}
