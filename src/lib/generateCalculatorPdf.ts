import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { assetUrl } from './assetUrl';
import { drawProjectName, projectNameFilenamePart } from './pdfProjectName';
import { PDF_MAIN_TABLE_STYLES, drawPdfSummarySection, getLastAutoTableFinalY } from './pdfLayout';
import type { ComponentParams, LegParams, LineItemResult } from './mixingTankCalculations';
import { formatCurrency, formatNum } from './mixingTankCalculations';

export interface CalculatorPdfData {
  itemTitle: string;
  projectName: string;
  ltr: number;
  diameter: number;
  height: number;
  thickness: number;
  topThickness: number;
  topRing: ComponentParams;
  legPad: ComponentParams;
  basePlate: ComponentParams;
  leg: LegParams;
  lineItems: LineItemResult[];
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

function getRowParams(
  rowId: string,
  topThickness: number,
  topRing: ComponentParams,
  legPad: ComponentParams,
  basePlate: ComponentParams,
  leg: LegParams,
): { w: string; thk: string; qtyL: string } {
  switch (rowId) {
    case 'top':
      return { w: '—', thk: String(topThickness), qtyL: '—' };
    case 'topRing':
      return { w: String(topRing.w), thk: String(topRing.thk), qtyL: '—' };
    case 'legPad':
      return { w: String(legPad.w), thk: String(legPad.thk), qtyL: String(legPad.qty) };
    case 'basePlate':
      return { w: String(basePlate.w), thk: String(basePlate.thk), qtyL: String(basePlate.qty) };
    case 'leg':
      return { w: String(leg.w), thk: String(leg.thk), qtyL: String(leg.l) };
    default:
      return { w: '—', thk: '—', qtyL: '—' };
  }
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

export async function generateCalculatorPdf(data: CalculatorPdfData): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
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
  const logoWidth = 36;
  const logoHeight = 36;
  if (logoData) {
    const logoX = (pageWidth - logoWidth) / 2;
    doc.addImage(logoData, 'PNG', logoX, y + 3, logoWidth, logoHeight);
    y += logoHeight + 6;
  }

  doc.setFontSize(12);
  doc.setTextColor(46, 93, 167);
  doc.setFont('helvetica', 'bold');
  doc.text(data.itemTitle, pageWidth / 2, y, { align: 'center' });
  y += 6;

  y = drawProjectName(doc, data.projectName, pageWidth, y);
  if (data.projectName.trim()) y += 2;

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
  y += 7;

  const tableBody = data.lineItems.map((row) => {
    const params = getRowParams(
      row.id,
      data.topThickness,
      data.topRing,
      data.legPad,
      data.basePlate,
      data.leg,
    );
    return [
      row.name,
      params.w,
      params.thk,
      params.qtyL,
      formatNum(row.result),
      formatNum(row.rate),
      formatCurrency(row.totalAmount),
    ];
  });

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
    head: [['Item', 'W', 'THK', 'QTY / L', 'Result', 'Rate', 'Total Amount']],
    body: tableBody,
    ...PDF_MAIN_TABLE_STYLES,
    headStyles: {
      fillColor: [46, 93, 167],
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 2,
    },
    bodyStyles: { fontSize: 8, textColor: [30, 30, 30] as [number, number, number], cellPadding: 1.8, minCellHeight: 5.5 },
    columnStyles: {
      0: { cellWidth: 38 },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' },
    },
    margin: { left: 14, right: 14, bottom: 4 },
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
      ['Total Material Rate', formatCurrency(data.totalMaterialAmount)],
      [`Labour Cost (${data.labourPercent}%)`, formatCurrency(data.labourCost)],
      ['Agitator Cost', formatCurrency(data.agitatorCost)],
      ['Panel Cost', formatCurrency(data.panelCost)],
      ['Micelinious Cost', formatCurrency(data.miscCost)],
      ['Grand Total', formatCurrency(data.grandTotal)],
      ['Tank Volume (LTR)', `${formatNum(data.tankVolume)} L`],
    ],
    { grandTotalRowIndex: 5, accentRowIndex: 6 },
  );

  const filename = `mixing-tank${projectNameFilenamePart(data.projectName)}-${data.ltr}L-${dateStr.replace(/\s/g, '-')}.pdf`;
  doc.save(filename);
}
