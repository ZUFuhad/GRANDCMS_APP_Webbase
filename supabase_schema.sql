-- ==========================================================
-- GRAND CMS - Supabase (PostgreSQL) Database Schema & Seed Data
-- Agency: GRAND Communication & Marketing (EST. 2004)
-- Address: 20 No Shop CDA Market, Kazir Dewri, Chattogram
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
  total_billed NUMERIC DEFAULT 0,
  total_paid NUMERIC DEFAULT 0,
  current_due NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
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
  total_purchased NUMERIC DEFAULT 0,
  total_paid NUMERIC DEFAULT 0,
  payable_liability NUMERIC DEFAULT 0,
  credit_term_days INTEGER DEFAULT 30,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
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
  items_json JSONB DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL,
  agency_commission_percent NUMERIC DEFAULT 10,
  agency_commission_amount NUMERIC DEFAULT 0,
  vat_percent NUMERIC DEFAULT 0,
  vat_amount NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  advance NUMERIC DEFAULT 0,
  due NUMERIC NOT NULL,
  nb_text TEXT,
  terms_json JSONB DEFAULT '[]'::jsonb,
  signatory_name TEXT,
  signatory_title TEXT,
  signatory_phone TEXT,
  status TEXT DEFAULT 'Draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
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
  items_json JSONB DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL,
  agency_commission_amount NUMERIC DEFAULT 0,
  vat_amount NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  advance NUMERIC DEFAULT 0,
  due NUMERIC NOT NULL,
  payments_json JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'Due',
  signatory_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Projects Table
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
  assigned_team_json JSONB DEFAULT '[]'::jsonb,
  progress_percent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
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
  amount NUMERIC NOT NULL,
  is_paid BOOLEAN DEFAULT true,
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
  total_amount NUMERIC NOT NULL,
  paid_amount NUMERIC DEFAULT 0,
  remaining_liability NUMERIC NOT NULL,
  due_date TEXT,
  status TEXT DEFAULT 'Upcoming',
  notes TEXT
);

-- Disable Row Level Security (RLS) so the app can read/write without auth blockers
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE quotations DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE financial_liabilities DISABLE ROW LEVEL SECURITY;

-- Initial Seed Data
INSERT INTO clients (id, name, company_name, email, phone, address, city, contact_person, designation, total_billed, total_paid, current_due, status)
VALUES 
('cli-whiz', 'Whiz Communication', 'Whiz Communication Ltd.', 'events@whizcomm.com.bd', '+880 1711 987654', 'Finlay Square, 6th Floor, GEC Circle', 'Chattogram', 'Tanvir Hossain', 'Head of Brand Operations', 178200, 80000, 98200, 'active'),
('cli-apex', 'Apex Footwear Chittagong', 'Apex Holdings Ltd.', 'ctg.retail@apexfootwear.com', '+880 1819 445566', 'Agrabad Commercial Area', 'Chattogram', 'Zakir Ahmed', 'Regional Retail Coordinator', 245000, 200000, 45000, 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO suppliers (id, name, company_name, category, phone, email, address, total_purchased, total_paid, payable_liability, credit_term_days, status)
VALUES
('sup-chittagong-media', 'Bengal PVC & Flex House', 'Bengal Media Imports Ltd.', 'PVC & Media', '+880 1819 998877', 'bengalmedia.ctg@gmail.com', 'Khatungonj, Chattogram', 195000, 145000, 50000, 30, 'active'),
('sup-royal-wood', 'Royal Garjan Timber & Carpentry', 'Royal Wood & Hardware Mart', 'Wood & Timber', '+880 1817 223344', 'royalwood.dewri@gmail.com', 'Dewanhat, Chattogram', 88000, 65000, 23000, 15, 'active')
ON CONFLICT (id) DO NOTHING;
