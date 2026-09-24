import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storage';
import {
  Quotation,
  Invoice,
  Client,
  Supplier,
  ProjectSchedule,
  Expense,
  FinancialLiability,
  AIClientProspect,
  AppNotification,
  UserSession,
} from './types';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { QuotationModule } from './components/QuotationModule';
import { InvoiceModule } from './components/InvoiceModule';
import { ClientsSuppliers } from './components/ClientsSuppliers';
import { ProjectsScheduling } from './components/ProjectsScheduling';
import { ExpensesLiabilities } from './components/ExpensesLiabilities';
import { AgenticGrowth } from './components/AgenticGrowth';
import { AIDesignGenerator } from './components/AIDesignGenerator';
import { DeploymentHub } from './components/DeploymentHub';
import { QuotationPrintView } from './components/QuotationPrintView';
import { AuthView } from './components/AuthView';
import { MobileSimulatorFrame } from './components/MobileSimulatorFrame';

export default function App() {
  // Session Authentication State
  const [userSession, setUserSession] = useState<UserSession | null>(() =>
    StorageService.getUserSession(),
  );

  // View & Navigation State
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileSimulator, setIsMobileSimulator] = useState(false);

  // Entities State (Synchronized via StorageService)
  const [quotations, setQuotations] = useState<Quotation[]>(() =>
    StorageService.getQuotations(),
  );
  const [invoices, setInvoices] = useState<Invoice[]>(() =>
    StorageService.getInvoices(),
  );
  const [clients, setClients] = useState<Client[]>(() =>
    StorageService.getClients(),
  );
  const [suppliers, setSuppliers] = useState<Supplier[]>(() =>
    StorageService.getSuppliers(),
  );
  const [projects, setProjects] = useState<ProjectSchedule[]>(() =>
    StorageService.getProjects(),
  );
  const [expenses, setExpenses] = useState<Expense[]>(() =>
    StorageService.getExpenses(),
  );
  const [liabilities, setLiabilities] = useState<FinancialLiability[]>(() =>
    StorageService.getLiabilities(),
  );
  const [prospects, setProspects] = useState<AIClientProspect[]>(() =>
    StorageService.getProspects(),
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    StorageService.getNotifications(),
  );

  // Document Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<{
    doc: Quotation | Invoice;
    type: 'Quotation' | 'Invoice';
  } | null>(null);

  // Request browser push notification permissions
  const requestPushPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('Grand CMS Notifications Active', {
          body: 'You will receive real-time push alerts for print clearance and project milestones.',
          icon: '/grand-logo.svg',
        });
      }
    }
  };

  const triggerPushAlert = (title: string, message: string) => {
    // 1. Browser Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/grand-logo.svg',
        });
      } catch (e) {
        console.warn('Browser notification error:', e);
      }
    }

    // 2. In-App Notification Record
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type: 'project_deadline',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      priority: 'high',
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    StorageService.saveNotifications(updated);
  };

  // --- ACTIONS & HANDLERS ---
  const handleLogin = (session: UserSession) => {
    StorageService.saveUserSession(session);
    setUserSession(session);
  };

  const handleLogout = () => {
    StorageService.clearUserSession();
    setUserSession(null);
  };

  const handleSaveQuotation = (quotation: Quotation) => {
    StorageService.saveQuotation(quotation);
    setQuotations(StorageService.getQuotations());
    triggerPushAlert(
      `Quotation Updated: ${quotation.quotationNumber}`,
      `Quotation for ${quotation.clientName} valued at ৳ ${quotation.total.toLocaleString()} was saved.`,
    );
  };

  const handleDeleteQuotation = (id: string) => {
    StorageService.deleteQuotation(id);
    setQuotations(StorageService.getQuotations());
  };

  const handleConvertToInvoice = (quotation: Quotation) => {
    const invoiceNumber = `GCM-INV-2026-${String(invoices.length + 101).padStart(4, '0')}`;
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      quotationId: quotation.id,
      clientId: quotation.clientId,
      clientName: quotation.clientName,
      clientCompany: quotation.clientCompany,
      clientAddress: quotation.clientAddress,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      subject: quotation.subject.replace('Quotation for –', 'Invoice for –'),
      items: quotation.items,
      subtotal: quotation.subtotal,
      agencyCommissionAmount: quotation.agencyCommissionAmount,
      vatAmount: quotation.vatAmount,
      total: quotation.total,
      advance: quotation.advance,
      due: quotation.due,
      payments: quotation.advance > 0 ? [
        {
          id: `pay-${Date.now()}`,
          date: quotation.date,
          amount: quotation.advance,
          method: 'Bank Transfer',
          reference: 'Advance upon quotation approval',
          receivedBy: quotation.signatoryName || 'Mohin Uddin Mazumder',
        }
      ] : [],
      termsAndConditions: quotation.termsAndConditions,
      nbText: quotation.nbText,
      signatoryName: quotation.signatoryName,
      signatoryTitle: quotation.signatoryTitle,
      signatoryPhone: quotation.signatoryPhone,
      status: quotation.due === 0 ? 'Paid' : 'Due',
      createdAt: new Date().toISOString(),
    };

    StorageService.saveInvoice(newInvoice);

    // Update quotation status to 'Invoiced'
    const updatedQuo: Quotation = { ...quotation, status: 'Invoiced' };
    StorageService.saveQuotation(updatedQuo);

    setQuotations(StorageService.getQuotations());
    setInvoices(StorageService.getInvoices());
    setClients(StorageService.getClients());

    triggerPushAlert(
      `Invoice Generated: ${invoiceNumber}`,
      `Created official tax invoice for ${newInvoice.clientName} (Total: ৳ ${newInvoice.total.toLocaleString()}).`,
    );

    // Open the new invoice in print view
    setPreviewDoc({ doc: newInvoice, type: 'Invoice' });
  };

  const handleSaveInvoice = (invoice: Invoice) => {
    StorageService.saveInvoice(invoice);
    setInvoices(StorageService.getInvoices());
    setClients(StorageService.getClients());
  };

  const handleDeleteInvoice = (id: string) => {
    StorageService.deleteInvoice(id);
    setInvoices(StorageService.getInvoices());
    setClients(StorageService.getClients());
  };

  const handleSaveClient = (client: Client) => {
    StorageService.saveClient(client);
    setClients(StorageService.getClients());
  };

  const handleDeleteClient = (id: string) => {
    StorageService.deleteClient(id);
    setClients(StorageService.getClients());
  };

  const handleSaveSupplier = (supplier: Supplier) => {
    StorageService.saveSupplier(supplier);
    setSuppliers(StorageService.getSuppliers());
  };

  const handleSaveProject = (project: ProjectSchedule) => {
    StorageService.saveProject(project);
    setProjects(StorageService.getProjects());
  };

  const handleSaveExpense = (expense: Expense) => {
    StorageService.saveExpense(expense);
    setExpenses(StorageService.getExpenses());
    setLiabilities(StorageService.getLiabilities());
    setSuppliers(StorageService.getSuppliers());
  };

  const handlePayLiability = (liabilityId: string, amount: number) => {
    StorageService.payLiability(liabilityId, amount);
    setLiabilities(StorageService.getLiabilities());
    setSuppliers(StorageService.getSuppliers());
    triggerPushAlert(
      'Supplier Liability Settled',
      `Paid ৳ ${amount.toLocaleString()} towards outstanding vendor commitment.`,
    );
  };

  const handleDeleteExpense = (id: string) => {
    StorageService.deleteExpense(id);
    setExpenses(StorageService.getExpenses());
  };

  const handleAddProspectToClients = (prospect: AIClientProspect) => {
    const newClient: Client = {
      id: `cli-${Date.now()}`,
      name: prospect.companyName,
      companyName: prospect.companyName,
      contactPerson: 'Lead Coordinator',
      designation: 'Head of Marketing / Procurement',
      email: `${prospect.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`,
      phone: '+880 1819 000000',
      address: prospect.location,
      city: 'Chattogram',
      totalBilled: 0,
      totalPaid: 0,
      currentDue: 0,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    handleSaveClient(newClient);
    triggerPushAlert('AI Prospect Converted', `${prospect.companyName} was added to Clients CRM.`);
    setCurrentTab('clients_suppliers');
  };

  const handleDraftQuotationFromProspect = (prospect: AIClientProspect) => {
    handleAddProspectToClients(prospect);
    setCurrentTab('quotations');
  };

  // Quick Action menu callback
  const handleQuickAction = (action: 'quotation' | 'invoice' | 'expense' | 'ai_discovery') => {
    if (action === 'quotation') setCurrentTab('quotations');
    else if (action === 'invoice') setCurrentTab('invoices');
    else if (action === 'expense') setCurrentTab('expenses');
    else if (action === 'ai_discovery') setCurrentTab('agentic_growth');
  };

  // If not logged in, show secure login portal
  if (!userSession) {
    return <AuthView onLogin={handleLogin} />;
  }

  // Active Main Content renderer
  const renderMainContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard
            quotations={quotations}
            invoices={invoices}
            clients={clients}
            suppliers={suppliers}
            projects={projects}
            liabilities={liabilities}
            onNavigate={(tab) => setCurrentTab(tab)}
            onPreviewDocument={(doc, type) => setPreviewDoc({ doc, type })}
            onNewQuotation={() => setCurrentTab('quotations')}
          />
        );

      case 'quotations':
        return (
          <QuotationModule
            quotations={quotations}
            clients={clients}
            onSaveQuotation={handleSaveQuotation}
            onDeleteQuotation={handleDeleteQuotation}
            onPreviewDocument={(q) => setPreviewDoc({ doc: q, type: 'Quotation' })}
            onConvertToInvoice={handleConvertToInvoice}
          />
        );

      case 'invoices':
        return (
          <InvoiceModule
            invoices={invoices}
            clients={clients}
            onSaveInvoice={handleSaveInvoice}
            onDeleteInvoice={handleDeleteInvoice}
            onPreviewInvoice={(inv) => setPreviewDoc({ doc: inv, type: 'Invoice' })}
          />
        );

      case 'clients_suppliers':
        return (
          <ClientsSuppliers
            clients={clients}
            suppliers={suppliers}
            onSaveClient={handleSaveClient}
            onDeleteClient={handleDeleteClient}
            onSaveSupplier={handleSaveSupplier}
            onDraftQuotationForClient={() => setCurrentTab('quotations')}
            onLogSupplierExpense={() => setCurrentTab('expenses')}
          />
        );

      case 'projects':
        return (
          <ProjectsScheduling
            projects={projects}
            clients={clients}
            onSaveProject={handleSaveProject}
            onTriggerPushNotification={triggerPushAlert}
          />
        );

      case 'expenses':
        return (
          <ExpensesLiabilities
            expenses={expenses}
            liabilities={liabilities}
            suppliers={suppliers}
            onSaveExpense={handleSaveExpense}
            onPayLiability={handlePayLiability}
            onDeleteExpense={handleDeleteExpense}
          />
        );

      case 'agentic_growth':
        return (
          <AgenticGrowth
            prospects={prospects}
            onAddProspectToClients={handleAddProspectToClients}
            onDraftQuotationFromProspect={handleDraftQuotationFromProspect}
          />
        );

      case 'ai_design':
        return (
          <AIDesignGenerator
            onExportToQuotation={() => setCurrentTab('quotations')}
          />
        );

      case 'deployment':
        return <DeploymentHub />;

      default:
        return null;
    }
  };

  // Computations for sidebar badges
  const totalClientDue = invoices.reduce((sum, inv) => sum + inv.due, 0);
  const totalSupplierLiability = liabilities
    .filter((l) => l.status !== 'Cleared')
    .reduce((sum, l) => sum + l.remainingLiability, 0);

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900 font-sans selection:bg-[#0B192C] selection:text-white">
      {/* Document Print & Download Letterhead Modal */}
      {previewDoc && (
        <QuotationPrintView
          document={previewDoc.doc}
          type={previewDoc.type}
          onClose={() => setPreviewDoc(null)}
          onConvertToInvoice={
            previewDoc.type === 'Quotation'
              ? (q) => {
                  setPreviewDoc(null);
                  handleConvertToInvoice(q);
                }
              : undefined
          }
        />
      )}

      {/* Render either Mobile App Simulator mode OR Full Desktop Dashboard */}
      {isMobileSimulator ? (
        <MobileSimulatorFrame
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onExitMobileSimulator={() => setIsMobileSimulator(false)}
        >
          {renderMainContent()}
        </MobileSimulatorFrame>
      ) : (
        <div className="flex flex-col min-h-screen">
          {/* Top Navbar */}
          <Navbar
            user={userSession}
            notifications={notifications}
            isMobileSimulator={isMobileSimulator}
            onToggleMobileSimulator={() => setIsMobileSimulator(!isMobileSimulator)}
            onLogout={handleLogout}
            onMarkNotificationsRead={() => {
              const updated = notifications.map((n) => ({ ...n, isRead: true }));
              setNotifications(updated);
              StorageService.saveNotifications(updated);
            }}
            onQuickAction={handleQuickAction}
            onRequestPushPermission={requestPushPermission}
          />

          {/* Body with Sidebar & Content */}
          <div className="flex-1 flex overflow-hidden">
            <Sidebar
              currentTab={currentTab}
              onSelectTab={setCurrentTab}
              quotationCount={quotations.length}
              dueAmount={totalClientDue}
              liabilityAmount={totalSupplierLiability}
            />

            {/* Scrollable Main Application Canvas in Crisp Cool White */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#f4f7fb]">
              <div className="max-w-7xl mx-auto">{renderMainContent()}</div>
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
