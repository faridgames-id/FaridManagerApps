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
                    }, 600);
                }, 400);
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
                background: 'linear-gradient(180deg, #09090b 0%, #18181b 100%)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                opacity: hide ? 0 : 1,
                transform: hide ? 'scale(1.05)' : 'scale(1)',
                pointerEvents: hide ? 'none' : 'all',
            }}
        >
            <div style={{
                textAlign: 'center',
                animation: 'slideUp 0.8s var(--ease-spring-smooth)',
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    margin: '0 auto 24px',
                    position: 'relative',
                    borderRadius: '20px',
                    padding: '2px',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.4) 0%, rgba(99, 102, 241, 0) 100%)',
                    boxShadow: 'var(--glow-strong)'
                }}>
                    <div style={{
                        width: '100%',
                        height: '100%',
                        background: '#09090b',
                        borderRadius: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                    }}>
                        <img src="/logo.png" alt="FRD Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', animation: 'pulse 2s infinite ease-in-out' }} />
                    </div>
                </div>
                
                <h1 style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    color: 'var(--text-primary)',
                    marginBottom: '8px'
                }}>FARID SHOP GAME</h1>
                <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    marginBottom: '32px'
                }}>
                    Sistem Manajemen Akun Premium<br />
                    <span style={{
                        color: 'var(--accent-indigo)',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        marginTop: '12px',
                        display: 'inline-block',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase'
                    }}>Jual Beli Akun #1 se-Universe</span>
                </p>
                
                <div style={{ width: '240px', margin: '0 auto' }}>
                    <div style={{
                        height: '4px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: '99px',
                        overflow: 'hidden',
                        marginBottom: '12px',
                        position: 'relative'
                    }}>
                        <div style={{
                            width: `${progress}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, var(--accent-indigo) 0%, #8b5cf6 100%)',
                            borderRadius: '99px',
                            transition: 'width 0.2s ease-out',
                            position: 'relative'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                                animation: 'shimmer 1.5s infinite linear'
                            }}></div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: 500 }}>{statusText}</p>
                        <p style={{ color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{Math.round(progress)}%</p>
                    </div>
                </div>
                
                <button 
                    onClick={handleSkip}
                    style={{
                        marginTop: '40px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-tertiary)',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        padding: '8px 16px',
                        transition: 'color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'}
                    onMouseOut={(e) => e.target.style.color = 'var(--text-tertiary)'}
                >Lewati</button>
            </div>
        </div>
    );
}
