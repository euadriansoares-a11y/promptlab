import { motion } from 'motion/react';
import { MessageCircle, Send, ExternalLink, Users } from 'lucide-react';

export default function CommunityTab() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-20 text-left">
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="mb-10 text-center"
      >
        <h1 className="font-[Space_Grotesk] text-3xl md:text-5xl font-bold tracking-tighter mb-4 text-white">
          Comunidade <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">CodigoDaIA</span>
        </h1>
        <p className="text-gray-400 text-sm md:text-base font-medium mx-auto mb-6">
          Conecte-se com outros engenheiros de prompt, troque ideias e faça networking.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* WhatsApp Banner */}
        <motion.a
          href="https://chat.whatsapp.com/Iu3NaSs3d644Iskbcffi0b"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="group relative bg-[#0c0c0e] border border-[#25D366]/30 rounded-3xl p-6 md:p-8 hover:bg-[#25D366]/5 transition-all overflow-hidden flex flex-col items-center text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#25D366]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="w-16 h-16 rounded-full bg-[#25D366]/20 border border-[#25D366]/30 flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform">
            <MessageCircle className="w-8 h-8 text-[#25D366]" />
          </div>
          
          <h2 className="text-white font-bold tracking-tight text-xl mb-3 relative z-10">
            Grupo no WhatsApp
          </h2>
          
          <p className="text-gray-400 text-sm mb-6 relative z-10 leading-relaxed">
            Interações rápidas, networking diário e avisos importantes em tempo real na palma da mão.
          </p>

          <div className="mt-auto inline-flex items-center gap-2 bg-[#25D366] text-black font-semibold px-6 py-2.5 rounded-full text-sm relative z-10 group-hover:bg-[#20bd5a] transition-colors">
            <Users className="w-4 h-4" />
            <span>Entrar no Grupo</span>
            <ExternalLink className="w-4 h-4 ml-1" />
          </div>
        </motion.a>

        {/* Telegram Banner */}
        <motion.a
          href="https://t.me/+g6ECvTPxVI82ZGJh"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="group relative bg-[#0c0c0e] border border-[#0088cc]/30 rounded-3xl p-6 md:p-8 hover:bg-[#0088cc]/5 transition-all overflow-hidden flex flex-col items-center text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#0088cc]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="w-16 h-16 rounded-full bg-[#0088cc]/20 border border-[#0088cc]/30 flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform">
            <Send className="w-8 h-8 text-[#0088cc]" />
          </div>
          
          <h2 className="text-white font-bold tracking-tight text-xl mb-3 relative z-10">
            Canal no Telegram
          </h2>
          
          <p className="text-gray-400 text-sm mb-6 relative z-10 leading-relaxed">
            Materiais exclusivos, arquivos e histórico completo de todas as atualizações da comunidade.
          </p>

          <div className="mt-auto inline-flex items-center gap-2 bg-[#0088cc] text-white font-semibold px-6 py-2.5 rounded-full text-sm relative z-10 group-hover:bg-[#007ab8] transition-colors">
            <Users className="w-4 h-4" />
            <span>Entrar no Canal</span>
            <ExternalLink className="w-4 h-4 ml-1" />
          </div>
        </motion.a>
      </div>
    </div>
  );
}
