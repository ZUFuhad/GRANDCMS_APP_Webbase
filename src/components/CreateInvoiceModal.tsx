import React, { useState, useEffect } from 'react';
import { Invoice, Quotation, Client, QuotationItem } from '../types';
import { GRAND_COMPANY_INFO, DEFAULT_TERMS } from '../mock/initialData';
import { X, Plus, Trash2, Receipt, CheckCircle, Calculator, FileText } from 'lucide-react';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: Invoice) => void;
  clients: Client[];
  quotations: Quotation[];
  invoicesCount: number;
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clients,
  quotations,
  invoicesCount,
}) => {
  if (!isOpen) return null;

  const defaultInvoiceNumber = `GCMS/INV/2026/${String(invoicesCount + 1).padStart(3, '0')}`;
  const today = new Date().toISOString().split('T')[0];
  const defaultDueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [invoiceNumber, setInvoiceNumber] = useState(defaultInvoiceNumber);
  const [selectedQuotationId, setSelectedQuotationId] = useState<string>('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState(today);
  const [dueDate, setDueDate] = useState(defaultDueDate);

  const [items, setItems] = useState<QuotationItem[]>([
    {
      id: `item-${Date.now()}-1`,
      job: 'Brand Activation & Fabrication',
      description: 'Production, wooden structural framing & premium print installation',
      quantity: 1,
      unitPrice: 35000,
      total: 35000,
    },
  ]);

  const [agencyCommissionPercent, setAgencyCommissionPercent] = useState<number>(0);
  const [vatPercent, setVatPercent] = useState<number>(0);
  const [advance, setAdvance] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'bKash' | 'Cheque' | 'Nagad'>('Bank Transfer');
  const [paymentReference, setPaymentReference] = useState('');
  const [signatoryName, setSignatoryName] = useState(GRAND_COMPANY_INFO.defaultSignatory.name);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-fill from Quotation when selected
  const handleSelectQuotation = (qId: string) => {
    setSelectedQuotationId(qId);
    if (!qId) return;

    const q = quotations.find((item) => item.id === qId);
    if (!q) return;

    setClientName(q.clientName);
    setClientCompany(q.clientCompany || '');
    setClientAddress(q.clientAddress || '');
    setSubject(q.subject);
    setItems(
      q.items && q.items.length > 0
        ? q.items.map((it, idx) => ({
            id: `item-${Date.now()}-${idx}`,
            job: it.job,
            description: it.description,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            total: it.total,
          }))
        : []
    );
    setAgencyCommissionPercent(typeof q.agencyCommissionPercent === 'number' ? q.agencyCommissionPercent : 10);
    setVatPercent(typeof q.vatPercent === 'number' ? q.vatPercent : 0);
    setAdvance(q.advance || 0);
  };

  // Auto-fill from Client dropdown
  const handleSelectClient = (cId: string) => {
    setSelectedClientId(cId);
    if (!cId) return;
    const c = clients.find((client) => client.id === cId);
    if (c) {
      setClientName(c.name);
      setClientCompany(c.companyName || c.name);
      setClientAddress(c.address || `${c.city || 'Chattogram'}`);
    }
  };

  const handleItemChange = (index: number, field: keyof QuotationItem, value: any) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: value };

    if (field === 'quantity' || field === 'unitPrice') {
      const q = field === 'quantity' ? Number(value) || 0 : current.quantity;
      const p = field === 'unitPrice' ? Number(value) || 0 : current.unitPrice;
      current.total = q * p;
    }

    updated[index] = current;
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}-${items.length + 1}`,
        job: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const agencyCommissionAmount = Math.round((subtotal * (Number(agencyCommissionPercent) || 0)) / 100);
  const vatAmount = Math.round(((subtotal + agencyCommissionAmount) * (Number(vatPercent) || 0)) / 100);
  const total = subtotal + agencyCommissionAmount + vatAmount;
  const due = Math.max(0, total - (Number(advance) || 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setErrorMsg('Please specify Client Name.');
      return;
    }
    if (!subject.trim()) {
      setErrorMsg('Please enter Subject / Project Title.');
      return;
    }
    if (items.length === 0 || total <= 0) {
      setErrorMsg('Please add at least one line item with valid pricing.');
      return;
    }

    const paymentsList =
      advance > 0
        ? [
            {
              id: `pay-${Date.now()}`,
              amount: advance,
              date: date,
              method: paymentMethod,
              reference: paymentReference || `INV-ADV-${invoiceNumber.split('/').pop()}`,
              receivedBy: signatoryName,
              notes: 'Advance/initial payment recorded at invoice creation',
            },
          ]
        : [];

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceNumber.trim() || defaultInvoiceNumber,
      quotationId: selectedQuotationId || undefined,
      date,
      clientName: clientName.trim(),
      clientCompany: clientCompany.trim() || undefined,
      clientAddress: clientAddress.trim() || undefined,
      subject: subject.trim(),
      items,
      subtotal,
      agencyCommissionPercent,
      agencyCommissionAmount,
      vatPercent,
      vatAmount,
      total,
      advance,
      due,
      payments: paymentsList,
      termsAndConditions: DEFAULT_TERMS,
      status: due === 0 ? 'Paid' : advance > 0 ? 'Partial' : 'Unpaid',
      signatoryName,
      createdAt: new Date().toISOString(),
    };

    onSave(newInvoice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#0B192C] border border-slate-700 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl text-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">Create New Tax Invoice</h2>
              <p className="text-xs text-slate-400">
                Issue a direct commercial tax invoice with custom line items, service charge & live Supabase sync.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-200 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Top Options Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#07101C] border border-slate-800">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B192C] border border-slate-700 rounded-xl text-xs font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Invoice Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B192C] border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Payment Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B192C] border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Quotation Link (Optional) */}
          {quotations && quotations.length > 0 && (
            <div className="p-3 bg-blue-950/20 border border-blue-900/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-xs text-blue-300 font-semibold">
                  Link Approved Quotation (Optional - auto fills client & items):
                </span>
              </div>
              <select
                value={selectedQuotationId}
                onChange={(e) => handleSelectQuotation(e.target.value)}
                className="px-3 py-1.5 bg-[#07101C] border border-blue-800/60 rounded-xl text-xs text-blue-200 focus:outline-none"
              >
                <option value="">-- No Quotation (Stand-alone Invoice) --</option>
                {quotations.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.quotationNumber} - {q.clientName} ({q.subject}) [৳{q.total.toLocaleString()}]
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Client Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Client Name *
                </label>
                {clients.length > 0 && (
                  <select
                    value={selectedClientId}
                    onChange={(e) => handleSelectClient(e.target.value)}
                    className="text-[10px] bg-[#07101C] border border-slate-700 text-amber-400 rounded px-1.5 py-0.5"
                  >
                    <option value="">Quick Select Client</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <input
                type="text"
                placeholder="e.g. Apex Footwear Ltd."
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Company / Organization
              </label>
              <input
                type="text"
                placeholder="e.g. Apex Holdings Bangladesh"
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
                className="w-full px-3 py-2 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Client Address / City
              </label>
              <input
                type="text"
                placeholder="e.g. Agrabad C/A, Chattogram"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                className="w-full px-3 py-2 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Subject / Project Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Storefront Borfi & Standee Branding Execution"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 bg-[#07101C] border border-slate-700 rounded-xl text-xs font-semibold text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-amber-400 uppercase tracking-wider">
                Line Items & Billing Specifications
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 bg-[#07101C] border border-slate-800 rounded-2xl grid grid-cols-12 gap-2.5 items-center"
                >
                  <div className="col-span-12 sm:col-span-4">
                    <input
                      type="text"
                      placeholder="Job title / Item name"
                      value={item.job}
                      onChange={(e) => handleItemChange(idx, 'job', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#0B192C] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-3">
                    <input
                      type="text"
                      placeholder="Specs / details"
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#0B192C] border border-slate-700 rounded-xl text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="col-span-4 sm:col-span-1">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-full px-2 py-1.5 bg-[#0B192C] border border-slate-700 rounded-xl text-xs text-center text-slate-200 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div className="col-span-4 sm:col-span-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="Unit Price"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                      className="w-full px-2 py-1.5 bg-[#0B192C] border border-slate-700 rounded-xl text-xs text-right font-bold text-slate-200 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div className="col-span-3 sm:col-span-1 text-right text-xs font-black text-amber-400">
                    ৳{item.total.toLocaleString()}
                  </div>

                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={items.length <= 1}
                      className="p-1.5 text-slate-500 hover:text-red-400 disabled:opacity-30 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Calculations & Advance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-[#07101C] border border-slate-800">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Agency Commission / Service Charge (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={agencyCommissionPercent}
                    onChange={(e) => setAgencyCommissionPercent(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-[#0B192C] border border-slate-700 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    VAT / Tax (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={vatPercent}
                    onChange={(e) => setVatPercent(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-[#0B192C] border border-slate-700 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-400 mb-1">
                  Advance / Immediate Payment Received (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  max={total}
                  value={advance}
                  onChange={(e) => setAdvance(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-[#0B192C] border border-emerald-500/50 rounded-xl text-xs font-bold text-emerald-300 focus:outline-none focus:border-emerald-400"
                />
              </div>

              {advance > 0 && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-[#0B192C] border border-slate-700 rounded-xl text-xs text-slate-200"
                    >
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash">Cash</option>
                      <option value="bKash">bKash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">
                      Txn Ref / Cheque No
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. TXN-819203"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#0B192C] border border-slate-700 rounded-xl text-xs text-slate-200"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Financial Summary Box */}
            <div className="p-4 rounded-xl bg-[#0B192C] border border-slate-700 flex flex-col justify-between space-y-2">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-200">৳{subtotal.toLocaleString()}/-</span>
                </div>
                {agencyCommissionPercent > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Agency Commission ({agencyCommissionPercent}%):</span>
                    <span className="font-bold text-slate-200">৳{agencyCommissionAmount.toLocaleString()}/-</span>
                  </div>
                )}
                {vatPercent > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>VAT ({vatPercent}%):</span>
                    <span className="font-bold text-slate-200">৳{vatAmount.toLocaleString()}/-</span>
                  </div>
                )}
                <div className="border-t border-slate-700 pt-2 flex justify-between text-sm font-black text-white">
                  <span>Net Invoice Total:</span>
                  <span className="text-amber-400">৳{total.toLocaleString()}/-</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-emerald-400">
                  <span>Advance Received:</span>
                  <span>- ৳{advance.toLocaleString()}/-</span>
                </div>
                <div className="border-t border-slate-700/80 pt-2 flex justify-between text-sm font-black text-amber-300">
                  <span>Due Balance:</span>
                  <span className={due > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                    ৳{due.toLocaleString()}/-
                  </span>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-slate-500 text-right">
                Authorized Signatory: <strong className="text-slate-300">{signatoryName}</strong>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Create & Sync Invoice</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
