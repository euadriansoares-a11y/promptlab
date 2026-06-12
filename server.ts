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
