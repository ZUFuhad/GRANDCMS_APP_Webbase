import {
  Client,
  Supplier,
  Quotation,
  Invoice,
  ProjectSchedule,
  Expense,
  FinancialLiability,
  AppNotification,
  AIClientProspect,
  UserSession,
} from '../types';
import {
  INITIAL_CLIENTS,
  INITIAL_SUPPLIERS,
  INITIAL_QUOTATIONS,
  INITIAL_INVOICES,
  INITIAL_PROJECTS,
  INITIAL_EXPENSES,
  INITIAL_LIABILITIES,
  INITIAL_NOTIFICATIONS,
  INITIAL_PROSPECTS,
  DEFAULT_USER,
} from '../mock/initialData';

const STORAGE_KEYS = {
  CLIENTS: 'grand_cms_clients_v1',
  SUPPLIERS: 'grand_cms_suppliers_v1',
  QUOTATIONS: 'grand_cms_quotations_v1',
  INVOICES: 'grand_cms_invoices_v1',
  PROJECTS: 'grand_cms_projects_v1',
  EXPENSES: 'grand_cms_expenses_v1',
  LIABILITIES: 'grand_cms_liabilities_v1',
  NOTIFICATIONS: 'grand_cms_notifications_v1',
  PROSPECTS: 'grand_cms_prospects_v1',
  USER: 'grand_cms_user_v1',
  IS_LOGGED_IN: 'grand_cms_auth_status_v1',
};

class StorageServiceEngine {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch (e) {
      console.error(`Error reading ${key} from localStorage:`, e);
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing ${key} to localStorage:`, e);
    }
  }

  // Auth & Session
  getUser(): UserSession {
    return this.get<UserSession>(STORAGE_KEYS.USER, DEFAULT_USER);
  }

  setUser(user: UserSession): void {
    this.set(STORAGE_KEYS.USER, user);
  }

  getUserSession(): UserSession | null {
    const isLoggedIn = this.isLoggedIn();
    if (!isLoggedIn) return null;
    return this.getUser();
  }

  saveUserSession(user: UserSession): void {
    this.setUser(user);
    this.setLoggedIn(true);
  }

  clearUserSession(): void {
    this.setLoggedIn(false);
  }

  isLoggedIn(): boolean {
    return this.get<boolean>(STORAGE_KEYS.IS_LOGGED_IN, true);
  }

  setLoggedIn(status: boolean): void {
    this.set(STORAGE_KEYS.IS_LOGGED_IN, status);
  }

  // Clients
  getClients(): Client[] {
    return this.get<Client[]>(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
  }

  saveClients(clients: Client[]): void {
    this.set(STORAGE_KEYS.CLIENTS, clients);
  }

  saveClient(client: Client): Client[] {
    const clients = this.getClients();
    const index = clients.findIndex((c) => c.id === client.id);
    let updated: Client[];
    if (index >= 0) {
      updated = [...clients];
      updated[index] = client;
    } else {
      updated = [client, ...clients];
    }
    this.saveClients(updated);
    return updated;
  }

  deleteClient(id: string): Client[] {
    const updated = this.getClients().filter((c) => c.id !== id);
    this.saveClients(updated);
    return updated;
  }

  // Suppliers
  getSuppliers(): Supplier[] {
    return this.get<Supplier[]>(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
  }

  saveSuppliers(suppliers: Supplier[]): void {
    this.set(STORAGE_KEYS.SUPPLIERS, suppliers);
  }

  saveSupplier(supplier: Supplier): Supplier[] {
    const suppliers = this.getSuppliers();
    const index = suppliers.findIndex((s) => s.id === supplier.id);
    let updated: Supplier[];
    if (index >= 0) {
      updated = [...suppliers];
      updated[index] = supplier;
    } else {
      updated = [supplier, ...suppliers];
    }
    this.saveSuppliers(updated);
    return updated;
  }

  // Quotations
  getQuotations(): Quotation[] {
    return this.get<Quotation[]>(STORAGE_KEYS.QUOTATIONS, INITIAL_QUOTATIONS);
  }

  saveQuotations(quotations: Quotation[]): void {
    this.set(STORAGE_KEYS.QUOTATIONS, quotations);
  }

  saveQuotation(quotation: Quotation): Quotation[] {
    const quotations = this.getQuotations();
    const index = quotations.findIndex((q) => q.id === quotation.id);
    let updated: Quotation[];
    if (index >= 0) {
      updated = [...quotations];
      updated[index] = quotation;
    } else {
      updated = [quotation, ...quotations];
    }
    this.saveQuotations(updated);
    return updated;
  }

  deleteQuotation(id: string): Quotation[] {
    const updated = this.getQuotations().filter((q) => q.id !== id);
    this.saveQuotations(updated);
    return updated;
  }

  // Invoices
  getInvoices(): Invoice[] {
    return this.get<Invoice[]>(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
  }

  saveInvoices(invoices: Invoice[]): void {
    this.set(STORAGE_KEYS.INVOICES, invoices);
  }

  saveInvoice(invoice: Invoice): Invoice[] {
    const invoices = this.getInvoices();
    const index = invoices.findIndex((i) => i.id === invoice.id);
    let updated: Invoice[];
    if (index >= 0) {
      updated = [...invoices];
      updated[index] = invoice;
    } else {
      updated = [invoice, ...invoices];
    }
    this.saveInvoices(updated);

    // Sync client balance automatically
    const clients = this.getClients();
    const clientIndex = clients.findIndex((c) => c.id === invoice.clientId);
    if (clientIndex >= 0) {
      const clientInvoices = updated.filter((inv) => inv.clientId === invoice.clientId);
      const totalBilled = clientInvoices.reduce((sum, inv) => sum + inv.total, 0);
      const totalPaid = clientInvoices.reduce((sum, inv) => {
        const paySum = inv.payments?.reduce((pSum, p) => pSum + p.amount, 0) || inv.advance || 0;
        return sum + paySum;
      }, 0);
      clients[clientIndex].totalBilled = totalBilled;
      clients[clientIndex].totalPaid = totalPaid;
      clients[clientIndex].currentDue = Math.max(0, totalBilled - totalPaid);
      this.saveClients(clients);
    }

    return updated;
  }

  deleteInvoice(id: string): Invoice[] {
    const updated = this.getInvoices().filter((i) => i.id !== id);
    this.saveInvoices(updated);
    return updated;
  }

  // Projects
  getProjects(): ProjectSchedule[] {
    return this.get<ProjectSchedule[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  }

  saveProjects(projects: ProjectSchedule[]): void {
    this.set(STORAGE_KEYS.PROJECTS, projects);
  }

  saveProject(project: ProjectSchedule): ProjectSchedule[] {
    const projects = this.getProjects();
    const index = projects.findIndex((p) => p.id === project.id);
    let updated: ProjectSchedule[];
    if (index >= 0) {
      updated = [...projects];
      updated[index] = project;
    } else {
      updated = [project, ...projects];
    }
    this.saveProjects(updated);
    return updated;
  }

  deleteExpense(id: string): Expense[] {
    const updated = this.getExpenses().filter((e) => e.id !== id);
    this.saveExpenses(updated);
    return updated;
  }

  // Expenses & Financial Liabilities
  getExpenses(): Expense[] {
    return this.get<Expense[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
  }

  saveExpenses(expenses: Expense[]): void {
    this.set(STORAGE_KEYS.EXPENSES, expenses);
  }

  saveExpense(expense: Expense): Expense[] {
    const expenses = this.getExpenses();
    const index = expenses.findIndex((e) => e.id === expense.id);
    let updated: Expense[];
    if (index >= 0) {
      updated = [...expenses];
      updated[index] = expense;
    } else {
      updated = [expense, ...expenses];
    }
    this.saveExpenses(updated);

    // If unpaid with supplier, sync supplier liability
    if (!expense.isPaid && expense.supplierId) {
      const suppliers = this.getSuppliers();
      const sIdx = suppliers.findIndex((s) => s.id === expense.supplierId);
      if (sIdx >= 0) {
        suppliers[sIdx].payableLiability = (suppliers[sIdx].payableLiability || 0) + expense.amount;
        suppliers[sIdx].totalPurchased = (suppliers[sIdx].totalPurchased || 0) + expense.amount;
        this.saveSuppliers(suppliers);
      }

      // Add to liabilities
      const liabilities = this.getLiabilities();
      const existingL = liabilities.find((l) => l.supplierId === expense.supplierId && l.status === 'Upcoming');
      if (existingL) {
        existingL.totalAmount += expense.amount;
        existingL.remainingLiability += expense.amount;
        this.saveLiabilities(liabilities);
      } else {
        const newL: FinancialLiability = {
          id: `liab-${Date.now()}`,
          supplierId: expense.supplierId,
          supplierName: expense.supplierName || 'Vendor',
          category: expense.category,
          totalAmount: expense.amount,
          paidAmount: 0,
          remainingLiability: expense.amount,
          dueDate: expense.dueDate || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
          status: 'Upcoming',
          notes: expense.title,
        };
        this.saveLiabilities([newL, ...liabilities]);
      }
    }

    return updated;
  }

  getLiabilities(): FinancialLiability[] {
    return this.get<FinancialLiability[]>(STORAGE_KEYS.LIABILITIES, INITIAL_LIABILITIES);
  }

  saveLiabilities(liabilities: FinancialLiability[]): void {
    this.set(STORAGE_KEYS.LIABILITIES, liabilities);
  }

  payLiability(liabilityId: string, payAmount: number): FinancialLiability[] {
    const liabilities = this.getLiabilities();
    const idx = liabilities.findIndex((l) => l.id === liabilityId);
    if (idx >= 0) {
      const item = liabilities[idx];
      item.paidAmount += payAmount;
      item.remainingLiability = Math.max(0, item.totalAmount - item.paidAmount);
      if (item.remainingLiability === 0) {
        item.status = 'Cleared';
      }
      this.saveLiabilities(liabilities);

      // Update supplier liability
      const suppliers = this.getSuppliers();
      const sIdx = suppliers.findIndex((s) => s.id === item.supplierId);
      if (sIdx >= 0) {
        suppliers[sIdx].totalPaid += payAmount;
        suppliers[sIdx].payableLiability = Math.max(0, suppliers[sIdx].payableLiability - payAmount);
        this.saveSuppliers(suppliers);
      }
    }
    return this.getLiabilities();
  }

  // Notifications
  getNotifications(): AppNotification[] {
    return this.get<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }

  saveNotifications(notifications: AppNotification[]): void {
    this.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }

  addNotification(notification: AppNotification): AppNotification[] {
    const list = [notification, ...this.getNotifications()];
    this.saveNotifications(list);
    return list;
  }

  markAllNotificationsRead(): AppNotification[] {
    const updated = this.getNotifications().map((n) => ({ ...n, isRead: true }));
    this.saveNotifications(updated);
    return updated;
  }

  // AI Prospects
  getProspects(): AIClientProspect[] {
    return this.get<AIClientProspect[]>(STORAGE_KEYS.PROSPECTS, INITIAL_PROSPECTS);
  }

  saveProspects(prospects: AIClientProspect[]): void {
    this.set(STORAGE_KEYS.PROSPECTS, prospects);
  }

  addProspect(prospect: AIClientProspect): AIClientProspect[] {
    const list = [prospect, ...this.getProspects()];
    this.saveProspects(list);
    return list;
  }

  // Cloudflare D1 SQL Schema & Data Generator
  generateCloudflareD1Sql(): string {
    const clients = this.getClients();
    const suppliers = this.getSuppliers();
    const quotations = this.getQuotations();
    const invoices = this.getInvoices();
    const projects = this.getProjects();
    const expenses = this.getExpenses();
    const liabilities = this.getLiabilities();

    let sql = `-- ==================================================================\n`;
    sql += `-- GRAND CMS - Cloudflare D1 Database Schema & Data Dump\n`;
    sql += `-- Generated on: ${new Date().toISOString()}\n`;
    sql += `-- Agency: GRAND Communication & Marketing (EST. 2004)\n`;
    sql += `-- Address: 20 No Shop CDA Market, Kazir Dewri, Chattogram\n`;
    sql += `-- ==================================================================\n\n`;

    sql += `-- 1. Clients Table\n`;
    sql += `CREATE TABLE IF NOT EXISTS clients (\n`;
    sql += `  id TEXT PRIMARY KEY,\n`;
    sql += `  name TEXT NOT NULL,\n`;
    sql += `  company_name TEXT NOT NULL,\n`;
    sql += `  email TEXT,\n`;
    sql += `  phone TEXT,\n`;
    sql += `  address TEXT,\n`;
    sql += `  city TEXT,\n`;
    sql += `  contact_person TEXT,\n`;
    sql += `  designation TEXT,\n`;
    sql += `  total_billed REAL DEFAULT 0,\n`;
    sql += `  total_paid REAL DEFAULT 0,\n`;
    sql += `  current_due REAL DEFAULT 0,\n`;
    sql += `  status TEXT DEFAULT 'active',\n`;
    sql += `  created_at TEXT\n`;
    sql += `);\n\n`;

    clients.forEach((c) => {
      sql += `INSERT OR REPLACE INTO clients (id, name, company_name, email, phone, address, city, contact_person, designation, total_billed, total_paid, current_due, status, created_at) VALUES (\n`;
      sql += `  '${c.id}', '${c.name.replace(/'/g, "''")}', '${c.companyName.replace(/'/g, "''")}', '${c.email}', '${c.phone}', '${c.address.replace(/'/g, "''")}', '${c.city}', '${c.contactPerson.replace(/'/g, "''")}', '${c.designation || ''}', ${c.totalBilled}, ${c.totalPaid}, ${c.currentDue}, '${c.status}', '${c.createdAt}'\n`;
      sql += `);\n`;
    });

    sql += `\n-- 2. Suppliers Table\n`;
    sql += `CREATE TABLE IF NOT EXISTS suppliers (\n`;
    sql += `  id TEXT PRIMARY KEY,\n`;
    sql += `  name TEXT NOT NULL,\n`;
    sql += `  company_name TEXT NOT NULL,\n`;
    sql += `  category TEXT NOT NULL,\n`;
    sql += `  phone TEXT,\n`;
    sql += `  email TEXT,\n`;
    sql += `  address TEXT,\n`;
    sql += `  total_purchased REAL DEFAULT 0,\n`;
    sql += `  total_paid REAL DEFAULT 0,\n`;
    sql += `  payable_liability REAL DEFAULT 0,\n`;
    sql += `  credit_term_days INTEGER DEFAULT 30,\n`;
    sql += `  status TEXT DEFAULT 'active'\n`;
    sql += `);\n\n`;

    suppliers.forEach((s) => {
      sql += `INSERT OR REPLACE INTO suppliers (id, name, company_name, category, phone, email, address, total_purchased, total_paid, payable_liability, credit_term_days, status) VALUES (\n`;
      sql += `  '${s.id}', '${s.name.replace(/'/g, "''")}', '${s.companyName.replace(/'/g, "''")}', '${s.category}', '${s.phone}', '${s.email}', '${s.address.replace(/'/g, "''")}', ${s.totalPurchased}, ${s.totalPaid}, ${s.payableLiability}, ${s.creditTermDays}, '${s.status}'\n`;
      sql += `);\n`;
    });

    sql += `\n-- 3. Quotations Table\n`;
    sql += `CREATE TABLE IF NOT EXISTS quotations (\n`;
    sql += `  id TEXT PRIMARY KEY,\n`;
    sql += `  quotation_number TEXT UNIQUE NOT NULL,\n`;
    sql += `  client_id TEXT NOT NULL,\n`;
    sql += `  client_name TEXT NOT NULL,\n`;
    sql += `  date TEXT NOT NULL,\n`;
    sql += `  validity_date TEXT,\n`;
    sql += `  subject TEXT NOT NULL,\n`;
    sql += `  items_json TEXT NOT NULL,\n`;
    sql += `  subtotal REAL NOT NULL,\n`;
    sql += `  agency_commission_percent REAL DEFAULT 10,\n`;
    sql += `  agency_commission_amount REAL DEFAULT 0,\n`;
    sql += `  vat_percent REAL DEFAULT 0,\n`;
    sql += `  vat_amount REAL DEFAULT 0,\n`;
    sql += `  total REAL NOT NULL,\n`;
    sql += `  advance REAL DEFAULT 0,\n`;
    sql += `  due REAL NOT NULL,\n`;
    sql += `  signatory_name TEXT,\n`;
    sql += `  status TEXT DEFAULT 'Draft'\n`;
    sql += `);\n\n`;

    quotations.forEach((q) => {
      const itemsStr = JSON.stringify(q.items).replace(/'/g, "''");
      sql += `INSERT OR REPLACE INTO quotations (id, quotation_number, client_id, client_name, date, validity_date, subject, items_json, subtotal, agency_commission_percent, agency_commission_amount, vat_percent, vat_amount, total, advance, due, signatory_name, status) VALUES (\n`;
      sql += `  '${q.id}', '${q.quotationNumber}', '${q.clientId}', '${q.clientName.replace(/'/g, "''")}', '${q.date}', '${q.validityDate}', '${q.subject.replace(/'/g, "''")}', '${itemsStr}', ${q.subtotal}, ${q.agencyCommissionPercent}, ${q.agencyCommissionAmount}, ${q.vatPercent}, ${q.vatAmount}, ${q.total}, ${q.advance}, ${q.due}, '${q.signatoryName}', '${q.status}'\n`;
      sql += `);\n`;
    });

    sql += `\n-- 4. Financial Liabilities Table\n`;
    sql += `CREATE TABLE IF NOT EXISTS financial_liabilities (\n`;
    sql += `  id TEXT PRIMARY KEY,\n`;
    sql += `  supplier_id TEXT NOT NULL,\n`;
    sql += `  supplier_name TEXT NOT NULL,\n`;
    sql += `  category TEXT NOT NULL,\n`;
    sql += `  total_amount REAL NOT NULL,\n`;
    sql += `  paid_amount REAL DEFAULT 0,\n`;
    sql += `  remaining_liability REAL NOT NULL,\n`;
    sql += `  due_date TEXT,\n`;
    sql += `  status TEXT DEFAULT 'Upcoming'\n`;
    sql += `);\n\n`;

    liabilities.forEach((l) => {
      sql += `INSERT OR REPLACE INTO financial_liabilities (id, supplier_id, supplier_name, category, total_amount, paid_amount, remaining_liability, due_date, status) VALUES (\n`;
      sql += `  '${l.id}', '${l.supplierId}', '${l.supplierName.replace(/'/g, "''")}', '${l.category}', ${l.totalAmount}, ${l.paidAmount}, ${l.remainingLiability}, '${l.dueDate}', '${l.status}'\n`;
      sql += `);\n`;
    });

    return sql;
  }

  // Backup & Restore
  exportAllDataJson(): string {
    const data = {
      clients: this.getClients(),
      suppliers: this.getSuppliers(),
      quotations: this.getQuotations(),
      invoices: this.getInvoices(),
      projects: this.getProjects(),
      expenses: this.getExpenses(),
      liabilities: this.getLiabilities(),
      prospects: this.getProspects(),
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    return JSON.stringify(data, null, 2);
  }

  resetToDefault(): void {
    localStorage.clear();
    this.saveClients(INITIAL_CLIENTS);
    this.saveSuppliers(INITIAL_SUPPLIERS);
    this.saveQuotations(INITIAL_QUOTATIONS);
    this.saveInvoices(INITIAL_INVOICES);
    this.saveProjects(INITIAL_PROJECTS);
    this.saveExpenses(INITIAL_EXPENSES);
    this.saveLiabilities(INITIAL_LIABILITIES);
    this.saveNotifications(INITIAL_NOTIFICATIONS);
    this.saveProspects(INITIAL_PROSPECTS);
    this.setUser(DEFAULT_USER);
    this.setLoggedIn(true);
  }
}

const storageInstance = new StorageServiceEngine();
export const StorageService = storageInstance;
export const storage = storageInstance;
export default storageInstance;
