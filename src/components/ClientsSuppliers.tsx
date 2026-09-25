import React, { useState } from 'react';
import { Client, Supplier } from '../types';
import { Users, Plus, Phone, Mail, MapPin } from 'lucide-react';

interface ClientsSuppliersProps {
  clients: Client[];
  suppliers: Supplier[];
  onSaveClient: (c: Client) => void;
  onSaveSupplier: (s: Supplier) => void;
}

export const ClientsSuppliers: React.FC<ClientsSuppliersProps> = ({
  clients,
  suppliers,
  onSaveClient,
  onSaveSupplier,
}) => {
  const [activeTab, setActiveTab] = useState<'clients' | 'suppliers'>('clients');
  const [showAddClient, setShowAddClient] = useState(false);

  // New Client Form
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newClient: Client = {
      id: `cli-${Date.now()}`,
      name,
      companyName: companyName || name,
      contactPerson: contactPerson || name,
      email,
      phone,
      address,
      city: 'Chattogram',
      totalBilled: 0,
      totalPaid: 0,
      currentDue: 0,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    onSaveClient(newClient);
    setShowAddClient(false);
    setName('');
    setCompanyName('');
    setEmail('');
    setPhone('');
    setAddress('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Clients & Suppliers Directory</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Manage corporate client accounts and production vendor partners.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
              activeTab === 'clients' ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold' : 'bg-[#0B192C] text-slate-300 border border-slate-700'
            }`}
          >
            Clients ({clients.length})
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
              activeTab === 'suppliers' ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold' : 'bg-[#0B192C] text-slate-300 border border-slate-700'
            }`}
          >
            Suppliers ({suppliers.length})
          </button>
          {activeTab === 'clients' && (
            <button
              onClick={() => setShowAddClient(true)}
              className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Client
            </button>
          )}
        </div>
      </div>

      {showAddClient && (
        <div className="bg-[#0B192C] rounded-2xl p-6 shadow-2xl border border-slate-800 space-y-4 text-slate-200">
          <h3 className="font-black text-base text-white">Add New Corporate Client</h3>
          <form onSubmit={handleAddClient} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Client Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Greenovent Event Management"
                className="w-full p-2.5 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Greenovent Ltd."
                className="w-full p-2.5 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Contact Person & Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880 1819..."
                className="w-full p-2.5 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Nasirabad CDA Avenue, Chattogram"
                className="w-full p-2.5 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddClient(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 text-slate-950 font-extrabold rounded-xl text-xs cursor-pointer shadow-md"
              >
                Save Client
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'clients' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((c) => (
            <div key={c.id} className="bg-[#0B192C] rounded-2xl p-5 shadow-xl border border-slate-800 space-y-3 text-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-sm text-white">{c.name}</h3>
                  <p className="text-xs text-amber-400 font-semibold">{c.companyName}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                  {c.status}
                </span>
              </div>
              <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-800">
                <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-500" /> {c.phone}</p>
                <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-500" /> {c.email || 'N/A'}</p>
                <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-500" /> {c.address}</p>
              </div>
              <div className="pt-2 flex justify-between items-center bg-[#07101C] p-3 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">Current Due</span>
                  <span className="font-black text-amber-400">৳ {c.currentDue.toLocaleString()}/-</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[10px] block">Total Billed</span>
                  <span className="font-black text-white">৳ {c.totalBilled.toLocaleString()}/-</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((s) => (
            <div key={s.id} className="bg-[#0B192C] rounded-2xl p-5 shadow-xl border border-slate-800 space-y-3 text-slate-200">
              <div>
                <h3 className="font-bold text-sm text-white">{s.name}</h3>
                <p className="text-xs text-amber-400 font-semibold">{s.serviceCategory}</p>
              </div>
              <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-800">
                <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-500" /> {s.phone}</p>
                <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-500" /> {s.address}</p>
              </div>
              <div className="pt-2 flex justify-between items-center bg-[#07101C] p-3 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">Payable Balance</span>
                  <span className="font-black text-red-400">৳ {s.payableAmount.toLocaleString()}/-</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[10px] block">Paid Amount</span>
                  <span className="font-black text-emerald-400">৳ {s.paidAmount.toLocaleString()}/-</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
