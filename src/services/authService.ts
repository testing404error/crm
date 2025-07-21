import { supabase } from '../lib/supabaseClient';
import type { SignUpWithPasswordCredentials, SignInWithPasswordCredentials, User } from '@supabase/supabase-js';

export const signUpWithSupabase = async (credentials: SignUpWithPasswordCredentials) => {
  const { data, error } = await supabase.auth.signUp(credentials);
  if (error) {
    console.error('Error signing up:', error.message);
    throw error;
  }
  return data;
};

export const signInWithSupabase = async (credentials: SignInWithPasswordCredentials) => {
  const { data, error } = await supabase.auth.signInWithPassword(credentials);
  if (error) {
    console.error('Error signing in:', error.message);
    throw error;
  }
  return data;
};

export const signOutFromSupabase = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error.message);
    throw error;
  }
};

export const getUser = async (): Promise<User | null> => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error fetching user:', error.message);
    // It's often better not to throw here, but let the caller decide
    // as a null user might be an expected state (e.g., not logged in)
  }
  return user;
};

export const onAuthStateChange = (callback: (event: string, session: import('@supabase/supabase-js').Session | null) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return subscription;
};

// Function to get the current session
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error fetching session:', error.message);
  }
  return session;
}

// Function to update user metadata
export const updateUserMetadata = async (metadata: object) => {
  const { data, error } = await supabase.auth.updateUser({ data: metadata });
  if (error) {
    console.error('Error updating user metadata:', error.message);
    throw error;
  }
  return data;
}

// *** ADD THIS NEW FUNCTION ***
export const updateUserPassword = async (password: string) => {
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.error('Error updating password:', error.message);
    throw error;
  }
  return data;
};