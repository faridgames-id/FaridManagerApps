'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export default function LoginOverlay({ onLoginSuccess, initialEmail }) {
    const [loginMode, setLoginMode] = useState(initialEmail ? 'email' : 'google'); // 'google' or 'email'
    const [email, setEmail] = useState(initialEmail || '');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialEmail) {
            setEmail(initialEmail);
            setLoginMode('email');
        }
    }, [initialEmail]);

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            const isAndroid = /Android/i.test(navigator.userAgent);
            const isAndroidWebView = isAndroid && (window.location.protocol === 'file:' || navigator.userAgent.includes('wv'));
            
            if (!isAndroidWebView && window.location.protocol === 'file:') {
                alert('⚠️ Google Login tidak didukung jika membuka file HTML secara langsung (file:///).\n\nSilakan buka aplikasi menggunakan link Vercel Anda, atau gunakan Local Web Server (seperti VS Code Live Server).');
                setLoading(false);
                return;
            }

            const redirectUrl = isAndroidWebView ? 'manajemenakun://login-callback' : window.location.href;
            
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl
                }
            });
            if (error) alert('Supabase Auth Error: ' + error.message);
        } catch (e) {
            alert('Crash: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            alert('Harap isi email dan sandi!');
            return;
        }
        try {
            setLoading(true);
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (error) {
                alert('Login Gagal: ' + error.message);
            } else {
                if (data?.session) {
                    onLoginSuccess(data.session.user);
                }
            }
        } catch (e) {
            alert('Crash: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEmailRegister = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            alert('Harap isi email dan sandi!');
            return;
        }
        if (password.length < 6) {
            alert('Sandi minimal 6 karakter!');
            return;
        }
        if (!confirm('Ingin mendaftarkan akun baru dengan email ini?')) {
            return;
        }
        try {
            setLoading(true);
            const { error } = await supabase.auth.signUp({
                email,
                password
            });
            if (error) {
                alert('Pendaftaran Gagal: ' + error.message);
            } else {
                alert('Pendaftaran berhasil! Silakan periksa email Anda untuk konfirmasi, lalu coba masuk.');
            }
        } catch (e) {
            alert('Crash: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="supabaseLoginOverlay" style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(11, 25, 41, 0.92)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            transition: 'opacity 0.4s'
        }}>
            <div style={{
                background: 'rgba(19, 40, 66, 0.80)',
                border: '1px solid rgba(43, 125, 204, 0.18)',
                borderRadius: '20px',
                padding: '32px',
                textAlign: 'center',
                boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
                maxWidth: '400px',
                width: '90%',
                backdropFilter: 'blur(20px)'
            }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'var(--bg-surface)',
                    borderRadius: '16px',
                    margin: '0 auto 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(31, 107, 189, 0.3)',
                    color: '#F2F7FD',
                    letterSpacing: '1px'
                }}>FRD</div>
                <h2 style={{
                    marginBottom: '6px',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    color: '#F2F7FD',
                    letterSpacing: '-0.01em'
                }}>Welcome to Farid Shop</h2>
                <p style={{
                    color: '#5A8BBD',
                    marginBottom: '20px',
                    fontSize: '0.82rem',
                    lineHeight: '1.5',
                    fontWeight: 400
                }}>Sistem tersinkronisasi dengan Cloud. Silakan masuk untuk melanjutkan.</p>

                {/* Login Mode Tabs */}
                <div style={{
                    display: 'flex',
                    background: 'rgba(11, 25, 41, 0.6)',
                    borderRadius: '10px',
                    padding: '3px',
                    marginBottom: '20px',
                    border: '1px solid rgba(43, 125, 204, 0.12)'
                }}>
                    <button 
                        onClick={() => setLoginMode('google')}
                        style={{
                            flex: 1,
                            padding: '8px 12px',
                            background: loginMode === 'google' ? '#1F6BBD' : 'transparent',
                            border: 'none',
                            borderRadius: '8px',
                            color: loginMode === 'google' ? '#FFFFFF' : '#5A8BBD',
                            fontWeight: '600',
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                        }}
                    >Google Account</button>
                    <button 
                        onClick={() => setLoginMode('email')}
                        style={{
                            flex: 1,
                            padding: '8px 12px',
                            background: loginMode === 'email' ? '#1F6BBD' : 'transparent',
                            border: 'none',
                            borderRadius: '8px',
                            color: loginMode === 'email' ? '#FFFFFF' : '#5A8BBD',
                            fontWeight: '600',
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                        }}
                    >Email & Sandi</button>
                </div>

                {/* Google Login Section */}
                {loginMode === 'google' && (
                    <div style={{ display: 'block' }}>
                        <button 
                            onClick={handleGoogleLogin} 
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'white',
                                color: '#112540',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: '600',
                                fontSize: '0.88rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                transition: 'all 0.15s',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                position: 'relative',
                                zIndex: 999999
                            }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            {loading ? 'Menghubungkan...' : 'Masuk dengan Google'}
                        </button>
                        <div style={{
                            marginTop: '14px',
                            padding: '10px 12px',
                            background: 'rgba(245, 158, 11, 0.08)',
                            border: '1px solid rgba(245, 158, 11, 0.15)',
                            borderRadius: '8px',
                            color: '#FBBF24',
                            fontSize: '0.72rem',
                            lineHeight: '1.5',
                            textAlign: 'left'
                        }}>
                            💡 <strong>Tips:</strong> Jika membuka file secara langsung (<code>file:///</code>), Google Login akan gagal. Gunakan <strong>"Email & Sandi"</strong> untuk masuk.
                        </div>
                    </div>
                )}

                {/* Email Login Section */}
                {loginMode === 'email' && (
                    <form onSubmit={handleEmailLogin} style={{ textAlign: 'left' }}>
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{
                                display: 'block',
                                color: '#8EBCEB',
                                fontSize: '0.72rem',
                                fontWeight: '600',
                                marginBottom: '5px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>Alamat Email</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="contoh@toko.com" 
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid rgba(43, 125, 204, 0.18)',
                                    borderRadius: '8px',
                                    background: 'rgba(11, 25, 41, 0.6)',
                                    color: '#F2F7FD',
                                    fontSize: '0.85rem'
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                color: '#8EBCEB',
                                fontSize: '0.72rem',
                                fontWeight: '600',
                                marginBottom: '5px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>Sandi / Password</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••" 
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid rgba(43, 125, 204, 0.18)',
                                    borderRadius: '8px',
                                    background: 'rgba(11, 25, 41, 0.6)',
                                    color: '#F2F7FD',
                                    fontSize: '0.85rem'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                type="submit" 
                                disabled={loading}
                                style={{
                                    flex: 1,
                                    padding: '11px',
                                    background: '#1F6BBD',
                                    color: 'var(--text-primary)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    fontSize: '0.82rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s'
                                }}
                            >
                                {loading ? 'Masuk...' : 'Masuk'}
                            </button>
                            <button 
                                type="button"
                                onClick={handleEmailRegister}
                                disabled={loading}
                                style={{
                                    flex: 1,
                                    padding: '11px',
                                    background: 'rgba(43, 125, 204, 0.08)',
                                    color: '#C3DAF4',
                                    border: '1px solid rgba(43, 125, 204, 0.18)',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    fontSize: '0.82rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s'
                                }}
                            >
                                Daftar
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
