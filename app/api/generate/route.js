import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req) {
  try {
    const { character, theme } = await req.json();

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `
      Anda adalah AI System untuk "Nusantara Cyber-Heritage".
      Analisis tokoh budaya Nusantara: "${character}" dengan tema: "${theme}".
      
      Hasilkan JSON valid dengan format persis seperti ini:
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

    const response = await model.generateContent(prompt);
    const resultText = response.response.text();
    const result = JSON.parse(resultText);

    return Response.json({ success: true, data: result });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
