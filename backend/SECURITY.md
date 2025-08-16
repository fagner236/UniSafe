# 🔒 Guia de Segurança do UniSafe

## Visão Geral

Este documento descreve as medidas de segurança implementadas no sistema UniSafe e como configurá-las adequadamente.

## 🚨 Configurações Críticas

### 1. JWT_SECRET
**CRÍTICO**: Configure uma chave JWT forte e única.

```env
# ❌ NUNCA use isso em produção
JWT_SECRET="fallback-secret"

# ✅ Use uma chave forte (mínimo 32 caracteres)
JWT_SECRET="sua-chave-super-secreta-com-pelo-menos-32-caracteres-12345"
```

**Como gerar uma chave segura:**
```bash
# Opção 1: Usando openssl
openssl rand -base64 32

# Opção 2: Usando node
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. BCRYPT_ROUNDS
Configure o número de rounds para hash de senhas.

```env
# Recomendado: 12-14
BCRYPT_ROUNDS=12
```

### 3. Rate Limiting
Configure limites de requisições para prevenir ataques.

```env
# Janela de tempo (15 minutos)
RATE_LIMIT_WINDOW_MS=900000

# Máximo de requisições por janela
RATE_LIMIT_MAX_REQUESTS=100

# Máximo de tentativas de autenticação
AUTH_RATE_LIMIT_MAX=5
```

## 🛡️ Medidas de Segurança Implementadas

### 1. Autenticação e Autorização
- ✅ JWT com expiração configurável
- ✅ Hash de senhas com bcrypt
- ✅ Middleware de autenticação
- ✅ Controle de roles e permissões
- ✅ Rate limiting para endpoints de auth

### 2. Proteção contra Ataques
- ✅ Helmet.js para headers de segurança
- ✅ CORS configurado
- ✅ Rate limiting geral
- ✅ Sanitização de inputs
- ✅ Validação de dados com express-validator

### 3. Headers de Segurança
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ✅ Permissions-Policy configurado

### 4. Logs e Auditoria
- ✅ Logs de tentativas de login
- ✅ Logs de registro de usuários
- ✅ Logs de erros de segurança
- ✅ Timestamps em todas as operações

## 🔍 Verificação de Segurança

Execute o script de verificação para validar a configuração:

```bash
npm run security:check
```

Este script verifica:
- Configuração do JWT_SECRET
- Configuração do BCRYPT_ROUNDS
- Variáveis de ambiente críticas
- Conexão com banco de dados
- Configurações de rate limiting

## 📋 Checklist de Segurança

### Antes de Deploy em Produção
- [ ] JWT_SECRET configurado e forte (32+ caracteres)
- [ ] BCRYPT_ROUNDS >= 10
- [ ] NODE_ENV=production
- [ ] CORS_ORIGIN restrito ao domínio de produção
- [ ] Rate limiting configurado adequadamente
- [ ] Logs de erro desabilitados em produção
- [ ] HTTPS configurado
- [ ] Firewall configurado
- [ ] Backup do banco de dados configurado

### Monitoramento Contínuo
- [ ] Logs de segurança revisados regularmente
- [ ] Tentativas de login falhadas monitoradas
- [ ] Rate limiting funcionando corretamente
- [ ] Dependências atualizadas regularmente
- [ ] Testes de penetração realizados

## 🚨 Resposta a Incidentes

### Se JWT_SECRET for comprometido:
1. Gerar nova chave JWT_SECRET
2. Invalidar todos os tokens existentes
3. Forçar re-autenticação de todos os usuários
4. Investigar como a chave foi comprometida

### Se houver suspeita de ataque:
1. Ativar logs detalhados
2. Monitorar tentativas de acesso
3. Verificar logs de segurança
4. Considerar aumentar rate limiting
5. Notificar equipe de segurança

## 📚 Recursos Adicionais

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practices-security.html)

## 📞 Contato

Para questões de segurança, entre em contato com a equipe de desenvolvimento.

---

**⚠️ IMPORTANTE**: Este sistema lida com dados sensíveis. Sempre priorize a segurança sobre a conveniência.
