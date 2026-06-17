import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ForcePasswordChange from './components/ForcePasswordChange';

type AppState = 'loading' | 'unauthenticated' | 'force-change' | 'authenticated';

export default function App() {
  const [state, setState] = useState<AppState>('loading');
  const [session, setSession] = useState<Session | null>(null);

  async function checkMustChangePassword(userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('profiles')
      .select('must_change_password')
      .eq('id', userId)
      .maybeSingle();

    return data?.must_change_password === true;
  }

  async function handleSession(newSession: Session | null) {
    if (!newSession) {
      setSession(null);
      setState('unauthenticated');
      return;
    }

    setSession(newSession);

    const mustChange = await checkMustChangePassword(newSession.user.id);
    setState(mustChange ? 'force-change' : 'authenticated');
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (state === 'unauthenticated') {
    return <Login />;
  }

  return (
    <>
      <Dashboard session={session!} />
      {state === 'force-change' && (
        <ForcePasswordChange
          onComplete={() => setState('authenticated')}
        />
      )}
    </>
  );
}
