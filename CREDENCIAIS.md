# 🔐 Credenciais de Acesso - Sistema UniSafe

## 📧 Credenciais Padrão

Após a instalação e configuração do sistema, você pode acessar com as seguintes credenciais:

### 👤 Usuário Administrador
- **Email**: admin@unisafe.com
- **Senha**: admin123
- **Role**: admin
- **Permissões**: Acesso total ao sistema

## 🚀 Como Criar o Usuário Administrador

Se o usuário administrador não existir, execute o seguinte comando:

```bash
cd backend
npm run db:seed
```

Este comando irá:
1. Conectar ao banco de dados MySQL
2. Criar o usuário administrador com as credenciais acima
3. Exibir uma confirmação de sucesso

## 🔒 Segurança

⚠️ **IMPORTANTE**: 
- Altere a senha padrão após o primeiro acesso
- Mantenha as credenciais seguras
- Use senhas fortes em ambiente de produção
- Considere implementar autenticação de dois fatores

## 🌐 URLs de Acesso

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Prisma Studio**: http://localhost:5555 (para gerenciar banco de dados)

## 📞 Suporte

Em caso de problemas com o acesso, verifique:
1. Se o banco de dados MySQL está rodando
2. Se os serviços frontend e backend estão ativos
3. Se o usuário foi criado corretamente via seed

---

**UniSafe** - Sistema de Gestão de Entidades Sindicais
