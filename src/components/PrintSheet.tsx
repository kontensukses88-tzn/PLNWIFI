import React from 'react';
import { StrukItem, StoreConfig } from '../types';
import { formatDateIndonesian, formatRupiah } from '../utils/formatters';

interface PrintSheetProps {
  struk: StrukItem;
  storeConfig: StoreConfig;
}

export const PrintSheet: React.FC<PrintSheetProps> = ({ struk, storeConfig }) => {
  return (
    <div id="print-sheet-wrapper" className="hidden print:block text-black bg-white font-mono text-xs p-2">
      {/* Header */}
      <div className="text-center pb-2 border-b border-black">
        <div className="font-bold text-sm uppercase">{storeConfig.storeName}</div>
        {storeConfig.storeAddress && <div className="text-[10px]">{storeConfig.storeAddress}</div>}
        {storeConfig.storePhone && <div className="text-[10px]">Telp: {storeConfig.storePhone}</div>}
      </div>

      <div className="text-center py-1.5 my-1 font-bold uppercase border-b border-black text-[11px]">
        STRUK BUKTI PEMBAYARAN {struk.type}
      </div>

      {/* Metadata */}
      <div className="space-y-1 py-1 border-b border-black">
        <div className="flex justify-between">
          <span>No. Ref:</span>
          <span className="font-bold">{struk.refNo}</span>
        </div>
        <div className="flex justify-between">
          <span>Tanggal:</span>
          <span>{formatDateIndonesian(struk.transactionDate)}</span>
        </div>
        <div className="flex justify-between">
          <span>Provider:</span>
          <span className="font-bold">{struk.provider}</span>
        </div>
      </div>

      {/* Customer Info */}
      <div className="space-y-1 py-1 border-b border-black">
        <div className="flex justify-between">
          <span>ID Pelanggan:</span>
          <span className="font-bold">{struk.customerId}</span>
        </div>
        <div className="flex justify-between">
          <span>Nama:</span>
          <span className="font-bold uppercase">{struk.customerName}</span>
        </div>
        {struk.type === 'LISTRIK' ? (
          <>
            {struk.tariffPower && (
              <div className="flex justify-between">
                <span>Daya:</span>
                <span>{struk.tariffPower}</span>
              </div>
            )}
            {struk.subType === 'PASCABAYAR' && (
              <>
                {struk.billPeriod && (
                  <div className="flex justify-between">
                    <span>Periode:</span>
                    <span>{struk.billPeriod}</span>
                  </div>
                )}
                {struk.standMeter && (
                  <div className="flex justify-between">
                    <span>Stand Meter:</span>
                    <span>{struk.standMeter}</span>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {struk.packageName && (
              <div className="flex justify-between">
                <span>Paket:</span>
                <span>{struk.packageName}</span>
              </div>
            )}
            {struk.billPeriod && (
              <div className="flex justify-between">
                <span>Periode:</span>
                <span>{struk.billPeriod}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Token Box */}
      {struk.type === 'LISTRIK' && struk.subType === 'PRABAYAR' && (
        <div className="my-2 p-2 border-2 border-black text-center">
          <div className="text-[9px] font-bold">STROOM / TOKEN PLN</div>
          <div className="text-sm font-bold font-mono tracking-wider py-1">
            {struk.tokenNumber || '---- ---- ---- ---- ----'}
          </div>
          {struk.kwhAmount && <div className="text-[10px] font-bold">KWH: {struk.kwhAmount} kWh</div>}
        </div>
      )}

      {/* Cost Breakdown */}
      <div className="space-y-1 py-1 border-b border-black">
        <div className="flex justify-between">
          <span>Tagihan Utama:</span>
          <span>{formatRupiah(struk.mainAmount)}</span>
        </div>
        {struk.ppnAmount ? (
          <div className="flex justify-between">
            <span>PPN:</span>
            <span>{formatRupiah(struk.ppnAmount)}</span>
          </div>
        ) : null}
        {struk.penaltyFee ? (
          <div className="flex justify-between">
            <span>Denda:</span>
            <span>{formatRupiah(struk.penaltyFee)}</span>
          </div>
        ) : null}
        <div className="flex justify-between">
          <span>Biaya Admin:</span>
          <span>{formatRupiah(struk.adminFee)}</span>
        </div>
        <div className="pt-1 mt-1 border-t border-black flex justify-between font-bold text-sm">
          <span>TOTAL BAYAR:</span>
          <span>{formatRupiah(struk.totalAmount)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="py-1 text-center text-[10px] font-bold uppercase">
        STATUS: {struk.paymentStatus} ({struk.paymentMethod})
      </div>
      <div className="text-center text-[9px] pt-1 border-t border-black">
        {storeConfig.footerNote || 'Struk ini merupakan bukti pembayaran yang sah.'}
      </div>
    </div>
  );
};
