import { supabase } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const utils = trpc.useUtils();

  // Listen to Supabase auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSessionLoading(false);
    });

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setSessionLoading(false);
      // Invalidate tRPC user query when auth state changes
      utils.auth.me.invalidate();
    });

    return () => subscription.unsubscribe();
  }, [utils]);

  // Query the tRPC backend for user details (role, etc.)
  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: !!session,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    utils.auth.me.setData(undefined, null);
    await utils.auth.me.invalidate();
  }, [utils]);

  const state = useMemo(() => {
    return {
      user: meQuery.data ?? null,
      session,
      loading: sessionLoading || (!!session && meQuery.isLoading),
      error: meQuery.error ?? null,
      isAuthenticated: !!session && !!meQuery.data,
    };
  }, [session, sessionLoading, meQuery.data, meQuery.error, meQuery.isLoading]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
