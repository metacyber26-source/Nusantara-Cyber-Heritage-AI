'use client';
import { useState } from 'react';

export default function Home() {
  const [character, setCharacter] = useState('Dewi Sri');
  const [theme, setTheme] = useState('Culture of the Future');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character, theme }),
      });
      const data = await res.json();
      if (data.success) setResult(data.data);
    } catch (err) {
      alert('Gagal memproses data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Nusantara Cyber-Heritage AI</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Tokoh / Objek Budaya:</label>
        <input 
          type="text" 
          value={character} 
          onChange={(e) => setCharacter(e.target.value)}
          style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '8px', border: '1px solid #ccc' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Pilih Tema:</label>
        <select 
          value={theme} 
          onChange={(e) => setTheme(e.target.value)}
          style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '8px', border: '1px solid #ccc' }}
        >
          <option value="Culture of the Future">Culture of the Future (Cyberpunk)</option>
          <option value="Pelestarian Cultural Classic">Pelestarian Cultural Classic</option>
        </select>
      </div>

      <button 
        onClick={handleGenerate} 
        disabled={loading}
        style={{ width: '100%', padding: '12px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}
      >
        {loading ? 'Memproses AI...' : 'Generate Asset & Rarity (98+)'}
      </button>

      {result && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '8px', background: '#f9f9f9' }}>
          <h3 style={{ color: '#2e7d32' }}>Rarity Score: {result.rarityScore} / 100</h3>
          
          <h4>Prompt Visual AI:</h4>
          <p style={{ fontSize: '12px', background: '#eee', padding: '8px', borderRadius: '4px' }}>{result.generatedPrompt}</p>

          <h4>Mythic Traits:</h4>
          <ul>
            {result.traits.map((t, idx) => (
              <li key={idx}><strong>{t.category}:</strong> {t.value}</li>
            ))}
          </ul>

          <h4>{result.storyTitle}</h4>
          <p>{result.storyScript}</p>

          <p><em>🎵 Audio Background: {result.audioAtmosphere}</em></p>
        </div>
      )}
    </main>
  );
}
