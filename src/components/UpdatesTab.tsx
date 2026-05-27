import { motion } from 'motion/react';
import { Calendar, Zap, Star, ShieldCheck } from 'lucide-react';

export default function UpdatesTab() {
  const updates = [
    {
      id: 1,
      date: '26 de Maio, 2026',
      title: 'Mega Expansão da Biblioteca 🚀',
      description: 'Adicionamos mais de 80 novos prompts avançados em categorias estratégicas como Agentes de IA, NeuroPricing e Retenção para Reels e YouTube. Agora você tem o arsenal completo nas mãos.',
      icon: <Zap className="w-5 h-5 text-yellow-500" />
    },
    {
      id: 2,
      date: '20 de Maio, 2026',
      title: 'Sistema de Curtidas em Cards ❤️',
      description: 'Você pediu e nós estregamos! Agora é possível interagir com os cards da biblioteca clicando duas vezes sobre a imagem, exatamente como no feed do Instagram.',
      icon: <HeartIcon className="w-5 h-5 text-red-500" />
    },
    {
      id: 3,
      date: '10 de Maio, 2026',
      title: 'Lançamento Oficial da Plataforma 🎉',
      description: 'A primeira versão do CodigoDaIA foi ao ar, unindo criadores de conteúdo e engenheiros de prompt em um só lugar.',
      icon: <Star className="w-5 h-5 text-blue-500" />
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-20 text-left">
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="mb-10 text-center"
      >
        <h1 className="font-[Space_Grotesk] text-3xl md:text-5xl font-bold tracking-tighter mb-4 text-white">
          Últimas <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">Atualizações</span>
        </h1>
        <p className="text-gray-400 text-sm md:text-base font-medium max-w-2xl mx-auto mb-6">
          Acompanhe todas as novidades, melhorias e novos prompts que chegam na plataforma a cada semana.
        </p>
      </motion.div>

      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-800 before:to-transparent">
        {updates.map((update, idx) => (
          <motion.div 
            key={update.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
          >
            {/* Icon marker */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-neutral-800 bg-black shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              {update.icon}
            </div>

            {/* Content card */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#0c0c0e] border border-neutral-900 rounded-3xl p-6 shadow-xl hover:border-yellow-500/30 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <time className="font-mono text-xs text-gray-500">{update.date}</time>
              </div>
              <h3 className="font-bold text-lg text-white mb-2">{update.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{update.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function HeartIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}
