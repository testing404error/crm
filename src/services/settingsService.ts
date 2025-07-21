import { supabase } from '../lib/supabaseClient';

export const settingsService = {
  async getEmailSettings(userId: string) {
    const { data, error } = await supabase
      .from('user_settings')
      .select('email_settings')
      .eq('user_id', userId)
      .limit(1) // Fetch only the first matching row
      .single();

    if (error && error.code !== 'PGRST116') { // Ignore 'not found' error
      console.error('Error fetching email settings:', error);
      throw new Error(error.message);
    }

    return data?.email_settings || null;
  },

  async saveEmailSettings(userId: string, settings: any) {
    const { error } = await supabase
      .from('user_settings')
      .upsert({ user_id: userId, email_settings: settings }, { onConflict: 'user_id' });

    if (error) {
      console.error('Error saving email settings:', error);
      throw new Error(error.message);
    }
  },
};
