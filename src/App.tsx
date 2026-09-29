import React, { useState, useEffect } from 'react';
import {
  loadStorageData,
  hydrateStorageData,
  saveQuotations,
  saveInvoices,
  saveClients,
  saveClient,
  saveSuppliers,
  saveProjects,
  saveExpenses,
  saveLiabilities,
  saveNotifications,
  saveAiProspects,
  deleteRemote,
  verifyClientCloudRecord,
  verifySupplierCloudRecord,
} from './services/storage';
import { Quotation, Invoice, Client, Supplier, AppNotification, AIClientProspect, ProjectSchedule, PaymentRecord } from './types';
import { DEFAULT_TERMS, GRAND_COMPANY_INFO } from './mock/initialData';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { QuotationModule } from './components/QuotationModule';
import { InvoiceModule } from './components/InvoiceModule';
import { ClientsSuppliers } from './components/ClientsSuppliers';
import { ProjectsScheduling } from './components/ProjectsScheduling';
import { ExpensesLiabilities } from './components/ExpensesLiabilities';
import { AgenticGrowth } from './components/AgenticGrowth';
import { AIDesignGenerator } from './components/AIDesignGenerator';
import { AuthView } from './components/AuthView';
import { QuotationPrintView } from './components/QuotationPrintView';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [data, setData] = useState(loadStorageData());
  const [isHydrated, setIsHydrated] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{ document: Quotation | Invoice; type: 'Quotation' | 'Invoice' } | null>(null);
  const [cloudStatus, setCloudStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    let active = true;
    hydrateStorageData().then((remoteData) => {
      if (active) {
        setData(remoteData);
        setIsHydrated(true);
      }
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    const sync = async () => {
      const results = await Promise.allSettled([
        saveQuotations(data.quotations, data.clients),
        saveInvoices(data.invoices, data.clients),
        // Clients and suppliers are persisted by their explicit save handlers.
        // Keeping them out of this full-state effect prevents a stale render
        // from overwriting a just-saved edit in Supabase.
        Promise.resolve(),
        Promise.resolve(),
        saveProjects(data.projects, data.clients),
        saveExpenses(data.expenses),
        saveLiabilities(data.liabilities),
      ]);
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error('GRAND CMS Supabase sync failed', { tableIndex: index, error: result.reason });
        }
      });
      saveNotifications(data.notifications);
      saveAiProspects(data.aiProspects);
    };
    void sync();
  }, [data, isHydrated]);

  const handleSaveQuotation = (q: Quotation) => {
    const exists = data.quotations.some((item: Quotation) => item.id === q.id);
    const updated = exists ? data.quotations.map((item: Quotation) => (item.id === q.id ? q : item)) : [q, ...data.quotations];
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Quotation Updated/Created',
      message: `Quotation ${q.quotationNumber} for ${q.clientName} saved.`,
      timestamp: new Date().toLocaleString(),
      read: false,
      type: 'quotation',
    };
    setData({ ...data, quotations: updated, notifications: [newNotif, ...data.notifications] });
  };

  const handleApproveAndAdvance = (q: Quotation, payment: PaymentRecord) => {
    const existingProject = data.projects.find((p: ProjectSchedule) => p.quotationId === q.id);
    const project: ProjectSchedule = existingProject
      ? {
          ...existingProject,
          quotationId: q.id,
          quotationNumber: q.quotationNumber,
          projectName: q.subject || q.items[0]?.job || `Project ${q.quotationNumber}`,
          clientName: q.clientName,
          clientCompany: q.clientCompany,
          workItems: q.items,
        }
      : {
          id: `proj-${q.id}`,
          quotationId: q.id,
          quotationNumber: q.quotationNumber,
          projectName: q.subject || q.items[0]?.job || `Project ${q.quotationNumber}`,
          clientName: q.clientName,
          clientCompany: q.clientCompany,
          venue: '',
          eventDate: '',
          setupDate: '',
          status: 'Upcoming',
          assignedTeam: [],
          checklist: q.items.map((item) => ({
            task: `${item.job}${item.description ? ` — ${item.description}` : ''}`,
            completed: false,
          })),
          workItems: q.items,
          instructions: '',
          createdAt: new Date().toISOString().split('T')[0],
        };

    const updatedQuotations = data.quotations.map((item: Quotation) => item.id === q.id ? { ...item, status: 'Approved' as const } : item);
    const updatedProjects = existingProject
      ? data.projects.map((p: ProjectSchedule) => p.id === existingProject.id ? project : p)
      : [project, ...data.projects];
    const newNotif: AppNotification = {
      id: `notif-project-${Date.now()}`,
      title: 'Project Scheduling Created',
      message: `${q.quotationNumber} approved after advance of ৳${payment.amount.toLocaleString()} and added to Project Scheduling.`,
      timestamp: new Date().toLocaleString(),
      read: false,
      type: 'project',
    };

    setData({
      ...data,
      quotations: updatedQuotations,
      projects: updatedProjects,
      notifications: [newNotif, ...data.notifications],
    });
    setActiveTab('projects');
  };

  const handleDeleteQuotation = (id: string) => {
    setData({ ...data, quotations: data.quotations.filter((q: Quotation) => q.id !== id) });
    void deleteRemote('quotations', id);
  };

  const handleSaveInvoice = (inv: Invoice) => {
    const exists = data.invoices.some((item: Invoice) => item.id === inv.id);
    const updated = exists ? data.invoices.map((item: Invoice) => (item.id === inv.id ? inv : item)) : [inv, ...data.invoices];
    setData({ ...data, invoices: updated });
  };

  const handleDeleteInvoice = (id: string) => {
    setData({ ...data, invoices: data.invoices.filter((inv: Invoice) => inv.id !== id) });
    void deleteRemote('invoices', id);
  };

  const handleConvertToInvoice = (q: Quotation) => {
    const duplicate = data.invoices.find((inv: Invoice) => inv.quotationId === q.id);
    if (duplicate) {
      setActiveTab('invoices');
      return;
    }
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: q.quotationNumber.replace('/QT/', '/INV/'),
      quotationId: q.id,
      date: new Date().toISOString().split('T')[0],
      clientName: q.clientName,
      clientCompany: q.clientCompany,
      clientAddress: q.clientAddress,
      subject: q.subject,
      items: q.items,
      subtotal: q.subtotal,
      agencyCommissionPercent: q.agencyCommissionPercent,
      agencyCommissionAmount: q.agencyCommissionAmount,
      vatPercent: q.vatPercent,
      vatAmount: q.vatAmount,
      total: q.total,
      advance: q.advance || 0,
      due: q.due !== undefined ? q.due : Math.max(0, q.total - (q.advance || 0)),
      payments: q.payments || [],
      termsAndConditions: q.termsAndConditions,
      nbText: q.nbText,
      signatoryName: q.signatoryName,
      signatoryTitle: q.signatoryTitle,
      signatoryPhone: q.signatoryPhone,
      status: q.due === 0 && q.total > 0 ? 'Paid' : q.advance > 0 ? 'Partial' : 'Unpaid',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setData({
      ...data,
      quotations: data.quotations.map((item: Quotation) => item.id === q.id ? { ...item, status: 'Converted' as const } : item),
      invoices: [newInvoice, ...data.invoices],
    });
    setActiveTab('invoices');
  };

  const handleSaveClient = async (c: Client) => {
    const exists = data.clients.some((item: Client) => item.id === c.id);
    const nextClients = exists
      ? data.clients.map((item: Client) => item.id === c.id ? c : item)
      : [c, ...data.clients];
    setData({ ...data, clients: nextClients });
    setCloudStatus({ type: 'success', message: 'Saving client to Supabase…' });
    try {
      await saveClient(c);
      await verifyClientCloudRecord(c.id);
      setCloudStatus({ type: 'success', message: `Cloud Saved ✓ — ${c.companyName || c.name}` });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Supabase save error.';
      console.error('GRAND CMS client cloud save failed:', error);
      setCloudStatus({ type: 'error', message: `Cloud Save Failed — ${message}` });
    }
    window.setTimeout(() => setCloudStatus(null), 7000);
  };
  const handleDeleteClient = (id: string) => {
    setData({ ...data, clients: data.clients.filter((c: Client) => c.id !== id) });
    void deleteRemote('clients', id);
  };
  const handleSaveSupplier = async (s: Supplier) => {
    const exists = data.suppliers.some((item: Supplier) => item.id === s.id);
    const nextSuppliers = exists
      ? data.suppliers.map((item: Supplier) => item.id === s.id ? s : item)
      : [s, ...data.suppliers];
    setData({ ...data, suppliers: nextSuppliers });
    setCloudStatus({ type: 'success', message: 'Saving supplier to Supabase…' });
    try {
      await saveSuppliers(nextSuppliers);
      await verifySupplierCloudRecord(s.id);
      setCloudStatus({ type: 'success', message: `Cloud Saved ✓ — ${s.name}` });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Supabase save error.';
      console.error('GRAND CMS supplier cloud save failed:', error);
      setCloudStatus({ type: 'error', message: `Cloud Save Failed — ${message}` });
    }
    window.setTimeout(() => setCloudStatus(null), 7000);
  };
  const handleDeleteSupplier = (id: string) => {
    setData({ ...data, suppliers: data.suppliers.filter((s: Supplier) => s.id !== id) });
    void deleteRemote('suppliers', id);
  };
  const handleSaveProject = (project: ProjectSchedule) => {
    const exists = data.projects.some((item: ProjectSchedule) => item.id === project.id);
    setData({ ...data, projects: exists ? data.projects.map((item: ProjectSchedule) => item.id === project.id ? project : item) : [project, ...data.projects] });
  };

  const handleSaveProspect = (p: AIClientProspect) => {
    const exists = data.aiProspects.some((item: AIClientProspect) => item.id === p.id);
    setData({ ...data, aiProspects: exists ? data.aiProspects.map((item: AIClientProspect) => item.id === p.id ? p : item) : [p, ...data.aiProspects] });
  };
  const handleDeleteProspect = (id: string) => setData({ ...data, aiProspects: data.aiProspects.filter((p: AIClientProspect) => p.id !== id) });

  const handleConvertLeadToQuotation = (lead: AIClientProspect) => {
    const nextNum = String(data.quotations.length + 1).padStart(3, '0');
    const newQuotation: Quotation = {
      id: `quot-${Date.now()}`,
      quotationNumber: `GCMS/QT/2026/${nextNum}`,
      date: new Date().toISOString().split('T')[0],
      validityDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      clientName: lead.contactPerson,
      clientCompany: lead.companyName,
      clientAddress: lead.location || 'Chattogram, Bangladesh',
      clientPhone: lead.mobileNumber,
      clientEmail: lead.email || '',
      subject: `Proposal for ${lead.recommendedService}`,
      items: [{ id: `qi-${Date.now()}`, job: lead.recommendedService.slice(0, 30), description: `${lead.recommendedService} for ${lead.companyName}`, quantity: 1, unitPrice: lead.estimatedBudget, total: lead.estimatedBudget }],
      subtotal: lead.estimatedBudget,
      agencyCommissionPercent: 10,
      agencyCommissionAmount: Math.round(lead.estimatedBudget * 0.1),
      vatPercent: 0,
      vatAmount: 0,
      total: Math.round(lead.estimatedBudget * 1.1),
      advance: 0,
      due: Math.round(lead.estimatedBudget * 1.1),
      termsAndConditions: DEFAULT_TERMS,
      nbText: 'Chittagong',
      signatoryName: 'Zahir Uddin Fuhad',
      signatoryTitle: 'CEO & Founder',
      signatoryPhone: '01819312820',
      status: 'Draft',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setData({ ...data, aiProspects: data.aiProspects.map((item: AIClientProspect) => item.id === lead.id ? { ...item, status: 'Proposal Sent' as const } : item), quotations: [newQuotation, ...data.quotations] });
    setActiveTab('quotations');
  };
  const handleMarkNotificationsRead = () => setData({ ...data, notifications: data.notifications.map((n: AppNotification) => ({ ...n, read: true })) });

  if (!isAuthenticated) return <AuthView onLogin={() => setIsAuthenticated(true)} />;

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'quotations': return 'Quotations';
      case 'invoices': return 'Invoices & Receipts';
      case 'clients': return 'Clients & Suppliers';
      case 'projects': return 'Project Scheduling';
      case 'expenses': return 'Expenses & Liabilities';
      case 'agentic': return 'AI Prospecting';
      case 'generator': return 'AI Design Generator';
      default: return 'Grand ERP';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#07101C] text-slate-100 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => setIsAuthenticated(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar notifications={data.notifications} onMarkNotificationsRead={handleMarkNotificationsRead} activeTabTitle={getTabTitle()} />
        {cloudStatus && (
          <div className={`fixed right-4 top-20 z-[100] max-w-md rounded-xl border px-4 py-3 text-sm shadow-2xl ${cloudStatus.type === 'success' ? 'border-emerald-500/30 bg-emerald-950/95 text-emerald-200' : 'border-red-500/30 bg-red-950/95 text-red-200'}`}>
            {cloudStatus.message}
          </div>
        )}
        <main className="p-4 sm:p-8 flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && <Dashboard quotations={data.quotations} invoices={data.invoices} expenses={data.expenses} clients={data.clients} projects={data.projects} setActiveTab={setActiveTab} />}
          {activeTab === 'quotations' && <QuotationModule quotations={data.quotations} clients={data.clients} onSaveQuotation={handleSaveQuotation} onDeleteQuotation={handleDeleteQuotation} onPreviewQuotation={(q) => setPreviewDoc({ document: q, type: 'Quotation' })} onConvertToInvoice={handleConvertToInvoice} onApproveAndAdvance={handleApproveAndAdvance} />}
          {activeTab === 'invoices' && <InvoiceModule invoices={data.invoices} clients={data.clients} onSaveInvoice={handleSaveInvoice} onDeleteInvoice={handleDeleteInvoice} onPreviewInvoice={(inv) => setPreviewDoc({ document: inv, type: 'Invoice' })} />}
          {activeTab === 'clients' && <ClientsSuppliers clients={data.clients} suppliers={data.suppliers} onSaveClient={handleSaveClient} onDeleteClient={handleDeleteClient} onSaveSupplier={handleSaveSupplier} onDeleteSupplier={handleDeleteSupplier} />}
          {activeTab === 'projects' && <ProjectsScheduling projects={data.projects} quotations={data.quotations} onSaveProject={handleSaveProject} />}
          {activeTab === 'expenses' && <ExpensesLiabilities expenses={data.expenses} liabilities={data.liabilities} />}
          {activeTab === 'agentic' && <AgenticGrowth prospects={data.aiProspects} onSaveProspect={handleSaveProspect} onDeleteProspect={handleDeleteProspect} onConvertToQuotation={handleConvertLeadToQuotation} />}
          {activeTab === 'generator' && <AIDesignGenerator />}
        </main>
      </div>
      {previewDoc && <QuotationPrintView document={previewDoc.document} type={previewDoc.type} onClose={() => setPreviewDoc(null)} onConvertToInvoice={handleConvertToInvoice} />}
    </div>
  );
}

export default App;
