import React, { useState } from 'react';
import { Quotation, QuotationItem, Client } from '../types';
import { DEFAULT_TERMS, GRAND_COMPANY_INFO } from '../mock/initialData';
import {
  Plus,
  Trash2,
  FileSpreadsheet,
  Eye,
  CheckCircle2,
  Copy,
  Download,
  Search,
  Filter,
  ArrowRight,
  Calculator,
  Save,
  X,
  FileText,
} from 'lucide-react';

interface QuotationModuleProps {
  quotations: Quotation[];
  clients: Client[];
  onSaveQuotation: (quotation: Quotation) => void;
  onDeleteQuotation: (id: string) => void;
  onPreviewDocument: (quotation: Quotation) => void;
  onConvertToInvoice: (quotation: Quotation) => void;
}

export const QuotationModule: React.FC<QuotationModuleProps> = ({
  quotations,
  clients,
  onSaveQuotation,
  onDeleteQuotation,
  onPreviewDocument,
  onConvertToInvoice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);

  // Form State
  const [clientId, setClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [validityDate, setValidityDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0],
  );
  const [subject, setSubject] = useState('Quotation for – Borfi & Standee setup.');
  const [items, setItems] = useState<QuotationItem[]>([
    {
      id: 'item-1',
      job: 'Borfi',
      description: 'Wooden frame + black media PVC Borfi with Installation\nSize: 3X3=9sqf',
      width: 3,
      height: 3,
      sqft: 9,
      quantity: 200,
      unitPrice: 34,
      total: 61200,
    },
    {
      id: 'item-2',
      job: 'Standee',
      description: 'Wooden frame frame + black media PVC Standee with Installation\nSize: 2X4=8sqf',
      width: 2,
      height: 4,
      sqft: 8,
      quantity: 200,
      unitPrice: 35,
      total: 56000,
    },
  ]);
  const [agencyCommissionPercent, setAgencyCommissionPercent] = useState<number>(10);
  const [vatPercent, setVatPercent] = useState<number>(0);
  const [advance, setAdvance] = useState<number>(30000);
  const [nbText, setNbText] = useState('Excluded City corporation Permissions.');
  const [terms, setTerms] = useState<string[]>(DEFAULT_TERMS);
  const [signatoryName, setSignatoryName] = useState(GRAND_COMPANY_INFO.defaultSignatory.name);
  const [signatoryTitle, setSignatoryTitle] = useState(GRAND_COMPANY_INFO.defaultSignatory.title);
  const [signatoryPhone, setSignatoryPhone] = useState(GRAND_COMPANY_INFO.defaultSignatory.phone);

  // Quick preset loader
  const handleApplyPreset = (type: 'borfi_standee' | 'backlit_sign' | 'expo_stall') => {
    if (type === 'borfi_standee') {
      setSubject('Quotation for – Borfi & Standee setup.');
      setItems([
        {
          id: `item-${Date.now()}-1`,
          job: 'Borfi',
          description: 'Wooden frame + black media PVC Borfi with Installation\nSize: 3X3=9sqf',
          width: 3,
          height: 3,
          sqft: 9,
          quantity: 200,
          unitPrice: 34,
          total: 61200,
        },
        {
          id: `item-${Date.now()}-2`,
          job: 'Standee',
          description: 'Wooden frame frame + black media PVC Standee with Installation\nSize: 2X4=8sqf',
          width: 2,
          height: 4,
          sqft: 8,
          quantity: 200,
          unitPrice: 35,
          total: 56000,
        },
        {
          id: `item-${Date.now()}-3`,
          job: 'Festoon',
          description: 'Pipe + Black media PVC Festoon with Installation\nSize: 2X4=8sqf',
          width: 2,
          height: 4,
          sqft: 8,
          quantity: 200,
          unitPrice: 28,
          total: 44800,
        },
      ]);
      setAdvance(30000);
      setAgencyCommissionPercent(10);
      setVatPercent(0);
    } else if (type === 'backlit_sign') {
      setSubject('Quotation for – Backlit Signage & Shop Facade Branding');
      setItems([
        {
          id: `item-${Date.now()}-1`,
          job: 'Backlit Signboard',
          description: 'Star Flex Backlit with 1.5" MS Box Pipe Frame & LED Tubes\nSize: 20X4=80sqf',
          width: 20,
          height: 4,
          sqft: 80,
          quantity: 1,
          unitPrice: 380,
          total: 30400,
        },
        {
          id: `item-${Date.now()}-2`,
          job: 'Pillar Wrap',
          description: 'Vinyl sticker with matte lamination on ACP sheet',
          quantity: 4,
          unitPrice: 3500,
          total: 14000,
        },
      ]);
      setAdvance(20000);
      setAgencyCommissionPercent(5);
      setVatPercent(5);
    } else if (type === 'expo_stall') {
      setSubject('Quotation for – Trade Fair Exhibition Pavilion & Wooden Stage Setup');
      setItems([
        {
          id: `item-${Date.now()}-1`,
          job: 'Stage Backdrop',
          description: 'Heavy wooden timber framing with black media flex & spotlight rig\nSize: 30X12=360sqf',
          width: 30,
          height: 12,
          sqft: 360,
          quantity: 1,
          unitPrice: 250,
          total: 90000,
        },
        {
          id: `item-${Date.now()}-2`,
          job: 'Information Desk',
          description: 'Custom wood fabricated counter with acrylic logo embossing',
          quantity: 2,
          unitPrice: 18000,
          total: 36000,
        },
      ]);
      setAdvance(50000);
    }
  };

  // Line item manipulation
  const handleAddItem = () => {
    const newItem: QuotationItem = {
      id: `item-${Date.now()}`,
      job: 'Standee',
      description: 'Wooden frame + black media PVC\nSize: 2X4=8sqf',
      quantity: 100,
      unitPrice: 35,
      total: 3500,
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (index: number, field: keyof QuotationItem, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    // Auto-calculate total
    if (field === 'quantity' || field === 'unitPrice') {
      const q = field === 'quantity' ? Number(value) : item.quantity;
      const u = field === 'unitPrice' ? Number(value) : item.unitPrice;
      item.total = (q || 0) * (u || 0);
    }

    // Auto-calculate sqft if width/height changed
    if (field === 'width' || field === 'height') {
      const w = field === 'width' ? Number(value) : item.width || 0;
      const h = field === 'height' ? Number(value) : item.height || 0;
      if (w > 0 && h > 0) {
        item.sqft = w * h;
      }
    }

    updated[index] = item;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
  const agencyCommissionAmount = Math.round((subtotal * (agencyCommissionPercent || 0)) / 100);
  const vatAmount = Math.round((subtotal * (vatPercent || 0)) / 100);
  const total = subtotal + agencyCommissionAmount + vatAmount;
  const due = Math.max(0, total - (advance || 0));

  const handleClientSelect = (cId: string) => {
    setClientId(cId);
    const client = clients.find((c) => c.id === cId);
    if (client) {
      setClientName(client.name);
      setClientCompany(client.companyName);
      setClientAddress(`${client.address}, ${client.city}`);
    }
  };

  const handleStartEdit = (quotation: Quotation) => {
    setEditingQuotation(quotation);
    setClientId(quotation.clientId);
    setClientName(quotation.clientName);
    setClientCompany(quotation.clientCompany || '');
    setClientAddress(quotation.clientAddress || '');
    setDate(quotation.date);
    setValidityDate(quotation.validityDate);
    setSubject(quotation.subject);
    setItems(quotation.items);
    setAgencyCommissionPercent(quotation.agencyCommissionPercent);
    setVatPercent(quotation.vatPercent);
    setAdvance(quotation.advance);
    setNbText(quotation.nbText);
    setTerms(quotation.termsAndConditions || DEFAULT_TERMS);
    setSignatoryName(quotation.signatoryName || GRAND_COMPANY_INFO.defaultSignatory.name);
    setSignatoryTitle(quotation.signatoryTitle || GRAND_COMPANY_INFO.defaultSignatory.title);
    setSignatoryPhone(quotation.signatoryPhone || GRAND_COMPANY_INFO.defaultSignatory.phone);
    setIsCreating(true);
  };

  const handleSave = () => {
    if (!clientName.trim()) {
      alert('Please select or specify a Client Name');
      return;
    }

    const quotationId = editingQuotation ? editingQuotation.id : `quo-${Date.now()}`;
    const quotationNumber = editingQuotation
      ? editingQuotation.quotationNumber
      : `GCM-QUO-2026-${String(quotations.length + 42).padStart(4, '0')}`;

    const quotation: Quotation = {
      id: quotationId,
      quotationNumber,
      clientId: clientId || `cli-${Date.now()}`,
      clientName,
      clientCompany,
      clientAddress,
      date,
      validityDate,
      subject,
      items,
      subtotal,
      agencyCommissionPercent,
      agencyCommissionAmount,
      vatPercent,
      vatAmount,
      total,
      advance,
      due,
      nbText,
      termsAndConditions: terms,
      signatoryName,
      signatoryTitle,
      signatoryPhone,
      status: editingQuotation ? editingQuotation.status : 'Draft',
      createdAt: editingQuotation ? editingQuotation.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveQuotation(quotation);
    setIsCreating(false);
    setEditingQuotation(null);
  };

  const handleDuplicate = (q: Quotation) => {
    const duplicated: Quotation = {
      ...q,
      id: `quo-${Date.now()}`,
      quotationNumber: `GCM-QUO-2026-${String(quotations.length + 43).padStart(4, '0')}`,
      date: new Date().toISOString().split('T')[0],
      validityDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      status: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSaveQuotation(duplicated);
  };

  // Filtered Quotations
  const filteredQuotations = quotations.filter((q) => {
    const matchesSearch =
      q.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || q.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B192C] tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-[#0B192C]" />
            Official Quotation System
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Generate authentic Grand Letterhead quotations with sqft calculations, agency commission,
            tax, and PDF/DOC export.
          </p>
        </div>

        {!isCreating && (
          <button
            onClick={() => {
              setEditingQuotation(null);
              setIsCreating(true);
            }}
            className="px-5 py-2.5 bg-[#0B192C] hover:bg-[#1E3E62] text-white font-black text-xs rounded-xl shadow-md shadow-[#0B192C]/20 flex items-center gap-2 self-start transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create New Quotation
          </button>
        )}
      </div>

      {/* --- QUOTATION BUILDER MODAL / FORM --- */}
      {isCreating ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md space-y-6 animate-in fade-in duration-200 text-slate-900">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                {editingQuotation ? 'Edit Quotation' : 'Grand Letterhead Builder'}
              </span>
              <h2 className="text-lg font-bold text-slate-950">
                {editingQuotation ? editingQuotation.quotationNumber : 'New Service Quotation'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCreating(false)}
                className="p-2 text-slate-400 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-800 font-bold flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-blue-600" />
              Quick Agency Presets:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleApplyPreset('borfi_standee')}
                className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 rounded-lg border border-slate-200 font-semibold transition-colors shadow-xs cursor-pointer"
              >
                Borfi & Standee (200 Units)
              </button>
              <button
                onClick={() => handleApplyPreset('backlit_sign')}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-800 rounded-lg border border-slate-200 font-medium transition-colors shadow-xs cursor-pointer"
              >
                Backlit Signboard & ACP
              </button>
              <button
                onClick={() => handleApplyPreset('expo_stall')}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-800 rounded-lg border border-slate-200 font-medium transition-colors shadow-xs cursor-pointer"
              >
                Stage Backdrop & Pavilion
              </button>
            </div>
          </div>

          {/* Client & Date Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Select Client or Enter Name *
              </label>
              <select
                value={clientId}
                onChange={(e) => handleClientSelect(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 mb-2 font-medium"
              >
                <option value="">-- Choose Existing Client --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.companyName})
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Client Name / Contact"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Company Name & Address
              </label>
              <input
                type="text"
                placeholder="Client Company Name"
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 mb-2 font-medium"
              />
              <input
                type="text"
                placeholder="Company Office Address (Chattogram)"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Quotation Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Validity Date</label>
                <input
                  type="date"
                  value={validityDate}
                  onChange={(e) => setValidityDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Subject Field */}
          <div>
            <label className="block text-slate-300 font-semibold text-xs mb-1">
              Subject (Appears at top of Grand Letterhead)
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-medium focus:outline-none focus:border-amber-500"
              placeholder="e.g. Quotation for – Borfi & Standee setup."
            />
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-slate-200 font-bold text-xs uppercase tracking-wider">
                Line Items & Technical Specifications
              </label>
              <button
                onClick={handleAddItem}
                className="px-3 py-1 bg-amber-600/30 hover:bg-amber-600/50 text-amber-400 rounded-lg text-xs font-semibold flex items-center gap-1 border border-amber-500/30 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-850 text-slate-300 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-2 w-8 text-center">SL</th>
                    <th className="py-2.5 px-3 w-32">Job</th>
                    <th className="py-2.5 px-3">Description & Specifications</th>
                    <th className="py-2.5 px-2 w-20 text-center">Qty</th>
                    <th className="py-2.5 px-3 w-28 text-right">Unit Price (৳)</th>
                    <th className="py-2.5 px-3 w-28 text-right">Total (৳)</th>
                    <th className="py-2.5 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-850/40">
                      <td className="py-2 px-2 text-center text-slate-400 font-medium">
                        {idx + 1}.
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.job}
                          onChange={(e) => handleUpdateItem(idx, 'job', e.target.value)}
                          placeholder="Job (e.g. Borfi)"
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-100 font-bold text-xs"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <textarea
                          rows={2}
                          value={item.description}
                          onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                          placeholder="Material description, frame type, sqft size..."
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(idx, 'quantity', e.target.value)}
                          className="w-16 text-center bg-slate-800 border border-slate-700 rounded-lg px-1 py-1 text-slate-100 font-semibold text-xs"
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(idx, 'unitPrice', e.target.value)}
                          className="w-24 text-right bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-100 font-semibold text-xs"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-amber-400 text-xs">
                        {item.total.toLocaleString()}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                          title="Delete row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Calculations & Tax Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
            {/* Left: Notes & Conditions */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  N.B. Special Note (e.g. City Corp Permissions)
                </label>
                <input
                  type="text"
                  value={nbText}
                  onChange={(e) => setNbText(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Terms & Conditions (8 Standard Terms)
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {terms.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-bold">{idx + 1}.</span>
                      <input
                        type="text"
                        value={t}
                        onChange={(e) => {
                          const updated = [...terms];
                          updated[idx] = e.target.value;
                          setTerms(updated);
                        }}
                        className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Calculations Summary */}
            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Subtotal (Line Items Total)</span>
                <span className="font-mono font-bold text-slate-100 text-sm">
                  {subtotal.toLocaleString()} /-
                </span>
              </div>

              <div className="flex justify-between items-center gap-4">
                <span className="text-slate-300 flex items-center gap-2">
                  Agency Commission
                  <input
                    type="number"
                    value={agencyCommissionPercent}
                    onChange={(e) => setAgencyCommissionPercent(Number(e.target.value))}
                    className="w-12 text-center bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-xs text-amber-400 font-bold"
                  />
                  %
                </span>
                <span className="font-mono font-semibold text-slate-200">
                  {agencyCommissionAmount.toLocaleString()} /-
                </span>
              </div>

              <div className="flex justify-between items-center gap-4">
                <span className="text-slate-300 flex items-center gap-2">
                  VAT
                  <input
                    type="number"
                    value={vatPercent}
                    onChange={(e) => setVatPercent(Number(e.target.value))}
                    className="w-12 text-center bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-xs text-slate-200 font-bold"
                  />
                  %
                </span>
                <span className="font-mono font-semibold text-slate-200">
                  {vatAmount.toLocaleString()} /-
                </span>
              </div>

              <div className="pt-2 border-t border-slate-700 flex justify-between items-center font-bold text-sm">
                <span className="text-white">Total Amount</span>
                <span className="font-mono text-amber-400 text-base">
                  {total.toLocaleString()} /-
                </span>
              </div>

              <div className="flex justify-between items-center gap-4">
                <span className="text-slate-300">Advance Expected / Paid</span>
                <input
                  type="number"
                  value={advance}
                  onChange={(e) => setAdvance(Number(e.target.value))}
                  className="w-28 text-right bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-100 font-semibold"
                />
              </div>

              <div className="pt-1 flex justify-between items-center font-bold text-sm text-rose-400">
                <span>Remaining Due Balance</span>
                <span className="font-mono text-base">{due.toLocaleString()} /-</span>
              </div>
            </div>
          </div>

          {/* Signatory Information */}
          <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Authorized Signatory Name</label>
              <input
                type="text"
                value={signatoryName}
                onChange={(e) => setSignatoryName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Executive Title</label>
              <input
                type="text"
                value={signatoryTitle}
                onChange={(e) => setSignatoryTitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Official Mobile #</label>
              <input
                type="text"
                value={signatoryPhone}
                onChange={(e) => setSignatoryPhone(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-[#0B192C] hover:bg-[#1E3E62] text-white font-black text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-blue-300" />
              Save Quotation
            </button>
          </div>
        </div>
      ) : null}

      {/* --- QUOTATION DIRECTORY & LIST --- */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by client, quotation #, or job item..."
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
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="approved">Approved</option>
              <option value="invoiced">Invoiced</option>
            </select>
          </div>
        </div>

        {/* Quotations Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0B192C] text-white font-bold">
                <th className="py-3 px-3.5">Quotation #</th>
                <th className="py-3 px-3.5">Client</th>
                <th className="py-3 px-3.5">Subject</th>
                <th className="py-3 px-3.5">Date</th>
                <th className="py-3 px-3.5 text-right">Subtotal</th>
                <th className="py-3 px-3.5 text-right">Total</th>
                <th className="py-3 px-3.5 text-right">Advance</th>
                <th className="py-3 px-3.5 text-right">Due</th>
                <th className="py-3 px-3.5 text-center">Status</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500 font-medium">
                    No quotations found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredQuotations.map((q) => (
                  <tr key={q.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-3.5 font-mono font-bold text-[#0B192C]">
                      {q.quotationNumber}
                    </td>
                    <td className="py-3 px-3.5 font-bold text-slate-900">
                      {q.clientName}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 max-w-xs truncate">
                      {q.subject}
                    </td>
                    <td className="py-3 px-3.5 text-slate-500 whitespace-nowrap">
                      {q.date}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-slate-500">
                      {q.subtotal.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-950">
                      {q.total.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-slate-500">
                      {q.advance.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-[#0B192C]">
                      {q.due.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          q.status === 'Invoiced'
                            ? 'bg-[#0B192C] text-white border-[#0B192C]'
                            : q.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-blue-50 text-[#0B192C] border border-blue-200'
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onPreviewDocument(q)}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0B192C] transition-colors cursor-pointer"
                          title="Preview Official Grand Letterhead & Print/PDF"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onConvertToInvoice(q)}
                          className="p-1.5 rounded-lg bg-[#0B192C] hover:bg-[#1E3E62] text-white transition-colors cursor-pointer"
                          title="Convert to Tax Invoice"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleStartEdit(q)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                          title="Edit Quotation"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDuplicate(q)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Delete quotation ${q.quotationNumber}?`)) {
                              onDeleteQuotation(q.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete"
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
