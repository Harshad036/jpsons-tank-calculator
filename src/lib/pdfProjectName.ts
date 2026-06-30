import type jsPDF from 'jspdf';

export function drawProjectName(
  doc: jsPDF,
  projectName: string,
  pageWidth: number,
  y: number,
): number {
  const trimmed = projectName.trim();
  if (!trimmed) return y;

  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.text(`Project: ${trimmed}`, pageWidth / 2, y, { align: 'center' });
  return y + 6;
}

export function projectNameFilenamePart(projectName: string): string {
  const slug = projectName
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 40);
  return slug ? `-${slug}` : '';
}
