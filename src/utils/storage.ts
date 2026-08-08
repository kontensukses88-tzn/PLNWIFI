import { StrukItem, StoreConfig } from '../types';

const STORE_CONFIG_KEY = 'struk_store_config_v1';
const RECEIPT_HISTORY_KEY = 'struk_receipt_history_v1';

export const DEFAULT_STORE_CONFIG: StoreConfig = {
  storeName: 'KIOS BERKAH PPOB & CELL',
  storeAddress: 'Jl. Raya Merdeka No. 88, Jakarta Selatan',
  storePhone: '0812-3456-7890',
  footerNote: 'Struk ini merupakan bukti pembayaran yang sah. Terima kasih!',
  defaultAdminPln: 2500,
  defaultAdminInternet: 3000,
  defaultPaperSize: '58mm',
};

export const SAMPLE_RECEIPTS: StrukItem[] = [
  {
    id: 'sample-1',
    refNo: 'PLN-20260807-1092',
    type: 'LISTRIK',
    subType: 'PRABAYAR',
    provider: 'PLN',
    customerId: '538190284712',
    customerName: 'BUDI SANTOSO',
    tariffPower: 'R1 / 1300 VA',
    kwhAmount: 68.5,
    tokenNumber: '8492-1049-3820-1928-4019',
    mainAmount: 100000,
    adminFee: 2500,
    totalAmount: 102500,
    paymentStatus: 'LUNAS',
    paymentMethod: 'TUNAI',
    transactionDate: new Date().toISOString(),
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'sample-2',
    refNo: 'INET-20260807-4821',
    type: 'INTERNET',
    provider: 'Indihome',
    customerId: '122938401928',
    customerName: 'SITI RAHMAWATI',
    packageName: 'Indihome 50 Mbps + TV',
    billPeriod: 'AGUSTUS 2026',
    mainAmount: 375000,
    adminFee: 3000,
    ppnAmount: 41250,
    totalAmount: 419250,
    paymentStatus: 'LUNAS',
    paymentMethod: 'QRIS',
    transactionDate: new Date(Date.now() - 3600000 * 5).toISOString(),
    createdAt: Date.now() - 3600000 * 5,
  },
  {
    id: 'sample-3',
    refNo: 'PLN-20260806-9931',
    type: 'LISTRIK',
    subType: 'PASCABAYAR',
    provider: 'PLN',
    customerId: '531102938401',
    customerName: 'AHPAD WIJAYA',
    tariffPower: 'R1M / 900 VA',
    billPeriod: 'AGUSTUS 2026',
    standMeter: '00012480 - 00012650',
    mainAmount: 245000,
    adminFee: 2500,
    totalAmount: 247500,
    paymentStatus: 'LUNAS',
    paymentMethod: 'TRANSFER',
    transactionDate: new Date(Date.now() - 86400000).toISOString(),
    createdAt: Date.now() - 86400000,
  },
];

export const loadStoreConfig = (): StoreConfig => {
  try {
    const saved = localStorage.getItem(STORE_CONFIG_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading store config:', e);
  }
  return DEFAULT_STORE_CONFIG;
};

export const saveStoreConfig = (config: StoreConfig): void => {
  try {
    localStorage.setItem(STORE_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving store config:', e);
  }
};

export const loadReceiptHistory = (): StrukItem[] => {
  try {
    const saved = localStorage.getItem(RECEIPT_HISTORY_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading history:', e);
  }
  // Default sample history if empty
  saveReceiptHistory(SAMPLE_RECEIPTS);
  return SAMPLE_RECEIPTS;
};

export const saveReceiptHistory = (history: StrukItem[]): void => {
  try {
    localStorage.setItem(RECEIPT_HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Error saving history:', e);
  }
};

export const addReceiptToHistory = (item: StrukItem): StrukItem[] => {
  const current = loadReceiptHistory();
  // Check if exists -> replace, else prepend
  const existsIdx = current.findIndex((r) => r.id === item.id);
  let updated: StrukItem[];
  if (existsIdx >= 0) {
    updated = [...current];
    updated[existsIdx] = item;
  } else {
    updated = [item, ...current];
  }
  saveReceiptHistory(updated);
  return updated;
};

export const deleteReceiptFromHistory = (id: string): StrukItem[] => {
  const current = loadReceiptHistory();
  const updated = current.filter((item) => item.id !== id);
  saveReceiptHistory(updated);
  return updated;
};
