import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import LoginSidebar from '@/components/LoginSidebar';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
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
      
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
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
          <div className="lg:hidden text-center">
            <img src="/logo.svg.png" alt="evia Logo" className="mx-auto h-16 w-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">evia</h2>
            <p className="text-sm text-gray-600">Faça login para acessar o sistema</p>
          </div>

          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
                          <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-[#2f4a8c] mb-4">Bem-vindo de volta</h2>
                <p className="text-base font-light text-gray-600 tracking-wide">Entre com suas credenciais para acessar o sistema</p>
              </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-600 text-sm">{error}</p>
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
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2f4a8c] focus:border-[#2f4a8c] hover:border-[#1d335b] bg-gray-50 focus:bg-gray-100 transition-all duration-200 [&:-webkit-autofill]:bg-gray-50 [&:-webkit-autofill]:shadow-[0_0_0_1000px_#f9fafb_inset] [&:-webkit-autofill]:focus:bg-gray-100 [&:-webkit-autofill]:focus:shadow-[0_0_0_1000px_#f3f4f6_inset]"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
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
                    className="w-full px-4 py-3 pl-10 pr-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2f4a8c] focus:border-[#2f4a8c] hover:border-[#1d335b] bg-gray-50 focus:bg-gray-100 transition-all duration-200 [&:-webkit-autofill]:bg-gray-50 [&:-webkit-autofill]:shadow-[0_0_0_1000px_#f9fafb_inset] [&:-webkit-autofill]:focus:bg-gray-100 [&:-webkit-autofill]:focus:shadow-[0_0_0_1000px_#f3f4f6_inset]"
                    placeholder="Sua senha"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-[#2f4a8c] focus:ring-[#2f4a8c] border-gray-300 rounded checked:bg-[#2f4a8c] checked:border-[#2f4a8c] hover:border-[#1d335b]"
                  />
                  <span className="ml-2 text-sm text-gray-600">Lembrar de mim</span>
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm text-[#2f4a8c] hover:text-[#1d335b] font-medium transition-colors duration-200"
                >
                  Esqueci a senha?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#1d335b] to-[#2f4a8c] text-white py-3 px-4 rounded-xl hover:from-[#2f4a8c] hover:to-[#1d335b] focus:outline-none focus:ring-2 focus:ring-[#2f4a8c] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{" "}
                <button
                  type="button"
                  className="text-[#2f4a8c] hover:text-[#1d335b] font-medium transition-colors duration-200"
                >
                  Registre-se aqui
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
