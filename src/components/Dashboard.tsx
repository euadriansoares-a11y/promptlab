import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CATEGORIES } from '../data';
import { Copy, Check, Sparkles, LogOut, Terminal, Heart, ChevronRight, Zap, Play, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const VerifiedBadge = () => (
  <svg className="w-3.5 h-3.5 text-[#0095f6] fill-current shrink-0 inline-block ml-1 align-middle" viewBox="0 0 24 24">
    <path d="M12 2L15.09 4.36L19 4L18.64 7.91L21 11L18.64 14.09L19 18L15.09 17.64L12 20L8.91 17.64L5 18L5.36 14.09L3 11L5.36 7.91L5 4L8.91 4.36L12 2M10.09 13.73L7.5 11.14L6.09 12.55L10.09 16.55L18 8.64L16.59 7.23L10.09 13.73Z" />
  </svg>
);

export default function Dashboard() {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [activeSlides, setActiveSlides] = useState<{ [id: number]: number }>({});
  const [likedIds, setLikedIds] = useState<number[]>([]);
  const [doubleClickedId, setDoubleClickedId] = useState<number | null>(null);
  const [playingTutorials, setPlayingTutorials] = useState<{ [id: string]: boolean }>({});
  const [showInitialPopup, setShowInitialPopup] = useState(true);

  useEffect(() => {
    async function fetchPrompts() {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from('prompts')
          .select('*')
          .order('id', { ascending: true });
        
        if (error) {
          console.error("Erro ao carregar prompts:", error);
        } else if (data) {
          setPrompts(data);
        }
      } catch (err) {
        console.error("Erro de exceção ao carregar prompts:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPrompts();
  }, []);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
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
             onClick={() => document.getElementById('tutoriais')?.scrollIntoView({ behavior: 'smooth' })}
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

      <main className="w-full max-w-7xl mx-auto px-4 md:px-6 py-12 relative z-10 flex flex-col items-center text-center">
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

        {/* Tutorial Section (Bottom) */}
        <div id="tutoriais" className="w-full max-w-5xl border border-neutral-900 bg-[#0c0c0e] rounded-3xl p-6 md:p-10 flex flex-col items-center gap-8 md:gap-12 mt-4 mb-20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-yellow-500/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="text-center z-10 w-full max-w-2xl">
            <h2 className="text-white font-[Space_Grotesk] font-extrabold text-2xl md:text-3xl mb-4 flex items-center justify-center gap-3">
              <span className="p-3 bg-yellow-500/10 rounded-full border border-yellow-500/20 text-yellow-500">
                <Play className="w-6 h-6 fill-yellow-500" />
              </span>
              Aprenda na Prática
            </h2>
            <p className="text-gray-400 text-sm md:text-base font-medium leading-relaxed">
              Ainda com dúvidas? Assista aos nossos tutoriais rápidos de como extrair todo o potencial de cada prompt no seu dia a dia.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full z-10">
            {/* Tutorial 1 */}
            <div className="w-full max-w-[280px] md:max-w-[300px] flex flex-col gap-3 group">
              <div className="w-full aspect-[9/16] bg-black rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl relative">
                  <iframe 
                    src="https://player.vimeo.com/video/1195755424?title=0&amp;byline=0&amp;portrait=0&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" 
                    frameBorder="0" 
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" 
                    referrerPolicy="strict-origin-when-cross-origin" 
                    className="w-full h-full absolute inset-0"
                    title="1 PASSO: Conecte o Claude no seu instagram"
                    allowFullScreen
                  ></iframe>
              </div>
              <h3 className="text-white text-center font-[Space_Grotesk] font-bold text-sm md:text-base">1 PASSO: Conecte o Claude no seu instagram</h3>
            </div>

            {/* Tutorial 2 */}
            <div className="w-full max-w-[280px] md:max-w-[300px] flex flex-col gap-3 group">
              <div className="w-full aspect-[9/16] bg-black rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl relative">
                  <iframe 
                    src="https://player.vimeo.com/video/1195756442?title=0&amp;byline=0&amp;portrait=0&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" 
                    frameBorder="0" 
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" 
                    referrerPolicy="strict-origin-when-cross-origin" 
                    className="w-full h-full absolute inset-0"
                    title="2 PASSO: Aprenda a usar a biblioteca de prompts"
                    allowFullScreen
                  ></iframe>
              </div>
              <h3 className="text-white text-center font-[Space_Grotesk] font-bold text-sm md:text-base">2 PASSO: Aprenda a usar a biblioteca de prompts</h3>
            </div>
          </div>
        </div>
      </main>

      {/* Initial Tutorial Popup Modal */}
      <AnimatePresence>
        {showInitialPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowInitialPopup(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-[#0c0c0e] border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col p-6 text-center isolate"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-yellow-500/10 blur-[50px] rounded-full pointer-events-none -z-10" />
              
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-yellow-500 fill-yellow-500 ml-1" />
              </div>
              
              <h3 className="text-white font-[Space_Grotesk] font-bold text-2xl mb-2">
                Assista o tutorial agora
              </h3>
              
              <p className="text-gray-400 text-sm mb-8">
                Descubra como extrair o máximo de cada prompt em poucos minutos.
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    setShowInitialPopup(false);
                    setTimeout(() => {
                      document.getElementById('tutoriais')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="w-full py-3.5 rounded-xl bg-yellow-500 text-black font-bold flex items-center justify-center gap-2 hover:bg-yellow-400 transition-colors shadow-[0_0_20px_-5px_rgba(234,179,8,0.4)]"
                >
                  <Play className="w-4 h-4 fill-black" /> Assistir
                </button>
                <button 
                  onClick={() => setShowInitialPopup(false)}
                  className="w-full py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-colors"
                >
                  Pular
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
