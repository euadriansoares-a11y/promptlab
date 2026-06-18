import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CATEGORIES, PROMPTS_DATA } from '../data';
import { Copy, Check, Sparkles, LogOut, Terminal, Heart, ChevronRight, Zap, Play, X, Bell, Users, LayoutGrid, UserCircle, Star, Network } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import EstrategiasTab from './EstrategiasTab';
import ConectoresTab from './ConectoresTab';
import UpdatesTab from './UpdatesTab';
import CommunityTab from './CommunityTab';
import TutoriaisTab from './TutoriaisTab';
import ProfileTab from './ProfileTab';
import ForcePasswordChange from './ForcePasswordChange';
import UpsellTab from './UpsellTab';

const Confetti = ({ active, x, y }: { active: boolean, x: number, y: number }) => {
  if (!active) return null;
  return (
    <div 
      className="absolute pointer-events-none z-50 flex items-center justify-center"
      style={{ left: x, top: y, width: 0, height: 0 }}
    >
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: 0, 
            scale: [0, 1.5, 0], 
            x: (Math.random() - 0.5) * 100, 
            y: (Math.random() - 0.5) * 100 - 50,
            rotate: Math.random() * 360
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute w-2 h-2 text-red-500 fill-red-500"
        >
           <Heart className="w-full h-full fill-current" />
        </motion.div>
      ))}
    </div>
  );
};

const VerifiedBadge = () => (
  <svg className="w-3.5 h-3.5 text-[#0095f6] fill-current shrink-0 inline-block ml-1 align-middle" viewBox="0 0 24 24">
    <path d="M12 2L15.09 4.36L19 4L18.64 7.91L21 11L18.64 14.09L19 18L15.09 17.64L12 20L8.91 17.64L5 18L5.36 14.09L3 11L5.36 7.91L5 4L8.91 4.36L12 2M10.09 13.73L7.5 11.14L6.09 12.55L10.09 16.55L18 8.64L16.59 7.23L10.09 13.73Z" />
  </svg>
);

export default function Dashboard() {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [currentView, setCurrentView] = useState<'biblioteca' | 'estrategias' | 'conectores' | 'atualizacoes' | 'comunidade' | 'tutoriais' | 'perfil' | 'upsell'>('biblioteca');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [activeSlides, setActiveSlides] = useState<{ [id: number]: number }>({});
  const [likedIds, setLikedIds] = useState<number[]>([]);
  const [doubleClickedId, setDoubleClickedId] = useState<number | null>(null);
  const [playingTutorials, setPlayingTutorials] = useState<{ [id: string]: boolean }>({});
  const [showInitialPopup, setShowInitialPopup] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  useEffect(() => {
    async function checkPasswordAndFetchPrompts() {
      if (!supabase) return;
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('must_change_password')
            .eq('id', user.id)
            .single();

          if (profile && profile.must_change_password) {
            setMustChangePassword(true);
            setIsLoading(false);
            return;
          }
        }

        const { data, error } = await supabase
          .from('prompts')
          .select('*')
          .order('id', { ascending: true });
        
        if (data && data.length > 0) {
          setPrompts(data);
        } else {
          setPrompts(PROMPTS_DATA);
        }
      } catch (err) {
        console.error("Erro ao iniciar painel ou buscar banco. Ativando PROMPTS_DATA estáticos como contingência:", err);
        setPrompts(PROMPTS_DATA);
      } finally {
        setIsLoading(false);
      }
    }
    checkPasswordAndFetchPrompts();
  }, []);

  const handleSignOut = async () => {
    localStorage.removeItem('codigodaia_bypass_session');
    if (supabase) {
      await supabase.auth.signOut();
    }
    window.location.reload();
  };

  const handleCopyPrompt = async (prompt: any) => {
    try {
      await navigator.clipboard.writeText(prompt.prompt_text);
      setCopiedId(prompt.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const toggleSlide = (id: number) => {
    setActiveSlides(prev => {
      const current = prev[id] || 0;
      return {
        ...prev,
        [id]: current === 0 ? 1 : 0
      };
    });
  };

  const handleMediaDoubleClick = (id: number) => {
    if (!likedIds.includes(id)) {
      setLikedIds(prev => [...prev, id]);
    }
    setDoubleClickedId(id);
    setTimeout(() => {
      setDoubleClickedId(null);
    }, 1000);
  };

  if (mustChangePassword) {
    return (
      <ForcePasswordChange 
        onComplete={() => {
          setMustChangePassword(false);
          // Recarregar os prompts após fechar o modal, pois não foram carregados
          supabase.from('prompts').select('*').order('id', { ascending: true })
            .then(({ data }) => data && setPrompts(data));
        }} 
      />
    );
  }

  const filteredPrompts = selectedCategory === "Todos" 
    ? prompts 
    : prompts.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans relative overflow-hidden flex flex-col items-center">
      {/* Background Futuristic Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-yellow-500/15 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Header Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 md:px-8 py-5 flex items-center justify-between border-b border-gray-900/80 relative z-20">
         <div className="flex items-center gap-2">
           <Terminal className="w-6 h-6 text-yellow-500" />
           <span className="font-[Space_Grotesk] font-black text-xl md:text-2xl tracking-tighter text-white">
             Codigo<span className="text-yellow-500">DaIA</span>
           </span>
         </div>
         <div className="flex items-center gap-4 md:gap-6">
           <button 
             onClick={() => setCurrentView('perfil')}
             className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
           >
             <UserCircle className="w-5 h-5" />
             <span className="hidden md:inline">Perfil</span>
           </button>
           <button 
             onClick={() => setCurrentView('tutoriais')}
             className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-white/5 border border-white/10 text-xs md:text-sm text-white font-semibold hover:bg-white/10 transition-colors"
           >
             <Play className="w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-500 fill-yellow-500" />
             <span className="hidden md:inline">Assistir Tutorial</span>
             <span className="md:hidden">Tutorial</span>
           </button>
           <button 
             onClick={handleSignOut}
             className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
           >
             <LogOut className="w-4 h-4" /> <span className="hidden md:inline">Sair</span>
           </button>
         </div>
      </header>

      {/* Main Navigation */}
      <nav className="w-full border-b border-gray-900/50 bg-black/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center gap-8 text-sm overflow-x-auto no-scrollbar">
           <button
             onClick={() => setCurrentView('biblioteca')}
             className={`flex items-center gap-2 py-4 border-b-2 font-bold whitespace-nowrap transition-colors ${
               currentView === 'biblioteca' 
                 ? 'border-yellow-500 text-yellow-500' 
                 : 'border-transparent text-gray-400 hover:text-white'
             }`}
           >
             <LayoutGrid className="w-4 h-4" />
             <span className="tracking-wide uppercase text-xs mt-0.5">Biblioteca</span>
           </button>

           <button
             onClick={() => setCurrentView('estrategias')}
             className={`flex items-center gap-2 py-4 border-b-2 font-bold whitespace-nowrap transition-colors ${
               currentView === 'estrategias' 
                 ? 'border-yellow-500 text-yellow-500' 
                 : 'border-transparent text-gray-400 hover:text-white'
             }`}
           >
             <Zap className="w-4 h-4" />
             <span className="tracking-wide uppercase text-xs mt-0.5">Estratégias</span>
           </button>

           <button
             onClick={() => setCurrentView('conectores')}
             className={`flex items-center gap-2 py-4 border-b-2 font-bold whitespace-nowrap transition-colors ${
               currentView === 'conectores' 
                 ? 'border-yellow-500 text-yellow-500' 
                 : 'border-transparent text-gray-400 hover:text-white'
             }`}
           >
             <Network className="w-4 h-4" />
             <span className="tracking-wide uppercase text-xs mt-0.5">Conectores</span>
           </button>

           <button
             onClick={() => setCurrentView('atualizacoes')}
             className={`flex items-center gap-2 py-4 border-b-2 font-bold whitespace-nowrap transition-colors ${
               currentView === 'atualizacoes' 
                 ? 'border-yellow-500 text-yellow-500' 
                 : 'border-transparent text-gray-400 hover:text-white'
             }`}
           >
             <Bell className="w-4 h-4" />
             <span className="tracking-wide uppercase text-xs mt-0.5">Atualizações</span>
             <span className="ml-1 bg-yellow-500 text-black text-[10px] px-1.5 py-0.5 rounded-full font-black animate-pulse">NOVO</span>
           </button>

           <button
             onClick={() => setCurrentView('comunidade')}
             className={`flex items-center gap-2 py-4 border-b-2 font-bold whitespace-nowrap transition-colors ${
               currentView === 'comunidade' 
                 ? 'border-yellow-500 text-yellow-500' 
                 : 'border-transparent text-gray-400 hover:text-white'
             }`}
           >
             <Users className="w-4 h-4" />
             <span className="tracking-wide uppercase text-xs mt-0.5">Comunidade</span>
           </button>

           <button
             onClick={() => setCurrentView('tutoriais')}
             className={`flex items-center gap-2 py-4 border-b-2 font-bold whitespace-nowrap transition-colors ${
               currentView === 'tutoriais' 
                 ? 'border-yellow-500 text-yellow-500' 
                 : 'border-transparent text-gray-400 hover:text-white'
             }`}
           >
             <Play className="w-4 h-4" />
             <span className="tracking-wide uppercase text-xs mt-0.5">Tutoriais</span>
           </button>

           <button
             onClick={() => setCurrentView('upsell')}
             className={`flex items-center gap-2 py-4 border-b-2 font-bold whitespace-nowrap transition-colors ${
               currentView === 'upsell' 
                 ? 'border-yellow-500 text-yellow-500' 
                 : 'border-transparent text-gray-400 hover:text-white'
             }`}
           >
             <Star className="w-4 h-4" />
             <span className="tracking-wide uppercase text-xs mt-0.5">Conteúdos Extras</span>
           </button>
        </div>
      </nav>

      <main className="w-full max-w-7xl mx-auto px-4 md:px-6 py-12 relative z-10 flex flex-col items-center text-center pb-24 md:pb-12">
        {currentView === 'biblioteca' && (
          <>
            {/* Intro */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="mb-10 text-center max-w-4xl px-4"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-yellow-500 font-semibold mb-4 tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Acesso Liberado
          </span>
          <h1 className="font-[Space_Grotesk] text-3xl md:text-5xl font-bold tracking-tighter mb-4 text-white">
            Biblioteca de <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">Prompts</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base font-medium max-w-2xl mx-auto mb-6">
            Todos os prompts estratégicos desbloqueados. Deslize os cards, copie o texto com um clique e cole diretamente na sua ferramenta de IA de preferência.
          </p>
        </motion.div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-12 w-full">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                selectedCategory === cat 
                  ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10 scale-105' 
                  : 'bg-zinc-900 border border-neutral-800 text-gray-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full pb-20">
          {filteredPrompts.map((p) => {
            const activeSlide = activeSlides[p.id] || 0;
            const isLatestCopied = copiedId === p.id;
            const isPopHeart = doubleClickedId === p.id;

            return (
              <div 
                key={p.id}
                className="bg-[#0c0c0e] border border-neutral-900 rounded-3xl p-4 text-left shadow-2xl flex flex-col gap-4 relative justify-between overflow-hidden group"
              >
                {/* Header of Post */}
                <div className="flex items-center gap-2.5 w-full">
                  <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center border border-neutral-800 overflow-hidden">
                    <img 
                      src="https://i.imgur.com/8VtGEfs_d.jpeg?maxwidth=520&shape=thumb&fidelity=high" 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <span className="font-bold text-xs text-white">
                        @eu.adrian_g.s
                      </span>
                      <VerifiedBadge />
                    </div>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5 uppercase tracking-wider font-semibold">
                       {p.category}
                    </span>
                  </div>
                </div>

                {/* Aspect-Square Carousel Media Module */}
                <div 
                  onDoubleClick={() => handleMediaDoubleClick(p.id)}
                  onClick={() => toggleSlide(p.id)}
                  className="w-full aspect-[4/5] relative bg-black border border-neutral-900 rounded-2xl overflow-hidden cursor-pointer select-none"
                >
                  <AnimatePresence mode="wait">
                    {activeSlide === 0 ? (
                      /* Cover Slide */
                      <motion.div
                        key="cover"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ duration: 0.3 }}
                        className={`absolute inset-0 bg-gradient-to-b ${p.gradient} p-5 flex flex-col justify-between`}
                      >
                        <div className="flex items-center justify-between z-10">
                          <span className="text-[9px] font-extrabold uppercase bg-white/10 backdrop-blur rounded-full px-2 py-1 text-yellow-400 border border-white/5">
                            💡 CLIQUE PARA LER
                          </span>
                        </div>

                        <div className="flex flex-col gap-2 z-10 text-left my-auto">
                          <h3 className="font-[Space_Grotesk] text-xl font-black text-white tracking-tighter uppercase leading-tight bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent">
                            {p.post_title}
                          </h3>
                          <p className="text-yellow-400 text-[10px] font-semibold tracking-wide flex items-center gap-1.5 uppercase font-[Space_Grotesk]">
                            <Zap className="w-3 h-3" /> {p.post_subtitle}
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      /* Prompt Content Slide */
                      <motion.div
                        key="content"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-[#070708] p-4 flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between border-b border-neutral-900 pb-2 mb-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-500/50" />
                            <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                            <div className="w-2 h-2 rounded-full bg-green-500/50" />
                          </div>
                        </div>

                        {/* Text wrapper with scroll */}
                        <div className="flex-1 overflow-y-auto pr-1 text-xs font-mono text-gray-300 leading-relaxed custom-scrollbar select-none text-left">
                          <p className="text-[11px] whitespace-pre-wrap leading-relaxed select-text">
                            {p.prompt_text}
                          </p>
                        </div>

                        <div className="border-t border-neutral-950 pt-2 text-[10px] text-center text-gray-500 flex items-center justify-center gap-1 font-semibold uppercase">
                          <Sparkles className="w-3 h-3 text-yellow-500" /> Toque para retornar
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Likes gesture heart pop animation */}
                  <AnimatePresence>
                    {isPopHeart && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.3 }}
                        animate={{ opacity: 1, scale: 1.4 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute inset-0 flex items-center justify-center z-40 bg-black/20 pointer-events-none"
                      >
                        <Heart className="w-20 h-20 text-red-500 fill-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Description Section */}
                <div className="px-1 py-1 text-[11px] text-gray-400 font-medium leading-relaxed">
                  <p className="line-clamp-3">{p.description}</p>
                </div>

                {/* Always Unlocked Copy Button Component */}
                <div className="mt-auto flex w-full pt-3 border-t border-neutral-950">
                  <button
                    onClick={() => handleCopyPrompt(p)}
                    className={`flex-1 flex items-center justify-center gap-1.5 font-bold text-xs py-3 px-4 rounded-xl active:scale-[0.98] transition-all uppercase tracking-wide font-sans shrink-0
                      ${isLatestCopied 
                        ? 'bg-green-500 text-black shadow-lg shadow-green-500/20' 
                        : 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-lg shadow-yellow-500/20 hover:opacity-90'
                      }`}
                  >
                    {isLatestCopied ? (
                      <>
                        <Check className="w-4 h-4" /> Prompt Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copiar Prompt
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </>
      )}

      {currentView === 'estrategias' && <EstrategiasTab />}
      {currentView === 'conectores' && <ConectoresTab />}
      {currentView === 'atualizacoes' && <UpdatesTab />}
      {currentView === 'comunidade' && <CommunityTab />}
      {currentView === 'tutoriais' && <TutoriaisTab />}
      {currentView === 'perfil' && <ProfileTab />}
      {currentView === 'upsell' && <UpsellTab />}
    </main>

      {/* Initial Tutorial Popup Modal */}
      <AnimatePresence>
        {showInitialPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-[6px]"
              onClick={() => setShowInitialPopup(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-[520px] bg-[#131313] border border-white/10 rounded-[20px] overflow-hidden shadow-2xl z-10 flex flex-col p-8 isolate text-left"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-yellow-500/5 blur-[80px] rounded-full pointer-events-none -z-10" />
              
              <div className="inline-flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-3 py-1 text-[11px] font-semibold text-yellow-500 tracking-wider uppercase mb-5 w-fit">
                ⚡ Bem-vindo à Biblioteca
              </div>
              
              <h3 className="text-white font-[Space_Grotesk] font-bold text-4xl leading-[1.1] tracking-wide mb-2">
                Sua central de<br /><span className="text-yellow-500">prompts de elite</span>
              </h3>
              
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Aqui você encontra prompts prontos para copiar e usar em qualquer IA — organizados por objetivo, plataforma e ferramenta.
              </p>
              
              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 mb-6 flex gap-3 items-start">
                <div className="text-xl shrink-0 mt-0.5">🗺️</div>
                <div className="text-[13px] text-gray-400 leading-relaxed">
                  <strong className="text-yellow-500">Novo por aqui? Comece pelas Estratégias.</strong><br />
                  Na aba <strong>Estratégias</strong> você encontra jornadas passo a passo que combinam múltiplos prompts para atingir um objetivo real — como ganhar seguidores, criar funis ou vender no direct. É o melhor ponto de partida.
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button 
                  onClick={() => {
                    setShowInitialPopup(false);
                    setTimeout(() => {
                      setCurrentView('estrategias');
                    }, 100);
                  }}
                  className="flex-1 py-3 px-6 rounded-full bg-yellow-500 text-black font-bold flex items-center justify-center gap-2 hover:bg-yellow-400 transition-all tracking-wide text-[13px] shadow-[0_0_20px_-5px_rgba(234,179,8,0.3)]"
                >
                  🗺️ Ver Estratégias primeiro
                </button>
                <button 
                  onClick={() => setShowInitialPopup(false)}
                  className="py-3 px-5 rounded-full bg-transparent border border-white/10 text-gray-400 font-medium hover:border-white/30 hover:text-white transition-colors text-[13px]"
                >
                  Explorar biblioteca
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
