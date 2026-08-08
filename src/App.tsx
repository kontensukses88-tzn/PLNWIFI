import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StrukForm } from './components/StrukForm';
import { StrukPreview } from './components/StrukPreview';
import { AiParserModal } from './components/AiParserModal';
import { HistoryList } from './components/HistoryList';
import { StoreSettingsModal } from './components/StoreSettingsModal';
import { PrintSheet } from './components/PrintSheet';

import { StrukItem, StoreConfig } from './types';
import {
  loadStoreConfig,
  saveStoreConfig,
  loadReceiptHistory,
  addReceiptToHistory,
  deleteReceiptFromHistory,
  saveReceiptHistory
} from './utils/storage';
import { generateRefNo, generate20DigitToken, calculateKwhEstimate } from './utils/formatters';

export default function App() {
  const [storeConfig, setStoreConfig] = useState<StoreConfig>(loadStoreConfig());
  const [history, setHistory] = useState<StrukItem[]>(loadReceiptHistory());
  const [activeTab, setActiveTab] = useState<'CREATE' | 'PREVIEW' | 'HISTORY' | 'AI_SCAN' | 'SETTINGS'>('CREATE');

  // Active receipt form state
  const [formData, setFormData] = useState<StrukItem>(() => {
    const initialAmount = 100000;
    const initialAdmin = storeConfig.defaultAdminPln || 2500;
    return {
      id: `struk-${Date.now()}`,
      refNo: generateRefNo('LISTRIK'),
      type: 'LISTRIK',
      subType: 'PRABAYAR',
      provider: 'PLN',
      customerId: '538190284712',
      customerName: 'BUDI SANTOSO',
      tariffPower: 'R1 / 1300 VA',
      kwhAmount: calculateKwhEstimate(initialAmount, 'R1 / 1300 VA'),
      tokenNumber: generate20DigitToken(),
      mainAmount: initialAmount,
      adminFee: initialAdmin,
      totalAmount: initialAmount + initialAdmin,
      paymentStatus: 'LUNAS',
      paymentMethod: 'TUNAI',
      transactionDate: new Date().toISOString(),
      createdAt: Date.now(),
    };
  });

  const handleSaveAndPreview = () => {
    const updatedHistory = addReceiptToHistory(formData);
    setHistory(updatedHistory);
    setActiveTab('PREVIEW');
  };

  const handleParsedResultFromAi = (parsedItem: StrukItem) => {
    setFormData(parsedItem);
    const updatedHistory = addReceiptToHistory(parsedItem);
    setHistory(updatedHistory);
    setActiveTab('PREVIEW');
  };

  const handleSelectReceiptFromHistory = (item: StrukItem) => {
    setFormData(item);
    setActiveTab('PREVIEW');
  };

  const handleDeleteReceipt = (id: string) => {
    const updated = deleteReceiptFromHistory(id);
    setHistory(updated);
  };

  const handleClearHistory = () => {
    saveReceiptHistory([]);
    setHistory([]);
  };

  const handleSaveConfig = (newConfig: StoreConfig) => {
    setStoreConfig(newConfig);
    saveStoreConfig(newConfig);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Header Bar */}
      <Header
        activeTab={activeTab === 'PREVIEW' ? 'CREATE' : activeTab}
        setActiveTab={(tab) => {
          if (tab === 'CREATE' && activeTab === 'PREVIEW') {
            // Keep active receipt if coming from preview
            setActiveTab('CREATE');
          } else {
            setActiveTab(tab);
          }
        }}
        storeConfig={storeConfig}
        totalReceiptsCount={history.length}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
        {activeTab === 'CREATE' && (
          <StrukForm
            formData={formData}
            setFormData={setFormData}
            storeConfig={storeConfig}
            onSaveAndPreview={handleSaveAndPreview}
            onOpenAiScan={() => setActiveTab('AI_SCAN')}
          />
        )}

        {activeTab === 'PREVIEW' && (
          <StrukPreview
            struk={formData}
            storeConfig={storeConfig}
            onBackToEdit={() => setActiveTab('CREATE')}
            onSaveHistory={(item) => {
              const updated = addReceiptToHistory(item);
              setHistory(updated);
            }}
          />
        )}

        {activeTab === 'AI_SCAN' && (
          <AiParserModal
            onParsedResult={handleParsedResultFromAi}
            storeConfig={storeConfig}
          />
        )}

        {activeTab === 'HISTORY' && (
          <HistoryList
            history={history}
            storeConfig={storeConfig}
            onSelectReceipt={handleSelectReceiptFromHistory}
            onDeleteReceipt={handleDeleteReceipt}
            onClearHistory={handleClearHistory}
          />
        )}

        {activeTab === 'SETTINGS' && (
          <StoreSettingsModal
            storeConfig={storeConfig}
            onSaveConfig={handleSaveConfig}
          />
        )}
      </main>

      {/* Hidden element for Direct Browser Window Printing (@media print) */}
      <PrintSheet struk={formData} storeConfig={storeConfig} />

      {/* Clean Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            &copy; {new Date().getFullYear()} StrukKilat.id — Aplikasi Cetak Struk PLN & Internet Otomatis
          </div>
          <div className="text-slate-400 font-medium">
            Format Thermal 58mm / 80mm & Standard PDF
          </div>
        </div>
      </footer>
    </div>
  );
}
