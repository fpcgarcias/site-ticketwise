# 🚀 Scripts de Migração Automática - Site Ticket Wise

## 📋 **Comandos Disponíveis**

### **`npm run dev`** ⭐
- **Executa migração automática** + inicia servidor de desenvolvimento
- **Recomendado para uso diário**
- Verifica se as tabelas existem antes de migrar
- Inicia o Vite automaticamente após migração

### **`npm run migrate`**
- **Executa apenas a migração** do banco de dados
- Útil para aplicar mudanças no schema
- Não inicia o servidor

### **`npm run dev:vite`**
- **Inicia apenas o Vite** (sem migração)
- Útil quando o banco já está configurado

## 🔧 **Como Funciona**

### **1. Migração Automática**
```bash
npm run dev
```

**O que acontece:**
1. ✅ Carrega variáveis do `.env`
2. 🔗 Conecta no Neon Database
3. 📊 Verifica se tabelas existem
4. 🚀 Executa migração (se necessário)
5. 🌐 Inicia servidor Vite

### **2. Migração Manual**
```bash
npm run migrate
```

**Executa apenas:**
- Criação de tabelas
- Views e índices
- Enums e triggers

## 📁 **Arquivos Criados**

### **`scripts/migrate.js`**
- Script principal de migração
- Lê o arquivo `neon-migration.sql`
- Conecta no Neon via `DATABASE_URL`
- Verifica se migração já foi executada

### **`scripts/dev-setup.js`**
- Orquestrador do desenvolvimento
- Executa migração + inicia Vite
- Captura Ctrl+C graciosamente

## 🛠️ **Configuração**

### **Variáveis de Ambiente (.env)**
```env
DATABASE_URL=postgresql://neondb_owner:npg_NWQec4sRBqP2@ep-divine-water-ac9ebz7y-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### **Dependências Adicionadas**
- `dotenv` - Carregamento de variáveis de ambiente
- `pg` - Cliente PostgreSQL (já existia)

## 🎯 **Vantagens**

✅ **Migração automática** no `npm run dev`  
✅ **Idempotente** - pode executar múltiplas vezes  
✅ **Verificação inteligente** - só migra se necessário  
✅ **Logs detalhados** - feedback visual claro  
✅ **Tratamento de erros** - não quebra se tabelas existem  

## 🚨 **Troubleshooting**

### **Erro: "DATABASE_URL não encontrada"**
- Verifique se o arquivo `.env` existe
- Confirme se `DATABASE_URL` está definida

### **Erro de conexão SSL**
- A conexão Neon já está configurada com SSL
- Não precisa alterar nada

### **Tabelas já existem**
- Normal! O script detecta e continua
- Não é um erro crítico

---

## 🎉 **Próximos Passos**

1. **Testar migração**: `npm run dev`
2. **Criar API backend** para substituir Edge Functions
3. **Implementar autenticação JWT**
4. **Atualizar frontend** para nova API

---

**Agora você pode usar `npm run dev` normalmente e a migração será executada automaticamente! 🚀**