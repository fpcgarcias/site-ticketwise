# Código da Função ATUALIZADA para Supabase - Formulário de Contato

## 📧 **Roteamento Inteligente de Emails por Motivo**

Esta versão atualizada roteia os emails para diferentes departamentos baseado no motivo do contato, conforme configurado nas páginas do site.

## 📋 Passos para Atualizar a Função

### 1. Acesse sua função no Supabase
- Vá para Edge Functions → send-contact-form
- Substitua o código atual pelo código abaixo

---

## 💻 Código da Função ATUALIZADO

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

// Roteamento inteligente de emails por departamento
function getRecipientInfo(reason: string) {
  switch(reason) {
    case 'sales':
      return {
        email: 'contato@ticketwise.com.br',
        name: 'Equipe de Vendas',
        department: 'Vendas'
      };
    case 'support':
      return {
        email: 'suporte@ticketwise.com.br', 
        name: 'Equipe de Suporte',
        department: 'Suporte Técnico'
      };
    case 'demo':
      return {
        email: 'contato@ticketwise.com.br',
        name: 'Equipe Comercial',
        department: 'Demonstrações'
      };
    case 'partnership':
      return {
        email: 'contato@ticketwise.com.br',
        name: 'Equipe de Parcerias',
        department: 'Parcerias'
      };
    case 'general':
    default:
      return {
        email: 'contato@ticketwise.com.br',
        name: 'Equipe Ticket Wise',
        department: 'Atendimento Geral'
      };
  }
}

async function sendEmailViaBrevo(data: ContactFormData) {
  const brevoApiKey = Deno.env.get('BREVO_API_KEY');
  
  if (!brevoApiKey) {
    throw new Error('BREVO_API_KEY not configured');
  }

  const recipient = getRecipientInfo(data.reason);

  // Email para a empresa (notificação interna com roteamento inteligente)
  const companyEmailData = {
    sender: {
      name: "Site Ticket Wise",
      email: "noreply@ticketwise.com.br"
    },
    to: [
      {
        email: recipient.email,
        name: recipient.name
      }
    ],
    subject: `[${recipient.department.toUpperCase()}] ${getReasonText(data.reason)} - ${data.name}`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(90deg, #7c3aed, #a855f7); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Novo Contato - ${recipient.department}</h1>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
          <div style="background: #7c3aed; color: white; padding: 8px 16px; border-radius: 6px; display: inline-block; margin-bottom: 20px;">
            <strong>📧 Destinatário: ${recipient.department}</strong>
          </div>
          
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
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #374151;">Departamento:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #374151;">
                <strong style="color: #7c3aed;">${recipient.department}</strong>
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
              Este contato foi roteado automaticamente para ${recipient.department} baseado no motivo selecionado.
            </p>
          </div>
        </div>
      </div>
    `,
    textContent: `
Novo contato recebido pelo site Ticket Wise:

DEPARTAMENTO: ${recipient.department}
EMAIL DESTINATÁRIO: ${recipient.email}

Nome: ${data.name}
Email: ${data.email}
${data.phone ? `Telefone: ${data.phone}` : ''}
${data.company ? `Empresa: ${data.company}` : ''}
Motivo: ${getReasonText(data.reason)}

Mensagem:
${data.message}

Responder em até 24 horas úteis.
Contato roteado automaticamente para ${recipient.department}.
    `
  };

  // Email de confirmação para o cliente (personalizado por departamento)
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
              <li style="margin-bottom: 8px;">Sua mensagem foi encaminhada para nossa <strong>${recipient.department}</strong></li>
              <li style="margin-bottom: 8px;">Retornaremos em até <strong>24 horas úteis</strong></li>
              <li style="margin-bottom: 8px;">Entraremos em contato pelo email: <strong>${data.email}</strong></li>
            </ul>
          </div>
          
          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0; margin-bottom: 10px;">📞 Precisa de ajuda imediata?</h3>
            <p style="color: #374151; margin: 0;">
              <strong>Telefone:</strong> (21) 2042-2588<br>
              <strong>Horário:</strong> Segunda a Sexta, 9h às 18h<br>
              <strong>Email Geral:</strong> contato@ticketwise.com.br<br>
              <strong>Email ${recipient.department}:</strong> ${recipient.email}
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://ticketwise.com.br" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Conheça mais sobre a Ticket Wise
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px; text-align: center;">
            Atenciosamente,<br>
            <strong>${recipient.name}</strong><br>
            Sistema de Gestão de Chamados
          </p>
        </div>
      </div>
    `,
    textContent: `
Olá ${data.name},

Recebemos sua mensagem sobre "${getReasonText(data.reason)}" e agradecemos pelo interesse na Ticket Wise.

✅ Próximos passos:
- Sua mensagem foi encaminhada para nossa ${recipient.department}
- Retornaremos em até 24 horas úteis
- Entraremos em contato pelo email: ${data.email}

📞 Precisa de ajuda imediata?
Telefone: (21) 2042-2588
Horário: Segunda a Sexta, 9h às 18h
Email Geral: contato@ticketwise.com.br
Email ${recipient.department}: ${recipient.email}

Atenciosamente,
${recipient.name}
Sistema de Gestão de Chamados

Acesse: https://ticketwise.com.br
    `
  };

  // Enviar ambos os emails
  const promises = [
    // Email para a empresa (roteado por departamento)
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

  return { 
    success: true, 
    emailsSent: responses.length,
    routedTo: {
      department: recipient.department,
      email: recipient.email
    }
  };
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

    const recipient = getRecipientInfo(data.reason);

    console.log('📧 Enviando email de contato via Brevo:', {
      name: data.name,
      email: data.email,
      reason: data.reason,
      company: data.company || 'N/A',
      routedTo: `${recipient.department} (${recipient.email})`
    });

    // Enviar emails via Brevo
    const result = await sendEmailViaBrevo(data);

    console.log('✅ Emails enviados com sucesso:', result);

    return corsResponse({
      success: true,
      message: `Contato enviado com sucesso para ${result.routedTo.department}! Responderemos em até 24 horas.`,
      emailsSent: result.emailsSent,
      routedTo: result.routedTo
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

## 📊 **Roteamento de Emails por Motivo**

| Motivo | Destino | Departamento |
|--------|---------|--------------|
| **Informações Gerais** | contato@ticketwise.com.br | Atendimento Geral |
| **Falar com Vendas** | contato@ticketwise.com.br | Equipe de Vendas |
| **Suporte Técnico** | suporte@ticketwise.com.br | Equipe de Suporte |
| **Solicitar Demonstração** | contato@ticketwise.com.br | Equipe Comercial |
| **Parcerias** | contato@ticketwise.com.br | Equipe de Parcerias |

## ✨ **Novidades da Versão Atualizada**

- ✅ **Roteamento inteligente** por motivo do contato
- ✅ **Assuntos personalizados** com nome do departamento
- ✅ **Indicação visual** do departamento responsável
- ✅ **Emails de confirmação** personalizados por área
- ✅ **Logs detalhados** mostrando roteamento

## 🚀 **Para Atualizar**

1. Acesse sua função no Supabase
2. Substitua o código atual por este código atualizado
3. Deploy da função
4. Teste enviando contatos com diferentes motivos!

**Agora os emails serão roteados automaticamente para os departamentos corretos!** 🎯 