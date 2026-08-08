export type StrukType = 'LISTRIK' | 'INTERNET';
export type ListrikSubType = 'PRABAYAR' | 'PASCABAYAR';
export type PaperSize = '58mm' | '80mm' | 'A4' | 'CARD';
export type PaymentMethod = 'TUNAI' | 'TRANSFER' | 'QRIS';

export interface StoreConfig {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  footerNote: string;
  logoUrl?: string;
  defaultAdminPln: number;
  defaultAdminInternet: number;
  defaultPaperSize: PaperSize;
}

export interface StrukItem {
  id: string;
  refNo: string;
  type: StrukType;
  subType?: ListrikSubType; // Khusus Listrik
  provider: string; // 'PLN', 'Indihome', 'Biznet', 'First Media', 'MyRepublic', 'Iconnet', 'XL Home', 'RT RW Net', dll
  customerId: string;
  customerName: string;
  
  // Specific for Listrik PLN
  tariffPower?: string; // e.g., 'R1M / 900 VA', 'R1 / 1300 VA'
  standMeter?: string; // e.g., '00012450 - 00012680'
  kwhAmount?: number; // e.g., 68.5
  tokenNumber?: string; // 20 digit token string e.g., '1234-5678-9012-3456-7890'
  
  // Specific for Internet / Tagihan Bulanan
  billPeriod?: string; // e.g., 'AGUSTUS 2026'
  packageName?: string; // e.g., 'Internet Super Fast 50 Mbps'
  ppnAmount?: number; // Biaya PPN
  penaltyFee?: number; // Denda keterlambatan

  // Financials
  mainAmount: number; // Nominal Utama
  adminFee: number; // Biaya Admin
  totalAmount: number; // Total Bayar (mainAmount + adminFee + ppnAmount + penaltyFee)

  paymentStatus: 'LUNAS' | 'PENDING';
  paymentMethod: PaymentMethod;
  transactionDate: string; // ISO String or YYYY-MM-DD HH:mm:ss
  createdAt: number; // timestamp
}
