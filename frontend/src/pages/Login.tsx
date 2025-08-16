import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import LoginSidebar from '@/components/LoginSidebar';

interface ValidationErrors {
  email?: string;
  password?: string;
}

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Carregar credenciais salvas ao montar o componente
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    
    if (savedRememberMe && savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  // Validação em tempo real
  useEffect(() => {
    validateField('email', email);
  }, [email]);

  useEffect(() => {
    validateField('password', password);
  }, [password]);

  const validateField = (field: keyof ValidationErrors, value: string) => {
    const errors = { ...validationErrors };
    
    switch (field) {
      case 'email':
        if (!value) {
          errors.email = 'E-mail é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'E-mail inválido';
        } else {
          delete errors.email;
        }
        break;
      
      case 'password':
        if (!value) {
          errors.password = 'Senha é obrigatória';
        } else if (value.length < 6) {
          errors.password = 'Senha deve ter pelo menos 6 caracteres';
        } else {
          delete errors.password;
        }
        break;
    }
    
    setValidationErrors(errors);
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    if (!email) errors.email = 'E-mail é obrigatório';
    if (!password) errors.password = 'Senha é obrigatória';
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'E-mail inválido';
    }
    
    if (password && password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setIsSubmitting(true);
    setError('');

    try {
      await login(email, password);
      
      // Salvar credenciais se "Lembre de mim" estiver marcado
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberedPassword', password);
        localStorage.setItem('rememberMe', 'true');
      } else {
        // Remover credenciais salvas se não estiver marcado
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
        localStorage.removeItem('rememberMe');
      }
      
      // Pequeno delay para mostrar feedback visual
      setTimeout(() => {
        navigate('/');
      }, 500);
      
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao fazer login. Verifique suas credenciais.';
      
      // Verificar se é o erro de usuário não localizado
      if (errorMessage === 'Usuário não localizado!') {
        setError('Usuário não localizado! Clique aqui para cadastrar sua empresa.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const getFieldStatus = (field: keyof ValidationErrors) => {
    if (validationErrors[field]) return 'error';
    if (field === 'email' && email && !validationErrors.email) return 'success';
    if (field === 'password' && password && !validationErrors.password) return 'success';
    return 'default';
  };

  const getFieldIcon = (field: keyof ValidationErrors) => {
    const status = getFieldStatus(field);
    
    switch (status) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getFieldStyles = (field: keyof ValidationErrors) => {
    const status = getFieldStatus(field);
    const baseStyles = "w-full px-4 py-3 pl-10 pr-10 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 bg-gray-50 focus:bg-gray-100";
    
    switch (status) {
      case 'error':
        return `${baseStyles} border-red-300 focus:ring-red-500 focus:border-red-500`;
      case 'success':
        return `${baseStyles} border-green-300 focus:ring-green-500 focus:border-green-500`;
      default:
        return `${baseStyles} border-gray-300 focus:ring-[#2f4a8c] focus:border-[#2f4a8c] hover:border-[#1d335b]`;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo - Logo e branding */}
      <LoginSidebar />

      {/* Lado direito - Formulário de login */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#1d335b] to-[#2f4a8c]">
        <div className="max-w-md w-full space-y-8">
          {/* Logo mobile */}
          <div className="lg:hidden text-center animate-fade-in">
            <img src="/logo.svg.png" alt="evia Logo" className="mx-auto h-16 w-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">evia</h2>
            <p className="text-sm text-gray-600">Faça login para acessar o sistema</p>
          </div>

          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 animate-slide-up">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#2f4a8c] mb-4">Bem-vindo de volta</h2>
              <p className="text-base font-light text-gray-600 tracking-wide">Entre com suas credenciais para acessar o sistema</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-shake">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <div className="text-red-600 text-sm font-medium">
                      {error === 'Usuário não localizado! Clique aqui para cadastrar sua empresa.' ? (
                        <span>
                          Usuário não localizado!{' '}
                          <button
                            type="button"
                            onClick={() => navigate('/register')}
                            className="text-[#2f4a8c] hover:text-[#1d335b] font-medium transition-colors duration-200 hover:underline cursor-pointer"
                          >
                            Clique aqui para cadastrar sua empresa
                          </button>
                        </span>
                      ) : (
                        error
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-600 tracking-wide mb-2">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={getFieldStyles('email')}
                    placeholder="seu@email.com"
                    required
                    aria-describedby={validationErrors.email ? "email-error" : undefined}
                    aria-invalid={!!validationErrors.email}
                  />
                  {getFieldIcon('email') && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {getFieldIcon('email')}
                    </div>
                  )}
                </div>
                {validationErrors.email && (
                  <p id="email-error" className="mt-2 text-sm text-red-600 animate-fade-in">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-bold text-gray-600 tracking-wide mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={getFieldStyles('password')}
                    placeholder="Sua senha"
                    required
                    aria-describedby={validationErrors.password ? "password-error" : undefined}
                    aria-invalid={!!validationErrors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  {getFieldIcon('password') && (
                    <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                      {getFieldIcon('password')}
                    </div>
                  )}
                </div>
                {validationErrors.password && (
                  <p id="password-error" className="mt-2 text-sm text-red-600 animate-fade-in">
                    {validationErrors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-[#2f4a8c] focus:ring-[#2f4a8c] border-gray-300 rounded checked:bg-[#2f4a8c] checked:border-[#2f4a8c] hover:border-[#1d335b] transition-colors duration-200"
                  />
                  <span className="ml-2 text-sm text-gray-600">Lembrar de mim</span>
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm text-[#2f4a8c] hover:text-[#1d335b] font-medium transition-colors duration-200 hover:underline"
                >
                  Esqueci a senha?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || isSubmitting || Object.keys(validationErrors).length > 0}
                className="w-full bg-gradient-to-r from-[#1d335b] to-[#2f4a8c] text-white py-3 px-4 rounded-xl hover:from-[#2f4a8c] hover:to-[#1d335b] focus:outline-none focus:ring-2 focus:ring-[#2f4a8c] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Entrando...</span>
                  </div>
                ) : (
                  'Entrar'
                )}
              </button>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Não tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="text-[#2f4a8c] hover:text-[#1d335b] font-medium transition-colors duration-200 hover:underline"
                  >
                    Registre-se aqui
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
