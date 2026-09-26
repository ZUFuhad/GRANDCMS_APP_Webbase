import { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, Packer, ShadingType, VerticalAlign } from 'docx';
import jsPDF from 'jspdf';
import { toJpeg } from 'html-to-image';
import { Quotation } from '../types';
import { GRAND_COMPANY_INFO } from '../mock/initialData';
import grandLogoPng from '../assets/grand-logo.png';

export interface ExportFileResult {
  success: boolean;
  filename: string;
  error?: string;
}

const formatBDT = (amount: number): string => {
  return `${(amount || 0).toLocaleString('en-IN')}/-`;
};

/**
 * Generates an official editable Microsoft Word (.docx) on Grand Pad
 */
export const exportQuotationToDocx = async (quotation: Quotation): Promise<ExportFileResult> => {
  try {
    const filename = `Quotation_${quotation.quotationNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}_GrandPad.docx`;
    const servicePercent = typeof quotation.agencyCommissionPercent === 'number' ? quotation.agencyCommissionPercent : 10;
    const vatPercent = typeof quotation.vatPercent === 'number' ? quotation.vatPercent : 0;
    const commAmount = (quotation.subtotal * servicePercent) / 100;
    const vatAmount = (quotation.subtotal * vatPercent) / 100;
    const totalAmount = quotation.subtotal + commAmount + vatAmount;

    const thinBorder = {
      style: BorderStyle.SINGLE,
      size: 4,
      color: 'CCCCCC',
    };

    const headerBorder = {
      style: BorderStyle.SINGLE,
      size: 6,
      color: '8B4513',
    };

    // Table rows for Items
    const tableHeaderRow = new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 6, type: WidthType.PERCENTAGE },
          shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
          borders: { top: headerBorder, bottom: headerBorder, left: thinBorder, right: thinBorder },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'SL', bold: true, size: 18 })] })],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
          borders: { top: headerBorder, bottom: headerBorder, left: thinBorder, right: thinBorder },
          children: [new Paragraph({ children: [new TextRun({ text: 'Job', bold: true, size: 18 })] })],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          width: { size: 40, type: WidthType.PERCENTAGE },
          shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
          borders: { top: headerBorder, bottom: headerBorder, left: thinBorder, right: thinBorder },
          children: [new Paragraph({ children: [new TextRun({ text: 'Description', bold: true, size: 18 })] })],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          width: { size: 10, type: WidthType.PERCENTAGE },
          shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
          borders: { top: headerBorder, bottom: headerBorder, left: thinBorder, right: thinBorder },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Qty', bold: true, size: 18 })] })],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          width: { size: 12, type: WidthType.PERCENTAGE },
          shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
          borders: { top: headerBorder, bottom: headerBorder, left: thinBorder, right: thinBorder },
          children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Unit Price', bold: true, size: 18 })] })],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          width: { size: 12, type: WidthType.PERCENTAGE },
          shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
          borders: { top: headerBorder, bottom: headerBorder, left: thinBorder, right: thinBorder },
          children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Total (BDT)', bold: true, size: 18 })] })],
          verticalAlign: VerticalAlign.CENTER,
        }),
      ],
    });

    const itemRows = quotation.items.map((item, index) => {
      return new TableRow({
        children: [
          new TableCell({
            borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${index + 1}.`, size: 18 })] })],
          }),
          new TableCell({
            borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder },
            children: [new Paragraph({ children: [new TextRun({ text: item.job, bold: true, size: 18 })] })],
          }),
          new TableCell({
            borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder },
            children: item.description.split('\n').map((line) => new Paragraph({ children: [new TextRun({ text: line, size: 17 })] })),
          }),
          new TableCell({
            borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${item.quantity}`, size: 18 })] })],
          }),
          new TableCell({
            borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder },
            children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `${item.unitPrice.toLocaleString()}/-`, size: 18 })] })],
          }),
          new TableCell({
            borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder },
            children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `${item.total.toLocaleString()}/-`, bold: true, size: 18 })] })],
          }),
        ],
      });
    });

    // Subtotal Row
    const subtotalRow = new TableRow({
      children: [
        new TableCell({
          columnSpan: 5,
          shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
          borders: { top: headerBorder, bottom: thinBorder, left: thinBorder, right: thinBorder },
          children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Subtotal:', bold: true, size: 18 })] })],
        }),
        new TableCell({
          shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
          borders: { top: headerBorder, bottom: thinBorder, left: thinBorder, right: thinBorder },
          children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatBDT(quotation.subtotal), bold: true, size: 18 })] })],
        }),
      ],
    });

    const itemsTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [tableHeaderRow, ...itemRows, subtotalRow],
    });

    const summaryRowsDocx = [
      new TableRow({
        children: [
          new TableCell({
            borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder },
            children: [new Paragraph({ children: [new TextRun({ text: `Service Charge (${servicePercent}%)`, size: 17 })] })],
          }),
          new TableCell({
            borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder },
            children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatBDT(commAmount), bold: true, size: 17 })] })],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder },
            children: [new Paragraph({ children: [new TextRun({ text: `VAT (${vatPercent}%)`, size: 17 })] })],
          }),
          new TableCell({
            borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder },
            children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatBDT(vatAmount), bold: true, size: 17 })] })],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: 'FEF3C7', type: ShadingType.CLEAR },
            borders: { top: headerBorder, bottom: headerBorder, left: thinBorder, right: thinBorder },
            children: [new Paragraph({ children: [new TextRun({ text: 'Total Amount', bold: true, size: 18, color: '92400E' })] })],
          }),
          new TableCell({
            shading: { fill: 'FEF3C7', type: ShadingType.CLEAR },
            borders: { top: headerBorder, bottom: headerBorder, left: thinBorder, right: thinBorder },
            children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatBDT(totalAmount), bold: true, size: 19, color: '92400E' })] })],
          }),
        ],
      }),
    ];

    if (quotation.advance && quotation.advance > 0) {
      summaryRowsDocx.push(
        new TableRow({
          children: [
            new TableCell({
              borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder },
              children: [new Paragraph({ children: [new TextRun({ text: 'Advance Received', bold: true, size: 17, color: '047857' })] })],
            }),
            new TableCell({
              borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder },
              children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatBDT(quotation.advance), bold: true, size: 17, color: '047857' })] })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: 'FEF2F2', type: ShadingType.CLEAR },
              borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder },
              children: [new Paragraph({ children: [new TextRun({ text: 'Remaining Due Balance', bold: true, size: 17, color: 'B91C1C' })] })],
            }),
            new TableCell({
              shading: { fill: 'FEF2F2', type: ShadingType.CLEAR },
              borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder },
              children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatBDT(quotation.due !== undefined ? quotation.due : Math.max(0, totalAmount - quotation.advance)), bold: true, size: 18, color: 'B91C1C' })] })],
            }),
          ],
        })
      );
    }

    const summaryTable = new Table({
      width: { size: 45, type: WidthType.PERCENTAGE },
      alignment: AlignmentType.RIGHT,
      rows: summaryRowsDocx,
    });

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720,
                bottom: 720,
                left: 720,
                right: 720,
              },
            },
          },
          children: [
            // Grand Pad Official Letterhead Header
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: 'GRAND', bold: true, size: 38, color: 'B45309' }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: 'COMMUNICATION & MARKETING', bold: true, size: 22, color: '1E293B' }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: 'we value what you have to say! • EST. 2004', italics: true, size: 17, color: '64748B' }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: '20 no shop, CDA Market, Kazir Dewri, Chattogram | Cell: +88 01819 312820, +88 01852 486666 | grandecmm@gmail.com', size: 16, color: '64748B' }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 180 },
              children: [
                new TextRun({ text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', color: 'B45309' }),
              ],
            }),

            // Title Banner
            new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: { after: 140 },
              children: [
                new TextRun({ text: '  QUOTATION  ', bold: true, size: 24, color: 'FFFFFF', shading: { fill: '8B4513', type: ShadingType.CLEAR } }),
                new TextRun({ text: `   Ref: ${quotation.quotationNumber}`, bold: true, size: 20, color: '1E293B' }),
              ],
            }),

            // Client & Date Details
            new Paragraph({
              spacing: { after: 60 },
              children: [
                new TextRun({ text: 'TO:\n', bold: true, size: 19 }),
                new TextRun({ text: `${quotation.clientName}\n`, bold: true, size: 20, color: '0F172A' }),
                quotation.clientCompany ? new TextRun({ text: `${quotation.clientCompany}\n`, size: 18, color: '334155' }) : new TextRun({ text: '' }),
                quotation.clientAddress ? new TextRun({ text: `${quotation.clientAddress}\n`, size: 17, color: '475569' }) : new TextRun({ text: '' }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              spacing: { after: 120 },
              children: [
                new TextRun({ text: `Date: ${quotation.date}\n`, bold: true, size: 18 }),
                quotation.validityDate ? new TextRun({ text: `Quotation Validity Until: ${quotation.validityDate}`, size: 17, color: '475569' }) : new TextRun({ text: '' }),
              ],
            }),

            // Subject
            new Paragraph({
              spacing: { after: 160 },
              children: [
                new TextRun({ text: `Subject: Quotation for – ${quotation.subject}`, bold: true, size: 19, color: '8B4513' }),
              ],
            }),

            // Item Table
            itemsTable,

            // NB Note
            new Paragraph({
              spacing: { before: 140, after: 100 },
              children: [
                new TextRun({ text: 'N.B : ', bold: true, size: 18 }),
                new TextRun({ text: quotation.nbText || 'Excluded City corporation Permissions.', italics: true, size: 18 }),
              ],
            }),

            // Terms & Conditions Header
            new Paragraph({
              spacing: { before: 120, after: 60 },
              children: [
                new TextRun({ text: 'Terms & Conditions:', bold: true, size: 18, underline: {} }),
              ],
            }),

            // Terms list
            ...(quotation.termsAndConditions || []).slice(0, 8).map((term, i) =>
              new Paragraph({
                spacing: { after: 30 },
                children: [
                  new TextRun({ text: `${i + 1}. `, bold: true, size: 16 }),
                  new TextRun({ text: term, size: 16, color: '334155' }),
                ],
              })
            ),

            // Summary Table
            new Paragraph({ spacing: { before: 120 } }),
            summaryTable,

            // Signatory Block
            new Paragraph({
              spacing: { before: 300, after: 40 },
              children: [
                new TextRun({ text: 'Authorized Signatory:\n', bold: true, size: 18 }),
                new TextRun({ text: `${quotation.signatoryName || GRAND_COMPANY_INFO.defaultSignatory.name}\n`, bold: true, size: 19, color: '0F172A' }),
                new TextRun({ text: `${quotation.signatoryTitle || GRAND_COMPANY_INFO.defaultSignatory.title}\n`, size: 17, color: '475569' }),
                new TextRun({ text: `Cell # ${quotation.signatoryPhone || GRAND_COMPANY_INFO.defaultSignatory.phone}\n`, size: 17, color: '475569' }),
                new TextRun({ text: 'GRAND Communication & Marketing (Official Pad)', italics: true, size: 15, color: 'B45309' }),
              ],
            }),

            // Official Grand Pad Footer
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 240 },
              children: [
                new TextRun({ text: '───────────────────────────────────────────────────\n', color: 'CBD5E1' }),
                new TextRun({ text: 'GRAND Communication & Marketing • CDA Market, Kazir Dewri, Chattogram • Official Letterhead Document', size: 15, color: '94A3B8' }),
              ],
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, filename };
  } catch (err: any) {
    console.error('Failed to export DOCX:', err);
    return { success: false, filename: '', error: err.message || 'Failed to export DOCX' };
  }
};

/**
 * Generates an official high-fidelity PDF on Grand Pad
 */
export const exportQuotationToPdf = async (quotation: Quotation): Promise<ExportFileResult> => {
  try {
    const filename = `Quotation_${quotation.quotationNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}_GrandPad.pdf`;
    const doc = new jsPDF('p', 'pt', 'a4');
    const primaryColor = [200, 142, 19];
    const darkColor = [30, 41, 59];

    const servicePercent = typeof quotation.agencyCommissionPercent === 'number' ? quotation.agencyCommissionPercent : 10;
    const vatPercent = typeof quotation.vatPercent === 'number' ? quotation.vatPercent : 0;
    const commAmount = (quotation.subtotal * servicePercent) / 100;
    const vatAmount = (quotation.subtotal * vatPercent) / 100;
    const totalAmount = quotation.subtotal + commAmount + vatAmount;

    // Header Top Banner
    doc.setFillColor(139, 69, 19);
    doc.rect(40, 40, 160, 34, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('QUOTATION', 55, 63);

    // Company Header Right - Grand Pad Header
    try {
      const activeLogo = localStorage.getItem('grand_custom_logo') || grandLogoPng;
      doc.addImage(activeLogo, 'PNG', 430, 36, 125, 52);
    } catch {
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(14);
      doc.text('GRAND', 440, 52);
      doc.setFontSize(8.5);
      doc.setTextColor(100, 100, 100);
      doc.text('we value what you have to say!', 380, 64);
      doc.text('EST. 2004', 442, 74);
    }

    // Date & Validity
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text(`Date - ${quotation.date}`, 430, 102);
    if (quotation.validityDate) {
      doc.text(`Quotation Validity Until`, 400, 116);
      doc.text(`${quotation.validityDate}`, 430, 128);
    }

    // Ref No
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`Ref: ${quotation.quotationNumber}`, 40, 90);

    // TO Client Details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TO', 40, 108);
    doc.text(`${quotation.clientName}`, 40, 122);
    doc.setFont('helvetica', 'normal');
    if (quotation.clientCompany && quotation.clientCompany !== quotation.clientName) {
      doc.text(`${quotation.clientCompany}`, 40, 134);
    }
    if (quotation.clientAddress) {
      const splitAddr = doc.splitTextToSize(quotation.clientAddress, 220);
      doc.text(splitAddr, 40, 146);
    }

    // Subject
    let yPos = 175;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(`Quotation for – ${quotation.subject}`, 40, yPos);

    // Table Header
    yPos += 15;
    doc.setFillColor(241, 245, 249);
    doc.rect(40, yPos, 515, 22, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(40, yPos, 515, 22, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('SL', 45, yPos + 15);
    doc.text('Job', 75, yPos + 15);
    doc.text('Description', 145, yPos + 15);
    doc.text('Qty', 370, yPos + 15);
    doc.text('Unit Price', 420, yPos + 15);
    doc.text('Total', 495, yPos + 15);

    yPos += 22;

    // Table Rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);

    quotation.items.forEach((item, index) => {
      const rowHeight = 34;
      doc.rect(40, yPos, 515, rowHeight, 'S');

      doc.text(`${index + 1}.`, 45, yPos + 14);
      doc.setFont('helvetica', 'bold');
      doc.text(item.job, 75, yPos + 14);
      doc.setFont('helvetica', 'normal');

      const descLines = doc.splitTextToSize(item.description, 210);
      doc.text(descLines, 145, yPos + 13);

      doc.text(`${item.quantity}`, 375, yPos + 16);
      doc.text(`${item.unitPrice}/-`, 425, yPos + 16);
      doc.setFont('helvetica', 'bold');
      doc.text(`${item.total.toLocaleString()}`, 495, yPos + 16);
      doc.setFont('helvetica', 'normal');

      yPos += rowHeight;
    });

    // Subtotal Row
    doc.rect(40, yPos, 515, 20, 'S');
    doc.setFont('helvetica', 'bold');
    doc.text('Subtotal', 430, yPos + 14);
    doc.text(`${formatBDT(quotation.subtotal)}`, 485, yPos + 14);
    yPos += 24;

    // N.B text
    if (quotation.nbText) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(`N.B : ${quotation.nbText}`, 40, yPos + 10);
    }

    // Terms & Conditions (Left) & Calculations (Right)
    const termsStartY = yPos + 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Terms & Condition:', 40, termsStartY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    let termY = termsStartY + 12;
    (quotation.termsAndConditions || []).slice(0, 8).forEach((term, idx) => {
      const splitTerm = doc.splitTextToSize(`${idx + 1}. ${term}`, 250);
      doc.text(splitTerm, 40, termY);
      termY += splitTerm.length * 9 + 2;
    });

    // Right Summary Box
    let sumY = termsStartY;
    const rightBoxX = 330;
    const valX = 490;

    const summaryRows: { label: string; val: string; bold?: boolean; color?: number[] }[] = [
      { label: `Service Charge (${servicePercent}%)`, val: `${formatBDT(commAmount)}` },
      { label: `VAT (${vatPercent}%)`, val: `${formatBDT(vatAmount)}` },
      { label: `Total Amount`, val: `${formatBDT(totalAmount)}`, bold: true },
    ];

    if (quotation.advance && quotation.advance > 0) {
      summaryRows.push(
        { label: `Advance Received`, val: `${formatBDT(quotation.advance)}`, bold: true, color: [4, 120, 87] },
        { label: `Remaining Due Balance`, val: `${formatBDT(quotation.due !== undefined ? quotation.due : Math.max(0, totalAmount - quotation.advance))}`, bold: true, color: [185, 28, 28] }
      );
    }

    summaryRows.forEach((r) => {
      doc.rect(rightBoxX, sumY, 225, 18, 'S');
      if (r.color) {
        doc.setTextColor(r.color[0], r.color[1], r.color[2]);
      } else {
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      }
      doc.setFont('helvetica', r.bold ? 'bold' : 'normal');
      doc.setFontSize(8.5);
      doc.text(r.label, rightBoxX + 10, sumY + 12);
      doc.text(r.val, valX, sumY + 12);
      sumY += 18;
    });

    // Signatory
    const sigY = Math.max(termY + 15, sumY + 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(quotation.signatoryName || GRAND_COMPANY_INFO.defaultSignatory.name, 40, sigY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(quotation.signatoryTitle || GRAND_COMPANY_INFO.defaultSignatory.title, 40, sigY + 12);
    doc.text(`Cell # ${quotation.signatoryPhone || GRAND_COMPANY_INFO.defaultSignatory.phone}`, 40, sigY + 24);

    // Footer Address on Grand Pad
    const footerY = 790;
    doc.setDrawColor(220, 220, 220);
    doc.line(40, footerY - 15, 555, footerY - 15);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('No 20 Shop CDA Market, Kazir Dewri, Chottogram | +88 01819 312820 | grandecmm@gmail.com', 75, footerY);

    doc.save(filename);
    return { success: true, filename };
  } catch (err: any) {
    console.error('Failed to export PDF:', err);
    return { success: false, filename: '', error: err.message || 'Failed to export PDF' };
  }
};

/**
 * Generates an official high-resolution JPG image (.jpg) on Grand Pad using html-to-image
 * (natively supports modern CSS colors like oklch, flexbox, and svg)
 */
export const exportQuotationToJpg = async (
  element: HTMLElement,
  quotation: Quotation
): Promise<ExportFileResult> => {
  try {
    const filename = `Quotation_${quotation.quotationNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}_GrandPad.jpg`;

    const dataUrl = await toJpeg(element, {
      quality: 0.95,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      skipFonts: true,
      cacheBust: false,
    });

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true, filename };
  } catch (err: any) {
    console.error('Failed to export JPG with html-to-image:', err);
    return { success: false, filename: '', error: err.message || 'Failed to export JPG' };
  }
};
