import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { useRef } from 'react';

const MODULES = [
  { title: "O Produto Irresistível", image: "https://i.imgur.com/wCxMl8O.png", aulas: "5 AULAS" },
  { title: "O Funil Perfeito", image: "https://i.imgur.com/buzWs2k.png", aulas: "4 AULAS" },
  { title: "Copy e Promessa", image: "https://i.imgur.com/zgNk1jI.png", aulas: "6 AULAS" },
  { title: "Estrutura da Página", image: "https://i.imgur.com/Lz97F88.png", aulas: "3 AULAS" },
  { title: "Instagram Magnético", image: "https://i.imgur.com/zsqwveK.png", aulas: "8 AULAS" },
  { title: "Criativos que Vendem", image: "https://i.imgur.com/YqVTR55.png", aulas: "5 AULAS" },
  { title: "Tráfego e Escala", image: "https://i.imgur.com/pGExoyd.png", aulas: "7 AULAS" },
  { title: "Automação 24h", image: "https://i.imgur.com/6kbASqC.png", aulas: "4 AULAS" },
  { title: "Venda Invisível", image: "https://i.imgur.com/uCZdkK7.png", aulas: "3 AULAS" },
  { title: "Esteira de LTV", image: "https://i.imgur.com/Mk96mYk.png", aulas: "2 AULAS" },
  { title: "Retenção Máxima", image: "https://i.imgur.com/Lkow5Xz.png", aulas: "3 AULAS" },
  { title: "Métricas de Ouro", image: "https://i.imgur.com/xRqTvBC.png", aulas: "5 AULAS" }
];

export default function UpsellTab() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 pb-24 flex flex-col pt-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        {/* Main Banner */}
        <div className="relative w-full h-[250px] md:h-[350px] rounded-2xl md:rounded-3xl overflow-hidden mb-12 group border border-neutral-800/80 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
          <img 
            src="https://i.imgur.com/PU8zDsT.jpeg" 
            alt="Banner background" 
            className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000"
          />
          
          <div className="absolute inset-0 z-20 flex items-center justify-between p-8 md:p-14">
            <div className="flex flex-col gap-3 md:gap-5 max-w-xl">
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-widest uppercase font-[Space_Grotesk]">
                Maquina de Vendas
              </h1>
              <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-lg w-fit text-xs md:text-sm font-semibold text-neutral-300">
                12 Módulos
              </div>
            </div>

            {/* Circular Progress */}
            <div className="hidden md:flex items-center justify-center relative w-28 h-28">
               <svg className="w-full h-full transform -rotate-90">
                 <circle cx="56" cy="56" r="46" fill="transparent" stroke="#222" strokeWidth="8" />
                 <circle cx="56" cy="56" r="46" fill="transparent" stroke="#fff" strokeWidth="8" strokeDasharray="289" strokeDashoffset="289" className="transition-all duration-1000 ease-out" />
               </svg>
               <span className="absolute text-white font-bold text-lg">0%</span>
            </div>
          </div>
        </div>

        {/* Carousel Title */}
        <h3 className="text-white font-[Space_Grotesk] font-bold text-xl md:text-2xl mb-6 px-2">
          Módulos do Curso
        </h3>

        {/* Carousel Section */}
        <div className="relative w-full group/carousel">
          {/* Scroll Buttons */}
          <button 
            onClick={() => scroll('left')} 
            className="absolute left-4 md:-left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-black/60 backdrop-blur-md border border-neutral-700 text-white rounded-full items-center justify-center hover:bg-neutral-800 hover:scale-110 transition-all opacity-0 group-hover/carousel:opacity-100 hidden md:flex"
          >
            <ChevronLeft className="w-6 h-6 mr-1" />
          </button>
          
          <button 
            onClick={() => scroll('right')} 
            className="absolute right-4 md:-right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-black/60 backdrop-blur-md border border-neutral-700 text-white rounded-full items-center justify-center hover:bg-neutral-800 hover:scale-110 transition-all opacity-0 group-hover/carousel:opacity-100 hidden md:flex"
          >
            <ChevronRight className="w-6 h-6 ml-1" />
          </button>

          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-4 md:gap-5 pb-8 no-scrollbar snap-x snap-mandatory px-2"
          >
            {MODULES.map((mod, idx) => (
              <div 
                key={idx} 
                className="w-[160px] md:w-[240px] aspect-[4/5] shrink-0 snap-start relative group rounded-2xl md:rounded-3xl overflow-hidden border border-neutral-800/80 bg-neutral-900 cursor-pointer shadow-xl hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.2)] hover:border-emerald-500/30 transition-all duration-500"
              >
                <img 
                  src={mod.image} 
                  alt={mod.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  loading="lazy"
                />
                
                <div className="absolute inset-0 bg-black/40 hidden md:flex items-center justify-center z-10">
                   <Lock className="w-10 h-10 text-white/60 mb-8" />
                </div>
                <div className="absolute inset-0 bg-black/40 flex md:hidden items-center justify-center z-10">
                   <Lock className="w-8 h-8 text-white/60 mb-6" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Copy Section */}
        <div className="mt-20 max-w-3xl mx-auto w-full flex flex-col gap-12">
          
          <div className="text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white font-[Space_Grotesk]">
              Os prompts entregam o quê fazer.
            </h2>
            <p className="text-lg md:text-xl text-neutral-400 leading-relaxed max-w-2xl mx-auto">
              O treinamento mostra o como executar — e como transformar cada resultado em seguidores qualificados 
              e vendas reais. São dois lados da mesma estratégia.
            </p>
          </div>

          <div className="bg-[#111113] border border-neutral-800/80 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
            
            <h3 className="text-xl md:text-2xl font-bold text-white mb-8 text-center font-[Space_Grotesk]">
              O que você vai conquistar com o treinamento:
            </h3>

            <div className="space-y-4 mb-12">
              {[
                { label: "Criação de funis de venda", value: "R$ 497,00" },
                { label: "Criação de produtos (100% repasse)", value: "R$ 997,00" },
                { label: "Criação de miniapplicativos", value: "R$ 497,00" },
                { label: "Automações de Manychat", value: "R$ 297,00" },
                { label: "Tráfego orgânico (Roteiros/Copy)", value: "R$ 297,00" },
                { label: "Tráfego pago prático", value: "R$ 597,00" },
                { label: "Templates de Funis prontos", value: "R$ 197,00" },
                { label: "Acesso vitalício", value: "R$ 197,00" },
                { label: "Suporte Via WhatsApp", value: "R$ 497,00" },
                { label: "Comunidade de alunos", value: "R$ 697,00" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 border-b border-neutral-800/50 last:border-0 group/item">
                  <span className="text-sm md:text-base text-neutral-300 font-medium group-hover/item:text-white transition-colors flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                    {item.label}
                  </span>
                  <span className="text-sm md:text-base text-neutral-500 font-bold line-through opacity-80 decoration-neutral-500/50">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-neutral-900 border border-emerald-500/20 rounded-2xl p-8 md:p-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent)] pointer-events-none" />
              
              <div className="relative z-10 flex flex-col items-center gap-4">
                <h4 className="text-2xl md:text-3xl font-black text-white font-[Space_Grotesk] uppercase tracking-wide">
                  Máquina de Vendas
                </h4>
                <p className="text-emerald-400 font-medium mb-4">
                  Do produto ao pagamento — no piloto automático.
                </p>

                <div className="space-y-1 mb-8">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <p className="text-neutral-500 line-through font-medium">DE R$ 4.770,00</p>
                    <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      97% OFF
                    </div>
                  </div>
                  
                  <p className="text-neutral-400 text-sm font-medium mt-6 uppercase tracking-widest">
                    Por apenas
                  </p>
                  
                  <div className="flex items-baseline justify-center gap-2 mt-1">
                    <span className="text-2xl md:text-3xl font-bold text-white">12X</span>
                    <span className="text-5xl md:text-7xl font-black text-emerald-400 font-[Space_Grotesk] tracking-tighter">
                      R$ 10,02
                    </span>
                  </div>
                  
                  <p className="text-neutral-500 text-sm font-medium mt-3">
                    OU R$ 97,00 À VISTA
                  </p>
                </div>

                <a 
                  href="https://pay.cakto.com.br/62cSDiK"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full block text-center px-8 py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl text-lg uppercase tracking-wide transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)]"
                >
                  Quero Acessar Agora
                </a>
                <div className="text-xs text-neutral-500 flex items-center justify-center gap-2 mt-2">
                  <Lock className="w-3 h-3" />
                  Compra 100% Segura
                </div>
              </div>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
