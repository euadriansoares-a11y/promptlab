import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Request, Response } from 'express';

// ----------------------------------------------------------------
// Supabase client (service role — nunca expor no frontend)
// ----------------------------------------------------------------
let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  let url = (process.env.SUPABASE_URL ?? '').trim()
    .replace(/\/rest\/v1\/?$/, '')
    .replace(/\/$/, '');

  if (url && !url.startsWith('http')) url = `https://${url}`;

  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();

  if (!url || !key) {
    throw new Error('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados.');
  }

  _supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return _supabase;
}

// ----------------------------------------------------------------
// Geração de senha temporária única por aluno
// ----------------------------------------------------------------
function gerarSenhaTemporaria(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let senha = 'PL@';
  for (let i = 0; i < 8; i++) {
    senha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return senha;
}

// ----------------------------------------------------------------
// Extração de campos do payload Cakto
// ----------------------------------------------------------------
function extrairDadosCakto(body: any): {
  email: string;
  nome: string;
  telefone: string;
  produtoNome: string;
  produtoId: string;
  valor: number;
  formaPagamento: string;
  orderId: string;
  status: string;
  evento: string;
} {
  const evento: string =
    body.event ?? body.evento ?? body.type ?? body.trigger ?? '';
  const status: string =
    body.status ??
    body.payment_status ??
    body.charge_status ??
    body.sale_status ??
    body.data?.status ??
    '';

  const customer = body.customer ?? body.comprador ?? body.buyer ?? body.data?.customer ?? {};
  const email: string = (
    customer.email ??
    body.email ??
    body.customer_email ??
    body.data?.email ??
    ''
  ).trim().toLowerCase();

  const nome: string =
    customer.name ?? customer.nome ?? body.customer_name ?? body.nome ?? '';

  const telefone: string =
    customer.phone ?? customer.telefone ?? customer.cel ?? body.phone ?? '';

  const product = body.product ?? body.produto ?? body.data?.product ?? {};
  const produtoNome: string =
    product.name ?? product.nome ?? body.product_name ?? body.produto_nome ?? '';
  const produtoId: string = product.id ?? product.codigo ?? body.product_id ?? '';

  const valor: number = Number(
    body.amount ?? body.valor ?? body.price ?? body.data?.amount ?? 0
  );
  const formaPagamento: string =
    body.payment_method ?? body.forma_pagamento ?? body.payment_type ?? '';

  const orderId: string =
    body.order_id ?? body.id ?? body.transaction_id ?? body.cakto_id ?? body.data?.id ?? '';

  return { email, nome, telefone, produtoNome, produtoId, valor, formaPagamento, orderId, status, evento };
}

// ----------------------------------------------------------------
// Verifica se o evento representa uma compra aprovada
// ----------------------------------------------------------------
function isCompraAprovada(evento: string, status: string): boolean {
  const eventosAprovados = [
    'purchase_approved', 'purchase.approved',
    'sale_approved', 'sale.approved',
    'payment_approved', 'payment.approved',
    'compra_aprovada', 'venda_aprovada',
    'order_paid', 'order.paid',
  ];
  const statusAprovados = [
    'approved', 'paid', 'pago', 'paga',
    'completed', 'concluido', 'concluída', 'active',
  ];

  const evLower = evento.toLowerCase();
  const stLower = status.toLowerCase();

  return (
    eventosAprovados.some(e => evLower.includes(e)) ||
    statusAprovados.some(s => stLower === s)
  );
}

// ----------------------------------------------------------------
// Encontra usuário existente pelo email
// ----------------------------------------------------------------
async function encontrarUsuarioPorEmail(
  supabase: SupabaseClient,
  email: string
): Promise<string | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .ilike('email', email)
    .maybeSingle();

  if (profile?.id) return profile.id;

  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const found = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
  return found?.id ?? null;
}

// ----------------------------------------------------------------
// Processamento assíncrono do evento
// ----------------------------------------------------------------
async function processarEvento(body: any): Promise<void> {
  const dados = extrairDadosCakto(body);

  if (!dados.email) {
    console.error('[webhook] Email não encontrado no payload:', JSON.stringify(body));
    return;
  }

  if (!isCompraAprovada(dados.evento, dados.status)) {
    console.log(`[webhook] Evento ignorado — evento="${dados.evento}" status="${dados.status}"`);
    return;
  }

  console.log(`[webhook] Processando compra aprovada para: ${dados.email}`);

  const supabase = getSupabase();
  let userId = await encontrarUsuarioPorEmail(supabase, dados.email);
  let usuarioNovo = false;

  if (!userId) {
    const senhaTemp = gerarSenhaTemporaria();

    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email: dados.email,
      password: senhaTemp,
      email_confirm: true,
      user_metadata: {
        nome: dados.nome,
        telefone: dados.telefone,
        senha_temp: senhaTemp,
      },
    });

    if (createError) {
      console.warn('[webhook] Erro ao criar usuário, tentando localizar:', createError.message);
      userId = await encontrarUsuarioPorEmail(supabase, dados.email);
      if (!userId) {
        console.error('[webhook] Não foi possível criar nem localizar o usuário.');
        return;
      }
    } else {
      userId = created.user.id;
      usuarioNovo = true;
      console.log(`[webhook] Usuário criado: ${userId}`);
    }
  } else {
    console.log(`[webhook] Usuário já existia: ${userId}`);
  }

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
    console.error('[webhook] Erro ao salvar profile:', profileError.message);
  }

  if (dados.orderId) {
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
        console.log(`[webhook] Compra duplicada ignorada: ${dados.orderId}`);
      } else {
        console.error('[webhook] Erro ao registrar compra:', compraError.message);
      }
    }
  }

  if (usuarioNovo) {
    const { error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: dados.email,
    });

    if (resetError) {
      console.warn('[webhook] Não foi possível gerar link de reset:', resetError.message);
    } else {
      console.log(`[webhook] E-mail de boas-vindas/reset enviado para: ${dados.email}`);
    }
  }

  console.log(`[webhook] Concluído para ${dados.email}`);
}

// ----------------------------------------------------------------
// Handler Express
// ----------------------------------------------------------------
export async function webhookCakto(req: Request, res: Response): Promise<void> {
  const secretEsperado = process.env.CAKTO_WEBHOOK_SECRET;
  if (secretEsperado) {
    const secretRecebido =
      req.headers['x-cakto-secret'] ??
      req.headers['x-webhook-secret'] ??
      req.headers['authorization']?.replace('Bearer ', '') ??
      req.body?.secret;

    if (secretRecebido !== secretEsperado) {
      console.warn('[webhook] Secret inválido recebido.');
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
  }

  res.status(200).json({ received: true });

  processarEvento(req.body).catch(err => {
    console.error('[webhook] Erro inesperado no processamento:', err);
  });
}
