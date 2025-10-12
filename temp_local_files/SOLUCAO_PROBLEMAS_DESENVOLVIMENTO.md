# 🔧 Solução de Problemas - Ambiente de Desenvolvimento

## ✅ **Status Atual: FUNCIONANDO**

### 🚀 **Serviços Rodando:**
- **Backend**: ✅ `http://localhost:3000`
- **Frontend**: ✅ `http://localhost:5173`
- **Proxy**: ✅ Funcionando corretamente

## 🛠️ **Soluções para Problemas Comuns:**

### **1. Problema: "Ambiente de desenvolvimento parou de funcionar"**

#### **Solução 1: Reiniciar os Serviços**
```bash
# Parar todos os serviços
pkill -f "npm run dev"
pkill -f "vite"

# Reiniciar backend
cd backend
npm run dev

# Em outro terminal, reiniciar frontend
cd frontend
npm run dev
```

#### **Solução 2: Limpar Cache do Navegador**
- **Chrome/Edge**: `Ctrl + Shift + R` (Windows) ou `Cmd + Shift + R` (Mac)
- **Firefox**: `Ctrl + F5` (Windows) ou `Cmd + Shift + R` (Mac)
- **Safari**: `Cmd + Option + R`

#### **Solução 3: Verificar Console do Navegador**
1. Abra as **Ferramentas do Desenvolvedor** (F12)
2. Vá para a aba **Console**
3. Verifique se há erros em vermelho
4. Se houver erros, copie e me envie

#### **Solução 4: Verificar Network Tab**
1. Na aba **Network** das ferramentas do desenvolvedor
2. Recarregue a página (F5)
3. Verifique se as requisições estão sendo feitas corretamente
4. Procure por requisições com status 404, 500, etc.

### **2. Problema: "Erro de CORS"**

#### **Solução:**
```bash
# Verificar se o backend está rodando
curl http://localhost:3000/api/health

# Verificar se o frontend está rodando
curl http://localhost:5173
```

### **3. Problema: "API não responde"**

#### **Solução:**
```bash
# Verificar se o backend está rodando
ps aux | grep "npm run dev"

# Se não estiver, reiniciar
cd backend
npm run dev
```

### **4. Problema: "Frontend não carrega"**

#### **Solução:**
```bash
# Verificar se o Vite está rodando
ps aux | grep "vite"

# Se não estiver, reiniciar
cd frontend
npm run dev
```

### **5. Problema: "Erro de proxy"**

#### **Solução:**
Verificar se o `vite.config.ts` está correto:
```typescript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

## 🔍 **Diagnóstico Rápido:**

### **Teste 1: Backend**
```bash
curl http://localhost:3000/api/health
# Deve retornar: {"status":"OK","timestamp":"...","environment":"development"}
```

### **Teste 2: Frontend**
```bash
curl http://localhost:5173
# Deve retornar: HTML da página
```

### **Teste 3: Proxy**
```bash
curl -X POST -H "Content-Type: application/json" -d '{"email":"test","password":"test"}' http://localhost:5173/api/auth/login
# Deve retornar: {"success":false,"message":"Usuário não localizado!"}
```

## 🚨 **Problemas Conhecidos e Soluções:**

### **1. Porta 3000 já em uso**
```bash
# Encontrar processo usando a porta
lsof -ti:3000

# Matar processo
kill -9 $(lsof -ti:3000)

# Reiniciar backend
cd backend && npm run dev
```

### **2. Porta 5173 já em uso**
```bash
# Encontrar processo usando a porta
lsof -ti:5173

# Matar processo
kill -9 $(lsof -ti:5173)

# Reiniciar frontend
cd frontend && npm run dev
```

### **3. Cache do Node.js**
```bash
# Limpar cache do npm
npm cache clean --force

# Reinstalar dependências
cd backend && npm install
cd frontend && npm install
```

## 📋 **Checklist de Verificação:**

- [ ] Backend rodando em `http://localhost:3000`
- [ ] Frontend rodando em `http://localhost:5173`
- [ ] Proxy funcionando (teste com curl)
- [ ] Navegador com cache limpo
- [ ] Console sem erros
- [ ] Network tab mostrando requisições corretas

## 🆘 **Se Nada Funcionar:**

1. **Reiniciar completamente:**
   ```bash
   # Parar tudo
   pkill -f "npm run dev"
   pkill -f "vite"
   pkill -f "node"
   
   # Limpar cache
   npm cache clean --force
   
   # Reinstalar dependências
   cd backend && npm install
   cd frontend && npm install
   
   # Reiniciar
   cd backend && npm run dev
   cd frontend && npm run dev
   ```

2. **Verificar logs:**
   - Backend: Terminal onde rodou `npm run dev`
   - Frontend: Terminal onde rodou `npm run dev`
   - Navegador: Console (F12)

3. **Contatar suporte:**
   - Enviar logs de erro
   - Descrever o problema específico
   - Incluir screenshots se necessário

## ✅ **Status Atual:**
- **Backend**: ✅ Funcionando
- **Frontend**: ✅ Funcionando
- **Proxy**: ✅ Funcionando
- **Ambiente**: ✅ Pronto para desenvolvimento

**Data da Atualização**: 19 de Setembro de 2025


