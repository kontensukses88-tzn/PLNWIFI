import React, { useState } from 'react';
import { Store, Phone, MapPin, DollarSign, FileText, Check, RotateCcw } from 'lucide-react';
import { StoreConfig, PaperSize } from '../types';
import { DEFAULT_STORE_CONFIG } from '../utils/storage';

interface StoreSettingsProps {
  storeConfig: StoreConfig;
  onSaveConfig: (newConfig: StoreConfig) => void;
}

export const StoreSettingsModal: React.FC<StoreSettingsProps> = ({
  storeConfig,
  onSaveConfig,
}) => {
  const [formConfig, setFormConfig] = useState<StoreConfig>(storeConfig);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formConfig);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    setFormConfig(DEFAULT_STORE_CONFIG);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl text-white max-w-2xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Pengaturan Kios / Agen PPOB</h2>
            <p className="text-xs text-slate-400">
              Sesuaikan nama toko, alamat, biaya admin default, dan catatan footer struk.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2.5 py-1.5 rounded-lg"
          title="Reset Ke Default"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 my-5">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Nama Toko / Kios / Counter
          </label>
          <input
            type="text"
            value={formConfig.storeName}
            onChange={(e) => setFormConfig((prev) => ({ ...prev, storeName: e.target.value }))}
            placeholder="Contoh: KIOS BERKAH PPOB & CELL"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-amber-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Alamat Toko</span>
            </label>
            <input
              type="text"
              value={formConfig.storeAddress}
              onChange={(e) => setFormConfig((prev) => ({ ...prev, storeAddress: e.target.value }))}
              placeholder="Jl. Raya Merdeka No. 88, Jakarta"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>No. Telepon / WhatsApp Kios</span>
            </label>
            <input
              type="text"
              value={formConfig.storePhone}
              onChange={(e) => setFormConfig((prev) => ({ ...prev, storePhone: e.target.value }))}
              placeholder="0812-3456-7890"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-950 border border-slate-800 rounded-xl">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Default Admin PLN (Rp)
            </label>
            <input
              type="number"
              value={formConfig.defaultAdminPln}
              onChange={(e) => setFormConfig((prev) => ({ ...prev, defaultAdminPln: parseInt(e.target.value) || 0 }))}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-amber-300 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Default Admin Internet (Rp)
            </label>
            <input
              type="number"
              value={formConfig.defaultAdminInternet}
              onChange={(e) => setFormConfig((prev) => ({ ...prev, defaultAdminInternet: parseInt(e.target.value) || 0 }))}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-indigo-300 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Ukuran Kertas Default
            </label>
            <select
              value={formConfig.defaultPaperSize}
              onChange={(e) => setFormConfig((prev) => ({ ...prev, defaultPaperSize: e.target.value as PaperSize }))}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-medium"
            >
              <option value="58mm">Thermal 58mm (Kasir Kecil)</option>
              <option value="80mm">Thermal 80mm (Kasir Standar)</option>
              <option value="CARD">Kartu E-Struk Digital</option>
              <option value="A4">Standard A4 / Paper Invoice</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Catatan Footer Struk (Pesan Penutup)</span>
          </label>
          <input
            type="text"
            value={formConfig.footerNote}
            onChange={(e) => setFormConfig((prev) => ({ ...prev, footerNote: e.target.value }))}
            placeholder="Terima kasih atas kunjungan Anda. Simpan struk ini sebagai bukti pembayaran yang sah."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="pt-3">
          <button
            type="submit"
            className="w-full py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check className="w-5 h-5 text-emerald-950" />
                <span>Pengaturan Berhasil Disimpan!</span>
              </>
            ) : (
              <span>Simpan Perubahan Kios</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
