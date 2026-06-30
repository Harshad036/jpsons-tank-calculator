import type jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const PDF_BOTTOM_MARGIN = 8;

export function getLastAutoTableFinalY(doc: jsPDF, fallback: number): number {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (doc as any).lastAutoTable?.finalY ?? fallback;
}

export interface PdfSummaryOptions {
  /** Row index in summary body to highlight as grand total (gold) */
  grandTotalRowIndex: number;
  /** Optional second highlighted row (e.g. tank volume) */
  accentRowIndex?: number;
}

/** Compact cost summary block — kept together on one page when possible */
export function drawPdfSummarySection(
  doc: jsPDF,
  startY: number,
  rows: [string, string][],
  options: PdfSummaryOptions,
): void {
  const pageHeight = doc.internal.pageSize.getHeight();
  const estimatedHeight = 7 + rows.length * 5.5;
  let summaryStart = startY + 2;

  if (summaryStart + estimatedHeight > pageHeight - PDF_BOTTOM_MARGIN) {
    summaryStart = Math.max(startY + 1, pageHeight - PDF_BOTTOM_MARGIN - estimatedHeight);
  }

  autoTable(doc, {
    startY: summaryStart,
    head: [['Cost Summary', '']],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [46, 93, 167],
      textColor: 255,
      fontSize: 9,
      fontStyle: 'bold',
      cellPadding: 2,
    },
    styles: {
      fontSize: 9,
      cellPadding: 2,
      lineColor: [210, 210, 210] as [number, number, number],
      lineWidth: 0.1,
      minCellHeight: 5.5,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 72 },
      1: { halign: 'right' },
    },
    margin: { left: 14, right: 14, bottom: PDF_BOTTOM_MARGIN },
    rowPageBreak: 'avoid',
    showHead: 'firstPage',
    didParseCell(hook) {
      if (hook.section === 'body' && hook.row.index === options.grandTotalRowIndex) {
        hook.cell.styles.fillColor = [232, 163, 23];
        hook.cell.styles.textColor = 255;
        hook.cell.styles.fontStyle = 'bold';
      }
      if (
        hook.section === 'body' &&
        options.accentRowIndex !== undefined &&
        hook.row.index === options.accentRowIndex
      ) {
        hook.cell.styles.fillColor = [230, 240, 250];
        hook.cell.styles.fontStyle = 'bold';
      }
    },
  });
}

export const PDF_MAIN_TABLE_STYLES = {
  theme: 'grid' as const,
  bodyStyles: { fontSize: 8, textColor: [30, 30, 30] as [number, number, number], cellPadding: 1.8, minCellHeight: 5.5 },
  styles: { lineColor: [210, 210, 210] as [number, number, number], lineWidth: 0.1, cellPadding: 1.8 },
  rowPageBreak: 'avoid' as const,
};
