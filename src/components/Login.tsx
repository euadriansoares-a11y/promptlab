import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Terminal, Lock, Mail, Key } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        else setError('Verifique seu e-mail para confirmar o cadastro.');
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden font-sans p-4">
      {/* Background Futuristic Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-yellow-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-fuchsia-600/5 blur-[160px] rounded-full pointer-events-none" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-950/80 backdrop-blur border border-neutral-800 rounded-3xl p-8 relative z-10 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
             <Lock className="w-8 h-8 text-black" />
          </div>
          <h2 className="font-[Space_Grotesk] font-black text-3xl tracking-tighter text-white">
            Acesso <span className="text-yellow-500">Exclusivo</span>
          </h2>
          <p className="text-gray-400 text-sm mt-2 text-center">
            Faça login para desbloquear e copiar todos os prompts validados de Growth e Vendas.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <div className="relative">
            <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu E-mail"
              required
              className="w-full bg-black border border-neutral-800 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-neutral-600 focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>

          <div className="relative">
            <Key className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha de Acesso"
              required
              className="w-full bg-black border border-neutral-800 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-neutral-600 focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold rounded-xl py-3.5 text-sm uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? 'Aguarde...' : isLogin ? 'Entrar na Biblioteca' : 'Criar Conta'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-gray-500 hover:text-yellow-500 transition-colors"
          >
            {isLogin ? "Ainda não tem acesso? Crie uma conta." : "Já tem conta? Clique para entrar."}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
