import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { assetUrl } from './assetUrl';
import type { JacketedLineItem } from './jacketedTankCalculations';
import { formatCurrency, formatNum } from './jacketedTankCalculations';

export interface JacketedPdfData {
  itemTitle: string;
  ltr: number;
  diameter: number;
  height: number;
  thickness: number;
  lineItems: JacketedLineItem[];
  totalWeight: number;
  totalMaterialAmount: number;
  labourPercent: number;
  labourCost: number;
  agitatorCost: number;
  panelCost: number;
  miscCost: number;
  grandTotal: number;
  tankVolume: number;
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

export async function generateJacketedPdf(data: JacketedPdfData): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
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
  const logoWidth = 48;
  const logoHeight = 48;
  if (logoData) {
    doc.addImage(logoData, 'PNG', (pageWidth - logoWidth) / 2, y + 4, logoWidth, logoHeight);
    y += logoHeight + 10;
  }

  doc.setFontSize(12);
  doc.setTextColor(46, 93, 167);
  doc.setFont('helvetica', 'bold');
  doc.text(data.itemTitle, pageWidth / 2, y, { align: 'center' });
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'normal');
  const inputs = [
    `LTR: ${data.ltr} L`,
    `Ø: ${data.diameter} mm`,
    `H: ${data.height} mm`,
    `THK: ${data.thickness} mm`,
  ];
  doc.text(inputs.join('   |   '), 14, y);
  y += 10;

  const tableBody = data.lineItems.map((row) => [
    row.name,
    formatNum(row.l, row.l > 1000 ? 0 : 2),
    formatNum(row.w, row.w > 1000 ? 0 : 2),
    formatNum(row.h, 2),
    formatNum(row.result),
    formatNum(row.rate),
    formatCurrency(row.totalAmount),
  ]);

  tableBody.push([
    'Total Weight',
    '',
    '',
    '',
    formatNum(data.totalWeight),
    'Total Material Amount',
    formatCurrency(data.totalMaterialAmount),
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Item', 'L', 'W', 'H', 'Result', 'Rate', 'Total Amount']],
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
      0: { cellWidth: 32 },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' },
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
    [`Labour Cost (${data.labourPercent}%)`, formatCurrency(data.labourCost)],
    ['Agitator Cost', formatCurrency(data.agitatorCost)],
    ['Panel Cost', formatCurrency(data.panelCost)],
    ['Micelinious Cost', formatCurrency(data.miscCost)],
    ['Grand Total', formatCurrency(data.grandTotal)],
    ['Tank Volume (LTR)', `${formatNum(data.tankVolume)} L`],
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
      if (hook.row.index === 5) {
        hook.cell.styles.fillColor = [232, 163, 23];
        hook.cell.styles.textColor = 255;
        hook.cell.styles.fontStyle = 'bold';
      }
      if (hook.row.index === 6) {
        hook.cell.styles.fillColor = [230, 240, 250];
        hook.cell.styles.fontStyle = 'bold';
      }
    },
  });

  const filename = `jacketed-tank-${data.ltr}L-${dateStr.replace(/\s/g, '-')}.pdf`;
  doc.save(filename);
}
