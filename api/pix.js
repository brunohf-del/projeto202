export default async function handler(req, res) {
  // 1. Configurar CORS (Permitir apenas seu próprio domínio)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { amount, customer, items, externalRef } = req.body;

    // 2. Usar Variáveis de Ambiente do Vercel (Seguro)
    const publicKey = process.env.MASTERPAG_PUBLIC_KEY;
    const secretKey = process.env.MASTERPAG_SECRET_KEY;

    if (!publicKey || !secretKey) {
      console.error('ERRO: Chaves do MasterPag não configuradas no Vercel!');
      return res.status(500).json({ error: 'Configuração do servidor incompleta' });
    }

    // 3. Chamar a API do MasterPag pelo Servidor (Invisível para o cliente)
    const response = await fetch('https://dcnmsoaogkbgkbwpldrp.supabase.co/functions/v1/pix-receive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-public-key': publicKey,
        'x-secret-key': secretKey
      },
      body: JSON.stringify({
        amount,
        paymentMethod: 'pix',
        customer,
        items,
        pix: { expiresIn: 3600 },
        externalRef
      })
    });

    const data = await response.json();

    // 4. Retornar a resposta para o frontend
    if (response.ok && data.success) {
      return res.status(200).json(data);
    } else {
      console.error('Erro na API MasterPag:', data);
      return res.status(response.status || 400).json(data);
    }

  } catch (error) {
    console.error('Erro no processamento do PIX:', error);
    return res.status(500).json({ error: 'Erro interno no servidor ao gerar PIX' });
  }
}
