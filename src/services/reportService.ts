import { supabase } from '../lib/supabaseClient';
import {
  SalesOverview,
  LeadAnalysisData,
  ActivityReportData,
  TeamPerformance,
  RevenueData,
  ConversionRate
} from '../types';

const RESULTS_PER_PAGE = 10;

// Define a generic filter type for reports
// This can be expanded with specific filter fields for each report type if needed
export interface ReportFilters {
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
  team?: string; // Assuming team is identified by a string ID or name
  assignedTo?: string; // Assuming assignedTo is a user ID
  source?: string; // For lead source, etc.
  stage?: string; // For opportunity stage, lead status, etc.
  // Add other common filter properties here
}


export const reportService = {
  // Sales Overview
  async getSalesOverview(page: number, filters: ReportFilters): Promise<{ data: SalesOverview[]; total: number }> {
    let query = supabase.from('opportunities').select('*', { count: 'exact' });

    if (filters.dateRange) {
      if (filters.dateRange.startDate) {
        query = query.gte('created_at', filters.dateRange.startDate);
      }
      if (filters.dateRange.endDate) {
        query = query.lte('created_at', filters.dateRange.endDate);
      }
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching sales overview:', error);
      throw new Error(`Failed to fetch sales overview: ${error.message}`);
    }

    const totalOpportunities = count || 0;
    const closedWonOpportunities = data?.filter(opp => opp.stage === 'closed-won') || [];
    const totalRevenue = closedWonOpportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);
    const avgDealSize = closedWonOpportunities.length > 0 ? totalRevenue / closedWonOpportunities.length : 0;
    const conversionRate = totalOpportunities > 0 ? (closedWonOpportunities.length / totalOpportunities) * 100 : 0;

    const salesOverviewData: SalesOverview[] = [
      {
        id: '1',
        period: 'Selected Period',
        total_revenue: totalRevenue,
        new_customers: closedWonOpportunities.length,
        opportunities_won: closedWonOpportunities.length,
        average_deal_size: avgDealSize,
        created_at: new Date().toISOString(),
      },
    ];

    return { data: salesOverviewData, total: 1 };
  },

  // Lead Analysis
  async getLeadAnalysis(page: number, filters: ReportFilters): Promise<{ data: LeadAnalysisData[]; total: number }> {
    const start = (page - 1) * RESULTS_PER_PAGE;
    const end = start + RESULTS_PER_PAGE - 1;

    let query = supabase.from('leads').select('*', { count: 'exact' });

    if (filters.dateRange) {
      if (filters.dateRange.startDate) {
        query = query.gte('created_at', filters.dateRange.startDate);
      }
      if (filters.dateRange.endDate) {
        query = query.lte('created_at', filters.dateRange.endDate);
      }
    }
    if (filters.source) {
      query = query.eq('source', filters.source);
    }
    if (filters.stage) {
      query = query.eq('status', filters.stage);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query.range(start, end);

    if (error) {
      console.error('Error fetching lead analysis:', error);
      throw new Error(`Failed to fetch lead analysis: ${error.message}`);
    }

    const leadAnalysisData: LeadAnalysisData[] = data?.map(lead => ({
      id: lead.id,
      lead_id: lead.id,
      lead_name: lead.name,
      lead_email: lead.email,
      source: lead.source,
      status: lead.status,
      qualification_score: lead.score,
      conversion_time_days: 0, // This would need to be calculated
      created_at: lead.created_at,
    })) || [];

    return { data: leadAnalysisData, total: count || 0 };
  },

  // Activities Report
  async getActivitiesReport(page: number, filters: ReportFilters): Promise<{ data: ActivityReportData[]; total: number }> {
    const start = (page - 1) * RESULTS_PER_PAGE;
    const end = start + RESULTS_PER_PAGE - 1;

    let query = supabase.from('activities').select('*', { count: 'exact' });

    if (filters.dateRange) {
      if (filters.dateRange.startDate) {
        query = query.gte('created_at', filters.dateRange.startDate);
      }
      if (filters.dateRange.endDate) {
        query = query.lte('created_at', filters.dateRange.endDate);
      }
    }
    if (filters.assignedTo) {
      query = query.eq('assignedTo', filters.assignedTo);
    }
    if (filters.stage) {
      query = query.eq('status', filters.stage);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query.range(start, end);

    if (error) {
      console.error('Error fetching activities report:', error);
      throw new Error(`Failed to fetch activities report: ${error.message}`);
    }
    return { data: data as ActivityReportData[], total: count || 0 };
  },

  // Team Performance
  async getTeamPerformance(page: number, filters: ReportFilters): Promise<{ data: TeamPerformance[]; total: number }> {
    const start = (page - 1) * RESULTS_PER_PAGE;
    const end = start + RESULTS_PER_PAGE - 1;

    // This is a complex query that likely requires a database function or view for efficient execution.
    // For the purpose of this example, we'll fetch opportunities and activities and process them in code.
    // This is NOT recommended for production due to performance issues.

    let opportunitiesQuery = supabase.from('opportunities').select('assigned_to, stage, value');
    if (filters.dateRange) {
      if (filters.dateRange.startDate) {
        opportunitiesQuery = opportunitiesQuery.gte('created_at', filters.dateRange.startDate);
      }
      if (filters.dateRange.endDate) {
        opportunitiesQuery = opportunitiesQuery.lte('created_at', filters.dateRange.endDate);
      }
    }
    if (filters.assignedTo) {
      opportunitiesQuery = opportunitiesQuery.eq('assigned_to', filters.assignedTo);
    }

    const { data: opportunities, error: opportunitiesError } = await opportunitiesQuery;

    if (opportunitiesError) {
      console.error('Error fetching opportunities for team performance:', opportunitiesError);
      throw new Error(`Failed to fetch opportunities for team performance: ${opportunitiesError.message}`);
    }

    let activitiesQuery = supabase.from('activities').select('assignedTo');
    if (filters.dateRange) {
      if (filters.dateRange.startDate) {
        activitiesQuery = activitiesQuery.gte('created_at', filters.dateRange.startDate);
      }
      if (filters.dateRange.endDate) {
        activitiesQuery = activitiesQuery.lte('created_at', filters.dateRange.endDate);
      }
    }
    if (filters.assignedTo) {
      activitiesQuery = activitiesQuery.eq('assignedTo', filters.assignedTo);
    }

    const { data: activities, error: activitiesError } = await activitiesQuery;

    if (activitiesError) {
      console.error('Error fetching activities for team performance:', activitiesError);
      throw new Error(`Failed to fetch activities for team performance: ${activitiesError.message}`);
    }

    const performanceData: { [userId: string]: TeamPerformance } = {};

    opportunities?.forEach(opp => {
      if (!performanceData[opp.assigned_to]) {
        performanceData[opp.assigned_to] = {
          id: opp.assigned_to,
          user_id: opp.assigned_to,
          user_name: 'Unknown User', // This should be enriched with user data
          period: 'Selected Period',
          leads_generated: 0,
          opportunities_created: 0,
          deals_closed: 0,
          revenue_generated: 0,
          activity_count: 0,
          created_at: new Date().toISOString(),
        };
      }
      performanceData[opp.assigned_to].opportunities_created++;
      if (opp.stage === 'closed-won') {
        performanceData[opp.assigned_to].deals_closed++;
        performanceData[opp.assigned_to].revenue_generated += opp.value || 0;
      }
    });

    activities?.forEach(activity => {
      if (!performanceData[activity.assignedTo]) {
        performanceData[activity.assignedTo] = {
          id: activity.assignedTo,
          user_id: activity.assignedTo,
          user_name: 'Unknown User', // This should be enriched with user data
          period: 'Selected Period',
          leads_generated: 0,
          opportunities_created: 0,
          deals_closed: 0,
          revenue_generated: 0,
          activity_count: 0,
          created_at: new Date().toISOString(),
        };
      }
      performanceData[activity.assignedTo].activity_count++;
    });

    const allPerformanceData = Object.values(performanceData);
    const paginatedData = allPerformanceData.slice(start, end + 1);

    // Enrich with user names
    const userIds = paginatedData.map(p => p.user_id);
    if (userIds.length > 0) {
      const { data: users, error: usersError } = await supabase
        .from('user_profiles')
        .select('user_id, name')
        .in('user_id', userIds);

      if (usersError) {
        console.error('Error fetching user profiles for team performance:', usersError);
      } else {
        const userMap = new Map(users.map(u => [u.user_id, u.name]));
        paginatedData.forEach(p => {
          p.user_name = userMap.get(p.user_id) || 'Unknown User';
        });
      }
    }

    return { data: paginatedData, total: allPerformanceData.length };
  },

  // Revenue Report
  async getRevenueReport(page: number, filters: ReportFilters): Promise<{ data: RevenueData[]; total: number }> {
    const start = (page - 1) * RESULTS_PER_PAGE;
    const end = start + RESULTS_PER_PAGE - 1;

    let query = supabase.from('opportunities').select('*', { count: 'exact' }).eq('stage', 'closed-won');

    if (filters.dateRange) {
      if (filters.dateRange.startDate) {
        query = query.gte('created_at', filters.dateRange.startDate);
      }
      if (filters.dateRange.endDate) {
        query = query.lte('created_at', filters.dateRange.endDate);
      }
    }
    if (filters.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query.range(start, end);

    if (error) {
      console.error('Error fetching revenue report:', error);
      throw new Error(`Failed to fetch revenue report: ${error.message}`);
    }

    const revenueData: RevenueData[] = data?.map(opp => ({
      id: opp.id,
      transaction_id: opp.id,
      source_type: 'opportunity',
      amount: opp.value || 0,
      currency: opp.currency,
      transaction_date: opp.last_activity,
      customer_id: opp.customer_id,
      product_service_name: opp.name,
      created_at: opp.created_at,
    })) || [];

    return { data: revenueData, total: count || 0 };
  },

  // Conversion Report
  async getConversionReport(page: number, filters: ReportFilters): Promise<{ data: ConversionRate[]; total: number }> {
    // This is a complex query that likely requires a database function or view for efficient execution.
    // For the purpose of this example, we'll fetch opportunities and process them in code.
    // This is NOT recommended for production due to performance issues.

    let query = supabase.from('opportunities').select('stage');

    if (filters.dateRange) {
      if (filters.dateRange.startDate) {
        query = query.gte('created_at', filters.dateRange.startDate);
      }
      if (filters.dateRange.endDate) {
        query = query.lte('created_at', filters.dateRange.endDate);
      }
    }
    if (filters.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo);
    }

    const { data: opportunities, error } = await query;

    if (error) {
      console.error('Error fetching opportunities for conversion report:', error);
      throw new Error(`Failed to fetch opportunities for conversion report: ${error.message}`);
    }

    const stageCounts: { [stage: string]: number } = {};
    opportunities?.forEach(opp => {
      if (opp.stage) {
        stageCounts[opp.stage] = (stageCounts[opp.stage] || 0) + 1;
      }
    });

    const stages = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost'];
    const conversionData: ConversionRate[] = [];

    for (let i = 0; i < stages.length - 1; i++) {
      const fromStage = stages[i];
      const toStage = stages[i + 1];
      const fromCount = stageCounts[fromStage] || 0;
      const toCount = stageCounts[toStage] || 0;
      const rate = fromCount > 0 ? (toCount / fromCount) * 100 : 0;

      conversionData.push({
        id: `${fromStage}-to-${toStage}`,
        stage_from: fromStage,
        stage_to: toStage,
        conversion_count: toCount,
        total_count_from_stage: fromCount,
        rate: rate,
        period: 'Selected Period',
        created_at: new Date().toISOString(),
      });
    }

    return { data: conversionData, total: conversionData.length };
  },

  // Subscribe to real-time updates for a specific report table
  // The `userId` parameter is an example if your RLS policies depend on it.
  // Adjust filters in the subscription as needed.
  subscribeToReportUpdates(tableName: string, callback: (payload: any) => void, userId?: string) {
    return supabase
      .channel(`${tableName}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          // Add filters if needed, e.g., filter by user_id if reports are user-specific
          // filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log(`Change in ${tableName}:`, payload);
          callback(payload);
        }
      )
      .subscribe();
  }
};

// Placeholder types - these should be defined in src/types/index.ts
// For now, adding basic structures here.
// TODO: Move these to src/types/index.ts and expand as needed.

// export interface SalesOverview {
//   id: string;
//   metric: string;
//   value: number | string;
//   change?: string;
//   created_at: string;
//   // ... other fields
// }

// export interface LeadAnalysis {
//   id: string;
//   lead_id: string;
//   status: string;
//   source: string;
//   created_at: string;
//   // ... other fields
// }

// export interface Activity {
//   id: string;
//   type: string;
//   status: string;
//   due_date: string;
//   created_at: string;
//   // ... other fields
// }

// export interface TeamPerformance {
//   id: string;
//   team_member_id: string;
//   metric: string;
//   value: number;
//   created_at: string;
//   // ... other fields
// }

// export interface Revenue {
//   id: string;
//   transaction_id: string;
//   amount: number;
//   date: string;
//   created_at: string;
//   // ... other fields
// }

// export interface Conversion {
//   id: string;
//   stage_name: string;
//   count: number;
//   rate: number;
//   created_at: string;
//   // ... other fields
// }

// export interface Report extends SalesOverview, LeadAnalysis, Activity, TeamPerformance, Revenue, Conversion {}

// Note: The Report interface above is a union of all possible report types.
// It might be better to handle specific types in each component.
// The actual data structure will depend heavily on your Supabase schema.
// These are simplified examples.
