'use client';
import { useState, useEffect } from 'react';

export default function IntroOverlay({ onIntroFinished }) {
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('Menghubungkan Sistem...');
    const [hide, setHide] = useState(false);

    useEffect(() => {
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
                    }, 800); // match CSS fade-out duration
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
        onIntroFinished();
    };

    return (
        <div 
            className={`app-intro-overlay ${hide ? 'hide' : ''}`}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 10000,
                background: 'radial-gradient(circle at center, #0b1535 0%, #030818 100%)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1), transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)',
                opacity: hide ? 0 : 1,
                pointerEvents: hide ? 'none' : 'all',
                overflow: 'hidden'
            }}
        >
            <div className="intro-bg-glow"></div>
            <div className="intro-particles">
                <span className="intro-bubble"></span>
                <span className="intro-bubble"></span>
                <span className="intro-bubble"></span>
                <span className="intro-bubble"></span>
            </div>
            <div className="intro-card">
                <div className="intro-logo-container">
                    <div className="intro-logo-glow"></div>
                    <div className="intro-logo">
                        <img src="/logo.png" alt="FRD Logo" className="logo-img-file" />
                    </div>
                </div>
                <h1 className="intro-title">FARID SHOP GAME</h1>
                <p className="intro-subtitle">Sistem Manajemen Akun FF & ML<br />
                    <span style={{
                        color: '#00d2ff',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontSize: '11px',
                        marginTop: '12px',
                        display: 'inline-block',
                        animation: 'floatTagline 3s ease-in-out infinite'
                    }}>Jual beli akun paling kece #1 se universe</span>
                </p>
                
                <div className="intro-loading-wrapper">
                    <div className="intro-progress-track">
                        <div 
                            id="introProgressFill" 
                            className="intro-progress-fill"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p id="introStatusText" className="intro-status-text">{statusText}</p>
                </div>
                
                <button className="intro-skip-btn" onClick={handleSkip}>Lewati</button>
            </div>
        </div>
    );
}
