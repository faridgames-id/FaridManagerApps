'use client';
import React from 'react';

/**
 * Lightweight ambient background — CSS-only, zero JS overhead.
 * Replaces the previous heavy Canvas animation (18 3D shapes + 80 particles).
 * GPU-composited via background-position animation.
 */
export default function AnimatedBackground() {
    return (
        <div className="ambient-bg" aria-hidden="true">
            <style jsx>{`
                .ambient-bg {
                    position: fixed;
                    inset: 0;
                    z-index: -1;
                    pointer-events: none;
                    background: #09090b;
                    overflow: hidden;
                }

                .ambient-bg::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background:
                        radial-gradient(ellipse 80% 50% at 20% 40%, rgba(59, 130, 246, 0.06) 0%, transparent 70%),
                        radial-gradient(ellipse 60% 40% at 80% 60%, rgba(168, 85, 247, 0.04) 0%, transparent 70%);
                    animation: ambientDrift 30s ease-in-out infinite alternate;
                }

                .ambient-bg::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background:
                        radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.015) 0%, transparent 50%);
                }

                @keyframes ambientDrift {
                    0% { opacity: 0.6; transform: scale(1) translateX(0); }
                    100% { opacity: 1; transform: scale(1.05) translateX(-2%); }
                }
            `}</style>
        </div>
    );
}
