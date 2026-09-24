export interface Client {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  contactPerson: string;
  designation?: string;
  tradeLicense?: string;
  tinVat?: string;
  totalBilled: number;
  totalPaid: number;
  currentDue: number;
  status: 'active' | 'inactive';
  createdAt: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  companyName: string;
  category: 'PVC & Media' | 'Wood & Timber' | 'Metal & Hardware' | 'Print & Ink' | 'Electrical' | 'Transport & Crane' | 'General';
  phone: string;
  email: string;
  address: string;
  bankDetails?: string;
  totalPurchased: number;
  totalPaid: number;
  payableLiability: number; // What Grand owes to this supplier
  creditTermDays: number;
  status: 'active' | 'hold';
  createdAt: string;
}

export interface QuotationItem {
  id: string;
  job: string; // e.g. "Borfi", "Standee", "Festoon", "Backdrop"
  description: string; // e.g. "Wooden frame + black media PVC Borfi with Installation\nSize: 3X3=9sqf"
  width?: number; // in feet
  height?: number; // in feet
  sqft?: number;
  quantity: number;
  unitPrice: number; // BDT
  total: number; // quantity * unitPrice
}

export interface Quotation {
  id: string;
  quotationNumber: string; // e.g. "GCM-QUO-2026-0042"
  clientId: string;
  clientName: string;
  clientCompany: string;
  clientAddress?: string;
  date: string; // e.g. "2026-01-14"
  validityDate: string; // e.g. "2026-01-15"
  subject: string; // e.g. "Quotation for – Borfi & Standee setup."
  items: QuotationItem[];
  subtotal: number;
  agencyCommissionPercent: number; // e.g. 10%
  agencyCommissionAmount: number;
  vatPercent: number; // e.g. 0% or 15%
  vatAmount: number;
  aitPercent?: number; // Advance Income Tax
  aitAmount?: number;
  total: number;
  advance: number;
  due: number;
  nbText: string; // e.g. "Excluded City corporation Permissions."
  termsAndConditions: string[];
  signatoryName: string; // "Mohin Uddin Mazumder"
  signatoryTitle: string; // "Sr. Executive"
  signatoryPhone: string; // "01827787123"
  status: 'Draft' | 'Sent' | 'Approved' | 'Invoiced' | 'Declined';
  convertedInvoiceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: 'Cash' | 'Cheque' | 'bKash' | 'Nagad' | 'Bank Transfer';
  reference?: string;
  receivedBy: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "GCM-INV-2026-0042"
  quotationId?: string;
  clientId: string;
  clientName: string;
  clientCompany: string;
  clientAddress?: string;
  date: string;
  dueDate: string;
  subject: string;
  items: QuotationItem[];
  subtotal: number;
  agencyCommissionAmount: number;
  vatAmount: number;
  total: number;
  advance: number;
  due: number;
  payments: PaymentRecord[];
  status: 'Paid' | 'Partial' | 'Due' | 'Overdue';
  nbText: string;
  termsAndConditions: string[];
  signatoryName: string;
  signatoryTitle: string;
  signatoryPhone: string;
  createdAt: string;
}

export interface ProjectSchedule {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  quotationId?: string;
  invoiceId?: string;
  eventDate: string; // Program Day
  printClearanceDeadline: string; // e.g. 12 days before
  installationDeadline: string;
  status: 'Planning' | 'Design & Clearance' | 'Fabrication' | 'Installation' | 'Completed' | 'Delayed';
  priority: 'High' | 'Medium' | 'Low';
  location: string;
  assignedTeam: string[];
  notes?: string;
  progressPercent: number;
  createdAt: string;
}

export interface Expense {
  id: string;
  date: string;
  title: string;
  category: 'Raw Materials' | 'Printing Media' | 'Fabrication Labor' | 'Transport & Crane' | 'City Corp Fees' | 'Office Rent' | 'Utilities' | 'Equipment' | 'Misc';
  projectId?: string;
  projectTitle?: string;
  supplierId?: string;
  supplierName?: string;
  amount: number;
  isPaid: boolean; // if false, it enters Financial Liabilities
  dueDate?: string;
  paymentMethod?: 'Cash' | 'Cheque' | 'Bank Transfer' | 'MFS';
  recordedBy: string;
  receiptNumber?: string;
  notes?: string;
}

export interface FinancialLiability {
  id: string;
  supplierId: string;
  supplierName: string;
  category: string;
  totalAmount: number;
  paidAmount: number;
  remainingLiability: number;
  dueDate: string;
  status: 'Upcoming' | 'Due Today' | 'Overdue' | 'Cleared';
  notes?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'project_deadline' | 'payment_due' | 'clearance_alert' | 'system';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  priority: 'high' | 'normal';
}

export interface AIClientProspect {
  id: string;
  companyName: string;
  industry: string;
  location: string;
  potentialServices: string[];
  estimatedBudget: string;
  painPoint: string;
  strategicPitch: string;
  suggestedColdEmail: string;
  whatsappMessage: string;
  contactLeadStatus: 'New' | 'Contacted' | 'Quoted' | 'Converted';
  generatedAt: string;
}

export interface AIDesignConcept {
  id: string;
  projectName: string;
  type: 'Borfi Frame' | 'Standee' | 'Festoon' | 'Stage Backdrop' | 'Exhibition Stall' | 'Billboard';
  clientIndustry: string;
  dimensions: string; // e.g. "3x3 ft" or "2x4 ft"
  materialRecommendation: string;
  frameStructure: string;
  colorScheme: string[];
  layoutConcept: string;
  fabricationSpecs: string[];
  promptForRenderer: string;
  previewSvgData?: string;
  createdAt: string;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Accounts Manager' | 'Executive Lead' | 'Operations Executive' | 'Workshop Lead';
  phone?: string;
  token?: string;
  avatar?: string;
}
