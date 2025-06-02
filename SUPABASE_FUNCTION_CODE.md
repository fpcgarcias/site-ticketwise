# Código da Função para Supabase - Formulário de Contato

## 📋 Passos para Criar a Função no Supabase

### 1. Acesse o Painel do Supabase
- Vá para [supabase.com](https://supabase.com) e faça login
- Selecione seu projeto
- No menu lateral, clique em "Edge Functions"

### 2. Criar Nova Função
- Clique em "Create a new function"
- Nome da função: `send-contact-form`
- Copie e cole o código abaixo:

---

## 💻 Código da Função

```typescript
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

// Helper function to create responses with CORS headers
function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  if (status === 204) {
    return new Response(null, { status, headers });
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
}

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  reason: string;
}

function getReasonText(reason: string): string {
  const reasons = {
    'general': 'Informações Gerais',
    'sales': 'Falar com Vendas',
    'support': 'Suporte Técnico',
    'demo': 'Solicitar Demonstração',
    'partnership': 'Parcerias'
  };
  return reasons[reason as keyof typeof reasons] || 'Outros';
}

async function sendEmailViaBrevo(data: ContactFormData) {
  const brevoApiKey = Deno.env.get('BREVO_API_KEY');
  
  if (!brevoApiKey) {
    throw new Error('BREVO_API_KEY not configured');
  }

  // Email para a empresa (notificação interna)
  const companyEmailData = {
    sender: {
      name: "Site Ticket Wise",
      email: "noreply@ticketwise.com.br"
    },
    to: [
      {
        email: "contato@ticketwise.com.br",
        name: "Equipe Ticket Wise"
      }
    ],
    subject: `[CONTATO] ${getReasonText(data.reason)} - ${data.name}`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(90deg, #7c3aed, #a855f7); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Novo Contato - Ticket Wise</h1>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
          <h2 style="color: #1e293b; margin-top: 0;">Detalhes do Contato:</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #374151;">Nome:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #374151;">${data.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #374151;">Email:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #374151;">
                <a href="mailto:${data.email}" style="color: #7c3aed; text-decoration: none;">${data.email}</a>
              </td>
            </tr>
            ${data.phone ? `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #374151;">Telefone:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #374151;">
                <a href="tel:${data.phone}" style="color: #7c3aed; text-decoration: none;">${data.phone}</a>
              </td>
            </tr>
            ` : ''}
            ${data.company ? `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #374151;">Empresa:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #374151;">${data.company}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #374151;">Motivo:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #374151;">
                <span style="background: #7c3aed; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                  ${getReasonText(data.reason)}
                </span>
              </td>
            </tr>
          </table>
          
          <h3 style="color: #1e293b; margin-bottom: 10px; margin-top: 30px;">Mensagem:</h3>
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #7c3aed; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="margin: 0; color: #374151; line-height: 1.6;">${data.message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <div style="margin-top: 30px; padding: 15px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; font-size: 14px; color: #92400e;">
              <strong>⏰ Responder em até 24 horas úteis</strong><br>
              Este contato foi enviado através do site oficial da Ticket Wise.
            </p>
          </div>
        </div>
      </div>
    `,
    textContent: `
Novo contato recebido pelo site Ticket Wise:

Nome: ${data.name}
Email: ${data.email}
${data.phone ? `Telefone: ${data.phone}` : ''}
${data.company ? `Empresa: ${data.company}` : ''}
Motivo: ${getReasonText(data.reason)}

Mensagem:
${data.message}

Responder em até 24 horas úteis.
    `
  };

  // Email de confirmação para o cliente
  const customerEmailData = {
    sender: {
      name: "Ticket Wise",
      email: "noreply@ticketwise.com.br"
    },
    to: [
      {
        email: data.email,
        name: data.name
      }
    ],
    subject: "Recebemos seu contato - Ticket Wise",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(90deg, #7c3aed, #a855f7); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Obrigado pelo seu contato!</h1>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Olá <strong>${data.name}</strong>,</p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Recebemos sua mensagem sobre <strong>"${getReasonText(data.reason)}"</strong> e agradecemos pelo interesse na Ticket Wise.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h3 style="color: #065f46; margin-top: 0; margin-bottom: 10px;">✅ Próximos passos:</h3>
            <ul style="color: #374151; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Nossa equipe analisará sua solicitação</li>
              <li style="margin-bottom: 8px;">Retornaremos em até <strong>24 horas úteis</strong></li>
              <li style="margin-bottom: 8px;">Entraremos em contato pelo email: <strong>${data.email}</strong></li>
            </ul>
          </div>
          
          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0; margin-bottom: 10px;">📞 Precisa de ajuda imediata?</h3>
            <p style="color: #374151; margin: 0;">
              <strong>Telefone:</strong> (21) 2042-2588<br>
              <strong>Horário:</strong> Segunda a Sexta, 9h às 18h<br>
              <strong>Email:</strong> contato@ticketwise.com.br
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://ticketwise.com.br" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Conheça mais sobre a Ticket Wise
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px; text-align: center;">
            Atenciosamente,<br>
            <strong>Equipe Ticket Wise</strong><br>
            Sistema de Gestão de Chamados
          </p>
        </div>
      </div>
    `,
    textContent: `
Olá ${data.name},

Recebemos sua mensagem sobre "${getReasonText(data.reason)}" e agradecemos pelo interesse na Ticket Wise.

✅ Próximos passos:
- Nossa equipe analisará sua solicitação
- Retornaremos em até 24 horas úteis
- Entraremos em contato pelo email: ${data.email}

📞 Precisa de ajuda imediata?
Telefone: (21) 2042-2588
Horário: Segunda a Sexta, 9h às 18h
Email: contato@ticketwise.com.br

Atenciosamente,
Equipe Ticket Wise
Sistema de Gestão de Chamados

Acesse: https://ticketwise.com.br
    `
  };

  // Enviar ambos os emails
  const promises = [
    // Email para a empresa
    fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(companyEmailData)
    }),
    // Email de confirmação para o cliente
    fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(customerEmailData)
    })
  ];

  const responses = await Promise.all(promises);
  
  // Verificar se ambos foram enviados com sucesso
  for (let i = 0; i < responses.length; i++) {
    const response = responses[i];
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to send email ${i + 1}:`, errorText);
      throw new Error(`Failed to send email: ${response.status} ${response.statusText}`);
    }
  }

  return { success: true, emailsSent: responses.length };
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return corsResponse({}, 204);
    }

    if (req.method !== 'POST') {
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    const data: ContactFormData = await req.json();

    // Validações básicas
    if (!data.name || !data.email || !data.message) {
      return corsResponse({ 
        error: 'Campos obrigatórios: name, email, message' 
      }, 400);
    }

    // Validação de email básica
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return corsResponse({ 
        error: 'Email inválido' 
      }, 400);
    }

    // Validação de tamanho da mensagem
    if (data.message.length > 2000) {
      return corsResponse({ 
        error: 'Mensagem muito longa (máximo 2000 caracteres)' 
      }, 400);
    }

    console.log('📧 Enviando email de contato via Brevo:', {
      name: data.name,
      email: data.email,
      reason: data.reason,
      company: data.company || 'N/A'
    });

    // Enviar emails via Brevo
    const result = await sendEmailViaBrevo(data);

    console.log('✅ Emails enviados com sucesso:', result);

    return corsResponse({
      success: true,
      message: 'Contato enviado com sucesso! Responderemos em até 24 horas.',
      emailsSent: result.emailsSent
    });

  } catch (error: any) {
    console.error('❌ Erro ao processar contato:', error);
    
    return corsResponse({
      success: false,
      error: 'Erro interno do servidor. Tente novamente mais tarde.',
      details: error.message
    }, 500);
  }
});
```

---

## 🔧 Configurar Variável de Ambiente

### 3. Adicionar a API Key da Brevo
- Após criar a função, vá em "Settings" no menu da função
- Na seção "Environment Variables", adicione:
  - **Key:** `BREVO_API_KEY`
  - **Value:** sua chave da API Brevo (começa com `xkeysib-`)

### 4. Deploy da Função
- Clique em "Deploy function"
- Aguarde o deploy ser concluído

---

## ✅ Testando a Função

Após o deploy, a função estará disponível na URL:
```
https://[SEU-PROJETO].supabase.co/functions/v1/send-contact-form
```

Para testar, acesse o formulário de contato do seu site em `/contact` e envie uma mensagem de teste.

---

## 📝 Notas Importantes

- ✅ A função já está configurada para funcionar com o frontend atual
- ✅ Emails HTML responsivos estão incluídos
- ✅ Validações de segurança implementadas
- ✅ Tratamento de erros configurado
- ✅ CORS habilitado para o frontend

**Lembre-se:** Configure a `BREVO_API_KEY` nas variáveis de ambiente para que a função funcione corretamente! 