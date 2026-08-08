import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { PaperSize } from '../types';

export const exportElementToPdf = async (
  elementId: string,
  filename: string,
  paperSize: PaperSize = '58mm'
): Promise<boolean> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with id '${elementId}' not found for PDF export.`);
      return false;
    }

    // Render HTML element to high resolution canvas
    const canvas = await html2canvas(element, {
      scale: 3, // High DPI for sharp text printing
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc) => {
        // Strip or replace oklch color functions in style tags to prevent html2canvas color parsing errors
        const styleTags = Array.from(clonedDoc.getElementsByTagName('style'));
        styleTags.forEach((styleTag) => {
          if (styleTag.textContent && styleTag.textContent.includes('oklch')) {
            styleTag.textContent = styleTag.textContent.replace(/oklch\([^)]+\)/g, '#000000');
          }
        });
        // Ensure the receipt element in cloned document has clean hex background and color
        const clonedEl = clonedDoc.getElementById(elementId);
        if (clonedEl) {
          clonedEl.style.backgroundColor = '#ffffff';
          clonedEl.style.color = '#000000';
        }
      },
    });

    const imgData = canvas.toDataURL('image/png');

    // Calculate dimensions based on paper size
    let pdf: jsPDF;

    if (paperSize === '58mm') {
      // 58mm width thermal paper, dynamic height
      const widthMm = 58;
      const heightMm = Math.max((canvas.height * widthMm) / canvas.width, 100);
      pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [widthMm, heightMm],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, widthMm, heightMm);
    } else if (paperSize === '80mm') {
      // 80mm width thermal paper
      const widthMm = 80;
      const heightMm = Math.max((canvas.height * widthMm) / canvas.width, 120);
      pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [widthMm, heightMm],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, widthMm, heightMm);
    } else if (paperSize === 'CARD') {
      // Wallet / Digital Card (approx 90mm x 140mm)
      const widthMm = 90;
      const heightMm = Math.max((canvas.height * widthMm) / canvas.width, 140);
      pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [widthMm, heightMm],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, widthMm, heightMm);
    } else {
      // Standard A4 Paper
      pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });
      const pageWidthMm = pdf.internal.pageSize.getWidth();
      const marginMm = 15;
      const printWidthMm = pageWidthMm - marginMm * 2;
      const printHeightMm = (canvas.height * printWidthMm) / canvas.width;

      pdf.addImage(imgData, 'PNG', marginMm, marginMm, printWidthMm, printHeightMm);
    }

    pdf.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    return false;
  }
};

export const generatePdfBlob = async (
  elementId: string,
  paperSize: PaperSize = '58mm'
): Promise<Blob | null> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) return null;

    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc) => {
        const styleTags = Array.from(clonedDoc.getElementsByTagName('style'));
        styleTags.forEach((styleTag) => {
          if (styleTag.textContent && styleTag.textContent.includes('oklch')) {
            styleTag.textContent = styleTag.textContent.replace(/oklch\([^)]+\)/g, '#000000');
          }
        });
        const clonedEl = clonedDoc.getElementById(elementId);
        if (clonedEl) {
          clonedEl.style.backgroundColor = '#ffffff';
          clonedEl.style.color = '#000000';
        }
      },
    });

    const imgData = canvas.toDataURL('image/png');
    let pdf: jsPDF;

    if (paperSize === '58mm') {
      const widthMm = 58;
      const heightMm = Math.max((canvas.height * widthMm) / canvas.width, 100);
      pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: [widthMm, heightMm] });
      pdf.addImage(imgData, 'PNG', 0, 0, widthMm, heightMm);
    } else if (paperSize === '80mm') {
      const widthMm = 80;
      const heightMm = Math.max((canvas.height * widthMm) / canvas.width, 120);
      pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: [widthMm, heightMm] });
      pdf.addImage(imgData, 'PNG', 0, 0, widthMm, heightMm);
    } else if (paperSize === 'CARD') {
      const widthMm = 90;
      const heightMm = Math.max((canvas.height * widthMm) / canvas.width, 140);
      pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: [widthMm, heightMm] });
      pdf.addImage(imgData, 'PNG', 0, 0, widthMm, heightMm);
    } else {
      pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const pageWidthMm = pdf.internal.pageSize.getWidth();
      const marginMm = 15;
      const printWidthMm = pageWidthMm - marginMm * 2;
      const printHeightMm = (canvas.height * printWidthMm) / canvas.width;
      pdf.addImage(imgData, 'PNG', marginMm, marginMm, printWidthMm, printHeightMm);
    }

    return pdf.output('blob');
  } catch (error) {
    console.error('Failed to create PDF blob:', error);
    return null;
  }
};
