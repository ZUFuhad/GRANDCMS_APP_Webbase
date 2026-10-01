import {
  Quotation,
  Invoice,
  Client,
  Supplier,
  ProjectSchedule,
  Expense,
  FinancialLiability,
  AppNotification,
  AIClientProspect,
} from '../types';
import {
  INITIAL_QUOTATIONS,
  INITIAL_INVOICES,
  INITIAL_CLIENTS,
  INITIAL_SUPPLIERS,
  INITIAL_PROJECTS,
  INITIAL_EXPENSES,
  INITIAL_LIABILITIES,
  INITIAL_NOTIFICATIONS,
  INITIAL_AI_PROSPECTS,
} from '../mock/initialData';
import { SupabaseService } from './supabase';

export const STORAGE_KEYS = {
  QUOTATIONS: 'grand_cms_quotations',
  INVOICES: 'grand_cms_invoices',
  CLIENTS: 'grand_cms_clients',
  SUPPLIERS: 'grand_cms_suppliers',
  PROJECTS: 'grand_cms_projects',
  EXPENSES: 'grand_cms_expenses',
  LIABILITIES: 'grand_cms_liabilities',
  NOTIFICATIONS: 'grand_cms_notifications',
  AI_PROSPECTS: 'grand_cms_ai_prospects',
};

function safeParseArray<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw || raw === 'undefined' || raw === 'null') return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (e) {
    console.warn(`Failed to parse localStorage key: ${key}`, e);
    return fallback;
  }
}

export const clientIdFor = (name: string, company = '') => {
  const source = (company || name || 'client').trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < source.length; i++) {
    hash = ((hash << 5) - hash + source.charCodeAt(i)) | 0;
  }
  return `client-${Math.abs(hash)}`;
};

// Row mappers for Supabase Postgres tables
export const toClientRow = (c: Client) => ({
  id: c.id,
  name: c.name,
  company_name: c.companyName || c.name,
  email: c.email || null,
  phone: c.phone || null,
  address: c.address || null,
  city: c.city || 'Chattogram',
  contact_person: c.contactPerson || null,
  designation: c.designation || null,
  total_billed: c.totalBilled || 0,
  total_paid: c.totalPaid || 0,
  current_due: c.currentDue || 0,
  status: c.status || 'active',
  created_at: c.createdAt || new Date().toISOString(),
});

export const fromClientRow = (r: any): Client => ({
  id: r.id,
  name: r.name,
  companyName: r.company_name || r.name,
  contactPerson: r.contact_person || '',
  designation: r.designation || '',
  email: r.email || '',
  phone: r.phone || '',
  address: r.address || '',
  city: r.city || '',
  totalBilled: Number(r.total_billed || 0),
  totalPaid: Number(r.total_paid || 0),
  currentDue: Number(r.current_due || 0),
  status: r.status === 'inactive' ? 'inactive' : 'active',
  createdAt: r.created_at || new Date().toISOString(),
});

export const toSupplierRow = (s: Supplier) => ({
  id: s.id,
  name: s.name,
  company_name: s.companyName || s.name,
  category: s.serviceCategory || 'General',
  phone: s.phone || null,
  email: s.email || null,
  address: s.address || null,
  bank_details: s.bankDetails || null,
  total_purchased: s.payableAmount || 0,
  total_paid: s.paidAmount || 0,
  payable_liability: Math.max(0, (s.payableAmount || 0) - (s.paidAmount || 0)),
  credit_term_days: 30,
  status: 'active',
  created_at: s.createdAt || new Date().toISOString(),
});

export const fromSupplierRow = (r: any): Supplier => ({
  id: r.id,
  name: r.name,
  companyName: r.company_name || r.name,
  serviceCategory: r.category || 'General',
  productsProvided: [],
  contactPerson: '',
  phone: r.phone || '',
  email: r.email || '',
  address: r.address || '',
  payableAmount: Number(r.total_purchased || 0),
  paidAmount: Number(r.total_paid || 0),
  bankDetails: r.bank_details || '',
  createdAt: r.created_at || new Date().toISOString(),
});

export const toQuotationRow = (q: Quotation, clients: Client[] = []) => {
  const client = clients.find((c) => c.companyName === q.clientCompany || c.name === q.clientName);
  const subtotal = Number(q.subtotal) || 0;
  const total = Number(q.total) || 0;
  const advance = Number(q.advance) || 0;
  const due = typeof q.due === 'number' ? q.due : Math.max(0, total - advance);

  return {
    id: q.id,
    quotation_number: q.quotationNumber,
    client_id: client?.id || clientIdFor(q.clientName, q.clientCompany),
    client_name: q.clientName,
    client_company: q.clientCompany || null,
    date: q.date,
    validity_date: q.validityDate || null,
    subject: q.subject,
    items_json: Array.isArray(q.items) ? q.items : [],
    subtotal,
    agency_commission_percent: typeof q.agencyCommissionPercent === 'number' ? q.agencyCommissionPercent : 10,
    agency_commission_amount: Number(q.agencyCommissionAmount) || 0,
    vat_percent: typeof q.vatPercent === 'number' ? q.vatPercent : 0,
    vat_amount: Number(q.vatAmount) || 0,
    total,
    advance,
    due,
    nb_text: q.nbText || null,
    terms_json: Array.isArray(q.termsAndConditions) ? q.termsAndConditions : [],
    signatory_name: q.signatoryName || null,
    signatory_title: q.signatoryTitle || null,
    signatory_phone: q.signatoryPhone || null,
    status: q.status || 'Draft',
    created_at: q.createdAt || new Date().toISOString(),
  };
};

export const fromQuotationRow = (r: any): Quotation => ({
  id: r.id,
  quotationNumber: r.quotation_number,
  date: r.date,
  validityDate: r.validity_date || '',
  clientName: r.client_name,
  clientCompany: r.client_company || '',
  subject: r.subject,
  items: Array.isArray(r.items_json) ? r.items_json : [],
  subtotal: Number(r.subtotal || 0),
  agencyCommissionPercent: Number(r.agency_commission_percent || 0),
  agencyCommissionAmount: Number(r.agency_commission_amount || 0),
  vatPercent: Number(r.vat_percent || 0),
  vatAmount: Number(r.vat_amount || 0),
  total: Number(r.total || 0),
  advance: Number(r.advance || 0),
  due: Number(r.due || 0),
  termsAndConditions: Array.isArray(r.terms_json) ? r.terms_json : [],
  nbText: r.nb_text || '',
  signatoryName: r.signatory_name || '',
  signatoryTitle: r.signatory_title || '',
  signatoryPhone: r.signatory_phone || '',
  status: r.status || 'Draft',
  createdAt: r.created_at || new Date().toISOString(),
});

export const toInvoiceRow = (i: Invoice, clients: Client[] = []) => {
  const client = clients.find((c) => c.companyName === i.clientCompany || c.name === i.clientName);
  const subtotal = Number(i.subtotal) || 0;
  const total = Number(i.total) || 0;
  const advance = Number(i.advance) || 0;
  const due = typeof i.due === 'number' ? i.due : Math.max(0, total - advance);

  return {
    id: i.id,
    invoice_number: i.invoiceNumber,
    quotation_id: i.quotationId || null,
    client_id: client?.id || clientIdFor(i.clientName, i.clientCompany),
    client_name: i.clientName,
    client_company: i.clientCompany || null,
    date: i.date,
    due_date: (i as any).dueDate || null,
    subject: i.subject,
    items_json: Array.isArray(i.items) ? i.items : [],
    subtotal,
    agency_commission_amount: Number(i.agencyCommissionAmount) || 0,
    vat_amount: Number(i.vatAmount) || 0,
    total,
    advance,
    due,
    payments_json: Array.isArray(i.payments) ? i.payments : [],
    status: i.status || 'Due',
    signatory_name: i.signatoryName || null,
    created_at: i.createdAt || new Date().toISOString(),
  };
};

export const fromInvoiceRow = (r: any): Invoice => ({
  id: r.id,
  invoiceNumber: r.invoice_number,
  quotationId: r.quotation_id || undefined,
  date: r.date,
  clientName: r.client_name,
  clientCompany: r.client_company || '',
  subject: r.subject,
  items: Array.isArray(r.items_json) ? r.items_json : [],
  subtotal: Number(r.subtotal || 0),
  agencyCommissionPercent: 10,
  agencyCommissionAmount: Number(r.agency_commission_amount || 0),
  vatPercent: 0,
  vatAmount: Number(r.vat_amount || 0),
  total: Number(r.total || 0),
  advance: Number(r.advance || 0),
  due: Number(r.due || 0),
  payments: Array.isArray(r.payments_json) ? r.payments_json : [],
  termsAndConditions: [],
  nbText: '',
  signatoryName: r.signatory_name || '',
  signatoryTitle: '',
  signatoryPhone: '',
  status: r.status || 'Unpaid',
  createdAt: r.created_at || new Date().toISOString(),
});

export const toProjectRow = (p: ProjectSchedule, clients: Client[] = []) => {
  const client = clients.find((c) => c.companyName === p.clientCompany || c.name === p.clientName);
  return {
    id: p.id,
    title: p.projectName,
    client_id: client?.id || clientIdFor(p.clientName, p.clientCompany),
    client_name: p.clientName,
    quotation_id: p.quotationId || null,
    invoice_id: p.invoiceId || null,
    event_date: p.eventDate || '',
    print_clearance_deadline: p.setupDate || '',
    installation_deadline: p.setupDate || '',
    status: p.status,
    priority: 'Normal',
    location: p.venue || null,
    // Safely store team, checklist, company, and financial metadata in JSONB
    assigned_team_json: {
      team: p.assignedTeam || ['Operations Team'],
      checklist: p.checklist || [],
      client_company: p.clientCompany || '',
      client_address: p.clientAddress || '',
      total_amount: p.totalAmount || 0,
      advance: p.advance || 0,
      due: p.due || 0,
      quotation_number: p.quotationNumber || '',
    },
    progress_percent: p.status === 'Completed' ? 100 : 0,
    created_at: p.createdAt || new Date().toISOString(),
  };
};

export const fromProjectRow = (r: any): ProjectSchedule => {
  let assignedTeam = ['Operations Team'];
  let checklist = [];
  let clientCompany = r.client_company || '';
  let clientAddress = '';
  let totalAmount: number | undefined = undefined;
  let advance: number | undefined = undefined;
  let due: number | undefined = undefined;
  let quotationNumber = '';

  if (Array.isArray(r.assigned_team_json)) {
    assignedTeam = r.assigned_team_json;
  } else if (r.assigned_team_json && typeof r.assigned_team_json === 'object') {
    if (Array.isArray(r.assigned_team_json.team)) assignedTeam = r.assigned_team_json.team;
    if (Array.isArray(r.assigned_team_json.checklist)) checklist = r.assigned_team_json.checklist;
    if (r.assigned_team_json.client_company) clientCompany = r.assigned_team_json.client_company;
    if (r.assigned_team_json.client_address) clientAddress = r.assigned_team_json.client_address;
    if (typeof r.assigned_team_json.total_amount === 'number') totalAmount = r.assigned_team_json.total_amount;
    if (typeof r.assigned_team_json.advance === 'number') advance = r.assigned_team_json.advance;
    if (typeof r.assigned_team_json.due === 'number') due = r.assigned_team_json.due;
    if (r.assigned_team_json.quotation_number) quotationNumber = r.assigned_team_json.quotation_number;
  }

  if (Array.isArray(r.checklist_json) && r.checklist_json.length > 0) {
    checklist = r.checklist_json;
  }

  return {
    id: r.id,
    quotationId: r.quotation_id || undefined,
    quotationNumber: quotationNumber || undefined,
    invoiceId: r.invoice_id || undefined,
    projectName: r.title,
    clientName: r.client_name,
    clientCompany: clientCompany,
    clientAddress: clientAddress || r.location || '',
    venue: r.location || '',
    eventDate: r.event_date || '',
    setupDate: r.installation_deadline || '',
    status: r.status || 'Upcoming',
    assignedTeam,
    checklist,
    totalAmount,
    advance,
    due,
    createdAt: r.created_at || '',
  };
};

export const toExpenseRow = (e: Expense) => ({
  id: e.id,
  date: e.date,
  title: e.description,
  category: e.category,
  project_id: e.projectId || null,
  supplier_id: null,
  supplier_name: e.paidTo || null,
  amount: e.amount || 0,
  is_paid: true,
  due_date: null,
  payment_method: e.paymentMethod || null,
  recorded_by: 'Admin',
  receipt_number: null,
});

export const fromExpenseRow = (r: any): Expense => ({
  id: r.id,
  projectId: r.project_id || undefined,
  quotationId: undefined,
  expenseType: r.category === 'Office Rent' || r.category === 'Salary' || r.category === 'Utilities' ? 'Office' : 'Project',
  date: r.date,
  category: r.category,
  description: r.title,
  amount: Number(r.amount || 0),
  paidTo: r.supplier_name || '',
  paymentMethod: r.payment_method || '',
});

export const toLiabilityRow = (l: FinancialLiability) => ({
  id: l.id,
  supplier_id: l.creditor || l.id,
  supplier_name: l.creditor || l.title,
  category: l.title,
  total_amount: l.totalAmount || 0,
  paid_amount: l.paidAmount || 0,
  remaining_liability: Math.max(0, (l.totalAmount || 0) - (l.paidAmount || 0)),
  due_date: l.dueDate || null,
  status: l.status,
  notes: l.notes || null,
});

export const fromLiabilityRow = (r: any): FinancialLiability => ({
  id: r.id,
  title: r.category || '',
  creditor: r.supplier_name || '',
  totalAmount: Number(r.total_amount || 0),
  paidAmount: Number(r.paid_amount || 0),
  dueDate: r.due_date || '',
  status: r.status || 'Pending',
  notes: r.notes || '',
});

export const loadStorageData = () => {
  try {
    const rawQuotations = safeParseArray<any>(STORAGE_KEYS.QUOTATIONS, INITIAL_QUOTATIONS);
    const rawInvoices = safeParseArray<any>(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
    const rawClients = safeParseArray<any>(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
    const rawSuppliers = safeParseArray<any>(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
    const rawProjects = safeParseArray<any>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const rawExpenses = safeParseArray<any>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    const rawLiabilities = safeParseArray<any>(STORAGE_KEYS.LIABILITIES, INITIAL_LIABILITIES);
    const rawNotifications = safeParseArray<any>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const rawProspects = safeParseArray<any>(STORAGE_KEYS.AI_PROSPECTS, INITIAL_AI_PROSPECTS);

    // Sanitize quotations
    const quotations: Quotation[] = rawQuotations.map((q: any) => ({
      ...q,
      subtotal: Number(q.subtotal) || 0,
      agencyCommissionPercent: typeof q.agencyCommissionPercent === 'number' ? q.agencyCommissionPercent : 10,
      agencyCommissionAmount: Number(q.agencyCommissionAmount) || 0,
      vatPercent: typeof q.vatPercent === 'number' ? q.vatPercent : 0,
      vatAmount: Number(q.vatAmount) || 0,
      total: Number(q.total) || 0,
      advance: Number(q.advance) || 0,
      due: typeof q.due === 'number' ? q.due : Math.max(0, (Number(q.total) || 0) - (Number(q.advance) || 0)),
      items: Array.isArray(q.items)
        ? q.items.map((i: any) => ({
            ...i,
            quantity: Number(i.quantity) || 1,
            unitPrice: Number(i.unitPrice) || 0,
            total: Number(i.total) || 0,
          }))
        : [],
    }));

    // Sanitize invoices
    const invoices: Invoice[] = rawInvoices.map((inv: any) => ({
      ...inv,
      subtotal: Number(inv.subtotal) || 0,
      agencyCommissionPercent: typeof inv.agencyCommissionPercent === 'number' ? inv.agencyCommissionPercent : 10,
      agencyCommissionAmount: Number(inv.agencyCommissionAmount) || 0,
      vatPercent: typeof inv.vatPercent === 'number' ? inv.vatPercent : 0,
      vatAmount: Number(inv.vatAmount) || 0,
      total: Number(inv.total) || 0,
      advance: Number(inv.advance) || 0,
      due: typeof inv.due === 'number' ? inv.due : Math.max(0, (Number(inv.total) || 0) - (Number(inv.advance) || 0)),
      payments: Array.isArray(inv.payments) ? inv.payments : [],
    }));

    // Merge & sanitize suppliers
    const mergedSuppliers = [...rawSuppliers];
    INITIAL_SUPPLIERS.forEach((initSup) => {
      if (!mergedSuppliers.some((s: any) => s.id === initSup.id || (s.name && s.name.toLowerCase() === initSup.name.toLowerCase()))) {
        mergedSuppliers.push(initSup);
      }
    });

    const suppliers: Supplier[] = mergedSuppliers.map((s: any) => ({
      ...s,
      payableAmount: Number(s.payableAmount) || 0,
      paidAmount: Number(s.paidAmount) || 0,
      productsProvided: Array.isArray(s.productsProvided) ? s.productsProvided : [],
    }));

    // Sanitize clients
    const clients: Client[] = rawClients.map((c: any) => ({
      ...c,
      totalBilled: Number(c.totalBilled) || 0,
      totalPaid: Number(c.totalPaid) || 0,
      currentDue: Number(c.currentDue) || 0,
    }));

    // Sanitize expenses
    const expenses: Expense[] = rawExpenses.map((e: any) => ({
      ...e,
      amount: Number(e.amount) || 0,
    }));

    // Sanitize projects
    const projects: ProjectSchedule[] = rawProjects.map((p: any) => ({
      ...p,
      assignedTeam: Array.isArray(p.assignedTeam) ? p.assignedTeam : ['Operations Team'],
      checklist: Array.isArray(p.checklist)
        ? p.checklist.map((c: any) => ({
            task: String(c.task || 'Milestone Task'),
            completed: Boolean(c.completed),
          }))
        : [{ task: 'Complete execution setup', completed: false }],
      totalAmount: typeof p.totalAmount === 'number' ? p.totalAmount : undefined,
      advance: typeof p.advance === 'number' ? p.advance : undefined,
      due: typeof p.due === 'number' ? p.due : undefined,
    }));

    // Sanitize prospects
    const aiProspects: AIClientProspect[] = rawProspects.map((p: any) => {
      const contactVerified = Boolean(p.contactVerified || p.source === 'Manual');
      return {
        ...p,
        contactPerson: contactVerified ? p.contactPerson || '' : '',
        mobileNumber: contactVerified ? p.mobileNumber || '' : '',
        email: contactVerified ? p.email || '' : '',
        contactVerified,
        priority: p.priority || 'Medium',
        triggerEvent: contactVerified ? p.triggerEvent || '' : '',
        estimatedBudget: contactVerified ? Number(p.estimatedBudget) || 0 : 0,
      };
    });

    return {
      quotations: quotations.length > 0 ? quotations : INITIAL_QUOTATIONS,
      invoices: invoices.length > 0 ? invoices : INITIAL_INVOICES,
      clients: clients.length > 0 ? clients : INITIAL_CLIENTS,
      suppliers: suppliers.length > 0 ? suppliers : INITIAL_SUPPLIERS,
      projects: projects.length > 0 ? projects : INITIAL_PROJECTS,
      expenses: expenses.length > 0 ? expenses : INITIAL_EXPENSES,
      liabilities: rawLiabilities.length > 0 ? rawLiabilities : INITIAL_LIABILITIES,
      notifications: rawNotifications.length > 0 ? rawNotifications : INITIAL_NOTIFICATIONS,
      aiProspects: aiProspects.length > 0 ? aiProspects : INITIAL_AI_PROSPECTS,
    };
  } catch (e) {
    console.error('Failed to load storage', e);
    return {
      quotations: INITIAL_QUOTATIONS,
      invoices: INITIAL_INVOICES,
      clients: INITIAL_CLIENTS,
      suppliers: INITIAL_SUPPLIERS,
      projects: INITIAL_PROJECTS,
      expenses: INITIAL_EXPENSES,
      liabilities: INITIAL_LIABILITIES,
      notifications: INITIAL_NOTIFICATIONS,
      aiProspects: INITIAL_AI_PROSPECTS,
    };
  }
};

/**
 * Hydrates storage from Supabase PostgreSQL if configured and online.
 * Falls back to local storage silently on error.
 */
export const hydrateStorageData = async () => {
  const local = loadStorageData();
  const client = SupabaseService.getClient();
  if (!client) return local;

  try {
    const results = await Promise.all([
      client.from('clients').select('*').order('created_at', { ascending: true }),
      client.from('suppliers').select('*').order('created_at', { ascending: true }),
      client.from('quotations').select('*').order('created_at', { ascending: false }),
      client.from('invoices').select('*').order('created_at', { ascending: false }),
      client.from('projects').select('*').order('created_at', { ascending: false }),
      client.from('expenses').select('*').order('date', { ascending: false }),
      client.from('financial_liabilities').select('*').order('due_date', { ascending: true }),
    ]);

    // If all table queries failed (e.g. offline/network), return local
    if (results.every((r) => r.error)) {
      console.warn('[Supabase Hydrate] Queries failed, using local offline data.');
      return local;
    }

    // 1. Clients Merge
    const remoteClients = (results[0].data || []).map(fromClientRow);
    const clientsMap = new Map<string, Client>();
    local.clients.forEach((c) => clientsMap.set(c.id, c));
    remoteClients.forEach((c) => clientsMap.set(c.id, c));
    const mergedClients = Array.from(clientsMap.values());

    // 2. Suppliers Merge
    const remoteSuppliers = (results[1].data || []).map(fromSupplierRow);
    const suppliersMap = new Map<string, Supplier>();
    local.suppliers.forEach((s) => suppliersMap.set(s.id, s));
    remoteSuppliers.forEach((s) => suppliersMap.set(s.id, s));
    const mergedSuppliers = Array.from(suppliersMap.values());

    // 3. Quotations Merge (CRITICAL: preserve local quotations 005, 006, 007, 008, 009!)
    const remoteQuotations = (results[2].data || []).map(fromQuotationRow);
    const quotationsMap = new Map<string, Quotation>();
    const remoteQuotNumbers = new Set(remoteQuotations.map((q) => q.quotationNumber));
    remoteQuotations.forEach((q) => quotationsMap.set(q.id, q));

    const localOnlyQuotations: Quotation[] = [];
    local.quotations.forEach((q) => {
      if (!quotationsMap.has(q.id) && !remoteQuotNumbers.has(q.quotationNumber)) {
        quotationsMap.set(q.id, q);
        localOnlyQuotations.push(q);
      }
    });
    const mergedQuotations = Array.from(quotationsMap.values());

    // 4. Invoices Merge
    const remoteInvoices = (results[3].data || []).map(fromInvoiceRow);
    const invoicesMap = new Map<string, Invoice>();
    const remoteInvNumbers = new Set(remoteInvoices.map((i) => i.invoiceNumber));
    remoteInvoices.forEach((i) => invoicesMap.set(i.id, i));

    const localOnlyInvoices: Invoice[] = [];
    local.invoices.forEach((i) => {
      if (!invoicesMap.has(i.id) && !remoteInvNumbers.has(i.invoiceNumber)) {
        invoicesMap.set(i.id, i);
        localOnlyInvoices.push(i);
      }
    });
    const mergedInvoices = Array.from(invoicesMap.values());

    // 5. Projects Merge
    const remoteProjects = (results[4].data || []).map(fromProjectRow);
    const projectsMap = new Map<string, ProjectSchedule>();
    remoteProjects.forEach((p) => projectsMap.set(p.id, p));

    const localOnlyProjects: ProjectSchedule[] = [];
    local.projects.forEach((p) => {
      if (!projectsMap.has(p.id)) {
        projectsMap.set(p.id, p);
        localOnlyProjects.push(p);
      }
    });
    const mergedProjects = Array.from(projectsMap.values());

    // 6. Expenses & Liabilities
    const remoteExpenses = (results[5].data || []).map(fromExpenseRow);
    const mergedExpenses = remoteExpenses.length > 0 ? remoteExpenses : local.expenses;
    const remoteLiabilities = (results[6].data || []).map(fromLiabilityRow);
    const mergedLiabilities = remoteLiabilities.length > 0 ? remoteLiabilities : local.liabilities;

    const data = {
      clients: mergedClients,
      suppliers: mergedSuppliers,
      quotations: mergedQuotations,
      invoices: mergedInvoices,
      projects: mergedProjects,
      expenses: mergedExpenses,
      liabilities: mergedLiabilities,
      notifications: local.notifications,
      aiProspects: local.aiProspects,
    };

    // Update local storage
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(data.clients));
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(data.suppliers));
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(data.quotations));
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(data.invoices));
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(data.projects));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(data.expenses));
    localStorage.setItem(STORAGE_KEYS.LIABILITIES, JSON.stringify(data.liabilities));

    // AUTO-SYNC: If there were local-only items created while offline, upload them now!
    if (localOnlyQuotations.length > 0) {
      console.log(`[Supabase Auto-Sync] Syncing ${localOnlyQuotations.length} offline quotations to Supabase...`);
      upsertRemote('quotations', localOnlyQuotations.map((q) => toQuotationRow(q, mergedClients)));
    }
    if (localOnlyInvoices.length > 0) {
      upsertRemote('invoices', localOnlyInvoices.map((i) => toInvoiceRow(i, mergedClients)));
    }
    if (localOnlyProjects.length > 0) {
      upsertRemote('projects', localOnlyProjects.map((p) => toProjectRow(p, mergedClients)));
    }

    return data;
  } catch (error) {
    console.warn('[Supabase Hydrate] Exception; preserving local data.', error);
    return local;
  }
};

export const upsertRemote = async (table: string, rows: any[]) => {
  if (rows.length === 0) return { count: 0 };
  const client = SupabaseService.getClient();
  if (!client) {
    console.warn(`[Supabase Sync] Client not configured for table ${table}`);
    return { count: 0, error: 'Supabase client not configured' };
  }

  try {
    // 1. First attempt fast batch upsert
    const { error } = await client.from(table).upsert(rows, { onConflict: 'id' });
    if (!error) {
      console.log(`[Supabase Sync] Successfully saved ${rows.length} rows to ${table}`);
      return { count: rows.length };
    }

    // 2. If batch failed, fall back to row-by-row so one bad row doesn't break others
    console.warn(`[Supabase Sync] Batch upsert to ${table} notice (${error.message}). Saving row-by-row...`);
    let saved = 0;
    let lastErr = error.message;

    for (const r of rows) {
      try {
        const single = await client.from(table).upsert([r], { onConflict: 'id' });
        if (!single.error) {
          saved++;
        } else {
          lastErr = single.error.message;
          console.error(`[Supabase Sync] Row ${r.id} in ${table} error:`, single.error.message);
        }
      } catch (rowErr: any) {
        lastErr = rowErr?.message || String(rowErr);
      }
    }

    return { count: saved, error: saved > 0 ? null : lastErr };
  } catch (err: any) {
    console.error(`[Supabase Sync] Exception on ${table}:`, err);
    return { count: 0, error: String(err) };
  }
};

export const deleteRemote = async (table: string, id: string) => {
  const client = SupabaseService.getClient();
  if (!client) return;
  try {
    const { error } = await client.from(table).delete().eq('id', id);
    if (error) {
      console.warn(`Supabase delete error on ${table}:`, error.message);
    }
  } catch (err) {
    console.warn(`Supabase delete exception on ${table}:`, err);
  }
};

export const saveSingleQuotationRemote = async (q: Quotation, clients: Client[] = []) => {
  const row = toQuotationRow(q, clients);
  return await upsertRemote('quotations', [row]);
};

export const saveSingleInvoiceRemote = async (inv: Invoice, clients: Client[] = []) => {
  const row = toInvoiceRow(inv, clients);
  return await upsertRemote('invoices', [row]);
};

export const saveSingleClientRemote = async (c: Client) => {
  const row = toClientRow(c);
  return await upsertRemote('clients', [row]);
};

export const saveSingleSupplierRemote = async (s: Supplier) => {
  const row = toSupplierRow(s);
  return await upsertRemote('suppliers', [row]);
};

export const saveSingleProjectRemote = async (p: ProjectSchedule, clients: Client[] = []) => {
  const row = toProjectRow(p, clients);
  return await upsertRemote('projects', [row]);
};

export const saveQuotations = (data: Quotation[], clients: Client[] = []) => {
  localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(data));
  upsertRemote('quotations', data.map((q) => toQuotationRow(q, clients)));
};

export const saveInvoices = (data: Invoice[], clients: Client[] = []) => {
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(data));
  upsertRemote('invoices', data.map((i) => toInvoiceRow(i, clients)));
};

export const saveClients = (data: Client[]) => {
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(data));
  upsertRemote('clients', data.map(toClientRow));
};

export const saveSuppliers = (data: Supplier[]) => {
  localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(data));
  upsertRemote('suppliers', data.map(toSupplierRow));
};

export const saveProjects = (data: ProjectSchedule[], clients: Client[] = []) => {
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(data));
  upsertRemote('projects', data.map((p) => toProjectRow(p, clients)));
};

export const saveExpenses = (data: Expense[]) => {
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(data));
  upsertRemote('expenses', data.map(toExpenseRow));
};

export const saveLiabilities = (data: FinancialLiability[]) => {
  localStorage.setItem(STORAGE_KEYS.LIABILITIES, JSON.stringify(data));
  upsertRemote('financial_liabilities', data.map(toLiabilityRow));
};

export const saveNotifications = (data: AppNotification[]) => {
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(data));
};

export const saveAiProspects = (data: AIClientProspect[]) => {
  localStorage.setItem(STORAGE_KEYS.AI_PROSPECTS, JSON.stringify(data));
};

/**
 * Pushes entire local database to Supabase PostgreSQL in one operation.
 */
export const syncAllLocalToSupabase = async (currentData: ReturnType<typeof loadStorageData>) => {
  const client = SupabaseService.getClient();
  if (!client) {
    throw new Error('Supabase client is not configured. Please enter your API key first.');
  }

  const results: Record<string, number> = {};

  if (currentData.clients.length > 0) {
    const { count } = await upsertRemote('clients', currentData.clients.map(toClientRow));
    results.clients = count;
  }
  if (currentData.suppliers.length > 0) {
    const { count } = await upsertRemote('suppliers', currentData.suppliers.map(toSupplierRow));
    results.suppliers = count;
  }
  if (currentData.quotations.length > 0) {
    const { count } = await upsertRemote('quotations', currentData.quotations.map((q) => toQuotationRow(q, currentData.clients)));
    results.quotations = count;
  }
  if (currentData.invoices.length > 0) {
    const { count } = await upsertRemote('invoices', currentData.invoices.map((i) => toInvoiceRow(i, currentData.clients)));
    results.invoices = count;
  }
  if (currentData.projects.length > 0) {
    const { count } = await upsertRemote('projects', currentData.projects.map((p) => toProjectRow(p, currentData.clients)));
    results.projects = count;
  }
  if (currentData.expenses.length > 0) {
    const { count } = await upsertRemote('expenses', currentData.expenses.map(toExpenseRow));
    results.expenses = count;
  }
  if (currentData.liabilities.length > 0) {
    const { count } = await upsertRemote('financial_liabilities', currentData.liabilities.map(toLiabilityRow));
    results.liabilities = count;
  }

  return results;
};
