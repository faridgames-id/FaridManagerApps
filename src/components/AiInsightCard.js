import React from 'react';

export default function AiInsightCard({ title, insight }) {
    return (
        <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--glow-strong)';
            e.currentTarget.style.border = '1px solid var(--border-focus)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.4)';
            e.currentTarget.style.border = '1px solid var(--border-subtle)';
        }}
        >
            {/* Glowing Particle Background Effect */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(25,25,112,0.15) 0%, transparent 60%)',
                animation: 'spin 20s linear infinite',
                pointerEvents: 'none',
                zIndex: 0
            }}></div>

            <div style={{
                background: 'var(--bg-body)',
                border: '1px solid rgba(25,25,112,0.4)',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
                boxShadow: 'var(--glow-subtle)'
            }}>
                <span style={{ fontSize: '1.2rem' }}>✨</span>
            </div>

            <div style={{ zIndex: 1, flex: 1 }}>
                <h4 style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: 700, 
                    color: 'var(--text-secondary)', 
                    textTransform: 'uppercase', 
                    letterSpacing: '1px',
                    marginBottom: '4px'
                }}>
                    {title || "Anti-Gravity AI Insight"}
                </h4>
                <p style={{ 
                    fontSize: '0.95rem', 
                    fontWeight: 400, 
                    color: 'var(--text-primary)', 
                    lineHeight: '1.5'
                }}>
                    {insight}
                </p>
            </div>
        </div>
    );
}
