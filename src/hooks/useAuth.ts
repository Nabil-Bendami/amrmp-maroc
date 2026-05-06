import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch user role directly from user_roles table
  const fetchUserRole = async (userId: string) => {
    try {
      console.log('Step 1: Fetching role for user:', userId);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.warn('Step 2: No role found in user_roles table:', error);
        setIsAdmin(false);
        return false;
      }

      console.log('Step 2: Role found in DB:', data?.role);
      const hasAdminRole = data?.role === 'admin';
      setIsAdmin(hasAdminRole);
      return hasAdminRole;
    } catch (err) {
      console.error('Step 2: Error fetching role:', err);
      setIsAdmin(false);
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;

    // Get initial session first
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (mounted) {
        console.log('Step 0: Initial session check:', initialSession?.user?.id);
        setSession(initialSession);
        const currentUser = initialSession?.user ?? null;
        setUser(currentUser);

        // Fetch role for authenticated user
        if (currentUser?.id) {
          fetchUserRole(currentUser.id).then(() => {
            if (mounted) setLoading(false);
          });
        } else {
          if (mounted) setLoading(false);
        }
      }
    });

    // Set up listener for auth state changes
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        console.log('Auth state changed:', _event, newSession?.user?.id);
        setSession(newSession);
        const currentUser = newSession?.user ?? null;
        setUser(currentUser);

        // Fetch role for authenticated user
        if (currentUser?.id) {
          fetchUserRole(currentUser.id).then(() => {
            if (mounted) setLoading(false);
          });
        } else {
          setIsAdmin(false);
          if (mounted) setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return { session, user, loading, isAuthenticated: !!user, isAdmin };
}
