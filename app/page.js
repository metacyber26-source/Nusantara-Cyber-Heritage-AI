'use client';
import { useState } from 'react';

// Options Tema dalam Bahasa Indonesia
const THEME_OPTIONS = [
  { 
    label: 'Klasik Autentik & Ukiran Tradisional (Pelestarian Budaya)', 
    value: 'Authentic Classic Heritage style, ancient stone relief, traditional wood carving, museum lighting, detailed craftsmanship' 
  },
  { 
    label: 'Masa Depan & Siber (Cyberpunk / Neo-Nusantara)', 
    value: 'Futuristic Cyberpunk style, neon lights, glowing circuits, holographic accents, hyper-tech sci-fi aesthetic' 
  },
  { 
    label: 'Alam Futuristik & Ekologis (Solarpunk)', 
    value: 'Solarpunk Eco-Heritage style, lush greenery, bioluminescent bamboo, clean renewable tech aesthetic, natural sun rays' 
  },
  { 
    label: 'Mesin Klasik & Era Uap (Steampunk Vintage)', 
    value: 'Steampunk Vintage Mechanical style, brass gears, copper pipes, glowing vacuum tubes, Victorian era atmosphere' 
  },
  { 
    label: 'Mitos Megah & Astral (High-Fantasy)', 
    value: 'High-Fantasy Mythic style, celestial glowing aura, divine astral background, epic cinematic lighting, magical particles' 
  },
  { 
    label: 'Seni Pop Modern & Motif Batik (Batik Pop-Art)', 
    value: 'Batik Pop-Art Modern style, vibrant contrast colors, stylish graphic vector aesthetics, modern urban culture' 
  },
  { 
    label: 'Garis Minimalis & Elegan (Minimalist Line Art)', 
    value: 'Minimalist Line Art style, clean aesthetic vector lines, subtle luxury color palette, elegant simple design' 
  },
  { 
    label: 'Gaya Anime & Siber Modern (Anime Cyber)', 
    value: 'Modern Cyber Anime art style, crisp anime illustration shading, vibrant dynamic atmosphere, high detail digital art' 
  }
];

const PRESET_SUBJECTS = [
  'Keris Mpu Gandring',
  'Angklung Bambu Gold',
  'Burung Merak',
  'Candi Borobudur',
  'Ratu Shima',
  'Gatotkaca',
  'Mobil Spor Cyberpunk',
  'Robot Kucing AI',
  'Reog Ponorogo',
  'Naga Maskot Futuristik'
];

export default function Home() {
  const [character, setCharacter] = useState('Keris Mpu Gandring');
  const [themeIndex, setThemeIndex] = useState(0);
  const [enableWatermark, setEnableWatermark] = useState(true);
  const [creatorCode, setCreatorCode] = useState('Ful21');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    setErrorMsg('');

    const selectedTheme = THEME_OPTIONS[themeIndex];

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          character, 
          themeEnglish: selectedTheme.value,
          themeLabelIndo: selectedTheme.label,
          enableWatermark,
          creatorCode
        }),
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

  const downloadImage = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${filename}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      window.open(url, '_blank');
    }
  };

  return (
    <main style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', maxWidth: '650px', margin: '0 auto', minHeight: '100vh', boxSizing: 'border-box' }}>
      <h1 style={{ textAlign: 'center', fontSize: '24px', marginBottom: '20px', color: '#38bdf8' }}>
        Nusantara Cyber-Heritage AI
      </h1>
      
      {/* Input Subjek Visual */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
          Subjek / Objek Visual (Bebas):
        </label>
        <input 
          type="text" 
          value={character} 
          onChange={(e) => setCharacter(e.target.value)}
          placeholder="Masukkan tokoh, senjata, benda mati, atau konsep bebas..."
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '15px', boxSizing: 'border-box' }}
        />
        
        {/* Preset Cepat */}
        <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8', width: '100%', marginBottom: '2px' }}>💡 Pilihan Cepat Subjek Populer:</span>
          {PRESET_SUBJECTS.map((obj, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCharacter(obj)}
              style={{
                backgroundColor: character === obj ? '#0284c7' : '#0f172a',
                color: character === obj ? '#fff' : '#cbd5e1',
                border: '1px solid #334155',
                borderRadius: '16px',
                padding: '4px 10px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {obj}
            </button>
          ))}
        </div>
      </div>

      {/* Pilihan Tema Visual */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Pilih Tema Seni & Gaya Visual:</label>
        <select 
          value={themeIndex} 
          onChange={(e) => setThemeIndex(Number(e.target.value))}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '15px', boxSizing: 'border-box' }}
        >
          {THEME_OPTIONS.map((item, index) => (
            <option key={index} value={index}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {/* Watermark & Creator ID */}
      <div style={{ marginBottom: '20px', padding: '14px', backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: enableWatermark ? '10px' : '0' }}>
          <div>
            <strong style={{ display: 'block', fontSize: '14px', color: '#f8fafc' }}>🛡️ Advanced Watermark & Hash Provenance</strong>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Sematkan verifikasi digital hash & identitas creator</span>
          </div>
          <input 
            type="checkbox" 
            checked={enableWatermark} 
            onChange={(e) => setEnableWatermark(e.target.checked)}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
        </div>

        {enableWatermark && (
          <div style={{ borderTop: '1px solid #334155', paddingTop: '10px', marginTop: '10px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px', fontWeight: 'bold' }}>
              Kode Creator (Sematkan ID / Nama Pembuat):
            </label>
            <input 
              type="text" 
              value={creatorCode} 
              onChange={(e) => setCreatorCode(e.target.value)}
              placeholder="Contoh: Ful21"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#38bdf8', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
        )}
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
        {loading ? '⏳ Memproses AI Generator...' : 'Generate Asset & Rarity (98+)'}
      </button>

      {/* Tampilan Error yang Lebih Rapi */}
      {errorMsg && (
        <div style={{ marginTop: '20px', padding: '15px', borderRadius: '8px', backgroundColor: '#450a0a', color: '#fca5a5', border: '1px solid #991b1b', fontSize: '14px', lineHeight: '1.5' }}>
          ⚠️ <strong>Pemberitahuan:</strong> {errorMsg}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '24px', padding: '20px', borderRadius: '12px', backgroundColor: '#1e293b', border: '1px solid #38bdf8', boxSizing: 'border-box' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#38bdf8' }}>Mythic Visual Asset</h2>
            <span style={{ backgroundColor: '#15803d', color: '#bbf7d0', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px' }}>
              Skor: {result.rarityScore} / 100
            </span>
          </div>

          <div style={{ position: 'relative', width: '100%', height: '380px', borderRadius: '10px', overflow: 'hidden', border: '2px solid #0284c7', marginBottom: '12px', backgroundColor: '#0f172a' }}>
            <img 
              src={result.imageUrl} 
              alt={character}
              style={{ 
                width: '104%', 
                height: '105%', 
                marginTop: '-2%',
                marginLeft: '-2%',
                objectFit: 'cover' 
              }} 
            />

            {result.watermark?.enabled && (
              <div style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                backgroundColor: 'rgba(15, 23, 42, 0.92)',
                backdropFilter: 'blur(6px)',
                border: '1px solid #38bdf8',
                borderRadius: '6px',
                padding: '6px 10px',
                color: '#38bdf8',
                fontSize: '11px',
                fontWeight: 'bold',
                boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
                zIndex: 10,
                textAlign: 'right'
              }}>
                <div>🛡️ {result.watermark.digitalSignature}</div>
                {result.watermark.creatorCode && (
                  <div style={{ color: '#f59e0b', fontSize: '10px', marginTop: '2px' }}>
                    BY: {result.watermark.creatorCode.toUpperCase()}
                  </div>
                )}
              </div>
            )}
          </div>

          <button 
            onClick={() => downloadImage(result.imageUrl, `CyberHeritage-${character.replace(/\s+/g, '_')}`)}
            style={{ 
              width: '100%', 
              padding: '12px', 
              backgroundColor: '#059669', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              fontSize: '15px',
              cursor: 'pointer',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            📥 Download Gambar HD
          </button>
          
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

          <div style={{ marginTop: '15px', padding: '12px', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '13px', color: '#f59e0b', marginBottom: '8px' }}>
              🎵 <strong>Suasana Audio:</strong> {result.audioAtmosphere}
            </div>
            
            <audio controls style={{ width: '100%', height: '36px', marginBottom: '8px' }} src={result.audioUrl}>
              Browser Anda tidak mendukung elemen audio.
            </audio>
          </div>

          {result.watermark?.enabled && (
            <div style={{ marginTop: '15px', padding: '12px', backgroundColor: '#0284c715', border: '1px solid #0284c7', borderRadius: '8px', fontSize: '12px', color: '#e0f2fe' }}>
              <div style={{ fontWeight: 'bold', color: '#38bdf8', marginBottom: '4px' }}>
                🛡️ Digital Provenance Hash Verified
              </div>
              <div><strong>Signature ID:</strong> {result.watermark.digitalSignature}</div>
              {result.watermark.creatorCode && <div><strong>Creator ID:</strong> {result.watermark.creatorCode}</div>}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
