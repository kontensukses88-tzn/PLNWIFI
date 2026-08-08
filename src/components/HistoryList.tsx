import React, { useState } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Eye,
  Download,
  Smartphone,
  Zap,
  Wifi,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { StrukItem, StoreConfig } from '../types';
import { formatRupiah, formatDateIndonesian, formatWhatsAppText } from '../utils/formatters';

interface HistoryListProps {
  history: StrukItem[];
  storeConfig: StoreConfig;
  onSelectReceipt: (item: StrukItem) => void;
  onDeleteReceipt: (id: string) => void;
  onClearHistory: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  storeConfig,
  onSelectReceipt,
  onDeleteReceipt,
  onClearHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<'ALL' | 'LISTRIK' | 'INTERNET'>('ALL');

  // Filtered list
  const filtered = history.filter((item) => {
    const matchesSearch =
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.refNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.provider.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === 'ALL' ? true : item.type === filterType;

    return matchesSearch && matchesType;
  });

  // Calculate totals
  const totalRevenue = history.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalAdminProfit = history.reduce((sum, item) => sum + item.adminFee, 0);

  // Export CSV
  const handleExportCsv = () => {
    if (history.length === 0) return;

    const headers = [
      'No Ref',
      'Tanggal',
      'Layanan',
      'Provider',
      'ID Pelanggan',
      'Nama Pelanggan',
      'Nominal Utama',
      'Admin Kios',
      'Total Bayar',
      'Metode'
    ];

    const rows = history.map((item) => [
      item.refNo,
      item.transactionDate,
      item.type,
      item.provider,
      item.customerId,
      `"${item.customerName}"`,
      item.mainAmount,
      item.adminFee,
      item.totalAmount,
      item.paymentMethod,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan-Struk-Kios-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendWa = (item: StrukItem) => {
    const text = formatWhatsAppText(item, storeConfig);
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs font-medium text-slate-400">Total Struk Terbuat</div>
            <div className="text-2xl font-bold text-white mt-1">{history.length} Transaksi</div>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs font-medium text-slate-400">Total Omset Pembayaran</div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">
              {formatRupiah(totalRevenue)}
            </div>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs font-medium text-slate-400">Est. Keuntungan Admin Kios</div>
            <div className="text-xl sm:text-2xl font-bold text-indigo-400 mt-1">
              {formatRupiah(totalAdminProfit)}
            </div>
          </div>
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* History Controls & Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl text-white space-y-4">
        {/* Search & Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama, ID, no ref..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Type Filter Buttons & CSV Export */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 rounded-lg font-medium ${
                  filterType === 'ALL' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterType('LISTRIK')}
                className={`px-3 py-1.5 rounded-lg font-medium ${
                  filterType === 'LISTRIK' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                }`}
              >
                Listrik PLN
              </button>
              <button
                onClick={() => setFilterType('INTERNET')}
                className={`px-3 py-1.5 rounded-lg font-medium ${
                  filterType === 'INTERNET' ? 'bg-indigo-500 text-white font-bold' : 'text-slate-400'
                }`}
              >
                Internet / WiFi
              </button>
            </div>

            <button
              onClick={handleExportCsv}
              disabled={history.length === 0}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-semibold flex items-center space-x-1 shrink-0 disabled:opacity-40 cursor-pointer"
              title="Export CSV Laporan"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/70">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">No. Ref & Tgl</th>
                <th className="p-3">Layanan</th>
                <th className="p-3">ID & Pelanggan</th>
                <th className="p-3">Total Bayar</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    Belum ada riwayat struk yang cocok.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/80 transition-all">
                    <td className="p-3">
                      <div className="font-mono font-bold text-amber-300">{item.refNo}</div>
                      <div className="text-[10px] text-slate-500">
                        {formatDateIndonesian(item.transactionDate)}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center space-x-1.5 font-semibold text-white">
                        {item.type === 'LISTRIK' ? (
                          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        ) : (
                          <Wifi className="w-3.5 h-3.5 text-indigo-400" />
                        )}
                        <span>{item.provider}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.type === 'LISTRIK' ? `PLN ${item.subType}` : item.packageName}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-white uppercase">{item.customerName}</div>
                      <div className="font-mono text-[11px] text-slate-400">{item.customerId}</div>
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-emerald-400">{formatRupiah(item.totalAmount)}</div>
                      <div className="text-[10px] text-slate-500">
                        Admin: {formatRupiah(item.adminFee)}
                      </div>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onSelectReceipt(item)}
                          className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-all cursor-pointer"
                          title="Lihat & Cetak Struk"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSendWa(item)}
                          className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 transition-all cursor-pointer"
                          title="Kirim WhatsApp"
                        >
                          <Smartphone className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteReceipt(item.id)}
                          className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition-all cursor-pointer"
                          title="Hapus Struk"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
