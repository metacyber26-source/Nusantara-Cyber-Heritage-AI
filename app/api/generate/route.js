import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { success: false, error: 'GEMINI_API_KEY belum dikonfigurasi di Vercel Environment Variables.' },
        { status: 500 }
      );
    }

    const { character, theme } = await req.json();

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Gunakan model gemini-1.5-flash
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
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
        "rarityScore": 98.7,
        "storyTitle": "Judul Cerita Legenda",
        "storyScript": "Naskah naratif imersif 2 paragraf menceritakan tentang ${character} dengan latar belakang ${theme}.",
        "audioAtmosphere": "Kombinasi efek suara dan musik latar (contoh: Sound Gamelan Futuristik, Ambient Synthesizer, Suara Angin Malam)"
      }
    `;

    const response = await model.generateContent(prompt);
    let resultText = response.response.text();
    
    // Bersihkan format markdown jika AI menyisipkan ```json
    resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();

    const result = JSON.parse(resultText);

    return Response.json({ success: true, data: result });
  } catch (error) {
    console.error('Error Generating Content:', error);
    return Response.json(
      { success: false, error: error.message || 'Gagal memproses AI' },
      { status: 500 }
    );
  }
}
