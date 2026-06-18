import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
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
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = req.body || {};
  console.log("[webhook] Recebido evento da Cakto via Vercel Serverless.");

  const secretEsperado = (process.env.CAKTO_WEBHOOK_SECRET || '').trim();
  if (secretEsperado) {
    const secretRecebido = (
      req.headers['x-cakto-secret'] ??
      req.headers['x-cakto-token'] ??
      payload?.secret
    )?.toString().trim();

    if (secretRecebido !== secretEsperado) {
      console.warn(`[webhook] Token inválido! Recebido: "${secretRecebido}"`);
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  // Responder instantaneamente ao checkout 200 OK
  res.status(200).json({ received: true });

  try {
    const event = (payload.event ?? payload.evento ?? payload.type ?? payload.trigger ?? '').toLowerCase();
    const status = (payload.status ?? payload.payment_status ?? payload.data?.status ?? '').toLowerCase();
    const customer = payload.customer ?? payload.comprador ?? payload.data?.customer ?? {};
    const email = (customer.email ?? payload.email ?? payload.data?.email ?? '').trim().toLowerCase();
    const nome = customer.name ?? customer.nome ?? payload.nome ?? '';
    const product = payload.product ?? payload.produto ?? payload.data?.product ?? {};
    const produtoNome = product.name ?? product.nome ?? payload.product_name ?? '';
    const valor = Number(payload.amount ?? payload.valor ?? payload.data?.amount ?? 0);
    const orderId = payload.order_id ?? payload.id ?? payload.transaction_id ?? payload.data?.id ?? Date.now().toString();

    if (!email) {
      console.log("[webhook] Ignorado: Payload não contém email do cliente.");
      return;
    }

    const isApproved = event.includes('approved') || event.includes('aprovada') || event.includes('paid') || 
                       ['approved', 'paid', 'pago', 'completed', 'active'].includes(status) || event === 'test';

    if (!isApproved) {
      console.log(`[webhook] Ignorado: Transação não aprovada. Evento: ${event}, Status: ${status}`);
      return;
    }

    console.log(`[webhook] Processando acesso para: ${email}`);
    
    let url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim()
      .replace(/\/rest\/v1\/?$/, '')
      .replace(/\/$/, '');

    if (url && !url.startsWith('http')) {
      url = `https://${url}`;
    }

    const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

    if (!url || !key) {
      console.error("[webhook] SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados.");
      return;
    }

    const supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Procurar o usuário
    const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const existingUser = (authData?.users || []).find(u => u.email?.toLowerCase() === email);

    let userId = existingUser?.id;

    // 2. Criar com senha descartável, sem enviar email nenhum, SE ele não existir
    if (!userId) {
      const genericPassword = `Cakto_${Math.random().toString(36).slice(-8)}!`;
      const { data: created, error } = await supabase.auth.admin.createUser({
        email,
        password: genericPassword, // Será substituída no primeiro acesso dele via API
        email_confirm: true,       // Já confirmamos, já que ele comprou
        user_metadata: { nome, is_client: true }
      });

      if (error) {
        console.error(`[webhook] Erro a criar usuário auth:`, error.message);
        return; // Não tem como continuar sem UUID do auth
      }
      userId = created.user?.id;
    }

    if (userId) {
      // 3. Cadastrar/Liberar perfil
      const { error: profileErr } = await supabase.from('profiles').upsert({
        id: userId,
        email: email,
        nome: nome || null,
        acesso_ativo: true
      }, { onConflict: 'id' });
      if (profileErr) console.warn('[webhook] Erro no profiles:', profileErr.message);

      const { error: perfisErr } = await supabase.from('perfis').upsert({
        id: userId,
        email: email,
        nome: nome || null,
        acesso_ativo: true
      }, { onConflict: 'id' });
      if (perfisErr) console.warn('[webhook] Erro no perfis alternativa:', perfisErr.message);

      // 4. Gravar a tabela de compras
      const { error: compraErr } = await supabase.from('compras').insert({
        user_id: userId,
        produto_nome: produtoNome || 'Biblioteca de Prompts',
        valor: valor,
        cakto_order_id: orderId,
        status: 'ativo'
      });
      if (compraErr && compraErr.code !== '23505') console.warn('[webhook] Erro compras:', compraErr.message);
      
      console.log(`[webhook] Sincronização concluída com sucesso para ${email}. NENHUM e-mail SMTP enviado.`);
    }

  } catch (err: any) {
    console.error(`[webhook] Erro assíncrono interno:`, err.message || err);
  }
}
