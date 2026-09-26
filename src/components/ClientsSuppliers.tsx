import React, { useState } from 'react';
import { Client, Supplier } from '../types';
import {
  Users,
  Plus,
  Phone,
  Mail,
  MapPin,
  Search,
  Truck,
  DollarSign,
  Receipt,
  Edit3,
  Trash2,
  Package,
  CreditCard,
  CheckCircle2,
  X,
  Sparkles,
  Tag,
  Star,
} from 'lucide-react';

interface ClientsSuppliersProps {
  clients: Client[];
  suppliers: Supplier[];
  onSaveClient: (c: Client) => void;
  onDeleteClient?: (id: string) => void;
  onSaveSupplier: (s: Supplier) => void;
  onDeleteSupplier?: (id: string) => void;
}

const COMMON_PRODUCT_SUGGESTIONS = [
  'Black Back PVC Borfi',
  '1.5"x1" Wooden Batten',
  '4mm / 6mm Plywood',
  'Rollup Standee Hardware',
  'Digital Flex Print',
  'Vinyl Stickers',
  'Acrylic Sheets & Letters',
  'Stage Truss & Carpets',
  'Sound System & Mics',
  'LED Screen Panels',
  'Transport & Van',
];

const SUPPLIER_CATEGORIES = [
  'Flex & PVC Printing',
  'Wooden Framework & Booths',
  'Standee & Display Hardware',
  'Sound, Lights & LED Screen',
  'Acrylic & Neon Signage',
  'Metal Fabrication & Truss',
  'Stage, Carpet & Drapery',
  'Transport & Logistics',
  'Paint & Finishing Materials',
  'Other Production Vendor',
];

export const ClientsSuppliers: React.FC<ClientsSuppliersProps> = ({
  clients,
  suppliers,
  onSaveClient,
  onDeleteClient,
  onSaveSupplier,
  onDeleteSupplier,
}) => {
  const [activeTab, setActiveTab] = useState<'clients' | 'suppliers'>('clients');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Client Modals
  const [showAddClient, setShowAddClient] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Supplier Modals
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [payingSupplier, setPayingSupplier] = useState<Supplier | null>(null);
  const [billingSupplier, setBillingSupplier] = useState<Supplier | null>(null);

  // Client Form State
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientContactPerson, setClientContactPerson] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  // Supplier Form State
  const [supplierName, setSupplierName] = useState('');
  const [serviceCategory, setServiceCategory] = useState(SUPPLIER_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [productsInput, setProductsInput] = useState('');
  const [selectedProductTags, setSelectedProductTags] = useState<string[]>([]);
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [payableAmount, setPayableAmount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('bKash / Bank Transfer');
  const [bankDetails, setBankDetails] = useState('');
  const [notes, setNotes] = useState('');

  // Pay Supplier Form State
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payMethod, setPayMethod] = useState<'bKash' | 'Bank Transfer' | 'Cash' | 'Cheque'>('bKash');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');

  // Add Bill Form State
  const [billAmount, setBillAmount] = useState<number>(0);
  const [billItems, setBillItems] = useState('');
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [billMemo, setBillMemo] = useState('');

  const formatMoney = (val: number) => {
    return `${(val || 0).toLocaleString('en-IN')}/-`;
  };

  // Open Client Modal
  const handleOpenClientModal = (clientToEdit?: Client) => {
    if (clientToEdit) {
      setEditingClient(clientToEdit);
      setClientName(clientToEdit.name);
      setClientCompany(clientToEdit.companyName || '');
      setClientContactPerson(clientToEdit.contactPerson || '');
      setClientEmail(clientToEdit.email || '');
      setClientPhone(clientToEdit.phone || '');
      setClientAddress(clientToEdit.address || '');
    } else {
      setEditingClient(null);
      setClientName('');
      setClientCompany('');
      setClientContactPerson('');
      setClientEmail('');
      setClientPhone('');
      setClientAddress('');
    }
    setShowAddClient(true);
  };

  // Save Client
  const handleSaveClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    const newClient: Client = {
      id: editingClient ? editingClient.id : `cli-${Date.now()}`,
      name: clientName,
      companyName: clientCompany || clientName,
      contactPerson: clientContactPerson || clientName,
      email: clientEmail,
      phone: clientPhone,
      address: clientAddress,
      city: 'Chattogram',
      totalBilled: editingClient ? editingClient.totalBilled : 0,
      totalPaid: editingClient ? editingClient.totalPaid : 0,
      currentDue: editingClient ? editingClient.currentDue : 0,
      status: editingClient ? editingClient.status : 'active',
      createdAt: editingClient ? editingClient.createdAt : new Date().toISOString().split('T')[0],
    };

    onSaveClient(newClient);
    setShowAddClient(false);
  };

  // Open Supplier Modal
  const handleOpenSupplierModal = (supToEdit?: Supplier) => {
    if (supToEdit) {
      setEditingSupplier(supToEdit);
      setSupplierName(supToEdit.name);
      setServiceCategory(
        SUPPLIER_CATEGORIES.includes(supToEdit.serviceCategory)
          ? supToEdit.serviceCategory
          : 'Other Production Vendor'
      );
      setCustomCategory(
        SUPPLIER_CATEGORIES.includes(supToEdit.serviceCategory) ? '' : supToEdit.serviceCategory
      );
      setSelectedProductTags(supToEdit.productsProvided || []);
      setProductsInput('');
      setContactPerson(supToEdit.contactPerson || '');
      setPhone(supToEdit.phone || '');
      setEmail(supToEdit.email || '');
      setAddress(supToEdit.address || '');
      setPayableAmount(supToEdit.payableAmount || 0);
      setPaidAmount(supToEdit.paidAmount || 0);
      setPaymentMethod(supToEdit.paymentMethod || 'bKash / Bank Transfer');
      setBankDetails(supToEdit.bankDetails || '');
      setNotes(supToEdit.notes || '');
    } else {
      setEditingSupplier(null);
      setSupplierName('');
      setServiceCategory(SUPPLIER_CATEGORIES[0]);
      setCustomCategory('');
      setSelectedProductTags([]);
      setProductsInput('');
      setContactPerson('');
      setPhone('');
      setEmail('');
      setAddress('');
      setPayableAmount(0);
      setPaidAmount(0);
      setPaymentMethod('bKash / Bank Transfer');
      setBankDetails('');
      setNotes('');
    }
    setShowAddSupplier(true);
  };

  // Add Product Tag to Form
  const handleAddProductTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || selectedProductTags.includes(trimmed)) return;
    setSelectedProductTags([...selectedProductTags, trimmed]);
  };

  const handleRemoveProductTag = (tagToRemove: string) => {
    setSelectedProductTags(selectedProductTags.filter((t) => t !== tagToRemove));
  };

  // Save Supplier
  const handleSaveSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) {
      alert('Please enter supplier name.');
      return;
    }

    // Combine any remaining text in productsInput
    let finalProducts = [...selectedProductTags];
    if (productsInput.trim()) {
      const extraTags = productsInput
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !finalProducts.includes(s));
      finalProducts = [...finalProducts, ...extraTags];
    }

    const finalCategory =
      serviceCategory === 'Other Production Vendor' && customCategory.trim()
        ? customCategory.trim()
        : serviceCategory;

    const newSupplier: Supplier = {
      id: editingSupplier ? editingSupplier.id : `sup-${Date.now()}`,
      name: supplierName.trim(),
      serviceCategory: finalCategory,
      productsProvided: finalProducts,
      contactPerson: contactPerson.trim() || supplierName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim() || 'CDA Market, Kazir Dewri, Chattogram',
      payableAmount: Number(payableAmount || 0),
      paidAmount: Number(paidAmount || 0),
      paymentMethod,
      bankDetails,
      notes,
      rating: editingSupplier?.rating || 5.0,
      createdAt: editingSupplier?.createdAt || new Date().toISOString().split('T')[0],
    };

    onSaveSupplier(newSupplier);
    setShowAddSupplier(false);
  };

  // Open Pay Supplier Modal
  const handleOpenPaySupplier = (s: Supplier) => {
    setPayingSupplier(s);
    setPayAmount(s.payableAmount > 0 ? s.payableAmount : 0);
    setPayRef('');
    setPayNotes('');
  };

  // Confirm Pay Supplier
  const handleConfirmPaySupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingSupplier || payAmount <= 0) return;

    const updated: Supplier = {
      ...payingSupplier,
      payableAmount: Math.max(0, payingSupplier.payableAmount - Number(payAmount)),
      paidAmount: (payingSupplier.paidAmount || 0) + Number(payAmount),
      notes: payNotes
        ? `${payingSupplier.notes ? payingSupplier.notes + ' | ' : ''}Paid ৳${payAmount} via ${payMethod} on ${payDate}`
        : payingSupplier.notes,
    };

    onSaveSupplier(updated);
    setPayingSupplier(null);
  };

  // Open Add Bill Modal
  const handleOpenAddBill = (s: Supplier) => {
    setBillingSupplier(s);
    setBillAmount(0);
    setBillItems('');
    setBillMemo('');
  };

  // Confirm Add Bill
  const handleConfirmAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billingSupplier || billAmount <= 0) return;

    let updatedProducts = [...(billingSupplier.productsProvided || [])];
    if (billItems.trim()) {
      const items = billItems
        .split(',')
        .map((x) => x.trim())
        .filter((x) => x && !updatedProducts.includes(x));
      updatedProducts = [...updatedProducts, ...items];
    }

    const updated: Supplier = {
      ...billingSupplier,
      payableAmount: (billingSupplier.payableAmount || 0) + Number(billAmount),
      productsProvided: updatedProducts,
      notes: billMemo
        ? `${billingSupplier.notes ? billingSupplier.notes + ' | ' : ''}Bill: ৳${billAmount} for "${billItems || 'Materials'}" on ${billDate}`
        : billingSupplier.notes,
    };

    onSaveSupplier(updated);
    setBillingSupplier(null);
  };

  // Filtered lists
  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm)
  );

  const filteredSuppliers = suppliers.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.serviceCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone?.includes(searchTerm) ||
      (s.productsProvided &&
        s.productsProvided.some((p) => p.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesCategory =
      categoryFilter === 'all' || s.serviceCategory.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const totalPayableToSuppliers = suppliers.reduce((sum, s) => sum + (s.payableAmount || 0), 0);
  const totalPaidToSuppliers = suppliers.reduce((sum, s) => sum + (s.paidAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>Clients & Suppliers Directory</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Vendor Management
            </span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Manage corporate client accounts, vendor partners, products supplied, and payable balances.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tab Toggles */}
          <div className="bg-[#0B192C] p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setActiveTab('clients')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                activeTab === 'clients'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Clients ({clients.length})
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                activeTab === 'suppliers'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Suppliers ({suppliers.length})
            </button>
          </div>

          {/* Action Button: Add Client or Add Supplier */}
          {activeTab === 'clients' ? (
            <button
              onClick={() => handleOpenClientModal()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Client</span>
            </button>
          ) : (
            <button
              onClick={() => handleOpenSupplierModal()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Supplier</span>
            </button>
          )}
        </div>
      </div>

      {/* Supplier Financial Stats Banner */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#0B192C] p-4 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Active Suppliers</span>
              <span className="text-xl font-black text-white">{suppliers.length} Vendors</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Truck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#0B192C] p-4 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-red-400 block">Total Payable to Vendors</span>
              <span className="text-xl font-black text-red-400">৳ {formatMoney(totalPayableToSuppliers)}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#0B192C] p-4 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Total Paid to Vendors</span>
              <span className="text-xl font-black text-emerald-400">৳ {formatMoney(totalPaidToSuppliers)}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-[#0B192C] rounded-2xl p-3 sm:p-4 shadow-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
          <input
            type="text"
            placeholder={
              activeTab === 'clients'
                ? 'Search clients by name, company, or phone...'
                : 'Search suppliers by name, category, or products supplied...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none w-full"
          />
        </div>

        {activeTab === 'suppliers' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[11px] text-slate-400 font-bold shrink-0">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="p-1.5 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {SUPPLIER_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {activeTab === 'clients' ? (
        /* Clients Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((c) => (
            <div
              key={c.id}
              className="bg-[#0B192C] rounded-2xl p-5 shadow-xl border border-slate-800 space-y-3 text-slate-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-white">{c.name}</h3>
                    <p className="text-xs text-amber-400 font-semibold">{c.companyName}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                    {c.status}
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1.5 pt-3 mt-2 border-t border-slate-800">
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{c.phone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{c.email || 'N/A'}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{c.address}</span>
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-center bg-[#07101C] p-3 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Current Due</span>
                    <span className="font-black text-amber-400">৳ {formatMoney(c.currentDue)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 text-[10px] block">Total Billed</span>
                    <span className="font-black text-white">৳ {formatMoney(c.totalBilled)}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-1.5 mt-3 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => handleOpenClientModal(c)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors cursor-pointer text-xs"
                    title="Edit Client"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  {onDeleteClient && (
                    <button
                      onClick={() => onDeleteClient(c.id)}
                      className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-900 transition-colors cursor-pointer text-xs"
                      title="Delete Client"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Suppliers Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((s) => (
            <div
              key={s.id}
              className="bg-[#0B192C] rounded-2xl p-5 shadow-xl border border-slate-800 space-y-4 text-slate-200 flex flex-col justify-between"
            >
              <div>
                {/* Header & Category */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                      <span>{s.name}</span>
                    </h3>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      {s.serviceCategory}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 block">
                      Contact: {s.contactPerson}
                    </span>
                  </div>
                </div>

                {/* Products & Materials Supplied */}
                <div className="mt-3 pt-2.5 border-t border-slate-800">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-300 mb-1.5">
                    <Package className="w-3.5 h-3.5 text-amber-400" />
                    <span>Products / Materials Supplied:</span>
                  </div>

                  {s.productsProvided && s.productsProvided.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {s.productsProvided.map((prod, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#07101C] text-slate-200 border border-slate-700/80"
                        >
                          {prod}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">No specific products listed.</p>
                  )}
                </div>

                {/* Contact & Location Details */}
                <div className="text-xs text-slate-400 space-y-1 pt-2.5 mt-2 border-t border-slate-800">
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="font-semibold text-slate-200">{s.phone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{s.address}</span>
                  </p>
                  {s.paymentMethod && (
                    <p className="flex items-center gap-2 text-[11px] text-slate-400">
                      <CreditCard className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{s.paymentMethod}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Financial Status Box & Action Buttons */}
              <div className="pt-2">
                <div className="flex justify-between items-center bg-[#07101C] p-3 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Payable Balance (বকেয়া)</span>
                    <span className={`font-black text-sm ${s.payableAmount > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                      ৳ {formatMoney(s.payableAmount)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Paid Amount (পরিশোধিত)</span>
                    <span className="font-black text-sm text-emerald-400">
                      ৳ {formatMoney(s.paidAmount)}
                    </span>
                  </div>
                </div>

                {/* Supplier Actions */}
                <div className="flex items-center justify-between gap-1.5 mt-3 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenPaySupplier(s)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                      title="Record Payment to Supplier"
                    >
                      <DollarSign className="w-3 h-3" />
                      <span>Pay Vendor</span>
                    </button>
                    <button
                      onClick={() => handleOpenAddBill(s)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Add Purchase / Bill from Supplier"
                    >
                      <Receipt className="w-3 h-3" />
                      <span>Add Bill</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenSupplierModal(s)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs"
                      title="Edit Supplier & Products"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {onDeleteSupplier && (
                      <button
                        onClick={() => onDeleteSupplier(s.id)}
                        className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-900 transition-colors cursor-pointer text-xs"
                        title="Delete Supplier"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Client Modal */}
      {showAddClient && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#07101C]/85 backdrop-blur-sm flex justify-center items-center p-3 sm:p-6">
          <div className="w-full max-w-xl bg-[#0B192C] rounded-2xl p-6 shadow-2xl border border-slate-700 space-y-4 text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-base text-white">
                {editingClient ? 'Edit Corporate Client' : 'Add New Corporate Client'}
              </h3>
              <button
                onClick={() => setShowAddClient(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveClientSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Client / Agency Name *</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Whiz Communication"
                  className="w-full p-2.5 bg-[#07101C] border border-slate-700 rounded-xl text-white"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Company Registered Name</label>
                <input
                  type="text"
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  placeholder="e.g. Whiz Communication Ltd."
                  className="w-full p-2.5 bg-[#07101C] border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={clientContactPerson}
                  onChange={(e) => setClientContactPerson(e.target.value)}
                  placeholder="e.g. Tanvir Hossain"
                  className="w-full p-2.5 bg-[#07101C] border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Phone Number *</label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+880 1819..."
                  className="w-full p-2.5 bg-[#07101C] border border-slate-700 rounded-xl text-white"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@company.com"
                  className="w-full p-2.5 bg-[#07101C] border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Address / Location</label>
                <input
                  type="text"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  placeholder="Nasirabad CDA Avenue, Chattogram"
                  className="w-full p-2.5 bg-[#07101C] border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddClient(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl shadow-md cursor-pointer"
                >
                  {editingClient ? 'Update Client' : 'Save Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Supplier Modal */}
      {showAddSupplier && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#07101C]/85 backdrop-blur-sm flex justify-center items-center p-3 sm:p-6">
          <div className="w-full max-w-2xl bg-[#0B192C] rounded-2xl p-6 shadow-2xl border border-slate-700 space-y-4 text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">
                    {editingSupplier ? 'Edit Vendor / Supplier' : 'Add New Vendor / Supplier'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Specify supplier products and materials for accurate activation expenses & payments.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddSupplier(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSupplierSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Supplier / Vendor Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="e.g. Rahim Print & Flex"
                    className="w-full p-2.5 bg-[#07101C] border border-slate-700 rounded-xl text-white font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Service Category / Trade</label>
                  <select
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value)}
                    className="w-full p-2.5 bg-[#07101C] border border-slate-700 rounded-xl text-white"
                  >
                    {SUPPLIER_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {serviceCategory === 'Other Production Vendor' && (
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Specify Custom Category</label>
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="e.g. Sound system, generator, lighting rental"
                    className="w-full p-2 bg-[#07101C] border border-slate-700 rounded-xl text-white"
                  />
                </div>
              )}

              {/* Products & Materials Supplied */}
              <div className="bg-[#07101C] p-4 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    <span>Products & Materials Supplied (কোন ধরনের প্রোডাক্টস নিচ্ছি)</span>
                  </label>
                  <span className="text-[11px] text-slate-400">e.g. PVC Borfi media, Wooden Batten, Standee</span>
                </div>

                {/* Selected Tags Display */}
                {selectedProductTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 bg-[#0B192C] rounded-lg border border-slate-800">
                    {selectedProductTags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-md text-xs font-bold flex items-center gap-1"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveProductTag(tag)}
                          className="hover:text-red-400 ml-0.5 cursor-pointer font-black"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Tag Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={productsInput}
                    onChange={(e) => setProductsInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (productsInput.trim()) {
                          handleAddProductTag(productsInput);
                          setProductsInput('');
                        }
                      }
                    }}
                    placeholder="Type product name and press 'Add' (or comma separated)"
                    className="w-full p-2 bg-[#0B192C] border border-slate-700 rounded-xl text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (productsInput.trim()) {
                        handleAddProductTag(productsInput);
                        setProductsInput('');
                      }
                    }}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl font-bold shrink-0 cursor-pointer"
                  >
                    + Add
                  </button>
                </div>

                {/* Quick Chips suggestions */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Quick Suggestions:</span>
                  <div className="flex flex-wrap gap-1">
                    {COMMON_PRODUCT_SUGGESTIONS.map((sug) => (
                      <button
                        type="button"
                        key={sug}
                        onClick={() => handleAddProductTag(sug)}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                          selectedProductTags.includes(sug)
                            ? 'bg-amber-500/30 text-amber-200 border-amber-500'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Md. Rahim"
                    className="w-full p-2 bg-[#07101C] border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Phone / Mobile *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1819..."
                    className="w-full p-2 bg-[#07101C] border border-slate-700 rounded-xl text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Shop / Workshop Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. CDA Market, Kazir Dewri"
                    className="w-full p-2 bg-[#07101C] border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              {/* Financial Balances */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#07101C] p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="block font-bold text-red-400 mb-1">
                    Current Payable Balance (বকেয়া বিল) ৳
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={payableAmount || ''}
                    onChange={(e) => setPayableAmount(Number(e.target.value))}
                    placeholder="0"
                    className="w-full p-2 bg-[#0B192C] border border-red-500/40 rounded-xl text-red-400 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-emerald-400 mb-1">
                    Previously Paid Amount (পরিশোধিত) ৳
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={paidAmount || ''}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    placeholder="0"
                    className="w-full p-2 bg-[#0B192C] border border-emerald-500/40 rounded-xl text-emerald-400 font-bold"
                  />
                </div>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Payment Method</label>
                  <input
                    type="text"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    placeholder="e.g. bKash Merchant / Bank A/C"
                    className="w-full p-2 bg-[#07101C] border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Bank / bKash Details</label>
                  <input
                    type="text"
                    value={bankDetails}
                    onChange={(e) => setBankDetails(e.target.value)}
                    placeholder="e.g. City Bank A/C: 110..., bKash: 018..."
                    className="w-full p-2 bg-[#07101C] border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddSupplier(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-md cursor-pointer transition-all"
                >
                  {editingSupplier ? 'Update Supplier' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Supplier Modal */}
      {payingSupplier && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#07101C]/85 backdrop-blur-sm flex justify-center items-center p-3 sm:p-6">
          <div className="w-full max-w-lg bg-[#0B192C] rounded-2xl p-6 shadow-2xl border border-slate-700 space-y-4 text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-base text-white">Record Payment to Vendor</h3>
                <p className="text-xs text-amber-400 font-bold">{payingSupplier.name}</p>
              </div>
              <button
                onClick={() => setPayingSupplier(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#07101C] p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Current Payable Balance:</span>
              <span className="font-black text-sm text-red-400">৳ {formatMoney(payingSupplier.payableAmount)}</span>
            </div>

            <form onSubmit={handleConfirmPaySupplier} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Payment Amount (৳) *</label>
                <input
                  type="number"
                  min="1"
                  value={payAmount || ''}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  placeholder="Amount"
                  className="w-full p-2.5 bg-[#07101C] border border-emerald-500/50 rounded-xl text-emerald-400 font-black text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Payment Method</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                    className="w-full p-2 bg-[#07101C] border border-slate-700 rounded-xl text-white"
                  >
                    <option value="bKash">bKash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="w-full p-2 bg-[#07101C] border border-slate-700 rounded-xl text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">TrxID / Cheque / Reference No</label>
                <input
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="e.g. bKash TrxID or Cheque No"
                  className="w-full p-2 bg-[#07101C] border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Notes</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. Cleared bill for Borfi media"
                  className="w-full p-2 bg-[#07101C] border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPayingSupplier(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Bill / Purchase Modal */}
      {billingSupplier && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#07101C]/85 backdrop-blur-sm flex justify-center items-center p-3 sm:p-6">
          <div className="w-full max-w-lg bg-[#0B192C] rounded-2xl p-6 shadow-2xl border border-slate-700 space-y-4 text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-base text-white">Record Material Purchase / Bill</h3>
                <p className="text-xs text-amber-400 font-bold">{billingSupplier.name}</p>
              </div>
              <button
                onClick={() => setBillingSupplier(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmAddBill} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Bill / Invoice Amount (৳) *</label>
                <input
                  type="number"
                  min="1"
                  value={billAmount || ''}
                  onChange={(e) => setBillAmount(Number(e.target.value))}
                  placeholder="Amount"
                  className="w-full p-2.5 bg-[#07101C] border border-amber-500/50 rounded-xl text-amber-400 font-black text-sm"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Products / Items Taken</label>
                <input
                  type="text"
                  value={billItems}
                  onChange={(e) => setBillItems(e.target.value)}
                  placeholder="e.g. 100 pcs Wooden battens, 5 PVC rolls"
                  className="w-full p-2 bg-[#07101C] border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Bill Date</label>
                  <input
                    type="date"
                    value={billDate}
                    onChange={(e) => setBillDate(e.target.value)}
                    className="w-full p-2 bg-[#07101C] border border-slate-700 rounded-xl text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Memo / Challan No</label>
                  <input
                    type="text"
                    value={billMemo}
                    onChange={(e) => setBillMemo(e.target.value)}
                    placeholder="e.g. Memo # 4821"
                    className="w-full p-2 bg-[#07101C] border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setBillingSupplier(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Add to Payable Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
