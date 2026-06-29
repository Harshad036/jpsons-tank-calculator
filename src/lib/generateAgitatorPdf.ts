import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { AgitatorType } from '../data/agitatorItems';
import { assetUrl } from './assetUrl';
import type { AgitatorLineItem } from './agitatorCalculations';
import { formatCurrency, formatNum } from './agitatorCalculations';

export interface AgitatorPdfData {
  itemTitle: string;
  agitatorType: AgitatorType;
  lineItems: AgitatorLineItem[];
  totalWeight: number;
  totalMaterialAmount: number;
  labourPercent: number;
  labourCost: number;
  motorCost: number;
  gearboxCost: number;
  sealCost: number;
  profitPercent: number;
  profitCost: number;
  finalAmount: number;
}

async function loadImageDataUrl(path: string): Promise<string | null> {
  try {
    const response = await fetch(path);
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function dimCell(value: number | undefined): string {
  return value === undefined ? '—' : formatNum(value);
}

function sizeCell(row: AgitatorLineItem): string {
  if (row.allFieldsEditable) return '—';
  return row.variantLabel;
}

export async function generateAgitatorPdf(data: AgitatorPdfData): Promise<void> {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 14;

  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`Date: ${dateStr}`, pageWidth - 14, y, { align: 'right' });

  const logoData = await loadImageDataUrl(assetUrl('logo.png'));
  const logoWidth = 40;
  const logoHeight = 40;
  if (logoData) {
    doc.addImage(logoData, 'PNG', (pageWidth - logoWidth) / 2, y + 2, logoWidth, logoHeight);
    y += logoHeight + 8;
  }

  doc.setFontSize(12);
  doc.setTextColor(46, 93, 167);
  doc.setFont('helvetica', 'bold');
  doc.text(data.itemTitle, pageWidth / 2, y, { align: 'center' });
  y += 7;

  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'normal');
  doc.text(`Type: ${data.agitatorType}`, pageWidth / 2, y, { align: 'center' });
  y += 10;

  const tableBody = data.lineItems.map((row) => [
    row.name,
    sizeCell(row),
    dimCell(row.diameter),
    dimCell(row.length),
    dimCell(row.width),
    dimCell(row.thickness),
    formatNum(row.result),
    formatNum(row.rate),
    formatCurrency(row.totalAmount),
  ]);

  tableBody.push([
    'Total Weight',
    '',
    '',
    '',
    '',
    '',
    formatNum(data.totalWeight),
    'Total Material Amount',
    formatCurrency(data.totalMaterialAmount),
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Item', 'Size', 'Ø', 'L', 'W', 'THK', 'Result', 'Rate', 'Total Amount']],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [46, 93, 167],
      textColor: 255,
      fontSize: 7,
      fontStyle: 'bold',
    },
    bodyStyles: { fontSize: 7, textColor: [30, 30, 30] },
    columnStyles: {
      0: { cellWidth: 36 },
      6: { halign: 'right' },
      7: { halign: 'right' },
      8: { halign: 'right' },
    },
    margin: { left: 10, right: 10 },
    didParseCell(hook) {
      if (hook.row.index === tableBody.length - 1) {
        hook.cell.styles.fillColor = [255, 243, 205];
        hook.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY ?? y + 40;
  let summaryY = finalY + 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Cost Summary', 14, summaryY);
  summaryY += 6;

  const summaryRows: [string, string][] = [
    ['Total Material Rate', formatCurrency(data.totalMaterialAmount)],
    [`Labour (${data.labourPercent}%)`, formatCurrency(data.labourCost)],
    ['Motor', formatCurrency(data.motorCost)],
    ['Gearbox', formatCurrency(data.gearboxCost)],
    ['Seal', formatCurrency(data.sealCost)],
    [`Profit (${data.profitPercent}%)`, formatCurrency(data.profitCost)],
    ['Final Amount', formatCurrency(data.finalAmount)],
  ];

  autoTable(doc, {
    startY: summaryY,
    body: summaryRows,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 70 },
      1: { halign: 'right' },
    },
    margin: { left: 14, right: 14 },
    didParseCell(hook) {
      if (hook.row.index === 6) {
        hook.cell.styles.fillColor = [232, 163, 23];
        hook.cell.styles.textColor = 255;
        hook.cell.styles.fontStyle = 'bold';
      }
    },
  });

  const filename = `agitator-${data.agitatorType.toLowerCase()}-${dateStr.replace(/\s/g, '-')}.pdf`;
  doc.save(filename);
}
