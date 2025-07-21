export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'sales' | 'marketing';
  team: string;
  avatar?: string;
}

export interface Address {
  id: string;
  type: 'billing' | 'shipping' | 'other';
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isPrimary: boolean;
}

export interface Lead {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  source: 'website' | 'email' | 'social' | 'referral' | 'manual';
  score: number;
  status: 'new' | 'contacted' | 'qualified' | 'converted';
  assigned_to?: string;
  created_at: string; // Should be string to match Supabase
  lastActivity?: string; // Should be string
  location?: string;
  notes?: string;
  tags: string[];
}

export interface Opportunity {
  id: string;
  user_id: string;
  name: string;
  lead_id?: string;
  customer_id?: string;
  value: number;
  currency: string;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number;
  expected_close_date: string;
  assigned_to: string;
  created_at: string;
  last_activity: string;
  description?: string;
  lost_reason?: string;
  next_action?: string;
  tags: string[];
  company?: string; // Added for consistency
  contact_person?: string; // Added for consistency
}

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  addresses: Address[];
  language: string;
  currency: string;
  total_value: number;
  created_at: string;
  last_activity: string;
  tags: string[];
  notes?: string;
}

export interface Activity {
  id: string;
  created_at: string;
  type: 'call' | 'email' | 'meeting' | 'task' | 'note';
  title: string;
  description?: string;
  relatedTo?: {
    type: string;
    id: string;
    name: string;
  };
  assignedTo: string;
  dueDate?: string;
  completedAt?: string;
  status: 'pending' | 'completed' | 'overdue';
}

export interface ScheduledActivity {
  id: string;
  type: 'Call' | 'Email' | 'Meeting';
  scheduled_at: string;
  notes?: string;
  lead_id?: string;
  opportunity_id?: string;
  parentName?: string;
  parentType?: 'Lead' | 'Opportunity';
  created_at: string;
}

export interface Assignee {
  id: string;
  name: string;
  email: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'lead-followup' | 'opportunity-proposal' | 'welcome' | 'follow-up';
  isActive: boolean;
  createdAt: string; // Changed to string
}

export interface DashboardMetrics {
  totalLeads: number;
  qualifiedLeads: number;
  totalOpportunities: number;
  wonOpportunities: number;
  totalRevenue: number;
  avgDealSize: number;
  conversionRate: number;
  monthlyGrowth: number;
}

export interface CommunicationRecord {
  id: string;
  user_id: string;
  lead_id: string;
  type: 'email' | 'sms' | 'call';
  direction: 'inbound' | 'outbound';
  from_address: string;
  to_address: string;
  subject?: string;
  content: string;
  timestamp: string;
  status: string;
  attachments?: { name: string; size: string; url: string }[];
}

// Report Types
export interface SalesOverview {
  id: string;
  period: string;
  total_revenue: number;
  new_customers: number;
  opportunities_won: number;
  average_deal_size: number;
  created_at: string;
}

export interface LeadAnalysisData {
  id: string;
  lead_id: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  source: string;
  qualification_score?: number;
  conversion_time_days?: number;
  created_at: string;
  lead_name?: string;
  lead_email?: string;
}

export interface ActivityReportData {
  id: string;
  activity_id: string;
  type: 'call' | 'email' | 'meeting' | 'task';
  status: 'pending' | 'completed' | 'overdue';
  completed_by_user_id?: string;
  duration_minutes?: number;
  created_at: string;
  activity_title?: string;
  user_name?: string;
}

export interface TeamPerformance {
  id: string;
  user_id: string;
  user_name: string;
  period: string;
  leads_generated: number;
  opportunities_created: number;
  deals_closed: number;
  revenue_generated: number;
  activity_count: number;
  created_at: string;
}

export interface RevenueData {
  id: string;
  transaction_id: string;
  source_type: 'opportunity' | 'subscription' | 'other';
  amount: number;
  currency: string;
  transaction_date: string;
  customer_id?: string;
  product_service_name?: string;
  created_at: string;
}

export interface ConversionRate {
  id: string;
  stage_from: string;
  stage_to: string;
  conversion_count: number;
  total_count_from_stage: number;
  rate: number;
  period: string;
  created_at: string;
}

export type ReportData = SalesOverview | LeadAnalysisData | ActivityReportData | TeamPerformance | RevenueData | ConversionRate;
