import { supabase } from '../lib/supabaseClient';
import {
  Activity,
  Opportunity,
  Lead,
  Customer
} from '../types'; // Assuming these core types exist

// Define interfaces for the specific data structures the dashboard components will need
export interface DashboardMetrics {
  totalLeads: number;
  totalOpportunities: number;
  activeOpportunities: number; // Added based on dashboard "Top Opportunities" section implying active ones
  totalRevenue: number; // All-time from closed-won opportunities
  avgDealSize: number;
  conversionRate: number; // Example: Leads to Closed-Won Opportunities
  // monthlyGrowth: number; // This would require comparing current vs previous month revenue
}

export interface LeadSourceDataPoint {
  source: string;
  count: number;
  // percentage?: number; // Percentage can be calculated on the frontend
}

export interface PipelineStageDataPoint {
  stage: Opportunity['stage'];
  count: number;
  value: number;
  // color?: string; // Color can be handled by the frontend component
}

export interface TopOpportunity extends Partial<Opportunity> {
  // Add any specific fields needed for the "Top Opportunities" display if different from base Opportunity
  // For now, assuming it uses fields from the Opportunity type
  name: string; // name is already in Opportunity
  value: number; // value is already in Opportunity
  probability?: number; // probability is in Opportunity
  stage: Opportunity['stage']; // stage is in Opportunity
}


export const dashboardService = {
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      // Total Leads
      const { count: totalLeads, error: leadsError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });
      if (leadsError) throw leadsError;

      // Total & Active Opportunities (count)
      const { data: opportunitiesData, error: oppsError } = await supabase
        .from('opportunities')
        .select('stage, value'); // Select value for revenue and avg deal size calculations
      if (oppsError) throw oppsError;

      const totalOpportunities = opportunitiesData?.length || 0;
      const activeOpportunities = opportunitiesData?.filter(opp => opp.stage !== 'closed-won' && opp.stage !== 'closed-lost').length || 0;

      const closedWonOpportunities = opportunitiesData?.filter(opp => opp.stage === 'closed-won') || [];

      // Total Revenue (from closed-won opportunities)
      const totalRevenue = closedWonOpportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);

      // Average Deal Size
      const avgDealSize = closedWonOpportunities.length > 0
        ? totalRevenue / closedWonOpportunities.length
        : 0;

      // Conversion Rate (e.g., (Closed Won Opportunities / Total Leads) * 100)
      // This is a simplified example. A more accurate CR might depend on a more specific definition.
      const conversionRate = totalLeads && totalLeads > 0
        ? (closedWonOpportunities.length / totalLeads) * 100
        : 0;

      return {
        totalLeads: totalLeads || 0,
        totalOpportunities,
        activeOpportunities,
        totalRevenue,
        avgDealSize,
        conversionRate: parseFloat(conversionRate.toFixed(1)), // Keep one decimal place
      };
    } catch (error: any) {
      console.error('Error fetching dashboard metrics:', error);
      throw new Error(`Failed to fetch dashboard metrics: ${error.message}`);
    }
  },

  async getLeadSourceData(): Promise<LeadSourceDataPoint[]> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('source')
        .not('source', 'is', null); // Only include leads with a source

      if (error) throw error;
      if (!data) return [];

      const sourceCounts: { [key: string]: number } = {};
      data.forEach(lead => {
        if (lead.source) {
          sourceCounts[lead.source] = (sourceCounts[lead.source] || 0) + 1;
        }
      });

      return Object.entries(sourceCounts).map(([source, count]) => ({ source, count }));
    } catch (error: any) {
      console.error('Error fetching lead source data:', error);
      throw new Error(`Failed to fetch lead source data: ${error.message}`);
    }
  },

  async getPipelineData(): Promise<PipelineStageDataPoint[]> {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('stage, value');

      if (error) throw error;
      if (!data) return [];

      const pipeline: { [key: string]: { count: number; value: number } } = {};
      data.forEach(opp => {
        if (opp.stage) {
          if (!pipeline[opp.stage]) {
            pipeline[opp.stage] = { count: 0, value: 0 };
          }
          pipeline[opp.stage].count += 1;
          pipeline[opp.stage].value += (opp.value || 0);
        }
      });

      return Object.entries(pipeline).map(([stage, { count, value }]) => ({
        stage: stage as Opportunity['stage'],
        count,
        value
      }));
    } catch (error: any) {
      console.error('Error fetching pipeline data:', error);
      throw new Error(`Failed to fetch pipeline data: ${error.message}`);
    }
  },

  async getActivityFeedData(limit: number = 5): Promise<Activity[]> {
    try {
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select(`
          id,
          created_at,
          type,
          title,
          description,
          relatedTo,
          assignedTo,
          dueDate,
          completedAt,
          status
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (activitiesError) throw activitiesError;
      if (!activities) return [];

      // Get user IDs from activities
      const userIds = [...new Set(activities.map(a => a.assignedTo).filter(id => id))];

      // Fetch user data
      const { data: users, error: usersError } = await supabase
        .from('user_profiles')
        .select('user_id, name')
        .in('user_id', userIds);

      if (usersError) throw usersError;

      // Create a map for easy lookup
      const userMap = new Map(users?.map(u => [u.user_id, u.name]));

      // Replace assignedTo ID with user name
      const enrichedActivities = activities.map(activity => ({
        ...activity,
        assignedTo: userMap.get(activity.assignedTo) || 'N/A',
      }));

      return enrichedActivities as Activity[];
    } catch (error: any) {
      console.error('Error fetching activity feed data:', error);
      throw new Error(`Failed to fetch activity feed data: ${error.message}`);
    }
  },

  async getTopOpportunities(limit: number = 3): Promise<TopOpportunity[]> {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('id, name, value, probability, stage')
        .not('stage', 'in', '("closed-won", "closed-lost")') // Example: only active opportunities
        .order('value', { ascending: false }) // Order by highest value
        .limit(limit);

      if (error) throw error;
      return (data || []) as TopOpportunity[];
    } catch (error: any) {
      console.error('Error fetching top opportunities:', error);
      throw new Error(`Failed to fetch top opportunities: ${error.message}`);
    }
  }
};
