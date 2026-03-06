/**
 * Webhook MasterPag — recebe eventos charge.created e charge.paid
 * URL configurada no painel: https://projeto202.vercel.app/api/webhook
 * Quando charge.paid, salva no Redis: charge:{id} = "paid" (expira em 1h)
 */

async function redisSet(key, value, exSeconds = 3600) {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;
  await fetch(`${url}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}/ex/${exSeconds}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-webhook-signature');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const event = req.body;
    console.log('[WEBHOOK] Evento recebido:', JSON.stringify(event, null, 2));

    const tipo        = event?.type  || event?.event || '';
    const charge      = event?.data  || event?.charge || event || {};
    const chargeId    = charge?.id   || charge?.chargeId || '';
    const status      = charge?.status || '';
    const amount      = charge?.amount || charge?.value || 0;
    const externalRef = charge?.externalRef || charge?.external_ref || '';

    // ── charge.paid → pagamento confirmado ──────────────────────────────────
    if (tipo === 'charge.paid' || status === 'paid') {
      console.log(`[WEBHOOK] ✅ Pagamento confirmado! ID: ${chargeId} | Ref: ${externalRef} | Valor: R$ ${(amount / 100).toFixed(2)}`);

      // Salvar no Redis: chave "charge:{id}" = "paid", expira em 1 hora
      if (chargeId) {
        await redisSet(`charge:${chargeId}`, 'paid', 3600);
        console.log(`[WEBHOOK] ✅ Status salvo no Redis: charge:${chargeId} = paid`);
      }

      return res.status(200).json({
        received: true,
        event: tipo,
        chargeId,
        status: 'paid',
        message: 'Pagamento processado com sucesso'
      });
    }

    // ── charge.created → cobrança criada ────────────────────────────────────
    if (tipo === 'charge.created') {
      console.log(`[WEBHOOK] 📋 Cobrança criada. ID: ${chargeId} | Ref: ${externalRef}`);
      return res.status(200).json({ received: true, event: tipo, chargeId });
    }

    // ── outros eventos ───────────────────────────────────────────────────────
    console.log(`[WEBHOOK] Evento ignorado: ${tipo}`);
    return res.status(200).json({ received: true, event: tipo, ignored: true });

  } catch (error) {
    console.error('[WEBHOOK] Erro ao processar evento:', error);
    return res.status(500).json({ error: 'Erro interno ao processar webhook' });
  }
}
