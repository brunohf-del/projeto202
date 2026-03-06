/**
 * POST /api/save-lead
 * Salva CPF + Telefone + Placa no Redis após pagamento confirmado
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return res.status(500).json({ error: 'Redis não configurado' });
  }

  try {
    const { placa, cpf, telefone, chargeId, valor } = req.body;
    if (!placa || !cpf || !telefone) {
      return res.status(400).json({ error: 'Placa, CPF e telefone são obrigatórios' });
    }

    const timestamp = new Date().toISOString();
    const placaClean = placa.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const key = `lead:${placaClean}:${Date.now()}`;

    const lead = {
      key,
      placa: placa.toUpperCase(),
      cpf: cpf.replace(/\D/g, ''),
      telefone: telefone.replace(/\D/g, ''),
      chargeId: chargeId || '',
      valor: valor || '',
      timestamp
    };

    const leadJson = encodeURIComponent(JSON.stringify(lead));
    const TTL = 60 * 60 * 24 * 90; // 90 dias

    // Salva o lead individual com TTL
    await fetch(`${url}/set/${encodeURIComponent(key)}/${leadJson}/ex/${TTL}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Adiciona ao índice de leads (lista)
    await fetch(`${url}/lpush/leads:all/${leadJson}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Mantém apenas os últimos 10.000 leads
    await fetch(`${url}/ltrim/leads:all/0/9999`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('[SAVE-LEAD] Lead salvo:', key, lead);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[SAVE-LEAD] Erro:', err);
    return res.status(500).json({ error: 'Erro interno ao salvar lead' });
  }
}
