# 🔐 Configurações de Segurança de Senhas

## ✅ **Padrões Alinhados Entre Sistemas:**

### **Configurações Idênticas:**
```javascript
// Sistema TicketWise + Outro Sistema
const SALT_ROUNDS = 12;           // Alto nível de segurança
const MIN_PASSWORD_LENGTH = 8;    // Mínimo de 8 caracteres  
const MAX_PASSWORD_LENGTH = 128;  // Máximo de 128 caracteres
```

## 🔄 **Como o bcrypt Mantém Compatibilidade:**

### **Hash Gerado no TicketWise:**
```javascript
// Gera hash com 12 rounds
const hash = await bcrypt.hash('senhaUsuario', 12);
// Resultado: $2b$12$saltAqui...$hashFinal
//                 ↑ 
//              12 rounds!
```

### **Verificação no Outro Sistema:**
```javascript
// O hash "lembra" que foi usado 12 rounds
const hashDoBanco = '$2b$12$saltAqui...$hashFinal';

// bcrypt automaticamente usa 12 rounds para verificar
const isValid = await bcrypt.compare('senhaUsuario', hashDoBanco);
// ✅ Funciona perfeitamente!
```

## ⚡ **Diferenças de Performance:**

### **Salt Rounds vs Tempo:**
```
Rounds 10 = ~65ms   (padrão básico)
Rounds 12 = ~250ms  (recomendado 2024)
Rounds 15 = ~2.1s   (muito lento)
```

**12 rounds** é o **sweet spot** entre:
- ✅ **Segurança adequada** contra ataques
- ✅ **Performance aceitável** para login
- ✅ **Futuro-proof** por alguns anos

## 🛡️ **Validações Implementadas:**

### **Frontend (RegisterPage.tsx):**
```javascript
// Validações HTML nativas
minLength={8}
maxLength={128}
```

### **Backend (save-company-registration):**
```javascript
// Validações server-side
if (userData.password.length < 8) {
  return error('Senha deve ter pelo menos 8 caracteres');
}

if (userData.password.length > 128) {
  return error('Senha deve ter no máximo 128 caracteres');
}
```

## 🔍 **Exemplo de Hash Completo:**

```javascript
// Entrada
const senha = 'minhasenha123';

// Processo (interno do bcrypt)
const salt = generateRandomSalt();     // "N9qo8uLOickgx2ZMRZoMye"
const hash = hashWithSalt(senha, salt, 12); // 12 rounds

// Resultado final
const hashCompleto = '$2b$12$N9qo8uLOickgx2ZMRZoMye$IjpJZyqhGhKPcNsL8O7LyqGmBG2BCZl6';

// Estrutura do hash:
// $2b = versão bcrypt
// $12 = salt rounds (12)
// $N9qo...ye = salt (22 chars)
// $Ijp...Zl6 = hash final (31 chars)
```

## 🔄 **Fluxo Completo:**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  TicketWise     │    │   Banco Neon    │    │  Outro Sistema  │
│                 │    │                 │    │                 │
│ senha123        │───▶│ $2b$12$salt$hash│◀───│ senha123        │
│ bcrypt(12)      │    │                 │    │ bcrypt.compare()│
│                 │    │                 │    │                 │
│ Hash gerado     │    │ Hash armazenado │    │ Senha verificada│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## ⚠️ **Importante para Ambos os Sistemas:**

### **✅ Fazer:**
- Usar **bcrypt** (não MD5, SHA1, etc.)
- Manter **12 rounds** em ambos sistemas
- Validar **tamanho de senha** (8-128)
- Usar **bcrypt.compare()** para verificar

### **❌ Não Fazer:**
- Tentar "descriptografar" o hash
- Usar salt fixo ou personalizado
- Misturar algoritmos diferentes
- Ignorar validações de tamanho

## 📊 **Compatibilidade Garantida:**

| Aspecto | TicketWise | Outro Sistema | Status |
|---------|------------|---------------|---------|
| Salt Rounds | 12 | 12 | ✅ Igual |
| Min Length | 8 | 8 | ✅ Igual |
| Max Length | 128 | 128 | ✅ Igual |
| Algoritmo | bcrypt | bcrypt | ✅ Igual |
| Validação | Client+Server | Server | ✅ Compatível |

**Resultado:** 🎯 **100% Compatível entre sistemas!** 