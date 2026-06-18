import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { webhookCakto } from "./cakto-webhook";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON middleware para processar o body do webhook
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Rota do Webhook da Cakto
  app.post("/webhook/cakto", webhookCakto);

  // Rota de Primeiro Acesso (Zero Burocracia)
  app.post("/api/register-access", async (req, res) => {
    const { email, password, name } = req.body;
    
    if (!email || !password || !email.includes("@")) {
      return res.status(400).json({ success: false, message: "E-mail e Senha são obrigatórios e válidos." });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "A senha precisa conter no mínimo 6 caracteres por segurança." });
    }

    try {
      const { getSupabase } = await import("./cakto-webhook");
      const supabase = getSupabase();
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
      return res.status(500).json({ success: false, message: "Erro interno no servidor.", details: e.message });
    }
  });

  // Rota de Teste de Conexão com o Supabase
  app.get("/webhook/test-supabase", async (req, res) => {
    try {
      let url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    
      if (!url || !serviceRoleKey) {
        return res.status(500).json({ status: "erro", message: "Credenciais do Supabase ausentes no env do servidor." });
      }
    
      url = url.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '').trim();
      if (url && !url.startsWith('http')) {
        url = `https://${url}`;
      }

      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(url, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });

      const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1 });
      
      if (error) {
        return res.status(500).json({ status: "erro", message: "Erro ao conectar com a API Admin", details: error.message });
      }

      const { count: promptCount, error: countErr } = await supabase.from('prompts').select('*', { count: 'exact', head: true });
      
      return res.status(200).json({ 
        status: "ok", 
        message: "Conexão com supabase Admin estabelecida com sucesso", 
        users_count: data.users.length > 0 ? "Pelo menos 1 usuário encontrado" : "Nenhum usuário", 
        prompts_count: countErr ? countErr.message : promptCount
      });

    } catch (e: any) {
      return res.status(500).json({ status: "erro", message: "Exception ao tentar conectar no Supabase", details: e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
