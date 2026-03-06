const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const { placa, cpf, telefone } = req.body;

    if (!placa || !cpf || !telefone) {
      return res.status(400).json({ error: 'Placa, CPF e telefone são obrigatórios' });
    }

    const timestamp = new Date().toISOString();
    const key = `lead:${placa.toUpperCase().replace(/[^A-Z0-9]/g, '')}:${Date.now()}`;

    const lead = {
      placa: placa.toUpperCase(),
      cpf: cpf.replace(/\D/g, ''),
      telefone: telefone.replace(/\D/g, ''),
      timestamp,
    };

    // Salva o lead individual com TTL de 90 dias
    await redis.set(key, JSON.stringify(lead), { ex: 60 * 60 * 24 * 90 });

    // Adiciona ao índice de leads (lista ordenada por timestamp)
    await redis.lpush('leads:all', JSON.stringify({ key, ...lead }));

    // Mantém apenas os últimos 10.000 leads na lista
    await redis.ltrim('leads:all', 0, 9999);

    console.log('Lead salvo:', key, lead);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Erro ao salvar lead:', err);
    return res.status(500).json({ error: 'Erro interno ao salvar lead' });
  }
};
