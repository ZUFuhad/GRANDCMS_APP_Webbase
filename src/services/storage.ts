import {
  Quotation, Invoice, Client, Supplier, ProjectSchedule, Expense,
  FinancialLiability, AppNotification, AIClientProspect,
} from '../types';
import {
  INITIAL_QUOTATIONS, INITIAL_INVOICES, INITIAL_CLIENTS, INITIAL_SUPPLIERS,
  INITIAL_PROJECTS, INITIAL_EXPENSES, INITIAL_LIABILITIES, INITIAL_NOTIFICATIONS,
  INITIAL_AI_PROSPECTS,
} from '../mock/initialData';
import { supabase } from './supabase';

const STORAGE_KEYS = {
  QUOTATIONS: 'grand_cms_quotations', INVOICES: 'grand_cms_invoices',
  CLIENTS: 'grand_cms_clients', SUPPLIERS: 'grand_cms_suppliers',
  PROJECTS: 'grand_cms_projects', EXPENSES: 'grand_cms_expenses',
  LIABILITIES: 'grand_cms_liabilities', NOTIFICATIONS: 'grand_cms_notifications',
  AI_PROSPECTS: 'grand_cms_ai_prospects',
};

const readLocal = (key: string, fallback: any) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const saveLocal = (key: string, value: any) => localStorage.setItem(key, JSON.stringify(value));

const clientIdFor = (name: string, company = '') => {
  const source = (company || name || 'client').trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < source.length; i++) hash = ((hash << 5) - hash + source.charCodeAt(i)) | 0;
  return `client-${Math.abs(hash)}`;
};

const toClientRow = (c: Client) => ({
  id: c.id, name: c.name, company_name: c.companyName, email: c.email || null,
  phone: c.phone || null, address: c.address || null, city: c.city || null,
  contact_person: c.contactPerson || null, designation: c.designation || null,
  total_billed: c.totalBilled || 0, total_paid: c.totalPaid || 0,
  current_due: c.currentDue || 0, status: c.status, created_at: c.createdAt || new Date().toISOString(),
});

const fromClientRow = (r: any): Client => ({
  id: r.id, name: r.name, companyName: r.company_name || '', contactPerson: r.contact_person || '',
  designation: r.designation || '', email: r.email || '', phone: r.phone || '',
  address: r.address || '', city: r.city || '', totalBilled: Number(r.total_billed || 0),
  totalPaid: Number(r.total_paid || 0), currentDue: Number(r.current_due || 0),
  status: r.status === 'inactive' ? 'inactive' : 'active', createdAt: r.created_at || new Date().toISOString(),
});

const toSupplierRow = (s: Supplier) => ({
  id: s.id, name: s.name, company_name: s.name, category: s.serviceCategory || 'General',
  phone: s.phone || null, email: s.email || null, address: s.address || null,
  bank_details: s.bankDetails || null, total_purchased: s.payableAmount || 0,
  total_paid: s.paidAmount || 0, payable_liability: Math.max(0, (s.payableAmount || 0) - (s.paidAmount || 0)),
  status: 'active', created_at: s.createdAt || new Date().toISOString(),
});

const fromSupplierRow = (r: any): Supplier => ({
  id: r.id, name: r.name, serviceCategory: r.category || 'General',
  productsProvided: [], contactPerson: '', phone: r.phone || '', email: r.email || '',
  address: r.address || '', payableAmount: Number(r.total_purchased || 0),
  paidAmount: Number(r.total_paid || 0), bankDetails: r.bank_details || '',
  createdAt: r.created_at || new Date().toISOString(),
});

const toQuotationRow = (q: Quotation, clients: Client[]) => {
  const client = clients.find(c => c.companyName === q.clientCompany || c.name === q.clientName);
  return {
    id: q.id, quotation_number: q.quotationNumber, client_id: client?.id || clientIdFor(q.clientName, q.clientCompany),
    client_name: q.clientName, client_company: q.clientCompany || null, date: q.date,
    validity_date: q.validityDate || null, subject: q.subject, items_json: q.items || [],
    subtotal: q.subtotal || 0, agency_commission_percent: q.agencyCommissionPercent || 0,
    agency_commission_amount: q.agencyCommissionAmount || 0, vat_percent: q.vatPercent || 0,
    vat_amount: q.vatAmount || 0, total: q.total || 0, advance: q.advance || 0,
    due: q.due || 0, nb_text: q.nbText || null, terms_json: q.termsAndConditions || [],
    signatory_name: q.signatoryName || null, signatory_title: q.signatoryTitle || null,
    signatory_phone: q.signatoryPhone || null, status: q.status, created_at: q.createdAt || new Date().toISOString(),
  };
};

const fromQuotationRow = (r: any): Quotation => ({
  id: r.id, quotationNumber: r.quotation_number, date: r.date, validityDate: r.validity_date || '',
  clientName: r.client_name, clientCompany: r.client_company || '', subject: r.subject,
  items: r.items_json || [], subtotal: Number(r.subtotal || 0),
  agencyCommissionPercent: Number(r.agency_commission_percent || 0),
  agencyCommissionAmount: Number(r.agency_commission_amount || 0), vatPercent: Number(r.vat_percent || 0),
  vatAmount: Number(r.vat_amount || 0), total: Number(r.total || 0), advance: Number(r.advance || 0),
  due: Number(r.due || 0), termsAndConditions: r.terms_json || [], nbText: r.nb_text || '',
  signatoryName: r.signatory_name || '', signatoryTitle: r.signatory_title || '',
  signatoryPhone: r.signatory_phone || '', status: r.status || 'Draft',
  createdAt: r.created_at || new Date().toISOString(),
});

const toInvoiceRow = (i: Invoice, clients: Client[]) => {
  const client = clients.find(c => c.companyName === i.clientCompany || c.name === i.clientName);
  return {
    id: i.id, invoice_number: i.invoiceNumber, quotation_id: i.quotationId || null,
    client_id: client?.id || clientIdFor(i.clientName, i.clientCompany), client_name: i.clientName,
    client_company: i.clientCompany || null, date: i.date, due_date: null,
    subject: i.subject, items_json: i.items || [], subtotal: i.subtotal || 0,
    agency_commission_amount: i.agencyCommissionAmount || 0, vat_amount: i.vatAmount || 0,
    total: i.total || 0, advance: i.advance || 0, due: i.due || 0,
    payments_json: i.payments || [], status: i.status, signatory_name: i.signatoryName || null,
    created_at: i.createdAt || new Date().toISOString(),
  };
};

const fromInvoiceRow = (r: any): Invoice => ({
  id: r.id, invoiceNumber: r.invoice_number, quotationId: r.quotation_id || undefined,
  date: r.date, clientName: r.client_name, clientCompany: r.client_company || '',
  subject: r.subject, items: r.items_json || [], subtotal: Number(r.subtotal || 0),
  agencyCommissionPercent: 0, agencyCommissionAmount: Number(r.agency_commission_amount || 0),
  vatPercent: 0, vatAmount: Number(r.vat_amount || 0), total: Number(r.total || 0),
  advance: Number(r.advance || 0), due: Number(r.due || 0), payments: r.payments_json || [],
  termsAndConditions: [], nbText: '', signatoryName: r.signatory_name || '',
  signatoryTitle: '', signatoryPhone: '', status: r.status || 'Unpaid',
  createdAt: r.created_at || new Date().toISOString(),
});

const toProjectRow = (p: ProjectSchedule, clients: Client[]) => {
  const client = clients.find(c => c.companyName === p.clientCompany || c.name === p.clientName);
  return {
    id: p.id, title: p.projectName, client_id: client?.id || clientIdFor(p.clientName, p.clientCompany),
    client_name: p.clientName, quotation_id: p.quotationId || null, invoice_id: null,
    event_date: p.eventDate || '', print_clearance_deadline: p.setupDate || '',
    installation_deadline: p.setupDate || '', status: p.status, priority: 'Normal',
    location: p.venue || null, assigned_team_json: p.assignedTeam || [],
    progress_percent: p.status === 'Completed' ? 100 : 0, created_at: p.createdAt || new Date().toISOString(),
  };
};

const fromProjectRow = (r: any): ProjectSchedule => ({
  id: r.id, quotationId: r.quotation_id || undefined, quotationNumber: '',
  projectName: r.title, clientName: r.client_name, clientCompany: '',
  venue: r.location || '', eventDate: r.event_date || '', setupDate: r.installation_deadline || '',
  status: r.status || 'Upcoming', assignedTeam: r.assigned_team_json || [],
  checklist: [], workItems: [], instructions: '', createdAt: r.created_at || '',
});

const toExpenseRow = (e: Expense) => ({
  id: e.id, date: e.date, title: e.description, category: e.category,
  project_id: e.projectId || null, supplier_id: null, supplier_name: e.paidTo || null,
  amount: e.amount || 0, is_paid: true, due_date: null, payment_method: e.paymentMethod || null,
});

const fromExpenseRow = (r: any): Expense => ({
  id: r.id, projectId: r.project_id || undefined, quotationId: undefined,
  expenseType: r.category === 'Office Rent' || r.category === 'Salary' || r.category === 'Utilities' ? 'Office' : 'Project',
  date: r.date, category: r.category, description: r.title, amount: Number(r.amount || 0),
  paidTo: r.supplier_name || '', paymentMethod: r.payment_method || '',
});

const toLiabilityRow = (l: FinancialLiability) => ({
  id: l.id, supplier_id: l.creditor || l.id, supplier_name: l.creditor || l.title,
  category: l.title, total_amount: l.totalAmount || 0, paid_amount: l.paidAmount || 0,
  remaining_liability: Math.max(0, (l.totalAmount || 0) - (l.paidAmount || 0)),
  due_date: l.dueDate || null, status: l.status, notes: l.notes || null,
});

const fromLiabilityRow = (r: any): FinancialLiability => ({
  id: r.id, title: r.category || '', creditor: r.supplier_name || '', totalAmount: Number(r.total_amount || 0),
  paidAmount: Number(r.paid_amount || 0), dueDate: r.due_date || '', status: r.status || 'Pending', notes: r.notes || '',
});

export const loadStorageData = () => ({
  quotations: readLocal(STORAGE_KEYS.QUOTATIONS, INITIAL_QUOTATIONS),
  invoices: readLocal(STORAGE_KEYS.INVOICES, INITIAL_INVOICES),
  clients: readLocal(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS),
  suppliers: readLocal(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS),
  projects: readLocal(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS),
  expenses: readLocal(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES),
  liabilities: readLocal(STORAGE_KEYS.LIABILITIES, INITIAL_LIABILITIES),
  notifications: readLocal(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS),
  aiProspects: readLocal(STORAGE_KEYS.AI_PROSPECTS, INITIAL_AI_PROSPECTS),
});

export const hydrateStorageData = async () => {
  const local = loadStorageData();
  if (!supabase) return local;
  try {
    const results = await Promise.all([
      supabase.from('clients').select('*').order('created_at', { ascending: true }),
      supabase.from('suppliers').select('*').order('created_at', { ascending: true }),
      supabase.from('quotations').select('*').order('created_at', { ascending: false }),
      supabase.from('invoices').select('*').order('created_at', { ascending: false }),
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('expenses').select('*').order('date', { ascending: false }),
      supabase.from('financial_liabilities').select('*').order('due_date', { ascending: true }),
    ]);
    if (results.some(r => r.error)) throw results.find(r => r.error)?.error;
    const data = {
      clients: results[0].data?.map(fromClientRow) || [],
      suppliers: results[1].data?.map(fromSupplierRow) || [],
      quotations: results[2].data?.map(fromQuotationRow) || [],
      invoices: results[3].data?.map(fromInvoiceRow) || [],
      projects: results[4].data?.map(fromProjectRow) || [],
      expenses: results[5].data?.map(fromExpenseRow) || [],
      liabilities: results[6].data?.map(fromLiabilityRow) || [],
      notifications: local.notifications,
      aiProspects: local.aiProspects,
    };
    saveLocal(STORAGE_KEYS.CLIENTS, data.clients);
    saveLocal(STORAGE_KEYS.SUPPLIERS, data.suppliers);
    saveLocal(STORAGE_KEYS.QUOTATIONS, data.quotations);
    saveLocal(STORAGE_KEYS.INVOICES, data.invoices);
    saveLocal(STORAGE_KEYS.PROJECTS, data.projects);
    saveLocal(STORAGE_KEYS.EXPENSES, data.expenses);
    saveLocal(STORAGE_KEYS.LIABILITIES, data.liabilities);
    return data;
  } catch (error) {
    console.error('Supabase hydration failed; using local cache.', error);
    return local;
  }
};

const upsert = async (table: string, rows: any[]) => {
  if (rows.length === 0) return { count: 0 };
  if (!supabase) throw new Error('Supabase is not configured in this deployed build. Check VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
  const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' });
  if (error) throw new Error(`Supabase ${table} sync failed: ${error.message}`);
  return { count: rows.length };
};

export const saveQuotations = async (data: Quotation[], clients: Client[] = []) => { saveLocal(STORAGE_KEYS.QUOTATIONS, data); await upsert('quotations', data.map(q => toQuotationRow(q, clients))); };

export const saveQuotation = async (quotation: Quotation, clients: Client[] = []) => {
  const current = readLocal(STORAGE_KEYS.QUOTATIONS, []) as Quotation[];
  const exists = current.some(item => item.id === quotation.id);
  saveLocal(STORAGE_KEYS.QUOTATIONS, exists
    ? current.map(item => item.id === quotation.id ? quotation : item)
    : [quotation, ...current]);

  if (!supabase) {
    throw new Error('Supabase is not configured in this deployed build. Check VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
  }

  const { data, error } = await supabase
    .from('quotations')
    .upsert(toQuotationRow(quotation, clients), { onConflict: 'id' })
    .select('id,quotation_number,client_id,total,status,created_at')
    .single();

  if (error) throw new Error(`Supabase quotations save failed: ${error.message}`);
  if (!data) throw new Error('Supabase quotations save returned no record.');
  return data;
};

export const verifyQuotationCloudRecord = async (id: string) => {
  if (!supabase) throw new Error('Supabase is not configured in this deployed build.');
  const { data, error } = await supabase.from('quotations').select('id,quotation_number,client_id,total,status,created_at').eq('id', id).maybeSingle();
  if (error) throw new Error(`Supabase quotations verification failed: ${error.message}`);
  if (!data) throw new Error('Supabase accepted the save call but the quotation record could not be read back.');
  return data;
};
export const saveInvoices = async (data: Invoice[], clients: Client[] = []) => { saveLocal(STORAGE_KEYS.INVOICES, data); await upsert('invoices', data.map(i => toInvoiceRow(i, clients))); };
export const saveClients = async (data: Client[]) => {
  saveLocal(STORAGE_KEYS.CLIENTS, data);
  return upsert('clients', data.map(toClientRow));
};

export const saveClient = async (client: Client) => {
  const current = readLocal(STORAGE_KEYS.CLIENTS, []) as Client[];
  const exists = current.some(item => item.id === client.id);
  const nextLocal = exists
    ? current.map(item => item.id === client.id ? client : item)
    : [client, ...current];
  saveLocal(STORAGE_KEYS.CLIENTS, nextLocal);

  if (!supabase) {
    throw new Error('Supabase is not configured in this deployed build. Check VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
  }

  const row = toClientRow(client);
  const { data, error } = await supabase
    .from('clients')
    .upsert(row, { onConflict: 'id' })
    .select('id,company_name,contact_person,phone,email')
    .single();

  if (error) throw new Error(`Supabase clients save failed: ${error.message}`);
  if (!data) throw new Error('Supabase clients save returned no record.');

  return data;
};

export const verifyClientCloudRecord = async (id: string) => {
  if (!supabase) throw new Error('Supabase is not configured in this deployed build.');
  const { data, error } = await supabase.from('clients').select('id,company_name,contact_person,phone,email').eq('id', id).maybeSingle();
  if (error) throw new Error(`Supabase clients verification failed: ${error.message}`);
  if (!data) throw new Error('Supabase accepted the save call but the client record could not be read back.');
  return data;
};
export const saveSuppliers = async (data: Supplier[]) => {
  saveLocal(STORAGE_KEYS.SUPPLIERS, data);
  return upsert('suppliers', data.map(toSupplierRow));
};

export const verifySupplierCloudRecord = async (id: string) => {
  if (!supabase) throw new Error('Supabase is not configured in this deployed build.');
  const { data, error } = await supabase.from('suppliers').select('id,name,company_name,phone,email').eq('id', id).maybeSingle();
  if (error) throw new Error(`Supabase suppliers verification failed: ${error.message}`);
  if (!data) throw new Error('Supabase accepted the supplier save call but the supplier record could not be read back.');
  return data;
};
export const saveProjects = async (data: ProjectSchedule[], clients: Client[] = []) => { saveLocal(STORAGE_KEYS.PROJECTS, data); await upsert('projects', data.map(p => toProjectRow(p, clients))); };
export const saveExpenses = async (data: Expense[]) => { saveLocal(STORAGE_KEYS.EXPENSES, data); await upsert('expenses', data.map(toExpenseRow)); };
export const saveLiabilities = async (data: FinancialLiability[]) => { saveLocal(STORAGE_KEYS.LIABILITIES, data); await upsert('financial_liabilities', data.map(toLiabilityRow)); };
export const saveNotifications = (data: AppNotification[]) => saveLocal(STORAGE_KEYS.NOTIFICATIONS, data);
export const saveAiProspects = (data: AIClientProspect[]) => saveLocal(STORAGE_KEYS.AI_PROSPECTS, data);

export const deleteRemote = async (table: string, id: string) => {
  if (!supabase) return;
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw new Error(`Supabase ${table} delete failed: ${error.message}`);
};

export class StorageService {
  static generateCloudflareD1Sql(): string {
    return `-- GRAND CMS Cloudflare D1 schema export
-- Primary production persistence is Supabase PostgreSQL.
-- This export is intentionally minimal and safe to regenerate.
CREATE TABLE IF NOT EXISTS grand_cms_meta (
  key TEXT PRIMARY KEY,
  value TEXT
);
`;
  }
}
