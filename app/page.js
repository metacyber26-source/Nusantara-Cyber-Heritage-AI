'use client';
import { useState } from 'react';

export default function Home() {
  const [character, setCharacter] = useState('Ratu Shima');
  const [theme, setTheme] = useState('Culture of the Future (Cyberpunk)');
  const [enableWatermark, setEnableWatermark] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    setErrorMsg('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character, theme, enableWatermark }),
      });
      const data = await res.json();
      
      if (data.success) {
        setResult(data.data);
      } else {
        setErrorMsg(data.error || 'Terjadi kesalahan pada sistem AI.');
      }
    } catch (err) {
      setErrorMsg('Gagal terhubung ke server. Periksa koneksi internet Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', maxWidth: '650px', margin: '0 auto', minHeight: '100vh', boxSizing: 'border-box' }}>
      <h1 style={{ textAlign: 'center', fontSize: '24px', marginBottom: '20px', color: '#38bdf8' }}>
        Nusantara Cyber-Heritage AI
      </h1>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Tokoh / Objek Budaya:</label>
        <input 
          type="text" 
          value={character} 
          onChange={(e) => setCharacter(e.target.value)}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '16px', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Pilih Tema:</label>
        <select 
          value={theme} 
          onChange={(e) => setTheme(e.target.value)}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '16px', boxSizing: 'border-box' }}
        >
          <option value="Culture of the Future (Cyberpunk)">Culture of the Future (Cyberpunk)</option>
          <option value="Pelestarian Cultural Classic">Pelestarian Cultural Classic</option>
        </select>
      </div>

      <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <strong style={{ display: 'block', fontSize: '14px', color: '#f8fafc' }}>🛡️ Advanced Provenance Watermark</strong>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Sematkan tanda tangan digital & hash autentisitas</span>
        </div>
        <input 
          type="checkbox" 
          checked={enableWatermark} 
          onChange={(e) => setEnableWatermark(e.target.checked)}
          style={{ width: '20px', height: '20px', cursor: 'pointer' }}
        />
      </div>

      <button 
        onClick={handleGenerate} 
        disabled={loading}
        style={{ 
          width: '100%', 
          padding: '14px', 
          background: loading ? '#475569' : '#0284c7', 
          color: '#fff', 
          border: 'none', 
          borderRadius: '8px', 
          fontWeight: 'bold', 
          fontSize: '16px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? '⏳ Memproses Visual & Gemini AI...' : 'Generate Asset & Rarity (98+)'}
      </button>

      {errorMsg && (
        <div style={{ marginTop: '20px', padding: '15px', borderRadius: '8px', backgroundColor: '#7f1d1d', color: '#fecaca', border: '1px solid #ef4444' }}>
          <strong>Error:</strong> {errorMsg}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '24px', padding: '20px', borderRadius: '12px', backgroundColor: '#1e293b', border: '1px solid #38bdf8', boxSizing: 'border-box' }}>
          
          {/* Header Card */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#38bdf8' }}>Mythic Visual Asset</h2>
            <span style={{ backgroundColor: '#15803d', color: '#bbf7d0', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px' }}>
              Skor: {result.rarityScore} / 100
            </span>
          </div>

          {/* DISPLAY GAMBAR SELEBAR LAYAR CARD PORTOFOLIO */}
          <div style={{ position: 'relative', width: '100%', borderRadius: '10px', overflow: 'hidden', border: '2px solid #0284c7', marginBottom: '20px', backgroundColor: '#0f172a' }}>
            <img 
              src={result.imageUrl} 
              alt={character}
              style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} 
            />
            {/* Overlay Provenance Watermark pada Gambar */}
            {result.watermark?.enabled && (
              <div style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(4px)',
                border: '1px solid #38bdf8',
                borderRadius: '6px',
                padding: '6px 10px',
                color: '#38bdf8',
                fontSize: '11px',
                fontWeight: 'bold',
                boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
              }}>
                🛡️ {result.watermark.digitalSignature}
              </div>
            )}
          </div>
          
          <h4 style={{ color: '#94a3b8', marginBottom: '5px' }}>Prompt Visual AI:</h4>
          <p style={{ fontSize: '13px', backgroundColor: '#0f172a', padding: '10px', borderRadius: '6px', border: '1px solid #334155', color: '#cbd5e1', wordBreak: 'break-word' }}>
            {result.generatedPrompt}
          </p>

          <h4 style={{ color: '#94a3b8', marginBottom: '5px' }}>Mythic Traits:</h4>
          <ul style={{ paddingLeft: '20px', margin: '0 0 15px 0' }}>
            {result.traits?.map((t, idx) => (
              <li key={idx} style={{ marginBottom: '4px' }}>
                <strong style={{ color: '#f1f5f9' }}>{t.category}:</strong> <span style={{ color: '#38bdf8' }}>{t.value}</span>
              </li>
            ))}
          </ul>

          <h3 style={{ color: '#f8fafc', borderTop: '1px solid #334155', paddingTop: '15px', marginTop: '15px' }}>{result.storyTitle}</h3>
          <p style={{ lineHeight: '1.6', color: '#cbd5e1', fontSize: '14px' }}>{result.storyScript}</p>

          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#0f172a', borderRadius: '6px', fontSize: '13px', color: '#f59e0b' }}>
            🎵 <strong>Suasana Audio:</strong> {result.audioAtmosphere}
          </div>

          {result.watermark?.enabled && (
            <div style={{ marginTop: '15px', padding: '12px', backgroundColor: '#0284c715', border: '1px solid #0284c7', borderRadius: '8px', fontSize: '12px', color: '#e0f2fe' }}>
              <div style={{ fontWeight: 'bold', color: '#38bdf8', marginBottom: '4px' }}>🛡️ Digital Watermark Provenance Verified</div>
              <div><strong>Signature:</strong> {result.watermark.digitalSignature}</div>
              <div style={{ fontSize: '10px', color: '#94a3b8', wordBreak: 'break-all', marginTop: '4px' }}><strong>SHA256 Hash:</strong> {result.watermark.fullHash}</div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
