const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Senha simples de proteção (pode ser alterada)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin2026';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Verificar senha via query param ou header
  const senha = req.query.senha || req.headers['x-admin-password'];
  if (senha !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Acesso não autorizado' });
  }

  try {
    // Buscar todos os leads da lista (até 500)
    const raw = await redis.lrange('leads:all', 0, 499);

    const leads = raw.map(item => {
      try {
        return typeof item === 'string' ? JSON.parse(item) : item;
      } catch {
        return null;
      }
    }).filter(Boolean);

    return res.status(200).json({ success: true, total: leads.length, leads });
  } catch (err) {
    console.error('Erro ao listar leads:', err);
    return res.status(500).json({ error: 'Erro interno ao listar leads' });
  }
};
