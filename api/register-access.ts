import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  // Configura CORS se necessário, mas como Vercel roda no mesmo domínio, é tranquilo.
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: "Método não permitido. Utilize POST." });
  }

  const { email, password, name } = req.body || {};
  
  if (!email || !password || !email.includes("@")) {
    return res.status(400).json({ success: false, message: "E-mail e Senha são obrigatórios e válidos." });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: "A senha precisa conter no mínimo 6 caracteres por segurança." });
  }

  try {
    let url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim()
      .replace(/\/rest\/v1\/?$/, '')
      .replace(/\/$/, '');

    if (url && !url.startsWith('http')) {
      url = `https://${url}`;
    }

    const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

    if (!url || !key) {
      return res.status(500).json({
        success: false,
        message: "Erro de configuração no Vercel: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não estão cadastradas nas Variáveis de Ambiente do painel da Vercel."
      });
    }

    const supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const cleanEmail = email.trim().toLowerCase();

    // 1. Procurar o usuário na base (primeiro pelas tabelas, depois com paginação no Auth)
    let foundUserId: string | null = null;
    let foundUserMetadata: any = null;

    // Busca na tabela profiles do Supabase
    try {
      const { data: dbProfile } = await supabase.from('profiles').select('id').eq('email', cleanEmail).maybeSingle();
      if (dbProfile?.id) foundUserId = dbProfile.id;
    } catch (dbErr) {
      console.warn("[register-access] Erro ao buscar em profiles:", dbErr);
    }

    // Se não achou na tabela profiles, busca na tabela perfis
    if (!foundUserId) {
      try {
        const { data: dbPerfis } = await supabase.from('perfis').select('id').eq('email', cleanEmail).maybeSingle();
        if (dbPerfis?.id) foundUserId = dbPerfis.id;
      } catch (dbErr) {
        console.warn("[register-access] Erro ao buscar em perfis:", dbErr);
      }
    }

    // Se ainda não achou, fazemos busca paginada no Auth para até 5 páginas (5000 usuários)
    if (!foundUserId) {
      try {
        let page = 1;
        while (page <= 5) {
          const { data: authData, error: authErr } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
          if (authErr || !authData?.users || authData.users.length === 0) break;
          const u = authData.users.find((user: any) => user.email?.toLowerCase() === cleanEmail);
          if (u) {
            foundUserId = u.id;
            foundUserMetadata = u.user_metadata;
            break;
          }
          if (authData.users.length < 1000) break;
          page++;
        }
      } catch (authScanErr) {
        console.warn("[register-access] Erro ao escanear usuários Auth:", authScanErr);
      }
    }

    if (foundUserId) {
      // Usuário encontrado! Atualizamos a senha e garantimos perfis habilitados
      const { error: updateErr } = await supabase.auth.admin.updateUserById(foundUserId, {
        password: password,
        user_metadata: { nome: name || foundUserMetadata?.nome, is_client: true }
      });

      if (updateErr) {
        return res.status(500).json({ 
          success: false, 
          message: "Houve um erro ao atualizar a senha do usuário existente.", 
          details: updateErr.message 
        });
      }

      // Garante flag ativa nas tabelas
      await supabase.from('profiles').upsert({ id: foundUserId, email: cleanEmail, acesso_ativo: true, nome: name }, { onConflict: 'id' });
      await supabase.from('perfis').upsert({ id: foundUserId, email: cleanEmail, acesso_ativo: true, nome: name }, { onConflict: 'id' });

      return res.status(200).json({ success: true, message: "Acesso atualizado e liberado com sucesso!" });
    } else {
      // Usuário não existe, criamos um novo
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email: cleanEmail,
        password: password,
        email_confirm: true,
        user_metadata: { nome: name, self_registered: true, is_client: true }
      });

      if (createErr) {
        // Caso ocorra erro de duplicidade que passou pelas buscas acima por algum motivo de race condition ou cache:
        if (createErr.message?.includes("already") || createErr.message?.includes("duplicado") || createErr.message?.includes("exists")) {
          // Tenta obter o perfil baseado em uma busca ampla sem restrição
          const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
          const u = authData?.users?.find((user: any) => user.email?.toLowerCase() === cleanEmail);
          if (u) {
            await supabase.auth.admin.updateUserById(u.id, {
              password: password,
              user_metadata: { nome: name || u.user_metadata?.nome, is_client: true }
            });
            await supabase.from('profiles').upsert({ id: u.id, email: cleanEmail, acesso_ativo: true, nome: name }, { onConflict: 'id' });
            await supabase.from('perfis').upsert({ id: u.id, email: cleanEmail, acesso_ativo: true, nome: name }, { onConflict: 'id' });
            return res.status(200).json({ success: true, message: "Acesso atualizado e liberado com sucesso!" });
          }
        }

        return res.status(500).json({ 
          success: false, 
          message: "Não foi possível criar o seu acesso local no Supabase.", 
          details: createErr.message 
        });
      }

      if (newUser.user) {
        await supabase.from('profiles').upsert({ id: newUser.user.id, email: cleanEmail, acesso_ativo: true, nome: name }, { onConflict: 'id' });
        await supabase.from('perfis').upsert({ id: newUser.user.id, email: cleanEmail, acesso_ativo: true, nome: name }, { onConflict: 'id' });
      }

      return res.status(200).json({ success: true, message: "Acesso criado e liberado com sucesso!" });
    }

  } catch (e: any) {
    console.error("[register-access] Erro fatal:", e);
    return res.status(500).json({ success: false, message: "Houve um erro interno ao processar o seu primeiro acesso.", error: e.message || e });
  }
}
