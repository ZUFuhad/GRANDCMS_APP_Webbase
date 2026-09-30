import React, { useRef } from 'react';
import { GRAND_COMPANY_INFO } from '../mock/initialData';
import { GrandLogo } from './GrandLogo';
import { X, Printer, Download, MessageSquare, CheckCircle, ShieldCheck } from 'lucide-react';
import jsPDF from 'jspdf';

export interface OfficialReceiptData {
  receiptNumber: string;
  date: string;
  clientName: string;
  clientCompany?: string;
  amount: number;
  amountInWords: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'bKash' | 'Cheque' | 'Nagad';
  reference?: string;
  purpose: string;
  receivedBy: string;
  invoiceNumber?: string;
}

interface OfficialCashReceiptPrintModalProps {
  receipt: OfficialReceiptData;
  isOpen: boolean;
  onClose: () => void;
}

export const OfficialCashReceiptPrintModal: React.FC<OfficialCashReceiptPrintModalProps> = ({
  receipt,
  isOpen,
  onClose,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF('p', 'pt', 'a5');
    const primaryColor = [200, 142, 19];
    const darkColor = [30, 41, 59];

    // Header Badge
    doc.setFillColor(15, 23, 42);
    doc.rect(30, 25, 170, 24, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('OFFICIAL MONEY RECEIPT', 38, 41);

    // Company Header Right
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(14);
    doc.text('GRAND', 320, 38);
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    doc.text('we value what you have to say!', 275, 49);
    doc.text('EST. 2004', 325, 59);

    // Separator
    doc.setDrawColor(200, 142, 19);
    doc.setLineWidth(1.5);
    doc.line(30, 68, 390, 68);

    // Details Grid
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    doc.text(`MR No: ${receipt.receiptNumber}`, 30, 88);
    doc.text(`Date: ${receipt.date}`, 310, 88);

    if (receipt.invoiceNumber) {
      doc.text(`Invoice Ref: ${receipt.invoiceNumber}`, 30, 104);
    }

    doc.setFont('helvetica', 'bold');
    doc.text('Received with thanks from:', 30, 126);
    doc.setFont('helvetica', 'normal');
    doc.text(`${receipt.clientName} ${receipt.clientCompany ? `(${receipt.clientCompany})` : ''}`, 155, 126);

    doc.setFont('helvetica', 'bold');
    doc.text('The sum of Taka (in words):', 30, 148);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`${receipt.amountInWords}`, 165, 148);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Method:', 30, 170);
    doc.setFont('helvetica', 'normal');
    doc.text(`${receipt.paymentMethod} ${receipt.reference ? `(${receipt.reference})` : ''}`, 130, 170);

    doc.setFont('helvetica', 'bold');
    doc.text('On account of / Purpose:', 30, 192);
    doc.setFont('helvetica', 'normal');
    doc.text(`${receipt.purpose}`, 155, 192);

    // Amount Box
    doc.setFillColor(241, 245, 249);
    doc.rect(30, 212, 360, 42, 'F');
    doc.setDrawColor(200, 142, 19);
    doc.setLineWidth(1);
    doc.rect(30, 212, 360, 42, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text('Amount Received:', 45, 237);
    doc.setFontSize(15);
    doc.setTextColor(180, 83, 9);
    doc.text(`BDT ৳ ${(receipt.amount || 0).toLocaleString('en-IN')}/-`, 175, 239);

    // Signatures
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.line(30, 330, 140, 330);
    doc.text("Customer's Signature", 38, 342);

    doc.line(260, 330, 390, 330);
    doc.setFont('helvetica', 'bold');
    doc.text(receipt.receivedBy || GRAND_COMPANY_INFO.defaultSignatory.name, 275, 342);
    doc.setFont('helvetica', 'normal');
    doc.text('Authorized Signatory', 285, 353);
    doc.text('Grand Communication & Marketing', 260, 363);

    doc.save(`Grand_Money_Receipt_${receipt.receiptNumber.replace(/[\/\\]/g, '_')}.pdf`);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `*GRAND COMMUNICATION & MARKETING*\n*OFFICIAL MONEY RECEIPT*\n\n` +
      `Receipt No: ${receipt.receiptNumber}\n` +
      `Date: ${receipt.date}\n` +
      `Received From: ${receipt.clientName}${receipt.clientCompany ? ` (${receipt.clientCompany})` : ''}\n` +
      `Amount Paid: ৳ ${(receipt.amount || 0).toLocaleString('en-IN')}/-\n` +
      `In Words: ${receipt.amountInWords}\n` +
      `Method: ${receipt.paymentMethod} ${receipt.reference ? `(${receipt.reference})` : ''}\n` +
      `Purpose: ${receipt.purpose}\n\n` +
      `Thank you for your payment!\n_Grand Communication & Marketing_`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#0B192C] border border-slate-700 rounded-3xl max-w-3xl w-full p-6 shadow-2xl text-slate-100 my-8">
        {/* Action Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black">
              Official Money Receipt
            </span>
            <span className="text-xs text-slate-400 font-bold">{receipt.receiptNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Receipt Pad */}
        <div
          ref={receiptRef}
          className="bg-white text-slate-900 rounded-2xl p-6 sm:p-10 shadow-xl border-4 border-amber-500/40 relative font-['Inter',sans-serif]"
        >
          {/* Top Brand Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-amber-500/60 pb-5 gap-4">
            <div className="flex items-center gap-3">
              <GrandLogo size="md" />
              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight font-serif uppercase">
                  Grand Communication & Marketing
                </h1>
                <p className="text-[10px] text-amber-700 font-semibold tracking-wider">
                  WE VALUE WHAT YOU HAVE TO SAY! • EST. 2004
                </p>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  {GRAND_COMPANY_INFO.addressLine1}, {GRAND_COMPANY_INFO.addressLine2}
                </p>
                <p className="text-[10px] text-slate-600">
                  Tel: {GRAND_COMPANY_INFO.phone1} | Email: {GRAND_COMPANY_INFO.email}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg shadow-sm">
                Money Receipt
              </div>
              <div className="mt-2 text-xs">
                <p className="font-bold text-slate-800">
                  Receipt No: <span className="font-black text-amber-700">{receipt.receiptNumber}</span>
                </p>
                <p className="text-slate-600 font-semibold">
                  Date: <span className="font-bold text-slate-800">{receipt.date}</span>
                </p>
                {receipt.invoiceNumber && (
                  <p className="text-slate-600 text-[11px]">
                    Invoice Ref: <span className="font-bold">{receipt.invoiceNumber}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Body Information */}
          <div className="mt-6 space-y-4 text-xs sm:text-sm">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 border-b border-dashed border-slate-300 pb-2">
              <span className="font-bold text-slate-700 min-w-44">Received with thanks from:</span>
              <span className="font-black text-slate-950 text-sm sm:text-base border-b-2 border-dotted border-slate-400 flex-1 pb-0.5">
                {receipt.clientName} {receipt.clientCompany ? `(${receipt.clientCompany})` : ''}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 border-b border-dashed border-slate-300 pb-2">
              <span className="font-bold text-slate-700 min-w-44">The sum of Taka (in words):</span>
              <span className="font-bold text-amber-900 italic border-b-2 border-dotted border-slate-400 flex-1 pb-0.5">
                {receipt.amountInWords}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-dashed border-slate-300 pb-2">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-slate-700">Payment Mode:</span>
                <span className="font-bold text-slate-900 px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                  {receipt.paymentMethod}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-slate-700">Details / Txn Ref:</span>
                <span className="font-semibold text-slate-900">
                  {receipt.reference || 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 border-b border-dashed border-slate-300 pb-2">
              <span className="font-bold text-slate-700 min-w-44">On account of / In payment of:</span>
              <span className="font-semibold text-slate-900 border-b-2 border-dotted border-slate-400 flex-1 pb-0.5">
                {receipt.purpose}
              </span>
            </div>
          </div>

          {/* Amount Box */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400">
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Total Amount Received
              </p>
              <p className="text-[11px] text-slate-500">
                Payment verified & updated in database
              </p>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-900 tracking-tight bg-white px-6 py-2.5 rounded-xl border border-amber-300 shadow-sm">
              BDT ৳ {(receipt.amount || 0).toLocaleString('en-IN')}/-
            </div>
          </div>

          {/* Footer & Dual Signatures */}
          <div className="mt-14 pt-4 flex justify-between items-end">
            <div className="text-center w-40">
              <div className="border-t border-slate-400 pt-1">
                <p className="text-xs font-bold text-slate-700">Customer's Signature</p>
                <p className="text-[10px] text-slate-400">Received By Client</p>
              </div>
            </div>

            {/* Official Stamp */}
            <div className="hidden sm:flex flex-col items-center justify-center p-2 rounded-full border border-amber-500/40 text-amber-700 text-[9px] font-bold text-center w-24 h-24 rotate-[-6deg] opacity-80">
              <ShieldCheck className="w-5 h-5 text-amber-600 mb-0.5" />
              <span>GRAND</span>
              <span className="text-[7px]">OFFICIAL SEAL</span>
              <span className="text-[7px]">CHATTOGRAM</span>
            </div>

            <div className="text-center w-56">
              <div className="border-t-2 border-slate-900 pt-1">
                <p className="text-xs font-black text-slate-950">
                  {receipt.receivedBy || GRAND_COMPANY_INFO.defaultSignatory.name}
                </p>
                <p className="text-[11px] font-bold text-amber-800">CEO & Founder</p>
                <p className="text-[10px] text-slate-500">Grand Communication & Marketing</p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-[10px] text-slate-400 border-t border-slate-200 pt-3">
            This is an official system generated money receipt voucher of Grand Communication & Marketing.
          </div>
        </div>
      </div>
    </div>
  );
};
