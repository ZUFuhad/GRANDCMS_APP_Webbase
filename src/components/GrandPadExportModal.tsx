import React, { useRef, useState } from 'react';
import { Quotation } from '../types';
import { GRAND_COMPANY_INFO } from '../mock/initialData';
import { GrandLogo } from './GrandLogo';
import { exportQuotationToPdf, exportQuotationToDocx, exportQuotationToJpg } from '../services/quotationConverter';
import {
  X,
  Download,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  MessageSquare,
  Mail,
  Copy,
  Check,
  Printer,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface GrandPadExportModalProps {
  quotation: Quotation;
  isOpen: boolean;
  onClose: () => void;
}

export const GrandPadExportModal: React.FC<GrandPadExportModalProps> = ({
  quotation,
  isOpen,
  onClose,
}) => {
  const padRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const servicePercent = typeof quotation.agencyCommissionPercent === 'number' ? quotation.agencyCommissionPercent : 10;
  const vatPercent = typeof quotation.vatPercent === 'number' ? quotation.vatPercent : 0;
  const commAmount = (quotation.subtotal * servicePercent) / 100;
  const vatAmount = (quotation.subtotal * vatPercent) / 100;
  const totalAmount = quotation.subtotal + commAmount + vatAmount;

  const formatMoney = (val: number) => {
    return `${(val || 0).toLocaleString('en-IN')}/-`;
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting('pdf');
      setStatusMessage('Generating official PDF on Grand Pad...');
      const res = await exportQuotationToPdf(quotation);
      if (res.success) {
        setStatusMessage(`✓ PDF downloaded: ${res.filename}`);
      } else {
        setStatusMessage(`Export failed: ${res.error}`);
      }
    } finally {
      setIsExporting(null);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleExportDOCX = async () => {
    try {
      setIsExporting('docx');
      setStatusMessage('Generating official Word (.docx) on Grand Pad...');
      const res = await exportQuotationToDocx(quotation);
      if (res.success) {
        setStatusMessage(`✓ DOCX downloaded: ${res.filename}`);
      } else {
        setStatusMessage(`Export failed: ${res.error}`);
      }
    } finally {
      setIsExporting(null);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleExportJPG = async () => {
    if (!padRef.current) return;
    try {
      setIsExporting('jpg');
      setStatusMessage('Rendering high-resolution JPG on Grand Pad...');
      const res = await exportQuotationToJpg(padRef.current, quotation);
      if (res.success) {
        setStatusMessage(`✓ JPG downloaded: ${res.filename}`);
      } else {
        setStatusMessage(`Export failed: ${res.error}`);
      }
    } finally {
      setIsExporting(null);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleSendWhatsApp = () => {
    const text = encodeURIComponent(
      `*GRAND COMMUNICATION & MARKETING*\n*OFFICIAL QUOTATION (Grand Pad)*\n\n*Ref No:* ${quotation.quotationNumber}\n*Date:* ${quotation.date}\n*Client:* ${quotation.clientName} ${quotation.clientCompany ? `(${quotation.clientCompany})` : ''}\n*Subject:* ${quotation.subject}\n\n*Financial Summary:*\n• Subtotal: ৳ ${formatMoney(quotation.subtotal)}\n• Service Charge (${servicePercent}%): ৳ ${formatMoney(commAmount)}\n• VAT (${vatPercent}%): ৳ ${formatMoney(vatAmount)}\n*• TOTAL AMOUNT:* ৳ ${formatMoney(totalAmount)}\n\n*Official Grand Letterhead Pad attached.*\nThank you for choosing Grand Communication & Marketing!\n_we value what you have to say! • EST. 2004_`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`Grand Communication Quotation - ${quotation.subject} [${quotation.quotationNumber}]`);
    const body = encodeURIComponent(
      `Dear ${quotation.clientName},\n\n` +
      `Greetings from Grand Communication & Marketing!\n\n` +
      `Please find our official quotation on Grand Pad for your project: "${quotation.subject}".\n\n` +
      `Quotation No: ${quotation.quotationNumber}\n` +
      `Date: ${quotation.date}\n` +
      `Validity: ${quotation.validityDate || '3 days'}\n\n` +
      `Financial Overview:\n` +
      `- Subtotal: BDT ${formatMoney(quotation.subtotal)}\n` +
      `- Service Charge (${servicePercent}%): BDT ${formatMoney(commAmount)}\n` +
      `- VAT (${vatPercent}%): BDT ${formatMoney(vatAmount)}\n` +
      `- Total Net Amount: BDT ${formatMoney(totalAmount)}\n\n` +
      `Please review the attached Grand Pad document (PDF / DOCX / JPG). Feel free to reach out if you have any questions.\n\n` +
      `Warm regards,\n` +
      `${quotation.signatoryName || GRAND_COMPANY_INFO.defaultSignatory.name}\n` +
      `${quotation.signatoryTitle || GRAND_COMPANY_INFO.defaultSignatory.title}\n` +
      `GRAND Communication & Marketing\n` +
      `20 no shop, CDA Market, Kazir Dewri, Chattogram\n` +
      `Cell: ${quotation.signatoryPhone || GRAND_COMPANY_INFO.defaultSignatory.phone}\n` +
      `Email: ${GRAND_COMPANY_INFO.email}`
    );
    window.location.href = `mailto:${quotation.clientEmail || ''}?subject=${subject}&body=${body}`;
  };

  const handleCopyText = () => {
    const text =
      `GRAND COMMUNICATION & MARKETING\n` +
      `OFFICIAL QUOTATION (Grand Pad)\n\n` +
      `Ref: ${quotation.quotationNumber}\n` +
      `Date: ${quotation.date}\n` +
      `Client: ${quotation.clientName}\n` +
      `Subject: ${quotation.subject}\n` +
      `Total: ৳ ${formatMoney(totalAmount)}\n` +
      `Service Charge (${servicePercent}%): ৳ ${formatMoney(commAmount)}\n` +
      `Contact: +88 01819 312820 | grandecmm@gmail.com`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#07101C]/90 backdrop-blur-sm flex justify-center items-start p-2 sm:p-6">
      <div className="w-full max-w-5xl bg-[#0B192C] border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-4">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#07101C] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Send & Export on Official Grand Pad
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Grand Letterhead Pad
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Ref: <span className="text-white font-bold">{quotation.quotationNumber}</span> • Client: <span className="text-slate-200 font-semibold">{quotation.clientName}</span> • Service Charge: <span className="text-amber-400 font-bold">{servicePercent}%</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3 Conversion Formats & Send Action Bar */}
        <div className="bg-[#0f1f38] px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider mr-1">
              Convert on Grand Pad:
            </span>

            {/* 1. PDF */}
            <button
              onClick={handleExportPDF}
              disabled={isExporting !== null}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Convert and download as PDF on Grand Pad"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isExporting === 'pdf' ? 'Converting...' : 'PDF (.pdf)'}</span>
            </button>

            {/* 2. DOCX */}
            <button
              onClick={handleExportDOCX}
              disabled={isExporting !== null}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Convert and download as Word Document (.docx) on Grand Pad"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{isExporting === 'docx' ? 'Converting...' : 'Word (.docx)'}</span>
            </button>

            {/* 3. JPG */}
            <button
              onClick={handleExportJPG}
              disabled={isExporting !== null}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Convert and download as High-Resolution JPG on Grand Pad"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{isExporting === 'jpg' ? 'Converting...' : 'Image (.jpg)'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider mr-1">
              Send Option:
            </span>
            <button
              onClick={handleSendWhatsApp}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Send via WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleSendEmail}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Send via Email"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </button>

            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Copy Summary Text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-xs font-bold text-amber-300 text-center animate-pulse">
            {statusMessage}
          </div>
        )}

        {/* Live Grand Pad Letterhead Document Container (Scrollable Preview) */}
        <div className="p-4 sm:p-8 bg-slate-950/70 overflow-y-auto max-h-[70vh] flex justify-center">
          <div
            ref={padRef}
            id="grand-pad-export-sheet"
            className="w-full max-w-[800px] bg-white text-slate-900 rounded-lg shadow-2xl p-6 sm:p-10 border border-slate-200 relative flex flex-col justify-between"
            style={{ minHeight: '1050px' }}
          >
            {/* Grand Pad Watermark Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
              <span className="text-8xl font-black text-amber-900 rotate-[-30deg]">GRAND PAD</span>
            </div>

            <div>
              {/* Grand Pad Header Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b-2 border-[#8B4513]">
                <div className="bg-[#8B4513] text-white px-5 py-2 rounded shadow-xs">
                  <h1 className="text-xl font-black tracking-widest uppercase">
                    QUOTATION
                  </h1>
                </div>

                <div className="flex flex-col items-start sm:items-end">
                  <GrandLogo size="md" variant="gold" />
                  <div className="text-[11px] text-slate-600 mt-1 text-left sm:text-right font-medium leading-tight">
                    {GRAND_COMPANY_INFO.addressLine1}, {GRAND_COMPANY_INFO.addressLine2}<br />
                    Phone: {GRAND_COMPANY_INFO.phone1}, {GRAND_COMPANY_INFO.phone2}<br />
                    Email: {GRAND_COMPANY_INFO.email}
                  </div>
                </div>
              </div>

              {/* Pad Reference & Client Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5 text-xs">
                <div>
                  <span className="font-extrabold text-slate-900 uppercase tracking-wider block mb-1">
                    TO
                  </span>
                  <div className="font-bold text-slate-900 text-sm">
                    {quotation.clientName}
                  </div>
                  {quotation.clientCompany && quotation.clientCompany !== quotation.clientName && (
                    <div className="text-slate-700 font-medium">
                      {quotation.clientCompany}
                    </div>
                  )}
                  {quotation.clientAddress && (
                    <div className="text-slate-600 mt-0.5 whitespace-pre-line leading-snug">
                      {quotation.clientAddress}
                    </div>
                  )}
                </div>

                <div className="sm:text-right space-y-1">
                  <div>
                    <span className="font-semibold text-slate-600">Ref No:</span>{' '}
                    <span className="font-bold text-slate-900">{quotation.quotationNumber}</span>
                  </div>
                  {quotation.workOrderNumber && (
                    <div>
                      <span className="font-semibold text-emerald-700">Work Order No:</span>{' '}
                      <span className="font-bold text-emerald-800">{quotation.workOrderNumber}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-semibold text-slate-600">Date:</span>{' '}
                    <span className="font-bold text-slate-900">{quotation.date}</span>
                  </div>
                  {quotation.validityDate && (
                    <div>
                      <span className="font-semibold text-slate-600">Quotation Validity Until:</span>{' '}
                      <span className="font-bold text-slate-900">{quotation.validityDate}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Subject Line */}
              <div className="mb-4 bg-slate-50 border-l-4 border-[#8B4513] px-3 py-2 text-xs font-bold text-slate-900">
                Quotation for – {quotation.subject}
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto my-3">
                <table className="w-full text-xs border-collapse border border-slate-400">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400">
                      <th className="p-2 text-center w-10 border-r border-slate-400">SL</th>
                      <th className="p-2 text-left w-28 border-r border-slate-400">Job</th>
                      <th className="p-2 text-left border-r border-slate-400">Description</th>
                      <th className="p-2 text-center w-14 border-r border-slate-400">Qty</th>
                      <th className="p-2 text-right w-24 border-r border-slate-400">Unit Price</th>
                      <th className="p-2 text-right w-28">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotation.items.map((item, idx) => (
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
                        {formatMoney(quotation.subtotal)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* N.B. Note */}
              {quotation.nbText && (
                <p className="text-xs font-bold text-slate-900 my-2">
                  N.B : <span className="font-semibold text-slate-700">{quotation.nbText}</span>
                </p>
              )}

              {/* Terms & Calculations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 my-4">
                <div className="md:col-span-7 text-xs text-slate-800 space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                    Terms & Condition:
                  </h4>
                  <ol className="list-decimal pl-4 space-y-1 text-[11px] leading-snug text-slate-700">
                    {(quotation.termsAndConditions || []).slice(0, 8).map((term, i) => (
                      <li key={i} className="pl-0.5">
                        {term}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Financial Summary Box */}
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
                      <tr className="border-b border-slate-400 bg-amber-500/10 font-bold text-slate-900">
                        <td className="px-3 py-2 text-amber-900">Total Amount</td>
                        <td className="px-3 py-2 text-right border-l border-slate-300 text-sm text-amber-900">
                          {formatMoney(totalAmount)}
                        </td>
                      </tr>
                      {quotation.advance && quotation.advance > 0 ? (
                        <>
                          <tr className="border-b border-slate-300 bg-emerald-50 font-bold text-emerald-800">
                            <td className="px-3 py-1.5">Advance Received</td>
                            <td className="px-3 py-1.5 text-right border-l border-slate-300 text-xs">
                              {formatMoney(quotation.advance)}
                            </td>
                          </tr>
                          <tr className="border-b border-slate-400 bg-rose-50 font-black text-rose-800">
                            <td className="px-3 py-1.5">Remaining Due Balance</td>
                            <td className="px-3 py-1.5 text-right border-l border-slate-300 text-xs">
                              {formatMoney(quotation.due !== undefined ? quotation.due : Math.max(0, totalAmount - quotation.advance))}
                            </td>
                          </tr>
                        </>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Grand Pad Footer & Authorized Signatory */}
            <div className="mt-8 pt-4 border-t border-slate-300">
              <div className="flex justify-between items-end">
                <div>
                  <div className="font-bold text-slate-900 text-xs">
                    {quotation.signatoryName || GRAND_COMPANY_INFO.defaultSignatory.name}
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium">
                    {quotation.signatoryTitle || GRAND_COMPANY_INFO.defaultSignatory.title}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Cell # {quotation.signatoryPhone || GRAND_COMPANY_INFO.defaultSignatory.phone}
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-block border-b-2 border-slate-900 pb-1 px-8 text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Authorized Signature & Seal</span>
                  </div>
                  <div className="text-[10px] font-bold text-amber-800 mt-1">
                    GRAND Communication & Marketing
                  </div>
                </div>
              </div>

              {/* Bottom Address Footer on Pad */}
              <div className="text-center text-[10px] text-slate-500 pt-5 mt-4 border-t border-slate-200">
                GRAND Communication & Marketing • No 20 Shop CDA Market, Kazir Dewri, Chottogram • Cell: +88 01819 312820 • grandecmm@gmail.com
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 bg-[#07101C] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-400">
            Selected Format Options: <span className="text-rose-400 font-bold">PDF</span>, <span className="text-blue-400 font-bold">Word (.docx)</span>, <span className="text-amber-400 font-bold">JPG (.jpg)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
