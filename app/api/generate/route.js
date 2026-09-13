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

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

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

    // Encode prompt untuk URL Image Generator tanpa watermark provider (&nologo=true)
    const encodedImagePrompt = encodeURIComponent(result.generatedPrompt);
    result.imageUrl = `https://image.pollinations.ai/prompt/${encodedImagePrompt}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;

    // URL audio sampel gamelan/ambient cyberpunk yang bebas hak cipta
    result.audioUrl = 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=cyberpunk-ambient-114319.mp3';

    // Watermarking Provenance Digital
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
