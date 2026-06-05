import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Network, Zap, Sparkles, ChevronDown, CheckCircle2, Link as LinkIcon, Database, Video, ChevronRight, Lock, X, Copy, Check } from 'lucide-react';

const STRATEGIES = [
  {
    id: 1,
    category: "Instagram",
    tag: "instagram",
    title: "Como ganhar seguidores rápido",
    desc: "Crescimento orgânico acelerado usando conteúdo de alto valor, temas virais e publicação estratégica. A lógica: volume de valor + consistência + CTA certa = crescimento composto.",
    gradient: "from-[#1a0533] via-[#3d0068] to-[#1a0533]",
    steps: 5,
    connectors: ["ChatGPT", "Claude"],
    steps_data: [
      {
        action: "Mapeie os 30 temas que sua audiência quer ver. Antes de postar qualquer coisa, descubra os assuntos que seu nicho consome com obsessão. Isso evita criar no escuro.",
        prompt: "30 Temas de Conteúdo do Nicho",
        connector: null
      },
      {
        action: "Para cada tema, crie um título que interrompe o scroll. Sem um gancho irresistível, nem o melhor conteúdo ganha visualização. Gere opções e escolha os mais fortes.",
        prompt: "10 Títulos Cativantes TikTok",
        connector: null
      },
      {
        action: "Produza Reels curtos com roteiro preciso de 30 segundos. Reels são o principal motor de alcance no Instagram hoje. Use AIDA: prenda em 2s, agite, resolva, chame para ação.",
        prompt: "Roteiro Reels AIDA 30s",
        connector: null
      },
      {
        action: "Analise o desempenho com Windsor.ai conectado ao Claude. Conecte o Windsor.ai no Claude para puxar os dados de engajamento e alcance dos seus posts. Peça ao Claude para identificar quais temas performaram melhor e dobrar neles.",
        prompt: "Social Media War Machine",
        connector: "Windsor.ai + Claude"
      },
      {
        action: "Monte uma linha editorial semanal baseada no que funcionou. Com os dados em mãos, crie a semana seguinte de conteúdo já otimizada — posts certos nos dias certos, formatos certos para cada objetivo.",
        prompt: "Linha Editorial Semanal",
        connector: null
      }
    ]
  },
  {
    id: 2,
    category: "Conteúdo",
    tag: "conteudo",
    title: "Como criar carrosséis que vendem",
    desc: "Carrosséis têm o maior rate de salvamento do Instagram. A fórmula: primeiro slide interrompe o scroll, slides do meio educam e criam tensão, último slide vende sem parecer venda.",
    gradient: "from-[#0a2a4a] via-[#0d4a8a] to-[#0a2a4a]",
    steps: 4,
    connectors: ["Claude", "Canva"],
    steps_data: [
      {
        action: "Identifique a maior dor que seu público sente agora. Carrossel que resolve uma dor urgente é salvo. Carrossel genérico é ignorado. Comece sempre pelo problema mais quente.",
        prompt: "20 Maiores Dores do Cliente",
        connector: null
      },
      {
        action: "Crie a estrutura completa do carrossel com retenção psicológica. Use o Carousel Architect para montar slide a slide — com hook de parada, escalada emocional, loops de curiosidade e CTA invisível.",
        prompt: "Carousel Architect",
        connector: null
      },
      {
        action: "Design os slides diretamente no Canva via Claude. Com o conector Canva conectado no Claude, peça para criar os slides já com o visual do seu brand kit. O Claude envia o conteúdo de cada slide diretamente para o Canva — pronto para ajuste final.",
        prompt: "Carousel Architect",
        connector: "Canva + Claude"
      },
      {
        action: "Adicione CTA estratégico no último slide. Não termina com 'siga para mais'. Termine com uma pergunta que gera comentário, ou um convite para o próximo passo da jornada de compra.",
        prompt: "Psychological CTA Builder",
        connector: null
      }
    ]
  },
  {
    id: 3,
    category: "Conteúdo",
    tag: "conteudo",
    title: "Como criar roteiros que prendem a atenção",
    desc: "95% dos Reels perdem o espectador nos primeiros 3 segundos. A solução é engenharia de retenção: cada segundo deve criar uma razão para assistir o próximo.",
    gradient: "from-[#1a0a00] via-[#5a2000] to-[#1a0a00]",
    steps: 4,
    connectors: ["ChatGPT", "Claude"],
    steps_data: [
      {
        action: "Defina o gatilho emocional central antes de escrever uma palavra. Medo, curiosidade, ambição, raiva — qual emoção você vai ativar? Tudo no roteiro gira em torno dessa emoção.",
        prompt: "Attention Manipulation System",
        connector: null
      },
      {
        action: "Crie o roteiro completo com pacing e estrutura de cenas. Use o Reels Director para gerar hook dos primeiros 3 segundos, estrutura de cenas, B-roll sugerido, legendas e CTA final.",
        prompt: "Reels Director",
        connector: null
      },
      {
        action: "Mute o vídeo e veja se ainda faz sentido. Se sem áudio o vídeo perder o fio, o roteiro precisa de mais apoio visual. Refine com o comando de refinamento.",
        prompt: "Comandos de Refinamento de Texto",
        connector: null
      },
      {
        action: "Mute o áudio e teste o gancho visual sozinho. Adapte o roteiro para diferentes plataformas — TikTok, Reels, YouTube Shorts — ajustando duração e energia de acordo com cada audiência.",
        prompt: "YouTube Retention Architect",
        connector: null
      }
    ]
  },
  {
    id: 4,
    category: "Conteúdo",
    tag: "conteudo",
    title: "Como criar ganchos que viralizam",
    desc: "O gancho é tudo. Não importa o conteúdo: se o primeiro segundo não parar o scroll, não existe. A engenharia do gancho envolve tensão, promessa e incompletude.",
    gradient: "from-[#001a10] via-[#003d20] to-[#001a10]",
    steps: 3,
    connectors: ["ChatGPT", "Claude"],
    steps_data: [
      {
        action: "Entenda o que ativa atenção compulsiva na sua audiência específica. Feeds diferentes, emoções diferentes. Use o sistema de atenção para mapear os gatilhos exatos do seu público — o que os faz parar vs. o que os faz rolar.",
        prompt: "Attention Manipulation System",
        connector: null
      },
      {
        action: "Mute o conteúdo existente e injete ganchos de alto impacto. Pegue um conteúdo que não performou bem e passe pelo Viral Content Mutation. O sistema vai identificar por que falhou e transformar o hook, a abertura e o pacing.",
        prompt: "Viral Content Mutation",
        connector: null
      },
      {
        action: "Crie 5 variações do mesmo gancho e teste qual converte mais. A viralização é um processo de iteração. Crie múltiplas versões do mesmo conteúdo com ganchos diferentes — depois analisando dados com Windsor.ai para descobrir qual versão ressoou.",
        prompt: "Narrative Hook Engine",
        connector: "Windsor.ai + Claude"
      }
    ]
  },
  {
    id: 5,
    category: "Vendas",
    tag: "vendas",
    title: "Como vender no direct sem parecer vendedor",
    desc: "Venda no DM não é pitch. É conversa cirúrgica que leva o lead a chegar à conclusão de que precisa do produto sozinho. SPIN invisível, objeções dissolvidas, fechamento natural.",
    gradient: "from-[#0a1a00] via-[#1a4a00] to-[#0a1a00]",
    steps: 5,
    connectors: ["ChatGPT", "Claude"],
    steps_data: [
      {
        action: "Mapeie as objeções reais antes de abrir o DM. Todo lead tem medos e resistências antes de comprar. Identifique quais objeções aparecem mais no seu nicho para já ter as respostas preparadas.",
        prompt: "Objection Destroyer",
        connector: null
      },
      {
        action: "Crie o fluxo completo de conversa: abertura → qualificação → fechamento. O DM Closer Engine gera mensagens de abertura, perguntas de qualificação emocional, transições conversacionais e CTA de fechamento — tudo em sequence natural.",
        prompt: "DM Closer Engine",
        connector: null
      },
      {
        action: "Configure sua oferta com lógica de preço psicológico. Antes de apresentar o preço, estruture a percepção de valor com ancoragem correta. Preço sem contexto de valor sempre parece caro.",
        prompt: "NeuroPricing Engine",
        connector: null
      },
      {
        action: "Crie prova social que dissolve a última resistência. Depoimentos na hora certa da conversa eliminam o risco percebido. Structure os depoimentos certos para o momento certo da jornada.",
        prompt: "Social Proof Architect",
        connector: null
      },
      {
        action: "Feche com CTA que parece continuação natural da conversa. A última mensagem não pode parecer pressão. Use CTAs psicológicos que parecem uma próxima etapa lógica, não uma venda forçada.",
        prompt: "Psychological CTA Builder",
        connector: null
      }
    ]
  },
  {
    id: 6,
    category: "Funis",
    tag: "funil",
    title: "Como criar um funil completo do zero",
    desc: "Funil sem estratégia é só um site com formulário. Um funil real move o lead de desconhecido a comprador através de conteúdo certo, na hora certa, para a pessoa certa.",
    gradient: "from-[#1a1a00] via-[#4a3a00] to-[#1a1a00]",
    steps: 6,
    connectors: ["ChatGPT", "Claude", "Canva"],
    steps_data: [
      {
        action: "Mapeie toda a jornada do cliente: topo, meio e fundo. Antes de criar qualquer página, entenda o nível de consciência do seu lead em cada etapa. Topo ignora o problema, meio busca soluções, fundo compara opções.",
        prompt: "Funil de Vendas Completo",
        connector: null
      },
      {
        action: "Crie a oferta principal com mecanismo único irresistível. O que diferencia sua oferta de todas as outras? Sem mecanismo único, você compete em preço. Com mecanismo único, você compete em categoria.",
        prompt: "Offer Engineer",
        connector: null
      },
      {
        action: "Construa a landing page completa com copywriting de conversão. Título focado na transformação, benefícios em bullet, prova social posicionada corretamente e CTA sem atrito.",
        prompt: "Landing Page Completa",
        connector: null
      },
      {
        action: "Crie a página de vendas com estrutura psicológica completa. A Sales Page Architect gera headline, abertura emocional, amplificação do problema, mecanismo, breakdown da oferta, provas e urgência.",
        prompt: "Sales Page Architect",
        connector: null
      },
      {
        action: "Design as páginas no Canva via Claude conectado. Com o conector Canva ativo no Claude, envie o copy da landing page e peça para criar o design visual das páginas usando seu brand kit — economizando horas de design.",
        prompt: "Landing Page Completa",
        connector: "Canva + Claude"
      },
      {
        action: "Crie o conteúdo de cada etapa do funil para aquecer o lead. Topo: vídeos de atração. Meio: carrosséis de educação e autoridade. Fundo: depoimentos e oferta direta. Cada peça empurra para a próxima etapa.",
        prompt: "Funil de Vendas Completo",
        connector: null
      }
    ]
  },
  {
    id: 7,
    category: "Instagram",
    tag: "instagram",
    title: "Como posicionar autoridade no Instagram",
    desc: "Autoridade não é o que você diz sobre si mesmo — é o que sua audiência concluiu sozinha a partir do seu conteúdo. A engenharia de percepção é sistemática, não sorte.",
    gradient: "from-[#1a0028] via-[#4a0080] to-[#1a0028]",
    steps: 5,
    connectors: ["ChatGPT", "Claude"],
    steps_data: [
      {
        action: "Defina o posicionamento de autoridade que você quer ocupar. Qual é a categoria que você quer dominar? Não 'coach de marketing' — algo específico e proprietário que só você ocupa.",
        prompt: "Authority Positioning Engine",
        connector: null
      },
      {
        action: "Crie o diagnóstico completo e a estratégia de conteúdo. A Estratégia Instagram Completa gera pilares criativos, cronograma, ganchos, CTAs e tom de voz alinhados ao posicionamento de autoridade.",
        prompt: "Estratégia Instagram Completa",
        connector: null
      },
      {
        action: "Construa prova social em cada formato de conteúdo. Depoimentos no Stories, resultados de clientes nos carrosséis, números e transformações nos Reels. Prova social posicionada certo acelera autoridade.",
        prompt: "Social Proof Architect",
        connector: null
      },
      {
        action: "Ative comentários estratégicos para criar percepção de comunidade. Comentários são prova social pública. Use o Comment Manipulation System para criar conteúdo que gera debate e participação ativa.",
        prompt: "Comment Manipulation System",
        connector: null
      },
      {
        action: "Monitore a percepção da audiência com dados reais. Conecte Windsor.ai no Claude para analisar quais posts geraram mais salvamentos, comentários e DMs espontâneos — indicadores de autoridade percebida.",
        prompt: "Social Media War Machine",
        connector: "Windsor.ai + Claude"
      }
    ]
  }
];

const FILTERS = [
  { id: 'all', label: 'Todas' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'vendas', label: 'Vendas' },
  { id: 'funil', label: 'Funis' },
  { id: 'claude', label: 'Claude + Conectores' },
  { id: 'conteudo', label: 'Conteúdo' }
];

export default function EstrategiasTab() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [openCardId, setOpenCardId] = useState<number | null>(null);
  const [copiedStepIndex, setCopiedStepIndex] = useState<number | null>(null);

  const filteredStrategies = STRATEGIES.filter(s => activeFilter === 'all' || s.tag === activeFilter);

  const toggleCard = (id: number) => {
    setOpenCardId(id);
    setCopiedStepIndex(null);
  };
  
  const handleCopyPrompt = (prompt: string, idx: number) => {
    navigator.clipboard.writeText(prompt);
    setCopiedStepIndex(idx);
    setTimeout(() => setCopiedStepIndex(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto flex flex-col items-center"
    >
      {/* Header Section */}
      <div className="text-center relative pb-10">
        <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-yellow-500 mb-4 px-3 py-1 bg-yellow-500/10 rounded-full border border-yellow-500/20">
          <Network className="w-4 h-4" />
          Jornadas Completas
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white font-[Space_Grotesk] uppercase tracking-wide leading-tight mb-4">
          Estratégias <span className="text-yellow-500">de Conteúdo</span>
        </h1>
        <p className="text-neutral-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Combinações inteligentes de prompts — com conectores avançados — para atingir objetivos reais passo a passo.
        </p>
        
        {/* Decorative divider */}
        <div className="mt-8 flex justify-center">
          <div className="w-16 h-1 bg-yellow-500 rounded-full" />
        </div>
      </div>

      {/* Stats Section */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-10 w-full">
        {[
          { label: "estratégias", value: "7" },
          { label: "passos mapeados", value: "32" },
          { label: "conectores", value: "6" },
          { label: "achismo", value: "0" }
        ].map((stat, idx) => (
          <div key={idx} className="bg-neutral-900 border border-neutral-800 rounded-full px-5 py-2.5 flex items-center gap-2 text-sm text-neutral-300">
            <strong className="text-yellow-500 font-black">{stat.value}</strong> {stat.label}
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {FILTERS.map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300
              ${activeFilter === filter.id 
                ? 'bg-yellow-500 text-black shadow-[0_0_20px_-5px_rgba(234,179,8,0.4)] border border-yellow-500' 
                : 'bg-neutral-900/50 text-neutral-400 border border-neutral-800 hover:border-neutral-600 hover:text-white'
              }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full text-left">
        <AnimatePresence mode="popLayout">
          {filteredStrategies.map((strategy) => {
            const isOpen = openCardId === strategy.id;
            
            return (
              <motion.div
                key={strategy.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`bg-[#111] border rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer
                  ${isOpen ? 'border-yellow-500/40 shadow-lg shadow-yellow-500/10' : 'border-neutral-800 hover:border-neutral-600'}`}
                onClick={() => toggleCard(strategy.id)}
              >
                {/* Visual Header */}
                <div className={`h-36 relative flex flex-col justify-end p-5 bg-gradient-to-br ${strategy.gradient} overflow-hidden`}>
                  
                  <div className="absolute top-4 right-4 flex flex-wrap justify-end gap-1.5 z-10">
                    {strategy.connectors.map((c, i) => (
                      <span key={i} className="bg-black/60 backdrop-blur-md border border-white/15 rounded-full px-2.5 py-1 text-[10px] font-bold text-white/90">
                        {c}
                      </span>
                    ))}
                  </div>

                  <div className="relative z-10 flex items-center gap-2 text-xs font-bold text-white/90 uppercase tracking-wider">
                    <span className="bg-yellow-500 text-black px-2.5 py-0.5 rounded-full font-black">
                      {strategy.steps}
                    </span>
                    passos
                  </div>
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                </div>

                {/* Card Body */}
                <div className="p-5">
                  <div className="text-[10px] font-black tracking-[0.15em] uppercase text-yellow-500 mb-2">
                    {strategy.category}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                    {strategy.title}
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed mb-6">
                    {strategy.desc}
                  </p>
                  
                  <button className={`w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition-all
                    ${isOpen ? 'bg-yellow-500/15 text-yellow-500 border border-yellow-500/30' : 'bg-neutral-800 text-neutral-300 border border-neutral-700 group-hover:bg-neutral-700'}`}>
                    Ver passo a passo
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      {/* Content wrapper closes here */}
      
      {/* Detail Modal overlay */}
      <AnimatePresence>
        {openCardId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                setOpenCardId(null);
              }}
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-[#111] border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col w-full max-w-4xl max-h-[85vh] z-10"
            >
              {(() => {
                const strategy = STRATEGIES.find(s => s.id === openCardId);
                if (!strategy) return null;

                return (
                  <>
                    {/* Modal Header */}
                    <div className="shrink-0 p-6 md:p-8 border-b border-neutral-800 bg-neutral-900/50 relative overflow-hidden">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenCardId(null);
                        }}
                        className="absolute right-6 top-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors z-20"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      
                      <div className="relative z-10 pr-12">
                        <div className="text-[10px] font-black tracking-[0.15em] uppercase text-yellow-500 mb-3 block">
                          {strategy.category}
                        </div>
                        <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight mb-4">
                          {strategy.title}
                        </h2>
                        <p className="text-neutral-400 leading-relaxed text-sm md:text-base max-w-3xl">
                          {strategy.desc}
                        </p>
                      </div>
                    </div>

                    {/* Modal Body / Steps */}
                    <div className="overflow-y-auto p-6 md:p-10 no-scrollbar relative min-h-[50vh]">
                       <div className="text-[10px] font-bold tracking-[0.1em] text-neutral-500 uppercase mb-8">
                        Jornada Completa ({strategy.steps} passos)
                      </div>
                      
                      <div className="space-y-0 relative border-l-2 border-neutral-800/80 ml-4 max-w-3xl">
                        {strategy.steps_data.map((step, idx) => (
                          <div key={idx} className="relative pb-10 last:pb-0 pl-10 group/step">
                            {/* Step Number Dot */}
                            <div className="absolute left-[-17px] top-0 w-8 h-8 rounded-full bg-[#111] border border-neutral-700 group-hover/step:border-yellow-500 flex items-center justify-center text-xs font-bold text-yellow-500 transition-colors z-10">
                              {idx + 1}
                            </div>
                            
                            <div className="relative pt-1">
                              {step.connector && (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-bold text-blue-400 mb-4">
                                  <LinkIcon className="w-3 h-3" />
                                  {step.connector}
                                </div>
                              )}
                              
                              <p className="text-sm md:text-base text-neutral-300 leading-relaxed mb-6 font-medium">
                                {step.action}
                              </p>
                              
                              {/* Prompt Copy Card */}
                              <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between group/btn hover:border-yellow-500/30 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
                                    <Zap className="w-5 h-5 text-yellow-500" />
                                  </div>
                                  <div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-0.5">Prompt sugerido</div>
                                    <div className="text-sm md:text-base font-semibold text-white group-hover/btn:text-yellow-500 transition-colors">
                                      {step.prompt}
                                    </div>
                                  </div>
                                </div>
                                
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyPrompt(step.prompt, idx);
                                  }}
                                  className="w-full md:w-auto px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-sm font-semibold flex items-center justify-center md:justify-start gap-2 transition-colors shrink-0 whitespace-nowrap"
                                >
                                  {copiedStepIndex === idx ? (
                                    <>
                                      <Check className="w-4 h-4 text-emerald-400" />
                                      <span className="text-emerald-400">Copiado</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-4 h-4" />
                                      Copiar
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
