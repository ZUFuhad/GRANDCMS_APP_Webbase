import React, { useState } from 'react';
import { Invoice, PaymentRecord, Client } from '../types';
import { Receipt, Plus, Eye, Trash2, Search, DollarSign, MessageSquare, Printer, Download, X } from 'lucide-react';
import jsPDF from 'jspdf';
import { GRAND_COMPANY_INFO } from '../mock/initialData';

interface InvoiceModuleProps {
  invoices: Invoice[];
  clients: Client[];
  onSaveInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onPreviewInvoice: (invoice: Invoice) => void;
}

export const InvoiceModule: React.FC<InvoiceModuleProps> = ({
  invoices,
  clients,
  onSaveInvoice,
  onDeleteInvoice,
  onPreviewInvoice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<{ invoice: Invoice; payment: PaymentRecord } | null>(null);

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Cheque' | 'bKash' | 'Nagad' | 'Bank Transfer'>('Bank Transfer');
  const [reference, setReference] = useState('');
  const [receivedBy, setReceivedBy] = useState(GRAND_COMPANY_INFO.defaultSignatory.name);
  const [notes, setNotes] = useState('');

  const handleOpenPaymentModal = (invoice: Invoice) => {
    setPayingInvoice(invoice);
    setPaymentAmount(invoice.due);
    setReference('');
    setNotes('');
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
      notes,
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
    setViewingReceipt({ invoice: updatedInvoice, payment: newPayment });
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || inv.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalDue = invoices.reduce((sum, inv) => sum + inv.due, 0);
  const totalCollected = totalInvoiced - totalDue;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Invoices & Money Receipts</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Track tax invoices, collect payments, and generate official money receipts.
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#0B192C] border border-slate-800 shadow-xl">
          <p className="text-xs font-semibold text-blue-400 uppercase">Total Invoiced</p>
          <h3 className="text-lg font-black text-white mt-1">৳ {totalInvoiced.toLocaleString()}/-</h3>
        </div>
        <div className="p-4 rounded-2xl bg-[#0B192C] border border-slate-800 shadow-xl">
          <p className="text-xs font-semibold text-emerald-400 uppercase">Total Collected (Advance)</p>
          <h3 className="text-lg font-black text-white mt-1">৳ {totalCollected.toLocaleString()}/-</h3>
        </div>
        <div className="p-4 rounded-2xl bg-[#0B192C] border border-slate-800 shadow-xl">
          <p className="text-xs font-semibold text-amber-400 uppercase">Total Due Balance</p>
          <h3 className="text-lg font-black text-white mt-1">৳ {totalDue.toLocaleString()}/-</h3>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-[#0B192C] rounded-2xl p-4 shadow-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-200">
        <div className="flex items-center gap-3 w-full sm:w-96 bg-[#07101C] rounded-xl px-3 py-2 border border-slate-700">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['all', 'Unpaid', 'Partial', 'Paid'].map((st) => (
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

      {/* Invoices List */}
      <div className="bg-[#0B192C] rounded-2xl shadow-xl border border-slate-800 overflow-hidden text-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#07101C] text-slate-300 font-bold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Invoice No</th>
                <th className="p-3.5">Client</th>
                <th className="p-3.5">Subject</th>
                <th className="p-3.5 text-right">Total</th>
                <th className="p-3.5 text-right">Advance Paid</th>
                <th className="p-3.5 text-right">Due Balance</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold text-white">{inv.invoiceNumber}</td>
                  <td className="p-3.5 font-semibold text-slate-200">{inv.clientName}</td>
                  <td className="p-3.5 text-slate-300">{inv.subject}</td>
                  <td className="p-3.5 text-right font-bold text-slate-100">৳ {inv.total.toLocaleString()}/-</td>
                  <td className="p-3.5 text-right font-bold text-emerald-400">৳ {inv.advance.toLocaleString()}/-</td>
                  <td className="p-3.5 text-right font-black text-amber-400">৳ {inv.due.toLocaleString()}/-</td>
                  <td className="p-3.5 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        inv.status === 'Paid'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : inv.status === 'Partial'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-red-950 text-red-300 border-red-800'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onPreviewInvoice(inv)}
                        className="p-1.5 rounded-lg bg-[#07101C] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 cursor-pointer transition-colors"
                        title="View Invoice"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenPaymentModal(inv)}
                        className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 cursor-pointer font-bold flex items-center gap-1 transition-colors"
                        title="Collect Payment / Advance"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        Collect
                      </button>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-base text-[#0B192C]">Record Payment & Generate Money Receipt</h3>
              <button onClick={() => setPayingInvoice(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Amount (BDT)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reference / Transaction ID</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. TXN-9821039"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Received By</label>
                <input
                  type="text"
                  value={receivedBy}
                  onChange={(e) => setReceivedBy(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setPayingInvoice(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs cursor-pointer shadow-md"
                >
                  Save & Issue Money Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Money Receipt Modal Preview */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 bg-[#0B192C]/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <span className="bg-emerald-600 text-white font-bold px-3 py-1 rounded text-xs">
                OFFICIAL MONEY RECEIPT
              </span>
              <button onClick={() => setViewingReceipt(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-800">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-black text-base text-[#0B192C]">GRAND Communication & Marketing</h3>
                  <p className="text-slate-600">{GRAND_COMPANY_INFO.addressLine1}, {GRAND_COMPANY_INFO.addressLine2}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">Receipt Date: {viewingReceipt.payment.date}</p>
                  <p className="font-semibold text-slate-600">Ref: {viewingReceipt.payment.reference || 'N/A'}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <p><strong>Received With Thanks From:</strong> {viewingReceipt.invoice.clientName} ({viewingReceipt.invoice.clientCompany || ''})</p>
                <p><strong>Against Invoice:</strong> {viewingReceipt.invoice.invoiceNumber} ({viewingReceipt.invoice.subject})</p>
                <p><strong>Payment Method:</strong> {viewingReceipt.payment.method}</p>
                <p className="text-sm font-black text-emerald-700 pt-2 border-t">
                  Amount Received: ৳ {viewingReceipt.payment.amount.toLocaleString()}/-
                </p>
              </div>

              <div className="flex justify-between items-end pt-8">
                <div>
                  <p className="font-bold text-slate-900">{viewingReceipt.payment.receivedBy}</p>
                  <p className="text-[11px] text-slate-600">Authorized Signatory</p>
                </div>
                <button
                  onClick={() => {
                    const text = encodeURIComponent(
                      `*GRAND Communication & Marketing*\n*MONEY RECEIPT*\n\nClient: ${viewingReceipt.invoice.clientName}\nInvoice: ${viewingReceipt.invoice.invoiceNumber}\nAmount Paid: ৳ ${viewingReceipt.payment.amount.toLocaleString()}/-\nMethod: ${viewingReceipt.payment.method}\n\nThank you for your payment!`
                    );
                    window.open(`https://wa.me/?text=${text}`, '_blank');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <MessageSquare className="w-4 h-4" />
                  Send via WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
