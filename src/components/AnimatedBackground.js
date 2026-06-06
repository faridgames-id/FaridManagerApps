'use client';
import React, { useEffect, useRef } from 'react';

export default function AnimatedBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationId;
        let time = 0;

        // Mouse tracking for parallax
        let targetMouseX = 0;
        let targetMouseY = 0;
        let mouseX = 0;
        let mouseY = 0;

        const handleMouseMove = (e) => {
            // Normalized mouse position from -1 to 1
            targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
            targetMouseY = (e.clientY / window.innerHeight) * 2 - 1;
        };

        window.addEventListener('mousemove', handleMouseMove);

        const resize = () => {
            // Support high-DPI displays for "HD Quality"
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            ctx.scale(dpr, dpr);
        };
        resize();
        window.addEventListener('resize', resize);

        // 3D floating shapes — HD colors & larger sizes
        const shapes = [];
        const SHAPE_COUNT = 18; // More shapes

        for (let i = 0; i < SHAPE_COUNT; i++) {
            // Vibrant Neon Blue and Cyan base
            const isGold = Math.random() > 0.85; // 15% chance for a gold shape
            const hue = isGold ? 45 + Math.random() * 10 : 190 + Math.random() * 30;
            
            shapes.push({
                x: Math.random() * 1.6 - 0.3,
                y: Math.random() * 1.6 - 0.3,
                z: Math.random() * 0.9 + 0.1,
                size: 40 + Math.random() * 90, // BIGGER shapes
                rotX: Math.random() * Math.PI * 2,
                rotY: Math.random() * Math.PI * 2,
                rotZ: Math.random() * Math.PI * 2,
                speedX: (Math.random() - 0.5) * 0.0008,
                speedY: (Math.random() - 0.5) * 0.0008,
                rotSpeedX: (Math.random() - 0.5) * 0.015,
                rotSpeedY: (Math.random() - 0.5) * 0.015,
                rotSpeedZ: (Math.random() - 0.5) * 0.015,
                type: ['cube', 'pyramid', 'diamond'][Math.floor(Math.random() * 3)],
                hue: hue,
                saturation: isGold ? 90 + Math.random() * 10 : 80 + Math.random() * 20, 
                lightness: isGold ? 60 + Math.random() * 15 : 50 + Math.random() * 15,
                opacity: 0.2 + Math.random() * 0.25, // More opaque
                floatPhase: Math.random() * Math.PI * 2,
                floatAmp: 30 + Math.random() * 50, // bigger swings
                floatSpeed: 0.002 + Math.random() * 0.004,
            });
        }

        // Particle System (Star Dust)
        const particles = [];
        const PARTICLE_COUNT = 80;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 2.5 + 0.5,
                speedY: -(Math.random() * 0.5 + 0.2),
                speedX: (Math.random() - 0.5) * 0.3,
                opacity: Math.random() * 0.6 + 0.2,
                pulseSpeed: 0.02 + Math.random() * 0.03,
                pulsePhase: Math.random() * Math.PI * 2
            });
        }

        // 3D projection helper
        const project3D = (x3d, y3d, z3d, cx, cy) => {
            const perspective = 1000;
            const scale = perspective / (perspective + z3d + 100);
            return {
                x: cx + x3d * scale,
                y: cy + y3d * scale,
                z: z3d,
                scale: scale,
            };
        };

        // Rotate a 3D point
        const rotate3D = (x, y, z, rx, ry, rz) => {
            let y1 = y * Math.cos(rx) - z * Math.sin(rx);
            let z1 = y * Math.sin(rx) + z * Math.cos(rx);
            let x2 = x * Math.cos(ry) + z1 * Math.sin(ry);
            let z2 = -x * Math.sin(ry) + z1 * Math.cos(ry);
            let x3 = x2 * Math.cos(rz) - y1 * Math.sin(rz);
            let y3 = x2 * Math.sin(rz) + y1 * Math.cos(rz);
            return { x: x3, y: y3, z: z2 };
        };

        // Calculate face normal and light intensity
        const calculateLighting = (v0, v1, v2) => {
            const ax = v1.x - v0.x;
            const ay = v1.y - v0.y;
            const az = v1.z - v0.z;
            const bx = v2.x - v0.x;
            const by = v2.y - v0.y;
            const bz = v2.z - v0.z;
            
            let nx = ay * bz - az * by;
            let ny = az * bx - ax * bz;
            let nz = ax * by - ay * bx;
            
            const len = Math.sqrt(nx*nx + ny*ny + nz*nz);
            if (len === 0) return 0;
            nx /= len; ny /= len; nz /= len;

            // Light from top-left
            const lx = -0.6;
            const ly = -0.5;
            const lz = -0.6;
            const lLen = Math.sqrt(lx*lx + ly*ly + lz*lz);
            const nlx = lx / lLen;
            const nly = ly / lLen;
            const nlz = lz / lLen;

            let dot = nx * nlx + ny * nly + nz * nlz;
            
            // Higher contrast lighting for HD feel
            return Math.max(0.1, dot * 0.8 + 0.4);
        };

        // Draw solid flat shaded shape
        const drawSolidShape = (cx, cy, vertices, faces, rx, ry, rz, baseHue, baseSat, baseLight, alpha) => {
            const rotated = vertices.map(v => rotate3D(v[0], v[1], v[2], rx, ry, rz));
            const projected = rotated.map(r => project3D(r.x, r.y, r.z, cx, cy));

            const facesWithZ = faces.map(faceIndices => {
                let zSum = 0;
                const faceRotatedVertices = faceIndices.map(i => rotated[i]);
                const faceProjectedVertices = faceIndices.map(i => projected[i]);
                
                faceIndices.forEach(i => { zSum += rotated[i].z; });
                
                const v0 = faceProjectedVertices[0];
                const v1 = faceProjectedVertices[1];
                const v2 = faceProjectedVertices[2];
                const cross2d = (v1.x - v0.x) * (v2.y - v0.y) - (v1.y - v0.y) * (v2.x - v0.x);
                
                return {
                    indices: faceIndices,
                    zAvg: zSum / faceIndices.length,
                    isBackfacing: cross2d < 0,
                    rotatedVertices: faceRotatedVertices,
                    projectedVertices: faceProjectedVertices
                };
            });

            facesWithZ.sort((a, b) => b.zAvg - a.zAvg);

            facesWithZ.forEach(face => {
                if (face.isBackfacing) return;

                const intensity = calculateLighting(face.rotatedVertices[0], face.rotatedVertices[1], face.rotatedVertices[2]);
                const finalLightness = Math.min(100, Math.max(8, baseLight * intensity));
                
                ctx.beginPath();
                ctx.moveTo(face.projectedVertices[0].x, face.projectedVertices[0].y);
                for (let i = 1; i < face.projectedVertices.length; i++) {
                    ctx.lineTo(face.projectedVertices[i].x, face.projectedVertices[i].y);
                }
                ctx.closePath();
                
                ctx.fillStyle = `hsla(${baseHue}, ${baseSat}%, ${finalLightness}%, ${alpha})`;
                ctx.fill();
                
                // Brighter stroke for sharp edges
                ctx.strokeStyle = `hsla(${baseHue}, ${baseSat}%, ${Math.min(100, finalLightness + 30)}%, ${alpha * 1.5})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
            });
        };

        const drawShape = (shape, w, h) => {
            const floatY = Math.sin(time * shape.floatSpeed + shape.floatPhase) * shape.floatAmp;
            
            // Apply parallax offset based on depth (z)
            const parallaxX = -mouseX * 100 * (1 - shape.z);
            const parallaxY = -mouseY * 100 * (1 - shape.z);

            const cx = shape.x * w + parallaxX;
            const cy = shape.y * h + floatY + parallaxY;
            const depthScale = 0.5 + shape.z * 0.8;
            const size = shape.size * depthScale;

            const rx = shape.rotX;
            const ry = shape.rotY;
            const rz = shape.rotZ;

            let vertices = [];
            let faces = [];
            const hs = size / 2;

            if (shape.type === 'cube') {
                vertices = [
                    [-hs,-hs,-hs], [hs,-hs,-hs], [hs,hs,-hs], [-hs,hs,-hs],
                    [-hs,-hs,hs],  [hs,-hs,hs],  [hs,hs,hs],  [-hs,hs,hs],
                ];
                faces = [
                    [0,1,2,3], [5,4,7,6], [4,0,3,7], [1,5,6,2], [4,5,1,0], [3,2,6,7]
                ];
            } else if (shape.type === 'pyramid') {
                vertices = [
                    [0, -hs*1.4, 0], [-hs, hs, -hs], [hs, hs, -hs], [hs, hs, hs], [-hs, hs, hs],
                ];
                faces = [
                    [0,2,1], [0,3,2], [0,4,3], [0,1,4], [1,2,3,4]
                ];
            } else if (shape.type === 'diamond') {
                vertices = [
                    [0, -hs*1.6, 0], [-hs, 0, -hs], [hs, 0, -hs], [hs, 0, hs], [-hs, 0, hs], [0, hs*1.6, 0],
                ];
                faces = [
                    [0,2,1], [0,3,2], [0,4,3], [0,1,4], [5,1,2], [5,2,3], [5,3,4], [5,4,1]
                ];
            }

            drawSolidShape(cx, cy, vertices, faces, rx, ry, rz, shape.hue, shape.saturation, shape.lightness, shape.opacity);
        };

        const drawParticles = (w, h) => {
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.y += p.speedY;
                p.x += p.speedX;
                
                // Parallax for particles
                const px = p.x - mouseX * 30 * p.size;
                const py = p.y - mouseY * 30 * p.size;

                if (p.y < -50) {
                    p.y = h + 50;
                    p.x = Math.random() * w;
                }

                const currentOpacity = p.opacity * (0.5 + 0.5 * Math.sin(time * p.pulseSpeed + p.pulsePhase));

                ctx.beginPath();
                ctx.arc(px, py, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 210, 255, ${currentOpacity})`;
                ctx.fill();
                
                if (p.size > 1.5) {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = 'rgba(0, 210, 255, 0.8)';
                    ctx.fill();
                    ctx.shadowBlur = 0; // reset
                }
            }
        };

        const animate = () => {
            time++;
            const w = window.innerWidth;
            const h = window.innerHeight;

            // Smooth mouse interpolation (easing)
            mouseX += (targetMouseX - mouseX) * 0.05;
            mouseY += (targetMouseY - mouseY) * 0.05;

            ctx.clearRect(0, 0, w, h);

            // Draw particles behind shapes
            drawParticles(w, h);

            // Sort shapes by z-depth
            const sortedShapes = [...shapes].sort((a, b) => a.z - b.z);

            for (const shape of sortedShapes) {
                shape.rotX += shape.rotSpeedX;
                shape.rotY += shape.rotSpeedY;
                shape.rotZ += shape.rotSpeedZ;
                shape.x += shape.speedX;
                shape.y += shape.speedY;

                if (shape.x < -0.4) shape.x = 1.4;
                if (shape.x > 1.4) shape.x = -0.4;
                if (shape.y < -0.4) shape.y = 1.4;
                if (shape.y > 1.4) shape.y = -0.4;

                drawShape(shape, w, h);
            }

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <>
            <canvas
                ref={canvasRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: -100,
                    pointerEvents: 'none',
                    filter: 'blur(0.5px)', // Sharper HD look compared to previous 1px
                }}
            />
            <div className="animated-bg-base" />

            <style jsx>{`
                .animated-bg-base {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    z-index: -101;
                    /* HD Vibrant Gradient */
                    background: linear-gradient(150deg, #050a12 0%, #0a1426 30%, #0b1a38 60%, #040914 100%);
                    background-size: 300% 300%;
                    animation: bgDrift 30s ease-in-out infinite;
                }

                .animated-bg-base::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background:
                        radial-gradient(circle at 20% 30%, rgba(0, 160, 255, 0.18) 0%, transparent 60%),
                        radial-gradient(circle at 80% 70%, rgba(0, 230, 255, 0.15) 0%, transparent 60%),
                        radial-gradient(circle at 50% 50%, rgba(0, 82, 212, 0.1) 0%, transparent 80%);
                    animation: auroraBreath 12s ease-in-out infinite alternate;
                }

                @keyframes bgDrift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }

                @keyframes auroraBreath {
                    0% { opacity: 0.5; transform: scale(1) rotate(0deg); }
                    100% { opacity: 1; transform: scale(1.1) rotate(2deg); }
                }
            `}</style>
        </>
    );
}
