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

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // 3D floating shapes — slow & relaxing, solid flat shading
        const shapes = [];
        const SHAPE_COUNT = 15; // sedikit lebih banyak

        for (let i = 0; i < SHAPE_COUNT; i++) {
            // Bright base colors
            const baseHues = [195, 210, 225]; 
            const hue = baseHues[Math.floor(Math.random() * baseHues.length)];
            
            shapes.push({
                x: Math.random() * 1.4 - 0.2,
                y: Math.random() * 1.4 - 0.2,
                z: Math.random() * 0.8 + 0.2,
                size: 25 + Math.random() * 50,
                rotX: Math.random() * Math.PI * 2,
                rotY: Math.random() * Math.PI * 2,
                rotZ: Math.random() * Math.PI * 2,
                speedX: (Math.random() - 0.5) * 0.0006, // lebih cepat
                speedY: (Math.random() - 0.5) * 0.0006, // lebih cepat
                rotSpeedX: (Math.random() - 0.5) * 0.012, // rotasi lebih cepat
                rotSpeedY: (Math.random() - 0.5) * 0.012, // rotasi lebih cepat
                rotSpeedZ: (Math.random() - 0.5) * 0.012, // rotasi lebih cepat
                type: ['cube', 'pyramid', 'diamond'][Math.floor(Math.random() * 3)],
                hue: hue + Math.random() * 15 - 7.5,
                saturation: 75 + Math.random() * 20, 
                lightness: 55 + Math.random() * 15,
                opacity: 0.15 + Math.random() * 0.2,
                floatPhase: Math.random() * Math.PI * 2,
                floatAmp: 20 + Math.random() * 30, // amplitudo ayunan lebih besar
                floatSpeed: 0.002 + Math.random() * 0.003, // ayunan lebih cepat
            });
        }

        // 3D projection helper
        const project3D = (x3d, y3d, z3d, cx, cy) => {
            const perspective = 800;
            const scale = perspective / (perspective + z3d + 100); // add offset so things don't blow up
            return {
                x: cx + x3d * scale,
                y: cy + y3d * scale,
                z: z3d, // keep z for sorting faces
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
            // Vector 1
            const ax = v1.x - v0.x;
            const ay = v1.y - v0.y;
            const az = v1.z - v0.z;
            // Vector 2
            const bx = v2.x - v0.x;
            const by = v2.y - v0.y;
            const bz = v2.z - v0.z;
            
            // Cross product (Normal)
            let nx = ay * bz - az * by;
            let ny = az * bx - ax * bz;
            let nz = ax * by - ay * bx;
            
            // Normalize
            const len = Math.sqrt(nx*nx + ny*ny + nz*nz);
            if (len === 0) return 0;
            nx /= len; ny /= len; nz /= len;

            // Directional Light (coming from top-left-front)
            const lx = -0.5;
            const ly = -0.5;
            const lz = -0.7;
            const lLen = Math.sqrt(lx*lx + ly*ly + lz*lz);
            const nlx = lx / lLen;
            const nly = ly / lLen;
            const nlz = lz / lLen;

            // Dot product
            let dot = nx * nlx + ny * nly + nz * nlz;
            
            // Return intensity between 0.3 and 1.2
            return Math.max(0.2, dot * 0.6 + 0.6);
        };

        // Draw solid flat shaded shape
        const drawSolidShape = (cx, cy, vertices, faces, rx, ry, rz, baseHue, baseSat, baseLight, alpha) => {
            const rotated = vertices.map(v => rotate3D(v[0], v[1], v[2], rx, ry, rz));
            const projected = rotated.map(r => project3D(r.x, r.y, r.z, cx, cy));

            // Calculate z-index for each face to sort them (Painter's algorithm)
            const facesWithZ = faces.map(faceIndices => {
                let zSum = 0;
                const faceRotatedVertices = faceIndices.map(i => rotated[i]);
                const faceProjectedVertices = faceIndices.map(i => projected[i]);
                
                faceIndices.forEach(i => { zSum += rotated[i].z; });
                
                // Backface culling: calculate 2D cross product of projected points
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

            // Sort faces by Z (furthest first)
            facesWithZ.sort((a, b) => b.zAvg - a.zAvg);

            facesWithZ.forEach(face => {
                if (face.isBackfacing) return; // Skip faces pointing away from camera

                const intensity = calculateLighting(face.rotatedVertices[0], face.rotatedVertices[1], face.rotatedVertices[2]);
                
                // Adjust lightness based on light intensity
                const finalLightness = Math.min(100, Math.max(10, baseLight * intensity));
                
                ctx.beginPath();
                ctx.moveTo(face.projectedVertices[0].x, face.projectedVertices[0].y);
                for (let i = 1; i < face.projectedVertices.length; i++) {
                    ctx.lineTo(face.projectedVertices[i].x, face.projectedVertices[i].y);
                }
                ctx.closePath();
                
                ctx.fillStyle = `hsla(${baseHue}, ${baseSat}%, ${finalLightness}%, ${alpha})`;
                ctx.fill();
                
                // Subtle bright stroke for edges to make them pop
                ctx.strokeStyle = `hsla(${baseHue}, ${baseSat}%, ${Math.min(100, finalLightness + 15)}%, ${alpha * 0.8})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            });
        };

        const drawShape = (shape, w, h) => {
            const floatY = Math.sin(time * shape.floatSpeed + shape.floatPhase) * shape.floatAmp;
            const cx = shape.x * w;
            const cy = shape.y * h + floatY;
            const depthScale = 0.4 + shape.z * 0.6;
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
                    [0,1,2,3], // front
                    [5,4,7,6], // back
                    [4,0,3,7], // left
                    [1,5,6,2], // right
                    [4,5,1,0], // top
                    [3,2,6,7]  // bottom
                ];
            } else if (shape.type === 'pyramid') {
                vertices = [
                    [0, -hs*1.2, 0],   // top
                    [-hs, hs, -hs],    // base
                    [hs, hs, -hs],
                    [hs, hs, hs],
                    [-hs, hs, hs],
                ];
                faces = [
                    [0,2,1], [0,3,2], [0,4,3], [0,1,4], // sides
                    [1,2,3,4] // base
                ];
            } else if (shape.type === 'diamond') {
                vertices = [
                    [0, -hs*1.5, 0],   // top
                    [-hs, 0, -hs],
                    [hs, 0, -hs],
                    [hs, 0, hs],
                    [-hs, 0, hs],
                    [0, hs*1.5, 0],    // bottom
                ];
                faces = [
                    [0,2,1], [0,3,2], [0,4,3], [0,1,4], // top half
                    [5,1,2], [5,2,3], [5,3,4], [5,4,1]  // bottom half
                ];
            }

            drawSolidShape(cx, cy, vertices, faces, rx, ry, rz, shape.hue, shape.saturation, shape.lightness, shape.opacity);
        };

        const animate = () => {
            time++;
            const w = canvas.width;
            const h = canvas.height;

            ctx.clearRect(0, 0, w, h);

            // Sort shapes by z-depth (back to front) for painter's algorithm
            const sortedShapes = [...shapes].sort((a, b) => a.z - b.z);

            for (const shape of sortedShapes) {
                // Slow rotation
                shape.rotX += shape.rotSpeedX;
                shape.rotY += shape.rotSpeedY;
                shape.rotZ += shape.rotSpeedZ;

                // Slow drift
                shape.x += shape.speedX;
                shape.y += shape.speedY;

                // Wrap around gently
                if (shape.x < -0.3) shape.x = 1.3;
                if (shape.x > 1.3) shape.x = -0.3;
                if (shape.y < -0.3) shape.y = 1.3;
                if (shape.y > 1.3) shape.y = -0.3;

                drawShape(shape, w, h);
            }

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
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
                    filter: 'blur(1px)', // Slight blur to blend beautifully into background
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
                    /* Brighter and richer background gradient */
                    background: linear-gradient(145deg, #091325 0%, #0c1a35 35%, #0f2345 65%, #0a1529 100%);
                    background-size: 300% 300%;
                    animation: bgDrift 40s ease-in-out infinite;
                }

                .animated-bg-base::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background:
                        radial-gradient(ellipse 60% 50% at 20% 20%, rgba(0, 160, 255, 0.15) 0%, transparent 70%),
                        radial-gradient(ellipse 50% 40% at 80% 80%, rgba(0, 230, 255, 0.12) 0%, transparent 70%);
                    animation: auroraBreath 15s ease-in-out infinite;
                }

                @keyframes bgDrift {
                    0%, 100% { background-position: 0% 50%; }
                    33% { background-position: 50% 0%; }
                    66% { background-position: 100% 100%; }
                }

                @keyframes auroraBreath {
                    0%, 100% { opacity: 0.6; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.05); }
                }
            `}</style>
        </>
    );
}
