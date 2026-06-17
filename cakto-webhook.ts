import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Request, Response } from 'express';

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  let url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim()
    .replace(/\/rest\/v1\/?$/, '')
    .replace(/\/$/, '');

  if (url && !url.startsWith('http')) {
    url = `https://${url}`;
  }

  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!url || !key) {
    throw new Error('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados.');
  }

  _supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return _supabase;
}

function gerarSenhaTemporaria(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let senha = 'PL@';
  for (let i = 0; i < 8; i++) {
    senha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return senha;
}

function extrairDadosCakto(body: any) {
  const evento: string = body.event ?? body.evento ?? body.type ?? body.trigger ?? '';
  const status: string =
    body.status ?? body.payment_status ?? body.charge_status ??
    body.sale_status ?? body.data?.status ?? '';

  const customer = body.customer ?? body.comprador ?? body.buyer ?? body.data?.customer ?? {};
  const email: string = (
    customer.email ?? body.email ?? body.customer_email ?? body.data?.email ?? ''
  ).trim().toLowerCase();

  const nome: string = customer.name ?? customer.nome ?? body.customer_name ?? body.nome ?? '';
  const telefone: string = customer.phone ?? customer.telefone ?? customer.cel ?? body.phone ?? '';

  const product = body.product ?? body.produto ?? body.data?.product ?? {};
  const produtoNome: string = product.name ?? product.nome ?? body.product_name ?? '';
  const produtoId: string = product.id ?? product.codigo ?? body.product_id ?? '';

  const valor: number = Number(body.amount ?? body.valor ?? body.price ?? body.data?.amount ?? 0);
  const formaPagamento: string = body.payment_method ?? body.forma_pagamento ?? body.payment_type ?? '';
  const orderId: string = body.order_id ?? body.id ?? body.transaction_id ?? body.cakto_id ?? body.data?.id ?? '';

  return { email, nome, telefone, produtoNome, produtoId, valor, formaPagamento, orderId, status, evento };
}

function isCompraAprovada(evento: string, status: string): boolean {
  const evLower = evento.toLowerCase();
  const stLower = status.toLowerCase();
  const eventosAprovados = [
    'purchase_approved', 'purchase.approved', 'sale_approved', 'sale.approved',
    'payment_approved', 'payment.approved', 'compra_aprovada', 'order_paid', 'order.paid',
  ];
  const statusAprovados = ['approved', 'paid', 'pago', 'paga', 'completed', 'concluido', 'active'];
  
  // Condição para testes via webhook
  if (evLower === 'test' || stLower === 'test') { return true; }

  return eventosAprovados.some(e => evLower.includes(e)) || statusAprovados.some(s => stLower === s);
}

async function encontrarUsuarioPorEmail(supabase: SupabaseClient, email: string): Promise<string | null> {
  // 1. Procurar em profiles primeiro
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .ilike('email', email)
    .maybeSingle();

  if (profile?.id) return profile.id;

  // 2. Tentar buscar em Auth Users
  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const found = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
  return found?.id ?? null;
}

async function processarEvento(body: any): Promise<void> {
  const dados = extrairDadosCakto(body);

  if (!dados.email) {
    console.error('[webhook] [ERRO] Email não encontrado no payload. Encerrando processo.');
    return;
  }

  if (!isCompraAprovada(dados.evento, dados.status)) {
    console.log(`[webhook] [IGNORADO] Não é aprovação — evento="${dados.evento}" status="${dados.status}"`);
    return;
  }

  console.log(`[webhook] [INÍCIO] Processando compra aprovada para o email: ${dados.email}`);

  const supabase = getSupabase();
  let userId = await encontrarUsuarioPorEmail(supabase, dados.email);
  let usuarioNovo = false;

  if (!userId) {
    console.log(`[webhook] [CRIAÇÃO] Aluno não localizado na base. O email ${dados.email} será cadastrado agora...`);
    const senhaTemp = gerarSenhaTemporaria();
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email: dados.email,
      password: senhaTemp,
      email_confirm: true,
      user_metadata: { nome: dados.nome, telefone: dados.telefone },
    });

    if (createError) {
      console.warn(`[webhook] [ERRO] Falha ao criar usuário (${dados.email}):`, createError.message);
      userId = await encontrarUsuarioPorEmail(supabase, dados.email);
      if (!userId) {
        console.error('[webhook] [FALHA] Não foi possível criar ou localizar o usuário final.');
        return;
      }
      console.log(`[webhook] [RECUPERAÇÃO] Usuário econtrado após falha: ${userId}`);
    } else {
      userId = created.user.id;
      usuarioNovo = true;
      console.log(`[webhook] [SUCESSO] Usuário criado no Auth! ID: ${userId}`);
    }
  } else {
    console.log(`[webhook] [INFO] Usuário já existente localizado. ID: ${userId}`);
  }

  console.log(`[webhook] [DB] Atualizando perfil do aluno na tabela 'profiles' para o ID: ${userId}`);
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email: dados.email,
      nome: dados.nome || null,
      telefone: dados.telefone || null,
      acesso_ativo: true,
      must_change_password: usuarioNovo,
    }, { onConflict: 'id' });

  if (profileError) {
    console.error('[webhook] [ERRO DB] Falha ao salvar profile:', profileError.message);
  } else {
    console.log('[webhook] [DB] Perfil em "profiles" salvo com sucesso.');
  }

  if (dados.orderId) {
    console.log(`[webhook] [DB] Registrando compra. Order ID: ${dados.orderId}`);
    const { error: compraError } = await supabase
      .from('compras')
      .insert({
        user_id: userId,
        produto_nome: dados.produtoNome || null,
        produto_id: dados.produtoId || null,
        valor: dados.valor || null,
        forma_pagamento: dados.formaPagamento || null,
        cakto_order_id: dados.orderId,
      });

    if (compraError) {
      if (compraError.code === '23505') {
        console.log(`[webhook] [DB] Compra duplicada ignorada (já registrada): ${dados.orderId}`);
      } else {
        console.error('[webhook] [ERRO DB] Falha ao registrar compra na tabela "compras":', compraError.message);
      }
    } else {
      console.log('[webhook] [DB] Transação de compra registrada com sucesso.');
    }
  }

  if (usuarioNovo) {
    console.log(`[webhook] [EMAIL] Gerando link de recuperação/definição de senha para o novo aluno...`);
    const { error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: dados.email,
    });
    if (resetError) {
      console.warn('[webhook] [ERRO] Erro ao gerar link de senha:', resetError.message);
    } else {
      console.log(`[webhook] [SUCESSO] Link de senha gerado. O Supabase disparará o e-mail de boas vindas para: ${dados.email}`);
    }
  }

  console.log(`[webhook] [SUCESSO TOTAL] Processo de webhook concluído para ${dados.email}`);
}

export async function webhookCakto(req: Request, res: Response): Promise<void> {
  const payload = req.body;
  console.log("[webhook] [RECEBIDO] Payload da requisição webhook:", JSON.stringify(payload));
  
  const secretEsperado = process.env.CAKTO_WEBHOOK_SECRET;
  if (secretEsperado) {
    const secretRecebido =
      req.headers['x-cakto-secret'] ??
      req.headers['x-webhook-secret'] ??
      (req.headers['authorization'] as string)?.replace('Bearer ', '') ??
      req.body?.secret;

    if (secretRecebido !== secretEsperado) {
      console.warn('[webhook] [AUTH] Secret recebido é inválido.');
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
  }

  // Responder 200 imediatamente
  res.status(200).json({ received: true, status: 'ok' });

  // Processo assíncrono
  processarEvento(payload).catch(err => {
    console.error('[webhook] [ERRO CRÍTICO] Falha inesperada durante o processamento:', err);
  });
}
