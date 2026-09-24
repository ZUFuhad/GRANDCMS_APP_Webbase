-- ==========================================================
-- GRAND CMS - Cloudflare D1 Database Schema & Seed Data
-- Agency: GRAND Communication & Marketing (EST. 2004)
-- Address: 20 No Shop CDA Market, Kazir Dewri, Chattogram
-- Phone: +88 01819 312820 | grandecmm@gmail.com
-- ==========================================================

-- 1. Clients Table
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  contact_person TEXT,
  designation TEXT,
  trade_license TEXT,
  total_billed REAL DEFAULT 0,
  total_paid REAL DEFAULT 0,
  current_due REAL DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TEXT
);

-- 2. Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  category TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  bank_details TEXT,
  total_purchased REAL DEFAULT 0,
  total_paid REAL DEFAULT 0,
  payable_liability REAL DEFAULT 0,
  credit_term_days INTEGER DEFAULT 30,
  status TEXT DEFAULT 'active',
  created_at TEXT
);

-- 3. Quotations Table
CREATE TABLE IF NOT EXISTS quotations (
  id TEXT PRIMARY KEY,
  quotation_number TEXT UNIQUE NOT NULL,
  client_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_company TEXT,
  date TEXT NOT NULL,
  validity_date TEXT,
  subject TEXT NOT NULL,
  items_json TEXT NOT NULL,
  subtotal REAL NOT NULL,
  agency_commission_percent REAL DEFAULT 10,
  agency_commission_amount REAL DEFAULT 0,
  vat_percent REAL DEFAULT 0,
  vat_amount REAL DEFAULT 0,
  total REAL NOT NULL,
  advance REAL DEFAULT 0,
  due REAL NOT NULL,
  nb_text TEXT,
  terms_json TEXT,
  signatory_name TEXT,
  signatory_title TEXT,
  signatory_phone TEXT,
  status TEXT DEFAULT 'Draft',
  created_at TEXT
);

-- 4. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  quotation_id TEXT,
  client_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_company TEXT,
  date TEXT NOT NULL,
  due_date TEXT,
  subject TEXT NOT NULL,
  items_json TEXT NOT NULL,
  subtotal REAL NOT NULL,
  agency_commission_amount REAL DEFAULT 0,
  vat_amount REAL DEFAULT 0,
  total REAL NOT NULL,
  advance REAL DEFAULT 0,
  due REAL NOT NULL,
  payments_json TEXT,
  status TEXT DEFAULT 'Due',
  signatory_name TEXT,
  created_at TEXT
);

-- 5. Projects & Scheduling Table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  client_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  quotation_id TEXT,
  invoice_id TEXT,
  event_date TEXT NOT NULL,
  print_clearance_deadline TEXT NOT NULL,
  installation_deadline TEXT NOT NULL,
  status TEXT DEFAULT 'Planning',
  priority TEXT DEFAULT 'Medium',
  location TEXT,
  assigned_team_json TEXT,
  progress_percent INTEGER DEFAULT 0,
  created_at TEXT
);

-- 6. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  project_id TEXT,
  supplier_id TEXT,
  supplier_name TEXT,
  amount REAL NOT NULL,
  is_paid INTEGER DEFAULT 1,
  due_date TEXT,
  payment_method TEXT,
  recorded_by TEXT,
  receipt_number TEXT
);

-- 7. Financial Liabilities Table
CREATE TABLE IF NOT EXISTS financial_liabilities (
  id TEXT PRIMARY KEY,
  supplier_id TEXT NOT NULL,
  supplier_name TEXT NOT NULL,
  category TEXT NOT NULL,
  total_amount REAL NOT NULL,
  paid_amount REAL DEFAULT 0,
  remaining_liability REAL NOT NULL,
  due_date TEXT,
  status TEXT DEFAULT 'Upcoming',
  notes TEXT
);

-- Initial Seed Data
INSERT OR REPLACE INTO clients (id, name, company_name, email, phone, address, city, contact_person, designation, total_billed, total_paid, current_due, status, created_at) VALUES 
('cli-whiz', 'Whiz Communication', 'Whiz Communication Ltd.', 'events@whizcomm.com.bd', '+880 1711 987654', 'Finlay Square, 6th Floor, GEC Circle', 'Chattogram', 'Tanvir Hossain', 'Head of Brand Operations', 178200, 80000, 98200, 'active', '2026-01-05'),
('cli-apex', 'Apex Footwear Chittagong', 'Apex Holdings Ltd.', 'ctg.retail@apexfootwear.com', '+880 1819 445566', 'Agrabad Commercial Area', 'Chattogram', 'Zakir Ahmed', 'Regional Retail Coordinator', 245000, 200000, 45000, 'active', '2026-01-08');

INSERT OR REPLACE INTO suppliers (id, name, company_name, category, phone, email, address, total_purchased, total_paid, payable_liability, credit_term_days, status, created_at) VALUES
('sup-chittagong-media', 'Bengal PVC & Flex House', 'Bengal Media Imports Ltd.', 'PVC & Media', '+880 1819 998877', 'bengalmedia.ctg@gmail.com', 'Khatungonj, Chattogram', 195000, 145000, 50000, 30, 'active', '2026-01-02'),
('sup-royal-wood', 'Royal Garjan Timber & Carpentry', 'Royal Wood & Hardware Mart', 'Wood & Timber', '+880 1817 223344', 'royalwood.dewri@gmail.com', 'Dewanhat, Chattogram', 88000, 65000, 23000, 15, 'active', '2026-01-04');
