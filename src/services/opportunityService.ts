import { supabase } from '../lib/supabaseClient';
import { Opportunity } from '../types';

export interface OpportunityFilters {
  name?: string;
  stage?: string;
  assigned_to?: string;
  min_value?: number;
  max_value?: number;
}

export const opportunityService = {
  async getOpportunities(userId: string, page: number, limit: number, filters: OpportunityFilters, sortBy: string, sortAsc: boolean): Promise<{ data: Opportunity[]; total: number }> {
    let query = supabase.from('opportunities').select('*', { count: 'exact' }).eq('user_id', userId);
    
    // Add your filter logic here based on the filters object
    if (filters.name) {
        query = query.ilike('name', `%${filters.name}%`);
    }
    if (filters.stage) {
        query = query.eq('stage', filters.stage);
    }
    // Add other filters as needed...

    const { data, error, count } = await query.order(sortBy, { ascending: sortAsc }).range((page - 1) * limit, page * limit - 1);
    if (error) throw new Error(error.message);
    return { data: data as Opportunity[], total: count ?? 0 };
  },

  /**
   * NEW OR UPDATED FUNCTION: 
   * Fetches all opportunities (only ID and name) for selection in a dropdown.
   * This is the function that was likely missing.
   */
  async getAllOpportunitiesForSelection(userId: string): Promise<{ id: string; name: string }[]> {
    const { data, error } = await supabase
      .from('opportunities')
      .select('id, name')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching opportunities for selection:', error);
      throw new Error(error.message);
    }
    return data || [];
  },
  
  async createOpportunity(oppData: Partial<Opportunity>, userId: string): Promise<Opportunity> {
    const { data, error } = await supabase.from('opportunities').insert([{ ...oppData, user_id: userId }]).select().single();
    if (error) throw new Error(error.message);
    return data as Opportunity;
  },

  async updateOpportunity(oppId: string, oppData: Partial<Opportunity>, userId: string): Promise<Opportunity> {
    const { data, error } = await supabase.from('opportunities').update(oppData).eq('id', oppId).eq('user_id', userId).select().single();
    if (error) throw new Error(error.message);
    return data as Opportunity;
  },

  async deleteOpportunity(oppId: string, userId: string): Promise<void> {
    const { error } = await supabase.from('opportunities').delete().eq('id', oppId).eq('user_id', userId);
    if (error) throw new Error(error.message);
  },

  subscribeToOpportunities(userId: string, callback: (payload: any) => void) {
    return supabase.channel('public:opportunities')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'opportunities', filter: `user_id=eq.${userId}` }, callback)
      .subscribe();
  }
};
