# Verificação de CNPJ - UniSafe

## 📋 Resumo da Funcionalidade

A funcionalidade de verificação de CNPJ foi implementada para **prevenir duplicações** no cadastro de empresas e **melhorar a experiência do usuário** durante o processo de registro.

## ✨ Funcionalidades Implementadas

### 1. **Verificação Automática de CNPJ**
- ✅ **Verificação em tempo real** quando o CNPJ é preenchido completamente
- ✅ **Validação de formato** antes de enviar para a API
- ✅ **Feedback visual imediato** sobre o status do CNPJ

### 2. **Estados de Verificação**
- 🔍 **Verificando**: Spinner animado e campo desabilitado
- ✅ **CNPJ Existente**: Borda verde, dados preenchidos automaticamente
- 🔵 **CNPJ Disponível**: Borda azul, permite cadastro
- ❌ **Erro**: Mensagem de erro clara e específica

### 3. **Fluxo Inteligente**
- **Se CNPJ existe**: Preenche formulário e redireciona para cadastro de usuário
- **Se CNPJ não existe**: Permite prosseguir com o cadastro normal
- **Botão "Novo Cadastro"**: Para limpar formulário e tentar outro CNPJ

## 🔧 Implementação Técnica

### **Backend (API)**
```typescript
// Rota: GET /api/companies/check-cnpj/:cnpj
router.get('/check-cnpj/:cnpj', async (req, res) => {
  // Verifica se CNPJ existe na base de dados
  // Retorna dados da empresa ou confirma disponibilidade
});
```

### **Frontend (React)**
```typescript
// Hook de verificação automática
useEffect(() => {
  if (companyData.cnpj.length === 18) {
    const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
    if (cnpjRegex.test(companyData.cnpj)) {
      checkCNPJ(companyData.cnpj);
    }
  }
}, [companyData.cnpj]);
```

### **Configuração do Axios**
```typescript
// Configuração personalizada com interceptors
const api = axios.create({
  baseURL: config.apiUrl,
  timeout: config.requestTimeout,
  headers: { 'Content-Type': 'application/json' }
});
```

## 🎨 Interface do Usuário

### **Campo CNPJ**
- **Formato automático**: XX.XXX.XXX/XXXX-XX
- **Validação visual**: Cores diferentes para cada estado
- **Ícones informativos**: Check, Search, Loading spinner
- **Máximo 18 caracteres**: Com formatação automática

### **Mensagens de Status**
- 🟡 **Verificando**: "Verificando CNPJ..."
- 🟢 **Existente**: "CNPJ já cadastrado! Preenchendo dados da empresa..."
- 🔵 **Disponível**: "CNPJ disponível para cadastro"
- ❌ **Erro**: Mensagens específicas por tipo de erro

### **Estados dos Campos**
- **CNPJ existente**: Todos os campos preenchidos e desabilitados
- **CNPJ disponível**: Campos vazios e habilitados para preenchimento
- **Verificando**: Campo CNPJ desabilitado com spinner

## 🚀 Como Usar

### **1. Acessar Tela de Cadastro**
- Navegar para `/register`
- Selecionar aba "Empresa"

### **2. Preencher CNPJ**
- Digitar CNPJ no formato XX.XXX.XXX/XXXX-XX
- Sistema verifica automaticamente ao completar 18 caracteres

### **3. Ver Resultado**
- **CNPJ existente**: Dados preenchidos automaticamente
- **CNPJ disponível**: Continuar preenchendo formulário

### **4. Ações Disponíveis**
- **Continuar**: Ir para aba de usuário (CNPJ existente)
- **Novo Cadastro**: Limpar formulário para outro CNPJ
- **Cadastrar**: Enviar dados da empresa (CNPJ disponível)

## 🔒 Validações e Segurança

### **Validações Frontend**
- ✅ Formato CNPJ (regex)
- ✅ Comprimento exato (18 caracteres)
- ✅ Campos obrigatórios marcados
- ✅ Prevenção de duplo envio

### **Validações Backend**
- ✅ Verificação na base de dados
- ✅ Sanitização de entrada
- ✅ Rate limiting
- ✅ Headers de segurança

### **Prevenção de Erros**
- 🚫 CNPJ duplicado
- 🚫 Formato inválido
- 🚫 Campos vazios
- 🚫 Requisições simultâneas

## 📊 Benefícios

### **Para o Usuário**
- ⚡ **Verificação instantânea** sem ação manual
- 🎯 **Prevenção de erros** de duplicação
- 💾 **Economia de tempo** com preenchimento automático
- 🔄 **Fluxo intuitivo** entre abas

### **Para o Sistema**
- 🛡️ **Integridade dos dados** sem duplicatas
- 📈 **Melhor experiência** do usuário
- 🔍 **Auditoria clara** de verificações
- 🚀 **Performance otimizada** com validações

### **Para o Negócio**
- 💼 **Profissionalismo** na interface
- 📋 **Redução de suporte** técnico
- 🎯 **Foco no usuário** em vez de validações
- 📊 **Dados consistentes** na base

## 🧪 Testes

### **Cenários de Teste**
1. **CNPJ válido não existente**: Deve permitir cadastro
2. **CNPJ válido existente**: Deve preencher dados e redirecionar
3. **CNPJ inválido**: Deve mostrar erro de formato
4. **CNPJ incompleto**: Deve aguardar preenchimento
5. **Erro de API**: Deve mostrar mensagem de erro específica

### **Componente de Teste**
```typescript
// Componente CNPJChecker para testes isolados
<CNPJChecker onCNPJResult={(exists, data) => {
  console.log('CNPJ existe:', exists, 'Dados:', data);
}} />
```

## 🔧 Configuração

### **Variáveis de Ambiente**
```bash
# Frontend (.env)
VITE_API_URL=http://localhost:3000

# Backend
PORT=3000
NODE_ENV=development
```

### **Dependências**
```json
// Frontend
"axios": "^1.x.x"
"lucide-react": "^x.x.x"

// Backend
"@prisma/client": "^x.x.x"
"express": "^4.x.x"
```

## 📝 Logs e Debug

### **Console do Frontend**
- 🚀 Requisições sendo enviadas
- ✅ Respostas recebidas
- ❌ Erros detalhados
- 🔍 Dados de verificação

### **Console do Backend**
- 📝 Registro de rotas
- 🔍 Parâmetros recebidos
- 📊 Resultados de busca
- ❌ Erros de processamento

## 🚨 Solução de Problemas

### **CNPJ não verifica**
1. Verificar se backend está rodando
2. Confirmar rota `/api/companies/check-cnpj/:cnpj`
3. Verificar logs do console
4. Testar com componente CNPJChecker

### **Erro de CORS**
1. Verificar configuração CORS no backend
2. Confirmar URL base no frontend
3. Verificar variáveis de ambiente

### **Dados não preenchem**
1. Verificar estrutura da resposta da API
2. Confirmar mapeamento dos campos
3. Verificar logs de erro

## 🔮 Próximas Melhorias

- [ ] **Cache de verificações** para CNPJs recentes
- [ ] **Histórico de verificações** por usuário
- [ ] **Validação de CNPJ real** com Receita Federal
- [ ] **Notificações push** para status de verificação
- [ ] **Relatórios de uso** da funcionalidade

---

**Desenvolvido para UniSafe** - Sistema de Gestão Empresarial
