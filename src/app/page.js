'use client';
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';
import dynamic from 'next/dynamic';
import DataSyncQueue from '../utils/DataSyncQueue';

// Components
import IntroOverlay from '../components/IntroOverlay';
import LoginOverlay from '../components/LoginOverlay';
import Sidebar from '../components/Sidebar';
import DashboardTab from '../components/DashboardTab';
import StockTab from '../components/StockTab';
import DailyInflowTab from '../components/DailyInflowTab';
import SearchTab from '../components/SearchTab';
import JournalTab from '../components/JournalTab';
import WishlistTab from '../components/WishlistTab';
import CalendarTab from '../components/CalendarTab';
import StatsTab from '../components/StatsTab';
import SalesTab from '../components/SalesTab';
import AnimatedBackground from '../components/AnimatedBackground';

export default function Home() {
    // UI Phase States
    const [introFinished, setIntroFinished] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                if (window.location.hash.includes('access_token=') || window.location.hash.includes('error=')) {
                    setIntroFinished(true);
                }
                // sessionStorage check dihapus agar intro selalu muncul setiap kali aplikasi dibuka/direfresh
            } catch (e) {
                console.error("Storage access denied:", e);
            }
        }
    }, []);

    useEffect(() => {
        if (introFinished && typeof window !== 'undefined') {
            try {
                sessionStorage.setItem('ffml_intro_finished', 'true');
            } catch (e) {}
        }
    }, [introFinished]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');

    // Switch Account States
    const [savedUsers, setSavedUsers] = useState([]);
    const [isSwitchAccountOpen, setIsSwitchAccountOpen] = useState(false);
    const [autofillEmail, setAutofillEmail] = useState('');

    // Global Month/Year Filters
    const [globalFilterMonth, setGlobalFilterMonth] = useState('all');
    const [globalFilterYear, setGlobalFilterYear] = useState('2026');

    // Sync Status
    const [syncStatus, setSyncStatus] = useState('');
    const [forceSyncTrigger, setForceSyncTrigger] = useState(0);

    // App Data States
    const [accounts, setAccounts] = useState([]);
    const [sales, setSales] = useState([]);
    const [buyerSearchAccounts, setBuyerSearchAccounts] = useState([]);
    const [keuanganTransactions, setKeuanganTransactions] = useState([]);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [jurnalBisnis, setJurnalBisnis] = useState([]);
    const [lastSaved, setLastSaved] = useState('');
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    
    // Prevent infinite sync loops and race conditions
    const isRemoteUpdate = useRef(false);
    const lastLocalUpdate = useRef(Date.now());
    const prevForceSync = useRef(0);
    const loadedUserId = useRef(null);
    const syncQueueRef = useRef(null);

    // Header UI States
    const [currentDateStr, setCurrentDateStr] = useState('');
    const [globalSearchText, setGlobalSearchText] = useState('');
    const [isEditInfoOpen, setIsEditInfoOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [displayName, setDisplayName] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                return localStorage.getItem('ffml_display_name') || 'Farid Owner';
            } catch (e) { return 'Farid Owner'; }
        }
        return 'Farid Owner';
    });
    const [displaySubtitle, setDisplaySubtitle] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                return localStorage.getItem('ffml_display_subtitle') || 'Kelola akun game dan pantau penjualan dengan mudah.';
            } catch (e) { return 'Kelola akun game dan pantau penjualan dengan mudah.'; }
        }
        return 'Kelola akun game dan pantau penjualan dengan mudah.';
    });
    const [editNameTemp, setEditNameTemp] = useState('');
    const [editSubtitleTemp, setEditSubtitleTemp] = useState('');

    const openEditInfo = () => {
        setEditNameTemp(displayName);
        setEditSubtitleTemp(displaySubtitle);
        setIsEditInfoOpen(true);
    };

    const saveEditInfo = () => {
        const name = editNameTemp.trim() || 'Farid Owner';
        const sub = editSubtitleTemp.trim() || 'Kelola akun game dan pantau penjualan dengan mudah.';
        setDisplayName(name);
        setDisplaySubtitle(sub);
        localStorage.setItem('ffml_display_name', name);
        localStorage.setItem('ffml_display_subtitle', sub);
        setIsEditInfoOpen(false);
    };

    useEffect(() => {
        setCurrentDateStr(new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
    }, []);

    const pendingAccounts = accounts.filter(a => a.status === 'hold' || a.status === 'cicilan').length;

    // Initial mount ref for checking recursion
    const isInitialMount = useRef(true);

    // Helper functions
    const formatRupiah = (angka) => {
        return 'Rp ' + new Intl.NumberFormat('id-ID').format(angka);
    };

    const parseRupiah = (stringRupiah) => {
        if (!stringRupiah) return 0;
        if (typeof stringRupiah === 'number') return stringRupiah;
        return parseInt(stringRupiah.replace(/[^0-9]/g, ''), 10) || 0;
    };

    const generateId = () => {
        return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    };

    const handleResetState = () => {
        setAccounts([]);
        setSales([]);
        setBuyerSearchAccounts([]);
        setKeuanganTransactions([]);
        setWishlistItems([]);
        setJurnalBisnis([]);
        setLastSaved('');
    };

    // 1. Initial Load of Saved Users Index (Device Level)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const localSavedUsers = localStorage.getItem('ffml_saved_users');
                if (localSavedUsers) {
                    setSavedUsers(JSON.parse(localSavedUsers));
                }
            } catch (e) {
                console.error("Storage access denied for saved users");
            }
            
            // Adjust sidebar state for mobile screens initially
            if (window.innerWidth <= 768) {
                setIsSidebarOpen(false);
            }
        }
    }, []);

    // 2. Auth state change & remote data load
    useEffect(() => {
        // Listening for Deep Link Hash callback from Android WebView / Browser OAuth
        const checkHashForSession = () => {
            const hash = window.location.hash;
            if (hash && hash.includes('access_token=')) {
                const params = new URLSearchParams(hash.substring(1));
                const access_token = params.get('access_token');
                const refresh_token = params.get('refresh_token');
                if (access_token) {
                    supabase.auth.setSession({
                        access_token,
                        refresh_token: refresh_token || ''
                    }).then(({ data, error }) => {
                        if (error) {
                            alert("Sesi OAuth Error: " + error.message);
                        } else {
                            window.location.hash = ''; // clear hash
                        }
                    });
                }
            }
        };

        checkHashForSession();
        window.addEventListener('hashchange', checkHashForSession);

        const handleSession = async (session) => {
            if (session) {
                if (loadedUserId.current !== session.user.id) {
                    loadedUserId.current = session.user.id;
                    setIsDataLoaded(false); // Pause auto-save & show loading
                    setCurrentUser(session.user);
                    const provider = session.user.app_metadata?.provider || 'email';
                    saveUserToSavedList(session.user, provider);
                    await loadUserData(session.user);
                } else {
                    setCurrentUser(session.user);
                }
            } else {
                if (loadedUserId.current !== null) {
                    loadedUserId.current = null;
                    setIsDataLoaded(false);
                    setCurrentUser(null);
                    handleResetState();
                } else {
                    setIsDataLoaded(true);
                }
            }
        };

        // Fetch session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleSession(session);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                handleSession(session);
            } else if (event === 'SIGNED_OUT') {
                handleSession(null);
            }
        });

        return () => {
            subscription.unsubscribe();
            window.removeEventListener('hashchange', checkHashForSession);
        };
    }, []);

    // Save profile to local saved accounts
    const saveUserToSavedList = (user, provider) => {
        const list = JSON.parse(localStorage.getItem('ffml_saved_users') || '[]');
        const exists = list.find(u => u.email === user.email);
        if (!exists) {
            list.push({
                id: user.id,
                email: user.email,
                provider: provider,
                lastActive: new Date().toISOString()
            });
        } else {
            exists.lastActive = new Date().toISOString();
            exists.id = user.id;
            exists.provider = provider;
        }
        localStorage.setItem('ffml_saved_users', JSON.stringify(list));
        setSavedUsers(list);
    };

    // Load function from localStorage (Namespaced) and remote Supabase
    const loadUserData = async (user) => {
        const email = user.email;
        syncQueueRef.current = new DataSyncQueue(email);

        // 1. Prioritaskan Load dari Cloud (Supabase as Source of Truth)
        try {
            const { data, error } = await supabase
                .from('user_app_data')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            if (data) {
                // Version checking
                let localVersion = 0;
                try {
                    const localQueueStr = localStorage.getItem(`ffml_${email}_sync_queue`);
                    if (localQueueStr) {
                        const localQueue = JSON.parse(localQueueStr);
                        localVersion = localQueue.snapshot?.version || 0;
                    }
                } catch(e) {}

                const cloudVersion = data.version || 0;

                // Jangan menimpa jika lokal memiliki antrean (queue) yang versinya lebih baru
                if (localVersion > cloudVersion) {
                    console.log(`[Load] Local version (${localVersion}) is newer than Cloud (${cloudVersion}). Menyiapkan sinkronisasi...`);
                    // Muat dari antrean lokal
                    try {
                        const localQueueStr = localStorage.getItem(`ffml_${email}_sync_queue`);
                        const localQueue = JSON.parse(localQueueStr);
                        const snap = localQueue.snapshot;
                        if (snap.accounts) setAccounts(snap.accounts);
                        if (snap.sales) setSales(snap.sales);
                        if (snap.buyer_search) setBuyerSearchAccounts(snap.buyer_search);
                        if (snap.keuangan) setKeuanganTransactions(snap.keuangan);
                        if (snap.wishlist) setWishlistItems(snap.wishlist);
                        if (snap.jurnal) setJurnalBisnis(snap.jurnal);
                    } catch(e) {}
                    
                    setForceSyncTrigger(prev => prev + 1);
                } else {
                    console.log(`[Load] Loaded from Cloud (Version: ${cloudVersion})`);
                    if (data.accounts) setAccounts(data.accounts);
                    if (data.sales) setSales(data.sales);
                    if (data.buyer_search) setBuyerSearchAccounts(data.buyer_search);
                    if (data.keuangan) setKeuanganTransactions(data.keuangan);
                    if (data.wishlist) setWishlistItems(data.wishlist);
                    if (data.jurnal) setJurnalBisnis(data.jurnal);
                    
                    // Clear obsolete queue
                    syncQueueRef.current.clearQueue();

                    // Caching ke LocalStorage
                    syncQueueRef.current._saveCache(data, email);
                    
                    const lastSavedTime = data.updated_at || new Date().toISOString();
                    setLastSaved(new Date(lastSavedTime).toLocaleTimeString('id-ID'));
                }
            } else {
                console.log("[Load] No cloud data found. Initiating from empty state.");
                setAccounts([]); setSales([]); setBuyerSearchAccounts([]); setKeuanganTransactions([]); setWishlistItems([]); setJurnalBisnis([]);
            }
        } catch (e) {
            console.error('Supabase load error:', e);
            console.log("[Load] Offline / Fetch Failed. Falling back to LocalStorage cache...");
            
            // 2. Fallback Load dari Namespaced LocalStorage
            let localAcc, localSales, localBuyer, localKeu, localWish, localJur, localLast;
            try {
                localAcc = localStorage.getItem(`ffml_${email}_accounts`);
                localSales = localStorage.getItem(`ffml_${email}_sales`);
                localBuyer = localStorage.getItem(`ffml_${email}_buyer_search`);
                localKeu = localStorage.getItem(`ffml_${email}_keuangan`);
                localWish = localStorage.getItem(`ffml_${email}_wishlist`);
                localJur = localStorage.getItem(`ffml_${email}_jurnal`);
                localLast = localStorage.getItem(`ffml_${email}_lastSaved`);
            } catch (err) {}

            if (localAcc) setAccounts(JSON.parse(localAcc)); else setAccounts([]);
            if (localSales) setSales(JSON.parse(localSales)); else setSales([]);
            if (localBuyer) setBuyerSearchAccounts(JSON.parse(localBuyer)); else setBuyerSearchAccounts([]);
            if (localKeu) setKeuanganTransactions(JSON.parse(localKeu)); else setKeuanganTransactions([]);
            if (localWish) setWishlistItems(JSON.parse(localWish)); else setWishlistItems([]);
            if (localJur) setJurnalBisnis(JSON.parse(localJur)); else setJurnalBisnis([]);
            if (localLast) setLastSaved(new Date(localLast).toLocaleTimeString('id-ID')); else setLastSaved('');
        }

        // Prevent the auto-save from immediately echoing this loaded state (or empty state) back to the cloud
        isRemoteUpdate.current = true;
        setIsDataLoaded(true); // Permit auto-saving for this user
    };

    // 3. Queue Periodic Check & BeforeUnload
    useEffect(() => {
        if (!currentUser || !isDataLoaded) return;

        // Periodic check every 5 seconds
        const intervalId = setInterval(() => {
            if (syncQueueRef.current && syncQueueRef.current.hasPending()) {
                setSyncStatus('☁️ Menyinkronkan...');
                syncQueueRef.current.processQueue(
                    () => {
                        setSyncStatus('✅ Tersimpan ke Cloud');
                        setTimeout(() => setSyncStatus(''), 4000);
                        setLastSaved(new Date().toLocaleTimeString('id-ID'));
                    },
                    (e) => {
                        setSyncStatus(`❌ Gagal: ${e.message}`);
                        setTimeout(() => setSyncStatus(''), 8000);
                    }
                );
            }
        }, 5000);

        // Before Unload: Cegah data loss
        const handleBeforeUnload = (e) => {
            if (syncQueueRef.current && syncQueueRef.current.hasPending()) {
                e.preventDefault();
                e.returnValue = 'Data sedang disinkronisasi ke cloud. Yakin ingin keluar?';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [currentUser, isDataLoaded]);

    // 4. State Tracker: Push ke Queue jika state berubah secara lokal
    useEffect(() => {
        // Block save calls if data loading is in progress or no active session exists
        if (!isDataLoaded || !currentUser || !syncQueueRef.current) return;

        // Prevent saving back to cloud if the state change came from a remote sync
        if (isRemoteUpdate.current) {
            isRemoteUpdate.current = false;
            return;
        }

        lastLocalUpdate.current = Date.now();
        const isManualSync = forceSyncTrigger > prevForceSync.current;
        prevForceSync.current = forceSyncTrigger;

        const isTotallyEmpty = accounts.length === 0 && sales.length === 0 && buyerSearchAccounts.length === 0 && keuanganTransactions.length === 0 && wishlistItems.length === 0 && jurnalBisnis.length === 0;

        if (isTotallyEmpty && !isManualSync) {
            return;
        }

        // Buat snapshot dan letakkan di Queue
        const snapshot = { accounts, sales, buyer_search: buyerSearchAccounts, keuangan: keuanganTransactions, wishlist: wishlistItems, jurnal: jurnalBisnis };
        syncQueueRef.current.enqueue(snapshot, currentUser.id);
        
        setSyncStatus('📝 Data dalam antrean...');

    }, [accounts, sales, buyerSearchAccounts, keuanganTransactions, wishlistItems, jurnalBisnis, currentUser, isDataLoaded, forceSyncTrigger]);

    // 4. Realtime Sync Listener (Supabase)
    useEffect(() => {
        if (!currentUser || !isDataLoaded) return;

        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'user_app_data',
                    filter: `id=eq.${currentUser.id}`
                },
                (payload) => {
                    const data = payload.new;
                    if (data) {
                        // Ignore remote updates if we made a local change within the last 5 seconds.
                        // This prevents race conditions where our own save "echo" from Supabase overwrites 
                        // newer local typing/changes that haven't been saved yet.
                        if (Date.now() - lastLocalUpdate.current < 5000) {
                            return;
                        }

                        isRemoteUpdate.current = true;
                        if (data.accounts) setAccounts(data.accounts);
                        if (data.sales) setSales(data.sales);
                        if (data.buyer_search) setBuyerSearchAccounts(data.buyer_search);
                        if (data.keuangan) setKeuanganTransactions(data.keuangan);
                        if (data.wishlist) setWishlistItems(data.wishlist);
                        if (data.jurnal) setJurnalBisnis(data.jurnal);
                        
                        const lastSavedTime = data.updated_at || new Date().toISOString();
                        setLastSaved(new Date(lastSavedTime).toLocaleTimeString('id-ID'));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser, isDataLoaded]);

    // Data mutation handlers
    const handleAddAccount = (acc) => {
        const newAcc = { ...acc, id: generateId() };
        setAccounts(prev => [newAcc, ...prev]);
    };

    const handleUpdateAccount = (id, updates) => {
        setAccounts(prevAccounts => {
            return prevAccounts.map(a => {
                if (a.id === id) {
                    const updated = { ...a, ...updates };

                    // If status changes to sold ('terjual') or credit ('cicilan')
                    if ((updates.status === 'terjual' || updates.status === 'cicilan') && a.status === 'aktif') {
                        const newSale = {
                            id: generateId(),
                            accountId: id,
                            game: updated.game,
                            accountIdDisplay: updated.spek || updated.email || '-',
                            price: updated.sellPrice || updated.targetPrice || 0,
                            buyerName: updated.buyer || '-',
                            saleDate: updated.sellDate || new Date().toISOString().split('T')[0],
                            paymentType: updates.status === 'cicilan' ? 'cicilan' : 'cash',
                            installmentCount: 1
                        };
                        setSales(prevSales => [...prevSales, newSale]);
                    }

                    // If payment updates from cicilan to terjual (installments finished)
                    if (updates.status === 'terjual' && a.status === 'cicilan') {
                        setSales(prevSales => prevSales.map(s => {
                            if (s.accountId === id) {
                                return {
                                    ...s,
                                    paymentType: 'cash',
                                    price: updated.sellPrice || s.price
                                };
                            }
                            return s;
                        }));
                    }

                    return updated;
                }
                return a;
            });
        });
    };

    const handleDeleteAccount = (id) => {
        setAccounts(prev => prev.filter(a => a.id !== id));
        // Cascade remove from sales history
        setSales(prev => prev.filter(s => s.accountId !== id));
    };

    const handleAddTransaction = (t) => {
        const newT = { ...t, id: generateId() };
        setKeuanganTransactions(prev => [newT, ...prev]);
    };

    const handleDeleteTransaction = (id) => {
        setKeuanganTransactions(prev => prev.filter(t => t.id !== id));
    };

    const handleAddWishlistItem = (item) => {
        const newI = { ...item, id: generateId() };
        setWishlistItems(prev => [newI, ...prev]);
    };

    const handleDeleteWishlistItem = (id) => {
        setWishlistItems(prev => prev.filter(item => item.id !== id));
    };

    const handleAddJournal = (jurnal) => {
        const newJ = { ...jurnal, id: generateId(), createdAt: new Date().toISOString() };
        setJurnalBisnis(prev => [newJ, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
    };

    const handleDeleteJournal = (id) => {
        setJurnalBisnis(prev => prev.filter(j => j.id !== id));
    };

    const handleDeleteSale = (saleId) => {
        if (!confirm('Yakin ingin menghapus riwayat penjualan ini? Status akun akan dikembalikan menjadi Ready.')) return;
        const sale = sales.find(s => s.id === saleId);
        if (sale) {
            setAccounts(prev => prev.map(a => {
                if (a.id === sale.accountId) {
                    return {
                        ...a,
                        status: 'aktif',
                        sellPrice: 0,
                        sellDate: '',
                        buyer: ''
                    };
                }
                return a;
            }));
        }
        setSales(prev => prev.filter(s => s.id !== saleId));
    };

    // Switch Account Handlers
    const handleSwitchAccount = async (targetUser) => {
        setIsSwitchAccountOpen(false);
        await supabase.auth.signOut();
        setCurrentUser(null);
        
        if (targetUser.provider === 'google') {
            const isAndroid = /Android/i.test(navigator.userAgent);
            const isAndroidWebView = isAndroid && (window.location.protocol === 'file:' || navigator.userAgent.includes('wv'));
            const redirectUrl = isAndroidWebView ? 'manajemenakun://login-callback' : window.location.href;
            
            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl
                }
            });
        } else {
            setAutofillEmail(targetUser.email);
        }
    };

    const handleAddNewAccount = async () => {
        setIsSwitchAccountOpen(false);
        await supabase.auth.signOut();
        setCurrentUser(null);
        setAutofillEmail('');
    };

    const handleConfirmLogoutAll = async () => {
        if (confirm('Keluar dari akun Anda?')) {
            setIsSwitchAccountOpen(false);
            await supabase.auth.signOut();
            setCurrentUser(null);
            setAutofillEmail('');
        }
    };

    const handleRemoveSavedUser = (email) => {
        if (confirm('Hapus akun ini dari daftar perangkat?')) {
            setSavedUsers(prev => {
                const updated = prev.filter(u => u.email !== email);
                localStorage.setItem('ffml_saved_users', JSON.stringify(updated));
                
                // Clear namespaced cache as well
                localStorage.removeItem(`ffml_${email}_accounts`);
                localStorage.removeItem(`ffml_${email}_sales`);
                localStorage.removeItem(`ffml_${email}_buyer_search`);
                localStorage.removeItem(`ffml_${email}_keuangan`);
                localStorage.removeItem(`ffml_${email}_wishlist`);
                localStorage.removeItem(`ffml_${email}_jurnal`);
                localStorage.removeItem(`ffml_${email}_lastSaved`);
                
                return updated;
            });
        }
    };

    // Import/Export
    const handleExportData = () => {
        const data = {
            accounts,
            sales,
            buyerSearchAccounts,
            keuanganTransactions,
            wishlistItems,
            jurnalBisnis,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-akun-ffml-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        alert('✅ Data berhasil di-export!');
    };

    const handleImportData = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.accounts || data.sales) {
                    if (confirm(`Import data? Data saat ini untuk akun ${currentUser ? currentUser.email : ''} akan ditimpa dan disinkronisasi ke Cloud.`)) {
                        if (data.accounts) setAccounts(data.accounts);
                        if (data.sales) setSales(data.sales);
                        if (data.buyerSearchAccounts) setBuyerSearchAccounts(data.buyerSearchAccounts);
                        if (data.keuanganTransactions) setKeuanganTransactions(data.keuanganTransactions);
                        if (data.wishlistItems) setWishlistItems(data.wishlistItems);
                        if (data.jurnalBisnis) setJurnalBisnis(data.jurnalBisnis);
                        
                        setForceSyncTrigger(prev => prev + 1); // Paksa trigger sinkronisasi
                        alert(`✅ Data berhasil di-import dan disinkronisasi ke email Anda (${currentUser?.email || ''})`);
                    }
                } else {
                    alert('⚠️ Format file tidak valid!');
                }
            } catch (err) {
                alert('⚠️ Error membaca file: ' + err.message);
            }
        };
        reader.readAsText(file);
    };

    // Render Tab Router
    const renderActiveTabContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <DashboardTab
                        accounts={accounts}
                        sales={sales}
                        formatRupiah={formatRupiah}
                        activeFilterMonth={globalFilterMonth}
                        activeFilterYear={globalFilterYear}
                        onNavigate={setActiveTab}
                    />
                );
            case 'stok-ff':
                return (
                    <StockTab
                        game="ff"
                        accounts={accounts}
                        onAddAccount={handleAddAccount}
                        onUpdateAccount={handleUpdateAccount}
                        onDeleteAccount={handleDeleteAccount}
                        formatRupiah={formatRupiah}
                        parseRupiah={parseRupiah}
                        globalFilterMonth={globalFilterMonth}
                        globalFilterYear={globalFilterYear}
                    />
                );
            case 'stok-ml':
                return (
                    <StockTab
                        game="ml"
                        accounts={accounts}
                        onAddAccount={handleAddAccount}
                        onUpdateAccount={handleUpdateAccount}
                        onDeleteAccount={handleDeleteAccount}
                        formatRupiah={formatRupiah}
                        parseRupiah={parseRupiah}
                        globalFilterMonth={globalFilterMonth}
                        globalFilterYear={globalFilterYear}
                    />
                );
            case 'pencarian':
                return (
                    <SearchTab
                        accounts={accounts}
                        formatRupiah={formatRupiah}
                        onUpdateAccount={handleUpdateAccount}
                        onDeleteAccount={handleDeleteAccount}
                        globalKeyword={globalSearchText}
                    />
                );
            case 'akun-masuk':
                return (
                    <DailyInflowTab
                        accounts={accounts}
                        formatRupiah={formatRupiah}
                        globalFilterMonth={globalFilterMonth}
                        globalFilterYear={globalFilterYear}
                    />
                );
            case 'kalender-keuangan':
                return (
                    <CalendarTab
                        accounts={accounts}
                        keuanganTransactions={keuanganTransactions}
                        onAddTransaction={handleAddTransaction}
                        onDeleteTransaction={handleDeleteTransaction}
                        formatRupiah={formatRupiah}
                        parseRupiah={parseRupiah}
                        globalFilterMonth={globalFilterMonth}
                        globalFilterYear={globalFilterYear}
                    />
                );
            case 'statistik':
                return (
                    <StatsTab
                        accounts={accounts}
                        globalFilterMonth={globalFilterMonth}
                        globalFilterYear={globalFilterYear}
                        formatRupiah={formatRupiah}
                    />
                );
            case 'penjualan':
                return (
                    <SalesTab
                        sales={sales}
                        onDeleteSale={handleDeleteSale}
                        formatRupiah={formatRupiah}
                    />
                );
            case 'wishlist':
                return (
                    <WishlistTab
                        wishlistItems={wishlistItems}
                        onAddWishlistItem={handleAddWishlistItem}
                        onDeleteWishlistItem={handleDeleteWishlistItem}
                        formatRupiah={formatRupiah}
                        parseRupiah={parseRupiah}
                    />
                );
            case 'jurnal':
                return (
                    <JournalTab
                        jurnalBisnis={jurnalBisnis}
                        onAddJournal={handleAddJournal}
                        onDeleteJournal={handleDeleteJournal}
                    />
                );
            default:
                return <div>Pilih Tab Menu</div>;
        }
    };

    return (
        <>
            {/* 1. Loading Splash Intro */}
            {!introFinished && (
                <IntroOverlay onIntroFinished={() => setIntroFinished(true)} />
            )}

            {/* 2. Login Overlay if not authorized */}
            {introFinished && !currentUser && (
                <LoginOverlay onLoginSuccess={(user) => setCurrentUser(user)} initialEmail={autofillEmail} />
            )}

            {/* Main Work Area */}
            {/* 3. Main Dashboard System */}
            {introFinished && currentUser && !isDataLoaded && (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0f1d', color: 'white', zIndex: 9999, position: 'relative' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <h3 style={{ marginTop: '20px', fontFamily: 'var(--font-sans)', fontWeight: 500, color: '#94a3b8', fontSize: '1rem' }}>Menyinkronkan data...</h3>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            )}

            {introFinished && currentUser && isDataLoaded && (
                <>
                    <AnimatedBackground />
                    <div className="app-wrapper">
                    {/* Sidebar Nav */}
                    <Sidebar 
                        activeTab={activeTab} 
                        onTabChange={setActiveTab} 
                        isOpen={isSidebarOpen} 
                        toggleSidebar={setIsSidebarOpen}
                        currentUser={currentUser}
                        savedUsers={savedUsers}
                        onSwitchAccount={handleSwitchAccount}
                        onAddNewAccount={handleAddNewAccount}
                        onLogout={handleConfirmLogoutAll}
                    />

                    {/* Main Work Area */}
                    <div className={`main-content ${isSidebarOpen ? '' : 'expanded'}`}>
                        <div className="container">
                            
                            {/* MOBILE TOP BAR (Only visible on mobile via CSS) */}
                            <div className="mobile-top-bar">
                                <div className="brand">
                                    <div className="brand-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                                    </div>
                                    <div className="brand-text">Farid</div>
                                </div>
                                <button className="menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                                </button>
                            </div>

                            {/* MODERN PREMIUM HEADER (Replaces old massive welcome card) */}
                            {activeTab === 'dashboard' && (
                                <>
                                    <div className="premium-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 8px var(--accent-green)' }}></span>
                                                SYSTEM ONLINE
                                            </div>
                                            <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>
                                                Welcome back, <span onClick={openEditInfo} style={{ cursor: 'pointer', color: 'var(--accent-blue)' }} title="Edit info dashboard">{displayName}</span> 👋
                                            </h1>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{displaySubtitle}</p>
                                        </div>
                                        <div className="premium-header-actions" style={{ display: 'flex', gap: '12px' }}>
                                            <button className="btn-sci-fi" onClick={() => setActiveTab('tambah')} style={{ padding: '10px 20px', borderRadius: '12px', background: 'var(--accent-blue)', color: 'white', border: 'none', fontWeight: 500, cursor: 'pointer', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)' }}>
                                                + Tambah Akun
                                            </button>
                                        </div>
                                    </div>
                                    <div className="sci-fi-stats-row" style={{ marginTop: '24px' }}>
                                        <div className="sci-fi-stat-card" onClick={() => setActiveTab('tambah')} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '16px' }}>
                                            <div className="sci-fi-icon-wrap sci-fi-icon-blue">
                                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                                            </div>
                                            <div className="sci-fi-stat-info">
                                                <div className="sci-fi-stat-title" style={{ color: 'var(--text-primary)' }}>Tambah Akun</div>
                                                <div className="sci-fi-stat-subtitle" style={{ color: 'var(--text-secondary)' }}>Buat akun baru</div>
                                            </div>
                                        </div>
                                        <div className="sci-fi-stat-card" onClick={() => setActiveTab('dashboard')} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '16px' }}>
                                            <div className="sci-fi-icon-wrap sci-fi-icon-gold">
                                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                                            </div>
                                            <div className="sci-fi-stat-info">
                                                <div className="sci-fi-stat-title" style={{ color: 'var(--text-primary)' }}>{accounts.filter(a => a.status === 'aktif').length} Ready</div>
                                                <div className="sci-fi-stat-subtitle" style={{ color: 'var(--text-secondary)' }}>Akun siap digunakan</div>
                                            </div>
                                        </div>
                                        <div className="sci-fi-stat-card" onClick={() => setActiveTab('penjualan')} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '16px' }}>
                                            <div className="sci-fi-icon-wrap sci-fi-icon-blue">
                                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                                            </div>
                                            <div className="sci-fi-stat-info">
                                                <div className="sci-fi-stat-title" style={{ color: 'var(--text-primary)' }}>{accounts.filter(a => a.status === 'terjual').length} Terjual</div>
                                                <div className="sci-fi-stat-subtitle" style={{ color: 'var(--text-secondary)' }}>Total transaksi</div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}


                            {/* MOBILE ACTIONS ROW (Search, Notif, Switch - visible only on mobile) */}
                            <div className="mobile-actions-row">
                                <div className="search-container" style={{ flex: 1, position: 'relative' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Cari..." 
                                        value={globalSearchText}
                                        onChange={(e) => setGlobalSearchText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') setActiveTab('pencarian');
                                        }}
                                        style={{ width: '100%', padding: '10px 16px 10px 40px', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-medium)', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', fontSize: '0.9rem', outline: 'none', color: 'var(--text-primary)' }} 
                                    />
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                </div>
                                
                                <button 
                                    onClick={() => setIsNotificationOpen(true)}
                                    style={{ position: 'relative', width: '42px', height: '42px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-medium)', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                                    {pendingAccounts > 0 && (
                                        <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'linear-gradient(135deg, #0052D4, #00D2FF)', color: 'white', fontSize: '0.65rem', fontWeight: 700, width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-body)', boxShadow: '0 0 8px rgba(0, 210, 255, 0.4)' }}>{pendingAccounts}</span>
                                    )}
                                </button>

                                <button 
                                    onClick={() => setIsSwitchAccountOpen(true)} 
                                    className="s-btn s-btn-secondary"
                                    style={{ width: '42px', height: '42px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                    </svg>
                                </button>
                            </div>

                            {/* DESKTOP ACTIONS HEADER (Hidden on mobile) */}
                            <div className="header desktop-only-header" style={{ marginBottom: '32px' }}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px', width: '100%', flexWrap: 'wrap' }}>
                                    <button 
                                        className="btn-toggle-sidebar" 
                                        onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                                        aria-label="Toggle Sidebar"
                                        title={isSidebarOpen ? "Tutup Sidebar" : "Buka Sidebar"}
                                        style={{ 
                                            display: 'flex', 
                                            background: 'rgba(0,0,0,0.3)', 
                                            border: '1px solid var(--border-medium)', 
                                            borderRadius: 'var(--r-md)', 
                                            width: '40px', height: '40px', 
                                            alignItems: 'center', justifyContent: 'center', 
                                            cursor: 'pointer', color: 'var(--text-primary)', 
                                            backdropFilter: 'blur(10px)',
                                            marginRight: 'auto'
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,210,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(0,210,255,0.2)'; e.currentTarget.style.color = '#00D2FF'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.3)'; e.currentTarget.style.borderColor = 'var(--border-medium)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="3" y1="12" x2="21" y2="12"></line>
                                            <line x1="3" y1="6" x2="21" y2="6"></line>
                                            <line x1="3" y1="18" x2="21" y2="18"></line>
                                        </svg>
                                    </button>
                                    
                                    <div className="search-container" style={{ width: '300px', position: 'relative' }}>
                                        <input 
                                            type="text" 
                                            placeholder="Ketik lalu Enter..." 
                                            value={globalSearchText}
                                            onChange={(e) => setGlobalSearchText(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') setActiveTab('pencarian');
                                            }}
                                            style={{ width: '100%', padding: '10px 16px 10px 40px', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-medium)', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', fontSize: '0.9rem', outline: 'none', color: 'var(--text-primary)' }} 
                                        />
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                    </div>
                                    
                                    <button 
                                        onClick={() => setIsNotificationOpen(true)}
                                        title="Notifikasi"
                                        style={{ position: 'relative', width: '40px', height: '40px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-medium)', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)' }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                                        {pendingAccounts > 0 && (
                                            <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'linear-gradient(135deg, #0052D4, #00D2FF)', color: 'white', fontSize: '0.65rem', fontWeight: 700, width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-body)', boxShadow: '0 0 8px rgba(0, 210, 255, 0.4)' }}>{pendingAccounts}</span>
                                        )}
                                    </button>
                                    
                                    <button 
                                        onClick={() => setIsSwitchAccountOpen(true)} 
                                        className="s-btn s-btn-secondary"
                                        title="Ganti Akun"
                                        style={{ height: '40px', display: 'flex', alignItems: 'center' }}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                                            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                        </svg>
                                        Ganti Akun
                                    </button>
                                </div>
                            </div>

                            {/* Utility Bar (Filter & Backup) */}
                            <div className="premium-filter-bar" style={{ marginBottom: '24px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: 'transparent', borderBottom: '1px solid var(--border-subtle)' }}>
                                {/* Global Month/Year Filter */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                    <label style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                                        Filter:
                                    </label>
                                    
                                    <select 
                                        value={globalFilterMonth} 
                                        onChange={(e) => setGlobalFilterMonth(e.target.value)}
                                        style={{ padding: '6px 12px', border: '1px solid var(--border-subtle)', borderRadius: '8px', fontSize: '0.85rem', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontWeight: 500, outline: 'none', cursor: 'pointer' }}
                                    >
                                        <option value="all">Semua Waktu</option>
                                        <option value="0">Januari</option>
                                        <option value="1">Februari</option>
                                        <option value="2">Maret</option>
                                        <option value="3">April</option>
                                        <option value="4">Mei</option>
                                        <option value="5">Juni</option>
                                        <option value="6">Juli</option>
                                        <option value="7">Agustus</option>
                                        <option value="8">September</option>
                                        <option value="9">Oktober</option>
                                        <option value="10">November</option>
                                        <option value="11">Desember</option>
                                    </select>

                                    <select 
                                        value={globalFilterYear} 
                                        onChange={(e) => setGlobalFilterYear(e.target.value)}
                                        style={{ padding: '6px 12px', border: '1px solid var(--border-subtle)', borderRadius: '8px', fontSize: '0.85rem', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontWeight: 500, outline: 'none', cursor: 'pointer' }}
                                    >
                                        <option value="2025">2025</option>
                                        <option value="2026">2026</option>
                                        <option value="2027">2027</option>
                                        <option value="2028">2028</option>
                                    </select>
                                    
                                    <button 
                                        onClick={() => { setGlobalFilterMonth('all'); setGlobalFilterYear('2026'); }} 
                                        className="s-btn"
                                        style={{ background: 'var(--c-50)', border: '1px solid var(--border-medium)', color: 'var(--text-secondary)', padding: '7px 12px', borderRadius: 'var(--r-sm)', fontSize: '0.85rem' }}
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                                            <path d="M3 3v5h5"></path>
                                        </svg>
                                        Reset
                                    </button>
                                </div>

                                {/* Backup & Restore */}
                                <div className="utility-bar-backup" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    {lastSaved && (
                                        <span style={{ color: 'var(--text-tertiary)', fontSize: '.75rem', fontWeight: 500, marginRight: '8px' }}>
                                            Tersimpan: {lastSaved}
                                        </span>
                                    )}
                                    {currentUser && syncStatus && (
                                        <span style={{ 
                                            fontSize: '0.75rem', 
                                            color: syncStatus.includes('✅') ? '#10B981' : syncStatus.includes('❌') ? '#EF4444' : '#00D2FF', 
                                            fontWeight: 600, 
                                            animation: 'fadeInScale 0.5s ease',
                                            background: syncStatus.includes('✅') ? 'rgba(16,185,129,0.1)' : syncStatus.includes('❌') ? 'rgba(239,68,68,0.1)' : 'rgba(0,210,255,0.1)',
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            marginRight: '10px'
                                        }}>
                                            {syncStatus}
                                        </span>
                                    )}
                                    {currentUser && !syncStatus && (
                                        <button 
                                            className="s-btn" 
                                            onClick={() => setForceSyncTrigger(p => p + 1)}
                                            style={{ 
                                                background: 'transparent',
                                                border: '1px solid rgba(0, 210, 255, 0.3)', 
                                                color: '#00D2FF',
                                                padding: '6px 12px', 
                                                borderRadius: 'var(--r-sm)',
                                                marginRight: '10px',
                                                fontSize: '0.8rem'
                                            }}
                                        >
                                            ☁️ Simpan ke Cloud
                                        </button>
                                    )}
                                    <button 
                                        className="s-btn" 
                                        style={{ 
                                            background: 'rgba(0, 210, 255, 0.1)', 
                                            border: '1px solid rgba(0, 210, 255, 0.3)', 
                                            color: '#00D2FF',
                                            padding: '7px 14px', 
                                            borderRadius: 'var(--r-sm)',
                                            boxShadow: '0 0 10px rgba(0, 210, 255, 0.1)'
                                        }} 
                                        onClick={handleExportData}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                        Export
                                    </button>
                                    <label 
                                        className="s-btn" 
                                        style={{ 
                                            background: 'rgba(0, 82, 212, 0.2)', 
                                            border: '1px solid rgba(0, 82, 212, 0.5)', 
                                            color: '#7EB6FF',
                                            padding: '7px 14px', 
                                            borderRadius: 'var(--r-sm)', 
                                            cursor: 'pointer', 
                                            margin: 0,
                                            boxShadow: '0 0 10px rgba(0, 82, 212, 0.15)'
                                        }}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                        Import
                                        <input type="file" onChange={handleImportData} accept=".json" style={{ display: 'none' }} />
                                    </label>
                                </div>
                            </div>


                            {/* Tab Body Render */}
                            {renderActiveTabContent()}

                        </div>
                    </div>
                </div>
                </>
            )}

            {/* 4. Switch Account Modal Overlay */}
            {isSwitchAccountOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 100000,
                    background: 'rgba(11, 25, 41, 0.88)',
                    backdropFilter: 'blur(12px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                }}>
                    <div style={{
                        background: 'rgba(19, 40, 66, 0.92)',
                        border: '1px solid rgba(43, 125, 204, 0.18)',
                        borderRadius: '20px',
                        padding: '28px',
                        boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
                        width: '90%',
                        maxWidth: '440px',
                        backdropFilter: 'blur(20px)'
                    }}>
                        <h3 style={{ marginBottom: '6px', fontSize: '1.1rem', fontWeight: 700, color: '#F2F7FD', display: 'flex', alignItems: 'center', gap: '8px' }}>Ganti Akun</h3>
                        <p style={{ color: '#5A8BBD', fontSize: '0.8rem', marginBottom: '20px', fontWeight: 400 }}>Pilih akun yang ingin Anda gunakan atau masuk dengan akun baru.</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
                            {savedUsers.length === 0 ? (
                                <p style={{ fontSize: '0.82rem', color: '#5A8BBD', textAlign: 'center', padding: '20px 0' }}>Tidak ada akun lain yang tersimpan.</p>
                            ) : (
                                savedUsers.map(u => {
                                    const isActive = currentUser && u.email === currentUser.email;
                                    return (
                                        <div key={u.id} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            background: isActive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(43, 125, 204, 0.05)',
                                            border: isActive ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(43, 125, 204, 0.10)',
                                            padding: '10px 14px',
                                            borderRadius: '10px',
                                            transition: 'all 0.15s'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    width: '34px',
                                                    height: '34px',
                                                    borderRadius: '50%',
                                                    background: u.provider === 'google' ? '#fff' : 'rgba(43, 125, 204, 0.15)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '1rem',
                                                    flexShrink: 0
                                                }}>
                                                    {u.provider === 'google' ? (
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                                        </svg>
                                                    ) : '👤'}
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                                                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#F2F7FD', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</span>
                                                    <span style={{ fontSize: '0.68rem', color: '#5A8BBD' }}>{u.provider === 'google' ? 'Google Auth' : 'Email/Password'}</span>
                                                </div>
                                            </div>
                                            
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                {isActive ? (
                                                    <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 600, padding: '3px 8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px' }}>Aktif</span>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleSwitchAccount(u)}
                                                        style={{
                                                            background: '#1F6BBD',
                                                            color: '#fff',
                                                            border: 'none',
                                                            padding: '5px 12px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.72rem',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            transition: 'all 0.15s'
                                                        }}
                                                    >Beralih</button>
                                                )}
                                                <button 
                                                    onClick={() => handleRemoveSavedUser(u.email)}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: '#EF4444',
                                                        cursor: 'pointer',
                                                        fontSize: '0.85rem',
                                                        padding: '3px',
                                                        opacity: 0.7,
                                                        transition: 'opacity 0.15s'
                                                    }}
                                                    title="Hapus dari perangkat"
                                                >🗑️</button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button 
                                onClick={handleAddNewAccount}
                                style={{
                                    width: '100%',
                                    padding: '11px',
                                    background: 'rgba(43, 125, 204, 0.08)',
                                    border: '1px solid rgba(43, 125, 204, 0.18)',
                                    borderRadius: '10px',
                                    color: '#C3DAF4',
                                    fontWeight: 600,
                                    fontSize: '0.82rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s'
                                }}
                            >+ Masuk dengan Akun Baru</button>
                            
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                    onClick={handleConfirmLogoutAll}
                                    style={{
                                        flex: 1,
                                        padding: '11px',
                                        background: 'rgba(239, 68, 68, 0.08)',
                                        border: '1px solid rgba(239, 68, 68, 0.15)',
                                        borderRadius: '10px',
                                        color: '#F87171',
                                        fontWeight: 600,
                                        fontSize: '0.82rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s'
                                    }}
                                >Sign Out</button>
                                
                                <button 
                                    onClick={() => setIsSwitchAccountOpen(false)}
                                    style={{
                                        flex: 1,
                                        padding: '11px',
                                        background: 'transparent',
                                        border: '1px solid rgba(43, 125, 204, 0.15)',
                                        borderRadius: '10px',
                                        color: '#5A8BBD',
                                        fontWeight: 600,
                                        fontSize: '0.82rem',
                                        cursor: 'pointer'
                                    }}
                                >Batal</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Edit Info Dashboard Modal */}
            {isEditInfoOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 200000,
                    background: 'rgba(0,5,15,0.85)', backdropFilter: 'blur(16px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }} onClick={() => setIsEditInfoOpen(false)}>
                    <div onClick={e => e.stopPropagation()} style={{
                        background: 'linear-gradient(135deg, rgba(10,18,34,0.98), rgba(6,12,24,0.98))',
                        border: '1px solid rgba(0,210,255,0.15)',
                        borderRadius: '20px',
                        padding: '32px',
                        width: '90%',
                        maxWidth: '460px',
                        boxShadow: '0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,210,255,0.05)',
                        animation: 'slideUp 0.25s cubic-bezier(0.175,0.885,0.32,1.275)',
                    }}>
                        {/* Modal Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(0,82,212,0.2)', border: '1px solid rgba(0,210,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00D2FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>Edit Info Dashboard</h3>
                                <p style={{ fontSize: '0.78rem', color: 'rgba(0,210,255,0.5)', margin: 0, marginTop: '2px' }}>Ubah nama & subtitle yang tampil di header</p>
                            </div>
                            <button onClick={() => setIsEditInfoOpen(false)} style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>

                        {/* Fields */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '28px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'rgba(0,210,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>
                                    Nama Tampilan
                                </label>
                                <input
                                    type="text"
                                    value={editNameTemp}
                                    onChange={e => setEditNameTemp(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && saveEditInfo()}
                                    placeholder="Contoh: Farid Owner"
                                    maxLength={40}
                                    autoFocus
                                    style={{
                                        width: '100%', padding: '12px 16px',
                                        background: 'rgba(0,0,0,0.35)',
                                        border: '1px solid rgba(0,210,255,0.2)',
                                        borderRadius: '10px', outline: 'none',
                                        color: '#FFFFFF', fontSize: '1rem', fontWeight: 700,
                                        boxSizing: 'border-box',
                                        transition: 'border-color 0.2s',
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'rgba(0,210,255,0.5)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(0,210,255,0.2)'}
                                />
                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', marginTop: '5px', textAlign: 'right' }}>{editNameTemp.length}/40</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'rgba(0,210,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>
                                    Subtitle / Deskripsi
                                </label>
                                <textarea
                                    value={editSubtitleTemp}
                                    onChange={e => setEditSubtitleTemp(e.target.value)}
                                    placeholder="Contoh: Kelola akun game dan pantau penjualan."
                                    maxLength={100}
                                    rows={2}
                                    style={{
                                        width: '100%', padding: '12px 16px',
                                        background: 'rgba(0,0,0,0.35)',
                                        border: '1px solid rgba(0,210,255,0.2)',
                                        borderRadius: '10px', outline: 'none',
                                        color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem',
                                        resize: 'none', fontFamily: 'inherit',
                                        boxSizing: 'border-box',
                                        transition: 'border-color 0.2s',
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'rgba(0,210,255,0.5)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(0,210,255,0.2)'}
                                />
                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', marginTop: '5px', textAlign: 'right' }}>{editSubtitleTemp.length}/100</div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div style={{ background: 'rgba(0,82,212,0.08)', border: '1px solid rgba(0,210,255,0.1)', borderRadius: '12px', padding: '14px 16px', marginBottom: '24px' }}>
                            <div style={{ fontSize: '0.68rem', color: 'rgba(0,210,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>Preview</div>
                            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: '3px' }}>Selamat datang kembali,</div>
                            <div style={{ fontSize: '1.15rem', fontWeight: 800, background: 'linear-gradient(135deg,#FFFFFF,#00D2FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '4px' }}>
                                {editNameTemp || 'Farid Owner'} 👋
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>{editSubtitleTemp || 'Kelola akun game dan pantau penjualan dengan mudah.'}</div>
                        </div>

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setIsEditInfoOpen(false)} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.45)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                                Batal
                            </button>
                            <button onClick={saveEditInfo} style={{ flex: 2, padding: '12px', background: 'linear-gradient(135deg, #0052D4, #00D2FF)', border: 'none', borderRadius: '10px', color: '#FFFFFF', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,82,212,0.4)', transition: 'opacity 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                💾 Simpan Perubahan
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Notification Modal */}
            {isNotificationOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 200000,
                    background: 'rgba(0,5,15,0.85)', backdropFilter: 'blur(16px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }} onClick={() => setIsNotificationOpen(false)}>
                    <div onClick={e => e.stopPropagation()} style={{
                        background: 'linear-gradient(135deg, rgba(10,18,34,0.98), rgba(6,12,24,0.98))',
                        border: '1px solid rgba(0,210,255,0.15)',
                        borderRadius: '20px',
                        padding: '32px',
                        width: '90%',
                        maxWidth: '420px',
                        boxShadow: '0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,210,255,0.05)',
                        animation: 'slideUp 0.25s cubic-bezier(0.175,0.885,0.32,1.275)',
                        textAlign: 'center'
                    }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: pendingAccounts > 0 ? 'rgba(0, 210, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: pendingAccounts > 0 ? '0 0 30px rgba(0, 210, 255, 0.2)' : 'none' }}>
                            {pendingAccounts > 0 ? (
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00D2FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                            ) : (
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(255,255,255,0.5)' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            )}
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '12px' }}>
                            {pendingAccounts > 0 ? 'Notifikasi Baru' : 'Semua Aman!'}
                        </h3>
                        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5', marginBottom: '28px' }}>
                            {pendingAccounts > 0 
                                ? `Terdapat ${pendingAccounts} akun dalam status Hold atau Cicilan yang mungkin memerlukan perhatian Anda segera.` 
                                : 'Tidak ada notifikasi baru atau akun yang memerlukan perhatian khusus saat ini.'}
                        </p>
                        <button 
                            onClick={() => setIsNotificationOpen(false)}
                            style={{ width: '100%', background: 'linear-gradient(135deg, #0052D4 0%, #00D2FF 100%)', color: 'white', border: 'none', borderRadius: '12px', padding: '12px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 20px rgba(0, 210, 255, 0.3)', transition: 'transform 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
