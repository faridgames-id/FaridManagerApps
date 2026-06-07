'use client';

import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows, Float, OrbitControls } from '@react-three/drei';

function GundamModel({ url }) {
    const { scene } = useGLTF(url);
    const ref = useRef();

    // Auto-rotate slowly
    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.y += delta * 0.15;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
            {/* Posisi dan scale dapat disesuaikan tergantung ukuran asli GLB-nya */}
            <primitive 
                ref={ref} 
                object={scene} 
                scale={2.5} 
                position={[3, -2.5, 0]} 
                rotation={[0, -Math.PI / 6, 0]} 
            />
        </Float>
    );
}

export default function GundamCanvas() {
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }} gl={{ alpha: true, antialias: true }} style={{ pointerEvents: 'auto' }}>
                <ambientLight intensity={2.0} />
                <directionalLight position={[10, 10, 10]} intensity={3} color="#ffffff" />
                <directionalLight position={[-10, 0, -10]} intensity={1.5} color="#00D2FF" />
                <spotLight position={[0, 15, 10]} intensity={4} angle={0.5} penumbra={1} color="#00E68A" />
                
                <Suspense fallback={null}>
                    <GundamModel url="/gundam.glb" />
                    <Environment preset="city" />
                    <ContactShadows position={[3, -2.8, 0]} opacity={0.6} scale={15} blur={2.5} far={4} color="#00D2FF" />
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
