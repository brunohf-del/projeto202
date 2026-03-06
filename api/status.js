/**
 * api/status.js — Verifica o status de uma cobrança no MasterPag
 * GET /api/status?id=CHARGE_ID
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Parâmetro id obrigatório' });

  try {
    const publicKey = process.env.MASTERPAG_PUBLIC_KEY;
    const secretKey = process.env.MASTERPAG_SECRET_KEY;

    if (!publicKey || !secretKey) {
      return res.status(500).json({ error: 'Configuração do servidor incompleta' });
    }

    const response = await fetch(`https://dcnmsoaogkbgkbwpldrp.supabase.co/functions/v1/charge/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-public-key': publicKey,
        'x-secret-key': secretKey
      }
    });

    const data = await response.json();

    return res.status(200).json({
      id: data.id || id,
      status: data.status || 'pending',
      paid: data.status === 'paid' || data.paid === true
    });

  } catch (error) {
    console.error('[STATUS] Erro ao verificar status:', error);
    return res.status(500).json({ error: 'Erro ao verificar status do pagamento' });
  }
}
