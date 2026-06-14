'use client';
import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Package, Circle, Search, Inbox, Calendar, BarChart3, ShoppingCart, Star, BookOpen } from 'lucide-react';

const Icons = {
    dashboard: <LayoutDashboard size={18} />,
    ff: <Package size={18} />,
    ml: <Circle size={18} />,
    search: <Search size={18} />,
    inbox: <Inbox size={18} />,
    calendar: <Calendar size={18} />,
    stats: <BarChart3 size={18} />,
    sales: <ShoppingCart size={18} />,
    star: <Star size={18} />,
    journal: <BookOpen size={18} />,
};

// Get initials from email
const getInitials = (email) => {
    if (!email) return '?';
    return email.charAt(0).toUpperCase();
};

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
    const colors = ['#3b82f6', '#a855f7', '#22c55e', '#f59e0b', '#ef4444'];
    const colorIdx = email ? email.charCodeAt(0) % colors.length : 0;

    if (avatarUrl) {
        return (
            <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                <img src={avatarUrl} alt={email} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
            </div>
        );
    }
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%', flexShrink: 0,
            background: colors[colorIdx],
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size > 36 ? '0.9rem' : '0.75rem', fontWeight: 600, color: '#fff',
        }}>
            {initials}
        </div>
    );
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

    const currentEmail = currentUser?.email || '';
    const currentName = currentUser?.user_metadata?.full_name || getDisplayName(currentEmail);
    const currentAvatar = currentUser?.user_metadata?.avatar_url || null;
    const currentProvider = currentUser?.app_metadata?.provider || 'email';

    const otherUsers = savedUsers.filter(u => u.email !== currentEmail);

    return (
        <>
            {/* Overlay background for mobile */}
            <div 
                className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
                onClick={() => toggleSidebar(false)}
            ></div>

            <div className={`sidebar ${!isOpen ? 'closed' : 'mobile-open'}`}>
            
            {/* Logo Area */}
            <div className="s-logo">
                <div className="s-logo-icon">
                    <img src="/logo.png" alt="FRD Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} />
                </div>
                <div className="s-logo-text">
                    <div className="s-logo-name">FARID SHOP GAME</div>
                    <div className="s-logo-sub">Account Management</div>
                </div>
            </div>
            
            {/* Navigation */}
            <div className="nav-tabs">
                <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-tertiary)', padding: '8px 12px 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Menu Utama
                </div>
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
                    </button>
                ))}
            </div>

            {/* Bottom Profile Area */}
            <div className="sidebar-footer" ref={dropdownRef} style={{ position: 'relative' }}>
                {isProfileOpen && (
                    <div className="profile-dropdown" style={{
                        position: 'absolute',
                        bottom: '76px',
                        left: '10px',
                        width: 'calc(100% - 20px)',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-default)',
                        borderRadius: '12px',
                        padding: '8px',
                        boxShadow: 'var(--shadow-xl)',
                        zIndex: 110,
                    }}>
                        {/* Section title */}
                        <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', padding: '4px 8px 8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Akun Google Tertaut
                        </div>

                        {/* Current active account */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            background: 'var(--accent-blue-subtle)',
                            marginBottom: '4px',
                        }}>
                            <AvatarCircle email={currentEmail} avatarUrl={currentAvatar} provider={currentProvider} size={34} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {currentName}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                                    {currentProvider === 'google' && <GoogleIcon />}
                                    {currentEmail}
                                </div>
                            </div>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>

                        {/* Other saved accounts */}
                        {otherUsers.length > 0 && (
                            <>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', padding: '6px 8px 4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                                    Akun Lain
                                </div>
                                {otherUsers.map(u => (
                                    <button
                                        key={u.id || u.email}
                                        onClick={() => { onSwitchAccount && onSwitchAccount(u); setIsProfileOpen(false); }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '10px',
                                            width: '100%', padding: '8px 10px',
                                            background: 'transparent',
                                            border: 'none',
                                            borderRadius: '8px', cursor: 'pointer',
                                            transition: 'background 150ms',
                                            marginBottom: '2px',
                                            textAlign: 'left',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <AvatarCircle email={u.email} avatarUrl={u.avatarUrl} provider={u.provider} size={32} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {getDisplayName(u.email)}
                                            </div>
                                            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                                                {u.provider === 'google' && <GoogleIcon />}
                                                {u.email}
                                            </div>
                                        </div>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                                    </button>
                                ))}
                            </>
                        )}

                        {/* Add account */}
                        <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '6px 0' }} />
                        <button
                            onClick={() => { onAddNewAccount && onAddNewAccount(); setIsProfileOpen(false); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                width: '100%', padding: '8px 10px',
                                background: 'transparent', border: '1px dashed var(--border-default)',
                                borderRadius: '8px', cursor: 'pointer',
                                color: 'var(--text-tertiary)',
                                fontSize: '0.78rem', fontWeight: 500,
                                transition: 'all 150ms', marginBottom: '4px',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                        >
                            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '1px dashed var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            </div>
                            Tambah Akun Google
                        </button>

                        {/* Logout */}
                        <button
                            onClick={() => { onLogout && onLogout(); setIsProfileOpen(false); }}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                width: '100%', padding: '8px',
                                background: 'var(--accent-red-subtle)', border: 'none',
                                borderRadius: '8px', cursor: 'pointer',
                                color: 'var(--accent-red)',
                                fontSize: '0.78rem', fontWeight: 600,
                                transition: 'all 150ms',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-red-subtle)'}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                            Logout
                        </button>
                    </div>
                )}
                
                <div className="profile-badge" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                    <div className="profile-avatar" style={{ overflow: 'hidden', padding: 0 }}>
                        {currentAvatar ? (
                            <img src={currentAvatar} alt={currentName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} onError={e => e.target.style.display='none'} />
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
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
                    <svg className="profile-chevron" style={{ transform: isProfileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
            </div>


            {/* Styles specific to sidebar */}
            <style jsx>{`
                .sidebar {
                    width: var(--sidebar-w);
                    background: var(--bg-surface);
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    top: 0;
                    left: 0;
                    height: 100vh;
                    z-index: 100;
                    border-right: 1px solid var(--border-subtle);
                    transition: transform var(--T-slow);
                }

                .sidebar.closed {
                    transform: translateX(-100%);
                }

                .s-logo {
                    padding: 20px 18px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border-bottom: 1px solid var(--border-subtle);
                }

                .s-logo-icon {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                    overflow: hidden;
                    flex-shrink: 0;
                }

                .s-logo-name {
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    letter-spacing: 0.02em;
                    line-height: 1.2;
                }

                .s-logo-sub {
                    font-size: 0.65rem;
                    color: var(--text-muted);
                    margin-top: 1px;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    font-weight: 500;
                }

                .nav-tabs {
                    flex: 1;
                    padding: 12px 10px 0;
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                    overflow-y: auto;
                }

                .nav-tabs::-webkit-scrollbar { width: 3px; }
                .nav-tabs::-webkit-scrollbar-track { background: transparent; }
                .nav-tabs::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 99px; }

                .nav-tab {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 9px 12px;
                    border-radius: 8px;
                    background: transparent;
                    color: var(--text-tertiary);
                    border: none;
                    cursor: pointer;
                    font-size: 0.82rem;
                    font-weight: 500;
                    text-align: left;
                    transition: all 150ms ease;
                    position: relative;
                    overflow: hidden;
                }

                .nav-tab:hover {
                    color: var(--text-primary);
                    background: var(--bg-hover);
                }
                
                .nav-tab:hover .nav-icon {
                    color: var(--accent-indigo);
                    opacity: 0.8;
                }

                .nav-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0.5;
                    transition: opacity 150ms;
                }

                .nav-label {
                    flex: 1;
                }

                .nav-tab.active {
                    color: var(--text-primary);
                    background: linear-gradient(90deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0) 100%);
                    font-weight: 600;
                    box-shadow: inset 3px 0 0 var(--accent-indigo);
                    border-radius: 0 8px 8px 0;
                }

                .nav-tab.active .nav-icon {
                    opacity: 1;
                    color: var(--accent-indigo);
                }

                .sidebar-footer {
                    padding: 12px 10px;
                    border-top: 1px solid var(--border-subtle);
                }

                .profile-badge {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background 150ms;
                    border: none;
                    background: transparent;
                }

                .profile-badge:hover {
                    background: var(--bg-hover);
                }

                .profile-avatar {
                    width: 34px;
                    height: 34px;
                    border-radius: 50%;
                    background: var(--accent-blue);
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    flex-shrink: 0;
                }

                .online-dot {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    width: 8px;
                    height: 8px;
                    background: var(--accent-green);
                    border: 2px solid var(--bg-surface);
                    border-radius: 50%;
                }

                .profile-info {
                    flex: 1;
                    min-width: 0;
                }

                .profile-name {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .profile-role {
                    font-size: 0.68rem;
                    color: var(--text-muted);
                    margin-top: 1px;
                    font-weight: 500;
                }

                .profile-chevron {
                    color: var(--text-muted);
                    flex-shrink: 0;
                }

                .sidebar-overlay {
                    display: none;
                }

                @media (max-width: 768px) {
                    .sidebar-overlay {
                        display: block;
                        position: fixed;
                        inset: 0;
                        background: rgba(0, 0, 0, 0.5);
                        backdrop-filter: blur(4px);
                        z-index: 90;
                        opacity: 0;
                        pointer-events: none;
                        transition: opacity 200ms ease;
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
