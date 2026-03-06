/**
 * GET /api/check-paid?id=CHARGE_ID
 * Consulta o Redis para verificar se o pagamento foi confirmado pelo webhook
 * Retorna: { paid: true } ou { paid: false }
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  if (!id) return res.status(400).json({ paid: false, error: 'ID não informado' });

  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn('[CHECK-PAID] Redis não configurado');
    return res.status(200).json({ paid: false, error: 'Redis não configurado' });
  }

  try {
    const resp = await fetch(`${url}/get/${encodeURIComponent(`charge:${id}`)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await resp.json();
    const paid = data?.result === 'paid';
    console.log(`[CHECK-PAID] charge:${id} = ${data?.result} → paid=${paid}`);
    return res.status(200).json({ paid });
  } catch (err) {
    console.error('[CHECK-PAID] Erro ao consultar Redis:', err);
    return res.status(200).json({ paid: false, error: 'Erro ao consultar Redis' });
  }
}
