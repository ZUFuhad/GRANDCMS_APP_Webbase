import React, { useState } from 'react';
import { Invoice, PaymentRecord, Client, Quotation } from '../types';
import { Receipt, Plus, Eye, Trash2, Search, DollarSign, MessageSquare, Printer, Download, X, FileCheck, CheckCircle } from 'lucide-react';
import { GRAND_COMPANY_INFO } from '../mock/initialData';
import { CreateInvoiceModal } from './CreateInvoiceModal';
import { CreateCashReceiptModal } from './CreateCashReceiptModal';
import { PreviousDueReceiptModal } from './PreviousDueReceiptModal';
import { OfficialCashReceiptPrintModal, OfficialReceiptData } from './OfficialCashReceiptPrintModal';
import { numberToWordsBDT } from '../utils/numberToWords';

interface InvoiceModuleProps {
  invoices: Invoice[];
  clients: Client[];
  quotations?: Quotation[];
  initialDueClientId?: string;
  onSaveInvoice: (invoice: Invoice) => void;
  onSaveClient?: (client: Client) => void;
  onDeleteInvoice: (id: string) => void;
  onPreviewInvoice: (invoice: Invoice) => void;
}

export const InvoiceModule: React.FC<InvoiceModuleProps> = ({
  invoices,
  clients,
  quotations = [],
  initialDueClientId,
  onSaveInvoice,
  onSaveClient,
  onDeleteInvoice,
  onPreviewInvoice,
}) => {
  const [activeView, setActiveView] = useState<'invoices' | 'receipts'>('invoices');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [receiptMethodFilter, setReceiptMethodFilter] = useState<string>('all');
  
  // Modals
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [isCreateReceiptOpen, setIsCreateReceiptOpen] = useState(false);
  const [isPreviousDueModalOpen, setIsPreviousDueModalOpen] = useState(false);
  const [targetDueInvoiceId, setTargetDueInvoiceId] = useState<string | undefined>(undefined);
  const [targetDueClientId, setTargetDueClientId] = useState<string | undefined>(initialDueClientId);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [printedReceiptData, setPrintedReceiptData] = useState<OfficialReceiptData | null>(null);

  // Auto-open previous due modal if initialDueClientId is passed
  React.useEffect(() => {
    if (initialDueClientId) {
      setTargetDueClientId(initialDueClientId);
      setTargetDueInvoiceId(undefined);
      setIsPreviousDueModalOpen(true);
    }
  }, [initialDueClientId]);

  // Quick Payment Modal State
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Cheque' | 'bKash' | 'Nagad' | 'Bank Transfer'>('Bank Transfer');
  const [reference, setReference] = useState('');
  const [receivedBy, setReceivedBy] = useState(GRAND_COMPANY_INFO.defaultSignatory.name);
  const [notes, setNotes] = useState('');

  const handleOpenPaymentModal = (invoice: Invoice) => {
    setPayingInvoice(invoice);
    setPaymentAmount(invoice.due > 0 ? invoice.due : invoice.total);
    setReference('');
    setNotes(`Payment against ${invoice.invoiceNumber}`);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice || paymentAmount <= 0) return;

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      amount: paymentAmount,
      date: new Date().toISOString().split('T')[0],
      method: paymentMethod,
      reference,
      receivedBy,
      notes: notes || `Payment against ${payingInvoice.invoiceNumber}`,
    };

    const newAdvance = (payingInvoice.advance || 0) + paymentAmount;
    const newDue = Math.max(0, payingInvoice.total - newAdvance);
    const newStatus = newDue === 0 ? 'Paid' : 'Partial';

    const updatedInvoice: Invoice = {
      ...payingInvoice,
      advance: newAdvance,
      due: newDue,
      status: newStatus,
      payments: [...(payingInvoice.payments || []), newPayment],
    };

    onSaveInvoice(updatedInvoice);
    setPayingInvoice(null);

    // Open Official Money Receipt Print View immediately
    setPrintedReceiptData({
      receiptNumber: `GCMS/MR/2026/${String(Math.floor(Math.random() * 899) + 101)}`,
      date: newPayment.date,
      clientName: updatedInvoice.clientName,
      clientCompany: updatedInvoice.clientCompany,
      amount: paymentAmount,
      amountInWords: numberToWordsBDT(paymentAmount),
      paymentMethod,
      reference,
      purpose: `Payment for Invoice ${updatedInvoice.invoiceNumber} (${updatedInvoice.subject})`,
      receivedBy,
      invoiceNumber: updatedInvoice.invoiceNumber,
    });
  };

  // Handler when creating a Cash Receipt from "+ Add Cash Receipt" button
  const handleSaveCashReceipt = (receiptData: {
    receiptNumber: string;
    date: string;
    clientName: string;
    clientCompany?: string;
    amount: number;
    amountInWords: string;
    paymentMethod: 'Cash' | 'Bank Transfer' | 'bKash' | 'Cheque' | 'Nagad';
    reference: string;
    purpose: string;
    receivedBy: string;
    linkedInvoiceId?: string;
  }) => {
    if (receiptData.linkedInvoiceId) {
      const inv = invoices.find((i) => i.id === receiptData.linkedInvoiceId);
      if (inv) {
        const newPayment: PaymentRecord = {
          id: `pay-${Date.now()}`,
          amount: receiptData.amount,
          date: receiptData.date,
          method: receiptData.paymentMethod,
          reference: receiptData.reference,
          receivedBy: receiptData.receivedBy,
          notes: receiptData.purpose,
        };
        const newAdvance = (inv.advance || 0) + receiptData.amount;
        const newDue = Math.max(0, inv.total - newAdvance);
        const newStatus = newDue === 0 ? 'Paid' : 'Partial';

        const updatedInvoice: Invoice = {
          ...inv,
          advance: newAdvance,
          due: newDue,
          status: newStatus,
          payments: [...(inv.payments || []), newPayment],
        };

        onSaveInvoice(updatedInvoice);
      }
    }

    setPrintedReceiptData(receiptData);
  };

  const handlePrintExistingReceipt = (inv: Invoice) => {
    const latestPayment = inv.payments && inv.payments.length > 0
      ? inv.payments[inv.payments.length - 1]
      : null;

    const amount = latestPayment ? latestPayment.amount : inv.advance || inv.total;
    const method = latestPayment ? latestPayment.method : 'Bank Transfer';
    const date = latestPayment ? latestPayment.date : inv.date;
    const ref = latestPayment ? latestPayment.reference : 'Payment on confirmation';

    setPrintedReceiptData({
      receiptNumber: `GCMS/MR/2026/${String(Math.floor(Math.random() * 899) + 101)}`,
      date,
      clientName: inv.clientName,
      clientCompany: inv.clientCompany,
      amount,
      amountInWords: numberToWordsBDT(amount),
      paymentMethod: method,
      reference: ref,
      purpose: `Payment for Invoice ${inv.invoiceNumber} (${inv.subject})`,
      receivedBy: GRAND_COMPANY_INFO.defaultSignatory.name,
      invoiceNumber: inv.invoiceNumber,
    });
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.clientCompany && inv.clientCompany.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      filterStatus === 'all' || inv.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalInvoiced = invoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
  const totalDue = invoices.reduce((sum, inv) => sum + (Number(inv.due) || 0), 0);
  const totalCollected = totalInvoiced - totalDue;

  // Flatten all receipts / payments across all invoices
  const allReceipts = invoices.flatMap((inv) =>
    (inv.payments || []).map((pay, pIdx) => ({
      ...pay,
      id: pay.id || `pay-${inv.id}-${pIdx}`,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      clientName: inv.clientName,
      clientCompany: inv.clientCompany,
      subject: inv.subject,
    }))
  ).sort((a, b) => b.date.localeCompare(a.date));

  const filteredReceipts = allReceipts.filter((r) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      r.clientName.toLowerCase().includes(q) ||
      (r.clientCompany && r.clientCompany.toLowerCase().includes(q)) ||
      r.invoiceNumber.toLowerCase().includes(q) ||
      (r.reference && r.reference.toLowerCase().includes(q)) ||
      (r.notes && r.notes.toLowerCase().includes(q));

    const matchesMethod =
      receiptMethodFilter === 'all' || r.method.toLowerCase() === receiptMethodFilter.toLowerCase();

    return matchesSearch && matchesMethod;
  });

  const totalReceiptsAmount = allReceipts.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const totalCashAmount = allReceipts.filter((r) => r.method === 'Cash').reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const totalDigitalAmount = totalReceiptsAmount - totalCashAmount;

  return (
    <div className="space-y-6">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">Invoices & Money Receipts</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
              Official Tax Pad
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Issue extra commercial invoices, collect payments, and generate official stamped money receipts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setTargetDueInvoiceId(undefined);
              setTargetDueClientId(undefined);
              setIsPreviousDueModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.02]"
            title="পূর্বের বকেয়া আদায় করুন ও ক্যাশে যোগ করুন"
          >
            <Receipt className="w-4 h-4 text-slate-950" />
            <span>+ Previous Due Receipt (বকেয়া আদায়)</span>
          </button>

          <button
            onClick={() => setIsCreateReceiptOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30 transition-all"
            title="Issue official Grand Communication cash / money receipt voucher"
          >
            <DollarSign className="w-4 h-4" />
            <span>+ Add Cash Receipt</span>
          </button>

          <button
            onClick={() => setIsCreateInvoiceOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white font-bold text-xs flex items-center gap-2 cursor-pointer border border-slate-600 transition-all"
            title="Create an extra or manual commercial tax invoice"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create New Invoice</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#0B192C] border border-slate-800 shadow-xl">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Total Invoiced</p>
          <h3 className="text-xl font-black text-white mt-1">৳ {totalInvoiced.toLocaleString()}/-</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">{invoices.length} total tax invoices</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#0B192C] border border-slate-800 shadow-xl">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Total Collected (Cash/Advance)</p>
          <h3 className="text-xl font-black text-white mt-1">৳ {totalCollected.toLocaleString()}/-</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Verified & received via cash/bank</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#0B192C] border border-slate-800 shadow-xl">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Total Pending Due Balance</p>
          <h3 className="text-xl font-black text-white mt-1">৳ {totalDue.toLocaleString()}/-</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Collectable agency receivables</p>
        </div>
      </div>

      {/* View Switcher Tabs (Invoices vs Money Receipts History) */}
      <div className="flex border-b border-slate-800 gap-2 sm:gap-4 pb-1">
        <button
          onClick={() => setActiveView('invoices')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
            activeView === 'invoices'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Receipt className="w-4 h-4 text-amber-400" />
          <span>Commercial Invoices ({invoices.length})</span>
        </button>

        <button
          onClick={() => setActiveView('receipts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
            activeView === 'receipts'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>Money Receipts & Cash Inflow ({allReceipts.length})</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </button>
      </div>

      {/* ================= VIEW 1: COMMERCIAL INVOICES ================= */}
      {activeView === 'invoices' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
      <div className="bg-[#0B192C] rounded-2xl p-4 shadow-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-200">
        <div className="flex items-center gap-3 w-full sm:w-96 bg-[#07101C] rounded-xl px-3 py-2 border border-slate-700">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by client, invoice no, subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['all', 'Due', 'Partial', 'Paid'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-[#07101C] text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-[#0B192C] rounded-2xl shadow-xl border border-slate-800 overflow-hidden text-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#07101C] text-slate-300 font-bold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Invoice No</th>
                <th className="p-3.5">Client & Company</th>
                <th className="p-3.5">Subject</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 text-right">Total</th>
                <th className="p-3.5 text-right">Advance Paid</th>
                <th className="p-3.5 text-right">Due Balance</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-400">
                    <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-60" />
                    <p className="font-bold text-white text-base">No invoices found</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      Click <strong className="text-amber-400">+ Create New Invoice</strong> above to issue a direct tax invoice, or mark a project "Done" in Project Scheduling.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-bold text-white whitespace-nowrap">
                      {inv.invoiceNumber}
                      {inv.quotationId && (
                        <span className="block text-[10px] text-slate-500 font-normal">
                          Linked Quotation
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-200">
                      <div>{inv.clientName}</div>
                      {inv.clientCompany && (
                        <div className="text-[10px] text-slate-400 font-normal">{inv.clientCompany}</div>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-300 max-w-xs truncate">{inv.subject}</td>
                    <td className="p-3.5 text-slate-400 whitespace-nowrap">{inv.date}</td>
                    <td className="p-3.5 text-right font-bold text-slate-100">
                      ৳ {(inv.total || 0).toLocaleString()}/-
                    </td>
                    <td className="p-3.5 text-right font-bold text-emerald-400">
                      ৳ {(inv.advance || 0).toLocaleString()}/-
                    </td>
                    <td className="p-3.5 text-right font-black text-amber-400">
                      ৳ {(inv.due !== undefined ? inv.due : Math.max(0, inv.total - (inv.advance || 0))).toLocaleString()}/-
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          inv.status === 'Paid' || (inv.due !== undefined && inv.due <= 0)
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : inv.status === 'Partial' || (inv.advance && inv.advance > 0)
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-red-950 text-red-300 border-red-800'
                        }`}
                      >
                        {inv.due !== undefined && inv.due <= 0 ? 'Paid' : inv.status || 'Due'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => onPreviewInvoice(inv)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 cursor-pointer font-bold text-[11px] flex items-center gap-1 transition-all"
                          title="View / Print Tax Invoice"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                        {inv.due > 0 && (
                          <button
                            onClick={() => {
                              setTargetDueInvoiceId(inv.id);
                              const matchedClient = clients.find(
                                (c) => c.name === inv.clientName || c.companyName === inv.clientCompany
                              );
                              setTargetDueClientId(matchedClient?.id);
                              setIsPreviousDueModalOpen(true);
                            }}
                            className="px-2 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 cursor-pointer font-bold text-[11px] flex items-center gap-1 transition-colors"
                            title="পূর্বের বকেয়া আদায় রিসিট করুন ও ক্যাশে যোগ করুন"
                          >
                            <Receipt className="w-3.5 h-3.5 text-amber-400" />
                            <span>Due Receipt</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenPaymentModal(inv)}
                          className="px-2 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 cursor-pointer font-bold text-[11px] flex items-center gap-1 transition-colors"
                          title="Collect Payment / Advance"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Collect</span>
                        </button>

                        {(inv.advance > 0 || (inv.payments && inv.payments.length > 0)) && (
                          <button
                            onClick={() => handlePrintExistingReceipt(inv)}
                            className="px-2 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 cursor-pointer font-bold text-[11px] flex items-center gap-1 transition-colors"
                            title="Print Money Receipt Voucher"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>MR Receipt</span>
                          </button>
                        )}

                        <button
                          onClick={() => onDeleteInvoice(inv.id)}
                          className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-900 cursor-pointer transition-colors"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )}

  {/* ================= VIEW 2: MONEY RECEIPTS & CASH INFLOW ================= */}
  {activeView === 'receipts' && (
    <div className="space-y-4 animate-fade-in">
      {/* Quick Receipts Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#0B192C] p-3.5 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Money Receipts</span>
            <span className="text-xl font-black text-white">{allReceipts.length} Vouchers</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0B192C] p-3.5 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">Total Cash In-Hand</span>
            <span className="text-xl font-black text-emerald-400">৳ {totalCashAmount.toLocaleString()}/-</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0B192C] p-3.5 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-400 block">Bank / bKash / Cheque</span>
            <span className="text-xl font-black text-amber-400">৳ {totalDigitalAmount.toLocaleString()}/-</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Receipts Search & Method Filters */}
      <div className="bg-[#0B192C] rounded-2xl p-4 shadow-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-200">
        <div className="flex items-center gap-3 w-full sm:w-96 bg-[#07101C] rounded-xl px-3 py-2 border border-slate-700">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search receipts by client, reference, invoice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['all', 'Cash', 'Bank Transfer', 'bKash', 'Nagad', 'Cheque'].map((method) => (
            <button
              key={method}
              onClick={() => setReceiptMethodFilter(method)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                receiptMethodFilter === method
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-[#07101C] text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-[#0B192C] rounded-2xl shadow-xl border border-slate-800 overflow-hidden text-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#07101C] text-slate-300 font-bold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Client & Company</th>
                <th className="p-3.5">Invoice Ref</th>
                <th className="p-3.5 text-right">Amount Received</th>
                <th className="p-3.5 text-center">Payment Method</th>
                <th className="p-3.5">Ref / Txn / Cheque</th>
                <th className="p-3.5">Received By</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No money receipt records found. Create a cash receipt or previous due receipt to populate this ledger!
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((rcpt, idx) => (
                  <tr key={rcpt.id || idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 text-slate-300 whitespace-nowrap font-medium">{rcpt.date}</td>
                    <td className="p-3.5 font-semibold text-white">
                      <div>{rcpt.clientName}</div>
                      {rcpt.clientCompany && (
                        <div className="text-[10px] text-slate-400 font-normal">{rcpt.clientCompany}</div>
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-amber-400 text-xs font-bold">
                      {rcpt.invoiceNumber}
                    </td>
                    <td className="p-3.5 text-right font-black text-emerald-400 text-sm">
                      ৳ {Number(rcpt.amount).toLocaleString()}/-
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          rcpt.method === 'Cash'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : rcpt.method === 'Bank Transfer'
                            ? 'bg-blue-950 text-blue-300 border-blue-800'
                            : rcpt.method === 'bKash'
                            ? 'bg-pink-950 text-pink-300 border-pink-800'
                            : 'bg-purple-950 text-purple-300 border-purple-800'
                        }`}
                      >
                        {rcpt.method}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300 font-mono text-[11px] truncate max-w-[140px]">
                      {rcpt.reference || 'N/A'}
                    </td>
                    <td className="p-3.5 text-slate-400 text-[11px]">{rcpt.receivedBy || 'Grand Official'}</td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => {
                          setPrintedReceiptData({
                            receiptNumber: `GCMS/MR/2026/${String(Math.floor(Math.random() * 899) + 101)}`,
                            date: rcpt.date,
                            clientName: rcpt.clientName,
                            clientCompany: rcpt.clientCompany,
                            amount: rcpt.amount,
                            amountInWords: numberToWordsBDT(rcpt.amount),
                            paymentMethod: rcpt.method,
                            reference: rcpt.reference,
                            purpose: rcpt.notes || `Payment against ${rcpt.invoiceNumber}`,
                            receivedBy: rcpt.receivedBy || GRAND_COMPANY_INFO.defaultSignatory.name,
                            invoiceNumber: rcpt.invoiceNumber,
                          });
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold text-[11px] flex items-center gap-1 mx-auto cursor-pointer transition-colors"
                        title="Print Official Stamped Money Receipt"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print MR</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )}

      {/* 1. Modal: Create New Standalone / Extra Invoice */}
      {isCreateInvoiceOpen && (
        <CreateInvoiceModal
          isOpen={isCreateInvoiceOpen}
          onClose={() => setIsCreateInvoiceOpen(false)}
          onSave={(newInv) => {
            onSaveInvoice(newInv);
            // Immediately preview the created invoice
            onPreviewInvoice(newInv);
          }}
          clients={clients}
          quotations={quotations}
          invoicesCount={invoices.length}
        />
      )}

      {/* 2. Modal: Add Cash / Money Receipt */}
      {isCreateReceiptOpen && (
        <CreateCashReceiptModal
          isOpen={isCreateReceiptOpen}
          onClose={() => setIsCreateReceiptOpen(false)}
          onSaveReceipt={handleSaveCashReceipt}
          invoices={invoices}
          clients={clients}
        />
      )}

      {/* 3. Modal: Quick Payment on Table Row */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0B192C] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-base text-white">Record Payment & Issue Receipt</h3>
                <p className="text-[11px] text-slate-400">
                  {payingInvoice.invoiceNumber} • {payingInvoice.clientName}
                </p>
              </div>
              <button
                onClick={() => setPayingInvoice(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-300">Payment Amount (BDT ৳) *</label>
                  <span className="text-[11px] text-amber-400 font-bold">
                    Pending Due: ৳{payingInvoice.due.toLocaleString()}
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  max={payingInvoice.due > 0 ? payingInvoice.due : payingInvoice.total}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#07101C] border border-slate-700 rounded-xl text-sm font-black text-emerald-400 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full p-2.5 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-200"
                >
                  <option value="Cash">Cash (নগদ)</option>
                  <option value="Bank Transfer">Bank Transfer (অনলাইন ব্যাংক)</option>
                  <option value="bKash">bKash (বিকাশ)</option>
                  <option value="Nagad">Nagad (নগদ)</option>
                  <option value="Cheque">Bank Cheque (চেক)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Reference / Txn ID / Cheque No
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. TXN-9821039 or Cheque # 102910"
                  className="w-full p-2.5 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Received By</label>
                <input
                  type="text"
                  value={receivedBy}
                  onChange={(e) => setReceivedBy(e.target.value)}
                  className="w-full p-2.5 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-200"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPayingInvoice(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black rounded-xl text-xs cursor-pointer shadow-md"
                >
                  Save & Issue Official Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal: Previous Due Receipt (পূর্বের বকেয়া আদায়) */}
      {isPreviousDueModalOpen && (
        <PreviousDueReceiptModal
          isOpen={isPreviousDueModalOpen}
          onClose={() => {
            setIsPreviousDueModalOpen(false);
            setTargetDueInvoiceId(undefined);
            setTargetDueClientId(undefined);
          }}
          invoices={invoices}
          clients={clients}
          onSaveInvoice={onSaveInvoice}
          onSaveClient={onSaveClient}
          onReceiptCompleted={(receiptData) => setPrintedReceiptData(receiptData)}
          preselectedInvoiceId={targetDueInvoiceId}
          preselectedClientId={targetDueClientId}
        />
      )}

      {/* 5. Modal: Official Printable Cash / Money Receipt Voucher */}
      {printedReceiptData && (
        <OfficialCashReceiptPrintModal
          receipt={printedReceiptData}
          isOpen={Boolean(printedReceiptData)}
          onClose={() => setPrintedReceiptData(null)}
        />
      )}
    </div>
  );
};
