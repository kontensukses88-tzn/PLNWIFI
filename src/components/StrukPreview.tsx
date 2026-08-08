import React, { useState } from 'react';
import {
  Printer,
  Download,
  Share2,
  Copy,
  Check,
  Zap,
  Wifi,
  BookmarkPlus,
  ArrowLeft,
  Smartphone,
  Maximize2
} from 'lucide-react';
import { StrukItem, StoreConfig, PaperSize } from '../types';
import {
  formatRupiah,
  formatDateIndonesian,
  formatWhatsAppText
} from '../utils/formatters';
import { exportElementToPdf } from '../utils/pdfGenerator';

interface StrukPreviewProps {
  struk: StrukItem;
  storeConfig: StoreConfig;
  onBackToEdit: () => void;
  onSaveHistory: (item: StrukItem) => void;
}

export const StrukPreview: React.FC<StrukPreviewProps> = ({
  struk,
  storeConfig,
  onBackToEdit,
  onSaveHistory,
}) => {
  const [paperSize, setPaperSize] = useState<PaperSize>(storeConfig.defaultPaperSize || '58mm');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [savedStatus, setSavedStatus] = useState<boolean>(false);

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    const filename = `Struk-${struk.type}-${struk.refNo}`;
    await exportElementToPdf('printable-struk-area', filename, paperSize);
    setIsExporting(false);
  };

  const handleDirectPrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = formatWhatsAppText(struk, storeConfig);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendWhatsApp = () => {
    const text = formatWhatsAppText(struk, storeConfig);
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleSaveToHistory = () => {
    onSaveHistory(struk);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2500);
  };

  // Determine width styling based on paper size
  const getContainerWidthClass = () => {
    switch (paperSize) {
      case '58mm':
        return 'w-full max-w-[340px]';
      case '80mm':
        return 'w-full max-w-[420px]';
      case 'CARD':
        return 'w-full max-w-[460px]';
      case 'A4':
        return 'w-full max-w-[680px]';
      default:
        return 'w-full max-w-[340px]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-white shadow-lg">
        <button
          onClick={onBackToEdit}
          className="w-full md:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali Edit</span>
        </button>

        {/* Paper Size Switcher */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs w-full md:w-auto justify-center">
          <span className="text-slate-400 font-semibold px-2 hidden sm:inline">Ukuran Kertas:</span>
          {(['58mm', '80mm', 'A4', 'CARD'] as PaperSize[]).map((size) => (
            <button
              key={size}
              onClick={() => setPaperSize(size)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                paperSize === size
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {size === '58mm' ? 'Thermal 58mm' : size === '80mm' ? 'Thermal 80mm' : size === 'CARD' ? 'Kartu E-Struk' : 'Standard A4'}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap justify-center">
          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="flex-1 md:flex-initial inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Memproses PDF...' : 'Cetak / Download PDF'}</span>
          </button>

          <button
            onClick={handleDirectPrint}
            className="flex-1 md:flex-initial inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-all cursor-pointer"
            title="Cetak via Printer"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Print</span>
          </button>

          <button
            onClick={handleSendWhatsApp}
            className="flex-1 md:flex-initial inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md transition-all cursor-pointer"
            title="Kirim ke WhatsApp Customer"
          >
            <Smartphone className="w-4 h-4" />
            <span>Kirim WA</span>
          </button>

          <button
            onClick={handleCopyText}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
            title="Salin Teks Struk"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleSaveToHistory}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition-all cursor-pointer"
            title="Simpan ke Riwayat"
          >
            {savedStatus ? <Check className="w-4 h-4 text-emerald-400" /> : <BookmarkPlus className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Thermal / Paper Receipt Rendering Area */}
      <div className="flex justify-center p-2 sm:p-6 bg-slate-950 rounded-2xl border border-slate-800 overflow-x-auto">
        <div
          id="printable-struk-area"
          className={`${getContainerWidthClass()} bg-white text-slate-900 font-mono p-5 shadow-2xl rounded-sm border border-slate-200 transition-all text-xs leading-tight`}
          style={{
            fontFamily: paperSize === 'A4' ? 'sans-serif' : "'Courier New', Courier, monospace",
          }}
        >
          {/* Store Logo & Header */}
          <div className="text-center pb-3 border-b-2 border-dashed border-slate-800">
            <div className="font-bold text-base tracking-wide uppercase text-slate-900">
              {storeConfig.storeName}
            </div>
            {storeConfig.storeAddress && (
              <div className="text-[11px] text-slate-700 mt-0.5 leading-tight">
                {storeConfig.storeAddress}
              </div>
            )}
            {storeConfig.storePhone && (
              <div className="text-[11px] text-slate-700 mt-0.5">
                Telp/WA: {storeConfig.storePhone}
              </div>
            )}
          </div>

          {/* Receipt Title */}
          <div className="text-center py-2.5 my-1 bg-slate-100 rounded border border-slate-200 font-bold uppercase tracking-wider text-slate-900">
            STRUK BUKTI PEMBAYARAN {struk.type}
          </div>

          {/* Transaction Metadata */}
          <div className="space-y-1.5 py-2 border-b border-dashed border-slate-400">
            <div className="flex justify-between">
              <span className="text-slate-600">No. Ref:</span>
              <span className="font-bold">{struk.refNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Tgl Transaksi:</span>
              <span className="font-medium">{formatDateIndonesian(struk.transactionDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Provider:</span>
              <span className="font-bold">{struk.provider}</span>
            </div>
            {struk.type === 'LISTRIK' && (
              <div className="flex justify-between">
                <span className="text-slate-600">Jenis Layanan:</span>
                <span className="font-bold">
                  PLN {struk.subType === 'PRABAYAR' ? 'PRABAYAR / TOKEN' : 'PASCABAYAR'}
                </span>
              </div>
            )}
          </div>

          {/* Customer Details */}
          <div className="space-y-1.5 py-2.5 border-b border-dashed border-slate-400">
            <div className="flex justify-between">
              <span className="text-slate-600">ID Pelanggan:</span>
              <span className="font-bold text-sm tracking-wider">{struk.customerId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Nama Pelanggan:</span>
              <span className="font-bold uppercase">{struk.customerName}</span>
            </div>

            {struk.type === 'LISTRIK' ? (
              <>
                {struk.tariffPower && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tarif / Daya:</span>
                    <span className="font-medium">{struk.tariffPower}</span>
                  </div>
                )}
                {struk.subType === 'PASCABAYAR' && (
                  <>
                    {struk.billPeriod && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Periode Tagihan:</span>
                        <span className="font-medium">{struk.billPeriod}</span>
                      </div>
                    )}
                    {struk.standMeter && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Stand Meter:</span>
                        <span className="font-medium">{struk.standMeter}</span>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                {struk.packageName && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Paket Internet:</span>
                    <span className="font-medium">{struk.packageName}</span>
                  </div>
                )}
                {struk.billPeriod && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Periode Billing:</span>
                    <span className="font-medium">{struk.billPeriod}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* TOKEN HIGHLIGHT BOX (Khusus Token Listrik) */}
          {struk.type === 'LISTRIK' && struk.subType === 'PRABAYAR' && (
            <div className="my-3 p-3 bg-slate-50 border-2 border-slate-900 rounded-lg text-center">
              <div className="text-[10px] uppercase tracking-widest font-bold text-slate-600 mb-1">
                STROOM / STROM TOKEN PLN
              </div>
              <div className="text-base sm:text-lg font-black tracking-widest font-mono text-slate-900 py-1 bg-white border border-slate-300 rounded">
                {struk.tokenNumber || '---- ---- ---- ---- ----'}
              </div>
              {struk.kwhAmount && (
                <div className="text-xs font-bold text-slate-800 mt-1.5">
                  JUMLAH KWH: {struk.kwhAmount} kWh
                </div>
              )}
            </div>
          )}

          {/* Financial Breakdown Table */}
          <div className="space-y-1.5 py-2.5 border-b-2 border-dashed border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-700">Tagihan Utama / Token:</span>
              <span className="font-medium">{formatRupiah(struk.mainAmount)}</span>
            </div>
            {struk.type === 'INTERNET' && struk.ppnAmount ? (
              <div className="flex justify-between">
                <span className="text-slate-700">Biaya PPN:</span>
                <span className="font-medium">{formatRupiah(struk.ppnAmount)}</span>
              </div>
            ) : null}
            {struk.type === 'INTERNET' && struk.penaltyFee ? (
              <div className="flex justify-between">
                <span className="text-slate-700">Denda Keterlambatan:</span>
                <span className="font-medium">{formatRupiah(struk.penaltyFee)}</span>
              </div>
            ) : null}
            <div className="flex justify-between">
              <span className="text-slate-700">Biaya Admin Bank / Kios:</span>
              <span className="font-medium">{formatRupiah(struk.adminFee)}</span>
            </div>

            <div className="pt-2 mt-2 border-t border-slate-300 flex justify-between items-center font-bold text-sm text-slate-900">
              <span>TOTAL BAYAR:</span>
              <span className="text-base font-black">{formatRupiah(struk.totalAmount)}</span>
            </div>
          </div>

          {/* Payment Status & Method Footer */}
          <div className="py-2.5 text-center text-[11px] font-bold tracking-wider text-slate-800 uppercase flex items-center justify-between border-b border-dashed border-slate-400">
            <span>STATUS: <span className="text-emerald-700">{struk.paymentStatus}</span></span>
            <span>METODE: {struk.paymentMethod}</span>
          </div>

          {/* Barcode Mock Visual */}
          <div className="py-3 text-center">
            <div className="inline-block px-4 py-1.5 bg-slate-900 text-white font-mono text-[10px] tracking-[0.2em] rounded">
              ||| | ||||| ||| || |||||| | |||
            </div>
            <div className="text-[9px] text-slate-500 font-mono mt-0.5">
              Ref ID: {struk.id}
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center text-[10px] text-slate-600 pt-1 leading-relaxed border-t border-slate-200">
            {storeConfig.footerNote || 'Struk ini merupakan bukti pembayaran yang sah.'}
          </div>
        </div>
      </div>
    </div>
  );
};
