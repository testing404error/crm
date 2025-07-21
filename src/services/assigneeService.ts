import { supabase } from '../lib/supabaseClient';
import { Assignee } from '../types';

export const getAssignees = async (): Promise<Assignee[]> => {
  const { data, error } = await supabase.from('assignees').select('*');
  if (error) throw new Error(error.message);
  return data || [];
};

export const addAssignee = async (assignee: Omit<Assignee, 'id'>): Promise<Assignee> => {
  const { data, error } = await supabase.from('assignees').insert([assignee]).single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateAssignee = async (id: string, updates: Partial<Assignee>): Promise<Assignee> => {
  const { data, error } = await supabase.from('assignees').update(updates).eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteAssignee = async (id: string): Promise<void> => {
  const { error } = await supabase.from('assignees').delete().eq('id', id);
  if (error) throw new Error(error.message);
};
