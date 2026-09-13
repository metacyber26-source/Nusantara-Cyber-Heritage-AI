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
    const genAI = new GoogleGenerativeAI(apiKey);

    // Menggunakan fallback model yang tersedia di Gemini API v1beta
    let modelName = 'gemini-2.5-flash';
    let model;
    
    try {
      model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });
    } catch (e) {
      // Fallback jika versi 2.5 belum ter-resolve
      model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });
    }

    const prompt = `
      Anda adalah AI System untuk "Nusantara Cyber-Heritage".
      Analisis tokoh/objek budaya Nusantara: "${character}" dengan tema: "${theme}".
      
      Hasilkan output dalam format JSON persis seperti berikut (tanpa markdown tambahan):
      {
        "generatedPrompt": "Ultra detailed English image prompt for ${character} in ${theme} style, 8k resolution, cinematic lighting, mythic assets, futuristic cyber-heritage fusion, highly intricate details",
        "traits": [
          {"category": "Background", "value": "Mitologi/Cyber Setting Langka"},
          {"category": "Aura", "value": "Aura Khas Tokoh"},
          {"category": "Weapon/Item", "value": "Senjata/Pusaka Khas"},
          {"category": "Outfit", "value": "Busana/Batik/Zirah Khas"}
        ],
        "rarityScore": 98.8,
        "storyTitle": "Judul Cerita Legenda",
        "storyScript": "Naskah naratif imersif 2 paragraf menceritakan tentang ${character} dengan latar belakang ${theme}.",
        "audioAtmosphere": "Kombinasi efek suara dan musik latar (contoh: Sound Gamelan Futuristik, Ambient Synthesizer, Suara Angin Malam)"
      }
    `;

    const response = await model.generateContent(prompt);
    let resultText = response.response.text();
    
    resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(resultText);

    // Fitur Watermarking Canggih (Digital Provenance Hash)
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
        steganographyNote: 'Metadata provenance terenkripsi secara kriptografis ke dalam metadata aset digital.'
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
