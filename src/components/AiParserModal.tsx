import React, { useState } from 'react';
import { Sparkles, Upload, FileText, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { StrukItem, StoreConfig } from '../types';
import { generateRefNo, generate20DigitToken } from '../utils/formatters';

interface AiParserModalProps {
  onParsedResult: (parsedItem: StrukItem) => void;
  storeConfig: StoreConfig;
}

export const AiParserModal: React.FC<AiParserModalProps> = ({ onParsedResult, storeConfig }) => {
  const [inputText, setInputText] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<{ base64: string; mimeType: string; fileName: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Harap unggah berkas gambar (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64 = evt.target?.result as string;
      setSelectedImage({
        base64,
        mimeType: file.type,
        fileName: file.name,
      });
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleProcessAi = async () => {
    if (!inputText.trim() && !selectedImage) {
      setErrorMessage('Harap tempel teks tagihan atau unggah foto/screenshot tagihan.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/parse-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText.trim(),
          imageBase64: selectedImage?.base64,
          mimeType: selectedImage?.mimeType,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      let resData: any = {};
      if (contentType.includes('application/json')) {
        resData = await response.json();
      } else {
        const text = await response.text();
        throw new Error(
          response.status === 404
            ? 'Endpoint API tidak ditemukan (/api/parse-bill).'
            : `Respon server tidak valid (${response.status}): ${text.slice(0, 80)}`
        );
      }

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Gagal mengekstrak data tagihan.');
      }

      const data = resData.data;

      const isListrik = data.type === 'LISTRIK' || data.provider?.toUpperCase().includes('PLN');
      const isPrabayar = data.subType === 'PRABAYAR' || !!data.tokenNumber;

      const mainAmt = parseInt(data.mainAmount) || 100000;
      const admin = parseInt(data.adminFee) || (isListrik ? storeConfig.defaultAdminPln : storeConfig.defaultAdminInternet);

      const ppn = !isListrik && data.ppnAmount ? parseInt(data.ppnAmount) : 0;
      const penalty = !isListrik && data.penaltyFee ? parseInt(data.penaltyFee) : 0;
      const totalAmt = mainAmt + admin + ppn + penalty;

      const parsedStruk: StrukItem = {
        id: `struk-ai-${Date.now()}`,
        refNo: generateRefNo(isListrik ? 'LISTRIK' : 'INTERNET'),
        type: isListrik ? 'LISTRIK' : 'INTERNET',
        subType: isListrik ? (isPrabayar ? 'PRABAYAR' : 'PASCABAYAR') : undefined,
        provider: data.provider || (isListrik ? 'PLN' : 'Indihome'),
        customerId: data.customerId || '1234567890',
        customerName: (data.customerName || 'PELANGGAN').toUpperCase(),
        tariffPower: data.tariffPower || 'R1 / 1300 VA',
        standMeter: data.standMeter,
        kwhAmount: data.kwhAmount || (isPrabayar ? Math.round((mainAmt * 0.97 / 1444.7) * 10) / 10 : undefined),
        tokenNumber: data.tokenNumber || (isPrabayar ? generate20DigitToken() : undefined),
        billPeriod: data.billPeriod || 'AGUSTUS 2026',
        packageName: data.packageName || 'Internet Fast 50 Mbps',
        mainAmount: mainAmt,
        adminFee: admin,
        ppnAmount: ppn,
        penaltyFee: penalty,
        totalAmount: totalAmt,
        paymentStatus: 'LUNAS',
        paymentMethod: 'TUNAI',
        transactionDate: new Date().toISOString(),
        createdAt: Date.now(),
      };

      onParsedResult(parsedStruk);
    } catch (err: any) {
      console.error('AI Parse Error:', err);
      setErrorMessage(err.message || 'Terjadi kesalahan saat mengekstrak tagihan.');
    } finally {
      setIsLoading(false);
    }
  };

  const sampleTexts = [
    {
      label: 'Contoh WA Token PLN',
      text: 'Beli token PLN Rp 100.000 ID Pelanggan: 53819203812 a/n SITI RAHMA. Daya 1300VA. Token: 4920-1920-3819-2019-3810. kWh 68.5.',
    },
    {
      label: 'Contoh Pesan Indihome',
      text: 'Tagihan Indihome bulan AGUSTUS 2026. ID Pelanggan: 122938401928 a/n BUDI SANTOSO. Paket 50Mbps. Tagihan Rp 350.000 + Admin Rp 3.000. Total Rp 353.000.',
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl text-white max-w-3xl mx-auto">
      {/* Banner AI */}
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
        <div className="p-3 bg-indigo-600/30 border border-indigo-500/30 text-amber-300 rounded-xl">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Smart AI Receipt Extractor</h2>
          <p className="text-xs text-slate-400">
            Tempel pesan WhatsApp/SMS tagihan atau unggah screenshot/foto struk, AI Gemini akan mengekstrak data otomatis!
          </p>
        </div>
      </div>

      <div className="space-y-5 my-5">
        {/* Sample Shortcuts */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Coba Contoh Teks Instan:
          </label>
          <div className="flex flex-wrap gap-2">
            {sampleTexts.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputText(item.text);
                  setSelectedImage(null);
                }}
                className="px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-indigo-500 text-indigo-300 text-xs rounded-lg transition-all"
              >
                + {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Option 1: Paste Text */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Opsi A: Tempel Teks Tagihan / Pesan WhatsApp</span>
          </label>
          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Tempel pesan tagihan di sini... Contoh: Beli token PLN 50rb ID 538201948..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Option 2: Upload Image */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-amber-400" />
            <span>Opsi B: Unggah Foto / Screenshot Tagihan</span>
          </label>

          <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500 rounded-xl p-4 text-center bg-slate-950/60 transition-all">
            {selectedImage ? (
              <div className="flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-800">
                <div className="flex items-center space-x-2 truncate">
                  <img src={selectedImage.base64} alt="Upload preview" className="w-10 h-10 object-cover rounded" />
                  <span className="text-xs font-medium text-slate-200 truncate">{selectedImage.fileName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="text-xs text-rose-400 hover:underline px-2"
                >
                  Hapus
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block py-2">
                <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <span className="text-xs font-medium text-slate-300">
                  Klik untuk pilih foto tagihan (JPG, PNG)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Action Submit */}
      <button
        type="button"
        disabled={isLoading}
        onClick={handleProcessAi}
        className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin text-amber-300" />
            <span>Sedang Mengekstrak Data dengan AI...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>Ekstrak Data & Buat Struk Otomatis</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
};
