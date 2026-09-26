import React, { useRef } from 'react';
import { Quotation, PaymentRecord } from '../types';
import { GRAND_COMPANY_INFO } from '../mock/initialData';
import { GrandLogo } from './GrandLogo';
import { X, Printer, Download, MessageSquare, CheckCircle2 } from 'lucide-react';
import jsPDF from 'jspdf';

interface AdvanceMoneyReceiptModalProps {
  quotation: Quotation;
  payment: PaymentRecord;
  isOpen: boolean;
  onClose: () => void;
}

export const AdvanceMoneyReceiptModal: React.FC<AdvanceMoneyReceiptModalProps> = ({
  quotation,
  payment,
  isOpen,
  onClose,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const formatMoney = (val: number) => {
    return `${(val || 0).toLocaleString('en-IN')}/-`;
  };

  const receiptNo = `GMR-ADV-${payment.date.replace(/-/g, '')}-${payment.id.slice(-4).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF('p', 'pt', 'a5');
    const primaryColor = [200, 142, 19];
    const darkColor = [30, 41, 59];

    // Header Badge
    doc.setFillColor(139, 69, 19);
    doc.rect(30, 30, 150, 26, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('ADVANCE MONEY RECEIPT', 40, 48);

    // Company Header Right
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(14);
    doc.text('GRAND', 310, 40);
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    doc.text('we value what you have to say!', 265, 52);
    doc.text('EST. 2004', 315, 62);

    // Separator
    doc.setDrawColor(200, 142, 19);
    doc.setLineWidth(1.5);
    doc.line(30, 75, 390, 75);

    // Details Grid
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);

    doc.text(`Receipt No: ${receiptNo}`, 30, 95);
    doc.text(`Date: ${payment.date}`, 300, 95);

    doc.text(`Quotation Ref: ${quotation.quotationNumber}`, 30, 112);
    if (quotation.workOrderNumber) {
      doc.text(`Work Order: ${quotation.workOrderNumber}`, 300, 112);
    }

    doc.setFont('helvetica', 'bold');
    doc.text('Received From:', 30, 135);
    doc.setFont('helvetica', 'normal');
    doc.text(`${quotation.clientName} ${quotation.clientCompany ? `(${quotation.clientCompany})` : ''}`, 110, 135);

    doc.setFont('helvetica', 'bold');
    doc.text('Project / Subject:', 30, 155);
    doc.setFont('helvetica', 'normal');
    doc.text(`${quotation.subject}`, 110, 155);

    // Amount Box
    doc.setFillColor(241, 245, 249);
    doc.rect(30, 175, 360, 45, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(30, 175, 360, 45, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Advance Amount Received:', 45, 198);
    doc.setFontSize(14);
    doc.setTextColor(180, 83, 9);
    doc.text(`BDT ৳ ${formatMoney(payment.amount)}`, 200, 200);

    // Payment Meta
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Payment Mode: ${payment.method}`, 30, 240);
    if (payment.reference) {
      doc.text(`Trx / Reference: ${payment.reference}`, 220, 240);
    }

    // Balance Overview
    doc.rect(30, 260, 360, 42, 'S');
    doc.text(`Quotation Total: ৳ ${formatMoney(quotation.total)}`, 40, 278);
    doc.text(`Total Advance Paid: ৳ ${formatMoney(quotation.advance)}`, 40, 292);
    doc.setFont('helvetica', 'bold');
    doc.text(`Remaining Due: ৳ ${formatMoney(quotation.due)}`, 230, 285);

    // Signatory
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`${payment.receivedBy || GRAND_COMPANY_INFO.defaultSignatory.name}`, 30, 360);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('Authorized Signature & Seal', 30, 372);
    doc.text('GRAND Communication & Marketing', 30, 384);

    // Footer
    doc.line(30, 400, 390, 400);
    doc.text('20 no shop, CDA Market, Kazir Dewri, Chattogram | +88 01819 312820 | grandecmm@gmail.com', 45, 412);

    doc.save(`${receiptNo}.pdf`);
  };

  const handleSendWhatsApp = () => {
    const text = encodeURIComponent(
      `*GRAND COMMUNICATION & MARKETING*\n*OFFICIAL ADVANCE MONEY RECEIPT*\n\n` +
      `*Receipt No:* ${receiptNo}\n` +
      `*Quotation Ref:* ${quotation.quotationNumber}\n` +
      (quotation.workOrderNumber ? `*Work Order No:* ${quotation.workOrderNumber}\n` : '') +
      `*Date:* ${payment.date}\n` +
      `*Client:* ${quotation.clientName} ${quotation.clientCompany ? `(${quotation.clientCompany})` : ''}\n` +
      `*Subject:* ${quotation.subject}\n\n` +
      `*Advance Amount Received:* ৳ ${formatMoney(payment.amount)}\n` +
      `*Payment Method:* ${payment.method} ${payment.reference ? `(Ref: ${payment.reference})` : ''}\n` +
      `*Total Quotation Amount:* ৳ ${formatMoney(quotation.total)}\n` +
      `*Remaining Due Balance:* ৳ ${formatMoney(quotation.due)}\n\n` +
      `Thank you for confirming the work order with Grand Communication & Marketing!\n` +
      `_we value what you have to say! • EST. 2004_`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#07101C]/90 backdrop-blur-sm flex justify-center items-center p-3 sm:p-6 print:p-0 print:bg-white">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none flex flex-col text-slate-900 border border-slate-300">
        {/* Top Header Controls (Hidden on print) */}
        <div className="bg-[#0B192C] text-white px-5 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-extrabold text-sm text-emerald-400">Advance Receipt Generated</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSendWhatsApp}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Share via WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Download PDF Receipt"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Sheet */}
        <div ref={receiptRef} className="p-6 sm:p-8 space-y-5">
          {/* Header */}
          <div className="flex justify-between items-start pb-4 border-b-2 border-amber-600">
            <div>
              <span className="bg-[#8B4513] text-white px-3 py-1 rounded text-xs font-black tracking-widest uppercase">
                ADVANCE MONEY RECEIPT
              </span>
              <p className="text-[11px] font-bold text-slate-700 mt-2">
                Receipt No: <span className="font-mono text-slate-900">{receiptNo}</span>
              </p>
              <p className="text-[11px] text-slate-600">
                Date: <span className="font-bold text-slate-900">{payment.date}</span>
              </p>
            </div>

            <div className="text-right">
              <GrandLogo size="sm" variant="gold" />
              <p className="text-[10px] text-slate-500 mt-1">
                CDA Market, Kazir Dewri, Chattogram<br />
                Cell: +88 01819 312820
              </p>
            </div>
          </div>

          {/* Client & Work Order Ref */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Received From:</span>
              <p className="font-bold text-sm text-slate-900">{quotation.clientName}</p>
              {quotation.clientCompany && (
                <p className="text-slate-600">{quotation.clientCompany}</p>
              )}
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">References:</span>
              <p className="font-bold text-slate-900">Quotation: {quotation.quotationNumber}</p>
              {quotation.workOrderNumber && (
                <p className="text-amber-700 font-bold">Work Order: {quotation.workOrderNumber}</p>
              )}
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold">For Job / Activation:</span>
            <p className="text-xs font-bold text-slate-800 bg-amber-50/60 p-2 rounded-lg border border-amber-200/50 mt-1">
              {quotation.subject}
            </p>
          </div>

          {/* Main Advance Amount Box */}
          <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-2">
            <div>
              <span className="text-xs font-bold text-amber-900 uppercase">Advance Amount Received:</span>
              <div className="text-2xl font-black text-amber-900 mt-0.5">
                ৳ {formatMoney(payment.amount)}
              </div>
            </div>
            <div className="text-right text-xs">
              <span className="text-slate-600 block">Method: <strong className="text-slate-900">{payment.method}</strong></span>
              {payment.reference && (
                <span className="text-slate-600 block">Ref / Trx: <strong className="text-slate-900">{payment.reference}</strong></span>
              )}
            </div>
          </div>

          {/* Quotation Financial Status */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs p-3 bg-slate-100 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Total Quotation</span>
              <span className="font-bold text-slate-900">৳ {formatMoney(quotation.total)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Advance Received</span>
              <span className="font-black text-emerald-700">৳ {formatMoney(quotation.advance)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Remaining Due</span>
              <span className="font-black text-amber-700">৳ {formatMoney(quotation.due)}</span>
            </div>
          </div>

          {/* Signatory Footer */}
          <div className="pt-6 flex justify-between items-end border-t border-slate-200 text-xs">
            <div>
              <p className="font-bold text-slate-900">{payment.receivedBy || GRAND_COMPANY_INFO.defaultSignatory.name}</p>
              <p className="text-[11px] text-slate-600">Received By • GRAND Accounts</p>
            </div>

            <div className="text-right">
              <div className="inline-block border-b border-slate-800 pb-0.5 px-6">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Authorized Signature & Seal</span>
              </div>
              <p className="text-[10px] text-amber-800 font-bold mt-1">GRAND Communication & Marketing</p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Close */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
