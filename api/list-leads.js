/**
 * GET /api/list-leads?senha=admin2026
 * Lista todos os leads (CPF + Telefone + Placa) salvos no Redis após pagamento confirmado
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin2026';
  const senha = req.query.senha || req.headers['x-admin-password'];
  if (senha !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Acesso não autorizado' });
  }

  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return res.status(500).json({ error: 'Redis não configurado' });
  }

  try {
    const resp = await fetch(`${url}/lrange/leads:all/0/499`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await resp.json();
    const raw = data?.result || [];

    const leads = raw.map(item => {
      try {
        return typeof item === 'string' ? JSON.parse(item) : item;
      } catch {
        return null;
      }
    }).filter(Boolean);

    return res.status(200).json({ success: true, total: leads.length, leads });
  } catch (err) {
    console.error('[LIST-LEADS] Erro:', err);
    return res.status(500).json({ error: 'Erro interno ao listar leads' });
  }
}
