'use client';
import React, { useState, useEffect, useRef } from 'react';

// SVG Icons for Sidebar
const Icons = {
    dashboard: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"></rect><rect x="14" y="3" width="7" height="5" rx="1"></rect><rect x="14" y="12" width="7" height="9" rx="1"></rect><rect x="3" y="16" width="7" height="5" rx="1"></rect></svg>,
    ff: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
    ml: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>,
    search: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    inbox: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
    calendar: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    stats: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    sales: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
    star: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    journal: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
};

export default function Sidebar({ activeTab, onTabChange, isOpen, toggleSidebar, currentUser, savedUsers = [], onSwitchAccount, onAddNewAccount, onLogout }) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Icons.dashboard },
        { id: 'stok-ff', label: 'Stok FF', icon: Icons.ff },
        { id: 'stok-ml', label: 'Stok ML', icon: Icons.ml },
        { id: 'pencarian', label: 'Pencarian', icon: Icons.search },
        { id: 'akun-masuk', label: 'Akun Masuk Harian', icon: Icons.inbox },
        { id: 'kalender-keuangan', label: 'Kalender Keuangan', icon: Icons.calendar },
        { id: 'statistik', label: 'Statistik', icon: Icons.stats },
        { id: 'penjualan', label: 'Riwayat Penjualan', icon: Icons.sales },
        { id: 'wishlist', label: 'Wishlist Expansi', icon: Icons.star },
        { id: 'jurnal', label: 'Jurnal Bisnis', icon: Icons.journal }
    ];

    // Get display name from email
    const getDisplayName = (email) => {
        if (!email) return 'Pengguna';
        return email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    // Get initials from email
    const getInitials = (email) => {
        if (!email) return '?';
        return email.charAt(0).toUpperCase();
    };

    const currentEmail = currentUser?.email || '';
    const currentName = currentUser?.user_metadata?.full_name || getDisplayName(currentEmail);
    const currentAvatar = currentUser?.user_metadata?.avatar_url || null;
    const currentProvider = currentUser?.app_metadata?.provider || 'email';

    // Other saved users (not the current one)
    const otherUsers = savedUsers.filter(u => u.email !== currentEmail);

    const GoogleIcon = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
    );

    const AvatarCircle = ({ email, avatarUrl, provider, size = 34 }) => {
        const initials = getInitials(email);
        const colors = ['#0052D4', '#7C3AED', '#059669', '#D97706', '#DC2626'];
        const colorIdx = email ? email.charCodeAt(0) % colors.length : 0;

        if (avatarUrl) {
            return (
                <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                    <img src={avatarUrl} alt={email} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                </div>
            );
        }
        return (
            <div style={{
                width: size, height: size, borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(135deg, ${colors[colorIdx]}, ${colors[(colorIdx+1) % colors.length]})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: size > 36 ? '1rem' : '0.82rem', fontWeight: 700, color: '#FFFFFF',
                boxShadow: `0 4px 12px ${colors[colorIdx]}55`
            }}>
                {initials}
            </div>
        );
    };

    return (
        <>
            {/* Overlay background for mobile */}
            <div 
                className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
                onClick={() => toggleSidebar(false)}
            ></div>

            <div className={`sidebar ${!isOpen ? 'closed' : 'mobile-open'}`}>
            
            {/* Logo Area */}
            <div className="s-logo" style={{ position: 'relative' }}>
                <div className="s-logo-icon">
                    <img src="/logo.png" alt="FRD Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '6px' }} />
                </div>
                <div className="s-logo-text">
                    <div className="s-logo-name">FARID SHOP GAME</div>
                    <div className="s-logo-sub">Account Management</div>
                </div>
            </div>
            
            {/* Navigation */}
            <div className="nav-tabs">
                {menuItems.map((item) => (
                    <button 
                        key={item.id}
                        className={`nav-tab ${activeTab === item.id ? 'active' : ''}`} 
                        onClick={() => {
                            onTabChange(item.id);
                            if (window.innerWidth <= 768) {
                                toggleSidebar(false);
                            }
                        }}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                        {item.id === 'stok-ff' || item.id === 'stok-ml' || item.id === 'pencarian' ? (
                            <svg className="nav-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        ) : null}
                    </button>
                ))}
            </div>

            {/* Bottom Profile Area */}
            <div className="sidebar-footer" ref={dropdownRef} style={{ position: 'relative' }}>
                {isProfileOpen && (
                    <div className="profile-dropdown slideUp" style={{
                        position: 'absolute',
                        bottom: '84px',
                        left: '12px',
                        width: 'calc(100% - 24px)',
                        background: 'rgba(8, 14, 28, 0.97)',
                        border: '1px solid rgba(0, 210, 255, 0.1)',
                        borderRadius: '14px',
                        padding: '10px',
                        boxShadow: '0 -16px 40px rgba(0,0,0,0.6), 0 0 1px rgba(0,210,255,0.15)',
                        zIndex: 110,
                        backdropFilter: 'blur(20px)',
                    }}>
                        {/* Section title */}
                        <div style={{ fontSize: '0.68rem', color: 'rgba(0,210,255,0.5)', padding: '4px 8px 10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Akun Google Tertaut
                        </div>

                        {/* Current active account */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '10px 10px',
                            borderRadius: '10px',
                            background: 'rgba(0, 82, 212, 0.15)',
                            border: '1px solid rgba(0, 210, 255, 0.12)',
                            marginBottom: '4px',
                        }}>
                            <AvatarCircle email={currentEmail} avatarUrl={currentAvatar} provider={currentProvider} size={36} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {currentName}
                                </div>
                                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                    {currentProvider === 'google' && <GoogleIcon />}
                                    {currentEmail}
                                </div>
                            </div>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D2FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>

                        {/* Other saved accounts */}
                        {otherUsers.length > 0 && (
                            <>
                                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', padding: '8px 8px 4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                                    Akun Lain
                                </div>
                                {otherUsers.map(u => (
                                    <button
                                        key={u.id || u.email}
                                        onClick={() => { onSwitchAccount && onSwitchAccount(u); setIsProfileOpen(false); }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '10px',
                                            width: '100%', padding: '9px 10px',
                                            background: 'transparent',
                                            border: '1px solid transparent',
                                            borderRadius: '10px', cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            marginBottom: '2px',
                                            textAlign: 'left',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,82,212,0.1)'; e.currentTarget.style.borderColor = 'rgba(0,210,255,0.08)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                                    >
                                        <AvatarCircle email={u.email} avatarUrl={u.avatarUrl} provider={u.provider} size={34} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {getDisplayName(u.email)}
                                            </div>
                                            <div style={{ fontSize: '0.67rem', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {u.provider === 'google' && <GoogleIcon />}
                                                {u.email}
                                            </div>
                                        </div>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                                    </button>
                                ))}
                            </>
                        )}

                        {/* Add account */}
                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '8px 0' }} />
                        <button
                            onClick={() => { onAddNewAccount && onAddNewAccount(); setIsProfileOpen(false); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                width: '100%', padding: '9px 10px',
                                background: 'transparent', border: '1px dashed rgba(0,210,255,0.15)',
                                borderRadius: '10px', cursor: 'pointer',
                                color: 'rgba(0,210,255,0.6)',
                                fontSize: '0.8rem', fontWeight: 600,
                                transition: 'all 0.2s', marginBottom: '4px',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,82,212,0.08)'; e.currentTarget.style.borderColor = 'rgba(0,210,255,0.25)'; e.currentTarget.style.color = '#00D2FF'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(0,210,255,0.15)'; e.currentTarget.style.color = 'rgba(0,210,255,0.6)'; }}
                        >
                            <div style={{ width: 34, height: 34, borderRadius: '50%', border: '1px dashed rgba(0,210,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            </div>
                            Tambah Akun Google
                        </button>

                        {/* Logout */}
                        <button
                            onClick={() => { onLogout && onLogout(); setIsProfileOpen(false); }}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                width: '100%', padding: '10px',
                                background: 'rgba(255,77,106,0.06)', border: '1px solid rgba(255,77,106,0.12)',
                                borderRadius: '10px', cursor: 'pointer',
                                color: '#FF4D6A',
                                fontSize: '0.82rem', fontWeight: 700,
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,77,106,0.14)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,77,106,0.06)'; }}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                            Logout
                        </button>
                    </div>
                )}
                
                <div className="profile-badge" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                    <div className="profile-avatar" style={{ overflow: 'hidden', padding: 0 }}>
                        {currentAvatar ? (
                            <img src={currentAvatar} alt={currentName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} onError={e => e.target.style.display='none'} />
                        ) : (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        )}
                        <div className="online-dot"></div>
                    </div>
                    <div className="profile-info">
                        <div className="profile-name">{currentName || 'Pengguna'}</div>
                        <div className="profile-role" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {currentProvider === 'google' && (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                            )}
                            {currentProvider === 'google' ? 'Google Account' : 'Email Account'}
                        </div>
                    </div>
                    <svg className="profile-chevron" style={{ transform: isProfileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
            </div>


            {/* Styles specific to sidebar */}
            <style jsx>{`
                .sidebar {
                    width: var(--sidebar-w);
                    background: linear-gradient(180deg, #060C18 0%, #0A1222 50%, #070D1A 100%);
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    top: 0;
                    left: 0;
                    height: 100vh;
                    z-index: 100;
                    border-right: 1px solid rgba(0, 210, 255, 0.06);
                    transition: var(--T-smooth);
                    /* overflow: hidden removed to allow toggle button to protrude */
                }

                .sidebar::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 1px;
                    height: 100%;
                    background: linear-gradient(180deg, transparent, rgba(0, 210, 255, 0.15), rgba(255, 215, 0, 0.1), transparent);
                    z-index: 1;
                }

                .s-logo {
                    padding: 28px 24px;
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    position: relative;
                }

                .s-logo::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 24px;
                    right: 24px;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(0, 210, 255, 0.15), transparent);
                }

                .s-logo-icon {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 15px rgba(0, 82, 212, 0.3);
                    position: relative;
                }

                .s-logo-icon::after {
                    content: '';
                    position: absolute;
                    inset: -2px;
                    border-radius: 14px;
                    background: linear-gradient(135deg, rgba(0, 82, 212, 0.6), rgba(0, 210, 255, 0.4));
                    filter: blur(8px);
                    z-index: -1;
                    animation: auroraBreath 4s ease-in-out infinite alternate;
                }

                .s-logo-name {
                    font-size: 1rem;
                    font-weight: 800;
                    background: linear-gradient(135deg, #FFFFFF 0%, #00D2FF 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    letter-spacing: 0.03em;
                    line-height: 1.2;
                }

                .s-logo-sub {
                    font-size: 0.72rem;
                    color: rgba(0, 210, 255, 0.5);
                    margin-top: 2px;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    font-weight: 600;
                }

                .nav-tabs {
                    flex: 1;
                    padding: 16px 14px 0;
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                    overflow-y: auto;
                }

                .nav-tabs::-webkit-scrollbar { width: 3px; }
                .nav-tabs::-webkit-scrollbar-track { background: transparent; }
                .nav-tabs::-webkit-scrollbar-thumb { background: rgba(0, 210, 255, 0.2); border-radius: 10px; }

                .nav-tab {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 11px 16px;
                    border-radius: 10px;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.4);
                    border: 1px solid transparent;
                    cursor: pointer;
                    font-size: 0.88rem;
                    font-weight: 500;
                    text-align: left;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                }

                .nav-tab:hover {
                    color: rgba(255, 255, 255, 0.85);
                    background: rgba(0, 82, 212, 0.08);
                    border-color: rgba(0, 82, 212, 0.1);
                }

                .nav-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0.6;
                    transition: opacity 0.3s, filter 0.3s;
                }

                .nav-label {
                    flex: 1;
                }

                .nav-chevron {
                    opacity: 0.3;
                }

                .nav-tab.active {
                    color: #FFFFFF;
                    background: linear-gradient(135deg, rgba(0, 82, 212, 0.5), rgba(0, 82, 212, 0.25));
                    border-color: rgba(0, 210, 255, 0.25);
                    box-shadow: 0 4px 20px rgba(0, 82, 212, 0.35), inset 0 1px 0 rgba(0, 210, 255, 0.2);
                    font-weight: 700;
                    letter-spacing: 0.01em;
                }

                .nav-tab.active::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 3px;
                    height: 60%;
                    border-radius: 0 3px 3px 0;
                    background: linear-gradient(180deg, #00D2FF, #0052D4);
                    box-shadow: 0 0 8px rgba(0, 210, 255, 0.6);
                }

                .nav-tab.active .nav-icon {
                    opacity: 1;
                    filter: drop-shadow(0 0 4px rgba(0, 210, 255, 0.4));
                }

                .sidebar-footer {
                    padding: 20px 14px;
                    border-top: 1px solid rgba(0, 210, 255, 0.06);
                    position: relative;
                }

                .sidebar-footer::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 14px;
                    right: 14px;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(0, 210, 255, 0.1), transparent);
                }

                .profile-badge {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s;
                    border: 1px solid transparent;
                }

                .profile-badge:hover {
                    background: rgba(0, 82, 212, 0.08);
                    border-color: rgba(0, 82, 212, 0.1);
                }

                .profile-avatar {
                    width: 38px;
                    height: 38px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #0052D4, #00D2FF);
                    color: #FFFFFF;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    box-shadow: 0 4px 12px rgba(0, 82, 212, 0.3);
                }

                .online-dot {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    width: 10px;
                    height: 10px;
                    background: #00E68A;
                    border: 2px solid #060C18;
                    border-radius: 50%;
                    box-shadow: 0 0 6px rgba(0, 230, 138, 0.5);
                }

                .profile-info {
                    flex: 1;
                }

                .profile-name {
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #FFFFFF;
                }

                .profile-role {
                    font-size: 0.72rem;
                    color: #00D2FF;
                    margin-top: 2px;
                    font-weight: 600;
                }

                .profile-chevron {
                    color: rgba(255, 255, 255, 0.3);
                }

                .account-switch-btn {
                    display: flex;
                    align-items: center;
                    width: 100%;
                    gap: 12px;
                    padding: 10px;
                    background: transparent;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    text-align: left;
                    color: rgba(255, 255, 255, 0.8);
                    transition: all 0.2s;
                }
                .account-switch-btn:hover {
                    background: rgba(0, 82, 212, 0.08);
                }
                .account-switch-btn.active {
                    background: rgba(0, 82, 212, 0.12);
                    border: 1px solid rgba(0, 210, 255, 0.1);
                }
                .account-switch-btn.text-danger {
                    color: #FF4D6A;
                    justify-content: center;
                    font-weight: 600;
                    padding: 12px;
                }
                .account-switch-btn.text-danger:hover {
                    background: rgba(255, 77, 106, 0.1);
                }
                .acc-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #0052D4, #002D72);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.8rem;
                    font-weight: bold;
                    color: #FFFFFF;
                }
                .acc-info {
                    flex: 1;
                }
                .acc-name {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #FFFFFF;
                }
                .acc-role {
                    font-size: 0.7rem;
                    color: rgba(255, 255, 255, 0.4);
                }
                .acc-check {
                    color: #00D2FF;
                    font-weight: bold;
                    text-shadow: 0 0 6px rgba(0, 210, 255, 0.5);
                }
                .slideUp {
                    animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                .profile-dropdown {
                    background: rgba(10, 16, 28, 0.95) !important;
                    backdrop-filter: blur(20px) !important;
                    border: 1px solid rgba(0, 210, 255, 0.1) !important;
                    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), 0 0 1px rgba(0, 210, 255, 0.2) !important;
                }
                
                .sidebar-overlay {
                    display: none;
                }

                @media (max-width: 768px) {
                    .sidebar-overlay {
                        display: block;
                        position: fixed;
                        inset: 0;
                        background: rgba(0, 0, 0, 0.6);
                        backdrop-filter: blur(4px);
                        -webkit-backdrop-filter: blur(4px);
                        z-index: 90;
                        opacity: 0;
                        pointer-events: none;
                        transition: opacity 0.3s ease;
                    }
                    .sidebar-overlay.show {
                        opacity: 1;
                        pointer-events: all;
                    }
                    .sidebar {
                        z-index: 100;
                    }
                }
            `}</style>
        </div>
        </>
    );
}
