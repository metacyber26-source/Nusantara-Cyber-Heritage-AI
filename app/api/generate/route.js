import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { success: false, error: 'GEMINI_API_KEY belum dikonfigurasi di Vercel Environment Variables.' },
        { status: 500 }
      );
    }

    const { character, theme, enableWatermark } = await req.json();

    // 1. FILTER ANTI-PORNOGRAFI / INPUT VALIDATION
    const forbiddenKeywords = ['telanjang', 'nude', 'naked', 'seks', 'porn', 'vulgar', 'bikini', 'topless'];
    const isViolating = forbiddenKeywords.some(word => 
      character.toLowerCase().includes(word) || theme.toLowerCase().includes(word)
    );

    if (isViolating) {
      return Response.json(
        { success: false, error: 'Input terdeteksi melanggar kebijakan konten budaya (Anti-Pornografi/NSFW).' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    // Prompt Gemini dengan proteksi Anti-Pornografi & Kesopanan Budaya
    const prompt = `
      Anda adalah AI System untuk "Nusantara Cyber-Heritage".
      Analisis tokoh/objek budaya Nusantara: "${character}" dengan tema: "${theme}".
      
      PENTING (KEBIJAKAN KONTEN & ETIKA BUDAYA): 
      - Karakter HARUS berpakaian sopan, bermartabat, dan penuh keluhuran budaya (modest attire, fully clothed, ornate royal cyber armor/batik robes).
      - DILARANG keras menghasilkan deskripsi visual yang eksplisit, minim busana, topless, atau vulgar.
      
      Hasilkan output dalam format JSON persis seperti berikut (tanpa markdown tambahan):
      {
        "generatedPrompt": "A majestic and dignified cinematic portrait of ${character} in ${theme} style, wearing fully-covered ornate batik cyber armor and royal crown, elegant modest silk draping, highly detailed, 8k resolution, SFW, respectful heritage depiction, sci-fi cyber lighting",
        "traits": [
          {"category": "Background", "value": "Mitologi/Cyber Setting Langka"},
          {"category": "Aura", "value": "Aura Khas Tokoh"},
          {"category": "Weapon/Item", "value": "Senjata/Pusaka Khas"},
          {"category": "Outfit", "value": "Busana/Batik/Zirah Khas Tertutup Sopan"}
        ],
        "rarityScore": 98.8,
        "storyTitle": "Judul Cerita Legenda",
        "storyScript": "Naskah naratif imersif menceritakan tentang ${character} dengan latar belakang ${theme}.",
        "audioAtmosphere": "Kombinasi efek suara dan musik latar (contoh: Sound Gamelan Futuristik, Ambient Synthesizer, Suara Angin Malam)"
      }
    `;

    const response = await model.generateContent(prompt);
    let resultText = response.response.text();
    resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(resultText);

    // 2. ENCODE PROMPT GAMBAR & PARAMETER ANTI-PORNOGRAFI
    const safePrompt = `${result.generatedPrompt}, fully clothed, modest attire, no nudity, sfw`;
    const encodedImagePrompt = encodeURIComponent(safePrompt);
    
    // Seed unik agar gambar tergenerasi ulang tanpa cache lama
    const randomSeed = Math.floor(Math.random() * 999999);
    result.imageUrl = `https://image.pollinations.ai/prompt/${encodedImagePrompt}?width=1024&height=1024&nologo=true&seed=${randomSeed}`;

    // Audio Sampel
    result.audioUrl = 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=cyberpunk-ambient-114319.mp3';

    // Digital Watermark Provenance
    if (enableWatermark) {
      const timestamp = new Date().toISOString();
      const rawPayload = `${character}|${theme}|${result.rarityScore}|${timestamp}|NusantaraCyberHeritageAI`;
      const digitalSignature = crypto.createHash('sha256').update(rawPayload).digest('hex');

      result.watermark = {
        enabled: true,
        digitalSignature: `NCH-PROV-${digitalSignature.substring(0, 16).toUpperCase()}`,
        fullHash: digitalSignature,
        timestamp: timestamp,
        creator: 'Ful21 - Nusantara Cyber-Heritage',
        steganographyNote: 'Metadata provenance terenkripsi secara kriptografis.'
      };
    } else {
      result.watermark = { enabled: false };
    }

    return Response.json({ success: true, data: result });
  } catch (error) {
    console.error('Error Generating Content:', error);
    return Response.json(
      { success: false, error: error.message || 'Gagal memproses AI' },
      { status: 500 }
    );
  }
}
