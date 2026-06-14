'use client';
import React, { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("APP CRASH CAUGHT BY NEXTJS:", error);
  }, [error]);

  return (
    <div style={{ padding: '20px', background: '#111', color: '#ff4444', height: '100vh', overflow: 'auto', fontFamily: 'monospace' }}>
      <h2>Aplikasi Crash 😭</h2>
      <p>Tolong screenshot layar ini dan kirimkan ke developer:</p>
      <hr style={{ borderColor: '#333', margin: '20px 0' }} />
      <p style={{ fontSize: '14px', fontWeight: 'bold' }}>Message: {error?.message}</p>
      <pre style={{ fontSize: '11px', whiteSpace: 'pre-wrap', color: '#aaa', background: '#222', padding: '10px', borderRadius: '4px' }}>
        {error?.stack}
      </pre>
      <button onClick={() => reset()} style={{ padding: '10px', background: '#ff4444', color: '#fff', border: 'none', borderRadius: '4px', marginTop: '20px', cursor: 'pointer' }}>
        Coba Lagi (Reset)
      </button>
    </div>
  );
}
