import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import LoginSidebar from '@/components/LoginSidebar';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Simular envio de e-mail (por enquanto)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Erro ao processar solicitação');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo - Logo e branding */}
      <LoginSidebar />

      {/* Lado direito - Formulário */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#1d335b] to-[#2f4a8c]">
        <div className="max-w-md w-full space-y-8">
          {/* Logo mobile */}
          <div className="lg:hidden text-center">
            <img src="/logo.svg.png" alt="evia Logo" className="mx-auto h-16 w-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">evia</h2>
            <p className="text-sm text-gray-600">Recupere sua senha</p>
          </div>

          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#2f4a8c] mb-4">Esqueceu sua senha?</h2>
              <p className="text-base font-light text-gray-600 tracking-wide">
                Digite seu e-mail e enviaremos instruções para redefinir sua senha
              </p>
            </div>

            {!success ? (
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
                      autoComplete="email"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#1d335b] to-[#2f4a8c] text-white py-3 px-4 rounded-xl hover:from-[#2f4a8c] hover:to-[#1d335b] focus:outline-none focus:ring-2 focus:ring-[#2f4a8c] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isLoading ? 'Enviando...' : 'Enviar instruções'}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-green-600 text-sm">
                    Instruções enviadas! Verifique seu e-mail para redefinir sua senha.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="w-full bg-gradient-to-r from-[#1d335b] to-[#2f4a8c] text-white py-3 px-4 rounded-xl hover:from-[#2f4a8c] hover:to-[#1d335b] focus:outline-none focus:ring-2 focus:ring-[#2f4a8c] focus:ring-offset-2 transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Enviar novamente
                </button>
              </div>
            )}

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="inline-flex items-center text-sm text-[#2f4a8c] hover:text-[#1d335b] font-medium transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para o login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
