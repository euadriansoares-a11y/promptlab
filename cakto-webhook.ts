import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

// Inicialização Preguiçosa (Lazy Initialization)
let supabaseClient: any = null;

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  let url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Credenciais do Supabase não configuradas no servidor! Verifique se SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas nas configurações do seu projeto."
    );
  }

  // Remove o sufixo /rest/v1 e barras sobressalentes para evitar "Invalid path specified in request URL"
  url = url.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '').trim();
  if (url && !url.startsWith('http')) {
    url = `https://${url}`;
  }

  supabaseClient = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return supabaseClient;
}

// Helper robusto para buscar usuário por e-mail (Case-Insensitive)
async function findUserByEmail(supabase: any, email: string): Promise<string | null> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return null;

  // Busca direta na tabela de perfis (profiles)
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id")
      .ilike("email", cleanEmail)
      .maybeSingle();
    
    if (profile?.id) {
      console.log(`[CAKTO WEBHOOK] Aluno localizado na tabela de perfis (profiles): ${profile.id}`);
      return profile.id;
    }
  } catch (err) {
    console.error("[CAKTO WEBHOOK] Erro ao pesquisar na tabela de perfis:", err);
  }

  // Busca nativa no Auth do Supabase por e-mail
  try {
    const { data, error } = await supabase.auth.admin.getUserByEmail(cleanEmail);
    if (!error && data?.user?.id) {
      console.log(`[CAKTO WEBHOOK] Aluno localizado nativamente no Auth (getUserByEmail): ${data.user.id}`);
      return data.user.id;
    }
  } catch (err) {
    console.warn("[CAKTO WEBHOOK] Método getUserByEmail não localizou (ou falhou):", err?.message || err);
  }

  // Varredura global no Auth (listUsers) com comparação case-insensitive
  try {
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({
      perPage: 1000
    });
    if (!listError && usersData?.users) {
      const foundUser = usersData.users.find(
        (u: any) => (u.email || "").trim().toLowerCase() === cleanEmail
      );
      if (foundUser?.id) {
        console.log(`[CAKTO WEBHOOK] Aluno localizado na listagem global do Auth: ${foundUser.id}`);
        return foundUser.id;
      }
    }
  } catch (err) {
    console.error("[CAKTO WEBHOOK] Erro ao listar usuários globais:", err);
  }

  return null;
}

// Logica Assincrona de Processamento
async function processCaktoEvent(payload: any) {
  try {
    const eventName = (payload?.event || payload?.event_name || "").toLowerCase();
    const statusName = (payload?.status || payload?.data?.status || "").toLowerCase();
    
    const isApproved = 
      eventName === "purchase_approved" || 
      eventName === "payment_approved" ||
      eventName === "approved" ||
      eventName === "venda_aprovada" ||
      eventName === "paga" ||
      eventName === "paid" ||
      statusName === "approved" ||
      statusName === "paid" ||
      statusName === "completed" ||
      statusName === "success" ||
      payload?.test === true || 
      payload?.is_test === true ||
      payload?.status === "aprovado";

    if (!isApproved) {
      console.log(`[CAKTO WEBHOOK ASYNC] Evento ignorado (não é aprovação): Event='${payload?.event}' Status='${statusName}'`);
      return;
    }

    const dataObj = payload?.data || payload || {};
    const customerObj = dataObj?.customer || payload?.customer || {};
    const productObj = dataObj?.product || payload?.product || {};

    const name = customerObj?.name || dataObj?.customer_name || dataObj?.name || payload?.customer_name || payload?.name || "Cliente";
    const rawEmail = customerObj?.email || dataObj?.customer_email || dataObj?.email || payload?.customer_email || payload?.email;
    const phone = customerObj?.phone || dataObj?.customer_phone || dataObj?.phone || payload?.customer_phone || payload?.phone || "";

    if (!rawEmail) {
      console.error("[CAKTO WEBHOOK ASYNC] Erro: Email do cliente ausente no payload");
      return;
    }

    const email = rawEmail.trim().toLowerCase();
    const produto = productObj?.name || dataObj?.product_name || dataObj?.product || payload?.product_name || payload?.product || "Biblioteca de Prompts";
    const valor = dataObj?.amount || dataObj?.price || payload?.amount || payload?.price || 0;
    const metodoPagamento = dataObj?.paymentMethod || dataObj?.payment_method || payload?.paymentMethod || payload?.payment_method || "não especificado";
    const cakto_order_id = dataObj?.id || dataObj?.order_id || payload?.id || payload?.order_id || `cakto_${Date.now()}`;

    console.log(`[CAKTO WEBHOOK ASYNC] Processando liberação para: ${email} | Nome: ${name}`);

    const supabase = getSupabaseClient();
    let userId = await findUserByEmail(supabase, email);

    if (!userId) {
      const defaultPassword = process.env.DEFAULT_PASSWORD || "CodigoIA@2024";
      console.log(`[CAKTO WEBHOOK ASYNC] Aluno novo detectado. Criando conta de acesso com e-mail ${email}`);
      
      const { data: inviteData, error: inviteError } = await supabase.auth.admin.createUser({
        email: email,
        password: defaultPassword,
        email_confirm: true,
        user_metadata: { full_name: name, phone: phone }
      });

      if (inviteError) {
        console.warn("[CAKTO WEBHOOK ASYNC] Erro ao tentar criar usuário via Admin API, tentando buscar se já existe:", inviteError.message);
        userId = await findUserByEmail(supabase, email);
        
        if (!userId) {
          console.error("[CAKTO WEBHOOK ASYNC] Falha crítica de persistência. Erro original do Supabase:", inviteError);
          return;
        }
      } else {
        userId = inviteData.user?.id;
        console.log(`[CAKTO WEBHOOK ASYNC] Nova conta de usuário gerada com sucesso no Auth. ID: ${userId}`);
      }
    } else {
      console.log(`[CAKTO WEBHOOK ASYNC] Usuário encontrado. ID associado: ${userId}`);
    }

    if (!userId) {
      console.error("[CAKTO WEBHOOK ASYNC] Erro: Não foi possível resolver o identificador único do aluno.");
      return;
    }

    console.log(`[CAKTO WEBHOOK ASYNC] Atualizando perfil na tabela 'profiles' para o ID: ${userId}`);
    const { error: upsertPerfilError } = await supabase.from("profiles").upsert({
      id: userId,
      nome: name,
      email: email,
      telefone: phone,
      acesso_ativo: true,
      must_change_password: true
    });

    if (upsertPerfilError) {
      console.error("[CAKTO WEBHOOK ASYNC] Erro no upsert do perfil na tabela 'profiles':", upsertPerfilError);
      return;
    } else {
      console.log(`[CAKTO WEBHOOK ASYNC] Perfil atualizado em 'profiles' sucesso!`);
    }

    console.log(`[CAKTO WEBHOOK ASYNC] Cadastrando compra da ordem de ID: ${cakto_order_id}`);
    const { error: compraError } = await supabase.from("compras").insert({
      user_id: userId,
      produto_nome: produto,
      valor: valor,
      metodo_pagamento: metodoPagamento,
      cakto_order_id: cakto_order_id
    });

    if (compraError) {
      if (compraError.code === '23505') { 
        console.log(`[CAKTO WEBHOOK ASYNC] Compra de ID ${cakto_order_id} já cadastrada. Transação duplicada ignorada.`);
      } else {
        console.error("[CAKTO WEBHOOK ASYNC] Erro no registro da compra:", compraError);
        return;
      }
    }

    console.log(`[CAKTO WEBHOOK ASYNC] Sucesso absoluto! Acesso e compra processados com sucesso para: ${email}`);

  } catch (err: any) {
    console.error("[CAKTO WEBHOOK ASYNC] Erro fatal durante processamento assíncrono:", err);
  }
}

export async function webhookCakto(req: any, res: any) {
  try {
    const payload = req.body;
    console.log("[CAKTO WEBHOOK] Recebido Payload completo:", JSON.stringify(payload));

    const CAKTO_WEBHOOK_SECRET = process.env.CAKTO_WEBHOOK_SECRET || "";
    const receivedSecret = payload?.secret || req.query?.secret || req.headers?.['x-cakto-token'] || req.headers?.['x-cakto-signature'];

    if (CAKTO_WEBHOOK_SECRET) {
      if (receivedSecret !== CAKTO_WEBHOOK_SECRET) {
        console.warn(`[CAKTO WEBHOOK] Secret Inválido! Recebido: ${receivedSecret} | Esperado: ${CAKTO_WEBHOOK_SECRET}`);
        return res.status(401).json({ error: "Secret inválido" });
      }
    } else {
      console.warn("[CAKTO WEBHOOK] CAKTO_WEBHOOK_SECRET não está configurado nas variáveis de ambiente. Lógica de segurança ignorada.");
    }

    // Responde 200 imediatamente para a Cakto não ter timeout
    res.status(200).json({ status: "recebido", message: "Webhook aceito, processamento iniciado." });

    // Processa de forma assíncrona
    processCaktoEvent(payload);

  } catch (err: any) {
    console.error("[Cakto Webhook Error]", err);
    // Só responde se o res.status(200) ainda não tiver sido chamado
    if (!res.headersSent) {
      return res.status(500).json({ error: "Erro interno do servidor", details: err.message });
    }
  }
}
