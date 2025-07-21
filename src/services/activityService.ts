import { supabase } from '../lib/supabaseClient';
import { Activity, ScheduledActivity } from '../types';

// Mock database for the new "Scheduled Activities" feature
const mockScheduledActivities: ScheduledActivity[] = [
  {
    id: '1',
    type: 'Call',
    scheduled_at: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    notes: 'Follow up on the new proposal.',
    lead_id: '1',
    parentName: 'John Doe',
    parentType: 'Lead',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'Meeting',
    scheduled_at: new Date().toISOString(), // Today
    notes: 'Discuss project timeline.',
    opportunity_id: '1',
    parentName: 'Q1 Deal with Acme Corp',
    parentType: 'Opportunity',
    created_at: new Date().toISOString(),
  },
];

export const activityService = {
  // --- Functions for Scheduling (Mock) ---
  scheduleActivity(activity: Omit<ScheduledActivity, 'id' | 'created_at'>): Promise<ScheduledActivity> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newActivity: ScheduledActivity = {
          id: Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString(),
          ...activity,
        };
        mockScheduledActivities.push(newActivity);
        resolve(newActivity);
      }, 500);
    });
  },

  getAllScheduledActivities(userId: string): Promise<ScheduledActivity[]> {
      return new Promise((resolve) => {
          setTimeout(() => {
              resolve(mockScheduledActivities);
          }, 300);
      });
  },
  
  // --- Existing Functions for General Activities (Supabase) ---
  async getActivities(userId: string, page: number, limit: number, filters?: Record<string, any>): Promise<{ data: Activity[]; total: number }> {
    const start = (page - 1) * limit;
    let query = supabase.from('activities').select('*', { count: 'exact' }).eq('assignedTo', userId);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          if (['title'].includes(key)) {
            query = query.ilike(key, `%${value}%`);
          } else {
            query = query.eq(key, value);
          }
        }
      });
    }
    const { data, error, count } = await query.order('created_at', { ascending: false }).range(start, start + limit - 1);
    if (error) throw new Error(error.message);
    return { data: data as Activity[], total: count || 0 };
  },

  async createActivity(activityData: Partial<Activity>, userId: string): Promise<Activity> {
    const { data, error } = await supabase.from('activities').insert([{ ...activityData, assignedTo: userId }]).select().single();
    if (error) throw new Error(error.message);
    return data as Activity;
  },

  async updateActivity(activityId: string, activityData: Partial<Activity>, userId: string): Promise<Activity> {
    const { data, error } = await supabase.from('activities').update(activityData).eq('id', activityId).eq('assignedTo', userId).select().single();
    if (error) throw new Error(error.message);
    return data as Activity;
  },

  async deleteActivity(activityId: string, userId: string): Promise<void> {
    const { error } = await supabase.from('activities').delete().eq('id', activityId).eq('assignedTo', userId);
    if (error) throw new Error(error.message);
  },

  subscribeToActivities(userId: string, callback: (payload: any) => void) {
    return supabase.channel('public:activities').on('postgres_changes', { event: '*', schema: 'public', table: 'activities', filter: `assignedTo=eq.${userId}` }, callback).subscribe();
  }
};
