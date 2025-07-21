import { Lead, CommunicationRecord, Opportunity } from '../types/index';
import { supabase } from '../lib/supabaseClient';
import { opportunityService } from './opportunityService';


export const leadsService = {
  // Fetch paginated leads for the authenticated user
  async getLeads(userId: string, page: number, limit: number = 10): Promise<{ data: Lead[]; total: number }> {
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data, error, count } = await supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(start, end);

    if (error) throw new Error(error.message);
    return { data: data as Lead[], total: count || 0 };
  },

  async getAllLeadsForSelection(userId: string): Promise<{ id: string; name: string }[]> {
    const { data, error } = await supabase
      .from('leads')
      .select('id, name')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching leads for selection:', error);
      throw new Error(error.message);
    }
    return data || [];
  },

  // Create a new lead
  async createLead(leadData: Partial<Lead>, userId: string): Promise<Lead> {
    const newLead = {
      ...leadData,
      user_id: userId,
      created_at: new Date().toISOString(),
      status: leadData.status || 'new',
      score: leadData.score || 0,
      tags: leadData.tags || [],
      assigned_to: leadData.assigned_to
    };

    const { data, error } = await supabase
      .from('leads')
      .insert([newLead])
      .select()
      .single();

    if (error) throw new Error(error.message);

    const newOpportunity: Partial<Opportunity> = {
      name: `${data.name}'s Opportunity`,
      lead_id: data.id,
      value: 0,
      currency: 'USD',
      stage: 'prospecting',
      probability: 10,
      expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      assigned_to: data.assigned_to || userId,
      description: `Opportunity automatically created for lead: ${data.name}`,
      tags: data.tags,
    };
    await opportunityService.createOpportunity(newOpportunity, userId);

    return data as Lead;
  },

  // Update an existing lead
  async updateLead(leadId: string, leadData: Partial<Lead>, userId: string): Promise<Lead> {
    const { data, error } = await supabase
      .from('leads')
      .update(leadData)
      .eq('id', leadId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Lead;
  },

  // Delete a lead
  async deleteLead(leadId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', leadId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
  },

  // Fetch communications for a lead
  async getCommunications(leadId: string, userId: string): Promise<CommunicationRecord[]> {
    const { data, error } = await supabase
      .from('communications')
      .select('*')
      .eq('lead_id', leadId)
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) throw new Error(error.message);
    return data as CommunicationRecord[];
  },

  // Create a new communication
  async createCommunication(communicationData: Partial<CommunicationRecord>, userId: string): Promise<CommunicationRecord> {
    const newCommunication = {
      ...communicationData,
      user_id: userId,
      timestamp: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('communications')
      .insert([newCommunication])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as CommunicationRecord;
  },

  // Subscribe to real-time lead updates
  subscribeToLeads(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('leads-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads', filter: `user_id=eq.${userId}` }, callback)
      .subscribe();
  },

  // Subscribe to real-time communication updates
  subscribeToCommunications(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('communications-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'communications', filter: `user_id=eq.${userId}` }, callback)
      .subscribe();
  }
};
