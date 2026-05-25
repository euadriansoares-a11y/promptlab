import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const CAKTO_WEBHOOK_SECRET = process.env.CAKTO_WEBHOOK_SECRET || "";

// Inicializa o cliente do Supabase com Service Role para ter poderes administrativos
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function webhookCakto(req: any, res: any) {
  try {
    const payload = req.body;

    // 1. Validar webhook secret
    if (payload.secret !== CAKTO_WEBHOOK_SECRET) {
      return res.status(401).json({ error: "Secret inválido" });
    }

    // 2. Verificar se o evento é purchase_approved
    if (payload.event !== "purchase_approved") {
      return res.status(200).json({ status: "ignorado", message: "Evento não é purchase_approved" });
    }

    // 3. Extrair dados do payload
    const { customer, product, amount, paymentMethod, id: cakto_order_id } = payload.data || {};
    const { name, email, phone } = customer || {};
    const produto = product?.name;
    const valor = amount;
    const metodoPagamento = paymentMethod;

    if (!email) {
      return res.status(400).json({ error: "Email do cliente ausente" });
    }

    // 4. Verificar se o usuário já existe
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const existingUser = usersData.users.find(u => u.email === email);
    let userId = existingUser?.id;

    if (!existingUser) {
      // Gerar senha segura
      const generatedPassword = crypto.randomBytes(12).toString("base64url");
      
      // Criar novo usuário
      const { data: newUserData, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: generatedPassword,
        email_confirm: true,
        user_metadata: { full_name: name, phone: phone }
      });

      if (createError) throw createError;
      userId = newUserData.user?.id;

      // TODO: Aqui você faria o envio de e-mail de boas-vindas com email, nome e senha temporária
      // EX: await sendEmail(email, name, generatedPassword);
      console.log(`[INFO] Novo usuário criado. E-mail: ${email} | Senha provisória: ${generatedPassword}`);
    }

    if (!userId) throw new Error("Não foi possível resolver o ID do usuário.");

    // 5. Upsert na tabela de perfis
    const { error: perfilError } = await supabase.from("perfis").upsert({
      id: userId,
      nome: name,
      email: email,
      telefone: phone,
      acesso_ativo: true
    });

    if (perfilError) throw perfilError;

    // 6. Inserir na tabela de compras
    const { error: compraError } = await supabase.from("compras").insert({
      user_id: userId,
      produto_nome: produto,
      valor: valor,
      metodo_pagamento: metodoPagamento,
      cakto_order_id: cakto_order_id
    });

    // É comum ignorar erro de foreign key duplicada se "cakto_order_id" já existir,
    // mas de acordo com os passos apenas reportaremos se falhar num contexto de banco
    if (compraError) {
      // Ignora erro se for duplicidade exata do cakto_order_id
      if (compraError.code !== '23505') { 
        throw compraError;
      }
    }

    // Retornar sucesso
    return res.status(200).json({ success: true });

  } catch (err: any) {
    console.error("[Cakto Webhook Error]", err);
    return res.status(500).json({ error: "Erro interno do servidor", details: err.message });
  }
}
