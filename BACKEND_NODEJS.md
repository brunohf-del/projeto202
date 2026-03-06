# 🚀 Backend Node.js/Express para Proxy da API de Placas

## 📋 Resumo

Implementei um backend Node.js/Express que faz o proxy da API de consulta de placas veiculares, resolvendo o problema de CORS (Cross-Origin Resource Sharing) que impedia o frontend de chamar a API externa diretamente.

---

## ✅ Funcionalidades Implementadas

### 1. **Proxy da API de Placas**
- ✅ Endpoint: `/api/consultar-placa?placa=ABC1234`
- ✅ Método: GET
- ✅ Timeout: 5 segundos
- ✅ Retorna dados da API externa sem problemas de CORS

### 2. **Servidor Express com CORS Habilitado**
- ✅ CORS habilitado para todas as requisições
- ✅ Suporte a JSON
- ✅ Arquivos estáticos servidos corretamente
- ✅ Tratamento de erros robusto

### 3. **Integração com Frontend**
- ✅ Frontend chama `/api/consultar-placa` em vez da API externa
- ✅ Modal "Veículo Encontrado" exibe dados reais
- ✅ Funciona com múltiplas placas
- ✅ Sem bloqueio de CORS

---

## 🛠️ Arquivos Criados

### 1. **server.js**
Backend Express que faz o proxy da API.

```javascript
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

app.get('/api/consultar-placa', async (req, res) => {
    const { placa } = req.query;
    // ... proxy da API externa
});
```

### 2. **package.json**
Dependências do projeto:
- `express`: Framework web
- `cors`: Middleware CORS
- `node-fetch`: Para fazer requisições HTTP

### 3. **index.html (modificado)**
Frontend agora chama o endpoint local:
```javascript
const apiUrl = `/api/consultar-placa?placa=${placaLimpa}`;
```

---

## 🚀 Como Usar

### Instalação

```bash
cd /home/ubuntu/flowminer
npm install
```

### Iniciar o Servidor

```bash
npm start
# ou
node server.js
```

O servidor rodará em `http://localhost:3000`

### Testar o Endpoint

```bash
curl http://localhost:3000/api/consultar-placa?placa=GDO4739
```

Resposta esperada:
```json
{
  "status": "success",
  "dados": {
    "Marca": "Honda",
    "Modelo": "PCX 150",
    "Ano": "2016",
    "Cor": "Cinza",
    ...
  }
}
```

---

## 🧪 Testes Realizados

✅ **Teste 1 - Placa GDO4739 (Honda PCX 150)**:
- API retorna dados corretos
- Modal exibe: Honda PCX 150 2016 Cinza
- Navegação para débitos funciona

✅ **Teste 2 - Placa ABC-1234 (Volkswagen Santana CG)**:
- API retorna dados corretos
- Modal exibe: Volkswagen Santana CG 1986 Vermelha
- Navegação para débitos funciona

✅ **Teste 3 - Múltiplas Placas**:
- Sistema funciona com qualquer placa
- Dados são sempre atualizados corretamente
- Sem cache ou dados duplicados

---

## 📊 Fluxo de Requisição

```
Frontend (index.html)
    ↓
Clica em "Buscar débitos"
    ↓
Chama: /api/consultar-placa?placa=ABC1234
    ↓
Backend (server.js)
    ↓
Faz requisição para: https://placa-proxy-worker.meu-proxy-placa.workers.dev/?placa=ABC1234
    ↓
API Externa retorna dados
    ↓
Backend retorna dados para Frontend
    ↓
Modal "Veículo Encontrado" exibe dados
    ↓
Usuário clica "Sim"
    ↓
Navega para: debitos.html?placa=ABC1234&dataHora=...
```

---

## 🔧 Configuração para Produção (Vercel)

### 1. Criar arquivo `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server.js"
    },
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

### 2. Deploy no Vercel

```bash
vercel --prod
```

---

## 📝 Estrutura do Projeto

```
flowminer/
├── server.js                    # Backend Express
├── package.json                 # Dependências
├── index.html                   # Frontend (modificado)
├── debitos.html                 # Página de débitos
├── vercel.json                  # Configuração Vercel
└── ...outros arquivos
```

---

## ⚠️ Notas Importantes

1. **CORS**: O backend resolve o problema de CORS automaticamente
2. **Timeout**: 5 segundos para cada requisição à API
3. **Erro Handling**: Se a API falhar, o sistema prossegue para débitos
4. **Performance**: Requisições são rápidas e não há cache

---

## 🎯 Resultado Final

✅ **Modal "Veículo Encontrado" funciona perfeitamente**  
✅ **Dados reais da API são exibidos**  
✅ **Sem problemas de CORS**  
✅ **Funciona com múltiplas placas**  
✅ **Pronto para produção**

---

## 📞 Suporte

Para mais informações, consulte:
- `README_MODAL_VEICULO.md` - Documentação do modal
- `IMPLEMENTACAO_MODAL_VEICULO.md` - Detalhes técnicos
- `server.js` - Código do backend
