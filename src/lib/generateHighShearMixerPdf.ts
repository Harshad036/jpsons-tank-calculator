import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { assetUrl } from './assetUrl';
import { drawProjectName, projectNameFilenamePart } from './pdfProjectName';
import { PDF_MAIN_TABLE_STYLES, drawPdfSummarySection, getLastAutoTableFinalY } from './pdfLayout';
import type { HsmLineItem } from './highShearMixerCalculations';
import { formatCurrency, formatNum } from './highShearMixerCalculations';

export interface HighShearMixerPdfData {
  itemTitle: string;
  projectName: string;
  lineItems: HsmLineItem[];
  totalWeight: number;
  totalMaterialAmount: number;
  labourPercent: number;
  labourCost: number;
  motorCost: number;
  rotorCost: number;
  miscCost: number;
  profitPercent: number;
  profitCost: number;
  grandTotal: number;
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

function sizeCell(row: HsmLineItem): string {
  if (row.allFieldsEditable && !row.hasVariantChoice) return '—';
  return row.variantLabel;
}

export async function generateHighShearMixerPdf(data: HighShearMixerPdfData): Promise<void> {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 14;

  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Date: ${dateStr}`, pageWidth - 14, y, { align: 'right' });

  const logoData = await loadImageDataUrl(assetUrl('logo.png'));
  const logoWidth = 32;
  const logoHeight = 32;
  if (logoData) {
    doc.addImage(logoData, 'PNG', (pageWidth - logoWidth) / 2, y + 2, logoWidth, logoHeight);
    y += logoHeight + 5;
  }

  doc.setFontSize(12);
  doc.setTextColor(46, 93, 167);
  doc.setFont('helvetica', 'bold');
  doc.text(data.itemTitle, pageWidth / 2, y, { align: 'center' });
  y += 6;

  y = drawProjectName(doc, data.projectName, pageWidth, y);
  if (data.projectName.trim()) y += 2;

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
    'Total Material Cost',
    formatCurrency(data.totalMaterialAmount),
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Item', 'Size', 'Ø', 'L', 'W', 'THK', 'Result', 'Rate', 'Total Amount']],
    body: tableBody,
    ...PDF_MAIN_TABLE_STYLES,
    headStyles: {
      fillColor: [46, 93, 167],
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 36 },
      6: { halign: 'right' },
      7: { halign: 'right' },
      8: { halign: 'right' },
    },
    margin: { left: 10, right: 10, bottom: 4 },
    didParseCell(hook) {
      if (hook.row.index === tableBody.length - 1) {
        hook.cell.styles.fillColor = [255, 243, 205];
        hook.cell.styles.fontStyle = 'bold';
      }
    },
  });

  const finalY = getLastAutoTableFinalY(doc, y + 40);

  drawPdfSummarySection(
    doc,
    finalY,
    [
      ['Total Material Cost', formatCurrency(data.totalMaterialAmount)],
      [`Labour (${data.labourPercent}%)`, formatCurrency(data.labourCost)],
      ['Motor', formatCurrency(data.motorCost)],
      ['Rotor', formatCurrency(data.rotorCost)],
      ['Miscellaneous', formatCurrency(data.miscCost)],
      [`Profit (${data.profitPercent}%)`, formatCurrency(data.profitCost)],
      ['Grand Total', formatCurrency(data.grandTotal)],
    ],
    { grandTotalRowIndex: 6 },
  );

  const filename = `high-shear-mixer${projectNameFilenamePart(data.projectName)}-${dateStr.replace(/\s/g, '-')}.pdf`;
  doc.save(filename);
}
