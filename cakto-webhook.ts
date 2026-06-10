import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

// Inicialização Preguiçosa (Lazy Initialization)
let supabaseClient: any = null;

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Credenciais do Supabase não configuradas no servidor! Verifique se SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas nas configurações do seu projeto."
    );
  }

  supabaseClient = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return supabaseClient;
}

export async function webhookCakto(req: any, res: any) {
  try {
    const payload = req.body;
    console.log("[CAKTO WEBHOOK] Recebido Payload completo:", JSON.stringify(payload));

    // 1. Obter e Validar webhook secret de forma tolerante a falhas
    const CAKTO_WEBHOOK_SECRET = process.env.CAKTO_WEBHOOK_SECRET || "";
    const receivedSecret = payload?.secret || req.query?.secret || req.headers?.['x-cakto-token'] || req.headers?.['x-cakto-signature'];

    if (CAKTO_WEBHOOK_SECRET) {
      if (receivedSecret !== CAKTO_WEBHOOK_SECRET) {
        console.warn(`[CAKTO WEBHOOK] Secret Inválido! Recebido: ${receivedSecret} | Esperado: ${CAKTO_WEBHOOK_SECRET}`);
        return res.status(401).json({ error: "Secret inválido" });
      }
    } else {
      console.warn("[CAKTO WEBHOOK] CAKTO_WEBHOOK_SECRET não está configurado nas variáveis de ambiente. Lógica de segurança de secret ignorada.");
    }

    // 2. Verificar se o evento é purchase_approved de forma ultra robusta
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
      // Se for um teste da Cakto ou n8n que use payload customizado, assumimos como aprovado para cadastrar o aluno
      payload?.test === true || 
      payload?.is_test === true ||
      payload?.status === "aprovado";

    if (!isApproved) {
      console.log(`[CAKTO WEBHOOK] Evento ignorado (não representa aprovação de compra): Event='${payload?.event}' Status='${statusName}'`);
      return res.status(200).json({ status: "ignorado", message: "Evento não é uma aprovação de compra" });
    }

    // 3. Extrair dados de forma defensiva e tolerante a falhas (flat ou nested payloads)
    const dataObj = payload?.data || payload || {};
    const customerObj = dataObj?.customer || payload?.customer || {};
    const productObj = dataObj?.product || payload?.product || {};

    const name = customerObj?.name || dataObj?.customer_name || dataObj?.name || payload?.customer_name || payload?.name || "Cliente";
    const email = customerObj?.email || dataObj?.customer_email || dataObj?.email || payload?.customer_email || payload?.email;
    const phone = customerObj?.phone || dataObj?.customer_phone || dataObj?.phone || payload?.customer_phone || payload?.phone || "";

    const produto = productObj?.name || dataObj?.product_name || dataObj?.product || payload?.product_name || payload?.product || "Biblioteca de Prompts";
    const valor = dataObj?.amount || dataObj?.price || payload?.amount || payload?.price || 0;
    const metodoPagamento = dataObj?.paymentMethod || dataObj?.payment_method || payload?.paymentMethod || payload?.payment_method || "não especificado";
    const cakto_order_id = dataObj?.id || dataObj?.order_id || payload?.id || payload?.order_id || `cakto_${Date.now()}`;

    if (!email) {
      console.error("[CAKTO WEBHOOK] Erro: Email do cliente ausente no payload:", JSON.stringify(payload));
      return res.status(400).json({ error: "Email do cliente ausente" });
    }

    console.log(`[CAKTO WEBHOOK] Processando liberação para: ${email} | Nome: ${name}`);

    // Obter cliente administrativo do Supabase
    const supabase = getSupabaseClient();

    // 4. Verificar se o usuário já existe na tabela profiles primeiro (muito mais rápido, evita estouro do listUsers)
    const { data: perfilExistente, error: perfilError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    let userId = perfilExistente?.id;

    if (!userId) {
      console.log(`[CAKTO WEBHOOK] Perfil não localizado pelo e-mail '${email}'. Verificando listagem global do Auth...`);
      
      // Busca geral no Auth pra ter certeza que não há usuário duplicado
      const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({
        perPage: 1000
      });
      
      if (!listError && usersData?.users) {
        const existingUser = usersData.users.find((u: any) => u.email === email);
        if (existingUser) {
          userId = existingUser.id;
          console.log(`[CAKTO WEBHOOK] Usuário encontrado apenas na autenticação (Auth). ID: ${userId}`);
        }
      }
    }

    // Se o usuário realmente não existe, vamos criá-lo
    if (!userId) {
      const defaultPassword = process.env.DEFAULT_PASSWORD || "CodigoIA@2024";
      console.log(`[CAKTO WEBHOOK] Usuário novo. Criando no Auth com email ${email} e senha ${defaultPassword}`);
      
      const { data: inviteData, error: inviteError } = await supabase.auth.admin.createUser({
        email: email,
        password: defaultPassword,
        email_confirm: true,
        user_metadata: { full_name: name, phone: phone }
      });

      if (inviteError) {
        // Se der erro de duplicate de forma concorrente, tenta carregar o id de novo
        if (inviteError.message.includes("already exists") || inviteError.status === 422) {
          const { data: retryUsers } = await supabase.auth.admin.listUsers({ perPage: 1000 });
          const retryFound = retryUsers?.users?.find((u: any) => u.email === email);
          if (retryFound) {
            userId = retryFound.id;
          }
        }
        
        if (!userId) {
          console.error("[CAKTO WEBHOOK] Erro ao criar usuário no Auth do Supabase:", inviteError);
          return res.status(200).json({ error: "Erro ao criar usuário, mas evento registrado como recebido." });
        }
      } else {
        userId = inviteData.user?.id;
        console.log(`[CAKTO WEBHOOK] Novo usuário do Auth criado com sucesso. ID: ${userId}`);
      }
    } else {
      console.log(`[CAKTO WEBHOOK] Usuário já existente encontrado. ID: ${userId}`);
    }

    if (!userId) throw new Error("Não foi possível resolver o ID do usuário.");

    // 5. Upsert na tabela de profiles para manter atualizado e forçar redefinição opcional de senha
    console.log(`[CAKTO WEBHOOK] Fazendo upsert na tabela de profiles para o ID ${userId}`);
    const { error: upsertPerfilError } = await supabase.from("profiles").upsert({
      id: userId,
      nome: name,
      email: email,
      telefone: phone,
      acesso_ativo: true,
      must_change_password: true
    });

    if (upsertPerfilError) {
      console.error("[CAKTO WEBHOOK] Erro no upsert da tabela 'profiles':", upsertPerfilError);
      throw upsertPerfilError;
    }

    // 6. Inserir na tabela de compras de forma segura
    console.log(`[CAKTO WEBHOOK] Cadastrando compra na tabela 'compras'...`);
    const { error: compraError } = await supabase.from("compras").insert({
      user_id: userId,
      produto_nome: produto,
      valor: valor,
      metodo_pagamento: metodoPagamento,
      cakto_order_id: cakto_order_id
    });

    if (compraError) {
      if (compraError.code === '23505') { 
        console.log(`[CAKTO WEBHOOK] Compra com ID do pedido ${cakto_order_id} já havia sido registrada. Ignorando.`);
      } else {
        console.error("[CAKTO WEBHOOK] Erro ao salvar compra no banco:", compraError);
        throw compraError;
      }
    }

    console.log(`[CAKTO WEBHOOK] Sucesso absoluto! Acesso liberado no Supabase para ${email}`);
    return res.status(200).json({ success: true, message: "Acesso e compra liberados com sucesso!" });

  } catch (err: any) {
    console.error("[Cakto Webhook Error]", err);
    return res.status(500).json({ error: "Erro interno do servidor", details: err.message });
  }
}
