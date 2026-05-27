import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, Heart, User, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Comment {
  id: string | number;
  author_name: string;
  content: string;
  created_at: string;
}

interface Post {
  id: string | number;
  content: string;
  author_name: string;
  author_avatar?: string;
  created_at: string;
  likes?: number;
  likedByMe?: boolean;
  replies?: Comment[];
}

export default function CommunityTab() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userName, setUserName] = useState("Usuário anônimo");
  const [replyInputs, setReplyInputs] = useState<{ [postId: string]: string }>({});
  const [expandedReplies, setExpandedReplies] = useState<{ [postId: string]: boolean }>({});

  useEffect(() => {
    // Tenta pegar o nome do usuário logado se existir
    supabase?.auth.getUser().then(({ data: { user } }) => {
      if (user && user.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name);
      } else if (user && user.email) {
        setUserName(user.email.split('@')[0]);
      }
    });

    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    if (!supabase) return;
    
    // Tentar ler do supabase
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // Fallback para mock data + localStorage se a tabela não existir ainda
      console.log('Tabela não existe ou erro. Usando localStorage auth fallback.', error);
      const local = localStorage.getItem('codigo_da_ia_community');
      let localPosts = local ? JSON.parse(local) : [];
      
      if (localPosts.length === 0) {
        localPosts = [
          {
            id: 'mock-1',
            content: 'Essa nova atualização de prompts para ChatGPT está insana! Alguém já testou o de Landing Page com o Claude?',
            author_name: 'Marcos Silva',
            created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
            likes: 12
          },
          {
            id: 'mock-2',
            content: 'Alguém me indica um bom prompt para revisar roteiros de vídeos curtos? O do módulo de Tiktok é bom para reels?',
            author_name: 'Ana Carolina',
            created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
            likes: 5
          }
        ];
      }
      setPosts(localPosts);
    } else if (data) {
      setPosts(data as Post[]);
    }
  };

  const handlePost = async () => {
    if (!newPost.trim()) return;
    
    setIsSubmitting(true);
    
    const postData = {
      content: newPost.trim(),
      author_name: userName,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      const { data, error } = await supabase.from('community_posts').insert([postData]).select();
      if (!error && data) {
        setPosts([data[0], ...posts]);
        setNewPost("");
        setIsSubmitting(false);
        return;
      }
    }
    
    // Fallback: Salvar localmente
    const createdPost = {
      ...postData,
      id: Date.now(),
      likes: 0
    };
    
    const updated = [createdPost, ...posts];
    setPosts(updated);
    localStorage.setItem('codigo_da_ia_community', JSON.stringify(updated));
    
    setNewPost("");
    setIsSubmitting(false);
  };

  const toggleLike = (postId: string | number) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const isLiked = !!post.likedByMe;
        return {
          ...post,
          likes: (post.likes || 0) + (isLiked ? -1 : 1),
          likedByMe: !isLiked
        };
      }
      return post;
    });
    setPosts(updatedPosts);
    localStorage.setItem('codigo_da_ia_community', JSON.stringify(updatedPosts));
  };

  const handleReplyChange = (postId: string | number, value: string) => {
    setReplyInputs(prev => ({ ...prev, [postId]: value }));
  };

  const submitReply = (postId: string | number) => {
    const replyText = replyInputs[postId]?.trim();
    if (!replyText) return;

    const newReply: Comment = {
      id: Date.now(),
      author_name: userName,
      content: replyText,
      created_at: new Date().toISOString()
    };

    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          replies: [...(post.replies || []), newReply]
        };
      }
      return post;
    });

    setPosts(updatedPosts);
    localStorage.setItem('codigo_da_ia_community', JSON.stringify(updatedPosts));
    setReplyInputs(prev => ({ ...prev, [postId]: "" }));
    setExpandedReplies(prev => ({ ...prev, [postId]: true }));
  };

  const toggleExpandReplies = (postId: string | number) => {
    setExpandedReplies(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const formatTimeAgo = (dateString: string) => {
    const obj = new Date(dateString);
    const diff = Math.floor((new Date().getTime() - obj.getTime()) / 1000);
    
    if (diff < 60) return `${diff} seg atrás`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
    return `${Math.floor(diff / 86400)}d atrás`;
  };

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
          Troque ideias, compartilhe resultados e conecte-se com outros engenheiros de prompt e criadores.
        </p>
      </motion.div>

      {/* Input Box */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0c0c0e] border border-neutral-900 rounded-3xl p-5 mb-10 shadow-xl"
      >
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 border border-neutral-800">
            <User className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex-1">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="O que você está pensando ou testando hoje?"
              className="w-full bg-transparent border-none outline-none resize-none min-h-[80px] text-gray-200 placeholder-neutral-600 font-medium"
            />
            <div className="flex justify-end mt-2 pt-3 border-t border-neutral-900">
              <button 
                onClick={handlePost}
                disabled={isSubmitting || !newPost.trim()}
                className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-2 px-5 rounded-full text-sm transition-colors shadow-lg shadow-yellow-500/20"
              >
                <span>{isSubmitting ? 'Publicando...' : 'Publicar'}</span>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Feed */}
      <div className="space-y-6">
        {posts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#0c0c0e]/60 border border-neutral-900 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                   {post.author_avatar ? (
                     <img src={post.author_avatar} alt={post.author_name} className="w-full h-full object-cover" />
                   ) : (
                     <span className="text-sm font-bold text-gray-400">{post.author_name.charAt(0).toUpperCase()}</span>
                   )}
                </div>
                <div>
                  <h4 className="font-bold text-gray-200 text-sm">{post.author_name}</h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-neutral-500" />
                    <span className="text-xs text-neutral-500">{formatTimeAgo(post.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-gray-300 text-sm md:text-base mb-4 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
            
            <div className="flex items-center gap-4 pt-4 border-t border-neutral-900/50">
              <button 
                onClick={() => toggleLike(post.id)}
                className={`flex items-center gap-1.5 transition-colors text-xs font-semibold group ${post.likedByMe ? 'text-red-500' : 'text-neutral-500 hover:text-red-500'}`}
              >
                <Heart className={`w-4 h-4 ${post.likedByMe ? 'fill-red-500' : 'group-hover:fill-red-500'}`} />
                <span>{post.likes || 0}</span>
              </button>
              <button 
                onClick={() => toggleExpandReplies(post.id)}
                className="flex items-center gap-1.5 text-neutral-500 hover:text-blue-500 transition-colors text-xs font-semibold"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{post.replies?.length || 0} {post.replies?.length === 1 ? 'Resposta' : 'Respostas'}</span>
              </button>
            </div>

            {/* Replies section */}
            <AnimatePresence>
              {expandedReplies[post.id] && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-neutral-900/50 flex flex-col gap-4 overflow-hidden"
                >
                  {post.replies && post.replies.length > 0 && (
                    <div className="flex flex-col gap-3 pl-4 border-l border-neutral-800">
                      {post.replies.map(reply => (
                        <div key={reply.id} className="bg-black/40 p-3 rounded-xl border border-neutral-900">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="font-bold text-gray-300 text-xs">{reply.author_name}</span>
                            <span className="text-[10px] text-neutral-500">{formatTimeAgo(reply.created_at)}</span>
                          </div>
                          <p className="text-gray-400 text-sm leading-relaxed">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 items-center mt-2 pl-4 border-l border-neutral-800">
                    <input 
                      type="text" 
                      placeholder="Adicione uma resposta..." 
                      value={replyInputs[post.id] || ""}
                      onChange={(e) => handleReplyChange(post.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          submitReply(post.id);
                        }
                      }}
                      className="flex-1 bg-black/40 border border-neutral-800 text-gray-300 text-sm rounded-full px-4 py-2 outline-none focus:border-neutral-600 transition-colors placeholder-neutral-600"
                    />
                    <button 
                      onClick={() => submitReply(post.id)}
                      disabled={!(replyInputs[post.id]?.trim())}
                      className="bg-yellow-500 hover:bg-yellow-400 text-black p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
      
      {posts.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-neutral-800 mx-auto justify-center mb-4" />
          <p className="text-neutral-500">Nenhuma postagem ainda. Seja o primeiro a compartilhar algo!</p>
        </div>
      )}
    </div>
  );
}
