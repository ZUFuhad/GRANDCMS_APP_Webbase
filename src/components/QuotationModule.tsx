import React, { useState } from 'react';
import { Quotation, QuotationItem, Client, PaymentRecord } from '../types';
import { DEFAULT_TERMS, GRAND_COMPANY_INFO } from '../mock/initialData';
import { GrandPadExportModal } from './GrandPadExportModal';
import { AdvancePaymentModal } from './AdvancePaymentModal';
import { AdvanceMoneyReceiptModal } from './AdvanceMoneyReceiptModal';
import { FileText, Plus, Search, Eye, Trash2, Edit3, Copy, CheckCircle2, MessageSquare, Share2, Percent, Sparkles, DollarSign, Receipt, Wallet } from 'lucide-react';

interface QuotationModuleProps {
  quotations: Quotation[];
  clients: Client[];
  onSaveQuotation: (q: Quotation) => void;
  onDeleteQuotation: (id: string) => void;
  onPreviewQuotation: (q: Quotation) => void;
  onConvertToInvoice: (q: Quotation) => void;
  onApproveAndAdvance: (q: Quotation, payment: PaymentRecord) => void;
}

export const QuotationModule: React.FC<QuotationModuleProps> = ({ quotations, clients, onSaveQuotation, onDeleteQuotation, onPreviewQuotation, onConvertToInvoice, onApproveAndAdvance }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingQuotationId, setEditingQuotationId] = useState<string | null>(null);
  const [editingQuotationNumber, setEditingQuotationNumber] = useState<string | null>(null);
  const [selectedQuotationForExport, setSelectedQuotationForExport] = useState<Quotation | null>(null);
  const [advanceQuotation, setAdvanceQuotation] = useState<Quotation | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<{ quotation: Quotation; payment: PaymentRecord } | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [subject, setSubject] = useState('');
  const [items, setItems] = useState<QuotationItem[]>([{ id: `item-${Date.now()}`, job: 'Borfi', description: 'Wooden frame + black media PVC Borfi with Installation\nSize: 3X3=9sqf', quantity: 200, unitPrice: 34, total: 6800 }]);
  const [agencyCommissionPercent, setAgencyCommissionPercent] = useState<number>(10);
  const [vatPercent, setVatPercent] = useState<number>(0);
  const [nbText, setNbText] = useState('Excluded City corporation Permissions.');
  const [terms, setTerms] = useState<string[]>(DEFAULT_TERMS);

  const handleClientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setClientName(selectedName);
    const found = clients.find((c) => c.name === selectedName || c.companyName === selectedName);
    if (found) { setClientCompany(found.companyName); setClientAddress(found.address); }
  };
  const handleOpenCreateNew = () => {
    setEditingQuotationId(null); setEditingQuotationNumber(null); setClientName(''); setClientCompany(''); setClientAddress(''); setSubject('');
    setItems([{ id: `item-${Date.now()}`, job: 'Brand Activation Setup', description: 'Design, Production, Installation and Execution at Venue', quantity: 1, unitPrice: 15000, total: 15000 }]);
    setAgencyCommissionPercent(10); setVatPercent(0); setNbText('Excluded City corporation Permissions.'); setTerms(DEFAULT_TERMS); setIsCreating(true);
  };
  const handleEditQuotation = (q: Quotation) => {
    setEditingQuotationId(q.id); setEditingQuotationNumber(q.quotationNumber); setClientName(q.clientName); setClientCompany(q.clientCompany || ''); setClientAddress(q.clientAddress || ''); setSubject(q.subject); setItems(q.items.map(i => ({ ...i })));
    setAgencyCommissionPercent(typeof q.agencyCommissionPercent === 'number' ? q.agencyCommissionPercent : 10); setVatPercent(typeof q.vatPercent === 'number' ? q.vatPercent : 0); setNbText(q.nbText || ''); setTerms(q.termsAndConditions || DEFAULT_TERMS); setIsCreating(true);
  };
  const handleAddItem = () => setItems([...items, { id: `item-${Date.now()}`, job: '', description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  const handleUpdateItem = (index: number, field: keyof QuotationItem, value: any) => { const next = [...items]; const item = { ...next[index], [field]: value }; if (field === 'quantity' || field === 'unitPrice') item.total = Number(item.quantity) * Number(item.unitPrice); next[index] = item; setItems(next); };
  const handleRemoveItem = (index: number) => { if (items.length > 1) setItems(items.filter((_, i) => i !== index)); };
  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  const serviceChargePercent = typeof agencyCommissionPercent === 'number' ? agencyCommissionPercent : 0;
  const agencyCommissionAmount = subtotal * serviceChargePercent / 100;
  const vatAmount = subtotal * (vatPercent || 0) / 100;
  const finalTotal = subtotal + agencyCommissionAmount + vatAmount;

  const handleSave = () => {
    if (!clientName.trim()) { alert('Please specify Client Name'); return; }
    const existingQuotation = editingQuotationId ? quotations.find(q => q.id === editingQuotationId) : null;
    const q: Quotation = {
      id: editingQuotationId || `quot-${Date.now()}`, quotationNumber: editingQuotationNumber || existingQuotation?.quotationNumber || `GCMS/QT/2026/${String(quotations.length + 1).padStart(3, '0')}`,
      date: existingQuotation?.date || new Date().toISOString().split('T')[0], validityDate: existingQuotation?.validityDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      clientName, clientCompany, clientAddress, subject: subject || 'Exhibition & Brand Activation Setup', items, subtotal, agencyCommissionPercent: serviceChargePercent, agencyCommissionAmount, vatPercent: vatPercent || 0, vatAmount, total: finalTotal,
      advance: existingQuotation?.advance || 0, due: finalTotal - (existingQuotation?.advance || 0), termsAndConditions: terms, nbText, signatoryName: existingQuotation?.signatoryName || GRAND_COMPANY_INFO.defaultSignatory.name, signatoryTitle: existingQuotation?.signatoryTitle || GRAND_COMPANY_INFO.defaultSignatory.title, signatoryPhone: existingQuotation?.signatoryPhone || GRAND_COMPANY_INFO.defaultSignatory.phone, status: existingQuotation?.status || 'Sent', createdAt: existingQuotation?.createdAt || new Date().toISOString().split('T')[0]
    };
    onSaveQuotation(q); setIsCreating(false); setEditingQuotationId(null); setEditingQuotationNumber(null);
  };
  const handleDuplicateToForm = (q: Quotation) => { setEditingQuotationId(null); setEditingQuotationNumber(null); setSubject(q.subject); setClientName(q.clientName); setClientCompany(q.clientCompany || ''); setClientAddress(q.clientAddress || ''); setItems(q.items.map(i => ({ ...i, id: `item-${Date.now()}-${Math.random()}` }))); setAgencyCommissionPercent(q.agencyCommissionPercent ?? 10); setVatPercent(q.vatPercent ?? 0); setNbText(q.nbText || ''); setTerms(q.termsAndConditions || DEFAULT_TERMS); setIsCreating(true); };
  const handleSaveAdvancePayment = (updatedQuotation: Quotation, newPayment: PaymentRecord) => { setAdvanceQuotation(null); setViewingReceipt({ quotation: updatedQuotation, payment: newPayment }); onApproveAndAdvance(updatedQuotation, newPayment); };
  const handleSendWhatsApp = (q: Quotation) => { const serviceP = typeof q.agencyCommissionPercent === 'number' ? q.agencyCommissionPercent : 10; const text = encodeURIComponent(`*GRAND Communication & Marketing*\n*QUOTATION: ${q.quotationNumber}*\n\nClient: ${q.clientName} (${q.clientCompany || ''})\nSubject: ${q.subject}\nDate: ${q.date}\n\n*Subtotal:* ৳ ${(q.subtotal || 0).toLocaleString()}/-\n*Service Charge (${serviceP}%):* ৳ ${(q.agencyCommissionAmount || 0).toLocaleString()}/-\n*Total Amount:* ৳ ${q.total.toLocaleString()}/-\n\nOfficial Grand Letterhead Pad Document.\nThank you for choosing Grand Communication & Marketing! We value what you have to say.`); window.open(`https://wa.me/?text=${text}`, '_blank'); };
  const filtered = quotations.filter(q => q.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) || q.subject.toLowerCase().includes(searchTerm.toLowerCase()));

  if (isCreating) return <div className="space-y-6"><div className="flex justify-between"><div><h1 className="text-2xl font-black text-white">Create Quotation</h1><p className="text-slate-400 text-sm">Prepare a quotation, then receive advance to approve it.</p></div><button onClick={() => setIsCreating(false)} className="px-4 py-2 rounded-xl bg-slate-800">Back</button></div><div className="bg-[#0B192C] rounded-2xl p-6 space-y-4"><label className="block text-sm">Client Name<input value={clientName} onChange={e => setClientName(e.target.value)} className="mt-1 w-full bg-[#07101C] border border-slate-700 rounded-xl p-3" /></label><label className="block text-sm">Client Company<input value={clientCompany} onChange={e => setClientCompany(e.target.value)} className="mt-1 w-full bg-[#07101C] border border-slate-700 rounded-xl p-3" /></label><label className="block text-sm">Client Address<input value={clientAddress} onChange={e => setClientAddress(e.target.value)} className="mt-1 w-full bg-[#07101C] border border-slate-700 rounded-xl p-3" /></label><label className="block text-sm">Subject<input value={subject} onChange={e => setSubject(e.target.value)} className="mt-1 w-full bg-[#07101C] border border-slate-700 rounded-xl p-3" /></label><div className="space-y-3"><div className="flex justify-between"><span className="font-bold">Jobs / Items</span><button onClick={handleAddItem} className="text-amber-400">+ Add Job</button></div>{items.map((item, i) => <div key={item.id} className="grid grid-cols-1 sm:grid-cols-5 gap-2"><input placeholder="Job" value={item.job} onChange={e => handleUpdateItem(i,'job',e.target.value)} className="bg-[#07101C] border border-slate-700 rounded-xl p-2" /><input placeholder="Description" value={item.description} onChange={e => handleUpdateItem(i,'description',e.target.value)} className="bg-[#07101C] border border-slate-700 rounded-xl p-2 sm:col-span-2" /><input type="number" value={item.quantity} onChange={e => handleUpdateItem(i,'quantity',Number(e.target.value))} className="bg-[#07101C] border border-slate-700 rounded-xl p-2" /><input type="number" value={item.unitPrice} onChange={e => handleUpdateItem(i,'unitPrice',Number(e.target.value))} className="bg-[#07101C] border border-slate-700 rounded-xl p-2" /></div>)}</div><div className="text-right font-black text-xl">Total: ৳ {finalTotal.toLocaleString()}</div><button onClick={handleSave} className="w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-black">Save Quotation</button></div></div>;

  return <div className="space-y-6"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2"><span>Quotation Management</span><span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">Grand Pad Ready</span></h1><p className="text-slate-400 text-xs sm:text-sm mt-0.5">Create and manage professional quotations.</p></div><button onClick={handleOpenCreateNew} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black"><Plus className="w-4 h-4" /> New Quotation</button></div><div className="relative"><Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" /><input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search quotation..." className="w-full bg-[#0B192C] border border-slate-800 rounded-xl py-2.5 pl-10 pr-4" /></div><div className="grid grid-cols-1 xl:grid-cols-2 gap-5">{filtered.map(q => <div key={q.id} className="bg-[#0B192C] rounded-2xl p-5 border border-slate-800 space-y-4"><div className="flex justify-between gap-3"><div><div className="text-xs text-amber-400 font-bold">{q.quotationNumber}</div><h3 className="text-lg font-black text-white mt-1">{q.subject}</h3><p className="text-sm text-slate-300">{q.clientName}{q.clientCompany ? ` — ${q.clientCompany}` : ''}</p></div><span className={`text-[10px] h-fit font-black px-2.5 py-1 rounded-full border ${q.status === 'Approved' ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10' : 'text-amber-300 border-amber-500/30 bg-amber-500/10'}`}>{q.status}</span></div><div className="bg-[#07101C] rounded-xl p-3 text-sm"><div className="flex justify-between"><span>Total</span><strong>৳ {q.total.toLocaleString()}</strong></div><div className="flex justify-between mt-1"><span>Advance</span><strong className="text-emerald-400">৳ {(q.advance || 0).toLocaleString()}</strong></div><div className="flex justify-between mt-1"><span>Due</span><strong>৳ {(q.due || 0).toLocaleString()}</strong></div></div><div className="flex flex-wrap gap-2"><button onClick={() => onPreviewQuotation(q)} className="px-3 py-2 rounded-lg bg-slate-800 text-xs font-bold"><Eye className="w-4 h-4 inline mr-1"/>Preview</button>{q.status !== 'Approved' && q.status !== 'Converted' && <button onClick={() => setAdvanceQuotation(q)} className="px-3 py-2 rounded-lg bg-emerald-500 text-slate-950 text-xs font-black"><Wallet className="w-4 h-4 inline mr-1"/>Approve & Advance</button>}<button onClick={() => handleEditQuotation(q)} className="px-3 py-2 rounded-lg bg-slate-800 text-xs font-bold"><Edit3 className="w-4 h-4 inline mr-1"/>Edit</button><button onClick={() => handleDuplicateToForm(q)} className="px-3 py-2 rounded-lg bg-slate-800 text-xs font-bold"><Copy className="w-4 h-4 inline mr-1"/>Duplicate</button><button onClick={() => handleSendWhatsApp(q)} className="px-3 py-2 rounded-lg bg-slate-800 text-xs font-bold"><MessageSquare className="w-4 h-4 inline mr-1"/>WhatsApp</button><button onClick={() => onDeleteQuotation(q.id)} className="px-3 py-2 rounded-lg bg-red-500/10 text-red-300 text-xs font-bold"><Trash2 className="w-4 h-4 inline mr-1"/>Delete</button></div></div>)}</div>{filtered.length === 0 && <div className="text-center text-slate-500 py-12">No quotations found.</div>}{advanceQuotation && <AdvancePaymentModal quotation={advanceQuotation} isOpen={true} onClose={() => setAdvanceQuotation(null)} onSaveAdvance={handleSaveAdvancePayment} />}{viewingReceipt && <AdvanceMoneyReceiptModal quotation={viewingReceipt.quotation} payment={viewingReceipt.payment} isOpen={true} onClose={() => setViewingReceipt(null)} />}{selectedQuotationForExport && <GrandPadExportModal quotation={selectedQuotationForExport} isOpen={true} onClose={() => setSelectedQuotationForExport(null)} />}</div>;
};
