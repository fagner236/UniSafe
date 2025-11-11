# 🔍 Diagnóstico: Problema de Carregamento de Dados

**Data:** 09/11/2025  
**Problema:** Usuário "amanda.corcino@gmail.com" não consegue ver dados no Dashboard  
**Status:** 🔄 Em Investigação

---

## 📋 Melhorias Implementadas

### 1. Logs de Debug Aprimorados

Adicionei logs detalhados para diagnosticar o problema:

**No useEffect de carregamento:**
- ✅ Verifica se foi inicializado
- ✅ Verifica se `selectedBaseSindical` está definido
- ✅ Verifica se `user.base_sindical` existe
- ✅ Verifica se está carregando
- ✅ Mostra todas as condições antes de tentar carregar

**Correção importante:**
- ✅ Se `selectedBaseSindical` estiver vazio mas `user.base_sindical` existir, define automaticamente
- ✅ Melhor tratamento de condições para evitar loops infinitos

---

## 🔍 Como Diagnosticar o Problema

### Passo 1: Verificar Logs do Console

Abra o DevTools (F12) no navegador e procure por:

1. **Inicialização:**
   ```
   🚀 Inicializando Dashboard...
   🚀 Base sindical do usuário: [valor]
   🏢 Usuário comum: Definindo base sindical do usuário: [valor]
   ```

2. **Verificação de Carregamento:**
   ```
   🔄 === VERIFICANDO CARREGAMENTO ===
   🔄 isInitializedRef.current: true/false
   🔄 selectedBaseSindical: [valor ou vazio]
   🔄 user?.base_sindical: [valor ou undefined]
   ```

3. **Carregamento de Dados:**
   ```
   📊 === HANDLE LOAD BASE DADOS ===
   📊 selectedBaseSindical: [valor]
   🚀 Iniciando carregamento...
   ```

4. **Resposta do Backend:**
   ```
   📡 Resposta recebida: [objeto]
   📡 Employees length: [número]
   ```

### Passo 2: Verificar no Banco de Dados

Execute estas queries para verificar:

```sql
-- 1. Verificar configuração do usuário
SELECT id_usuario, email, base_sindical, perfil, id_empresa
FROM usuarios
WHERE email = 'amanda.corcino@gmail.com';

-- 2. Verificar se há dados para SINTECT/DF
SELECT COUNT(*) as total, base_sindical 
FROM base_dados 
WHERE base_sindical = 'SINTECT/DF'
GROUP BY base_sindical;

-- 3. Verificar TODAS as variações possíveis do nome
SELECT DISTINCT base_sindical 
FROM base_dados 
WHERE base_sindical LIKE '%SINTECT%' 
   OR base_sindical LIKE '%DF%'
ORDER BY base_sindical;

-- 4. Verificar dados mais recentes
SELECT base_sindical, mes, COUNT(*) as total, MAX(data_criacao) as ultima_atualizacao
FROM base_dados
WHERE base_sindical LIKE '%SINTECT%'
GROUP BY base_sindical, mes
ORDER BY ultima_atualizacao DESC
LIMIT 10;
```

### Passo 3: Verificar Possíveis Problemas

#### Problema 1: Nome da Base Sindical Diferente

**Sintoma:** `selectedBaseSindical` está definido, mas não há dados

**Possíveis causas:**
- Nome no banco: `SINTECT/DF` vs `SINTECT DF` vs `SINTECT-DF`
- Espaços extras: ` SINTECT/DF ` vs `SINTECT/DF`
- Maiúsculas/minúsculas: `sintect/df` vs `SINTECT/DF`

**Solução:**
```sql
-- Verificar nome exato no banco
SELECT DISTINCT base_sindical, LENGTH(base_sindical) as tamanho
FROM base_dados
WHERE base_sindical LIKE '%SINTECT%'
ORDER BY base_sindical;
```

#### Problema 2: selectedBaseSindical Não Está Sendo Definido

**Sintoma:** Logs mostram `selectedBaseSindical: ""` (vazio)

**Possíveis causas:**
- `user.base_sindical` está `null` ou `undefined`
- Inicialização não está sendo executada
- localStorage tem valor antigo que está sendo usado

**Solução:**
- Verificar logs: `🚀 Base sindical do usuário: [valor]`
- Verificar se o usuário tem `base_sindical` no banco
- Limpar localStorage: `localStorage.removeItem('selectedBaseSindical')`

#### Problema 3: Carregamento Não Está Sendo Disparado

**Sintoma:** Logs mostram `⚠️ Condições não atendidas para carregamento`

**Possíveis causas:**
- `isInitializedRef.current` é `false`
- `selectedBaseSindical` está vazio
- `isLoadingRef.current` ou `isLoadingBaseDados` é `true`

**Solução:**
- Verificar todos os logs do `🔄 === VERIFICANDO CARREGAMENTO ===`
- Verificar se todas as condições estão sendo atendidas

#### Problema 4: Backend Retorna Dados Vazios

**Sintoma:** Logs mostram `📡 Employees length: 0`

**Possíveis causas:**
- Query não está encontrando dados (nome diferente)
- Filtro de mês está excluindo todos os dados
- Cache está retornando dados vazios

**Solução:**
- Verificar logs do backend: `📊 Buscando dados com filtros:`
- Verificar se há dados no banco para aquele mês
- Limpar cache do Redis se necessário

---

## 🛠️ Próximos Passos

1. **Testar com o usuário:**
   - Pedir para abrir o console (F12)
   - Copiar todos os logs que aparecem
   - Verificar especialmente:
     - Valor de `selectedBaseSindical`
     - Valor de `user.base_sindical`
     - Se o carregamento está sendo disparado
     - Resposta do backend

2. **Verificar no banco:**
   - Executar as queries SQL acima
   - Verificar se há dados para SINTECT/DF
   - Verificar nome exato da base sindical

3. **Verificar backend:**
   - Verificar logs do servidor
   - Verificar se a query está sendo executada
   - Verificar se há erros

---

## 📝 Checklist de Diagnóstico

- [ ] Verificar logs do console do navegador
- [ ] Verificar se `user.base_sindical` está definido no banco
- [ ] Verificar se `selectedBaseSindical` está sendo definido
- [ ] Verificar se há dados na tabela `base_dados` para SINTECT/DF
- [ ] Verificar nome exato da base sindical no banco
- [ ] Verificar se o carregamento está sendo disparado
- [ ] Verificar resposta do backend
- [ ] Verificar logs do servidor backend

---

**Status:** Aguardando informações de diagnóstico do usuário

