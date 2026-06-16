'use client';
import { useState, useEffect } from 'react';

export default function IntroOverlay({ onIntroFinished }) {
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('Menghubungkan Sistem...');
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
                setStatusText('Sistem Siap!');
                setTimeout(() => {
                    setHide(true);
                    setTimeout(() => {
                        onIntroFinished();
                    }, 800); // Wait for fade out
                }, 500);
            } else {
                if (currentProgress > 80) setStatusText('Menyiapkan Dashboard...');
                else if (currentProgress > 50) setStatusText('Sinkronisasi Database...');
                else if (currentProgress > 20) setStatusText('Memuat Konfigurasi...');
                setProgress(currentProgress);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [onIntroFinished]);

    const handleSkip = () => {
        setHide(true);
        setTimeout(() => onIntroFinished(), 800);
    };

    return (
        <div 
            className={`app-intro-overlay ${hide ? 'hide' : ''}`}
            aria-hidden="true"
        >
            {/* Ambient Animated Background */}
            <div className="ambient-blobs"></div>

            <div className={`intro-content ${mount ? 'mounted' : ''}`}>
                <div className="stagger-1 logo-container">
                    <div className="logo-inner">
                        <img src="/logo.png" alt="FRD Logo" />
                    </div>
                </div>
                
                <h1 className="stagger-2 title">FARID SHOP GAME</h1>
                <p className="stagger-3 subtitle">
                    Sistem Manajemen Akun Premium<br />
                    <span className="badge">Jual Beli Akun #1 se-Universe</span>
                </p>
                
                <div className="stagger-4 progress-container">
                    <div className="progress-track">
                        <div 
                            className="progress-fill" 
                            style={{ width: `${progress}%` }}
                        >
                            <div className="shimmer"></div>
                        </div>
                    </div>
                    <div className="progress-text-row">
                        <p className="status-text">{statusText}</p>
                        <p className="percentage-text">{Math.round(progress)}%</p>
                    </div>
                </div>
                
                <button 
                    className="stagger-5 skip-button"
                    onClick={handleSkip}
                >
                    Lewati
                </button>
            </div>

            <style jsx>{`
                .app-intro-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 10000;
                    background: #F8FAFC;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                    overflow: hidden;
                }

                .app-intro-overlay.hide {
                    opacity: 0;
                    transform: scale(1.03);
                    pointer-events: none;
                }

                .ambient-blobs {
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                    overflow: hidden;
                    pointer-events: none;
                }

                .ambient-blobs::before,
                .ambient-blobs::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    animation: drift 20s ease-in-out infinite alternate;
                }

                .ambient-blobs::before {
                    background: radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.08) 0%, transparent 60%);
                }

                .ambient-blobs::after {
                    background: radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.08) 0%, transparent 60%);
                    animation-delay: -10s;
                }

                @keyframes drift {
                    0% { transform: scale(1) translate(0, 0); }
                    100% { transform: scale(1.1) translate(-2%, 2%); }
                }

                .intro-content {
                    position: relative;
                    z-index: 1;
                    text-align: center;
                    width: 100%;
                    max-width: 320px;
                    padding: 0 24px;
                }

                /* Staggered Animations */
                .stagger-1, .stagger-2, .stagger-3, .stagger-4, .stagger-5 {
                    opacity: 0;
                    transform: translateY(16px) scale(0.98);
                    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .mounted .stagger-1 { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.1s; }
                .mounted .stagger-2 { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.2s; }
                .mounted .stagger-3 { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.3s; }
                .mounted .stagger-4 { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.4s; }
                .mounted .stagger-5 { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.5s; }

                /* Logo */
                .logo-container {
                    width: 88px;
                    height: 88px;
                    margin: 0 auto 24px;
                    position: relative;
                    border-radius: 24px;
                    background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(248, 250, 252, 1) 100%);
                    box-shadow: 
                        0 20px 40px rgba(0, 0, 0, 0.06), 
                        0 1px 3px rgba(0, 0, 0, 0.04),
                        inset 0 2px 4px rgba(255, 255, 255, 1);
                    padding: 8px;
                    border: 1px solid rgba(0, 0, 0, 0.04);
                }

                .logo-inner {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: pulseLogo 3s infinite ease-in-out;
                }

                .logo-inner img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }

                @keyframes pulseLogo {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(0.95); }
                }

                /* Typography */
                .title {
                    font-size: 1.5rem;
                    font-weight: 800;
                    letter-spacing: -0.04em;
                    color: #0F172A;
                    margin: 0 0 8px;
                }

                .subtitle {
                    color: #64748B;
                    font-size: 0.95rem;
                    line-height: 1.5;
                    margin: 0 0 40px;
                }

                .badge {
                    color: #3B82F6;
                    font-weight: 700;
                    font-size: 0.7rem;
                    margin-top: 12px;
                    display: inline-block;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    background: rgba(59, 130, 246, 0.1);
                    padding: 6px 12px;
                    border-radius: 99px;
                    border: 1px solid rgba(59, 130, 246, 0.1);
                }

                /* Progress Bar */
                .progress-container {
                    width: 100%;
                    margin: 0 auto;
                }

                .progress-track {
                    height: 6px;
                    background: rgba(15, 23, 42, 0.06);
                    border-radius: 99px;
                    overflow: hidden;
                    margin-bottom: 12px;
                    position: relative;
                    box-shadow: inset 0 1px 2px rgba(0,0,0,0.04);
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%);
                    border-radius: 99px;
                    transition: width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    position: relative;
                    box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
                }

                .shimmer {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
                    animation: shimmerAnim 1.5s infinite linear;
                }

                @keyframes shimmerAnim {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                .progress-text-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .status-text {
                    color: #64748B;
                    font-size: 0.75rem;
                    font-weight: 600;
                    margin: 0;
                }

                .percentage-text {
                    color: #0F172A;
                    font-size: 0.8rem;
                    font-weight: 800;
                    font-variant-numeric: tabular-nums;
                    margin: 0;
                }

                /* Skip Button */
                .skip-button {
                    margin-top: 48px;
                    background: transparent;
                    border: none;
                    color: #94A3B8;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    padding: 10px 24px;
                    border-radius: 99px;
                    transition: all 0.2s;
                }

                .skip-button:hover {
                    color: #0F172A;
                    background: rgba(15, 23, 42, 0.04);
                    transform: translateY(-1px);
                }
                
                .skip-button:active {
                    transform: translateY(0);
                    background: rgba(15, 23, 42, 0.08);
                }
            `}</style>
        </div>
    );
}
