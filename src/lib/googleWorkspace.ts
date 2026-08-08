import { StrukItem } from '../types';

export interface GoogleSheetsExportResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

export interface GoogleDriveUploadResult {
  fileId: string;
  webViewLink: string;
  fileName: string;
}

/**
 * Export receipts to Google Sheets using Google Sheets REST API
 */
export async function exportReceiptsToGoogleSheets(
  receipts: StrukItem[],
  storeName: string,
  accessToken: string
): Promise<GoogleSheetsExportResult> {
  if (!accessToken) {
    throw new Error('Akses token Google tidak ditemukan. Silakan login kembali dengan akun Google.');
  }

  const title = `Laporan Struk Toko - ${storeName || 'Kios'} (${new Date().toLocaleDateString('id-ID')})`;

  // 1. Create a new Spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: 'Riwayat Struk',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(err.error?.message || 'Gagal membuat Google Sheets spreadsheet.');
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl;

  // 2. Format Header and Data rows
  const headers = [
    'No',
    'Tanggal & Waktu',
    'No. Referensi',
    'Jenis Struk',
    'Nama Pelanggan',
    'ID Pelanggan / No. Meter',
    'Layanan / Tarif / Paket',
    'Tagihan Utama (Rp)',
    'Biaya Admin (Rp)',
    'PPN (Rp)',
    'Denda (Rp)',
    'Total Bayar (Rp)',
    'Status',
    'Metode Bayar',
  ];

  const rows = receipts.map((r, index) => [
    index + 1,
    r.transactionDate,
    r.refNo,
    r.type,
    r.customerName,
    r.customerId,
    r.type === 'LISTRIK' ? (r.tariffPower || r.provider) : (r.packageName || r.provider),
    r.mainAmount,
    r.adminFee,
    r.ppnAmount || 0,
    r.penaltyFee || 0,
    r.totalAmount,
    r.paymentStatus,
    r.paymentMethod,
  ]);

  const values = [headers, ...rows];

  // 3. Update values in spreadsheet
  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Riwayat Struk!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values,
      }),
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.json();
    throw new Error(err.error?.message || 'Gagal mengisi data ke Google Sheets.');
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
  };
}

/**
 * Upload a PDF blob to Google Drive folder "Struk Pembayaran Toko"
 */
export async function uploadPdfToGoogleDrive(
  pdfBlob: Blob,
  fileName: string,
  accessToken: string
): Promise<GoogleDriveUploadResult> {
  if (!accessToken) {
    throw new Error('Akses token Google tidak ditemukan. Silakan login kembali dengan akun Google.');
  }

  // 1. Search or create folder "Struk Pembayaran Toko"
  let folderId: string | null = null;

  const folderQueryRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='Struk Pembayaran Toko' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (folderQueryRes.ok) {
    const folderData = await folderQueryRes.json();
    if (folderData.files && folderData.files.length > 0) {
      folderId = folderData.files[0].id;
    }
  }

  if (!folderId) {
    const createFolderRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Struk Pembayaran Toko',
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });

    if (createFolderRes.ok) {
      const folderCreated = await createFolderRes.json();
      folderId = folderCreated.id;
    }
  }

  // 2. Prepare Multipart Body for Upload
  const metadata = {
    name: fileName,
    mimeType: 'application/pdf',
    ...(folderId ? { parents: [folderId] } : {}),
  };

  const formData = new FormData();
  formData.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  formData.append('file', pdfBlob);

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    }
  );

  if (!uploadRes.ok) {
    const err = await uploadRes.json();
    throw new Error(err.error?.message || 'Gagal mengunggah file ke Google Drive.');
  }

  const fileResult = await uploadRes.json();

  return {
    fileId: fileResult.id,
    webViewLink: fileResult.webViewLink || `https://drive.google.com/file/d/${fileResult.id}/view`,
    fileName: fileResult.name,
  };
}
