import React, { useState, useEffect } from 'react';
import {
  loadStorageData,
  hydrateStorageData,
  saveQuotations,
  saveInvoices,
  saveClients,
  saveSuppliers,
  saveProjects,
  saveExpenses,
  saveLiabilities,
  saveNotifications,
  saveAiProspects,
  deleteRemote,
  saveSingleQuotationRemote,
  saveSingleInvoiceRemote,
  saveSingleClientRemote,
  saveSingleSupplierRemote,
  saveSingleProjectRemote,
} from './services/storage';
import { Quotation, Invoice, Client, Supplier, AppNotification, AIClientProspect, ProjectSchedule } from './types';
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
import { DeploymentHub } from './components/DeploymentHub';
import { AuthView } from './components/AuthView';
import { QuotationPrintView } from './components/QuotationPrintView';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [data, setData] = useState(loadStorageData());
  const [previewDoc, setPreviewDoc] = useState<{ document: Quotation | Invoice; type: 'Quotation' | 'Invoice' } | null>(null);

  // Hydrate from Supabase on mount or when credentials change
  useEffect(() => {
    let isMounted = true;
    hydrateStorageData().then((serverData) => {
      if (isMounted && serverData) {
        setData(serverData);
      }
    });

    const handleConfigChange = () => {
      hydrateStorageData().then((serverData) => {
        if (isMounted && serverData) {
          setData(serverData);
        }
      });
    };

    window.addEventListener('grand-supabase-config-changed', handleConfigChange);
    return () => {
      isMounted = false;
      window.removeEventListener('grand-supabase-config-changed', handleConfigChange);
    };
  }, []);

  useEffect(() => {
    saveQuotations(data.quotations, data.clients);
    saveInvoices(data.invoices, data.clients);
    saveClients(data.clients);
    saveSuppliers(data.suppliers);
    saveProjects(data.projects, data.clients);
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
      title: 'Quotation Saved & Synced',
      message: `Quotation ${q.quotationNumber} for ${q.clientName} saved to database.`,
      timestamp: new Date().toLocaleString(),
      read: false,
      type: 'quotation',
    };

    setData({
      ...data,
      quotations: updated,
      notifications: [newNotif, ...data.notifications],
    });

    // Immediate direct sync to Supabase
    saveSingleQuotationRemote(q, data.clients).catch((err) =>
      console.warn('Direct quotation sync error:', err)
    );
  };

  const handleDeleteQuotation = (id: string) => {
    deleteRemote('quotations', id);
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

    saveSingleInvoiceRemote(inv, data.clients).catch((err) =>
      console.warn('Direct invoice sync error:', err)
    );
  };

  const handleDeleteInvoice = (id: string) => {
    deleteRemote('invoices', id);
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
    setPreviewDoc({ document: newInvoice, type: 'Invoice' });
  };

  const handleApproveQuotationAndSchedule = (q: Quotation) => {
    // 1. Mark quotation as Approved
    const updatedQuotations = data.quotations.map((item: Quotation) =>
      item.id === q.id ? { ...item, status: 'Approved' as const } : item
    );

    // 2. Check if a project schedule already exists for this quotation
    const existingProject = data.projects.find((p: ProjectSchedule) => p.quotationId === q.id);

    let updatedProjects: ProjectSchedule[];

    if (existingProject) {
      updatedProjects = data.projects.map((p: ProjectSchedule) =>
        p.id === existingProject.id
          ? {
              ...p,
              projectName: q.subject || p.projectName,
              clientName: q.clientName,
              venue: q.clientAddress || p.venue,
              totalAmount: q.total,
              advance: q.advance || p.advance,
              due: q.due !== undefined ? q.due : p.due,
            }
          : p
      );
    } else {
      const checklistItems =
        q.items && q.items.length > 0
          ? q.items.map((item) => ({
              task: `${item.job || 'Production'}: ${item.description.split('\n')[0].slice(0, 45)} (Qty: ${item.quantity})`,
              completed: false,
            }))
          : [
              { task: 'Venue measurement & space inspection', completed: false },
              { task: 'Structure fabrication & flex banner print sign-off', completed: false },
              { task: 'Logistics delivery & venue setup execution', completed: false },
              { task: 'Client handover walkthrough & final sign-off', completed: false },
            ];

      const newProject: ProjectSchedule = {
        id: `proj-${Date.now()}`,
        projectName: q.subject || `Brand Activation for ${q.clientName}`,
        clientName: q.clientName,
        clientCompany: q.clientCompany,
        clientAddress: q.clientAddress,
        clientPhone: q.clientPhone,
        venue: q.clientAddress || 'Client Designated Venue, Chattogram',
        eventDate: q.validityDate || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        setupDate: q.date || new Date().toISOString().split('T')[0],
        status: 'Upcoming',
        assignedTeam: ['Zahir Uddin Fuhad (Lead)', 'Production Team', 'Logistics'],
        checklist: checklistItems,
        quotationId: q.id,
        quotationNumber: q.quotationNumber,
        subject: q.subject,
        items: q.items,
        subtotal: q.subtotal,
        agencyCommissionPercent: q.agencyCommissionPercent,
        agencyCommissionAmount: q.agencyCommissionAmount,
        vatPercent: q.vatPercent,
        vatAmount: q.vatAmount,
        totalAmount: q.total,
        advance: q.advance || 0,
        due: q.due !== undefined ? q.due : Math.max(0, q.total - (q.advance || 0)),
        createdAt: new Date().toISOString().split('T')[0],
      };

      updatedProjects = [newProject, ...data.projects];
    }

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Quotation Approved & Scheduled',
      message: `Quotation ${q.quotationNumber} approved. Project Schedule created successfully.`,
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

    // Directly navigate to Project Scheduling
    setActiveTab('projects');
  };

  const handleSaveProject = (p: ProjectSchedule) => {
    const exists = data.projects.some((item: ProjectSchedule) => item.id === p.id);
    const updated = exists
      ? data.projects.map((item: ProjectSchedule) => (item.id === p.id ? p : item))
      : [p, ...data.projects];

    setData({
      ...data,
      projects: updated,
    });

    saveSingleProjectRemote(p, data.clients).catch((err) =>
      console.warn('Direct project sync error:', err)
    );
  };

  const handleDeleteProject = (id: string) => {
    deleteRemote('projects', id);
    setData({
      ...data,
      projects: data.projects.filter((p: ProjectSchedule) => p.id !== id),
    });
  };

  const handleCompleteProjectAndCreateInvoice = (project: ProjectSchedule) => {
    // 1. Mark project as completed and all checklist tasks done
    const updatedProject: ProjectSchedule = {
      ...project,
      status: 'Completed',
      checklist: project.checklist.map((c) => ({ ...c, completed: true })),
    };

    // 2. Check if invoice already exists for this project/quotation
    const existingInvoice = data.invoices.find(
      (inv: Invoice) =>
        (project.invoiceId && inv.id === project.invoiceId) ||
        (project.quotationId && inv.quotationId === project.quotationId)
    );

    let updatedInvoices = [...data.invoices];
    let targetInvoice: Invoice;

    if (!existingInvoice) {
      const nextInvNum = project.quotationNumber
        ? project.quotationNumber.replace('/QT/', '/INV/')
        : `GCMS/INV/2026/${String(data.invoices.length + 1).padStart(3, '0')}`;

      const total = project.totalAmount || 50000;
      const advance = project.advance || 0;
      const due = project.due !== undefined ? project.due : Math.max(0, total - advance);

      const newInvoice: Invoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber: nextInvNum,
        quotationId: project.quotationId,
        date: new Date().toISOString().split('T')[0],
        clientName: project.clientName,
        clientCompany: project.clientCompany,
        clientAddress: project.clientAddress || project.venue,
        subject: project.projectName || project.subject || 'Event Execution & Brand Activation',
        items:
          project.items && project.items.length > 0
            ? project.items
            : [
                {
                  id: `qi-${Date.now()}`,
                  job: project.projectName.slice(0, 30),
                  description: `Project Execution & handover at ${project.venue}`,
                  quantity: 1,
                  unitPrice: total,
                  total: total,
                },
              ],
        subtotal: project.subtotal || total,
        agencyCommissionPercent:
          typeof project.agencyCommissionPercent === 'number' ? project.agencyCommissionPercent : 10,
        agencyCommissionAmount:
          typeof project.agencyCommissionAmount === 'number'
            ? project.agencyCommissionAmount
            : Math.round(total * 0.1),
        vatPercent: project.vatPercent || 0,
        vatAmount: project.vatAmount || 0,
        total: total,
        advance: advance,
        due: due,
        payments:
          advance > 0
            ? [
                {
                  id: `pay-${Date.now()}`,
                  amount: advance,
                  date: new Date().toISOString().split('T')[0],
                  method: 'Bank Transfer',
                  reference: project.quotationNumber
                    ? `Advance for ${project.quotationNumber}`
                    : 'Work Order Advance',
                  receivedBy: GRAND_COMPANY_INFO.defaultSignatory.name,
                  notes: 'Advance credited upon project execution',
                },
              ]
            : [],
        termsAndConditions: DEFAULT_TERMS,
        nbText: 'Project completed, executed, and handed over.',
        signatoryName: GRAND_COMPANY_INFO.defaultSignatory.name,
        signatoryTitle: GRAND_COMPANY_INFO.defaultSignatory.title,
        signatoryPhone: GRAND_COMPANY_INFO.defaultSignatory.phone,
        status: due === 0 && total > 0 ? 'Paid' : advance > 0 ? 'Partial' : 'Unpaid',
        createdAt: new Date().toISOString().split('T')[0],
      };

      targetInvoice = newInvoice;
      updatedInvoices = [newInvoice, ...data.invoices];
      updatedProject.invoiceId = newInvoice.id;
    } else {
      targetInvoice = existingInvoice;
      // Bring existing linked invoice to top of invoice list
      updatedInvoices = [
        existingInvoice,
        ...data.invoices.filter((i: Invoice) => i.id !== existingInvoice.id),
      ];
      updatedProject.invoiceId = existingInvoice.id;
    }

    // 3. Update projects array
    const updatedProjects = data.projects.map((p: ProjectSchedule) =>
      p.id === project.id ? updatedProject : p
    );

    // 4. Update linked quotation to Converted if exists
    const updatedQuotations = data.quotations.map((q: Quotation) =>
      project.quotationId && q.id === project.quotationId ? { ...q, status: 'Converted' as const } : q
    );

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Project Done & Invoiced',
      message: `Project "${project.projectName}" marked Done! Generated Invoice ${targetInvoice.invoiceNumber}.`,
      timestamp: new Date().toLocaleString(),
      read: false,
      type: 'invoice',
    };

    setData({
      ...data,
      projects: updatedProjects,
      invoices: updatedInvoices,
      quotations: updatedQuotations,
      notifications: [newNotif, ...data.notifications],
    });

    // 1. Directly navigate to Invoices & Receipts
    setActiveTab('invoices');

    // 2. Open invoice preview immediately so user instantly sees the full generated tax invoice
    setPreviewDoc({ document: targetInvoice, type: 'Invoice' });

    // 3. Immediately persist both project completion and new invoice to Supabase
    saveSingleProjectRemote(updatedProject, data.clients).catch((err) =>
      console.warn('Direct project completion sync error:', err)
    );
    saveSingleInvoiceRemote(targetInvoice, data.clients).catch((err) =>
      console.warn('Direct generated invoice sync error:', err)
    );
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
    saveSingleClientRemote(c).catch((err) =>
      console.warn('Direct client sync error:', err)
    );
  };

  const handleDeleteClient = (id: string) => {
    deleteRemote('clients', id);
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
    saveSingleSupplierRemote(s).catch((err) =>
      console.warn('Direct supplier sync error:', err)
    );
  };

  const handleDeleteSupplier = (id: string) => {
    deleteRemote('suppliers', id);
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
      case 'database': return 'Database & GitHub Cloud Hub';
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
          onNavigateToDatabase={() => setActiveTab('database')}
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
              onApproveAndSchedule={handleApproveQuotationAndSchedule}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoiceModule
              invoices={data.invoices}
              clients={data.clients}
              quotations={data.quotations}
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

          {activeTab === 'projects' && (
            <ProjectsScheduling
              projects={data.projects}
              onSaveProject={handleSaveProject}
              onDeleteProject={handleDeleteProject}
              onDoneProject={handleCompleteProjectAndCreateInvoice}
              onViewInvoice={() => setActiveTab('invoices')}
            />
          )}

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

          {activeTab === 'database' && <DeploymentHub />}
        </main>
      </div>

      {previewDoc && (
        <QuotationPrintView
          document={previewDoc.document}
          type={previewDoc.type}
          onClose={() => setPreviewDoc(null)}
          onConvertToInvoice={handleConvertToInvoice}
          onApproveAndSchedule={handleApproveQuotationAndSchedule}
        />
      )}
    </div>
  );
}

export default App;
