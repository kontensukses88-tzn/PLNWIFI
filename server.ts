import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // AI OCR / Text Parsing for Receipt Auto-Fill Handler
  const parseBillHandler = async (req: express.Request, res: express.Response) => {
    try {
      res.setHeader('Content-Type', 'application/json');
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "GEMINI_API_KEY tidak dikonfigurasi. Silakan isi data secara manual atau atur API key di panel Secrets.",
        });
      }

      const { text, imageBase64, mimeType } = req.body;

      if (!text && !imageBase64) {
        return res.status(400).json({ error: "Harap berikan teks atau gambar tagihan untuk dianalisis." });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `Anda adalah asisten AI ekstraksi tagihan/struk pembayaran di Indonesia (PLN Listrik & Internet like Indihome, Biznet, First Media, MyRepublic, Iconnet, XL Home, Router RT RW Net).
Ekstrak data berikut dari teks/gambar yang diberikan ke dalam JSON persis dengan format ini (tanpa markdown backticks):
{
  "type": "LISTRIK" atau "INTERNET",
  "subType": "PRABAYAR" atau "PASCABAYAR" (khusus listrik, jika internet kosongkan atau "PASCABAYAR"),
  "provider": "PLN" atau "Indihome" / "Biznet" / "First Media" / "MyRepublic" / "Iconnet" / "XL Home" / "RT RW Net" / nama provider lain,
  "customerId": "nomor ID pelanggan / nomor meter",
  "customerName": "nama pelanggan",
  "tariffPower": "tarif/daya misal R1M/900VA atau 1300VA" (khusus PLN),
  "billPeriod": "periode tagihan misal AGUSTUS 2026 atau 08/2026",
  "packageName": "nama paket internet / kecepatan misal 50 Mbps" (khusus internet),
  "mainAmount": nominal tagihan utama (angka integer tanpa desimal),
  "adminFee": nominal biaya admin jika ada (angka integer, default 2500/3000 jika tak tertulis),
  "standMeter": "stand meter awal - akhir" (khusus PLN pascabayar),
  "tokenNumber": "20 digit token jika ada"
}`;

      let contents: any[] = [];
      if (imageBase64 && mimeType) {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        contents = [
          prompt,
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
        ];
      } else {
        contents = [`${prompt}\n\nTeks tagihan/pesan:\n${text}`];
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: contents,
      });

      const responseText = response.text || "";
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        return res.json({ success: true, data: parsedData });
      } else {
        return res.status(400).json({ error: "Gagal mengekstrak struktur data dari input." });
      }
    } catch (err: any) {
      console.error("Error in parse-bill:", err);
      res.status(500).json({ error: err.message || "Terjadi kesalahan saat memproses data tagihan." });
    }
  };

  app.post("/api/parse-bill", parseBillHandler);
  app.post("/api/parse-struk", parseBillHandler);

  // Fallback 404 for all unhandled /api/* calls so they return JSON instead of HTML
  app.all("/api/*", (_req, res) => {
    res.status(404).json({ error: "API route tidak ditemukan." });
  });

  // Vite middleware for dev or Static file serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
