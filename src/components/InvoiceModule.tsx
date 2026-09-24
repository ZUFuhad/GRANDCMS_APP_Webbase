import React, { useState } from 'react';
import { Invoice, PaymentRecord, Client } from '../types';
import {
  Receipt,
  Plus,
  Eye,
  CheckCircle2,
  Trash2,
  Search,
  Filter,
  DollarSign,
  Calendar,
  CreditCard,
  FileSpreadsheet,
  X,
} from 'lucide-react';

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

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Cheque' | 'bKash' | 'Nagad' | 'Bank Transfer'>('Bank Transfer');
  const [reference, setReference] = useState('');
  const [receivedBy, setReceivedBy] = useState('Mohin Uddin Mazumder');
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B192C] tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-[#0B192C]" />
            Billing & Invoicing
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Track official client invoices, advances, payment receipts, and outstanding dues.
          </p>
        </div>

        {/* Summary Metric Pills in Navy Blue & White */}
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs shadow-xs">
            <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Total Invoiced</span>
            <span className="font-mono font-black text-[#0B192C] text-sm">৳ {totalInvoiced.toLocaleString()}</span>
          </div>
          <div className="bg-white border border-blue-200 px-4 py-2 rounded-xl text-xs shadow-xs">
            <span className="text-[#0B192C] block text-[10px] font-bold uppercase tracking-wider">Total Dues</span>
            <span className="font-mono font-black text-[#0B192C] text-sm">৳ {totalDue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Payment Record Modal */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 bg-[#0B192C]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0B192C]">
                  Record Client Payment
                </span>
                <h3 className="font-bold text-slate-950 text-base">
                  {payingInvoice.invoiceNumber} &bull; {payingInvoice.clientName}
                </h3>
              </div>
              <button
                onClick={() => setPayingInvoice(null)}
                className="text-slate-400 hover:text-slate-950 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Invoice Total:</span>
                <span className="font-mono text-slate-950 font-bold">৳ {payingInvoice.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Already Paid / Advance:</span>
                <span className="font-mono text-slate-800 font-bold">৳ {payingInvoice.advance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-blue-600 pt-1.5 border-t border-slate-200">
                <span>Current Remaining Due:</span>
                <span className="font-mono text-sm font-black">৳ {payingInvoice.due.toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Payment Amount to Collect (৳) *
                </label>
                <input
                  type="number"
                  max={payingInvoice.due}
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-950 font-mono font-bold text-sm focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                >
                  <option value="Bank Transfer">Bank Transfer / EFTN / RTGS</option>
                  <option value="Cheque">Cheque</option>
                  <option value="bKash">bKash Merchant</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Cash">Cash in Hand</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Reference / Cheque / Trx ID</label>
                <input
                  type="text"
                  placeholder="e.g. City Bank Chq #482019"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  placeholder="Optional collection notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPayingInvoice(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B192C] hover:bg-[#1E3E62] text-white font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-blue-300" />
                  Confirm Payment & Update Due
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Directory Table in Navy Blue & White */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoice #, client, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#0B192C] font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0B192C] font-medium"
            >
              <option value="all">All Invoices</option>
              <option value="due">Due</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0B192C] text-white font-bold">
                <th className="py-3 px-3.5">Invoice #</th>
                <th className="py-3 px-3.5">Client</th>
                <th className="py-3 px-3.5">Date</th>
                <th className="py-3 px-3.5">Subject</th>
                <th className="py-3 px-3.5 text-right">Total (৳)</th>
                <th className="py-3 px-3.5 text-right">Paid / Advance (৳)</th>
                <th className="py-3 px-3.5 text-right">Remaining Due (৳)</th>
                <th className="py-3 px-3.5 text-center">Status</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 font-medium">
                    No invoices recorded yet.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-3.5 font-mono font-bold text-[#0B192C]">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-3.5 font-bold text-slate-900">
                      {inv.clientName}
                    </td>
                    <td className="py-3 px-3.5 text-slate-500 whitespace-nowrap">
                      {inv.date}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 max-w-xs truncate">
                      {inv.subject}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-950">
                      {inv.total.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-slate-600">
                      {inv.advance.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-[#0B192C]">
                      {inv.due.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          inv.status === 'Paid'
                            ? 'bg-[#0B192C] text-white border-[#0B192C]'
                            : inv.status === 'Partial'
                            ? 'bg-blue-50 text-[#0B192C] border border-blue-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onPreviewInvoice(inv)}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0B192C] transition-colors cursor-pointer"
                          title="Preview Official Grand Invoice & Print/PDF"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {inv.due > 0 && (
                          <button
                            onClick={() => handleOpenPaymentModal(inv)}
                            className="px-2.5 py-1 rounded-lg bg-[#0B192C] hover:bg-[#1E3E62] text-white font-bold text-[11px] transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                            title="Record Payment"
                          >
                            <CreditCard className="w-3 h-3" />
                            Pay
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (confirm(`Delete invoice ${inv.invoiceNumber}?`)) {
                              onDeleteInvoice(inv.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
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
  );
};
