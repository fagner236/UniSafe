# Debug da Rota de Administração

## Problema Identificado
Os dados não estão aparecendo na página de Administração do Sistema.

## Implementações Realizadas

### 1. Backend
- ✅ **Rota criada**: `backend/src/routes/admin.ts`
- ✅ **Middleware de segurança**: `requireSystemOwner`
- ✅ **Rota registrada**: `backend/src/index.ts`
- ✅ **Logs de debug**: Adicionados em todas as etapas

### 2. Frontend
- ✅ **Estado implementado**: Para estatísticas do sistema
- ✅ **API configurada**: Chamada para `/api/admin/stats`
- ✅ **Tratamento de erro**: Logs detalhados de debug

## Passos para Debug

### 1. Verificar se o servidor está rodando
```bash
cd backend
npm run dev
```

### 2. Verificar se as rotas estão registradas
- Acessar: `http://localhost:3000/api/health`
- Deve retornar: `{"status":"OK"}`

### 3. Testar rota de admin (sem autenticação)
```bash
curl http://localhost:3000/api/admin/test
```
- Deve retornar erro 401 (não autenticado)

### 4. Verificar logs do servidor
- Procurar por: `🔐 === MIDDLEWARE requireSystemOwner ===`
- Procurar por: `🔍 === ROTA /api/admin/stats CHAMADA ===`

### 5. Verificar no navegador
- Abrir DevTools (F12)
- Ir para aba Console
- Acessar página de Admin
- Verificar logs de erro

## Possíveis Problemas

### 1. **Usuário não autenticado**
- Verificar se o token está sendo enviado
- Verificar se o usuário está logado

### 2. **Usuário não é admin**
- Verificar perfil do usuário no banco
- Deve ser: `perfil = 'admin'`

### 3. **Usuário não é da empresa dona**
- Verificar CNPJ da empresa: `41.115.030/0001-20`
- Verificar se a empresa está associada ao usuário

### 4. **Problema na rota de profile**
- Verificar se `/api/auth/profile` retorna dados da empresa
- Verificar estrutura dos dados retornados

## Estrutura Esperada dos Dados

### Usuário no req.user:
```json
{
  "id_usuario": "...",
  "nome": "...",
  "email": "...",
  "perfil": "admin",
  "empresa": {
    "nome_fantasia": "Via Eletrônica Ltda.",
    "razao_social": "Via Eletrônica Ltda.",
    "cnpj": "41.115.030/0001-20"
  }
}
```

## Comandos de Teste

### 1. Verificar usuário no banco:
```sql
SELECT u.*, c.cnpj, c.nome_fantasia 
FROM usuarios u 
LEFT JOIN empresas c ON u.id_empresa = c.id_empresa 
WHERE u.email = 'seu-email@exemplo.com';
```

### 2. Verificar empresa no banco:
```sql
SELECT * FROM empresas WHERE cnpj = '41.115.030/0001-20';
```

### 3. Verificar perfil do usuário:
```sql
SELECT perfil FROM usuarios WHERE email = 'seu-email@exemplo.com';
```

## Próximos Passos

1. **Executar testes** acima
2. **Verificar logs** do servidor
3. **Verificar console** do navegador
4. **Identificar ponto exato** do problema
5. **Corrigir validação** se necessário

## Problema Identificado ✅

**Token de acesso não está sendo enviado** na requisição para `/api/admin/test`

## Soluções Implementadas

### 1. **Debug Aprimorado**
- ✅ Verificação do token no contexto de autenticação
- ✅ Teste com fetch direto vs axios
- ✅ Logs detalhados de usuário e empresa
- ✅ Verificação do estado de autenticação

### 2. **Verificações Adicionadas**
- ✅ Token disponível no contexto
- ✅ Usuário logado e autenticado
- ✅ Informações da empresa associada
- ✅ Comparação entre localStorage e contexto

## Próximos Passos

1. **Testar página de Admin** com logs aprimorados
2. **Verificar console do navegador** para logs de debug
3. **Identificar se o problema é:**
   - Token não está sendo armazenado
   - Token não está sendo enviado
   - Problema no interceptor do axios
   - Problema no contexto de autenticação

## Status
🔧 **Problema identificado** - Token não sendo enviado
