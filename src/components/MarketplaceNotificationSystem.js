'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, TrendingUp, Star, Zap, Clock, User, DollarSign, X, Flame, ArrowUpRight } from 'lucide-react';
import { supabase } from '../utils/supabase';

export default function MarketplaceNotificationSystem({ accounts = [], sales = [], formatRupiah }) {
  const [notifications, setNotifications] = useState([]);
  const [isPaused, setIsPaused] = useState(false);

  // Generate notification from sale
  const createSaleNotification = useCallback((sale) => {
    return {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type: 'sale',
      title: 'Akun Terjual!',
      message: `${sale.nama_akun || sale.nama || 'Akun'} — ${sale.game || 'Game'}`,
      amount: Number(sale.nominal || sale.sellPrice || 0),
      time: Date.now(),
      icon: ShoppingBag,
      color: '#10B981'
    };
  }, []);

  // Generate notification from new listing
  const createListingNotification = useCallback((account) => {
    return {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type: 'listing',
      title: 'Listing Baru!',
      message: `${account.nama_akun || account.nama || 'Akun'} — ${account.game || 'Game'}`,
      amount: Number(account.harga || 0),
      time: Date.now(),
      icon: Star,
      color: '#8B5CF6'
    };
  }, []);

  // Generate notification from trending
  const createTrendingNotification = useCallback((game) => {
    return {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type: 'trending',
      title: 'Sedang Trending!',
      message: `${game || 'Game'} — Permintaan tinggi`,
      amount: 0,
      time: Date.now(),
      icon: Flame,
      color: '#EC4899'
    };
  }, []);

  // Simulate periodic notifications from existing data
  useEffect(() => {
    if (isPaused || notifications.length >= 5) return;

    const generateNotification = () => {
      const sold = accounts.filter(a => a.status === 'terjual' && a.sellDate);
      const available = accounts.filter(a => a.status !== 'terjual');
      const games = [...new Set(accounts.map(a => a.game).filter(Boolean))];

      const rand = Math.random();
      let notification;

      if (rand < 0.5 && sold.length > 0) {
        const randomSale = sold[Math.floor(Math.random() * sold.length)];
        notification = createSaleNotification(randomSale);
      } else if (rand < 0.8 && available.length > 0) {
        const randomListing = available[Math.floor(Math.random() * available.length)];
        notification = createListingNotification(randomListing);
      } else if (games.length > 0) {
        const randomGame = games[Math.floor(Math.random() * games.length)];
        notification = createTrendingNotification(randomGame);
      }

      if (notification) {
        setNotifications(prev => [notification, ...prev].slice(0, 5));
      }
    };

    // Initial notification after delay
    const initialTimer = setTimeout(generateNotification, 3000);

    // Periodic notifications
    const interval = setInterval(generateNotification, 15000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [accounts, isPaused, notifications.length, createSaleNotification, createListingNotification, createTrendingNotification]);

  // Real-time subscription for new sales
  useEffect(() => {
    const channel = supabase
      .channel('marketplace-notifications')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'penjualan' },
        (payload) => {
          const newSale = payload.new;
          const notification = createSaleNotification(newSale);
          setNotifications(prev => [notification, ...prev].slice(0, 5));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [createSaleNotification]);

  // Auto-dismiss notifications
  useEffect(() => {
    if (notifications.length === 0) return;
    const timer = setTimeout(() => {
      setNotifications(prev => prev.slice(0, -1));
    }, 6000);
    return () => clearTimeout(timer);
  }, [notifications]);

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="marketplace-notification-system">
      {notifications.map((notif, index) => {
        const Icon = notif.icon;
        return (
          <div
            key={notif.id}
            className={`notification-toast ${index === 0 ? 'newest' : ''}`}
            style={{ '--notif-color': notif.color }}
          >
            <div className="notification-icon" style={{ background: `${notif.color}20` }}>
              <Icon size={16} color={notif.color} />
            </div>
            <div className="notification-content">
              <div className="notification-title">{notif.title}</div>
              <div className="notification-message">{notif.message}</div>
              {notif.amount > 0 && (
                <div className="notification-amount">{formatRupiah(notif.amount)}</div>
              )}
            </div>
            <button className="notification-dismiss" onClick={() => dismissNotification(notif.id)}>
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
