import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMutation, useQueryClient, QueryClient, QueryClientProvider } from 'react-query';
import {
  signUpWithSupabase,
  signInWithSupabase,
  signOutFromSupabase,
  onAuthStateChange,
  getUser as getSupabaseUser,
  updateUserMetadata as updateSupabaseUserMetadata,
  updateUserPassword,
} from '../services/authService';
import type { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js';

// Define a more specific User type for the application if needed,
// or use SupabaseUser directly if its structure is sufficient.
// For now, we'll use a simplified version that matches the old structure
// and adapt SupabaseUser to it.
interface AppUser {
  id: string;
  name: string; // This will come from user_metadata
  email: string | undefined;
  role: 'admin' | 'manager' | 'sales' | 'marketing'; // This will come from user_metadata
  team: string; // This will come from user_metadata
  avatar_url?: string; // This will come from user_metadata
  phone?: string; // This will come from user_metadata
  location?: string; // This will come from user_metadata
  bio?: string; // This will come from user_metadata
  timezone?: string; // This will come from user_metadata
  language?: string; // This will come from user_metadata
  date_format?: string; // This will come from user_metadata
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: AppUser | null;
  session: SupabaseSession | null;
  loading: boolean; // For initial auth state loading
  isSigningIn: boolean; // For sign-in mutation
  isSigningUp: boolean; // For sign-up mutation
  isSigningOut: boolean; // For sign-out mutation
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, userData: { name: string; role?: string; team?: string }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<AppUser>) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>; // Alias for signOut
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const queryClient = new QueryClient();

const adaptSupabaseUser = (supabaseUser: SupabaseUser | null): AppUser | null => {
  if (!supabaseUser) return null;
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    name: supabaseUser.user_metadata?.name || 'N/A',
    role: supabaseUser.user_metadata?.role || 'sales',
    team: supabaseUser.user_metadata?.team || 'Default Team',
    avatar_url: supabaseUser.user_metadata?.avatar_url,
    phone: supabaseUser.user_metadata?.phone,
    location: supabaseUser.user_metadata?.location,
    bio: supabaseUser.user_metadata?.bio,
    timezone: supabaseUser.user_metadata?.timezone || 'UTC',
    language: supabaseUser.user_metadata?.language || 'en',
    date_format: supabaseUser.user_metadata?.date_format || 'YYYY-MM-DD',
    created_at: supabaseUser.created_at,
    updated_at: supabaseUser.updated_at || supabaseUser.created_at, // Supabase might not have updated_at directly on user object in the same way
  };
};

export const AuthProviderComponent: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true); // For initial load
  const reactQueryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getSupabaseUser();
      setUser(adaptSupabaseUser(currentUser));
      const currentSession = (await import('../services/authService')).getSession();
      setSession(await currentSession);
      setLoadingInitial(false);
    };
    fetchUser();

    const authSubscription = onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(adaptSupabaseUser(session?.user ?? null));
      // Optionally, invalidate queries that depend on auth state
      reactQueryClient.invalidateQueries('user');
    });

    return () => {
      authSubscription?.unsubscribe();
    };
  }, [reactQueryClient]);

  const signInMutation = useMutation(
    ({ email, password }: { email: string; password: string }) => signInWithSupabase({ email, password }),
    {
      onSuccess: (data) => {
        setUser(adaptSupabaseUser(data.user));
        setSession(data.session);
        reactQueryClient.setQueryData('user', adaptSupabaseUser(data.user));
      },
      onError: (error: any) => {
        console.error("Sign in error:", error.message);
      },
    }
  );

  const signUpMutation = useMutation(
    ({ email, password, metadata }: { email: string; password: string; metadata: any }) =>
      signUpWithSupabase({ email, password, options: { data: metadata } }),
    {
      onSuccess: (data) => {
        // Supabase signUp might return a user that needs email confirmation
        // or might automatically sign them in. Handle accordingly.
        // For now, we assume immediate user availability or rely on onAuthStateChange.
         if (data.user) {
          setUser(adaptSupabaseUser(data.user));
          setSession(data.session);
          reactQueryClient.setQueryData('user', adaptSupabaseUser(data.user));
        }
        // If email confirmation is needed, data.user might be null initially,
        // and data.session might also be null.
        // The onAuthStateChange listener will update the user state once confirmed and logged in.
      },
      onError: (error: any) => {
        console.error("Sign up error:", error.message);
      },
    }
  );

  const signOutMutation = useMutation(() => signOutFromSupabase(), {
    onSuccess: () => {
      setUser(null);
      setSession(null);
      reactQueryClient.setQueryData('user', null);
    },
    onError: (error: any) => {
      console.error("Sign out error:", error.message);
    },
  });

  const updateProfileMutation = useMutation(
    (updates: Partial<AppUser>) => {
      // Adapt AppUser updates to Supabase metadata structure
      const { id, email, created_at, updated_at, ...metadata } = updates;
      return updateSupabaseUserMetadata(metadata);
    },
    {
      onSuccess: (data) => {
        if (data.user) {
          setUser(adaptSupabaseUser(data.user));
          reactQueryClient.setQueryData('user', adaptSupabaseUser(data.user));
        }
      },
      onError: (error: any) => {
        console.error("Update profile error:", error.message);
      },
    }
  );

  const updatePasswordMutation = useMutation(
    (password: string) => updateUserPassword(password),
    {
      onError: (error: any) => {
        console.error("Update password error:", error.message);
      },
    }
  );


  const handleSignIn = async (email: string, password: string) => {
    try {
      await signInMutation.mutateAsync({ email, password });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Sign in failed' };
    }
  };

  const handleSignUp = async (email: string, password: string, userData: { name: string; role?: string; team?: string }) => {
    const metadata = {
      name: userData.name,
      role: userData.role || 'sales',
      team: userData.team || 'Default Team',
      // You can add more metadata here, like avatar_url, etc.
      // For example, a default avatar or initial settings
      avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      phone: '',
      location: '',
      bio: '',
      timezone: 'America/New_York',
      language: 'en',
      date_format: 'MM/DD/YYYY',
    };
    try {
      await signUpMutation.mutateAsync({ email, password, metadata });
      // Supabase handles email confirmation flow if enabled.
      // The user might not be immediately "logged in" if confirmation is required.
      // The onAuthStateChange listener should handle the user state update post-confirmation.
      // If sign up automatically logs in the user, the user state will be updated by the mutation's onSuccess.
      return { success: true, error: signUpMutation.error?.message };
    } catch (error: any) {
      return { success: false, error: error.message || 'Sign up failed' };
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutMutation.mutateAsync();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Sign out failed' };
    }
  };

  const handleUpdateProfile = async (updates: Partial<AppUser>) => {
    try {
      await updateProfileMutation.mutateAsync(updates);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Profile update failed'};
    }
  };

  const handleUpdatePassword = async (password: string) => {
    try {
      await updatePasswordMutation.mutateAsync(password);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Password update failed' };
    }
  };

  const value = {
    user,
    session,
    loading: loadingInitial || signInMutation.isLoading || signUpMutation.isLoading || signOutMutation.isLoading, // Combined loading state
    isSigningIn: signInMutation.isLoading,
    isSigningUp: signUpMutation.isLoading,
    isSigningOut: signOutMutation.isLoading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    logout: handleSignOut, // Alias
    updateProfile: handleUpdateProfile,
    updatePassword: handleUpdatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Wrap AuthProviderComponent with QueryClientProvider
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProviderComponent>{children}</AuthProviderComponent>
    </QueryClientProvider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};