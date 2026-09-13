import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req) {
  try {
    const { character, theme } = await req.json();

    const systemInstruction = `
      Anda adalah AI System untuk "Nusantara Cyber-Heritage".
      Tugas Anda adalah memproses tokoh budaya Nusantara dan menghasilkan metadata NFT langka.
      Output HARUS berupa JSON valid tanpa format markdown tambahan.
    `;

    const prompt = `
      Analisis tokoh: "${character}" dengan tema: "${theme}".
      
      Hasilkan JSON dengan format persis seperti ini:
      {
        "generatedPrompt": "Prompt visual ultra-detail bahasa Inggris untuk image generator (cyberpunk/futuristic/classic Nusantara, 8k resolution, cinematic lighting, mythic assets)",
        "traits": [
          {"category": "Background", "value": "nama trait"},
          {"category": "Aura", "value": "nama trait"},
          {"category": "Weapon/Item", "value": "nama trait"},
          {"category": "Outfit", "value": "nama trait"}
        ],
        "rarityScore": 98.5,
        "storyTitle": "Judul Cerita",
        "storyScript": "Naskah pendek naratif imersif tentang tokoh ini (2 paragraf)",
        "audioAtmosphere": "Deskripsi efek suara dan musik latar (misal: Gamelan Futuristik + Ambient Synth)"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const result = JSON.parse(response.text);
    return Response.json({ success: true, data: result });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

