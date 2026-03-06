# Integração da API de Consulta de Placas Veiculares

## 📋 Resumo da Implementação

A integração da API de consulta de placas foi implementada com sucesso no arquivo `index.html` do projeto FlowMiner. O sistema agora valida e consulta informações do veículo antes de exibir os débitos de pedágio.

## ✨ Funcionalidades Implementadas

### 1. **Validação de Formato de Placa**
- Suporta formato brasileiro padrão: `ABC-1234`
- Suporta formato Mercosul: `ABC1D34` (com letra no 4º dígito)
- Validação automática antes de chamar a API
- Mensagem de erro clara se o formato for inválido

### 2. **Máscara Automática de Entrada**
- Ao digitar `ABC1234`, o sistema formata automaticamente para `ABC-1234`
- Funciona em tempo real enquanto o usuário digita
- Remove caracteres especiais e converte para maiúsculas

### 3. **Integração com API de Placas**
- **Endpoint**: `https://placa-proxy-worker.meu-proxy-placa.workers.dev/?placa=ABC1234`
- **Timeout**: 5 segundos
- **Método**: GET
- **Resposta esperada**: JSON com dados do veículo (marca, modelo, ano, cor, etc.)

### 4. **Modal de Confirmação "Veículo Encontrado"**
- Exibe dados retornados pela API:
  - Marca
  - Modelo
  - Ano
  - Cor
  - Placa
- Dois botões de ação:
  - **"Sim, este é meu veículo"**: Prossegue para `debitos.html?placa=ABC1234`
  - **"Não é meu veículo"**: Volta para o campo de busca (limpa e permite nova digitação)

### 5. **Tratamento Robusto de Erros**
- Se a API retornar erro (`status: "error"`)
- Se a API não responder (timeout)
- Se houver erro de rede
- **EM TODOS OS CASOS**: O sistema ignora silenciosamente e prossegue direto para `debitos.html`
- **O fluxo NUNCA é bloqueado por falha na API**

### 6. **Passagem de Parâmetros**
- A placa é passada via URL para `debitos.html`: `debitos.html?placa=ABC1234`
- A página de débitos já está preparada para receber este parâmetro

## 🧪 Instruções de Teste

### Teste 1: Placa Válida com Sucesso
1. Acesse `index.html`
2. Digite `ABC1234` no campo de placa
3. O sistema deve formatar automaticamente para `ABC-1234`
4. Marque os dois checkboxes de Termos e Condições
5. Clique em "Buscar débitos"
6. **Resultado esperado**:
   - Se a API responder com sucesso: Modal "Veículo Encontrado" aparece com os dados
   - Se a API não responder: Sistema prossegue direto para `debitos.html?placa=ABC1234`

### Teste 2: Placa Inválida
1. Acesse `index.html`
2. Digite `ABC` (apenas 3 caracteres)
3. Marque os dois checkboxes
4. Clique em "Buscar débitos"
5. **Resultado esperado**: Alerta SweetAlert2 com mensagem "Placa Inválida"
6. Mensagem: "Por favor, digite uma placa válida no formato ABC-1234 ou ABC1D34 (Mercosul)."

### Teste 3: Placa Mercosul
1. Acesse `index.html`
2. Digite `ABC1D34` (formato Mercosul com letra no 4º dígito)
3. O sistema deve formatar para `ABC-1D34`
4. Marque os dois checkboxes
5. Clique em "Buscar débitos"
6. **Resultado esperado**: Fluxo normal (consulta API ou prossegue para débitos)

### Teste 4: Timeout da API (5 segundos)
1. Acesse `index.html`
2. Digite `ABC1234`
3. Marque os dois checkboxes
4. Clique em "Buscar débitos"
5. Aguarde mais de 5 segundos
6. **Resultado esperado**: Após 5 segundos, o sistema prossegue automaticamente para `debitos.html?placa=ABC1234` sem exibir modal

### Teste 5: Botão "Não é meu veículo" (se API responder)
1. Complete os testes anteriores até o modal aparecer
2. Clique em "Não é meu veículo"
3. **Resultado esperado**:
   - Modal fecha
   - Campo de placa é limpo
   - Foco retorna para o campo de placa
   - Usuário pode digitar nova placa

## 🔧 Detalhes Técnicos

### Validação de Placa
```javascript
// Formato válido:
// - ABC1234 (padrão)
// - ABC1D34 (Mercosul)
// - Primeiros 3 caracteres: APENAS LETRAS (A-Z)
// - Últimos 4 caracteres: NÚMEROS ou LETRA no 4º dígito
```

### Fluxo de Execução
```
1. Usuário digita placa
2. Máscara formata automaticamente
3. Usuário marca checkboxes
4. Botão "Buscar débitos" é habilitado
5. Usuário clica no botão
6. Sistema valida formato da placa
7. Se inválido: Exibe alerta e retorna
8. Se válido: Chama API com timeout de 5s
9. Se sucesso: Exibe modal com dados
10. Se erro/timeout: Prossegue para debitos.html
```

### Estilos CSS Adicionados
- `.vehicle-modal-overlay`: Overlay do modal
- `.vehicle-modal-content`: Conteúdo do modal
- `.vehicle-info`: Container de informações do veículo
- `.vehicle-modal-btn`: Botões de ação
- Animações suaves com `slideIn`

## 📁 Arquivos Modificados

### `index.html`
- Adicionado `onsubmit="handleSubmit(event)"` ao formulário
- Aumentado `maxlength` de 7 para 8 (para suportar máscara com hífen)
- Adicionado bloco `<style>` com estilos do modal
- Adicionadas funções JavaScript:
  - `aplicarMascaraPlaca()`: Formata a entrada
  - `validarFormatoPlaca()`: Valida o formato
  - `handleSubmit()`: Processa o envio do formulário
  - `consultarPlaca()`: Chama a API
  - `exibirModalVeiculo()`: Exibe o modal de confirmação
  - `prosseguirParaDebitos()`: Navega para a página de débitos

## 🚀 Deploy

O código foi testado e está pronto para produção. Commit realizado:
- **Hash**: `ea2bcbf`
- **Branch**: `main`
- **Repositório**: `https://github.com/brunohf-del/privuqwuqwu`

## ⚠️ Considerações Importantes

1. **Segurança**: A API é chamada do lado do cliente (frontend). Nenhuma chave de API é exposta.
2. **Compatibilidade**: Mantém compatibilidade com código existente (jQuery, Bootstrap, SweetAlert2).
3. **Performance**: Timeout de 5 segundos garante que o fluxo nunca seja bloqueado.
4. **UX**: Mensagens claras e feedback visual em cada etapa.

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- Endpoint da API: `https://placa-proxy-worker.meu-proxy-placa.workers.dev/?placa=ABC1234`
- Documentação do projeto: `README.md`
- Issues do repositório: `https://github.com/brunohf-del/privuqwuqwu/issues`
