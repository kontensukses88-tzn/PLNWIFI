import React from 'react';
import { Zap, History, Settings, FileText, Store } from 'lucide-react';
import { StoreConfig } from '../types';

interface HeaderProps {
  activeTab: 'CREATE' | 'HISTORY' | 'SETTINGS';
  setActiveTab: (tab: 'CREATE' | 'HISTORY' | 'SETTINGS') => void;
  storeConfig: StoreConfig;
  totalReceiptsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  storeConfig,
  totalReceiptsCount,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Store Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-indigo-600 flex items-center justify-center shadow-md shadow-amber-500/20">
              <Zap className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-white leading-none">
                  StrukKilat<span className="text-amber-400">.id</span>
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                  PLN & WiFi
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px] sm:max-w-xs">
                {storeConfig.storeName}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800/80">
            <button
              id="tab-btn-create"
              onClick={() => setActiveTab('CREATE')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'CREATE'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Buat Struk</span>
            </button>

            <button
              id="tab-btn-history"
              onClick={() => setActiveTab('HISTORY')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'HISTORY'
                  ? 'bg-slate-800 text-white font-semibold border border-slate-700 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Riwayat</span>
              {totalReceiptsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[11px] bg-amber-500 text-slate-950 font-bold rounded-full">
                  {totalReceiptsCount}
                </span>
              )}
            </button>

            <button
              id="tab-btn-settings"
              onClick={() => setActiveTab('SETTINGS')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'SETTINGS'
                  ? 'bg-slate-800 text-white font-semibold border border-slate-700 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Profil Kios</span>
            </button>
          </nav>

          {/* Quick Action Button for Mobile */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              id="mobile-settings-btn"
              onClick={() => setActiveTab('SETTINGS')}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar for Mobile Phones */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-900/95 backdrop-blur-md px-2 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setActiveTab('CREATE')}
          className={`flex-1 py-1.5 px-1 rounded-xl text-center font-medium flex flex-col items-center justify-center space-y-1 transition-all ${
            activeTab === 'CREATE'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span className="text-[10px]">Buat Struk</span>
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`flex-1 py-1.5 px-1 rounded-xl text-center font-medium flex flex-col items-center justify-center space-y-1 transition-all relative ${
            activeTab === 'HISTORY'
              ? 'bg-slate-800 text-white font-bold border border-slate-700 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <History className="w-4 h-4" />
            {totalReceiptsCount > 0 && (
              <span className="absolute -top-1.5 -right-2 px-1 py-0.2 text-[9px] bg-amber-500 text-slate-950 font-black rounded-full">
                {totalReceiptsCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Riwayat</span>
        </button>
        <button
          onClick={() => setActiveTab('SETTINGS')}
          className={`flex-1 py-1.5 px-1 rounded-xl text-center font-medium flex flex-col items-center justify-center space-y-1 transition-all ${
            activeTab === 'SETTINGS'
              ? 'bg-slate-800 text-white font-bold border border-slate-700 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Store className="w-4 h-4" />
          <span className="text-[10px]">Profil Kios</span>
        </button>
      </div>
    </header>
  );
};
