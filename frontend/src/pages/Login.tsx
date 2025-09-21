import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import LoginSidebar from '@/components/LoginSidebar';

// Funções para criptografia simples das credenciais
const encrypt = (text: string): string => {
  return btoa(encodeURIComponent(text));
};

const decrypt = (encryptedText: string): string => {
  try {
    return decodeURIComponent(atob(encryptedText));
  } catch {
    return '';
  }
};

// Chave para criptografia (em produção, usar uma chave mais segura)
const STORAGE_KEY = 'unisafe_remember_me';
const CREDENTIALS_EXPIRY_DAYS = 30; // Credenciais expiram em 30 dias

// Interface para dados salvos
interface SavedCredentials {
  email: string;
  password: string;
  timestamp: number;
  expiry: number;
}

// Funções para gerenciar credenciais salvas
const saveCredentials = (email: string, password: string): void => {
  const now = Date.now();
  const expiry = now + (CREDENTIALS_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  
  const credentials: SavedCredentials = {
    email: encrypt(email),
    password: encrypt(password),
    timestamp: now,
    expiry: expiry
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
  console.log('🔐 Credenciais salvas com criptografia');
};

const loadCredentials = (): { email: string; password: string; savedAt?: Date } | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    
    const credentials: SavedCredentials = JSON.parse(saved);
    
    // Verificar se as credenciais não expiraram
    if (Date.now() > credentials.expiry) {
      console.log('⏰ Credenciais salvas expiraram, removendo...');
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    
    return {
      email: decrypt(credentials.email),
      password: decrypt(credentials.password),
      savedAt: new Date(credentials.timestamp)
    };
  } catch (error) {
    console.error('❌ Erro ao carregar credenciais salvas:', error);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

const clearCredentials = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  console.log('🗑️ Credenciais salvas removidas');
};

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
  const [credentialsLoaded, setCredentialsLoaded] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Função para limpar o formulário
  const clearForm = () => {
    setEmail('');
    setPassword('');
    setRememberMe(false);
    setError('');
    setValidationErrors({});
    
    // Limpar credenciais salvas para permitir login com outro usuário
    clearCredentials();
    console.log('🧹 Formulário limpo e credenciais salvas removidas');
  };

  // Carregar credenciais salvas ao montar o componente (apenas uma vez)
  useEffect(() => {
    const loadCredentialsOnce = () => {
      const credentials = loadCredentials();
      
      if (credentials) {
        setEmail(credentials.email);
        setPassword(credentials.password);
        setRememberMe(true);
        setCredentialsLoaded(true);
        
        if (credentials.savedAt) {
          const daysSinceSaved = Math.floor((Date.now() - credentials.savedAt.getTime()) / (1000 * 60 * 60 * 24));
          console.log(`✅ Credenciais carregadas automaticamente (salvas há ${daysSinceSaved} dias)`);
        } else {
          console.log('✅ Credenciais carregadas automaticamente');
        }
        
        // Esconder o indicador após 3 segundos
        setTimeout(() => {
          setCredentialsLoaded(false);
        }, 3000);
      } else {
        // Limpar credenciais antigas se existirem
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
        localStorage.removeItem('rememberMe');
        console.log('ℹ️ Nenhuma credencial salva encontrada');
      }
    };

    // Carregar apenas uma vez ao montar o componente
    loadCredentialsOnce();
  }, []); // Dependências vazias para executar apenas uma vez

  // Validação em tempo real
  useEffect(() => {
    validateField('email', email);
  }, [email]);

  useEffect(() => {
    validateField('password', password);
  }, [password]);

  // Detectar preenchimento automático do navegador e gerenciadores de senhas
  useEffect(() => {
    const checkAutofill = () => {
      const emailInput = document.getElementById('email') as HTMLInputElement;
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      
      if (emailInput && emailInput.value !== email) {
        console.log('🔍 Autofill detectado no e-mail:', emailInput.value);
        setEmail(emailInput.value);
      }
      
      if (passwordInput && passwordInput.value !== password) {
        console.log('🔍 Autofill detectado na senha');
        setPassword(passwordInput.value);
      }
    };

    const handleAnimationStart = (e: AnimationEvent) => {
      // O navegador usa animações CSS para o autofill
      if (e.animationName === 'onAutoFillStart' || e.animationName === 'onAutoFillCancel') {
        console.log('🔍 Evento de autofill detectado:', e.animationName);
        setTimeout(checkAutofill, 10); // Pequeno delay para garantir que o valor foi definido
      }
    };

    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.id === 'email' && target.value !== email) {
        console.log('🔍 Input event detectado no e-mail:', target.value);
        setEmail(target.value);
      } else if (target.id === 'password' && target.value !== password) {
        console.log('🔍 Input event detectado na senha');
        setPassword(target.value);
      }
    };

    // Eventos específicos para gerenciadores de senhas
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLInputElement;
      // Detectar Ctrl+V, Cmd+V (colar) e outras teclas que podem indicar preenchimento
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        setTimeout(() => {
          if (target.id === 'email' && target.value !== email) {
            console.log('🔍 Paste detectado no e-mail:', target.value);
            setEmail(target.value);
          } else if (target.id === 'password' && target.value !== password) {
            console.log('🔍 Paste detectado na senha');
            setPassword(target.value);
          }
        }, 10);
      }
    };

    // Detectar cliques que podem indicar preenchimento de gerenciador de senhas
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.id === 'email' || target.id === 'password') {
        // Pequeno delay para permitir que o gerenciador de senhas preencha
        setTimeout(checkAutofill, 100);
      }
    };

    // Detectar eventos de mouse que podem indicar preenchimento
    const handleMouseUp = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.id === 'email' || target.id === 'password') {
        setTimeout(checkAutofill, 50);
      }
    };

    const handleChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.id === 'email' && target.value !== email) {
        console.log('🔍 Change event detectado no e-mail:', target.value);
        setEmail(target.value);
      } else if (target.id === 'password' && target.value !== password) {
        console.log('🔍 Change event detectado na senha');
        setPassword(target.value);
      }
    };

    // MutationObserver para detectar mudanças no DOM (autofill)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
          const target = mutation.target as HTMLInputElement;
          if (target.id === 'email' && target.value !== email) {
            console.log('🔍 MutationObserver detectou mudança no e-mail:', target.value);
            setEmail(target.value);
          } else if (target.id === 'password' && target.value !== password) {
            console.log('🔍 MutationObserver detectou mudança na senha');
            setPassword(target.value);
          }
        }
      });
    });

    // Verificar imediatamente
    checkAutofill();

    // Verificar periodicamente para capturar autofill (mais frequente para gerenciadores de senhas)
    const interval = setInterval(checkAutofill, 50); // Reduzido para 50ms
    
    // Usar requestAnimationFrame para detecção mais eficiente
    let animationId: number;
    const checkWithRAF = () => {
      checkAutofill();
      animationId = requestAnimationFrame(checkWithRAF);
    };
    animationId = requestAnimationFrame(checkWithRAF);
    
    // Adicionar listeners para eventos
    document.addEventListener('animationstart', handleAnimationStart);
    document.addEventListener('input', handleInput, true); // true para capturar na fase de captura
    document.addEventListener('change', handleChange, true);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('mouseup', handleMouseUp, true);
    
    // Observar mudanças nos inputs
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput) {
      observer.observe(emailInput, { 
        attributes: true, 
        attributeFilter: ['value'],
        childList: true,
        subtree: true
      });
    }
    if (passwordInput) {
      observer.observe(passwordInput, { 
        attributes: true, 
        attributeFilter: ['value'],
        childList: true,
        subtree: true
      });
    }
    
    // Limpar após 5 segundos (mais tempo para gerenciadores de senhas)
    const timeout = setTimeout(() => {
      clearInterval(interval);
      cancelAnimationFrame(animationId);
      observer.disconnect();
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      cancelAnimationFrame(animationId);
      observer.disconnect();
      document.removeEventListener('animationstart', handleAnimationStart);
      document.removeEventListener('input', handleInput, true);
      document.removeEventListener('change', handleChange, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('mouseup', handleMouseUp, true);
    };
  }, [email, password]);

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
        saveCredentials(email, password);
      } else {
        // Remover credenciais salvas se não estiver marcado
        clearCredentials();
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
        return <CheckCircle className="h-4 w-4 text-[#c9504c]" />;
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
        return `${baseStyles} border-[#c9504c] focus:ring-[#c9504c] focus:border-[#c9504c]`;
      default:
        return `${baseStyles} border-gray-300 focus:ring-[#c9504c] focus:border-[#c9504c] hover:border-[#1d335b]`;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo - Logo e branding */}
      <LoginSidebar />

      {/* Lado direito - Formulário de login */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-[#ffc9c0] lg:bg-[#1d335b]">
        <div className="max-w-md w-full space-y-8">
          {/* Logo mobile */}
          <div className="lg:hidden text-center animate-fade-in">
            <img src="/logo.svg.png" alt="evia Logo" className="mx-auto h-16 w-auto mb-4" />
          </div>

          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 animate-slide-up">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#2f4a8c] mb-4">Bem-vindo de volta</h2>
              <p className="text-base font-light text-gray-600 tracking-wide">Entre com suas credenciais para acessar o sistema</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {credentialsLoaded && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-fade-in">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div className="text-green-600 text-sm font-medium">
                      Credenciais carregadas automaticamente
                    </div>
                  </div>
                </div>
              )}

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
                    onFocus={(e) => {
                      // Verificar se há valor preenchido automaticamente
                      if (e.target.value && e.target.value !== email) {
                        console.log('🔍 Focus detectou autofill no e-mail:', e.target.value);
                        setEmail(e.target.value);
                      }
                      // Verificar novamente após um pequeno delay para gerenciadores de senhas
                      setTimeout(() => {
                        if (e.target.value && e.target.value !== email) {
                          console.log('🔍 Focus delay detectou autofill no e-mail:', e.target.value);
                          setEmail(e.target.value);
                        }
                      }, 200);
                    }}
                    onBlur={(e) => {
                      // Verificar novamente quando perde o foco
                      if (e.target.value && e.target.value !== email) {
                        console.log('🔍 Blur detectou autofill no e-mail:', e.target.value);
                        setEmail(e.target.value);
                      }
                    }}
                    onMouseEnter={() => {
                      // Verificar quando o mouse entra no campo (gerenciadores de senhas)
                      setTimeout(() => {
                        const emailInput = document.getElementById('email') as HTMLInputElement;
                        if (emailInput && emailInput.value && emailInput.value !== email) {
                          console.log('🔍 MouseEnter detectou autofill no e-mail:', emailInput.value);
                          setEmail(emailInput.value);
                        }
                      }, 100);
                    }}
                    className={getFieldStyles('email')}
                    placeholder="seu@email.com"
                    required
                    autoComplete="email"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
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
                    onFocus={(e) => {
                      // Verificar se há valor preenchido automaticamente
                      if (e.target.value && e.target.value !== password) {
                        console.log('🔍 Focus detectou autofill na senha');
                        setPassword(e.target.value);
                      }
                      // Verificar novamente após um pequeno delay para gerenciadores de senhas
                      setTimeout(() => {
                        if (e.target.value && e.target.value !== password) {
                          console.log('🔍 Focus delay detectou autofill na senha');
                          setPassword(e.target.value);
                        }
                      }, 200);
                    }}
                    onBlur={(e) => {
                      // Verificar novamente quando perde o foco
                      if (e.target.value && e.target.value !== password) {
                        console.log('🔍 Blur detectou autofill na senha');
                        setPassword(e.target.value);
                      }
                    }}
                    onMouseEnter={() => {
                      // Verificar quando o mouse entra no campo (gerenciadores de senhas)
                      setTimeout(() => {
                        const passwordInput = document.getElementById('password') as HTMLInputElement;
                        if (passwordInput && passwordInput.value && passwordInput.value !== password) {
                          console.log('🔍 MouseEnter detectou autofill na senha');
                          setPassword(passwordInput.value);
                        }
                      }, 100);
                    }}
                    className={getFieldStyles('password')}
                    placeholder="Sua senha"
                    required
                    autoComplete="current-password"
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
                <label className="flex items-center cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-[#2f4a8c] focus:ring-[#2f4a8c] border-gray-300 rounded checked:bg-[#2f4a8c] checked:border-[#2f4a8c] hover:border-[#1d335b] transition-all duration-200 opacity-0 absolute"
                    />
                    <div className={`h-4 w-4 border-2 rounded flex items-center justify-center transition-all duration-200 ${
                      rememberMe 
                        ? 'bg-[#2f4a8c] border-[#2f4a8c]' 
                        : 'border-gray-300 group-hover:border-[#1d335b]'
                    }`}>
                      {rememberMe && (
                        <CheckCircle className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                  <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-200">
                    Lembrar de mim
                    <span className="block text-xs text-gray-400 mt-0.5">
                      (válido por 30 dias)
                    </span>
                  </span>
                </label>
                <div className="flex flex-col items-end space-y-1">
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-sm text-[#2f4a8c] hover:text-[#1d335b] font-medium transition-colors duration-200 hover:underline"
                  >
                    Esqueci a senha?
                  </button>
                  <button
                    type="button"
                    onClick={clearForm}
                    className="text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200 hover:underline"
                  >
                    Limpar formulário
                  </button>
                </div>
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
