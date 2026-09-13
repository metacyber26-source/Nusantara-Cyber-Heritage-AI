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

    const { character, themeEnglish, themeLabelIndo, enableWatermark, creatorCode } = await req.json();

    // 1. FILTER ANTI-PORNOGRAFI / NSFW
    const forbiddenKeywords = ['telanjang', 'nude', 'naked', 'seks', 'porn', 'vulgar', 'bikini', 'topless'];
    const isViolating = forbiddenKeywords.some(word => 
      character.toLowerCase().includes(word) || (themeEnglish && themeEnglish.toLowerCase().includes(word))
    );

    if (isViolating) {
      return Response.json(
        { success: false, error: 'Input terdeteksi melanggar kebijakan konten (Anti-Pornografi/NSFW).' },
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

    // 2. DETEKSI TIPE SUBJEK AGAR OBJEK MATI TIDAK KELUAR MANUSIA
    const promptDetector = `
      Analisis subjek berikut: "${character}".
      Tentukan kategori subjek dari salah satu opsi berikut:
      - "INANIMATE_OBJECT" (benda mati, instrumen musik, keris, candi, alat, kendaraan, produk)
      - "ANIMAL_FAUNA" (burung, komodo, hewan, makhluk mitologi non-manusia)
      - "HUMAN_CHARACTER" (tokoh manusia, raja, pahlawan, dewa berwujud manusia)
      - "LANDSCAPE_SCENERY" (pemandangan, kota, lanskap)

      Respons HANYA dalam format JSON: {"category": "NAMA_KATEGORI"}
    `;

    const categoryResponse = await model.generateContent(promptDetector);
    let categoryText = categoryResponse.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    let categoryObj = { category: 'INANIMATE_OBJECT' };
    try {
      categoryObj = JSON.parse(categoryText);
    } catch(e) {}

    const isObject = categoryObj.category === 'INANIMATE_OBJECT' || categoryObj.category === 'LANDSCAPE_SCENERY';

    // 3. GENERATE PROMPT AI DALAM BAHASA INGGRIS UNTUK GENERATOR GAMBAR
    const promptSystem = `
      Anda adalah AI System Visual Generator.
      Analisis subjek: "${character}" dengan tema visual: "${themeEnglish}".
      Kategori Subjek: ${categoryObj.category}.

      PENTING (KONTROL VISUAL):
      ${isObject 
        ? '- SUBJEK ADALAH BENDA MATI / INSTRUMEN. SANGAT DILARANG menampilkan sosok manusia, wanita, atau orang. Fokuskan visual 100% HANYA pada objek "${character}" secara terperinci di tengah frame.' 
        : '- Subjek adalah tokoh/karakter manusia. HARUS berpakaian sangat sopan, elegan, dan menutup aurat (modest attire, fully clothed).'
      }

      Hasilkan output JSON persis seperti format ini:
      {
        "generatedPrompt": "A high detailed masterpiece featuring ${character}, rendered in ${themeEnglish}, studio lighting, highly detailed surface texture, 8k resolution, SFW ${isObject ? ', STILL LIFE OBJECT ONLY, NO PEOPLE, NO HUMAN, NO WOMAN, NO PERSON' : ''}",
        "traits": [
          {"category": "Gaya Visual", "value": "${themeLabelIndo || 'Klasik/Futuristik'}"},
          {"category": "Kategori Subjek", "value": "${categoryObj.category}"},
          {"category": "Aura / Lighting", "value": "Pencahayaan Artistik Khas"},
          {"category": "Detail Material", "value": "Ornamen / Ukiran Khas"}
        ],
        "rarityScore": 98.2,
        "storyTitle": "Naskah & Latar Belakang Subjek",
        "storyScript": "Penjelasan naratif imersif menceritakan filosofi, keunikan, dan sejarah tentang ${character}.",
        "audioAtmosphere": "Kombinasi efek suara dan musik ambient yang sesuai"
      }
    `;

    const response = await model.generateContent(promptSystem);
    let resultText = response.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(resultText);

    // Prompt Gambar Bahasa Inggris + Tambahan Negative Prompt agar Objek Mati Murni Tergambar Benda
    let safePrompt = `${result.generatedPrompt}`;
    if (isObject) {
      safePrompt += `, isolated object, product photography, no human, no girl, no woman, no face`;
    }
    
    const encodedImagePrompt = encodeURIComponent(safePrompt);
    const randomSeed = Math.floor(Math.random() * 999999);
    
    result.imageUrl = `https://image.pollinations.ai/prompt/${encodedImagePrompt}?width=1024&height=1024&nologo=true&seed=${randomSeed}`;
    result.audioUrl = 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=cyberpunk-ambient-114319.mp3';

    // 4. WATERMARK PROVENANCE & KODE CREATOR
    if (enableWatermark) {
      const timestamp = new Date().toISOString();
      const creatorText = creatorCode ? creatorCode.trim() : 'Ful21';
      const rawPayload = `${character}|${themeEnglish}|${creatorText}|${timestamp}`;
      const digitalSignature = crypto.createHash('sha256').update(rawPayload).digest('hex');

      result.watermark = {
        enabled: true,
        digitalSignature: `NCH-PROV-${digitalSignature.substring(0, 14).toUpperCase()}`,
        fullHash: digitalSignature,
        creatorCode: creatorText,
        timestamp: timestamp
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
