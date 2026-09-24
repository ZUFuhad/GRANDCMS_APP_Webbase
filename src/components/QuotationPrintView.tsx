import React from 'react';
import { Quotation, Invoice } from '../types';
import { GrandLogo } from './GrandLogo';
import { GRAND_COMPANY_INFO } from '../mock/initialData';
import { Printer, Download, FileText, CheckCircle2, X } from 'lucide-react';
import jsPDF from 'jspdf';

interface QuotationPrintViewProps {
  document: Quotation | Invoice;
  type: 'Quotation' | 'Invoice';
  onClose?: () => void;
  onConvertToInvoice?: (quotation: Quotation) => void;
}

export const QuotationPrintView: React.FC<QuotationPrintViewProps> = ({
  document,
  type,
  onClose,
  onConvertToInvoice,
}) => {
  const isInvoice = type === 'Invoice';

  const formatMoney = (amount: number) => {
    return amount.toLocaleString('en-IN') + '/-';
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDoc = () => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>${type} - ${document.clientName}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; padding: 20px; }
          .header-title { background: #8B4513; color: white; padding: 8px 24px; display: inline-block; font-size: 24px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #333; padding: 8px; font-size: 13px; }
          th { background: #f1f5f9; }
          .text-right { text-align: right; }
          .terms { font-size: 11px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div style="display:flex; justify-content:space-between;">
          <div class="header-title">${type.toUpperCase()}</div>
          <div style="text-align:right;">
            <h2>GRAND Communication & Marketing</h2>
            <p>20 No Shop CDA Market, Kazir Dewri, Chattogram</p>
          </div>
        </div>
        <p><strong>TO:</strong> ${document.clientName} (${document.clientCompany || ''})</p>
        <p><strong>Date:</strong> ${document.date}</p>
        <p><strong>Subject:</strong> ${document.subject}</p>
        <table>
          <thead>
            <tr>
              <th>SL</th><th>Job</th><th>Description</th><th>Qty</th><th>Unit Price</th><th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${document.items
              .map(
                (item, idx) => `
              <tr>
                <td>${idx + 1}.</td>
                <td><strong>${item.job}</strong></td>
                <td>${item.description.replace(/\n/g, '<br/>')}</td>
                <td style="text-align:center;">${item.quantity}</td>
                <td class="text-right">${item.unitPrice}/-</td>
                <td class="text-right"><strong>${item.total.toLocaleString()}/-</strong></td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>
        <div style="margin-top:20px; text-align:right;">
          <p>Subtotal: ${formatMoney(document.subtotal)}</p>
          <p>Total: <strong>${formatMoney(document.total)}</strong></p>
          <p>Advance: ${formatMoney(document.advance)}</p>
          <p>Due: <strong>${formatMoney(document.due)}</strong></p>
        </div>
        <div class="terms">
          <h4>Terms & Conditions:</h4>
          <ol>
            ${document.termsAndConditions.map((t) => `<li>${t}</li>`).join('')}
          </ol>
        </div>
        <br/><br/>
        <p><strong>${document.signatoryName || GRAND_COMPANY_INFO.defaultSignatory.name}</strong><br/>${document.signatoryTitle || GRAND_COMPANY_INFO.defaultSignatory.title}<br/>Cell # ${document.signatoryPhone || GRAND_COMPANY_INFO.defaultSignatory.phone}</p>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword',
    });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${type}_${document.clientName.replace(/\s+/g, '_')}_${document.date}.doc`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const primaryColor = [184, 115, 51]; // warm bronze gold
    const darkColor = [30, 41, 59];

    // Top Header Banner
    doc.setFillColor(154, 76, 23); // brown/amber header from Grand invoice
    doc.rect(40, 40, 160, 36, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(type, 65, 65);

    // Company Header
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(16);
    doc.text('GRAND', 430, 55);
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('we value what you have to say!', 380, 68);
    doc.text('EST. 2004', 440, 78);

    // Client and Date
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    doc.text(`Date - ${document.date}`, 430, 105);
    if ('validityDate' in document && (document as Quotation).validityDate) {
      doc.text(`Quotation Validity Until`, 400, 120);
      doc.text(`${(document as Quotation).validityDate}`, 430, 132);
    }

    doc.setFont('helvetica', 'bold');
    doc.text('TO', 40, 110);
    doc.text(`${document.clientName}`, 40, 124);
    if (document.clientCompany && document.clientCompany !== document.clientName) {
      doc.setFont('helvetica', 'normal');
      doc.text(`${document.clientCompany}`, 40, 136);
    }

    // Subject
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(document.subject, 180, 165);

    // Table Header
    let yPos = 185;
    doc.setFillColor(241, 245, 249);
    doc.rect(40, yPos, 515, 24, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(40, yPos, 515, 24, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('SL', 45, yPos + 16);
    doc.text('Job', 75, yPos + 16);
    doc.text('Description', 145, yPos + 16);
    doc.text('Qty', 370, yPos + 16);
    doc.text('Unit Price', 420, yPos + 16);
    doc.text('Total', 495, yPos + 16);

    yPos += 24;

    // Table Rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    document.items.forEach((item, index) => {
      const rowHeight = 36;
      doc.rect(40, yPos, 515, rowHeight, 'S');

      doc.text(`${index + 1}.`, 45, yPos + 16);
      doc.setFont('helvetica', 'bold');
      doc.text(item.job, 75, yPos + 16);
      doc.setFont('helvetica', 'normal');

      const descLines = doc.splitTextToSize(item.description, 210);
      doc.text(descLines, 145, yPos + 14);

      doc.text(`${item.quantity}`, 375, yPos + 18);
      doc.text(`${item.unitPrice}/-`, 425, yPos + 18);
      doc.setFont('helvetica', 'bold');
      doc.text(`${item.total.toLocaleString()}`, 495, yPos + 18);
      doc.setFont('helvetica', 'normal');

      yPos += rowHeight;
    });

    // Subtotal Row
    doc.rect(40, yPos, 515, 20, 'S');
    doc.setFont('helvetica', 'bold');
    doc.text('Subtotal', 425, yPos + 14);
    doc.text(`${formatMoney(document.subtotal)}`, 485, yPos + 14);
    yPos += 20;

    // N.B text
    if (document.nbText) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(`N.B : ${document.nbText}`, 40, yPos + 16);
    }

    // Calculations Summary Box (Right) & Terms (Left)
    const termsStartY = yPos + 30;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Terms & Condition:', 40, termsStartY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    let termY = termsStartY + 14;
    document.termsAndConditions.slice(0, 8).forEach((term, idx) => {
      const splitTerm = doc.splitTextToSize(`${idx + 1}. ${term}`, 250);
      doc.text(splitTerm, 40, termY);
      termY += splitTerm.length * 10 + 2;
    });

    // Right Summary Box
    let sumY = termsStartY;
    const rightBoxX = 330;
    const valX = 490;

    const summaryRows = [
      { label: `Agency Commission(10%)`, val: `${formatMoney((document as Quotation).agencyCommissionAmount || 16200)}` },
      { label: `VAT(0%)`, val: `${formatMoney((document as Quotation).vatAmount || 0)}` },
      { label: `Total`, val: `${formatMoney(document.total)}`, bold: true },
      { label: `Advance`, val: `${formatMoney(document.advance)}` },
      { label: `Due`, val: `${formatMoney(document.due)}`, bold: true },
    ];

    summaryRows.forEach((r) => {
      doc.rect(rightBoxX, sumY, 225, 18, 'S');
      doc.setFont('helvetica', r.bold ? 'bold' : 'normal');
      doc.setFontSize(8.5);
      doc.text(r.label, rightBoxX + 10, sumY + 12);
      doc.text(r.val, valX, sumY + 12);
      sumY += 18;
    });

    // Signatory
    const sigY = termY + 25;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(document.signatoryName || GRAND_COMPANY_INFO.defaultSignatory.name, 40, sigY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(document.signatoryTitle || GRAND_COMPANY_INFO.defaultSignatory.title, 40, sigY + 12);
    doc.text(`Cell # ${document.signatoryPhone || GRAND_COMPANY_INFO.defaultSignatory.phone}`, 40, sigY + 24);

    // Footer Address
    const footerY = 790;
    doc.setDrawColor(220, 220, 220);
    doc.line(40, footerY - 15, 555, footerY - 15);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('No 20 Shop CDA Market, Kazir Dewri, Chottogram | +88 01819 312820 | grandecmm@gmail.com', 75, footerY);

    doc.save(`${type}_${document.clientName}_${document.date}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0B192C]/85 backdrop-blur-xs flex justify-center p-2 sm:p-6 print:p-0 print:bg-white print:fixed-none">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none flex flex-col">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="bg-[#0B192C] px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-blue-950/40 print:hidden text-white">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-xs font-bold uppercase rounded-md bg-blue-500/20 text-blue-200 border border-blue-400/30">
              {type} Document
            </span>
            <span className="font-semibold text-sm text-slate-200">
              {document.clientName} &bull; {document.date}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isInvoice && onConvertToInvoice && (
              <button
                onClick={() => onConvertToInvoice(document as Quotation)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                title="Convert this quotation directly into an official invoice"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Convert to Invoice
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-[#1E3E62] hover:bg-[#28527a] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>

            <button
              onClick={handleDownloadPdf}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Direct .PDF
            </button>

            <button
              onClick={handleDownloadDoc}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              Word (.DOC)
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg ml-2 cursor-pointer"
                aria-label="Close Preview"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* --- AUTHENTIC GRAND LETTERHEAD DOCUMENT CANVAS --- */}
        <div className="p-6 sm:p-12 relative bg-white min-h-[1050px] font-sans text-slate-900 selection:bg-amber-100 flex flex-col justify-between print:min-h-0 print:p-8">
          {/* Subtle Royal Watermark in Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none z-0">
            <GrandLogo size="xl" showTagline={false} />
          </div>

          <div className="relative z-10">
            {/* --- HEADER --- */}
            <div className="flex justify-between items-start mb-6">
              {/* Left Ribbon Box */}
              <div>
                <div className="bg-[#8B4513] text-white px-8 py-2.5 rounded-none font-serif text-2xl font-bold tracking-wide shadow-sm inline-block">
                  {type}
                </div>
              </div>

              {/* Right Grand Brand Logo */}
              <div className="text-right flex flex-col items-end">
                <GrandLogo size="md" variant="gold" showTagline={true} />
              </div>
            </div>

            {/* --- METADATA (TO & DATE) --- */}
            <div className="flex justify-between items-start text-sm mb-4">
              <div className="max-w-[50%]">
                <span className="font-bold text-slate-800 block text-xs tracking-wider uppercase mb-1">
                  TO
                </span>
                <p className="font-bold text-slate-900 text-base leading-tight">
                  {document.clientName}
                </p>
                {document.clientCompany && document.clientCompany !== document.clientName && (
                  <p className="text-slate-600 text-xs mt-0.5">{document.clientCompany}</p>
                )}
                {document.clientAddress && (
                  <p className="text-slate-500 text-xs mt-0.5 leading-snug">{document.clientAddress}</p>
                )}
              </div>

              <div className="text-right text-xs space-y-1">
                <p className="font-medium text-slate-800">
                  <span className="font-bold">Date - </span>
                  {document.date}
                </p>
                {!isInvoice && 'validityDate' in document && (document as Quotation).validityDate && (
                  <div>
                    <span className="font-bold text-slate-700 block">
                      Quotation Validity Until
                    </span>
                    <span className="text-slate-900 font-medium">
                      {(document as Quotation).validityDate}
                    </span>
                  </div>
                )}
                {isInvoice && 'invoiceNumber' in document && (
                  <div>
                    <span className="font-bold text-slate-700">Invoice No: </span>
                    <span className="text-amber-800 font-bold">
                      {(document as Invoice).invoiceNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* --- SUBJECT / TITLE --- */}
            <div className="text-center my-4 py-1.5 border-t border-b border-slate-200">
              <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                {document.subject}
              </h2>
            </div>

            {/* --- LINE ITEMS TABLE --- */}
            <div className="overflow-x-auto my-3">
              <table className="w-full text-xs sm:text-sm border-collapse border border-slate-400">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 text-center font-bold border-b border-slate-400">
                    <th className="border border-slate-400 px-2 py-2 w-10">SL</th>
                    <th className="border border-slate-400 px-3 py-2 w-28 text-left">Job</th>
                    <th className="border border-slate-400 px-4 py-2 text-left">Description</th>
                    <th className="border border-slate-400 px-2 py-2 w-16">Qty</th>
                    <th className="border border-slate-400 px-3 py-2 w-24 text-right">Unit Price</th>
                    <th className="border border-slate-400 px-3 py-2 w-28 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {document.items.map((item, index) => (
                    <tr key={item.id || index} className="align-top border-b border-slate-400">
                      <td className="border border-slate-400 px-2 py-2.5 text-center font-medium">
                        {index + 1}.
                      </td>
                      <td className="border border-slate-400 px-3 py-2.5 font-bold text-slate-900">
                        {item.job}
                      </td>
                      <td className="border border-slate-400 px-4 py-2.5 text-slate-800 whitespace-pre-line leading-relaxed">
                        {item.description}
                      </td>
                      <td className="border border-slate-400 px-2 py-2.5 text-center font-semibold">
                        {item.quantity}
                      </td>
                      <td className="border border-slate-400 px-3 py-2.5 text-right font-medium text-slate-800">
                        {item.unitPrice}/-
                      </td>
                      <td className="border border-slate-400 px-3 py-2.5 text-right font-bold text-slate-900">
                        {item.total.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                  {/* Subtotal Row inside Table */}
                  <tr className="font-bold bg-slate-50 border-t border-slate-400">
                    <td colSpan={5} className="border border-slate-400 px-4 py-2 text-right">
                      Subtotal
                    </td>
                    <td className="border border-slate-400 px-3 py-2 text-right text-slate-900">
                      {formatMoney(document.subtotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* --- N.B. NOTE --- */}
            {document.nbText && (
              <p className="text-xs font-bold text-slate-800 my-2">
                N.B : <span className="font-semibold text-slate-700">{document.nbText}</span>
              </p>
            )}

            {/* --- BOTTOM SECTION: TERMS (LEFT) & CALCULATIONS (RIGHT) --- */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-4">
              {/* Left Column: Terms & Conditions */}
              <div className="md:col-span-7 text-xs text-slate-800 space-y-1.5">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                  Terms & Condition:
                </h4>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] leading-snug text-slate-700">
                  {document.termsAndConditions.map((term, i) => (
                    <li key={i} className="pl-0.5">
                      {term}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Right Column: Financial Calculations Summary */}
              <div className="md:col-span-5 flex flex-col justify-start">
                <table className="w-full text-xs border border-slate-400">
                  <tbody>
                    <tr className="border-b border-slate-300">
                      <td className="px-3 py-1.5 font-medium text-slate-700 bg-slate-50">
                        Agency Commission(
                        {'agencyCommissionPercent' in document
                          ? (document as Quotation).agencyCommissionPercent
                          : 10}
                        %)
                      </td>
                      <td className="px-3 py-1.5 text-right font-semibold text-slate-800 border-l border-slate-300">
                        {formatMoney(document.agencyCommissionAmount || 0)}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="px-3 py-1.5 font-medium text-slate-700 bg-slate-50">
                        VAT(
                        {'vatPercent' in document ? (document as Quotation).vatPercent : 0}
                        %)
                      </td>
                      <td className="px-3 py-1.5 text-right font-semibold text-slate-800 border-l border-slate-300">
                        {formatMoney(document.vatAmount || 0)}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-400 bg-slate-100 font-bold text-slate-900">
                      <td className="px-3 py-2">Total</td>
                      <td className="px-3 py-2 text-right border-l border-slate-300 text-sm">
                        {formatMoney(document.total)}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="px-3 py-1.5 font-medium text-slate-700 bg-slate-50">
                        Advance
                      </td>
                      <td className="px-3 py-1.5 text-right font-semibold text-slate-800 border-l border-slate-300">
                        {formatMoney(document.advance)}
                      </td>
                    </tr>
                    <tr className="bg-amber-50/60 font-bold text-amber-950">
                      <td className="px-3 py-2 text-red-700">Due</td>
                      <td className="px-3 py-2 text-right border-l border-slate-300 text-sm text-red-700">
                        {formatMoney(document.due)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* --- SIGNATURE & AUTHORIZATION --- */}
            <div className="mt-8 pt-4 flex justify-between items-end">
              <div className="text-xs">
                {/* Visual signature cursive font */}
                <div className="font-['Dancing_Script',cursive] text-2xl text-slate-800 mb-1 select-none">
                  {document.signatoryName || GRAND_COMPANY_INFO.defaultSignatory.name}
                </div>
                <div className="w-36 h-0.5 bg-slate-400 mb-1"></div>
                <p className="font-bold text-slate-900 text-xs">
                  {document.signatoryName || GRAND_COMPANY_INFO.defaultSignatory.name}
                </p>
                <p className="text-slate-600 text-[11px]">
                  {document.signatoryTitle || GRAND_COMPANY_INFO.defaultSignatory.title}
                </p>
                <p className="text-slate-600 text-[11px]">
                  Cell # {document.signatoryPhone || GRAND_COMPANY_INFO.defaultSignatory.phone}
                </p>
              </div>
            </div>
          </div>

          {/* --- FOOTER: QR CODE & CONTACT INFO --- */}
          <div className="relative z-10 pt-6 mt-6 border-t border-slate-300 flex flex-wrap justify-between items-center text-xs text-slate-700 gap-4">
            {/* Left QR & Facebook branding */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-900 text-white p-1 rounded flex flex-col justify-center items-center shadow-xs">
                <div className="grid grid-cols-3 gap-0.5 w-full h-full p-0.5">
                  <div className="bg-white"></div>
                  <div className="bg-amber-400"></div>
                  <div className="bg-white"></div>
                  <div className="bg-amber-400"></div>
                  <div className="bg-white"></div>
                  <div className="bg-amber-400"></div>
                  <div className="bg-white"></div>
                  <div className="bg-amber-400"></div>
                  <div className="bg-white"></div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-blue-700 font-semibold text-xs">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                  f
                </span>
                <span>/grandcommunicationbd</span>
              </div>
            </div>

            {/* Right Company Address & Phone */}
            <div className="text-right text-[11px] leading-tight text-slate-600">
              <p className="font-bold text-slate-800 text-xs">
                {GRAND_COMPANY_INFO.addressLine1}
              </p>
              <p>{GRAND_COMPANY_INFO.addressLine2}</p>
              <p className="text-slate-800 font-medium">
                {GRAND_COMPANY_INFO.phone1} &bull; {GRAND_COMPANY_INFO.phone2}
              </p>
              <p className="text-amber-800 font-medium">{GRAND_COMPANY_INFO.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
