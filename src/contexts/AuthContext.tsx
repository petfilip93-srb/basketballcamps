import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

interface AuthContextType {
  session: Session | null;
  user: Session['user'] | null;
  loading: boolean;
  userProfile: UserProfile | null;
  signUp: (email: string, password: string, fullName: string, country: string, userType: 'regular' | 'camp_owner', phone?: string, commission?: number) => Promise<void>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (data.session?.user) {
        const { data: profile } = await supabase
          .from('users_profile')
          .select('*')
          .eq('id', data.session.user.id)
          .maybeSingle();
        setUserProfile(profile);
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, newSession) => {
      (async () => {
        setSession(newSession);
        if (newSession?.user) {
          const { data: profile } = await supabase
            .from('users_profile')
            .select('*')
            .eq('id', newSession.user.id)
            .maybeSingle();
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
      })();
    });
  }, []);

  const signUp = async (email: string, password: string, fullName: string, country: string, userType: 'regular' | 'camp_owner' = 'regular', phone?: string, commission?: number) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          user_type: userType,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user');

    const updateData: any = {
      country,
    };

    if (phone) updateData.phone = phone;
    if (commission) updateData.commission_per_participant = commission;

    const { error: profileError } = await supabase
      .from('users_profile')
      .update(updateData)
      .eq('id', authData.user.id);

    if (profileError) throw profileError;
  };

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('rememberMe');
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user || null, loading, userProfile, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
