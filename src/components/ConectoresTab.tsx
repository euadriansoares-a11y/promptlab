import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, 
  Zap, 
  Sparkles, 
  HelpCircle, 
  Image as ImageIcon, 
  Video, 
  Mic, 
  TrendingUp, 
  Tv, 
  ArrowRight, 
  Check, 
  Copy, 
  AlertCircle, 
  FolderSync, 
  Lightbulb,
  Cpu
} from 'lucide-react';

interface PromptItem {
  title: string;
  text: string;
}

interface Connector {
  id: string;
  name: string;
  role: string;
  category: string;
  badge: string;
  icon: any; // Lucide Component
  bgGradient: string;
  whatIs: string;
  whatFor: string[];
  howToConnect: string[];
  note?: string;
  prompts: PromptItem[];
}

const CONNECTORS_DATA: Connector[] = [
  {
    id: "canva",
    name: "Canva",
    role: "Criação de Imagens e Design Visual",
    category: "Design",
    badge: "Oficial MCP (Julho/2025)",
    icon: ImageIcon,
    bgGradient: "from-purple-900/40 via-[#250d47]/40 to-black",
    whatIs: "O Canva é a plataforma de design mais usada por criadores de conteúdo no mundo. Conecta o Claude diretamente ao motor de design do Canva, permitindo criar, editar, redimensionar e exportar peças visuais sem sair de dentro do Claude.",
    whatFor: [
      "Criar posts de feed, carrosséis, stories e capas do YouTube",
      "Gerar designs com identidade visual de marca aplicada automaticamente (Brand Kit)",
      "Redimensionar uma peça para diferentes formatos de uma vez só",
      "Buscar designs existentes na sua conta",
      "Exportar arquivos como PNG, PDF ou outros formatos diretamente"
    ],
    howToConnect: [
      "Abra o Claude (web ou desktop)",
      "Clique no seu perfil (canto inferior esquerdo) e vá em Configurações de conta",
      "Acesse a aba de Integrações ou Conectores",
      "Procure por Canva e clique no botão Conectar",
      "Siga a autenticação fazendo login na sua conta do Canva e autorize o acesso",
      "Pronto — o conector ficará ativo em todas as novas conversas!"
    ],
    note: "O Claude é pioneiro no suporte à geração de designs com Brand Kits, aplicando de forma autônoma as cores, tipografias e logotipos cadastrados na sua conta.",
    prompts: [
      {
        title: "Prompt 1 — Carrossel de feed",
        text: "Crie um carrossel de 5 slides para o Instagram com o tema 'Como usar IA para criar conteúdo'. Use meu Brand Kit. O primeiro slide deve ter um título impactante e os seguintes devem trazer um ponto prático por slide."
      },
      {
        title: "Prompt 2 — Story de vendas",
        text: "Crie um story para vender o [nome do produto]. Use fundo escuro, texto grande e direto. A mensagem principal é: 'Você está perdendo tempo criando conteúdo do zero'. Inclua um CTA no último frame."
      },
      {
        title: "Prompt 3 — Capa do YouTube",
        text: "Crie uma capa para o YouTube com o título 'IA que cria Reels por você'. Quero rosto de um lado, título grande do outro, fundo com degradê escuro e destaque em laranja."
      },
      {
        title: "Prompt 4 — Redimensionamento",
        text: "Pegue o carrossel que acabei de criar e redimensione para os seguintes formatos: story vertical (9:16), post quadrado (1:1) e banner do LinkedIn (1584x396)."
      },
      {
        title: "Prompt 5 — Pesquisa de designs",
        text: "Busque nos meus designs do Canva todos os carrosséis que tenho sobre copywriting e me mostre os 3 mais recentes para eu escolher um para adaptar."
      }
    ]
  },
  {
    id: "runway",
    name: "Runway",
    role: "Criação de Vídeos com IA",
    category: "Vídeo",
    badge: "Oficial MCP (Maio/2026)",
    icon: Video,
    bgGradient: "from-amber-950/40 via-neutral-900/45 to-black",
    whatIs: "O Runway é a plataforma de geração de vídeo por IA mais avançada do mercado. Esse conector oficial permite que o Claude gere clipes cinematográficos, simulações físicas e comerciais inteiros mantendo todo o histórico e contexto da conversa.",
    whatFor: [
      "Gerar clipes de vídeo profissionais a partir de prompts descritivos de texto ou imagens enviadas",
      "Criar demonstrações realistas de produtos digitando apenas a URL do seu site",
      "Obter múltiplos modelos de última geração: Gen-4.5, Kling 3.0, Veo 3.1, Seedance 2.0",
      "Manter a consistência de personagens recorrentes entre diferentes gerações",
      "Salvar os arquivos gerados diretamente na biblioteca unificada de mídia da Runway"
    ],
    howToConnect: [
      "Acesse a página oficial runwayml.com/mcp",
      "No Claude, acesse Personalizar > Conectores no menu de configurações",
      "Clique em Adicionar Novo Conector e escolha a Runway",
      "Insira as credenciais da sua conta Runway e autorize a integração",
      "Não é necessário configurar chaves de API extras para este método oficial",
      "As gerações consumirão seus créditos Runway padrão conforme o modelo selecionado"
    ],
    note: "Dica de especialista: Use o Kling 3.0 para cenas focadas em movimentos orgânicos ou humanos; o Veo 3.1 para gerar vídeo acompanhado de efeitos sonoros nativos; e o Seedance 2.0 caso queira construir sequências de várias tomadas sem perder consistência estética.",
    prompts: [
      {
        title: "Prompt 1 — Vídeo de produto",
        text: "Use o Runway para criar um vídeo de 10 segundos para um produto de beleza. Cena: mãos femininas segurando o produto com luz natural suave ao fundo. Use o modelo Gen-4.5. Resultado em 1080x1920 para Reels."
      },
      {
        title: "Prompt 2 — Personagem com movimento",
        text: "Gere um vídeo de 8 segundos com uma mulher jovem, brasileira, sorrindo e apontando para o texto que aparece ao lado dela. Use o Kling 3.0 para garantir movimento natural."
      },
      {
        title: "Prompt 3 — Intro para vídeo",
        text: "Crie uma intro cinematográfica de 5 segundos para meu canal. Tema: inteligência artificial, cores escuras com laranja, estilo terminal de computador. Use Gen-4.5."
      },
      {
        title: "Prompt 4 — Vídeo com áudio ambiente",
        text: "Gere um vídeo de um café moderno, ambiente tranquilo, pessoas ao fundo desfocadas, pessoa digitando em notebook em primeiro plano. Inclua áudio ambiente natural. Use Veo 3.1."
      },
      {
        title: "Prompt 5 — Sequência de cenas",
        text: "Crie uma sequência de 3 cenas para um Reel de 30 segundos sobre rotina matinal de produtividade. Cena 1: acordar, luz natural. Cena 2: café sendo preparado. Cena 3: notebook aberto com anotações. Use Seedance 2.0 para manter consistência visual entre as cenas."
      }
    ]
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    role: "Criação de Áudio e Voz Realista",
    category: "Voz & Áudio",
    badge: "Oficial MCP (Abril/2025)",
    icon: Mic,
    bgGradient: "from-blue-950/40 via-[#0d1f3d]/40 to-black",
    whatIs: "A plataforma líder mundial em síntese de voz e inteligência de áudio. Permite converter qualquer roteiro do Claude em narrações fotorrealistas em português, clonar instantaneamente sua própria voz para agilizar criações e configurar voicebots nativos.",
    whatFor: [
      "Produzir locuções em áudio imediatas com entonações sob medida para Reels",
      "Clonar sua assinatura vocal de forma segura para narrar posts de bastidores",
      "Gerar múltiplos sotaques específicos de regiões do Brasil para campanhas direcionadas",
      "Converter áudios brutos ou gravações de reuniões diretamente em transcrições impecáveis",
      "Garantir a modulação perfeita de ritmo, entusiasmo ou mistério dependendo do tema"
    ],
    howToConnect: [
      "O conector ElevenLabs utiliza instalação local pelo app Claude Desktop",
      "Instale o gerenciador de pacotes 'uv' rodando: curl -LsSf https://astral.sh/uv/install.sh | sh",
      "Acesse a plataforma da ElevenLabs e gere sua API Key nas configurações de perfil",
      "Abra as preferências do Claude Desktop: Configurações > Desenvolvedor > Editar Configuração",
      "Insira o código do servidor MCP ElevenLabs na sessão mcpServers (veja o guia ou peça para nossa equipe)",
      "Reinicie o aplicativo Claude Desktop para ativar o módulo"
    ],
    note: "A conta inicial oferece um plano robusto com 10.000 créditos mensais gratuitos para geração e testes livres de sotaques.",
    prompts: [
      {
        title: "Prompt 1 — Narração de Reel",
        text: "Use o ElevenLabs para narrar o seguinte texto em português brasileiro, voz feminina, tom confiante e direto: 'Você não precisa aparecer para crescer no Instagram. O que você precisa é de um sistema. E eu vou te mostrar qual é.' Salve o arquivo como narracao_reel_01.mp3"
      },
      {
        title: "Prompt 2 — Clonagem de voz",
        text: "Quero clonar minha voz no ElevenLabs. Me instrua sobre o formato ideal do áudio de amostra que devo enviar e quantos segundos são necessários para uma clonagem de qualidade."
      },
      {
        title: "Prompt 3 — Voz para personagem fictício",
        text: "Crie uma voz feminina jovem, brasileira, energia alta e descontraída no ElevenLabs. Será usada para uma influenciadora fictícia de conteúdo sobre tecnologia. Sugira nome para a voz e gere um áudio de teste com a frase: 'Eu uso IA para tudo. Literalmente tudo.'"
      },
      {
        title: "Prompt 4 — Transcrição",
        text: "Transcreva o áudio que vou enviar e organize o conteúdo em: gancho principal, pontos desenvolvidos e chamada para ação. Quero usar a transcrição como base para um post de carrossel."
      },
      {
        title: "Prompt 5 — Pacotes de áudio modulado",
        text: "Gere 5 variações de narração para o mesmo texto, variando levemente o tom — uma mais séria, uma mais animada, uma mais sussurrada, uma mais rápida e uma mais pausada. Texto: 'Esse método me fez crescer 10 mil seguidores em 30 dias. Sem tráfego pago. Sem parceria. Só estratégia.' Quero escolher a melhor."
      }
    ]
  },
  {
    id: "metaads",
    name: "Meta Ads MCP",
    role: "Gestão e Escala de Tráfego Pago",
    category: "Tráfego",
    badge: "Oficial Meta (Abril/2026)",
    icon: TrendingUp,
    bgGradient: "from-blue-900/30 via-[#0a1e36]/30 to-black",
    whatIs: "Conector ultra robusto que expõe 29 ferramentas da API Oficial de Marketing da Meta. Ele concede ao Claude o superpoder de ler dados de anúncios reais instalados no seu Facebook/Instagram Ads, ajustar campanhas de forma inteligente e diagnosticar fluxos.",
    whatFor: [
      "Criar campanhas completas, conjuntos de anúncios e criativos por linguagem natural",
      "Realizar diagnósticos profundos de audiências, CTR, CPM, CPC e taxa de ROAS no período selecionado",
      "Pausar ads ineficientes ou deslocar verbas de orçamentos diários conforme sugestão analítica do chat",
      "Otimizar parâmetros críticos e conferir a qualidade das respostas da Conversions API e Pixel",
      "Obter panoramas de catálogos dinâmicos e testes A/B"
    ],
    howToConnect: [
      "No Claude, inicie uma conversa e clique no botão de conectar personalizado (+)",
      "Cole a URL oficial do endpoint da Meta: mcp.facebook.com/ads",
      "O sistema solicitará o login na sua conta da Meta Business Suite correspondente",
      "Autorize as permissões solicitadas. Não será preciso nenhuma configuração com tokens de desenvolvedor!",
      "Por razões de segurança extremas, encorajamos que utilize permissões apenas de 'leitura' no primeiro login",
      "Todas as campanhas criadas ou clonadas via conector nascerão pausadas por padrão"
    ],
    note: "Todas as campanhas ou atualizações criadas pelo Claude são salvas obrigatoriamente como 'Rascunho / Pausada' para evitar que orçamentos sejam consumidos de maneira involuntária sem uma aprovação visual sua lá na plataforma.",
    prompts: [
      {
        title: "Prompt 1 — Diagnóstico de performance",
        text: "Me mostre os 10 conjuntos de anúncios com maior gasto nos últimos 7 dias, com frequência, CPM e ROAS. Destaque quais estão com frequência acima de 4 e me diga se devo pausá-los."
      },
      {
        title: "Prompt 2 — Criação de campanha",
        text: "Crie uma campanha de tráfego para o Brasil com orçamento diário de R$30. Público: homens e mulheres, 25 a 45 anos, interessados em marketing digital e empreendedorismo. Deixa pausada para eu revisar antes de ativar."
      },
      {
        title: "Prompt 3 — Otimização de orçamento",
        text: "Compare o CPC das minhas campanhas ativas. Identifique qual está com melhor custo por resultado e sugira um aumento de orçamento de 20% nela. Me mostra o impacto estimado antes de aplicar."
      },
      {
        title: "Prompt 4 — Saúde e Diagnóstico do Pixel",
        text: "Verifique a saúde do meu pixel do Facebook. Quantos eventos foram registrados nos últimos 3 dias? Tem algum evento com baixa qualidade de correspondência? O que devo corrigir?"
      },
      {
        title: "Prompt 5 — Relatório de performance semanal",
        text: "Gere um resumo executivo da semana dos meus anúncios: total gasto, leads gerados, CPL médio, qual criativo performou melhor e qual campanha devo escalar ou pausar. Apresente em formato de análise clara, não em tabela."
      }
    ]
  },
  {
    id: "algrow",
    name: "Algrow",
    role: "Inteligência de Vídeo e YouTube Analytics",
    category: "Pesquisa & Dados",
    badge: "Oficial Algrow (Abril/2026)",
    icon: Tv,
    bgGradient: "from-red-950/30 via-neutral-900/40 to-black",
    whatIs: "A ferramenta de inteligência competitiva e análise de audiência para canais do YouTube. Conecta-se à plataforma web do Claude e dá permissão à IA para ler transcrições, monitorar canais em ascensão, analisar estratégias e extrair ideias excelentes de vídeos rivais.",
    whatFor: [
      "Listar canais do YouTube com alta ascensão em nichos ou formatações específicas",
      "Processar transcrições exatas de longas-metragens ou Shorts populares em poucos segundos",
      "Analisar métricas históricas de postagem, ganchos e chamadas de canais concorrentes",
      "Avaliar o estilo geral, uso de rostos de reações e paleta cromática de miniaturas em alta",
      "Identificar nichos viciosos e canais falidos do passado para entender o que deu errado"
    ],
    howToConnect: [
      "No Claude.ai, pressione o botão de adicionar integrações (+)",
      "Cole a URL correspondente da plataforma: https://mcp.algrow.online/mcp",
      "Você será direcionado para uma tela para login na sua conta oficial Algrow",
      "Selecione 'Aprovar' para fechar e integrar",
      "O conector de busca agora estará habilitado tanto na sua interface web quanto pelo aplicativo celular!"
    ],
    note: "Você pode usar um plano de conexão gratuito, porém o retorno de estatísticas fiéis de audiência exigirá uma conta ativa paga do serviço Algrow.",
    prompts: [
      {
        title: "Prompt 1 — Pesquisa de canais no nicho",
        text: "Busque canais de Shorts em português sobre inteligência artificial com menos de 50 mil inscritos criados nos últimos 90 dias e com crescimento acelerado. Me mostre os 5 mais relevantes com métricas."
      },
      {
        title: "Prompt 2 — Dissecando o concorrente",
        text: "Raspe os últimos 20 vídeos do canal @[nome do canal] incluindo transcrições. Analise: qual é o formato dominante, qual é a estrutura do gancho, que tipo de CTA eles usam e qual vídeo performou melhor. Me dê um resumo estratégico."
      },
      {
        title: "Prompt 3 — Seleção rápida de virais",
        text: "Encontre os 10 Shorts mais virais sobre criação de conteúdo com IA publicados nos últimos 7 dias. Me mostre visualizações, canal, título e o que eles têm em comum no gancho."
      },
      {
        title: "Prompt 4 — Auditoria de Miniatura (Thumbnail)",
        text: "Pesquise thumbnails de canais de finanças no YouTube. Identifique os padrões visuais mais recorrentes: cores dominantes, presença de rosto, uso de texto, estilo geral. Quero usar isso para melhorar minhas próprias thumbnails."
      },
      {
        title: "Prompt 5 — Engenharia Reversa de Transcrição",
        text: "Leia a transcrição do vídeo [URL do vídeo]. Extraia: o gancho dos primeiros 30 segundos, a estrutura de desenvolvimento e o encerramento. Depois reescreva o mesmo roteiro adaptado para o nicho de criação de conteúdo com IA."
      }
    ]
  }
];

const GENERAL_CONNECTORS = ["Canva", "Runway", "ElevenLabs", "Meta Ads MCP", "Algrow", "Windsor.ai", "Higgsfield"];

const RECOMMENDED_FLOWS = [
  {
    title: "Fluxo 1 — Produção de Reel Viral Autônomo",
    description: "Ideal para criar vídeos narrativos magnéticos do absoluto zero utilizando IA e inteligências concorrentes.",
    steps: [
      "Algrow (pesquisa de temas e ganchos em alta)",
      "Claude (geração e refino do roteiro emocional)",
      "ElevenLabs (síntese impecável de áudio realista)",
      "Runway (produção cinematográfica do clipe de vídeo)",
      "Canva (capa e thumbnail chamativa com Brand Kit)"
    ]
  },
  {
    title: "Fluxo 2 — Lançamento Crítico de Anúncios Pagos",
    description: "Crie campanhas orientadas a dados e alimentadas por inteligência de escala.",
    steps: [
      "Windsor.ai (análise crítica do que já reverte mais ROAS)",
      "Claude (escrita persuasiva baseada no criativo vencedor)",
      "Canva (design de arte com redimensionamento em massa)",
      "Meta Ads MCP (inserção e otimização imediata da campanha)"
    ]
  },
  {
    title: "Fluxo 3 — Pesquisa Estratégica Semanal",
    description: "Gerencie sua marca de forma inteligente em minutos e tome decisões fundamentadas em dados.",
    steps: [
      "Algrow (mapeamento do que bombou na concorrência)",
      "Windsor.ai (análise profunda do seu engajamento anterior)",
      "Claude (compilação e roteamento da nova linha editorial)"
    ]
  }
];

export default function ConectoresTab() {
  const [selectedConnector, setSelectedConnector] = useState<Connector | null>(null);
  const [copiedPromptText, setCopiedPromptText] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptText(text);
    setTimeout(() => setCopiedPromptText(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto flex flex-col items-center"
    >
      {/* Header Banner */}
      <div className="text-center relative pb-10">
        <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-yellow-500 mb-4 px-3 py-1 bg-yellow-500/10 rounded-full border border-yellow-500/20">
          <Network className="w-4 h-4" />
          Módulo Avançado MCP
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white font-[Space_Grotesk] uppercase tracking-wide leading-tight mb-4">
          Conectores <span className="text-yellow-500 font-black">Claude</span>
        </h1>
        <p className="text-neutral-400 text-lg max-w-3xl mx-auto leading-relaxed">
          Os Conectores MCP (Model Context Protocol) estendem o Claude para acessar suas ferramentas, Designs do Canva, Campanhas da Meta e geração de vídeo em tempo real.
        </p>

        {/* Informative Banner */}
        <div className="mt-8 max-w-3xl mx-auto bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 text-left flex gap-4 items-start">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0 border border-yellow-500/20">
            <Cpu className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <h4 className="text-white font-bold text-base mb-1">O que são Conectores Claude?</h4>
            <p className="text-neutral-400 text-sm leading-relaxed">
              São integrações que conectam o Claude de forma direta e segura aos aplicativos que você já usa. Em vez de operar apenas de forma conceitual, o Claude se integra com seus dados reais de design, campanhas e inteligência, executando ações reais no Canva, Runway, ElevenLabs ou Meta.
            </p>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <div className="w-16 h-1 bg-yellow-500 rounded-full" />
        </div>
      </div>

      {/* Grid of Connectors */}
      <div className="w-full mb-16">
        <h2 className="text-2xl font-bold font-[Space_Grotesk] text-white uppercase mb-6 text-center md:text-left tracking-wide">
          ⚡ Conectores de Alta Produtividade
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CONNECTORS_DATA.map((conn) => {
            const IconComponent = conn.icon;
            return (
              <motion.div
                key={conn.id}
                whileHover={{ y: -3, scale: 1.01 }}
                className="bg-[#111] border border-neutral-800 hover:border-yellow-500/40 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer flex flex-col h-full"
                onClick={() => setSelectedConnector(conn)}
              >
                {/* gradient header */}
                <div className={`h-28 bg-gradient-to-br ${conn.bgGradient} p-5 flex items-end justify-between relative`}>
                  <div className="w-10 h-10 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center self-start">
                    <IconComponent className="w-5 h-5 text-yellow-500" />
                  </div>
                  <span className="text-[10px] font-bold text-white/80 bg-black/50 border border-white/10 rounded-full px-2.5 py-1 uppercase tracking-wider">
                    {conn.badge}
                  </span>
                </div>
                {/* content info */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="text-[10px] font-black uppercase text-yellow-500 tracking-[0.15em] mb-1">
                    {conn.category}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{conn.name}</h3>
                  <div className="text-xs text-neutral-400 mb-4 font-medium italic">
                    {conn.role}
                  </div>
                  <p className="text-sm text-neutral-400 line-clamp-3 leading-relaxed mb-6">
                    {conn.whatIs}
                  </p>
                  <button className="mt-auto w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-yellow-500 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-1">
                    Ver Guia Conexão & Prompts <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recommended Flows / Combination Flows */}
      <div className="w-full mb-16 bg-[#111] border border-neutral-800 rounded-3xl p-6 md:p-10 text-left">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
            <FolderSync className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-[Space_Grotesk] text-white uppercase tracking-wider">
              Combinações e Fluxos de Automação
            </h2>
            <p className="text-neutral-400 text-sm">Combine múltiplos conectores MCP com o Claude para atingir fins reais sem atrito.</p>
          </div>
        </div>

        <div className="space-y-6">
          {RECOMMENDED_FLOWS.map((flow, fIdx) => (
            <div key={fIdx} className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-5 md:p-6 transition-all hover:border-neutral-700">
              <h3 className="text-yellow-500 font-bold text-base md:text-lg mb-2">{flow.title}</h3>
              <p className="text-neutral-300 text-sm mb-4 leading-relaxed">{flow.description}</p>
              
              <div className="flex flex-wrap items-center gap-2">
                {flow.steps.map((step, sIdx) => (
                  <React.Fragment key={sIdx}>
                    <span className="bg-neutral-850 border border-neutral-700/60 rounded-xl px-3 py-1.5 text-xs text-white font-medium shadow-sm">
                      {step}
                    </span>
                    {sIdx < flow.steps.length - 1 && (
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-550 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Summary Reference */}
      <div className="w-full bg-neutral-900/40 border border-neutral-800/80 rounded-3xl p-6 md:p-8 text-left mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-white font-[Space_Grotesk] text-lg font-bold uppercase tracking-wider mb-2">Resumo Geral — Os 7 Conectores do Adrian</h3>
          <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl">
            Tenha em mente o mapa de ferramentas para cada necessidade criativa: 
            Canva (Visual/Artes), Runway (Vídeos), ElevenLabs (Vozes/Locução), Meta Ads (Tráfego/Escala), Algrow (YouTube/Virais), Windsor.ai (Métricas) e Higgsfield (Movimentos Livres).
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 max-w-xs justify-end">
          {GENERAL_CONNECTORS.map((c, i) => (
            <span key={i} className="bg-neutral-900 border border-neutral-700 text-neutral-300 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Detailed Connector Modal Overlay */}
      <AnimatePresence>
        {selectedConnector && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
              onClick={() => setSelectedConnector(null)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-neutral-950 border border-neutral-800/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col w-full max-w-4xl max-h-[90vh] z-10"
            >
              {/* modal header */}
              <div className="shrink-0 p-6 md:p-8 border-b border-neutral-800 bg-neutral-900/60 flex items-start justify-between relative overflow-hidden">
                <div className="relative z-10 pr-10">
                  <span className="text-[10px] font-black tracking-[0.15em] uppercase text-yellow-500 mb-2 block">
                    {selectedConnector.category} — {selectedConnector.badge}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black text-white leading-tight uppercase font-[Space_Grotesk]">
                    Conector {selectedConnector.name}
                  </h2>
                  <p className="text-neutral-400 text-sm mt-2 leading-relaxed">
                    {selectedConnector.whatIs}
                  </p>
                </div>
                
                <button
                  onClick={() => setSelectedConnector(null)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors z-20"
                >
                  <span className="text-xl">&times;</span>
                </button>
              </div>

              {/* modal scrollable content */}
              <div className="overflow-y-auto p-6 md:p-8 no-scrollbar space-y-8">
                {/* Section: Para Que Serve */}
                <div>
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    Para que serve:
                  </h3>
                  <ul className="space-y-2">
                    {selectedConnector.whatFor.map((item, index) => (
                      <li key={index} className="flex gap-2.5 items-start text-sm text-neutral-300 leading-relaxed">
                        <Check className="w-4 h-4 text-yellow-500 mt-1 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Section: Como Conectar */}
                <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-5 md:p-6">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-yellow-500" />
                    Como conectar o conector no Claude:
                  </h3>
                  <div className="relative border-l border-neutral-800 pl-5 ml-2.5 space-y-4">
                    {selectedConnector.howToConnect.map((step, index) => (
                      <div key={index} className="relative group/step">
                        <span className="absolute -left-[27px] top-0 w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500 flex items-center justify-center" />
                        <p className="text-sm text-neutral-300 leading-relaxed">
                          <strong className="text-white font-semibold">{index + 1}.</strong> {step}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {selectedConnector.note && (
                    <div className="mt-5 pt-4 border-t border-neutral-800/50 flex gap-2.5 items-start text-xs text-neutral-400 leading-relaxed">
                      <AlertCircle className="w-4 h-4 text-yellow-500/80 mt-0.5 shrink-0" />
                      <span>{selectedConnector.note}</span>
                    </div>
                  )}
                </div>

                {/* Section: Prompts Recomendados */}
                <div>
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    5 Prompts Recomendados para usar com o conector:
                  </h3>
                  <div className="space-y-4">
                    {selectedConnector.prompts.map((p, index) => {
                      const isCopied = copiedPromptText === p.text;
                      return (
                        <div key={index} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between transition-all hover:border-yellow-500/30">
                          <div className="flex-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-500/80 block mb-1">
                              {p.title}
                            </span>
                            <p className="text-sm text-neutral-200 font-medium font-mono bg-neutral-950 p-3 rounded-lg border border-neutral-900 whitespace-pre-wrap leading-relaxed select-all">
                              {p.text}
                            </p>
                          </div>
                          <button
                            onClick={() => handleCopy(p.text)}
                            className="shrink-0 w-full md:w-auto px-4 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copiado</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-gray-400" />
                                Copiar
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* modal footer */}
              <div className="shrink-0 p-4 border-t border-neutral-800 bg-neutral-900/40 flex justify-end">
                <button
                  onClick={() => setSelectedConnector(null)}
                  className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm rounded-xl transition-all"
                >
                  Fechar Guia
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
