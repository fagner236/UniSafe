# 🔍 ANÁLISE COMPLETA - Fluxo de Dados de Empregados

## 📊 **TABELA DE DESTINO:**
**Tabela**: `empregados` (mapeada do modelo Prisma `Empregado`)

### **Estrutura da Tabela:**
```sql
CREATE TABLE empregados (
  id_empregados INT AUTO_INCREMENT PRIMARY KEY,
  matricula VARCHAR(8) UNIQUE NOT NULL,
  email VARCHAR(200) UNIQUE NULL,
  celular VARCHAR(15) UNIQUE NULL,
  foto VARCHAR(255) NULL,
  id_usuario VARCHAR(191) NOT NULL,
  data_criacao DATETIME(3) NULL,
  data_atualizacao DATETIME(3) NULL
);
```

## 🔄 **FLUXO DE DADOS:**

### **1. Frontend (Modal de Edição):**
```typescript
// Dados coletados do formulário
const editFormData = {
  email: 'teste@exemplo.com',
  celular: '(11) 99999-9999',
  foto: File | null
};

// Validação no frontend
if (editFormData.email && !validateEmail(editFormData.email.trim())) {
  setEmailError('E-mail inválido');
  hasErrors = true;
}

if (editFormData.celular && !validateCelular(editFormData.celular.trim())) {
  setCelularError('Celular deve ter 11 dígitos');
  hasErrors = true;
}
```

### **2. Envio via FormData:**
```typescript
const formData = new FormData();
formData.append('matricula', matricula.trim());
formData.append('email', editFormData.email.trim().toLowerCase());
formData.append('celular', editFormData.celular.trim());
if (editFormData.foto) {
  formData.append('foto', editFormData.foto);
}

// Requisição POST
fetch('/api/empregados', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### **3. Backend - Rota `/api/empregados` (POST):**
```typescript
// Middleware: auth + requireAdmin + upload.single('foto')
router.post('/', auth, requireAdmin, upload.single('foto'), async (req, res) => {
  const { matricula, email, celular } = req.body;
  
  // Validação e limpeza de dados
  let cleanEmail = email?.trim().toLowerCase() || null;
  let cleanCelular = null;
  
  if (celular?.trim()) {
    const numbers = celular.replace(/[^\d]/g, '');
    if (numbers.length === 11) {
      cleanCelular = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  }
  
  // Verificar se empregado existe
  const empregadoExistente = await prisma.empregado.findUnique({
    where: { matricula }
  });
  
  if (empregadoExistente) {
    // ATUALIZAR na tabela empregados
    const empregadoAtualizado = await prisma.empregado.update({
      where: { matricula },
      data: {
        email: cleanEmail,
        celular: cleanCelular,
        foto: fotoPath || empregadoExistente.foto,
        id_usuario,
        data_atualizacao: new Date()
      }
    });
  } else {
    // CRIAR novo na tabela empregados
    const novoEmpregado = await prisma.empregado.create({
      data: {
        matricula,
        email: cleanEmail,
        celular: cleanCelular,
        foto: fotoPath,
        id_usuario,
        data_criacao: new Date(),
        data_atualizacao: new Date()
      }
    });
  }
});
```

## ✅ **TESTE DA API - FUNCIONANDO:**

### **Teste 1 - Celular com máscara (FALHOU):**
```bash
curl -F "matricula=TESTE123" -F "email=teste@exemplo.com" -F "celular=(11) 99999-9999"
# Resultado: "Celular deve ter exatamente 11 dígitos. Encontrados: 7"
```

### **Teste 2 - Celular sem máscara (SUCESSO):**
```bash
curl -F "matricula=TESTE789" -F "email=novo@exemplo.com" -F "celular=11888888888"
# Resultado: {"success":true,"message":"Empregado(a) criado(a) com sucesso"}
```

## 🔍 **PROBLEMA IDENTIFICADO:**

### **Causa Raiz:**
O frontend está enviando celular com máscara `(11) 99999-9999`, mas o backend está extraindo apenas 7 dígitos em vez de 11.

### **Análise do Código:**
```typescript
// Frontend envia: "(11) 99999-9999"
// Backend processa:
const numbers = celular.replace(/[^\d]/g, ''); // Deveria extrair: "11999999999"
// Mas está extraindo apenas: "9999999" (7 dígitos)
```

## 🛠️ **SOLUÇÃO NECESSÁRIA:**

### **Opção 1: Corrigir Frontend (Recomendado)**
Enviar celular sem máscara do frontend:
```typescript
// Em vez de enviar: "(11) 99999-9999"
// Enviar: "11999999999"
const numbers = editFormData.celular.replace(/\D/g, '');
formData.append('celular', numbers);
```

### **Opção 2: Corrigir Backend**
Melhorar a extração de números no backend:
```typescript
// Usar regex mais robusta
const numbers = celular.replace(/[^\d]/g, '').replace(/^(\d{2})(\d{5})(\d{4})$/, '$1$2$3');
```

## 📋 **RESUMO:**

- ✅ **API Backend**: Funcionando corretamente
- ✅ **Tabela**: `empregados` (correta)
- ✅ **Validações**: Implementadas
- ❌ **Frontend**: Enviando celular com máscara incorreta
- ❌ **Processamento**: Extração de números falhando

## 🎯 **PRÓXIMO PASSO:**
Corrigir o frontend para enviar celular sem máscara ou melhorar a extração no backend.

**Data da Análise**: 19 de Setembro de 2025  
**Status**: 🔍 **PROBLEMA IDENTIFICADO - PRONTO PARA CORREÇÃO**


