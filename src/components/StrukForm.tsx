import React, { useEffect } from 'react';
import {
  Zap,
  Wifi,
  RefreshCw,
  Sparkles,
  Calculator,
  User,
  Hash,
  DollarSign,
  Calendar,
  CreditCard,
  FileCheck2,
  BookmarkPlus,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { StrukItem, StrukType, ListrikSubType, PaymentMethod, StoreConfig } from '../types';
import {
  generateRefNo,
  generate20DigitToken,
  calculateKwhEstimate,
  formatRupiah
} from '../utils/formatters';

interface StrukFormProps {
  formData: StrukItem;
  setFormData: React.Dispatch<React.SetStateAction<StrukItem>>;
  storeConfig: StoreConfig;
  onSaveAndPreview: () => void;
  onOpenAiScan: () => void;
}

export const StrukForm: React.FC<StrukFormProps> = ({
  formData,
  setFormData,
  storeConfig,
  onSaveAndPreview,
  onOpenAiScan,
}) => {
  // Recalculate total whenever mainAmount, adminFee, ppnAmount, penaltyFee change
  useEffect(() => {
    const main = formData.mainAmount || 0;
    const admin = formData.adminFee || 0;
    const ppn = formData.type === 'INTERNET' ? (formData.ppnAmount || 0) : 0;
    const penalty = formData.type === 'INTERNET' ? (formData.penaltyFee || 0) : 0;
    const total = main + admin + ppn + penalty;
    setFormData((prev) => ({ ...prev, totalAmount: total }));
  }, [formData.type, formData.mainAmount, formData.adminFee, formData.ppnAmount, formData.penaltyFee]);

  const handleTypeChange = (newType: StrukType) => {
    if (newType === 'LISTRIK') {
      setFormData((prev) => ({
        ...prev,
        type: 'LISTRIK',
        subType: prev.subType || 'PRABAYAR',
        provider: 'PLN',
        tariffPower: prev.tariffPower || 'R1 / 1300 VA',
        adminFee: storeConfig.defaultAdminPln,
        ppnAmount: 0,
        penaltyFee: 0,
        refNo: generateRefNo('LISTRIK'),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        type: 'INTERNET',
        subType: undefined,
        provider: prev.provider === 'PLN' ? 'Indihome' : prev.provider,
        packageName: prev.packageName || 'Internet Super Fast 50 Mbps',
        billPeriod: prev.billPeriod || 'AGUSTUS 2026',
        adminFee: storeConfig.defaultAdminInternet,
        refNo: generateRefNo('INTERNET'),
      }));
    }
  };

  const handleSubTypeChange = (newSubType: ListrikSubType) => {
    if (newSubType === 'PRABAYAR') {
      setFormData((prev) => ({
        ...prev,
        subType: 'PRABAYAR',
        tokenNumber: prev.tokenNumber || generate20DigitToken(),
        kwhAmount: prev.kwhAmount || calculateKwhEstimate(prev.mainAmount, prev.tariffPower || 'R1 / 1300 VA'),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        subType: 'PASCABAYAR',
        billPeriod: prev.billPeriod || 'AGUSTUS 2026',
        standMeter: prev.standMeter || '00012450 - 00012620',
      }));
    }
  };

  const handleGenerateNewRef = () => {
    setFormData((prev) => ({
      ...prev,
      refNo: generateRefNo(prev.type),
    }));
  };

  const handleGenerateNewToken = () => {
    setFormData((prev) => ({
      ...prev,
      tokenNumber: generate20DigitToken(),
    }));
  };

  const handleAutoKwhCalc = () => {
    const kwh = calculateKwhEstimate(formData.mainAmount, formData.tariffPower || 'R1 / 1300 VA');
    setFormData((prev) => ({ ...prev, kwhAmount: kwh }));
  };

  // Quick Preset Handlers
  const applyPresetPlnToken = () => {
    setFormData({
      id: `struk-${Date.now()}`,
      refNo: generateRefNo('LISTRIK'),
      type: 'LISTRIK',
      subType: 'PRABAYAR',
      provider: 'PLN',
      customerId: '538201948210',
      customerName: 'BAMBANG PRATAMA',
      tariffPower: 'R1 / 1300 VA',
      kwhAmount: 68.5,
      tokenNumber: generate20DigitToken(),
      mainAmount: 100000,
      adminFee: storeConfig.defaultAdminPln,
      ppnAmount: 0,
      penaltyFee: 0,
      totalAmount: 100000 + storeConfig.defaultAdminPln,
      paymentStatus: 'LUNAS',
      paymentMethod: 'TUNAI',
      transactionDate: new Date().toISOString(),
      createdAt: Date.now(),
    });
  };

  const applyPresetPlnPascabayar = () => {
    setFormData({
      id: `struk-${Date.now()}`,
      refNo: generateRefNo('LISTRIK'),
      type: 'LISTRIK',
      subType: 'PASCABAYAR',
      provider: 'PLN',
      customerId: '531102938491',
      customerName: 'H. AHMAD DAHAN',
      tariffPower: 'R1M / 900 VA',
      billPeriod: 'AGUSTUS 2026',
      standMeter: '00014280 - 00014520',
      mainAmount: 215000,
      adminFee: storeConfig.defaultAdminPln,
      ppnAmount: 0,
      penaltyFee: 0,
      totalAmount: 215000 + storeConfig.defaultAdminPln,
      paymentStatus: 'LUNAS',
      paymentMethod: 'TUNAI',
      transactionDate: new Date().toISOString(),
      createdAt: Date.now(),
    });
  };

  const applyPresetInternet = (providerName: string, pkg: string, amount: number) => {
    setFormData({
      id: `struk-${Date.now()}`,
      refNo: generateRefNo('INTERNET'),
      type: 'INTERNET',
      provider: providerName,
      customerId: '12930492019',
      customerName: 'DEDI KURNIAWAN',
      packageName: pkg,
      billPeriod: 'AGUSTUS 2026',
      mainAmount: amount,
      adminFee: storeConfig.defaultAdminInternet,
      ppnAmount: Math.round(amount * 0.11), // 11% PPN optional
      totalAmount: amount + storeConfig.defaultAdminInternet + Math.round(amount * 0.11),
      paymentStatus: 'LUNAS',
      paymentMethod: 'QRIS',
      transactionDate: new Date().toISOString(),
      createdAt: Date.now(),
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl text-white">
      {/* Header Form */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Form Pembuatan Struk Pembayaran</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pilih jenis transaksi, isi detail pelanggan, lalu cetak PDF atau kirim ke WhatsApp.
          </p>
        </div>

        {/* AI Quick Button */}
        <button
          id="btn-ai-parser-shortcut"
          onClick={onOpenAiScan}
          className="inline-flex items-center justify-center space-x-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-xs shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Isi Otomatis via AI (Scan/Text)</span>
        </button>
      </div>

      {/* Main Service Selector Tabs */}
      <div className="grid grid-cols-2 gap-3 my-5">
        <button
          id="btn-select-listrik"
          onClick={() => handleTypeChange('LISTRIK')}
          className={`flex items-center justify-center space-x-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
            formData.type === 'LISTRIK'
              ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 ring-2 ring-amber-500/30'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <div className={`p-2 rounded-lg ${formData.type === 'LISTRIK' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
            <Zap className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="font-bold text-sm">Listrik PLN</div>
            <div className="text-[11px] opacity-80">Token Prabayar & Tagihan Pascabayar</div>
          </div>
        </button>

        <button
          id="btn-select-internet"
          onClick={() => handleTypeChange('INTERNET')}
          className={`flex items-center justify-center space-x-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
            formData.type === 'INTERNET'
              ? 'bg-indigo-500/15 border-indigo-500/50 text-indigo-300 ring-2 ring-indigo-500/30'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <div className={`p-2 rounded-lg ${formData.type === 'INTERNET' ? 'bg-indigo-500 text-white font-bold' : 'bg-slate-800 text-slate-400'}`}>
            <Wifi className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="font-bold text-sm">Internet & WiFi</div>
            <div className="text-[11px] opacity-80">Indihome, Biznet, First Media, RT/RW Net</div>
          </div>
        </button>
      </div>

      {/* Sub-type selector for PLN */}
      {formData.type === 'LISTRIK' && (
        <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 mb-5">
          <button
            id="subtab-prabayar"
            onClick={() => handleSubTypeChange('PRABAYAR')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              formData.subType === 'PRABAYAR'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Token Listrik (Prabayar)
          </button>
          <button
            id="subtab-pascabayar"
            onClick={() => handleSubTypeChange('PASCABAYAR')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              formData.subType === 'PASCABAYAR'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tagihan Bulanan (Pascabayar)
          </button>
        </div>
      )}

      {/* Quick Presets Bar */}
      <div className="mb-6 p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <BookmarkPlus className="w-3.5 h-3.5 text-amber-400" />
            <span>Preset Cepat (Isi 1-Klik Contoh Data):</span>
          </span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {formData.type === 'LISTRIK' ? (
            <>
              <button
                type="button"
                onClick={applyPresetPlnToken}
                className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg transition-all"
              >
                + Token PLN 100k
              </button>
              <button
                type="button"
                onClick={applyPresetPlnPascabayar}
                className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg transition-all"
              >
                + Tagihan Pascabayar 215k
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => applyPresetInternet('Indihome', 'Indihome 50 Mbps', 350000)}
                className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg transition-all"
              >
                + Indihome 50 Mbps (350k)
              </button>
              <button
                type="button"
                onClick={() => applyPresetInternet('Biznet', 'Home Internet 100 Mbps', 425000)}
                className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg transition-all"
              >
                + Biznet 100 Mbps (425k)
              </button>
              <button
                type="button"
                onClick={() => applyPresetInternet('Iconnet', 'Iconnet 30 Mbps', 210000)}
                className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg transition-all"
              >
                + Iconnet 30 Mbps (210k)
              </button>
              <button
                type="button"
                onClick={() => applyPresetInternet('RT RW Net', 'Paket WiFi Rumahan 10Mbps', 150000)}
                className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg transition-all"
              >
                + RT RW Net Lokal (150k)
              </button>
            </>
          )}
        </div>
      </div>

      {/* Form Fields Section */}
      <div className="space-y-4">
        {/* Row 1: Ref Struk & Provider */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              No. Referensi Struk
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={formData.refNo}
                onChange={(e) => setFormData((prev) => ({ ...prev, refNo: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-amber-300 font-mono focus:outline-none focus:border-amber-500 pr-10"
                placeholder="PLN-20260807-xxxx"
              />
              <button
                type="button"
                title="Generate No Ref Baru"
                onClick={handleGenerateNewRef}
                className="absolute right-2 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Provider / Layanan
            </label>
            {formData.type === 'LISTRIK' ? (
              <input
                type="text"
                value="PLN (Persero)"
                disabled
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-300 cursor-not-allowed font-medium"
              />
            ) : (
              <select
                value={formData.provider}
                onChange={(e) => setFormData((prev) => ({ ...prev, provider: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="Indihome">Indihome (Telkom)</option>
                <option value="Biznet">Biznet Home</option>
                <option value="First Media">First Media</option>
                <option value="MyRepublic">MyRepublic</option>
                <option value="Iconnet">Iconnet (PLN)</option>
                <option value="XL Home">XL Home / Satu</option>
                <option value="RT RW Net">RT / RW Net Lokal</option>
                <option value="Vocalnet">Vocalnet / Router</option>
                <option value="Custom">Provider Lainnya...</option>
              </select>
            )}
          </div>
        </div>

        {/* Row 2: Customer ID & Customer Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-slate-400" />
              <span>ID Pelanggan / No. Meter</span>
            </label>
            <input
              type="text"
              value={formData.customerId}
              onChange={(e) => setFormData((prev) => ({ ...prev, customerId: e.target.value }))}
              placeholder="Contoh: 538190284712"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Nama Pelanggan</span>
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData((prev) => ({ ...prev, customerName: e.target.value }))}
              placeholder="Contoh: BUDI SANTOSO"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white font-medium uppercase focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Row 3 - Listrik specific fields */}
        {formData.type === 'LISTRIK' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tarif / Daya PLN
              </label>
              <select
                value={formData.tariffPower || 'R1 / 1300 VA'}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    tariffPower: val,
                    kwhAmount: prev.subType === 'PRABAYAR' ? calculateKwhEstimate(prev.mainAmount, val) : prev.kwhAmount,
                  }));
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="R1T / 450 VA">R1T / 450 VA (Subsidi)</option>
                <option value="R1T / 900 VA">R1T / 900 VA (Subsidi)</option>
                <option value="R1M / 900 VA">R1M / 900 VA (Non Subsidi)</option>
                <option value="R1 / 1300 VA">R1 / 1300 VA</option>
                <option value="R1 / 2200 VA">R1 / 2200 VA</option>
                <option value="R2 / 3500 VA">R2 / 3500 VA</option>
                <option value="R2 / 5500 VA">R2 / 5500 VA</option>
                <option value="B1 / 2200 VA">B1 / 2200 VA (Bisnis)</option>
              </select>
            </div>

            {formData.subType === 'PRABAYAR' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Estimasi kWh Didapat</span>
                  <button
                    type="button"
                    onClick={handleAutoKwhCalc}
                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5"
                  >
                    <Calculator className="w-3 h-3" /> Hitung Ulang
                  </button>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.kwhAmount || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, kwhAmount: parseFloat(e.target.value) || 0 }))}
                    placeholder="68.5"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-amber-300 font-mono focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-xs text-slate-400 font-bold">kWh</span>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Stand Meter (Awal - Akhir)
                </label>
                <input
                  type="text"
                  value={formData.standMeter || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, standMeter: e.target.value }))}
                  placeholder="00012450 - 00012620"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            {/* Token Number if Prabayar */}
            {formData.subType === 'PRABAYAR' && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-amber-400 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>Nomor Token PLN (20 Digit)</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleGenerateNewToken}
                    className="text-[11px] bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-500/30 transition-all"
                  >
                    <RefreshCw className="w-3 h-3" /> Generate Token Baru
                  </button>
                </label>
                <input
                  type="text"
                  value={formData.tokenNumber || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tokenNumber: e.target.value }))}
                  placeholder="xxxx-xxxx-xxxx-xxxx-xxxx"
                  className="w-full bg-slate-900 border border-amber-500/40 rounded-xl px-3 py-2.5 text-base sm:text-lg text-amber-300 font-mono tracking-widest text-center font-bold focus:outline-none focus:border-amber-400"
                />
              </div>
            )}
          </div>
        )}

        {/* Row 3 - Internet specific fields */}
        {formData.type === 'INTERNET' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nama Paket / Kecepatan
              </label>
              <input
                type="text"
                value={formData.packageName || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, packageName: e.target.value }))}
                placeholder="Contoh: Indihome 50 Mbps Premium"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Periode Tagihan</span>
              </label>
              <input
                type="text"
                value={formData.billPeriod || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, billPeriod: e.target.value }))}
                placeholder="AGUSTUS 2026"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white uppercase focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Financial Section */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between pb-2 border-b border-slate-800">
            <span>Rincian Biaya & Tagihan</span>
            <span className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Auto-Kalkulasi Total
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {formData.type === 'LISTRIK' && formData.subType === 'PRABAYAR'
                  ? 'Nominal Token (Rp)'
                  : 'Tagihan Utama (Rp)'}
              </label>
              <input
                type="number"
                value={formData.mainAmount || ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setFormData((prev) => ({
                    ...prev,
                    mainAmount: val,
                    kwhAmount: prev.type === 'LISTRIK' && prev.subType === 'PRABAYAR'
                      ? calculateKwhEstimate(val, prev.tariffPower || 'R1 / 1300 VA')
                      : prev.kwhAmount,
                  }));
                }}
                placeholder="100000"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Biaya Admin Bank / Kios (Rp)
              </label>
              <input
                type="number"
                value={formData.adminFee}
                onChange={(e) => setFormData((prev) => ({ ...prev, adminFee: parseInt(e.target.value) || 0 }))}
                placeholder="2500"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-semibold text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            {formData.type === 'INTERNET' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Biaya PPN / Denda (Rp)
                </label>
                <input
                  type="number"
                  value={formData.ppnAmount || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, ppnAmount: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Metode Pembayaran
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData((prev) => ({ ...prev, paymentMethod: e.target.value as PaymentMethod }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="TUNAI">TUNAI / CASH</option>
                  <option value="QRIS">QRIS / E-WALLET</option>
                  <option value="TRANSFER">TRANSFER BANK</option>
                </select>
              </div>
            )}
          </div>

          {/* Grand Total Display */}
          <div className="flex items-center justify-between p-3.5 bg-slate-900/90 border border-amber-500/30 rounded-xl text-white mt-2">
            <div>
              <div className="text-xs text-slate-400 font-medium">TOTAL PEMBAYARAN:</div>
              <div className="text-2xl font-black text-amber-400 tracking-tight">
                {formatRupiah(formData.totalAmount)}
              </div>
            </div>
            <div className="text-right text-xs text-slate-400">
              <div>Admin Kios: <span className="text-emerald-400 font-bold">{formatRupiah(formData.adminFee)}</span></div>
              <div className="text-[11px] opacity-75">Status: <span className="text-emerald-400 font-bold">LUNAS</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Action Button */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          id="btn-generate-preview-receipt"
          onClick={onSaveAndPreview}
          className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-bold text-base shadow-xl shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-400 transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <FileCheck2 className="w-5 h-5 stroke-[2.5]" />
          <span>Tampilkan Struk & Cetak PDF</span>
        </button>
      </div>
    </div>
  );
};
