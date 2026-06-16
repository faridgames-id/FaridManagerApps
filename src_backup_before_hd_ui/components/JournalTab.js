'use client';
import React, { useState } from 'react';

export default function JournalTab({
    jurnalBisnis = [],
    onAddJournal,
    onDeleteJournal
}) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState('umum');
    const [content, setContent] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!date || !content.trim()) {
            alert('⚠️ Harap isi tanggal dan isi catatan!');
            return;
        }

        const newJurnal = {
            date: date,
            category: category,
            content: content.trim()
        };

        onAddJournal(newJurnal);
        setContent('');
        alert('✅ Jurnal berhasil disimpan!');
    };

    const catConfig = {
        'umum': { icon: '📝', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
        'target': { icon: '🎯', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
        'masalah': { icon: '⚠️', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
        'pencapaian': { icon: '🏆', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' }
    };

    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus jurnal ini?')) {
            onDeleteJournal(id);
        }
    };

    return (
        <div id="jurnal" className="tab-content active" style={{ display: 'block' }}>
            <div className="content">
                {/* Form Tambah Jurnal */}
                <div className="form-section" style={{ marginBottom: '30px' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.8rem', filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.6))' }}>📝</span>
                        Tambah Catatan Jurnal Bisnis
                    </h2>
                    <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                        <div className="form-row">
                            <div className="form-group" style={{ flex: '1 1 200px' }}>
                                <label style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>Tanggal Catatan</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '14px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'var(--text-primary)' }}
                                />
                            </div>
                            <div className="form-group" style={{ flex: '1 1 200px' }}>
                                <label style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>Kategori</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    style={{ width: '100%', padding: '14px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'var(--text-primary)' }}
                                >
                                    <option value="umum">📝 Umum / Catatan Harian</option>
                                    <option value="target">🎯 Rencana / Target Penjualan</option>
                                    <option value="masalah">⚠️ Hambatan / Masalah</option>
                                    <option value="pencapaian">🏆 Pencapaian / Profit Goal</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: '15px' }}>
                            <label style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>Catatan</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows="4"
                                placeholder="Tulis catatan, evaluasi, atau target bisnismu di sini..."
                                required
                                style={{ width: '100%', padding: '14px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'var(--text-primary)', fontFamily: 'inherit', resize: 'vertical' }}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ marginTop: "15px" }}>
                            <span style={{ fontSize: '1.3rem', marginRight: '5px' }}>💾</span> SIMPAN JURNAL
                        </button>
                    </form>
                </div>

                {/* Timeline Section */}
                <div className="form-section">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                        <span style={{ color: '#3b82f6', fontSize: '1.6rem' }}>⏳</span> Timeline Jurnal Bisnis
                    </h2>
                    
                    {jurnalBisnis.length === 0 ? (
                        <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px 20px', fontStyle: 'italic', background: 'var(--c-50)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.05)' }}>
                            Belum ada catatan jurnal bisnis. Mulai tulis perjalanan bisnismu!
                        </div>
                    ) : (
                        <div style={{ position: 'relative', paddingLeft: '20px', borderLeft: '2px solid rgba(59, 130, 246, 0.2)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {jurnalBisnis.map((j) => {
                                const conf = catConfig[j.category] || catConfig['umum'];
                                const dateObj = new Date(j.date);
                                const formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

                                return (
                                    <div
                                        key={j.id}
                                        className="journal-card"
                                        style={{
                                            position: 'relative',
                                            padding: '20px',
                                            background: 'var(--bg-surface)',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            borderRadius: '12px',
                                            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                                        }}
                                    >
                                        {/* Timeline Dot */}
                                        <div
                                            style={{
                                                position: 'absolute',
                                                left: -29,
                                                top: '25px',
                                                width: '16px',
                                                height: '16px',
                                                borderRadius: '50%',
                                                background: conf.color,
                                                boxShadow: `0 0 10px ${conf.color}, 0 0 0 4px rgba(15, 23, 42, 1)`
                                            }}
                                        />

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: conf.bg, display: 'flex', alignItems: 'center', justify: 'center', fontSize: '1.2rem' }}>
                                                    {conf.icon}
                                                </div>
                                                <div>
                                                    <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem', textTransform: 'capitalize' }}>
                                                        {j.category}
                                                    </div>
                                                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '2px' }}>
                                                        📅 {formattedDate}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(j.id)}
                                                style={{
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    color: '#ef4444',
                                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                                    padding: '6px 12px',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseOver={(e) => { e.target.style.background = '#ef4444'; e.target.style.color = '#fff'; }}
                                                onMouseOut={(e) => { e.target.style.background = 'rgba(239, 68, 68, 0.1)'; e.target.style.color = '#ef4444'; }}
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                        <div style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginTop: '15px', paddingLeft: '50px' }}>
                                            {j.content}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
