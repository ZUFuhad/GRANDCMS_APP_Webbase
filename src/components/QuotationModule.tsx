import React, { useState } from 'react';
import { Quotation, QuotationItem, Client } from '../types';
import { DEFAULT_TERMS, GRAND_COMPANY_INFO } from '../mock/initialData';
import { GrandPadExportModal } from './GrandPadExportModal';
import { AdvancePaymentModal } from './AdvancePaymentModal';
import { AdvanceMoneyReceiptModal } from './AdvanceMoneyReceiptModal';
import { PaymentRecord } from '../types';
import {
  FileText,
  Plus,
  Search,
  Eye,
  Trash2,
  Edit3,
  Copy,
  CheckCircle2,
  MessageSquare,
  Share2,
  Percent,
  Sparkles,
  DollarSign,
  Receipt,
  Wallet,
} from 'lucide-react';

interface QuotationModuleProps {
  quotations: Quotation[];
  clients: Client[];
  onSaveQuotation: (q: Quotation) => void;
  onDeleteQuotation: (id: string) => void;
  onPreviewQuotation: (q: Quotation) => void;
  onConvertToInvoice: (q: Quotation) => void;
}

export const QuotationModule: React.FC<QuotationModuleProps> = ({
  quotations,
  clients,
  onSaveQuotation,
  onDeleteQuotation,
  onPreviewQuotation,
  onConvertToInvoice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingQuotationId, setEditingQuotationId] = useState<string | null>(null);
  const [editingQuotationNumber, setEditingQuotationNumber] = useState<string | null>(null);
  const [selectedQuotationForExport, setSelectedQuotationForExport] = useState<Quotation | null>(null);
  const [advanceQuotation, setAdvanceQuotation] = useState<Quotation | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<{ quotation: Quotation; payment: PaymentRecord } | null>(null);

  // Form State
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [subject, setSubject] = useState('');
  const [items, setItems] = useState<QuotationItem[]>([
    {
      id: `item-${Date.now()}`,
      job: 'Borfi',
      description: 'Wooden frame + black media PVC Borfi with Installation\nSize: 3X3=9sqf',
      quantity: 200,
      unitPrice: 34,
      total: 6800,
    },
  ]);
  const [agencyCommissionPercent, setAgencyCommissionPercent] = useState<number>(10);
  const [vatPercent, setVatPercent] = useState<number>(0);
  const [nbText, setNbText] = useState('Excluded City corporation Permissions.');
  const [terms, setTerms] = useState<string[]>(DEFAULT_TERMS);

  const handleClientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setClientName(selectedName);
    const found = clients.find((c) => c.name === selectedName || c.companyName === selectedName);
    if (found) {
      setClientCompany(found.companyName);
      setClientAddress(found.address);
    }
  };

  const handleOpenCreateNew = () => {
    setEditingQuotationId(null);
    setEditingQuotationNumber(null);
    setClientName('');
    setClientCompany('');
    setClientAddress('');
    setSubject('');
    setItems([
      {
        id: `item-${Date.now()}`,
        job: 'Brand Activation Setup',
        description: 'Design, Production, Installation and Execution at Venue',
        quantity: 1,
        unitPrice: 15000,
        total: 15000,
      },
    ]);
    setAgencyCommissionPercent(10);
    setVatPercent(0);
    setNbText('Excluded City corporation Permissions.');
    setTerms(DEFAULT_TERMS);
    setIsCreating(true);
  };

  const handleEditQuotation = (q: Quotation) => {
    setEditingQuotationId(q.id);
    setEditingQuotationNumber(q.quotationNumber);
    setClientName(q.clientName);
    setClientCompany(q.clientCompany || '');
    setClientAddress(q.clientAddress || '');
    setSubject(q.subject);
    setItems(q.items.map((i) => ({ ...i })));
    setAgencyCommissionPercent(typeof q.agencyCommissionPercent === 'number' ? q.agencyCommissionPercent : 10);
    setVatPercent(typeof q.vatPercent === 'number' ? q.vatPercent : 0);
    setNbText(q.nbText || '');
    setTerms(q.termsAndConditions || DEFAULT_TERMS);
    setIsCreating(true);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        job: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const handleUpdateItem = (index: number, field: keyof QuotationItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      item.total = Number(item.quantity) * Number(item.unitPrice);
    }
    newItems[index] = item;
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  const serviceChargePercent = typeof agencyCommissionPercent === 'number' ? agencyCommissionPercent : 0;
  const agencyCommissionAmount = (subtotal * serviceChargePercent) / 100;
  const vatAmount = (subtotal * (vatPercent || 0)) / 100;
  const finalTotal = subtotal + agencyCommissionAmount + vatAmount;

  const handleSave = () => {
    if (!clientName.trim()) {
      alert('Please specify Client Name');
      return;
    }

    const existingQuotation = editingQuotationId ? quotations.find((q) => q.id === editingQuotationId) : null;

    const quotationToSave: Quotation = {
      id: editingQuotationId || `quot-${Date.now()}`,
      quotationNumber:
        editingQuotationNumber ||
        existingQuotation?.quotationNumber ||
        `GCMS/QT/2026/${String(quotations.length + 1).padStart(3, '0')}`,
      date: existingQuotation ? existingQuotation.date : new Date().toISOString().split('T')[0],
      validityDate:
        existingQuotation?.validityDate ||
        new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      clientName,
      clientCompany,
      clientAddress,
      subject: subject || 'Exhibition & Brand Activation Setup',
      items,
      subtotal,
      agencyCommissionPercent: serviceChargePercent,
      agencyCommissionAmount,
      vatPercent: vatPercent || 0,
      vatAmount,
      total: finalTotal,
      advance: existingQuotation?.advance || 0,
      due: finalTotal - (existingQuotation?.advance || 0),
      termsAndConditions: terms,
      nbText,
      signatoryName: existingQuotation?.signatoryName || GRAND_COMPANY_INFO.defaultSignatory.name,
      signatoryTitle: existingQuotation?.signatoryTitle || GRAND_COMPANY_INFO.defaultSignatory.title,
      signatoryPhone: existingQuotation?.signatoryPhone || GRAND_COMPANY_INFO.defaultSignatory.phone,
      status: existingQuotation?.status || 'Sent',
      createdAt: existingQuotation?.createdAt || new Date().toISOString().split('T')[0],
    };

    onSaveQuotation(quotationToSave);
    setIsCreating(false);
    setEditingQuotationId(null);
    setEditingQuotationNumber(null);
  };

  const handleDuplicateToForm = (q: Quotation) => {
    setEditingQuotationId(null);
    setEditingQuotationNumber(null);
    setSubject(q.subject);
    setClientName(q.clientName);
    setClientCompany(q.clientCompany || '');
    setClientAddress(q.clientAddress || '');
    setItems(q.items.map((i) => ({ ...i, id: `item-${Date.now()}-${Math.random()}` })));
    setAgencyCommissionPercent(typeof q.agencyCommissionPercent === 'number' ? q.agencyCommissionPercent : 10);
    setVatPercent(typeof q.vatPercent === 'number' ? q.vatPercent : 0);
    setNbText(q.nbText || '');
    setTerms(q.termsAndConditions || DEFAULT_TERMS);
    setIsCreating(true);
  };

  const handleSaveAdvancePayment = (
    updatedQuotation: Quotation,
    newPayment: PaymentRecord,
    andConvertToInvoice?: boolean
  ) => {
    onSaveQuotation(updatedQuotation);
    setAdvanceQuotation(null);
    setViewingReceipt({ quotation: updatedQuotation, payment: newPayment });

    if (andConvertToInvoice) {
      onConvertToInvoice(updatedQuotation);
    }
  };

  const handleSendWhatsApp = (q: Quotation) => {
    const serviceP = typeof q.agencyCommissionPercent === 'number' ? q.agencyCommissionPercent : 10;
    const text = encodeURIComponent(
      `*GRAND Communication & Marketing*\n*QUOTATION: ${q.quotationNumber}*\n\nClient: ${q.clientName} (${q.clientCompany || ''})\nSubject: ${q.subject}\nDate: ${q.date}\n\n*Subtotal:* ৳ ${(q.subtotal || 0).toLocaleString()}/-\n*Service Charge (${serviceP}%):* ৳ ${(q.agencyCommissionAmount || 0).toLocaleString()}/-\n*Total Amount:* ৳ ${q.total.toLocaleString()}/-\n\nOfficial Grand Letterhead Pad Document.\nThank you for choosing Grand Communication & Marketing! We value what you have to say.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const filtered = quotations.filter(
    (q) =>
      q.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>Quotation Management</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Grand Pad Ready
            </span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Create and manage professional brand activation quotations with editable Service Charge & 3-format Grand Pad exports.
          </p>
        </div>
        <button
          onClick={handleOpenCreateNew}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Quotation</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-[#0B192C] rounded-2xl p-4 shadow-xl border border-slate-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Search by client name, quotation ID, or subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none w-full"
        />
      </div>

      {/* Creation / Edit Modal Form */}
      {isCreating && (
        <div className="bg-[#0B192C] rounded-2xl p-6 shadow-2xl border border-slate-800 space-y-6 text-slate-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base text-white">
                {editingQuotationId ? `Edit Quotation (${editingQuotationNumber})` : 'New Quotation Generator'}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                Official Grand Pad
              </span>
            </div>
            <button
              onClick={() => {
                setIsCreating(false);
                setEditingQuotationId(null);
                setEditingQuotationNumber(null);
              }}
              className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Select Client</label>
              <select
                onChange={handleClientSelect}
                className="w-full p-2.5 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
              >
                <option value="">-- Choose Existing Client --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.companyName})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Client Name / Contact</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Salman, Greenovent"
                className="w-full p-2.5 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Client Address</label>
              <input
                type="text"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="e.g. Nasirabad CDA Avenue, Chattogram"
                className="w-full p-2.5 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Quotation Subject / Title</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Borfi & Standee setup."
              className="w-full p-2.5 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Items Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-xs text-amber-400 uppercase tracking-wider">Quotation Items</h4>
              <button
                onClick={handleAddItem}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 bg-[#07101C] rounded-xl border border-slate-800 items-center">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={item.job}
                      onChange={(e) => handleUpdateItem(idx, 'job', e.target.value)}
                      placeholder="Job (e.g. Standee)"
                      className="w-full p-2 bg-[#0B192C] border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <textarea
                      value={item.description}
                      onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                      placeholder="Description & Dimensions..."
                      rows={2}
                      className="w-full p-2 bg-[#0B192C] border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(idx, 'quantity', Number(e.target.value))}
                      placeholder="Qty"
                      className="w-full p-2 bg-[#0B192C] border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleUpdateItem(idx, 'unitPrice', Number(e.target.value))}
                      placeholder="Unit Price"
                      className="w-full p-2 bg-[#0B192C] border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div className="sm:col-span-1 text-right font-bold text-xs text-amber-400">
                    ৳ {item.total.toLocaleString()}
                  </div>
                  <div className="sm:col-span-1 text-center">
                    <button
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 text-red-400 hover:bg-red-950/40 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Service Charge & Calculations Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#07101C] p-5 rounded-2xl border border-slate-800">
            {/* Left: Service Charge & VAT Controls */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5" />
                    <span>Service Charge / Commission (%)</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    (value <strong className="text-amber-300 font-bold">&quot;0&quot;</strong> acceptable)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={agencyCommissionPercent}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAgencyCommissionPercent(val === '' ? 0 : Number(val));
                    }}
                    placeholder="0"
                    className="w-28 p-2.5 bg-[#0B192C] border border-amber-500/50 rounded-xl text-sm font-bold text-amber-400 focus:outline-none focus:border-amber-400"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAgencyCommissionPercent(0)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        agencyCommissionPercent === 0
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-[#0B192C] hover:bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      0% (Free)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAgencyCommissionPercent(5)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        agencyCommissionPercent === 5
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-[#0B192C] hover:bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      5%
                    </button>
                    <button
                      type="button"
                      onClick={() => setAgencyCommissionPercent(10)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        agencyCommissionPercent === 10
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-[#0B192C] hover:bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      10% (Standard)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAgencyCommissionPercent(15)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        agencyCommissionPercent === 15
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-[#0B192C] hover:bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      15%
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  * 0% সেট করলে কোনো সার্ভিস চার্জ যোগ হবে না। গ্র্যান্ড প্যাড ডকুমেন্টে 0% ও 0/- প্রদর্শিত হবে।
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">VAT (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={vatPercent}
                    onChange={(e) => {
                      const val = e.target.value;
                      setVatPercent(val === '' ? 0 : Number(val));
                    }}
                    placeholder="0"
                    className="w-24 p-2 bg-[#0B192C] border border-slate-700 rounded-xl text-xs font-bold text-slate-200"
                  />
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setVatPercent(0)}
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        vatPercent === 0 ? 'bg-slate-700 text-white' : 'bg-[#0B192C] text-slate-400 border border-slate-700'
                      }`}
                    >
                      0%
                    </button>
                    <button
                      type="button"
                      onClick={() => setVatPercent(5)}
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        vatPercent === 5 ? 'bg-slate-700 text-white' : 'bg-[#0B192C] text-slate-400 border border-slate-700'
                      }`}
                    >
                      5%
                    </button>
                    <button
                      type="button"
                      onClick={() => setVatPercent(7.5)}
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        vatPercent === 7.5 ? 'bg-slate-700 text-white' : 'bg-[#0B192C] text-slate-400 border border-slate-700'
                      }`}
                    >
                      7.5%
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">N.B. Note</label>
                <input
                  type="text"
                  value={nbText}
                  onChange={(e) => setNbText(e.target.value)}
                  className="w-full p-2 bg-[#0B192C] border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            {/* Right: Financial Breakdown Card */}
            <div className="flex flex-col justify-between bg-[#0B192C] p-4 rounded-xl border border-slate-800">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-300">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-white">৳ {subtotal.toLocaleString()}/-</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <span>Service Charge ({serviceChargePercent}%):</span>
                    {serviceChargePercent === 0 && (
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        Zero
                      </span>
                    )}
                  </span>
                  <span className="font-semibold text-amber-400">৳ {agencyCommissionAmount.toLocaleString()}/-</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-300">
                  <span>VAT ({vatPercent}%):</span>
                  <span className="font-semibold text-slate-300">৳ {vatAmount.toLocaleString()}/-</span>
                </div>
                <div className="border-t border-slate-700/80 pt-2 flex justify-between items-center">
                  <span className="text-sm font-bold text-white">Final Total Amount:</span>
                  <span className="text-lg font-black text-amber-400">৳ {finalTotal.toLocaleString()}/-</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Doc generated on official Grand Letterhead Pad with authorized signature.</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                setIsCreating(false);
                setEditingQuotationId(null);
                setEditingQuotationNumber(null);
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs cursor-pointer shadow-md transition-colors"
            >
              {editingQuotationId ? 'Update Quotation' : 'Save & Generate Quotation'}
            </button>
          </div>
        </div>
      )}

      {/* Quotations List Table */}
      <div className="bg-[#0B192C] rounded-2xl shadow-xl border border-slate-800 overflow-hidden text-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#07101C] text-slate-300 font-bold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Quotation No</th>
                <th className="p-3.5">Client Name</th>
                <th className="p-3.5">Subject</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 text-center">Service Charge</th>
                <th className="p-3.5 text-right">Total Amount</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((q) => {
                const sPercent = typeof q.agencyCommissionPercent === 'number' ? q.agencyCommissionPercent : 10;
                return (
                  <tr key={q.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-bold text-white">{q.quotationNumber}</td>
                    <td className="p-3.5 font-semibold text-slate-200">
                      {q.clientName}
                      {q.clientCompany && <span className="block text-[10px] text-slate-400">{q.clientCompany}</span>}
                    </td>
                    <td className="p-3.5 text-slate-300">{q.subject}</td>
                    <td className="p-3.5 text-slate-400">{q.date}</td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          sPercent === 0
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-amber-950/60 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {sPercent}%
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="font-black text-amber-400">৳ {q.total.toLocaleString()}/-</div>
                      {(q.advance || 0) > 0 && (
                        <div className="text-[10px] space-y-0.5 mt-0.5 text-right">
                          <span className="text-emerald-400 font-bold block">Adv: ৳ {(q.advance).toLocaleString()}/-</span>
                          <span className="text-amber-300 font-semibold block">Due: ৳ {(q.due !== undefined ? q.due : q.total - q.advance).toLocaleString()}/-</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          q.status === 'Converted'
                            ? 'bg-purple-950 text-purple-300 border-purple-800'
                            : (q.advance || 0) >= q.total
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : (q.advance || 0) > 0
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700'
                            : 'bg-blue-950 text-blue-300 border-blue-800'
                        }`}
                      >
                        {q.status === 'Converted'
                          ? 'Converted'
                          : (q.advance || 0) >= q.total
                          ? 'Full Paid'
                          : (q.advance || 0) > 0
                          ? 'Adv Received'
                          : q.status}
                      </span>
                      {q.workOrderNumber && (
                        <span className="text-[9px] text-emerald-300 block font-semibold mt-0.5">
                          WO: {q.workOrderNumber}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* 1. Receive Advance / Confirm Work Order */}
                        <button
                          onClick={() => setAdvanceQuotation(q)}
                          className="px-2 py-1.5 rounded-lg bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                          title="Receive Advance Payment / Confirm Work Order"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Advance</span>
                        </button>

                        {/* 2. Send / Export Option (3 formats: PDF, DOCX, JPG on Grand Pad) */}
                        <button
                          onClick={() => setSelectedQuotationForExport(q)}
                          className="px-2 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                          title="Send & Export 3 formats (PDF, DOCX, JPG) on Grand Pad"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Send / Export</span>
                        </button>

                        {/* 3. Preview & Print View */}
                        <button
                          onClick={() => onPreviewQuotation(q)}
                          className="p-1.5 rounded-lg bg-[#07101C] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                          title="Preview & Print Sheet"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* 4. Edit Quotation & Service Charge */}
                        <button
                          onClick={() => handleEditQuotation(q)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-colors cursor-pointer"
                          title="Edit Quotation & Service Charge"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* 5. WhatsApp Quick Send */}
                        <button
                          onClick={() => handleSendWhatsApp(q)}
                          className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800 transition-colors cursor-pointer"
                          title="Send via WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>

                        {/* 6. Duplicate */}
                        <button
                          onClick={() => handleDuplicateToForm(q)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* 7. Convert to Invoice */}
                        <button
                          onClick={() => onConvertToInvoice(q)}
                          className="p-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-800 transition-colors cursor-pointer"
                          title="Convert to Tax Invoice"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>

                        {/* 8. Delete */}
                        <button
                          onClick={() => onDeleteQuotation(q.id)}
                          className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-900 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grand Pad Export & Send Modal */}
      {selectedQuotationForExport && (
        <GrandPadExportModal
          quotation={selectedQuotationForExport}
          isOpen={!!selectedQuotationForExport}
          onClose={() => setSelectedQuotationForExport(null)}
        />
      )}

      {/* Advance Payment & Work Order Modal */}
      {advanceQuotation && (
        <AdvancePaymentModal
          quotation={advanceQuotation}
          isOpen={!!advanceQuotation}
          onClose={() => setAdvanceQuotation(null)}
          onSaveAdvance={handleSaveAdvancePayment}
        />
      )}

      {/* Advance Money Receipt Modal */}
      {viewingReceipt && (
        <AdvanceMoneyReceiptModal
          quotation={viewingReceipt.quotation}
          payment={viewingReceipt.payment}
          isOpen={!!viewingReceipt}
          onClose={() => setViewingReceipt(null)}
        />
      )}
    </div>
  );
};
