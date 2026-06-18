import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, Key, MessageCircle, RefreshCw, User, LogIn, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(true); // Default to Activation - the primary request of the client
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Erro ao iniciar secção com Google.');
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    
    const cleanEmail = email.trim().toLowerCase();

    try {
      if (isRegistering) {
        // Fluxo de Ativação / Cadastro Livre de Amarras:
        // Primeiro tenta enviar para o servidor Express integrado.
        let useFallback = false;
        let errorMessage = '';

        try {
          const res = await fetch('/api/register-access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail, password, name })
          });

          const contentType = res.headers.get('content-type') || '';
          if (!res.ok || !contentType.includes('application/json')) {
            useFallback = true;
          } else {
            const data = await res.json();
            if (!data.success) {
              const detailStr = data.details ? ` Detalhes: ${data.details}` : '';
              throw new Error((data.message || 'Houve um erro para registrar seu acesso local.') + detailStr);
            }

            // Tenta fazer o sign-in automático com a senha definida para que o aluno entre direto no mesmo segundo
            const { error: signInErr } = await supabase.auth.signInWithPassword({ 
              email: cleanEmail, 
              password 
            });

            if (signInErr) {
              throw new Error('Acesso ativado com sucesso! Porém ocorreu uma falha ao iniciar sessão. Verifique sua senha e tente entrar pelo modo "Já tenho senha".');
            }

            setSuccessMsg("Acesso ativado e liberado!");
          }
        } catch (fetchErr: any) {
          // Se falhar a conexão física ou der erro inesperado, tentamos o fallback no client
          useFallback = true;
          errorMessage = fetchErr.message || '';
        }

        // Se estivermos em ambiente estático (como Vercel) ou o servidor integrado falhar, fazemos cadastro direto via Supabase client
        if (useFallback) {
          console.log("[Login] Ativando fallback de cadastro direto no Supabase para ambientes estáticos (ex: Vercel)...");
          
          if (!supabase) {
            throw new Error("Supabase não está configurado ou inicializado.");
          }

          // Tentamos fazer login direto caso o usuário já esteja cadastrado e apenas queira acessar
          const { data: signInData, error: preSignInErr } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: password
          });

          if (!preSignInErr && signInData?.session) {
            setSuccessMsg("Acesso liberado com sucesso!");
            return;
          }

          // Se não deu para logar direto, criamos a conta no Supabase de forma nativa e direta
          const { data, error: signUpErr } = await supabase.auth.signUp({
            email: cleanEmail,
            password: password,
            options: {
              data: {
                nome: name,
                is_client: true
              }
            }
          });

          if (signUpErr) {
            // Tratamento amigável de erro clássico se o e-mail já estiver na base Supabase
            if (signUpErr.message?.includes("already") || signUpErr.message?.includes("cadastrado") || signUpErr.message?.includes("exists")) {
              throw new Error("Este e-mail de compra já possui cadastro ativo ou senha definida no sistema. Mude para a aba 'Fazer Login' ao lado para entrar.");
            }
            throw new Error(signUpErr.message || "Não foi possível criar o seu cadastro no Supabase.");
          }

          // Se cadastrou e iniciou sessão automaticamente
          if (data?.session) {
            // Tenta colocar o perfil na tabela de profiles por conveniência, sem travar se der erro de política de RLS
            try {
              await supabase.from('profiles').upsert({
                id: data.user?.id,
                email: cleanEmail,
                nome: name,
                acesso_ativo: true,
                must_change_password: false
              }, { onConflict: 'id' });

              await supabase.from('perfis').upsert({
                id: data.user?.id,
                email: cleanEmail,
                nome: name,
                acesso_ativo: true,
                must_change_password: false
              }, { onConflict: 'id' });
            } catch (pErr) {
              console.warn("Dica de banco: Perfil não criado na tabela de profiles, mas o login funcionará 100% normalmente.", pErr);
            }

            setSuccessMsg("Acesso ativado e liberado!");
          } else {
            // Se o Supabase exigir confirmação de e-mail por estar configurado assim no painel do usuário
            setSuccessMsg("Inscrição efetuada! Por favor, verifique sua caixa de e-mail para confirmar seu link de ativação.");
          }
        }

      } else {
        // Login normal para quem já tem a senha cadastrada
        const { error: signInErr } = await supabase.auth.signInWithPassword({ 
          email: cleanEmail, 
          password 
        });
        
        if (signInErr) {
          throw new Error('Não encontramos uma conta ativa com esta combinação de e-mail e senha. Se você acabou de comprar, mude para a aba "Ativar Meu Acesso" para registrar sua senha.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const numeroUrl = "5515996792372";
    const mensagem = encodeURIComponent("Olá Adrian! Estou com problemas para acessar a Biblioteca de Prompts e preciso de suporte com meu acesso.");
    window.open(`https://wa.me/${numeroUrl}?text=${mensagem}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden font-sans p-4 select-none">
      
      {/* Visual Ambient Light Effect */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-yellow-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-amber-600/5 blur-[150px] rounded-full pointer-events-none" />
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808007_1px,transparent_1px),linear-gradient(to_bottom,#80808007_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-zinc-950/80 backdrop-blur-md border border-neutral-800/80 rounded-[28px] p-8 relative z-10 shadow-2xl flex flex-col gap-5"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-gradient-to-tr from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center mb-3.5 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
             <Lock className="w-6 h-6 text-black" />
          </div>
          <h2 className="font-[Space_Grotesk] font-black text-xl tracking-tight text-white flex items-center gap-1.5 justify-center">
            Biblioteca Mestra <span className="text-yellow-500">Growth</span>
          </h2>
          <p className="text-gray-400 text-xs mt-1 max-w-xs leading-relaxed">
            {isRegistering 
              ? "Cadastre sua senha definitiva e entre na plataforma." 
              : "Acesse a área de membros exclusiva da biblioteca."}
          </p>
        </div>

        {/* Dynamic Selector Tabs - Clean Minimal Style */}
        <div className="grid grid-cols-2 bg-neutral-900/40 p-1 rounded-xl border border-neutral-800/60 text-xs">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(true);
              setError(null);
              setSuccessMsg(null);
            }}
            className={`py-2 px-1.5 font-bold rounded-lg transition-all flex items-center justify-center gap-1 uppercase tracking-wider ${
              isRegistering 
                ? 'bg-yellow-500 text-black font-extrabold' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Ativar Acesso</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsRegistering(false);
              setError(null);
              setSuccessMsg(null);
            }}
            className={`py-2 px-1.5 font-bold rounded-lg transition-all flex items-center justify-center gap-1 uppercase tracking-wider ${
              !isRegistering 
                ? 'bg-yellow-500 text-black font-extrabold' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Fazer Login</span>
          </button>
        </div>

        <div className="flex flex-col justify-start">
          <AnimatePresence mode="wait">
            <motion.form 
              key={isRegistering ? 'register-form' : 'login-form'}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              onSubmit={handleAuth} 
              className="flex flex-col gap-3.5"
            >
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span className="font-bold">{successMsg}</span>
                </div>
              )}

              {isRegistering && (
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu Nome Completo"
                    required
                    className="w-full bg-black border border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs placeholder:text-neutral-600 focus:outline-none focus:border-yellow-500 transition-colors"
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu E-mail da Compra na Cakto"
                  required
                  className="w-full bg-black border border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs placeholder:text-neutral-600 focus:outline-none focus:border-yellow-500 transition-colors"
                />
              </div>

              <div className="relative">
                <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRegistering ? "Crie sua Senha" : "Digite sua Senha"}
                  required
                  className="w-full bg-black border border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs placeholder:text-neutral-600 focus:outline-none focus:border-yellow-500 transition-colors"
                />
              </div>

              {isRegistering && (
                <div className="text-[10px] text-zinc-500 leading-normal bg-neutral-900/20 border border-neutral-900/50 p-2.5 rounded-lg text-center font-mono">
                  💡 <strong>Não precisa esperar e-mail de ativação!</strong> Escolha sua senha e clique abaixo para liberar na hora.
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1.5 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-extrabold rounded-xl py-3 text-xs uppercase tracking-wider hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_4px_15px_rgba(234,179,8,0.12)]"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processando Acesso...</span>
                  </>
                ) : (
                  <>
                    {isRegistering ? <ShieldCheck className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                    <span>{isRegistering ? 'Liberar Meu Acesso' : 'Entrar na Biblioteca'}</span>
                  </>
                )}
              </button>

            </motion.form>
          </AnimatePresence>

          <div className="mt-4 mb-3 flex items-center gap-3 w-full">
             <div className="h-[1px] flex-1 bg-neutral-800"></div>
             <span className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider">ou</span>
             <div className="h-[1px] flex-1 bg-neutral-800"></div>
          </div>

          <button
             type="button"
             onClick={handleGoogleLogin}
             disabled={loading}
             className="w-full bg-white text-black font-bold rounded-xl py-2.5 text-xs flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors disabled:opacity-50 shadow-[0_2px_10px_rgba(255,255,255,0.05)]"
          >
             <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
             </svg>
             Acessar com o Google
          </button>
        </div>

        {/* Support Section Footer */}
        <div className="mt-1 pt-3.5 border-t border-neutral-900 flex flex-col items-center">
          <button 
            type="button"
            onClick={handleWhatsApp}
            className="group flex items-center justify-center gap-1.5 text-[10.5px] font-medium text-neutral-500 hover:text-white transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-neutral-600 group-hover:text-emerald-500 transition-colors shrink-0" />
            <span>Qualquer dúvida ou problema? <span className="underline decoration-neutral-800 underline-offset-4 group-hover:decoration-emerald-500/50 transition-colors">Fale comigo no WhatsApp</span></span>
          </button>
        </div>

      </motion.div>
    </div>
  );
}
