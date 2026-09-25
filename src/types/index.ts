export interface QuotationItem {
  id: string;
  job: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  date: string;
  validityDate: string;
  clientName: string;
  clientCompany?: string;
  clientAddress?: string;
  clientPhone?: string;
  clientEmail?: string;
  subject: string;
  items: QuotationItem[];
  subtotal: number;
  agencyCommissionPercent: number;
  agencyCommissionAmount: number;
  vatPercent: number;
  vatAmount: number;
  total: number;
  advance: number;
  due: number;
  termsAndConditions: string[];
  nbText?: string;
  signatoryName?: string;
  signatoryTitle?: string;
  signatoryPhone?: string;
  status: 'Draft' | 'Sent' | 'Approved' | 'Converted';
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
  method: 'Cash' | 'Cheque' | 'bKash' | 'Nagad' | 'Bank Transfer';
  reference?: string;
  receivedBy: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  quotationId?: string;
  date: string;
  clientName: string;
  clientCompany?: string;
  clientAddress?: string;
  subject: string;
  items: QuotationItem[];
  subtotal: number;
  agencyCommissionPercent: number;
  agencyCommissionAmount: number;
  vatPercent: number;
  vatAmount: number;
  total: number;
  advance: number;
  due: number;
  payments: PaymentRecord[];
  termsAndConditions: string[];
  nbText?: string;
  signatoryName?: string;
  signatoryTitle?: string;
  signatoryPhone?: string;
  status: 'Unpaid' | 'Partial' | 'Paid';
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  companyName: string;
  contactPerson: string;
  designation?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
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
  serviceCategory: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  payableAmount: number;
  paidAmount: number;
  rating: number;
}

export interface ProjectSchedule {
  id: string;
  projectName: string;
  clientName: string;
  venue: string;
  eventDate: string;
  setupDate: string;
  status: 'Upcoming' | 'In Progress' | 'Completed' | 'Cancelled';
  assignedTeam: string[];
  checklist: { task: string; completed: boolean }[];
}

export interface Expense {
  id: string;
  date: string;
  category: 'Production' | 'Transport' | 'Office Rent' | 'Salary' | 'Marketing' | 'Utilities' | 'Misc';
  description: string;
  amount: number;
  paidTo: string;
  paymentMethod: string;
}

export interface FinancialLiability {
  id: string;
  title: string;
  creditor: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  status: 'Pending' | 'Partial' | 'Cleared';
  notes: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'quotation' | 'invoice' | 'liability' | 'project';
}

export interface AIClientProspect {
  id: string;
  companyName: string;
  industry: string;
  contactPerson: string;
  mobileNumber: string;
  email?: string;
  location?: string;
  estimatedBudget: number;
  recommendedService: string;
  triggerEvent?: string;
  priority?: 'High' | 'Medium' | 'Low';
  source?: 'AI Radar' | 'Manual' | 'Market Intelligence';
  status: 'New Lead' | 'Contacted' | 'Proposal Sent' | 'Won';
  createdAt?: string;
}

export interface MonitoredCompany {
  id: string;
  companyName: string;
  industry: string;
  focusArea: string;
  contactPerson?: string;
  mobileNumber?: string;
  status: 'Monitoring' | 'Signal Detected' | 'Paused';
  lastChecked: string;
  signalNotes?: string;
}

export interface ProspectChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedLead?: Partial<AIClientProspect>;
  monitoredCompany?: Partial<MonitoredCompany>;
}

export interface UserSession {
  username: string;
  role: 'Admin' | 'Sr. Executive' | 'Accountant';
  token: string;
}
