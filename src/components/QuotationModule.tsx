import React, { useState } from 'react';
import { Quotation, QuotationItem, Client } from '../types';
import { DEFAULT_TERMS, GRAND_COMPANY_INFO } from '../mock/initialData';
import { FileText, Plus, Search, Eye, Trash2, Edit3, Copy, CheckCircle2, MessageSquare } from 'lucide-react';

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
  const agencyCommissionAmount = (subtotal * agencyCommissionPercent) / 100;
  const vatAmount = (subtotal * vatPercent) / 100;
  const total = subtotal; // Subtotal already represents total before agency commission if standalone, or adjusted. Let's make total = subtotal + agencyCommissionAmount + vatAmount or subtotal as per grand standard. In grand example: items total 162000, agency commission 16200, total 178200. Let's calculate total = subtotal + agencyCommissionAmount + vatAmount.

  const finalTotal = subtotal + agencyCommissionAmount + vatAmount;

  const handleSave = () => {
    if (!clientName.trim()) {
      alert('Please specify Client Name');
      return;
    }

    const newQuotation: Quotation = {
      id: `quot-${Date.now()}`,
      quotationNumber: `GCMS/QT/2026/${String(quotations.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      validityDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      clientName,
      clientCompany,
      clientAddress,
      subject: subject || 'Exhibition & Brand Activation Setup',
      items,
      subtotal,
      agencyCommissionPercent,
      agencyCommissionAmount,
      vatPercent,
      vatAmount,
      total: finalTotal,
      advance: 0,
      due: finalTotal,
      termsAndConditions: terms,
      nbText,
      signatoryName: GRAND_COMPANY_INFO.defaultSignatory.name,
      signatoryTitle: GRAND_COMPANY_INFO.defaultSignatory.title,
      signatoryPhone: GRAND_COMPANY_INFO.defaultSignatory.phone,
      status: 'Sent',
      createdAt: new Date().toISOString().split('T')[0],
    };

    onSaveQuotation(newQuotation);
    setIsCreating(false);
  };

  const handleDuplicateToForm = (q: Quotation) => {
    setSubject(q.subject);
    setClientName(q.clientName);
    setClientCompany(q.clientCompany || '');
    setClientAddress(q.clientAddress || '');
    setItems(q.items.map((i) => ({ ...i, id: `item-${Date.now()}-${Math.random()}` })));
    setAgencyCommissionPercent(q.agencyCommissionPercent || 10);
    setVatPercent(q.vatPercent || 0);
    setNbText(q.nbText || '');
    setTerms(q.termsAndConditions);
    setIsCreating(true);
  };

  const handleSendWhatsApp = (q: Quotation) => {
    const text = encodeURIComponent(
      `*GRAND Communication & Marketing*\n*QUOTATION: ${q.quotationNumber}*\n\nClient: ${q.clientName} (${q.clientCompany || ''})\nSubject: ${q.subject}\nDate: ${q.date}\n\n*Total Amount:* ৳ ${q.total.toLocaleString()}/-\n\nThank you for choosing Grand Communication & Marketing! We value what you have to say.`
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
          <h1 className="text-xl sm:text-2xl font-black text-white">Quotation Management</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Create and manage professional brand activation quotations.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
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

      {/* Creation Modal / Form */}
      {isCreating && (
        <div className="bg-[#0B192C] rounded-2xl p-6 shadow-2xl border border-slate-800 space-y-6 text-slate-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="font-black text-base text-white">New Quotation Generator</h3>
            <button
              onClick={() => setIsCreating(false)}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">N.B. Note</label>
              <input
                type="text"
                value={nbText}
                onChange={(e) => setNbText(e.target.value)}
                className="w-full p-2.5 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
            <div className="flex items-center justify-end gap-6 bg-[#07101C] p-4 rounded-xl border border-slate-800">
              <div>
                <p className="text-xs text-slate-400">Subtotal: ৳ {subtotal.toLocaleString()}/-</p>
                <p className="text-xs text-slate-400">Agency Commission (10%): ৳ {agencyCommissionAmount.toLocaleString()}/-</p>
                <p className="text-base font-black text-amber-400 mt-1">Total: ৳ {finalTotal.toLocaleString()}/-</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs cursor-pointer shadow-md transition-colors"
            >
              Save & Generate Quotation
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
                <th className="p-3.5 text-right">Total Amount</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((q) => (
                <tr key={q.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold text-white">{q.quotationNumber}</td>
                  <td className="p-3.5 font-semibold text-slate-200">
                    {q.clientName}
                    {q.clientCompany && <span className="block text-[10px] text-slate-400">{q.clientCompany}</span>}
                  </td>
                  <td className="p-3.5 text-slate-300">{q.subject}</td>
                  <td className="p-3.5 text-slate-400">{q.date}</td>
                  <td className="p-3.5 text-right font-black text-amber-400">৳ {q.total.toLocaleString()}/-</td>
                  <td className="p-3.5 text-center">
                    <span className="px-2.5 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-bold">
                      {q.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onPreviewQuotation(q)}
                        className="p-1.5 rounded-lg bg-[#07101C] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                        title="Preview & Print"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleSendWhatsApp(q)}
                        className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800 transition-colors cursor-pointer"
                        title="Send via WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicateToForm(q)}
                        className="p-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800 transition-colors cursor-pointer"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onConvertToInvoice(q)}
                        className="p-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-800 transition-colors cursor-pointer"
                        title="Convert to Tax Invoice"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
