import { motion } from 'motion/react';
import { Play, Sparkles, BookOpen } from 'lucide-react';

export default function TutoriaisTab() {
  const tutoriais = [
    {
      id: 1,
      title: "1 PASSO: Conecte o Claude no seu instagram",
      videoUrl: "https://player.vimeo.com/video/1195755424?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479",
      description: "Aprenda a fazer a integração inicial e conectar sua conta do Instagram na IA, preparando o terreno.",
      duration: "05:22",
      category: "Configuração Inicial"
    },
    {
      id: 2,
      title: "2 PASSO: Aprenda a usar a biblioteca de prompts",
      videoUrl: "https://player.vimeo.com/video/1195756442?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479",
      description: "Um tour completo para você dominar a plataforma, encontrar os melhores prompts e copiar corretamente.",
      duration: "08:15",
      category: "Dominando a Plataforma"
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pb-24 text-left">
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="mb-12 text-center"
      >
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-500 font-semibold mb-4 tracking-wide uppercase">
          <BookOpen className="w-3.5 h-3.5" /> ACADEMIA
        </span>
        <h1 className="font-[Space_Grotesk] text-3xl md:text-5xl font-bold tracking-tighter mb-4 text-white">
          Aprenda na <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">Prática</span>
        </h1>
        <p className="text-gray-400 text-sm md:text-base font-medium max-w-2xl mx-auto">
          Assista aos nossos tutoriais rápidos de como extrair todo o potencial de cada prompt e configurar suas automações no dia a dia.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {tutoriais.map((tut, index) => (
          <motion.div 
            key={tut.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col gap-4 group"
          >
            <div className="w-full aspect-[9/16] bg-black rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl relative group-hover:border-yellow-500/30 transition-colors">
                <iframe 
                  src={tut.videoUrl} 
                  frameBorder="0" 
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" 
                  referrerPolicy="strict-origin-when-cross-origin" 
                  className="w-full h-full absolute inset-0"
                  title={tut.title}
                  allowFullScreen
                ></iframe>
                {/* Decorative overlay border */}
                <div className="absolute inset-0 border border-white/5 rounded-3xl pointer-events-none" />
            </div>

            <div className="px-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-md">
                  {tut.category}
                </span>
                <span className="text-xs font-mono text-gray-500 flex items-center gap-1">
                  <Play className="w-3 h-3" /> {tut.duration}
                </span>
              </div>
              <h3 className="text-white font-[Space_Grotesk] font-bold text-lg md:text-xl leading-tight mb-2">
                {tut.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {tut.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
