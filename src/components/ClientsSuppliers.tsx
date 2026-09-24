import React, { useState } from 'react';
import { Client, Supplier } from '../types';
import {
  Users2,
  Building,
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Trash2,
  FileSpreadsheet,
  Wallet,
  CheckCircle2,
  X,
  CreditCard,
} from 'lucide-react';

interface ClientsSuppliersProps {
  clients: Client[];
  suppliers: Supplier[];
  onSaveClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  onSaveSupplier: (supplier: Supplier) => void;
  onDraftQuotationForClient: (client: Client) => void;
  onLogSupplierExpense: (supplier: Supplier) => void;
}

export const ClientsSuppliers: React.FC<ClientsSuppliersProps> = ({
  clients,
  suppliers,
  onSaveClient,
  onDeleteClient,
  onSaveSupplier,
  onDraftQuotationForClient,
  onLogSupplierExpense,
}) => {
  const [activeTab, setActiveTab] = useState<'clients' | 'suppliers'>('clients');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showClientModal, setShowClientModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  // Client Form
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [clientDesignation, setClientDesignation] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientCity, setClientCity] = useState('Chattogram');

  // Supplier Form
  const [supplierName, setSupplierName] = useState('');
  const [supplierCompany, setSupplierCompany] = useState('');
  const [supplierCategory, setSupplierCategory] = useState<Supplier['category']>('PVC & Media');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [supplierAddress, setSupplierAddress] = useState('');
  const [supplierBank, setSupplierBank] = useState('');
  const [creditTermDays, setCreditTermDays] = useState(30);

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName) return;

    const newClient: Client = {
      id: `client-${Date.now()}`,
      name: clientName,
      companyName: clientCompany || clientName,
      contactPerson: clientContact || clientName,
      designation: clientDesignation || 'Officer',
      email: clientEmail,
      phone: clientPhone || '+880 1819 000000',
      address: clientAddress || 'CDA Market, Kazir Dewri',
      city: clientCity,
      totalBilled: 0,
      totalPaid: 0,
      currentDue: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    onSaveClient(newClient);
    setShowClientModal(false);
    resetClientForm();
  };

  const resetClientForm = () => {
    setClientName('');
    setClientCompany('');
    setClientContact('');
    setClientDesignation('');
    setClientEmail('');
    setClientPhone('');
    setClientAddress('');
  };

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName) return;

    const newSupplier: Supplier = {
      id: `sup-${Date.now()}`,
      name: supplierName,
      companyName: supplierCompany || supplierName,
      category: supplierCategory,
      email: 'vendor@grandcms.com',
      phone: supplierPhone || '+880 1819 000000',
      address: supplierAddress || 'Dewanhat, Chattogram',
      bankDetails: supplierBank,
      payableLiability: 0,
      totalPurchased: 0,
      totalPaid: 0,
      creditTermDays,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    onSaveSupplier(newSupplier);
    setShowSupplierModal(false);
    resetSupplierForm();
  };

  const resetSupplierForm = () => {
    setSupplierName('');
    setSupplierCompany('');
    setSupplierAddress('');
    setSupplierBank('');
    setSupplierPhone('');
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B192C] tracking-tight flex items-center gap-2">
            <Users2 className="w-6 h-6 text-[#0B192C]" />
            Clients & Suppliers Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Manage corporate brands, event agency partners, timber/PVC vendors, and credit balances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'clients' ? (
            <button
              onClick={() => setShowClientModal(true)}
              className="px-5 py-2.5 bg-[#0B192C] hover:bg-[#1E3E62] text-white font-black text-xs rounded-xl shadow-md shadow-[#0B192C]/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Client
            </button>
          ) : (
            <button
              onClick={() => setShowSupplierModal(true)}
              className="px-5 py-2.5 bg-[#1E3E62] hover:bg-[#0B192C] text-white font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Supplier
            </button>
          )}
        </div>
      </div>

      {/* Tabs and Search Header in Navy Blue & White */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-2.5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'clients'
                ? 'bg-[#0B192C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            <Building className="w-4 h-4 text-blue-300" />
            Corporate Clients ({clients.length})
          </button>

          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'suppliers'
                ? 'bg-[#1E3E62] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            <Truck className="w-4 h-4 text-blue-300" />
            Material Suppliers ({suppliers.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
          />
        </div>
      </div>

      {/* --- CLIENTS VIEW --- */}
      {activeTab === 'clients' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-slate-950 text-base leading-tight">
                      {client.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">{client.companyName}</p>
                  </div>
                  {client.currentDue > 0 ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#0B192C] border border-blue-200 whitespace-nowrap">
                      Due: ৳ {client.currentDue.toLocaleString()}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Settled
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 my-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Contact:</span>
                    <span className="font-semibold text-slate-800">
                      {client.contactPerson} {client.designation ? `(${client.designation})` : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-[#0B192C]" />
                    <span>{client.phone}</span>
                  </div>
                  {client.email && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-[#0B192C]" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-[#0B192C]" />
                    <span className="truncate">{client.address}, {client.city}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs mb-3">
                  <div>
                    <span className="text-slate-500 block text-[10px] font-bold uppercase">Total Billed:</span>
                    <span className="font-mono font-bold text-slate-950">
                      ৳ {client.totalBilled.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-bold uppercase">Total Paid:</span>
                    <span className="font-mono font-bold text-[#0B192C]">
                      ৳ {client.totalPaid.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  onClick={() => onDraftQuotationForClient(client)}
                  className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0B192C] rounded-xl text-xs font-bold flex items-center gap-1.5 border border-blue-200 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Draft Quotation
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Delete client ${client.name}?`)) {
                      onDeleteClient(client.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete Client"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- SUPPLIERS VIEW --- */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-slate-950 text-base leading-tight">
                      {supplier.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">{supplier.companyName}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0B192C] text-white">
                    {supplier.category}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 my-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-[#0B192C]" />
                    <span>{supplier.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-[#0B192C]" />
                    <span className="truncate">{supplier.address}</span>
                  </div>
                  {supplier.bankDetails && (
                    <div className="flex items-center gap-2 text-slate-600 text-[11px]">
                      <CreditCard className="w-3.5 h-3.5 text-[#0B192C] shrink-0" />
                      <span className="truncate">{supplier.bankDetails}</span>
                    </div>
                  )}
                </div>

                {/* Liability Box */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs mb-3 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Grand Financial Liability:</span>
                    <span className="font-mono font-bold text-[#0B192C]">
                      ৳ {supplier.payableLiability.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Credit Term:</span>
                    <span className="font-semibold text-slate-800">{supplier.creditTermDays} Days</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  onClick={() => onLogSupplierExpense(supplier)}
                  className="px-3.5 py-1.5 bg-[#0B192C] hover:bg-[#1E3E62] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  Log Expense / Bill
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- ADD CLIENT MODAL --- */}
      {showClientModal && (
        <div className="fixed inset-0 z-50 bg-[#0B192C]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateClient}
            className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-950 text-base">Add New Corporate Client</h3>
              <button
                type="button"
                onClick={() => setShowClientModal(false)}
                className="text-slate-400 hover:text-slate-950 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Client / Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ispahani Tea / Whiz Communication"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Company Entity</label>
                <input
                  type="text"
                  placeholder="e.g. Whiz Communication Ltd."
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Tanvir Hossain"
                    value={clientContact}
                    onChange={(e) => setClientContact(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Brand Head"
                    value={clientDesignation}
                    onChange={(e) => setClientDesignation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Mobile / Phone</label>
                  <input
                    type="text"
                    placeholder="+880 1711..."
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="events@company.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Address in Chattogram</label>
                <input
                  type="text"
                  placeholder="e.g. Finlay Square, GEC Circle"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowClientModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#0B192C] hover:bg-[#1E3E62] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Save Client
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- ADD SUPPLIER MODAL --- */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 bg-[#0B192C]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSupplier}
            className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-950 text-base">Add Material Supplier</h3>
              <button
                type="button"
                onClick={() => setShowSupplierModal(false)}
                className="text-slate-400 hover:text-slate-950 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Supplier Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bengal PVC & Flex House"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Category</label>
                <select
                  value={supplierCategory}
                  onChange={(e) => setSupplierCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                >
                  <option value="PVC & Media">PVC & Media (340gsm, Flex, Backlit)</option>
                  <option value="Wood & Timber">Wood & Timber (Garjan Wood Battens)</option>
                  <option value="Metal & Hardware">Metal & Hardware (MS Pipes, Clamps)</option>
                  <option value="Print & Ink">Print & Ink</option>
                  <option value="Transport & Crane">Transport & Crane Logistics</option>
                  <option value="General">General / Operational</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+880 1819..."
                    value={supplierPhone}
                    onChange={(e) => setSupplierPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Credit Terms (Days)</label>
                  <input
                    type="number"
                    value={creditTermDays}
                    onChange={(e) => setCreditTermDays(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Shop / Yard Address</label>
                <input
                  type="text"
                  placeholder="e.g. Khatungonj / Dewanhat, Chattogram"
                  value={supplierAddress}
                  onChange={(e) => setSupplierAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Bank / Payment Details</label>
                <input
                  type="text"
                  placeholder="Bank name, branch, and account number"
                  value={supplierBank}
                  onChange={(e) => setSupplierBank(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSupplierModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#0B192C] hover:bg-[#1E3E62] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Save Supplier
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
