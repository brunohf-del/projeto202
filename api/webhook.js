/**
 * Webhook MasterPag — recebe eventos charge.created e charge.paid
 * URL configurada no painel: https://projeto202.vercel.app/api/webhook
 *
 * Formato real do MasterPag:
 * {
 *   "event": "charge.paid",
 *   "data": {
 *     "transaction_id": "d6bd883d-...",
 *     "external_id": "9e96258d-...",
 *     "status": "paid",
 *     ...
 *   },
 *   "timestamp": "2026-03-06T04:14:54.856Z"
 * }
 */

async function redisSet(key, value, exSeconds = 3600) {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    console.warn('[WEBHOOK] Redis não configurado — variáveis de ambiente ausentes');
    return;
  }
  const resp = await fetch(`${url}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}/ex/${exSeconds}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const result = await resp.json();
  console.log(`[WEBHOOK] Redis SET ${key} = ${value} →`, JSON.stringify(result));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-webhook-signature');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const event = req.body;
    console.log('[WEBHOOK] Payload recebido:', JSON.stringify(event));

    // Suporta ambos os formatos: { event, data } e { type, data }
    const tipo     = event?.event || event?.type || '';
    const data     = event?.data  || event?.charge || {};

    // ID: tenta transaction_id primeiro (formato real do MasterPag), depois id
    const chargeId = data?.transaction_id || data?.external_id || data?.id || data?.chargeId || '';
    const status   = data?.status || '';

    console.log(`[WEBHOOK] tipo=${tipo} | chargeId=${chargeId} | status=${status}`);

    // ── charge.paid → pagamento confirmado ──────────────────────────────────
    if (tipo === 'charge.paid' || status === 'paid') {
      console.log(`[WEBHOOK] ✅ Pagamento confirmado! ID: ${chargeId}`);

      if (chargeId) {
        // Salvar com transaction_id
        await redisSet(`charge:${chargeId}`, 'paid', 3600);

        // Se tiver external_id diferente, salvar também
        if (data?.external_id && data.external_id !== chargeId) {
          await redisSet(`charge:${data.external_id}`, 'paid', 3600);
        }
        if (data?.transaction_id && data.transaction_id !== chargeId) {
          await redisSet(`charge:${data.transaction_id}`, 'paid', 3600);
        }
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
      console.log(`[WEBHOOK] 📋 Cobrança criada. ID: ${chargeId}`);
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
