# Integração com Brevo (Sendinblue) para Formulário de Contato

Este documento explica como configurar e usar a integração com a API da Brevo para o formulário de contato do site Ticket Wise.

## 📧 O que a integração faz

A integração com Brevo permite:
- Envio automático de emails quando alguém preenche o formulário de contato
- Email de notificação para a equipe Ticket Wise
- Email de confirmação automático para o cliente
- Templates HTML profissionais com design responsivo

## 🔑 Configuração Necessária

### 1. Criar Conta na Brevo
1. Acesse [brevo.com](https://www.brevo.com)
2. Crie uma conta gratuita ou faça login
3. Vá em "SMTP & API" > "API Keys"
4. Crie uma nova API Key

### 2. Configurar Variável de Ambiente
No painel do Supabase:
1. Vá em "Settings" > "Edge Functions"
2. Adicione a variável de ambiente:
   ```
   BREVO_API_KEY=xkeysib-your-api-key-here
   ```

### 3. Verificar Domínio (Recomendado)
Para melhor entregabilidade:
1. No painel Brevo, vá em "Senders & IP"
2. Adicione e verifique o domínio `ticketwise.com.br`
3. Configure os registros DNS conforme solicitado

## 📋 Funcionalidades da Integração

### Email para a Empresa (Notificação Interna)
- **Para:** contato@ticketwise.com.br
- **Assunto:** [CONTATO] Motivo - Nome do Cliente
- **Conteúdo:**
  - Dados completos do formulário
  - Design profissional com branding Ticket Wise
  - Indicação de prazo de resposta (24h úteis)

### Email de Confirmação para o Cliente
- **Para:** Email fornecido pelo cliente
- **Assunto:** Recebemos seu contato - Ticket Wise
- **Conteúdo:**
  - Confirmação personalizada com nome do cliente
  - Próximos passos claramente explicados
  - Informações de contato direto
  - Link para conhecer mais sobre a Ticket Wise

## 🛠️ Validações Implementadas

### Campos Obrigatórios
- Nome completo
- Email válido
- Mensagem (máximo 2000 caracteres)
- Motivo do contato

### Segurança
- Validação de formato de email
- Limite de caracteres na mensagem
- Headers CORS configurados
- Sanitização de dados

## 📊 Motivos de Contato Disponíveis

1. **Informações Gerais** (`general`)
2. **Falar com Vendas** (`sales`)
3. **Suporte Técnico** (`support`)
4. **Solicitar Demonstração** (`demo`)
5. **Parcerias** (`partnership`)

## 🎨 Design dos Emails

### Características
- Design responsivo e profissional
- Cores da marca Ticket Wise (roxo/purple)
- Estrutura clara e organizada
- Links funcionais (email, telefone)
- Compatível com principais clientes de email

### Versões
- **HTML:** Design completo com estilos inline
- **Texto:** Versão alternativa para clientes que não suportam HTML

## 🔍 Monitoramento e Logs

### Logs no Supabase
A função serverless registra:
- ✅ Emails enviados com sucesso
- ❌ Erros de envio
- 📧 Dados básicos do contato (sem dados sensíveis)

### Verificação no Brevo
No painel Brevo você pode acompanhar:
- Taxa de entrega
- Emails bloqueados/rejeitados
- Estatísticas de abertura (se habilitado)

## 🚨 Tratamento de Erros

### Erro de API Key
```
BREVO_API_KEY not configured
```
**Solução:** Configurar a variável de ambiente no Supabase

### Erro de Envio
```
Failed to send email: 401 Unauthorized
```
**Soluções:**
- Verificar se a API key está correta
- Verificar se a API key tem permissões de envio
- Verificar se a conta Brevo está ativa

### Email Inválido
```
Email inválido
```
**Solução:** Validação automática no frontend

## 📞 Contatos de Fallback

Em caso de problemas com o formulário, os usuários são direcionados para:
- **Email:** contato@ticketwise.com.br
- **Telefone:** (21) 2042-2588
- **Horário:** Segunda a Sexta, 9h às 18h

## 🔄 Estados do Formulário

1. **Idle:** Formulário pronto para preenchimento
2. **Sending:** Enviando dados (botão desabilitado, spinner)
3. **Success:** Mensagem enviada com sucesso
4. **Error:** Erro no envio com opções de contato direto

## 📈 Melhorias Futuras

### Possíveis Implementações
- [ ] Integração com CRM
- [ ] Auto-resposta personalizada por motivo
- [ ] Webhook para notificações no Slack/Teams
- [ ] Analytics de conversão
- [ ] Sistema de tickets automático

### Configurações Avançadas Brevo
- [ ] Templates personalizados no painel Brevo
- [ ] Segmentação de contatos
- [ ] Campanhas de follow-up
- [ ] A/B testing de emails

---

## ⚡ Como Testar

1. Acesse o site em `/contact`
2. Preencha o formulário com dados reais
3. Envie a mensagem
4. Verifique se recebeu o email de confirmação
5. Verifique se a equipe recebeu a notificação

**Nota:** Durante testes, use emails reais para validar a entrega completa. 