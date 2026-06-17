import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!supabase) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-gradient-to-tr from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
          <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="font-[Space_Grotesk] text-3xl font-bold tracking-tighter text-white mb-4">
          Supabase Não <span className="text-yellow-500">Configurado</span>
        </h2>
        <p className="text-gray-400 max-w-md text-sm leading-relaxed border border-neutral-800 bg-zinc-950 p-6 rounded-2xl">
          A integração com o Supabase encontrou um problema. Certifique-se de que a variável <code className="bg-zinc-800 text-yellow-500 px-1 py-0.5 rounded text-xs mx-1">VITE_SUPABASE_URL</code> contém uma URL válida que inicie com <strong>https://</strong> e que a chave anônima esteja inserida em <code className="bg-zinc-800 text-yellow-500 px-1 py-0.5 rounded text-xs mx-1">VITE_SUPABASE_ANON_KEY</code> no menu Settings (Environment Variables).
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return session ? <Dashboard /> : <Login />;
}
