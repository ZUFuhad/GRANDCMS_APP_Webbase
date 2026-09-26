import React, { useState } from 'react';
import { Quotation, Invoice } from '../types';
import { GrandLogo } from './GrandLogo';
import { LogoUploadModal } from './LogoUploadModal';
import { GrandPadExportModal } from './GrandPadExportModal';
import { GRAND_COMPANY_INFO } from '../mock/initialData';
import grandLogoPng from '../assets/grand-logo.png';
import { Printer, Download, CheckCircle2, X, MessageSquare, Upload, Share2, FileText } from 'lucide-react';
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
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const isInvoice = type === 'Invoice';

  const servicePercent = typeof document.agencyCommissionPercent === 'number' ? document.agencyCommissionPercent : 10;
  const vatPercent = typeof document.vatPercent === 'number' ? document.vatPercent : 0;
  const commAmount = (document.subtotal * servicePercent) / 100;
  const vatAmount = (document.subtotal * vatPercent) / 100;

  const formatMoney = (amount: number) => {
    return amount.toLocaleString('en-IN') + '/-';
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const primaryColor = [200, 142, 19];
    const darkColor = [30, 41, 59];

    // Header Top Banner
    doc.setFillColor(139, 69, 19);
    doc.rect(40, 40, 160, 34, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(type.toUpperCase(), 55, 63);

    // Company Header Right
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
    doc.text(`Date - ${document.date}`, 430, 102);
    if ('validityDate' in document && (document as Quotation).validityDate) {
      doc.text(`Quotation Validity Until`, 400, 116);
      doc.text(`${(document as Quotation).validityDate}`, 430, 128);
    }

    // TO (Client Details)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TO', 40, 102);
    doc.text(`${document.clientName}`, 40, 116);
    doc.setFont('helvetica', 'normal');
    if (document.clientCompany && document.clientCompany !== document.clientName) {
      doc.text(`${document.clientCompany}`, 40, 128);
    }
    if (document.clientAddress) {
      const splitAddr = doc.splitTextToSize(document.clientAddress, 220);
      doc.text(splitAddr, 40, 140);
    }

    // Subject
    let yPos = 175;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(`Quotation for – ${document.subject}`, 40, yPos);

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

    document.items.forEach((item, index) => {
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
    doc.text(`${formatMoney(document.subtotal)}`, 485, yPos + 14);
    yPos += 24;

    // N.B text
    if (document.nbText) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(`N.B : ${document.nbText}`, 40, yPos + 10);
    }

    // Terms & Conditions (Left) & Calculations (Right)
    const termsStartY = yPos + 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Terms & Condition:', 40, termsStartY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    let termY = termsStartY + 12;
    document.termsAndConditions.slice(0, 8).forEach((term, idx) => {
      const splitTerm = doc.splitTextToSize(`${idx + 1}. ${term}`, 250);
      doc.text(splitTerm, 40, termY);
      termY += splitTerm.length * 9 + 2;
    });

    // Right Summary Box
    let sumY = termsStartY;
    const rightBoxX = 330;
    const valX = 490;

    const summaryRows = [
      { label: `Service Charge (${servicePercent}%)`, val: `${formatMoney(commAmount)}` },
      { label: `VAT (${vatPercent}%)`, val: `${formatMoney(vatAmount)}` },
      { label: `Total Amount`, val: `${formatMoney(document.total)}`, bold: true },
    ];

    if (isInvoice || (document.advance && document.advance > 0)) {
      summaryRows.push(
        { label: `Advance Paid`, val: `${formatMoney(document.advance)}` },
        { label: `Due Balance`, val: `${formatMoney(document.due)}`, bold: true }
      );
    }

    summaryRows.forEach((r) => {
      doc.rect(rightBoxX, sumY, 225, 18, 'S');
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

  const handleSendWhatsApp = () => {
    const docNo = 'quotationNumber' in document ? (document as Quotation).quotationNumber : (document as Invoice).invoiceNumber;
    let textStr = `*GRAND Communication & Marketing*\n*${type.toUpperCase()}: ${docNo}*\n\nClient: ${document.clientName} (${document.clientCompany || ''})\nSubject: ${document.subject}\nDate: ${document.date}\n\n*Subtotal:* ৳ ${formatMoney(document.subtotal)}\n*Service Charge (${servicePercent}%):* ৳ ${formatMoney(commAmount)}\n*Total Amount:* ৳ ${document.total.toLocaleString()}/-`;
    if (isInvoice) {
      textStr += `\n*Advance Paid:* ৳ ${document.advance.toLocaleString()}/-\n*Due Balance:* ৳ ${document.due.toLocaleString()}/-`;
    }
    textStr += `\n\nOfficial Grand Letterhead Pad Document.\nThank you for choosing Grand Communication & Marketing!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(textStr)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0B192C]/85 backdrop-blur-xs flex justify-center p-2 sm:p-6 print:p-0 print:bg-white print:fixed-none">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none flex flex-col">
        {/* Modal Action Bar (Hidden on print) */}
        <div className="bg-[#0B192C] text-white px-4 py-3 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 font-bold px-2.5 py-1 rounded text-xs">
              {type} Preview
            </span>
            <span className="text-sm text-slate-300 font-medium">
              {'quotationNumber' in document ? (document as Quotation).quotationNumber : (document as Invoice).invoiceNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isInvoice && (
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                title="Send & Export 3 formats (PDF, DOCX, JPG) on Grand Pad"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Send & Export (Grand Pad)</span>
              </button>
            )}
            <button
              onClick={handleSendWhatsApp}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Send details instantly via WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              WhatsApp
            </button>
            {!isInvoice && onConvertToInvoice && (
              <button
                onClick={() => onConvertToInvoice(document as Quotation)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Convert to Invoice
              </button>
            )}
            <button
              onClick={handleDownloadPDF}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="p-6 sm:p-10 bg-white text-slate-900 flex-1 flex flex-col justify-between print:p-6 print:m-0">
          <div>
            {/* Top Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b-2 border-slate-900">
              <div className="bg-[#8B4513] text-white px-6 py-2.5 rounded shadow-sm">
                <h1 className="text-xl sm:text-2xl font-black tracking-widest uppercase">
                  {type}
                </h1>
              </div>

              <div className="flex flex-col items-start sm:items-end">
                <GrandLogo size="md" variant="gold" onClick={() => setIsLogoModalOpen(true)} />
                <button
                  type="button"
                  onClick={() => setIsLogoModalOpen(true)}
                  className="print:hidden text-[10px] text-amber-700 hover:text-amber-900 font-semibold underline mt-0.5 cursor-pointer flex items-center gap-1"
                  title="Upload grand-logo.png"
                >
                  <Upload className="w-2.5 h-2.5" />
                  <span>Change Logo</span>
                </button>
                <div className="text-[11px] text-slate-600 mt-1 text-left sm:text-right font-medium">
                  {GRAND_COMPANY_INFO.addressLine1}, {GRAND_COMPANY_INFO.addressLine2}<br />
                  Phone: {GRAND_COMPANY_INFO.phone1}, {GRAND_COMPANY_INFO.phone2}<br />
                  Email: {GRAND_COMPANY_INFO.email}
                </div>
              </div>
            </div>

            {/* Client TO & Date / Validity Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 text-xs">
              <div>
                <span className="font-extrabold text-slate-900 uppercase tracking-wider block mb-1">
                  TO
                </span>
                <div className="font-bold text-slate-900 text-sm">
                  {document.clientName}
                </div>
                {document.clientCompany && document.clientCompany !== document.clientName && (
                  <div className="text-slate-700 font-medium">
                    {document.clientCompany}
                  </div>
                )}
                {document.clientAddress && (
                  <div className="text-slate-600 mt-0.5 whitespace-pre-line leading-snug">
                    {document.clientAddress}
                  </div>
                )}
              </div>

              <div className="sm:text-right space-y-1">
                <div>
                  <span className="font-semibold text-slate-600">Date:</span>{' '}
                  <span className="font-bold text-slate-900">{document.date}</span>
                </div>
                {'validityDate' in document && (document as Quotation).validityDate && (
                  <div>
                    <span className="font-semibold text-slate-600">Quotation Validity Until:</span>{' '}
                    <span className="font-bold text-slate-900">{(document as Quotation).validityDate}</span>
                  </div>
                )}
                {'invoiceNumber' in document && (
                  <div>
                    <span className="font-semibold text-slate-600">Invoice No:</span>{' '}
                    <span className="font-bold text-slate-900">{(document as Invoice).invoiceNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Subject Line */}
            <div className="mb-4 bg-slate-50 border-l-4 border-[#8B4513] px-3 py-2 text-xs font-bold text-slate-900">
              Quotation for – {document.subject}
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto my-4">
              <table className="w-full text-xs border-collapse border border-slate-400">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400">
                    <th className="p-2 text-center w-10 border-r border-slate-400">SL</th>
                    <th className="p-2 text-left w-28 border-r border-slate-400">Job</th>
                    <th className="p-2 text-left border-r border-slate-400">Description</th>
                    <th className="p-2 text-center w-16 border-r border-slate-400">Qty</th>
                    <th className="p-2 text-right w-24 border-r border-slate-400">Unit Price</th>
                    <th className="p-2 text-right w-28">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {document.items.map((item, idx) => (
                    <tr key={item.id || idx} className="border-b border-slate-300 align-top">
                      <td className="p-2 text-center border-r border-slate-300 font-medium">
                        {idx + 1}.
                      </td>
                      <td className="p-2 border-r border-slate-300 font-bold text-slate-900">
                        {item.job}
                      </td>
                      <td className="p-2 border-r border-slate-300 text-slate-700 whitespace-pre-line leading-relaxed">
                        {item.description}
                      </td>
                      <td className="p-2 text-center border-r border-slate-300 font-medium">
                        {item.quantity}
                      </td>
                      <td className="p-2 text-right border-r border-slate-300 font-medium">
                        {item.unitPrice.toLocaleString()}/-
                      </td>
                      <td className="p-2 text-right font-bold text-slate-900">
                        {item.total.toLocaleString()}/-
                      </td>
                    </tr>
                  ))}
                  {/* Subtotal row */}
                  <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-400">
                    <td colSpan={5} className="p-2 text-right border-r border-slate-400">
                      Subtotal
                    </td>
                    <td className="p-2 text-right">
                      {formatMoney(document.subtotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* N.B Note */}
            {document.nbText && (
              <p className="text-xs font-bold text-slate-900 my-2">
                N.B : <span className="font-semibold text-slate-700">{document.nbText}</span>
              </p>
            )}

            {/* Terms & Calculations Summary */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-4">
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

              {/* Summary Box */}
              <div className="md:col-span-5 flex flex-col justify-start">
                <table className="w-full text-xs border border-slate-400">
                  <tbody>
                    <tr className="border-b border-slate-300">
                      <td className="px-3 py-1.5 font-medium text-slate-700 bg-slate-50">
                        Service Charge ({servicePercent}%)
                      </td>
                      <td className="px-3 py-1.5 text-right font-semibold text-slate-800 border-l border-slate-300">
                        {formatMoney(commAmount)}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="px-3 py-1.5 font-medium text-slate-700 bg-slate-50">
                        VAT ({vatPercent}%)
                      </td>
                      <td className="px-3 py-1.5 text-right font-semibold text-slate-800 border-l border-slate-300">
                        {formatMoney(vatAmount)}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-400 bg-slate-100 font-bold text-slate-900">
                      <td className="px-3 py-2">Total Amount</td>
                      <td className="px-3 py-2 text-right border-l border-slate-300 text-sm">
                        {formatMoney(document.total)}
                      </td>
                    </tr>
                    {(isInvoice || (document.advance && document.advance > 0)) && (
                      <>
                        <tr className="border-b border-slate-300">
                          <td className="px-3 py-1.5 font-medium text-emerald-800 bg-emerald-50">
                            Advance Received
                          </td>
                          <td className="px-3 py-1.5 text-right font-bold text-emerald-800 border-l border-slate-300">
                            {formatMoney(document.advance)}
                          </td>
                        </tr>
                        <tr className="bg-amber-50/60 font-bold text-amber-950">
                          <td className="px-3 py-2 text-red-700">Due Balance</td>
                          <td className="px-3 py-2 text-right border-l border-slate-300 text-sm text-red-700">
                            {formatMoney(document.due)}
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Signature & Authorization */}
            <div className="mt-8 pt-4 flex justify-between items-end">
              <div className="text-xs">
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

          {/* Footer QR & Contact */}
          <div className="relative z-10 pt-6 mt-6 border-t border-slate-300 flex flex-wrap justify-between items-center text-xs text-slate-700 gap-4">
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
                <span>Grand Communication & Marketing</span>
              </div>
            </div>

            <div className="text-right text-[11px] text-slate-600">
              {GRAND_COMPANY_INFO.addressLine1}, {GRAND_COMPANY_INFO.addressLine2} | {GRAND_COMPANY_INFO.phone1} | {GRAND_COMPANY_INFO.email}
            </div>
          </div>
        </div>
      </div>

      <LogoUploadModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
      />

      {!isInvoice && (
        <GrandPadExportModal
          quotation={document as Quotation}
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}
    </div>
  );
};
