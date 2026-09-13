# Nusantara Cyber-Heritage AI 🌌🎭

**Nusantara Cyber-Heritage AI** adalah platform digitalisasi, preservasi, dan ekosistem NFT untuk kebudayaan Nusantara (Wayang, Batik, Ukiran, dan Senjata Tradisional) berbasis kecerdasan buatan (AI).

Platform ini menggabungkan nilai sejarah tradisional dengan sentuhan futuristik (*Culture of the Future*) serta dilengkapi sistem kalkulasi kelangkaan (*Hybrid Rarity Score*) dan narasi audio imersif.

---

## ✨ Fitur Utama

- **AI Prompt Engine (Rarity 98+ Guarantee):** Mengenerasikan prompt visual ultra-detail secara otomatis untuk menghasilkan aset digital dengan skor kelangkaan di atas 98/100.
- **Dual Cultural Themes:** Mendukung pilihan tema *Pelestarian Cultural Classic* dan *Culture of the Future (Futuristic/Cyberpunk)*.
- **Hybrid Rarity Scoring:** Penilaian kelangkaan transparan berdasarkan kombinasi *Mythic Traits* (70%) dan *Visual Quality* oleh AI (30%).
- **AI Storyteller & Soundscape:** Penyusunan naskah cerita imersif otomatis lengkap dengan petunjuk suasana audio latar (*soundscape*).
- **One-Click NFT Readiness:** Aset dan metadata siap diminting ke dalam rantai blok (*blockchain*).

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router)
- **AI Engine:** Google Gemini API (`gemini-2.5-flash` via `@google/genai` SDK)
- **Deployment:** Vercel
- **Version Control:** GitHub

---

## 📁 Struktur Proyek

```text
Nusantara-Cyber-Heritage-AI/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.js      # Endpoint AI Engine (Gemini 2.5 Flash)
│   ├── layout.js             # Root layout & Metadata
│   └── page.js               # Interface utama (Mobile-first UI)
├── .env.local                # Environment variable (API Keys)
├── package.json              # Project dependencies
└── README.md                 # Dokumentasi proyek
