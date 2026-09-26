import React, { useState, useEffect } from 'react';
import {
  loadStorageData,
  saveQuotations,
  saveInvoices,
  saveClients,
  saveSuppliers,
  saveProjects,
  saveExpenses,
  saveLiabilities,
  saveNotifications,
  saveAiProspects,
} from './services/storage';
import { Quotation, Invoice, Client, Supplier, AppNotification, AIClientProspect } from './types';
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
  const [previewDoc, setPreviewDoc] = useState<{ document: Quotation | Invoice; type: 'Quotation' | 'Invoice' } | null>(null);

  useEffect(() => {
    saveQuotations(data.quotations);
    saveInvoices(data.invoices);
    saveClients(data.clients);
    saveSuppliers(data.suppliers);
    saveProjects(data.projects);
    saveExpenses(data.expenses);
    saveLiabilities(data.liabilities);
    saveNotifications(data.notifications);
    saveAiProspects(data.aiProspects);
  }, [data]);

  const handleSaveQuotation = (q: Quotation) => {
    const exists = data.quotations.some((item: Quotation) => item.id === q.id);
    const updated = exists
      ? data.quotations.map((item: Quotation) => (item.id === q.id ? q : item))
      : [q, ...data.quotations];

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Quotation Updated/Created',
      message: `Quotation ${q.quotationNumber} for ${q.clientName} saved.`,
      timestamp: new Date().toLocaleString(),
      read: false,
      type: 'quotation',
    };

    setData({
      ...data,
      quotations: updated,
      notifications: [newNotif, ...data.notifications],
    });
  };

  const handleDeleteQuotation = (id: string) => {
    setData({
      ...data,
      quotations: data.quotations.filter((q: Quotation) => q.id !== id),
    });
  };

  const handleSaveInvoice = (inv: Invoice) => {
    const exists = data.invoices.some((item: Invoice) => item.id === inv.id);
    const updated = exists
      ? data.invoices.map((item: Invoice) => (item.id === inv.id ? inv : item))
      : [inv, ...data.invoices];

    setData({
      ...data,
      invoices: updated,
    });
  };

  const handleDeleteInvoice = (id: string) => {
    setData({
      ...data,
      invoices: data.invoices.filter((inv: Invoice) => inv.id !== id),
    });
  };

  const handleConvertToInvoice = (q: Quotation) => {
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
      payments:
        q.payments && q.payments.length > 0
          ? q.payments
          : q.advance > 0
          ? [
              {
                id: `pay-${Date.now()}`,
                amount: q.advance,
                date: q.workOrderDate || new Date().toISOString().split('T')[0],
                method: 'Bank Transfer',
                reference: q.workOrderNumber || 'Quotation Advance',
                receivedBy: GRAND_COMPANY_INFO.defaultSignatory.name,
                notes: 'Advance received on quotation confirmation',
              },
            ]
          : [],
      termsAndConditions: q.termsAndConditions,
      nbText: q.nbText,
      signatoryName: q.signatoryName,
      signatoryTitle: q.signatoryTitle,
      signatoryPhone: q.signatoryPhone,
      status: q.due === 0 && q.total > 0 ? 'Paid' : q.advance > 0 ? 'Partial' : 'Unpaid',
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updatedQuotations = data.quotations.map((item: Quotation) =>
      item.id === q.id ? { ...item, status: 'Converted' as const } : item
    );

    setData({
      ...data,
      quotations: updatedQuotations,
      invoices: [newInvoice, ...data.invoices],
    });

    setActiveTab('invoices');
  };

  const handleSaveClient = (c: Client) => {
    const exists = data.clients.some((item: Client) => item.id === c.id);
    const updated = exists
      ? data.clients.map((item: Client) => (item.id === c.id ? c : item))
      : [c, ...data.clients];
    setData({
      ...data,
      clients: updated,
    });
  };

  const handleDeleteClient = (id: string) => {
    setData({
      ...data,
      clients: data.clients.filter((c: Client) => c.id !== id),
    });
  };

  const handleSaveSupplier = (s: Supplier) => {
    const exists = data.suppliers.some((item: Supplier) => item.id === s.id);
    const updated = exists
      ? data.suppliers.map((item: Supplier) => (item.id === s.id ? s : item))
      : [s, ...data.suppliers];
    setData({
      ...data,
      suppliers: updated,
    });
  };

  const handleDeleteSupplier = (id: string) => {
    setData({
      ...data,
      suppliers: data.suppliers.filter((s: Supplier) => s.id !== id),
    });
  };

  const handleSaveProspect = (p: AIClientProspect) => {
    const exists = data.aiProspects.some((item: AIClientProspect) => item.id === p.id);
    const updated = exists
      ? data.aiProspects.map((item: AIClientProspect) => (item.id === p.id ? p : item))
      : [p, ...data.aiProspects];

    setData({
      ...data,
      aiProspects: updated,
    });
  };

  const handleDeleteProspect = (id: string) => {
    setData({
      ...data,
      aiProspects: data.aiProspects.filter((p: AIClientProspect) => p.id !== id),
    });
  };

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
      items: [
        {
          id: `qi-${Date.now()}`,
          job: lead.recommendedService.slice(0, 30),
          description: `${lead.recommendedService} for ${lead.companyName}`,
          quantity: 1,
          unitPrice: lead.estimatedBudget,
          total: lead.estimatedBudget,
        },
      ],
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

    const updatedProspects = data.aiProspects.map((item: AIClientProspect) =>
      item.id === lead.id ? { ...item, status: 'Proposal Sent' as const } : item
    );

    setData({
      ...data,
      aiProspects: updatedProspects,
      quotations: [newQuotation, ...data.quotations],
    });
    setActiveTab('quotations');
  };

  const handleMarkNotificationsRead = () => {
    setData({
      ...data,
      notifications: data.notifications.map((n: AppNotification) => ({ ...n, read: true })),
    });
  };

  if (!isAuthenticated) {
    return <AuthView onLogin={() => setIsAuthenticated(true)} />;
  }

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
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={() => setIsAuthenticated(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          notifications={data.notifications}
          onMarkNotificationsRead={handleMarkNotificationsRead}
          activeTabTitle={getTabTitle()}
        />

        <main className="p-4 sm:p-8 flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              quotations={data.quotations}
              invoices={data.invoices}
              expenses={data.expenses}
              clients={data.clients}
              projects={data.projects}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'quotations' && (
            <QuotationModule
              quotations={data.quotations}
              clients={data.clients}
              onSaveQuotation={handleSaveQuotation}
              onDeleteQuotation={handleDeleteQuotation}
              onPreviewQuotation={(q) => setPreviewDoc({ document: q, type: 'Quotation' })}
              onConvertToInvoice={handleConvertToInvoice}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoiceModule
              invoices={data.invoices}
              clients={data.clients}
              onSaveInvoice={handleSaveInvoice}
              onDeleteInvoice={handleDeleteInvoice}
              onPreviewInvoice={(inv) => setPreviewDoc({ document: inv, type: 'Invoice' })}
            />
          )}

          {activeTab === 'clients' && (
            <ClientsSuppliers
              clients={data.clients}
              suppliers={data.suppliers}
              onSaveClient={handleSaveClient}
              onDeleteClient={handleDeleteClient}
              onSaveSupplier={handleSaveSupplier}
              onDeleteSupplier={handleDeleteSupplier}
            />
          )}

          {activeTab === 'projects' && <ProjectsScheduling projects={data.projects} />}

          {activeTab === 'expenses' && (
            <ExpensesLiabilities expenses={data.expenses} liabilities={data.liabilities} />
          )}

          {activeTab === 'agentic' && (
            <AgenticGrowth
              prospects={data.aiProspects}
              onSaveProspect={handleSaveProspect}
              onDeleteProspect={handleDeleteProspect}
              onConvertToQuotation={handleConvertLeadToQuotation}
            />
          )}

          {activeTab === 'generator' && <AIDesignGenerator />}
        </main>
      </div>

      {previewDoc && (
        <QuotationPrintView
          document={previewDoc.document}
          type={previewDoc.type}
          onClose={() => setPreviewDoc(null)}
          onConvertToInvoice={handleConvertToInvoice}
        />
      )}
    </div>
  );
}

export default App;
