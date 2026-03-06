// API Proxy para consulta de placas
// Este arquivo faz o proxy da API de placas para contornar restrições de CORS

export default async function handler(req, res) {
  // Permitir CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Responder a requisições OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Apenas aceitar GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { placa } = req.query;

  // Validar placa
  if (!placa) {
    return res.status(400).json({ error: 'Placa é obrigatória' });
  }

  try {
    // Chamar a API de placas
    const response = await fetch(
      `https://placa-proxy-worker.meu-proxy-placa.workers.dev/?placa=${placa}`
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Erro ao consultar API' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ error: 'Erro ao processar requisição' });
  }
}
