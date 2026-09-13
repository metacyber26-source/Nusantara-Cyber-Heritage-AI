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

    // 1. FILTER ANTI-PORNOGRAFI / VULGARITY
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

    const prompt = `
      Anda adalah AI System untuk "Nusantara Cyber-Heritage".
      Analisis tokoh, flora/fauna, pusaka, atau objek budaya Nusantara: "${character}" dengan tema visual: "${theme}".
      
      PENTING (KEBIJAKAN KONTEN & KESOPANAN):
      - Jika objek adalah manusia/tokoh: HARUS berpakaian sopan dan bermartabat (modest attire, fully clothed).
      - Jika objek adalah fauna/benda/arsitektur: Sajikan dengan detail kebudayaan yang megah sesuai tema.
      
      Hasilkan output JSON (tanpa markdown tambahan):
      {
        "generatedPrompt": "A high detail masterpiece of ${character} rendered in ${theme} aesthetic style, ornate Nusantara batik patterns, vibrant artistic lighting, 8k resolution, SFW, highly detailed heritage masterpiece",
        "traits": [
          {"category": "Gaya Visual", "value": "${theme}"},
          {"category": "Elemen Khas", "value": "Detail Budaya / Motif Khas"},
          {"category": "Aura / Atmosphere", "value": "Suasana Dominan Visual"},
          {"category": "Detail Ornamen", "value": "Ukiran/Batik/Aksen Khas"}
        ],
        "rarityScore": 97.5,
        "storyTitle": "Judul Cerita / Latar Objek",
        "storyScript": "Naskah naratif imersif menceritakan filosofi dan latar belakang ${character} dalam balutan gaya ${theme}.",
        "audioAtmosphere": "Suasana instrumen musik yang cocok (misal: Pentatonik Gamelan Modern, Ambient Solarpunk, Synthwave Cyber)"
      }
    `;

    const response = await model.generateContent(prompt);
    let resultText = response.response.text();
    resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(resultText);

    // Encode Prompt & Tambahkan parameter Keamanan SFW
    const safePrompt = `${result.generatedPrompt}, fully clothed, modest attire, no nudity, sfw`;
    const encodedImagePrompt = encodeURIComponent(safePrompt);
    const randomSeed = Math.floor(Math.random() * 999999);
    
    result.imageUrl = `https://image.pollinations.ai/prompt/${encodedImagePrompt}?width=1024&height=1024&nologo=true&seed=${randomSeed}`;
    result.audioUrl = 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=cyberpunk-ambient-114319.mp3';

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
