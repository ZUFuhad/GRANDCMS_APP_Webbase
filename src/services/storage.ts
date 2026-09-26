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

const STORAGE_KEYS = {
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

export const loadStorageData = () => {
  try {
    const q = localStorage.getItem(STORAGE_KEYS.QUOTATIONS);
    const inv = localStorage.getItem(STORAGE_KEYS.INVOICES);
    const cli = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    const sup = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    const proj = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    const exp = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    const liab = localStorage.getItem(STORAGE_KEYS.LIABILITIES);
    const notif = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const prosp = localStorage.getItem(STORAGE_KEYS.AI_PROSPECTS);

    const storedSuppliers: Supplier[] = sup ? JSON.parse(sup) : [];
    const mergedSuppliers = [...storedSuppliers];
    INITIAL_SUPPLIERS.forEach((initSup) => {
      if (!mergedSuppliers.some((s) => s.id === initSup.id || s.name.toLowerCase() === initSup.name.toLowerCase())) {
        mergedSuppliers.push(initSup);
      }
    });

    return {
      quotations: q ? JSON.parse(q) : INITIAL_QUOTATIONS,
      invoices: inv ? JSON.parse(inv) : INITIAL_INVOICES,
      clients: cli ? JSON.parse(cli) : INITIAL_CLIENTS,
      suppliers: mergedSuppliers.length > 0 ? mergedSuppliers : INITIAL_SUPPLIERS,
      projects: proj ? JSON.parse(proj) : INITIAL_PROJECTS,
      expenses: exp ? JSON.parse(exp) : INITIAL_EXPENSES,
      liabilities: liab ? JSON.parse(liab) : INITIAL_LIABILITIES,
      notifications: notif ? JSON.parse(notif) : INITIAL_NOTIFICATIONS,
      aiProspects: prosp
        ? JSON.parse(prosp).map((p: any, idx: number) => ({
            ...p,
            mobileNumber: p.mobileNumber || (idx === 0 ? '01711-884920' : idx === 1 ? '01819-335128' : '01914-772391'),
            contactPerson: p.contactPerson || 'Contact Person',
            priority: p.priority || 'High',
            triggerEvent: p.triggerEvent || 'Direct Market Lead',
          }))
        : INITIAL_AI_PROSPECTS,
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

export const saveQuotations = (data: Quotation[]) => localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(data));
export const saveInvoices = (data: Invoice[]) => localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(data));
export const saveClients = (data: Client[]) => localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(data));
export const saveSuppliers = (data: Supplier[]) => localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(data));
export const saveProjects = (data: ProjectSchedule[]) => localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(data));
export const saveExpenses = (data: Expense[]) => localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(data));
export const saveLiabilities = (data: FinancialLiability[]) => localStorage.setItem(STORAGE_KEYS.LIABILITIES, JSON.stringify(data));
export const saveNotifications = (data: AppNotification[]) => localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(data));
export const saveAiProspects = (data: AIClientProspect[]) => localStorage.setItem(STORAGE_KEYS.AI_PROSPECTS, JSON.stringify(data));
