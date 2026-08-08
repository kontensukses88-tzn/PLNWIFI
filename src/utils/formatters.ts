import { StrukItem, StoreConfig } from '../types';

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (amount: number): string => {
  return new Intl.NumberFormat('id-ID').format(amount);
};

export const generateRefNo = (type: 'LISTRIK' | 'INTERNET'): string => {
  const prefix = type === 'LISTRIK' ? 'PLN' : 'INET';
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${dateStr}-${randomDigits}`;
};

export const generate20DigitToken = (): string => {
  const digits = Array.from({ length: 20 }, () => Math.floor(Math.random() * 10)).join('');
  return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}-${digits.slice(12, 16)}-${digits.slice(16, 20)}`;
};

export const calculateKwhEstimate = (mainAmount: number, tariffPower: string): number => {
  // Approximate tariff PLN rates per KWH (approx 2026 rates)
  let rate = 1444.70; // R1/900VA or 1300VA average
  if (tariffPower.includes('450')) rate = 415;
  if (tariffPower.includes('900') && !tariffPower.includes('R1M')) rate = 605;
  if (tariffPower.includes('1300') || tariffPower.includes('2200')) rate = 1444.70;
  if (tariffPower.includes('3500') || tariffPower.includes('5500')) rate = 1700;

  // Subtract PPJ (~3% average)
  const netNominal = mainAmount * 0.97;
  const kwh = netNominal / rate;
  return Math.round(kwh * 10) / 10;
};

export const formatDateIndonesian = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const formatWhatsAppText = (struk: StrukItem, store: StoreConfig): string => {
  let text = `=============================\n`;
  text += `*${store.storeName.toUpperCase()}*\n`;
  if (store.storeAddress) text += `${store.storeAddress}\n`;
  if (store.storePhone) text += `Telp/WA: ${store.storePhone}\n`;
  text += `=============================\n`;
  text += `*STRUK BUKTI PEMBAYARAN ${struk.type}*\n\n`;
  text += `*No. Ref:* ${struk.refNo}\n`;
  text += `*Tanggal:* ${formatDateIndonesian(struk.transactionDate)}\n`;
  text += `*Provider:* ${struk.provider}\n`;
  
  if (struk.type === 'LISTRIK') {
    text += `*Jenis:* PLN ${struk.subType === 'PRABAYAR' ? 'PRABAYAR / TOKEN' : 'PASCABAYAR'}\n`;
    text += `*ID Pelanggan:* ${struk.customerId}\n`;
    text += `*Nama:* ${struk.customerName}\n`;
    if (struk.tariffPower) text += `*Tarif/Daya:* ${struk.tariffPower}\n`;
    
    if (struk.subType === 'PRABAYAR') {
      text += `\n-----------------------------\n`;
      text += `*NO. TOKEN PLN:*\n`;
      text += `*${struk.tokenNumber || '-'}*\n`;
      text += `-----------------------------\n`;
      if (struk.kwhAmount) text += `*Jumlah KWH:* ${struk.kwhAmount} kWh\n`;
    } else {
      if (struk.billPeriod) text += `*Periode:* ${struk.billPeriod}\n`;
      if (struk.standMeter) text += `*Stand Meter:* ${struk.standMeter}\n`;
    }
  } else {
    text += `*ID Pelanggan:* ${struk.customerId}\n`;
    text += `*Nama:* ${struk.customerName}\n`;
    if (struk.packageName) text += `*Paket:* ${struk.packageName}\n`;
    if (struk.billPeriod) text += `*Periode:* ${struk.billPeriod}\n`;
  }

  text += `\n*RINCIAN BIAYA:*\n`;
  text += `- Tagihan Utama: ${formatRupiah(struk.mainAmount)}\n`;
  if (struk.ppnAmount) text += `- PPN: ${formatRupiah(struk.ppnAmount)}\n`;
  if (struk.penaltyFee) text += `- Denda: ${formatRupiah(struk.penaltyFee)}\n`;
  text += `- Biaya Admin: ${formatRupiah(struk.adminFee)}\n`;
  text += `-----------------------------\n`;
  text += `*TOTAL BAYAR: ${formatRupiah(struk.totalAmount)}*\n`;
  text += `*Status:* ${struk.paymentStatus} (${struk.paymentMethod})\n`;
  text += `=============================\n`;
  text += `${store.footerNote || 'Terima kasih atas pembayaran Anda.'}\n`;

  return text;
};
