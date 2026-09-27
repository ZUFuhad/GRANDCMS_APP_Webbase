import React, { useState } from 'react';
import { Quotation, PaymentRecord } from '../types';
import { GRAND_COMPANY_INFO } from '../mock/initialData';
import { X, DollarSign, CheckCircle2 } from 'lucide-react';

interface AdvancePaymentModalProps { quotation: Quotation; isOpen: boolean; onClose: () => void; onSaveAdvance: (updatedQuotation: Quotation, newPayment: PaymentRecord) => void; }

export const AdvancePaymentModal: React.FC<AdvancePaymentModalProps> = ({ quotation, isOpen, onClose, onSaveAdvance }) => {
  if (!isOpen) return null;
  const currentAdvance = quotation.advance || 0;
  const currentDue = quotation.due !== undefined ? quotation.due : Math.max(0, quotation.total - currentAdvance);
  const suggested70 = Math.min(Math.round(quotation.total * 0.7), currentDue);
  const suggested50 = Math.min(Math.round(quotation.total * 0.5), currentDue);
  const [amount, setAmount] = useState<number>(currentDue > 0 ? suggested70 : 0);
  const [workOrderNo, setWorkOrderNo] = useState(quotation.workOrderNumber || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<'Cash' | 'Cheque' | 'bKash' | 'Nagad' | 'Bank Transfer'>('Bank Transfer');
  const [reference, setReference] = useState('');
  const [receivedBy, setReceivedBy] = useState(GRAND_COMPANY_INFO.defaultSignatory.name);
  const [notes, setNotes] = useState('Advance received upon work order confirmation.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return alert('Please enter a valid advance amount greater than 0.');
    if (amount > currentDue) return alert('Advance cannot be greater than the current due balance.');
    const newPayment: PaymentRecord = { id: `pay-adv-${Date.now()}`, amount: Number(amount), date, method, reference, receivedBy, notes };
    const newAdvanceTotal = currentAdvance + Number(amount);
    const updatedQuotation: Quotation = { ...quotation, advance: newAdvanceTotal, due: Math.max(0, quotation.total - newAdvanceTotal), workOrderNumber: workOrderNo || quotation.workOrderNumber, workOrderDate: date, status: 'Approved', payments: [...(quotation.payments || []), newPayment] };
    onSaveAdvance(updatedQuotation, newPayment);
  };

  return <div className="fixed inset-0 z-50 overflow-y-auto bg-[#07101C]/90 backdrop-blur-sm flex justify-center items-center p-3 sm:p-6"><div className="w-full max-w-xl bg-[#0B192C] border border-slate-700 rounded-3xl shadow-2xl overflow-hidden text-slate-200">
    <div className="p-5 border-b border-slate-800 bg-[#07101C] flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400"><DollarSign className="w-5 h-5"/></div><div><h3 className="text-base font-black text-white">Receive Advance & Approve</h3><p className="text-xs text-slate-400">{quotation.quotationNumber} • {quotation.clientName}</p></div></div><button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white"><X className="w-5 h-5"/></button></div>
    <div className="grid grid-cols-3 gap-2 p-4 bg-[#091424] border-b border-slate-800 text-center text-xs"><div><span className="text-slate-500 text-[10px] uppercase font-bold block">Quotation Total</span><b className="text-white">৳ {quotation.total.toLocaleString()}</b></div><div><span className="text-slate-500 text-[10px] uppercase font-bold block">Already Received</span><b className="text-emerald-400">৳ {currentAdvance.toLocaleString()}</b></div><div><span className="text-slate-500 text-[10px] uppercase font-bold block">Current Due</span><b className="text-amber-400">৳ {currentDue.toLocaleString()}</b></div></div>
    <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs"><div><div className="flex justify-between mb-1.5"><label className="font-bold">Advance Amount (৳) *</label><div className="flex gap-1.5"><button type="button" onClick={()=>setAmount(suggested50)} className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">50%</button><button type="button" onClick={()=>setAmount(suggested70)} className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">70%</button><button type="button" onClick={()=>setAmount(currentDue)} className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">Full Due</button></div></div><input type="number" min="1" max={currentDue} value={amount || ''} onChange={e=>setAmount(Number(e.target.value))} className="w-full p-3 bg-[#07101C] border border-amber-500/50 rounded-xl text-lg font-black text-amber-400" required/><p className="text-[11px] text-slate-400 mt-1">After approval, quotation becomes <b className="text-emerald-400">Approved</b> and moves to <b className="text-white">Project Scheduling</b>. No client invoice is generated at this stage.</p></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><label>Work Order / PO Number<input value={workOrderNo} onChange={e=>setWorkOrderNo(e.target.value)} className="mt-1 w-full p-2.5 bg-[#07101C] border border-slate-700 rounded-xl"/></label><label>Payment Date<input type="date" value={date} onChange={e=>setDate(e.target.value)} className="mt-1 w-full p-2.5 bg-[#07101C] border border-slate-700 rounded-xl" required/></label></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><label>Payment Method<select value={method} onChange={e=>setMethod(e.target.value as any)} className="mt-1 w-full p-2.5 bg-[#07101C] border border-slate-700 rounded-xl"><option>Bank Transfer</option><option>bKash</option><option>Nagad</option><option>Cheque</option><option>Cash</option></select></label><label>Transaction / Reference<input value={reference} onChange={e=>setReference(e.target.value)} className="mt-1 w-full p-2.5 bg-[#07101C] border border-slate-700 rounded-xl"/></label></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><label>Received By<input value={receivedBy} onChange={e=>setReceivedBy(e.target.value)} className="mt-1 w-full p-2.5 bg-[#07101C] border border-slate-700 rounded-xl"/></label><label>Notes<input value={notes} onChange={e=>setNotes(e.target.value)} className="mt-1 w-full p-2.5 bg-[#07101C] border border-slate-700 rounded-xl"/></label></div>
    <div className="flex justify-end gap-3 pt-3 border-t border-slate-800"><button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 rounded-xl font-bold">Cancel</button><button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4"/>Approve & Advance</button></div></form>
  </div></div>;
};
