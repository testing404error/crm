import { Lead, Opportunity, Customer, Activity, User, EmailTemplate, DashboardMetrics } from '../types';

export const mockUsers: User[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@company.com', role: 'manager', team: 'Sales', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
  { id: '2', name: 'Bob Smith', email: 'bob@company.com', role: 'sales', team: 'Sales', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
  { id: '3', name: 'Carol Davis', email: 'carol@company.com', role: 'sales', team: 'Sales', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
  { id: '4', name: 'David Wilson', email: 'david@company.com', role: 'marketing', team: 'Marketing', avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
];

export const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@techcorp.com',
    phone: '+1-555-0123',
    company: 'TechCorp Inc.',
    source: 'website',
    score: 85,
    status: 'qualified',
    assignedTo: 'Alice Johnson',
    createdAt: new Date(2024, 0, 15),
    lastActivity: new Date(2024, 0, 22),
    location: 'San Francisco, CA',
    notes: 'Interested in enterprise solution',
    tags: ['enterprise', 'high-priority']
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    email: 'sarah@startupco.com',
    phone: '+1-555-0124',
    company: 'StartupCo',
    source: 'referral',
    score: 72,
    status: 'contacted',
    assignedTo: 'Bob Smith',
    createdAt: new Date(2024, 0, 18),
    lastActivity: new Date(2024, 0, 20),
    location: 'Austin, TX',
    tags: ['startup', 'mid-priority']
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'mchen@innovate.com',
    phone: '+1-555-0125',
    company: 'Innovate Solutions',
    source: 'social',
    score: 91,
    status: 'new',
    assignedTo: 'Carol Davis',
    createdAt: new Date(2024, 0, 20),
    location: 'Seattle, WA',
    notes: 'Found us through LinkedIn',
    tags: ['linkedin', 'hot-lead']
  },
  {
    id: '4',
    name: 'Emily Rodriguez',
    email: 'emily@retailplus.com',
    company: 'Retail Plus',
    source: 'email',
    score: 58,
    status: 'new',
    createdAt: new Date(2024, 0, 21),
    location: 'Miami, FL',
    tags: ['retail', 'small-business']
  }
];

export const mockOpportunities: Opportunity[] = [
  {
    id: '1',
    name: 'TechCorp Enterprise Deal',
    leadId: '1',
    value: 125000,
    currency: 'USD',
    stage: 'proposal',
    probability: 75,
    expectedCloseDate: new Date(2024, 1, 28),
    assignedTo: 'Alice Johnson',
    createdAt: new Date(2024, 0, 10),
    lastActivity: new Date(2024, 0, 22),
    description: 'Enterprise software solution for 500+ employees',
    nextAction: 'Send proposal presentation',
    tags: ['enterprise', 'high-value']
  },
  {
    id: '2',
    name: 'StartupCo Initial Package',
    leadId: '2',
    value: 15000,
    currency: 'USD',
    stage: 'negotiation',
    probability: 60,
    expectedCloseDate: new Date(2024, 1, 15),
    assignedTo: 'Bob Smith',
    createdAt: new Date(2024, 0, 12),
    lastActivity: new Date(2024, 0, 21),
    description: 'Starter package for growing startup',
    nextAction: 'Schedule final meeting',
    tags: ['startup', 'recurring']
  },
  {
    id: '3',
    name: 'Innovate Solutions Custom Build',
    value: 85000,
    currency: 'USD',
    stage: 'qualification',
    probability: 40,
    expectedCloseDate: new Date(2024, 2, 30),
    assignedTo: 'Carol Davis',
    createdAt: new Date(2024, 0, 20),
    lastActivity: new Date(2024, 0, 20),
    description: 'Custom integration and setup',
    nextAction: 'Conduct needs assessment call',
    tags: ['custom', 'integration']
  },
  {
    id: '4',
    name: 'Retail Plus Standard',
    value: 8500,
    currency: 'USD',
    stage: 'prospecting',
    probability: 25,
    expectedCloseDate: new Date(2024, 2, 15),
    assignedTo: 'Bob Smith',
    createdAt: new Date(2024, 0, 21),
    lastActivity: new Date(2024, 0, 21),
    description: 'Standard retail management solution',
    tags: ['retail', 'standard']
  }
];

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'GlobalTech Industries',
    email: 'contact@globaltech.com',
    phone: '+1-555-0100',
    company: 'GlobalTech Industries',
    addresses: [
      {
        id: '1',
        type: 'billing',
        street: '123 Business Ave',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        isPrimary: true
      }
    ],
    language: 'English',
    currency: 'USD',
    totalValue: 450000,
    createdAt: new Date(2023, 6, 15),
    lastActivity: new Date(2024, 0, 18),
    tags: ['enterprise', 'vip'],
    notes: 'Key enterprise customer with multiple locations'
  },
  {
    id: '2',
    name: 'Creative Agency Co',
    email: 'hello@creativeagency.com',
    phone: '+1-555-0101',
    company: 'Creative Agency Co',
    addresses: [
      {
        id: '2',
        type: 'billing',
        street: '456 Design St',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'USA',
        isPrimary: true
      }
    ],
    language: 'English',
    currency: 'USD',
    totalValue: 75000,
    createdAt: new Date(2023, 8, 20),
    lastActivity: new Date(2024, 0, 16),
    tags: ['creative', 'agency']
  }
];

export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'call',
    title: 'Follow-up call with TechCorp',
    description: 'Discussed enterprise requirements and pricing',
    relatedTo: { type: 'opportunity', id: '1', name: 'TechCorp Enterprise Deal' },
    assignedTo: 'Alice Johnson',
    completedAt: new Date(2024, 0, 22, 14, 30),
    status: 'completed',
    createdAt: new Date(2024, 0, 22, 14, 30)
  },
  {
    id: '2',
    type: 'email',
    title: 'Sent proposal to StartupCo',
    relatedTo: { type: 'opportunity', id: '2', name: 'StartupCo Initial Package' },
    assignedTo: 'Bob Smith',
    completedAt: new Date(2024, 0, 21, 10, 0),
    status: 'completed',
    createdAt: new Date(2024, 0, 21, 10, 0)
  },
  {
    id: '3',
    type: 'meeting',
    title: 'Needs assessment call',
    description: 'Initial discovery call to understand requirements',
    relatedTo: { type: 'lead', id: '3', name: 'Michael Chen' },
    assignedTo: 'Carol Davis',
    dueDate: new Date(2024, 0, 25, 15, 0),
    status: 'pending',
    createdAt: new Date(2024, 0, 20)
  },
  {
    id: '4',
    type: 'task',
    title: 'Prepare custom demo',
    description: 'Create tailored demo for Innovate Solutions',
    relatedTo: { type: 'opportunity', id: '3', name: 'Innovate Solutions Custom Build' },
    assignedTo: 'Carol Davis',
    dueDate: new Date(2024, 0, 27, 12, 0),
    status: 'pending',
    createdAt: new Date(2024, 0, 21)
  },
  {
    id: '5',
    type: 'call',
    title: 'Discovery call with new lead',
    description: 'Initial qualification call',
    relatedTo: { type: 'lead', id: '4', name: 'Emily Rodriguez' },
    assignedTo: 'Bob Smith',
    dueDate: new Date(2024, 0, 24, 10, 0),
    status: 'overdue',
    createdAt: new Date(2024, 0, 21)
  },
  {
    id: '6',
    type: 'note',
    title: 'Customer feedback received',
    description: 'Positive feedback on recent implementation',
    relatedTo: { type: 'customer', id: '1', name: 'GlobalTech Industries' },
    assignedTo: 'Alice Johnson',
    completedAt: new Date(2024, 0, 23, 16, 0),
    status: 'completed',
    createdAt: new Date(2024, 0, 23, 16, 0)
  },
  {
    id: '7',
    type: 'meeting',
    title: 'Product demo scheduled',
    description: 'Demo of new features for existing customer',
    relatedTo: { type: 'customer', id: '2', name: 'Creative Agency Co' },
    assignedTo: 'David Wilson',
    dueDate: new Date(2024, 0, 26, 14, 0),
    status: 'pending',
    createdAt: new Date(2024, 0, 22)
  },
  {
    id: '8',
    type: 'task',
    title: 'Update CRM records',
    description: 'Sync latest contact information',
    relatedTo: { type: 'lead', id: '1', name: 'John Doe' },
    assignedTo: 'Carol Davis',
    dueDate: new Date(2024, 0, 25, 9, 0),
    status: 'pending',
    createdAt: new Date(2024, 0, 23)
  }
];

export const mockEmailTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Welcome New Lead',
    subject: 'Welcome to {{company_name}} - Let\'s Get Started!',
    body: 'Hi {{lead_name}},\n\nThank you for your interest in our solutions. I\'d love to schedule a quick call to understand your needs better.\n\nWould you be available for a 15-minute call this week? I can work around your schedule.\n\nBest regards,\n{{user_name}}\n{{user_email}}\n{{company_name}}',
    type: 'welcome',
    isActive: true,
    createdAt: new Date(2024, 0, 1)
  },
  {
    id: '2',
    name: 'Follow-up After Call',
    subject: 'Great talking with you - Next Steps',
    body: 'Hi {{lead_name}},\n\nIt was great speaking with you today about {{lead_company}}\'s needs. As discussed, I\'m attaching the information you requested.\n\nKey points from our conversation:\n- {{opportunity_name}} requirements\n- Timeline: {{meeting_date}}\n- Budget considerations\n\nNext steps:\n1. Review the attached materials\n2. Internal discussion with your team\n3. Follow-up call scheduled for next week\n\nPlease don\'t hesitate to reach out if you have any questions in the meantime.\n\nBest regards,\n{{user_name}}\n{{company_name}}',
    type: 'follow-up',
    isActive: true,
    createdAt: new Date(2024, 0, 1)
  },
  {
    id: '3',
    name: 'Proposal Submission',
    subject: 'Proposal for {{opportunity_name}} - {{opportunity_value}}',
    body: 'Dear {{lead_name}},\n\nI hope this email finds you well. As promised, I\'m pleased to submit our proposal for {{opportunity_name}}.\n\nProposal Summary:\n- Total Investment: {{opportunity_value}}\n- Implementation Timeline: 6-8 weeks\n- Ongoing Support: Included\n\nYou can review the full proposal here: {{proposal_link}}\n\nThis proposal is valid until {{current_date}} and includes:\n✓ Complete solution setup\n✓ Team training (up to 10 users)\n✓ 90 days of premium support\n✓ Data migration assistance\n\nI\'m confident this solution will help {{lead_company}} achieve its goals. I\'d be happy to schedule a call to walk through the proposal and answer any questions.\n\nLooking forward to hearing from you.\n\nBest regards,\n{{user_name}}\n{{user_email}}\n{{company_name}}',
    type: 'opportunity-proposal',
    isActive: true,
    createdAt: new Date(2024, 0, 5)
  },
  {
    id: '4',
    name: 'Lead Nurturing - Educational',
    subject: 'How {{lead_company}} Can Improve Sales Efficiency by 40%',
    body: 'Hi {{lead_name}},\n\nI came across an interesting case study that reminded me of our conversation about improving sales efficiency at {{lead_company}}.\n\nA company similar to yours recently achieved:\n• 40% increase in sales productivity\n• 25% reduction in sales cycle time\n• 60% improvement in lead conversion\n\nThe key was implementing an integrated CRM solution that automated their manual processes.\n\nI thought you might find their approach interesting. Would you like me to share the case study with you?\n\nAlso, if you\'re still evaluating options for {{lead_company}}, I\'d be happy to show you how our solution could deliver similar results.\n\nBest regards,\n{{user_name}}\n{{company_name}}\n\nP.S. I\'ll be in {{lead_company}}\'s area next week. Would you be interested in a brief in-person meeting?',
    type: 'lead-followup',
    isActive: true,
    createdAt: new Date(2024, 0, 10)
  },
  {
    id: '5',
    name: 'Meeting Reminder',
    subject: 'Reminder: Meeting Tomorrow at {{meeting_date}}',
    body: 'Hi {{lead_name}},\n\nJust a friendly reminder about our meeting scheduled for tomorrow ({{meeting_date}}).\n\nMeeting Details:\n• Topic: {{opportunity_name}} Discussion\n• Duration: 30 minutes\n• Format: Video call (link will be sent separately)\n\nAgenda:\n1. Review your current challenges\n2. Demonstrate relevant features\n3. Discuss implementation timeline\n4. Q&A session\n\nPlease let me know if you need to reschedule or if you have any specific topics you\'d like to cover.\n\nLooking forward to our conversation!\n\nBest regards,\n{{user_name}}\n{{company_name}}',
    type: 'follow-up',
    isActive: false,
    createdAt: new Date(2024, 0, 12)
  }
];

export const mockDashboardMetrics: DashboardMetrics = {
  totalLeads: 247,
  qualifiedLeads: 89,
  totalOpportunities: 23,
  wonOpportunities: 8,
  totalRevenue: 892000,
  avgDealSize: 38000,
  conversionRate: 36.2,
  monthlyGrowth: 12.5
};