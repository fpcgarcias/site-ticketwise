const express = require('express');
const nodemailer = require('nodemailer');

const router = express.Router();

// Configurar transporter de email (usando variáveis de ambiente)
const createEmailTransporter = () => {
  // Suporte para diferentes provedores de email
  if (process.env.EMAIL_PROVIDER === 'gmail') {
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  } else if (process.env.EMAIL_PROVIDER === 'brevo') {
    return nodemailer.createTransporter({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_EMAIL,
        pass: process.env.BREVO_PASSWORD
      }
    });
  } else {
    // SMTP genérico
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }
};

// POST /api/contact/send - Enviar formulário de contato
router.post('/send', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      subject,
      message,
      interest_type = 'general'
    } = req.body;

    // Validações básicas
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: name, email, message'
      });
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de email inválido'
      });
    }

    const transporter = createEmailTransporter();

    // Template do email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Novo Contato - Site Ticket Wise</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Informações do Contato</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p><strong>Nome:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Telefone:</strong> ${phone}</p>` : ''}
            ${company ? `<p><strong>Empresa:</strong> ${company}</p>` : ''}
            ${subject ? `<p><strong>Assunto:</strong> ${subject}</p>` : ''}
            <p><strong>Tipo de Interesse:</strong> ${interest_type}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px;">
            <h3 style="color: #333; margin-top: 0;">Mensagem:</h3>
            <p style="line-height: 1.6; color: #555;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px;">
            <p style="margin: 0; color: #1976d2; font-size: 14px;">
              <strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #ccc; margin: 0; font-size: 14px;">
            Site Ticket Wise - Sistema de Gestão de Tickets
          </p>
        </div>
      </div>
    `;

    // Email para a empresa
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.CONTACT_EMAIL || 'contato@ticketwise.com.br',
      subject: `[Site Ticket Wise] ${subject || 'Novo Contato'} - ${name}`,
      html: emailHtml,
      replyTo: email
    };

    await transporter.sendMail(mailOptions);

    // Email de confirmação para o cliente (opcional)
    if (process.env.SEND_CONFIRMATION_EMAIL === 'true') {
      const confirmationHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Obrigado pelo seu contato!</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <p>Olá <strong>${name}</strong>,</p>
            
            <p>Recebemos sua mensagem e entraremos em contato em breve.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Resumo da sua mensagem:</h3>
              <p><strong>Assunto:</strong> ${subject || 'Contato geral'}</p>
              <p><strong>Mensagem:</strong> ${message}</p>
            </div>
            
            <p>Nossa equipe responderá em até 24 horas úteis.</p>
            
            <p>Atenciosamente,<br>
            <strong>Equipe Site Ticket Wise</strong></p>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #ccc; margin: 0; font-size: 14px;">
              Site Ticket Wise - Sistema de Gestão de Tickets
            </p>
          </div>
        </div>
      `;

      const confirmationOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: 'Confirmação de Contato - Site Ticket Wise',
        html: confirmationHtml
      };

      await transporter.sendMail(confirmationOptions);
    }

    console.log(`Email de contato enviado: ${name} (${email})`);

    res.json({
      success: true,
      message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.'
    });

  } catch (error) {
    console.error('Erro ao enviar email de contato:', error);
    
    // Diferentes tipos de erro
    if (error.code === 'EAUTH') {
      return res.status(500).json({
        success: false,
        error: 'Erro de autenticação do email. Verifique as configurações.'
      });
    }
    
    if (error.code === 'ECONNECTION') {
      return res.status(500).json({
        success: false,
        error: 'Erro de conexão com servidor de email.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erro ao enviar mensagem. Tente novamente mais tarde.'
    });
  }
});

// POST /api/contact/newsletter - Inscrever na newsletter
router.post('/newsletter', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email é obrigatório'
      });
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de email inválido'
      });
    }

    const transporter = createEmailTransporter();

    // Email de notificação para a empresa
    const notificationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Nova Inscrição Newsletter</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <p><strong>Email:</strong> ${email}</p>
          ${name ? `<p><strong>Nome:</strong> ${name}</p>` : ''}
          <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.CONTACT_EMAIL || 'contato@ticketwise.com.br',
      subject: '[Site Ticket Wise] Nova inscrição na newsletter',
      html: notificationHtml
    });

    // Email de boas-vindas (opcional)
    if (process.env.SEND_WELCOME_EMAIL === 'true') {
      const welcomeHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Bem-vindo à Newsletter!</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <p>Olá${name ? ` ${name}` : ''}!</p>
            
            <p>Obrigado por se inscrever na nossa newsletter. Você receberá:</p>
            
            <ul>
              <li>Novidades sobre o Site Ticket Wise</li>
              <li>Dicas de gestão de tickets</li>
              <li>Ofertas exclusivas</li>
              <li>Atualizações do produto</li>
            </ul>
            
            <p>Fique atento ao seu email!</p>
            
            <p>Atenciosamente,<br>
            <strong>Equipe Site Ticket Wise</strong></p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: 'Bem-vindo à Newsletter - Site Ticket Wise',
        html: welcomeHtml
      });
    }

    console.log(`Nova inscrição newsletter: ${email}`);

    res.json({
      success: true,
      message: 'Inscrição realizada com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao processar inscrição newsletter:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao processar inscrição. Tente novamente mais tarde.'
    });
  }
});

module.exports = router;