'use client';
import { useState, useEffect } from 'react';

export default function IntroOverlay({ onIntroFinished }) {
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('Initializing Core Systems...');
    const [hide, setHide] = useState(false);
    const [mount, setMount] = useState(false);

    useEffect(() => {
        // Trigger initial entrance animations
        setTimeout(() => setMount(true), 100);

        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += Math.random() * 8;
            if (currentProgress >= 100) {
                currentProgress = 100;
                clearInterval(interval);
                setStatusText('Systems Online');
                setTimeout(() => {
                    setHide(true);
                    setTimeout(() => {
                        onIntroFinished();
                    }, 1000); // Wait for fade out
                }, 800);
            } else {
                if (currentProgress > 80) setStatusText('Launching Dashboard Interface...');
                else if (currentProgress > 50) setStatusText('Synchronizing Encrypted Database...');
                else if (currentProgress > 20) setStatusText('Loading Premium Assets...');
                setProgress(currentProgress);
            }
        }, 120);

        return () => clearInterval(interval);
    }, [onIntroFinished]);

    const handleSkip = () => {
        setHide(true);
        setTimeout(() => onIntroFinished(), 1000);
    };

    return (
        <div 
            className={`premium-intro-overlay ${hide ? 'hide' : ''}`}
            aria-hidden="true"
        >
            {/* Dynamic Glassmorphism Background */}
            <div className="gradient-sphere sphere-1"></div>
            <div className="gradient-sphere sphere-2"></div>
            <div className="gradient-sphere sphere-3"></div>
            <div className="grid-overlay"></div>

            <div className={`intro-glass-panel ${mount ? 'mounted' : ''}`}>
                <div className="stagger-1 logo-wrapper">
                    <div className="logo-glow"></div>
                    <div className="logo-inner">
                        <img src="/logo.png" alt="FRD Logo" />
                    </div>
                </div>
                
                <h1 className="stagger-2 premium-title">FARID <span className="text-gradient">SHOP GAME</span></h1>
                <p className="stagger-3 premium-subtitle">
                    Elite Account Management<br />
                    <span className="premium-badge">
                        <span className="badge-glow"></span>
                        Premium Universe Edition
                    </span>
                </p>
                
                <div className="stagger-4 loader-wrapper">
                    <div className="progress-bar-container">
                        <div 
                            className="progress-bar-fill" 
                            style={{ width: `${progress}%` }}
                        >
                            <div className="progress-glow"></div>
                            <div className="progress-particles"></div>
                        </div>
                    </div>
                    <div className="status-container">
                        <p className="status-message">{statusText}</p>
                        <p className="percentage-display">{Math.round(progress)}%</p>
                    </div>
                </div>
                
                <button 
                    className="stagger-5 premium-skip-btn"
                    onClick={handleSkip}
                >
                    <span>Skip Sequence</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                </button>
            </div>

            <style jsx>{`
                .premium-intro-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 10000;
                    background: #FFFFFF;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1);
                    overflow: hidden;
                    font-family: 'Inter', sans-serif;
                }

                .premium-intro-overlay.hide {
                    opacity: 0;
                    transform: scale(1.05) translateY(-20px);
                    pointer-events: none;
                }

                /* Animated Spheres */
                .gradient-sphere {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    opacity: 0.15;
                    animation: float 20s infinite ease-in-out alternate;
                    z-index: 0;
                }

                .sphere-1 {
                    width: 400px;
                    height: 400px;
                    background: radial-gradient(circle, #3b82f6 0%, transparent 70%);
                    top: -100px;
                    left: -100px;
                }

                .sphere-2 {
                    width: 500px;
                    height: 500px;
                    background: radial-gradient(circle, #8b5cf6 0%, transparent 70%);
                    bottom: -150px;
                    right: -100px;
                    animation-delay: -5s;
                }

                .sphere-3 {
                    width: 300px;
                    height: 300px;
                    background: radial-gradient(circle, #ec4899 0%, transparent 70%);
                    top: 40%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    animation-duration: 25s;
                }

                .grid-overlay {
                    position: absolute;
                    inset: 0;
                    background-image: 
                        linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
                    background-size: 30px 30px;
                    z-index: 0;
                    opacity: 0.5;
                }

                @keyframes float {
                    0% { transform: translate(0, 0) scale(1); }
                    100% { transform: translate(30px, 50px) scale(1.1); }
                }

                .intro-glass-panel {
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    max-width: 420px;
                    padding: 40px 30px;
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    border-radius: 30px;
                    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5);
                    text-align: center;
                    transform: translateY(20px);
                    opacity: 0;
                    transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .intro-glass-panel.mounted {
                    transform: translateY(0);
                    opacity: 1;
                }

                /* Staggered Animations */
                .stagger-1, .stagger-2, .stagger-3, .stagger-4, .stagger-5 {
                    opacity: 0;
                    transform: translateY(20px);
                    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .mounted .stagger-1 { opacity: 1; transform: translateY(0); transition-delay: 0.1s; }
                .mounted .stagger-2 { opacity: 1; transform: translateY(0); transition-delay: 0.2s; }
                .mounted .stagger-3 { opacity: 1; transform: translateY(0); transition-delay: 0.3s; }
                .mounted .stagger-4 { opacity: 1; transform: translateY(0); transition-delay: 0.4s; }
                .mounted .stagger-5 { opacity: 1; transform: translateY(0); transition-delay: 0.5s; }

                /* Logo */
                .logo-wrapper {
                    width: 100px;
                    height: 100px;
                    margin: 0 auto 30px;
                    position: relative;
                }

                .logo-glow {
                    position: absolute;
                    inset: -10px;
                    background: linear-gradient(135deg, #3b82f6, #ec4899);
                    border-radius: 30px;
                    filter: blur(15px);
                    opacity: 0.2;
                    animation: pulse-glow 3s infinite alternate;
                }

                .logo-inner {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    background: #ffffff;
                    border-radius: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 10px;
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    box-shadow: inset 0 0 20px rgba(0,0,0,0.02);
                }

                .logo-inner img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    animation: heartbeat 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
                }

                @keyframes pulse-glow {
                    0% { opacity: 0.15; transform: scale(0.95); }
                    100% { opacity: 0.3; transform: scale(1.05); }
                }

                @keyframes heartbeat {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(0.95); }
                }

                /* Typography */
                .premium-title {
                    font-size: 1.7rem;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                    color: #0f172a;
                    margin: 0 0 10px;
                }

                .text-gradient {
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .premium-subtitle {
                    color: #64748b;
                    font-size: 0.95rem;
                    line-height: 1.6;
                    margin: 0 0 40px;
                }

                .premium-badge {
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    color: #3b82f6;
                    font-weight: 600;
                    font-size: 0.75rem;
                    margin-top: 15px;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    background: rgba(59, 130, 246, 0.1);
                    padding: 8px 16px;
                    border-radius: 100px;
                    border: 1px solid rgba(59, 130, 246, 0.2);
                    overflow: hidden;
                }

                .badge-glow {
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 50%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
                    animation: sweep 3s infinite;
                }

                @keyframes sweep {
                    0% { left: -100%; }
                    100% { left: 200%; }
                }

                /* Loader */
                .loader-wrapper {
                    width: 100%;
                    margin-bottom: 30px;
                }

                .progress-bar-container {
                    height: 8px;
                    background: rgba(0, 0, 0, 0.05);
                    border-radius: 100px;
                    overflow: hidden;
                    margin-bottom: 16px;
                    position: relative;
                    box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                }

                .progress-bar-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
                    background-size: 200% 100%;
                    border-radius: 100px;
                    transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                    position: relative;
                    animation: gradient-shift 2s infinite linear;
                }

                @keyframes gradient-shift {
                    0% { background-position: 100% 0; }
                    100% { background-position: -100% 0; }
                }

                .progress-glow {
                    position: absolute;
                    right: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 20px;
                    height: 20px;
                    background: #fff;
                    border-radius: 50%;
                    filter: blur(8px);
                    opacity: 0.9;
                }

                .status-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 4px;
                }

                .status-message {
                    color: #64748b;
                    font-size: 0.8rem;
                    font-weight: 500;
                    margin: 0;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .percentage-display {
                    color: #0f172a;
                    font-size: 0.9rem;
                    font-weight: 700;
                    font-variant-numeric: tabular-nums;
                    margin: 0;
                }

                /* Skip Button */
                .premium-skip-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(0, 0, 0, 0.02);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    color: #64748b;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    padding: 12px 24px;
                    border-radius: 100px;
                    transition: all 0.3s ease;
                    outline: none;
                }

                .premium-skip-btn:hover {
                    background: rgba(0, 0, 0, 0.05);
                    color: #0f172a;
                    border-color: rgba(0, 0, 0, 0.1);
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
                }
                
                .premium-skip-btn:active {
                    transform: translateY(0);
                    background: rgba(0, 0, 0, 0.08);
                }

                .premium-skip-btn svg {
                    transition: transform 0.3s ease;
                }

                .premium-skip-btn:hover svg {
                    transform: translateX(4px);
                }
            `}</style>
        </div>
    );
}
