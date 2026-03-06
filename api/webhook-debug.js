/**
 * Endpoint de diagnóstico — salva o último payload recebido no Redis
 * para inspecionar o formato exato do MasterPag
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (req.method === 'POST') {
    // Salvar payload completo no Redis por 1h
    const payload = JSON.stringify(req.body || {});
    console.log('[WEBHOOK-DEBUG] Payload recebido:', payload);
    if (url && token) {
      await fetch(`${url}/set/debug:last_payload/${encodeURIComponent(payload)}/ex/3600`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    return res.status(200).json({ received: true, payload: req.body });
  }

  if (req.method === 'GET') {
    // Retornar o último payload salvo
    if (!url || !token) return res.status(200).json({ error: 'Redis não configurado' });
    const resp = await fetch(`${url}/get/debug:last_payload`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await resp.json();
    const raw = data?.result ? decodeURIComponent(data.result) : null;
    return res.status(200).json({ last_payload: raw ? JSON.parse(raw) : null });
  }

  return res.status(405).end();
}
