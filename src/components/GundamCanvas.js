'use client';

import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows, Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function GundamModel({ url }) {
    const { scene } = useGLTF(url);
    const ref = useRef();
    const { pointer, viewport } = useThree();

    // Responsif: sesuaikan posisi dan skala berdasarkan lebar layar (mobile vs desktop)
    const isMobile = viewport.width < 5;
    const modelScale = isMobile ? 12 : 22;
    const posX = isMobile ? 1 : 6;
    const posY = isMobile ? -5 : -9;

    useFrame((state, delta) => {
        if (ref.current) {
            // Mengubah rotasi keseluruhan mengikuti cursor
            const targetX = (pointer.x * viewport.width) / 10;
            const targetY = (pointer.y * viewport.height) / 10;

            ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, (pointer.x * Math.PI) / 6 - Math.PI / 8, 0.05);
            ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, -(pointer.y * Math.PI) / 12, 0.05);
        }
    });

    return (
        <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.1}>
            <primitive 
                ref={ref} 
                object={scene} 
                scale={modelScale} 
                position={[posX, posY, -5]} 
                rotation={[0, -Math.PI / 8, 0]} 
            />
        </Float>
    );
}

export default function GundamCanvas() {
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -10, pointerEvents: 'none' }}>
            <Canvas camera={{ position: [0, 0, 10], fov: 45 }} gl={{ alpha: true, antialias: true }} style={{ pointerEvents: 'auto' }}>
                <ambientLight intensity={2.5} />
                <directionalLight position={[10, 10, 10]} intensity={4} color="#ffffff" />
                <directionalLight position={[-10, 0, -10]} intensity={2} color="#00D2FF" />
                <spotLight position={[5, 15, 10]} intensity={5} angle={0.6} penumbra={1} color="#00E68A" />
                
                <Suspense fallback={null}>
                    <GundamModel url="/gundam.glb" />
                    <Environment preset="city" />
                    <ContactShadows position={[8, -15, -5]} opacity={0.6} scale={25} blur={3} far={10} color="#00D2FF" />
                </Suspense>
                
                <OrbitControls 
                    enableZoom={false} 
                    enablePan={false} 
                    minPolarAngle={Math.PI / 2.5} 
                    maxPolarAngle={Math.PI / 1.8}
                    autoRotate={false}
                />
            </Canvas>
        </div>
    );
}

useGLTF.preload('/gundam.glb');
