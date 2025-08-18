import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, CheckCircle, ArrowRight, ArrowLeft, Search, AlertCircle, Info } from 'lucide-react';
import api from '../config/axios';

interface CompanyData {
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  data_criacao?: Date;
  data_atualizacao?: Date;
}

interface UserData {
  nome: string;
  email: string;
  senha: string;
  confirmPassword: string;
}

const Register = () => {
  const [activeTab, setActiveTab] = useState<'company' | 'user'>('company');
  const [companyData, setCompanyData] = useState<CompanyData>({
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    endereco: '',
    cidade: '',
    estado: ''
  });
  const [userData, setUserData] = useState<UserData>({
    nome: '',
    email: '',
    senha: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingCNPJ, setIsCheckingCNPJ] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [cnpjExists, setCnpjExists] = useState<boolean | null>(null);
  const [cnpjMessage, setCnpjMessage] = useState('');

  const navigate = useNavigate();

  // Verificar CNPJ quando o campo for preenchido completamente
  useEffect(() => {
    if (companyData.cnpj.length === 18) {
      // Validar formato do CNPJ antes de verificar
      const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
      if (cnpjRegex.test(companyData.cnpj)) {
        checkCNPJ(companyData.cnpj);
      } else {
        setCnpjExists(null);
        setCnpjMessage('Formato de CNPJ inválido');
      }
    } else {
      setCnpjExists(null);
      setCnpjMessage('');
    }
  }, [companyData.cnpj]);

  const checkCNPJ = async (cnpj: string) => {
    setIsCheckingCNPJ(true);
    setError('');
    setCnpjMessage('');

    try {
      // Remover formatação do CNPJ para a API
      const cleanCNPJ = cnpj.replace(/\D/g, '');
      console.log('🔍 Verificando CNPJ:', cleanCNPJ);
      
      const response = await api.get(`/api/companies/check-cnpj?cnpj=${cleanCNPJ}`);
      console.log('📡 Resposta da verificação:', response.data);
      
      if (response.data.success) {
        if (response.data.exists) {
          // CNPJ existe - preencher formulário e ir para aba de usuário
          setCnpjExists(true);
          setCompanyId(response.data.data.id_empresa);
          
          // Preencher todos os campos com os dados da empresa encontrada
          const empresaEncontrada = response.data.data;
          setCompanyData({
            razao_social: empresaEncontrada.razao_social,
            nome_fantasia: empresaEncontrada.nome_fantasia || '',
            cnpj: empresaEncontrada.cnpj,
            endereco: empresaEncontrada.endereco,
            cidade: empresaEncontrada.cidade,
            estado: empresaEncontrada.estado
          });
          
          setCnpjMessage(`✅ Empresa já faz parte da nossa base de dados - faça seu cadastro como usuário!`);
          
          // Aguardar um pouco para mostrar a mensagem e depois ir para aba de usuário
          setTimeout(() => {
            setActiveTab('user');
            setSuccess(`Empresa "${empresaEncontrada.razao_social}" encontrada! Cadastre-se!`);
          }, 2000);
        } else {
          // CNPJ não existe - permitir cadastro
          setCnpjExists(false);
          setCnpjMessage('✅ CNPJ disponível para cadastro - pode prosseguir com o preenchimento');
        }
      } else {
        setError('Erro na resposta da API. Tente novamente.');
        setCnpjExists(null);
      }
    } catch (err: any) {
      console.error('❌ Erro ao verificar CNPJ:', err);
      if (err.response?.status === 404) {
        setError('Serviço de verificação de CNPJ não disponível. Tente novamente.');
      } else if (err.response?.status === 500) {
        setError('Erro interno do servidor. Tente novamente.');
      } else {
        setError('Erro ao verificar CNPJ. Verifique sua conexão e tente novamente.');
      }
      setCnpjExists(null);
    } finally {
      setIsCheckingCNPJ(false);
    }
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cnpjExists) {
      setError('Este CNPJ já está cadastrado no sistema');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🏢 Enviando dados da empresa:', companyData);
      
      const response = await api.post('/api/companies', companyData);
      console.log('📡 Resposta da API de empresa:', response.data);
      
      if (response.data.success) {
        const companyIdFromResponse = response.data.data.id_empresa;
        console.log('🆔 Company ID recebido:', companyIdFromResponse);
        
        setCompanyId(companyIdFromResponse);
        setSuccess('Empresa cadastrada com sucesso! Agora cadastre o usuário administrador.');
        setActiveTab('user');
      }
    } catch (err: any) {
      console.error('❌ Erro ao cadastrar empresa:', err);
      setError(err.response?.data?.message || 'Erro ao cadastrar empresa');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (userData.senha !== userData.confirmPassword) {
      setError('As senhas não coincidem');
      setIsLoading(false);
      return;
    }

    try {
      console.log('👤 Enviando dados do usuário. Company ID atual:', companyId);
      
      const userDataToSend = {
        nome: userData.nome,
        email: userData.email,
        password: userData.senha,
        companyId
      };
      
      console.log('📤 Dados do usuário para envio:', userDataToSend);
      
      const response = await api.post('/api/auth/register', userDataToSend);
      console.log('📡 Resposta da API de usuário:', response.data);
      
      if (response.data.success) {
        setSuccess('Usuário cadastrado com sucesso! Você pode fazer login agora.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err: any) {
      console.error('❌ Erro ao cadastrar usuário:', err);
      setError(err.response?.data?.message || 'Erro ao cadastrar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 18) {
      setCompanyData(prev => ({
        ...prev,
        cnpj: formatCNPJ(value)
      }));
    }
  };

  const resetForm = () => {
    setCompanyData({
      razao_social: '',
      nome_fantasia: '',
      cnpj: '',
      endereco: '',
      cidade: '',
      estado: ''
    });
    setUserData({
      nome: '',
      email: '',
      senha: '',
      confirmPassword: ''
    });
    setCnpjExists(null);
    setCnpjMessage('');
    setCompanyId(null);
    setError('');
    setSuccess('Formulário limpo! Digite um novo CNPJ para verificar.');
    setActiveTab('company');
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo - Logo e branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-white items-center justify-center">
        <div className="text-center text-gray-900 px-8 -mt-16">
          <div className="mb-4 relative">
            <img src="/logo-large.svg.png" alt="evia Logo" className="mx-auto h-64 w-auto" />
            <h1 className="absolute bottom-14 left-1/2 transform translate-x-12 text-base font-light text-gray-600 tracking-wide">UniSafe</h1>
          </div>
          
          <div className="space-y-4 text-left max-w-md mx-auto">
            <div className="flex items-center space-x-4">
              <div className="bg-red-100 rounded-full p-3">
                <Building2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-[#2f4a8c] tracking-wide">Gestão Completa</h3>
                <p className="text-gray-600 text-sm">Gerencie base de dados de forma eficiente</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-red-100 rounded-full p-3">
                <User className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-[#2f4a8c] tracking-wide">Cadastro Simplificado</h3>
                <p className="text-gray-600 text-sm">Crie sua conta e empresa em poucos passos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lado direito - Formulário de cadastro */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#1d335b] to-[#2f4a8c]">
        <div className="max-w-md w-full space-y-8">
          {/* Logo mobile */}
          <div className="lg:hidden text-center">
            <img src="/logo.svg.png" alt="evia Logo" className="mx-auto h-16 w-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">evia</h2>
            <p className="text-sm text-gray-600">Crie sua conta no sistema</p>
          </div>

          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#2f4a8c] mb-4">Criar Conta</h2>
              <p className="text-base font-light text-gray-600 tracking-wide">Cadastre sua empresa e usuário administrador</p>
            </div>

            {/* Abas */}
            <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('company')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'company'
                    ? 'bg-white text-[#2f4a8c] shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Building2 className="inline-block w-4 h-4 mr-2" />
                Empresa
              </button>
              <button
                onClick={() => setActiveTab('user')}
                disabled={!companyId}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'user'
                    ? 'bg-white text-[#2f4a8c] shadow-sm'
                    : companyId
                    ? 'text-gray-600 hover:text-gray-800'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <User className="inline-block w-4 h-4 mr-2" />
                Usuário
                {companyId && <CheckCircle className="inline-block w-4 h-4 ml-2 text-green-500" />}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <p className="text-green-600 text-sm">{success}</p>
                </div>
              </div>
            )}

            {/* Aba Empresa */}
            {activeTab === 'company' && (
              <form onSubmit={handleCompanySubmit} className="space-y-6">
                {/* CNPJ como primeiro campo */}
                <div>
                  <label htmlFor="cnpj" className="block text-sm font-bold text-gray-600 tracking-wide mb-2">
                    CNPJ *
                  </label>
                  <div className="relative">
                    <input
                      id="cnpj"
                      type="text"
                      value={companyData.cnpj}
                      onChange={handleCNPJChange}
                      className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 bg-gray-50 focus:bg-gray-100 ${
                        cnpjExists === true 
                          ? 'border-green-300 focus:ring-green-500 focus:border-green-500' 
                          : cnpjExists === false 
                          ? 'border-blue-300 focus:ring-blue-500 focus:border-blue-500'
                          : 'border-gray-300 focus:ring-[#2f4a8c] focus:border-[#2f4a8c] hover:border-[#1d335b]'
                      }`}
                      placeholder="00.000.000/0000-00"
                      maxLength={18}
                      required
                      disabled={isCheckingCNPJ}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {isCheckingCNPJ ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#2f4a8c]"></div>
                      ) : cnpjExists === true ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : cnpjExists === false ? (
                        <Search className="h-4 w-4 text-blue-500" />
                      ) : null}
                    </div>
                  </div>
                  
                  {/* Mensagem do CNPJ */}
                  {cnpjMessage && (
                    <div className={`mt-2 p-3 rounded-lg text-sm ${
                      cnpjExists === true 
                        ? 'bg-green-50 border border-green-200 text-green-700' 
                        : 'bg-blue-50 border border-blue-200 text-blue-700'
                    }`}>
                      <div className="flex items-center space-x-2">
                        {cnpjExists === true ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Info className="h-4 w-4 text-blue-500" />
                        )}
                        <span>{cnpjMessage}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Status da verificação */}
                  {isCheckingCNPJ && (
                    <div className="mt-2 p-3 rounded-lg text-sm bg-yellow-50 border border-yellow-200 text-yellow-700">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
                        <span>Verificando CNPJ...</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Instruções */}
                  {!cnpjMessage && !isCheckingCNPJ && (
                    <div className="mt-2 p-2 rounded-lg text-xs bg-gray-50 border border-gray-200 text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Info className="h-3 w-3 text-gray-500" />
                        <span>Digite o CNPJ completo para verificar se já está cadastrado</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="razaoSocial" className="block text-sm font-bold text-gray-600 tracking-wide mb-2">
                    Nome da Empresa *
                    {cnpjExists === true && (
                      <span className="ml-2 text-xs text-green-600 font-normal">
                        (Preenchido automaticamente)
                      </span>
                    )}
                  </label>
                  <input
                    id="razaoSocial"
                    type="text"
                    value={companyData.razao_social}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, razao_social: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                      cnpjExists === true
                        ? 'border-green-300 bg-green-50 focus:ring-green-500 focus:border-green-500'
                        : 'border-gray-300 bg-gray-50 focus:ring-[#2f4a8c] focus:border-[#2f4a8c] hover:border-[#1d335b] focus:bg-gray-100'
                    }`}
                    placeholder="Nome da sua empresa"
                    required
                    disabled={cnpjExists === true}
                  />
                </div>

                <div>
                  <label htmlFor="nomeFantasia" className="block text-sm font-bold text-gray-600 tracking-wide mb-2">
                    Nome Fantasia
                    {cnpjExists === true && (
                      <span className="ml-2 text-xs text-green-600 font-normal">
                        (Preenchido automaticamente)
                      </span>
                    )}
                  </label>
                  <input
                    id="nomeFantasia"
                    type="text"
                    value={companyData.nome_fantasia}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, nome_fantasia: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                      cnpjExists === true
                        ? 'border-green-300 bg-green-50 focus:ring-green-500 focus:border-green-500'
                        : 'border-gray-300 bg-gray-50 focus:ring-[#2f4a8c] focus:border-[#2f4a8c] hover:border-[#1d335b] focus:bg-gray-100'
                    }`}
                    placeholder="Nome fantasia da empresa (opcional)"
                    disabled={cnpjExists === true}
                  />
                </div>

                <div>
                  <label htmlFor="endereco" className="block text-sm font-bold text-gray-600 tracking-wide mb-2">
                    Endereço *
                    {cnpjExists === true && (
                      <span className="ml-2 text-xs text-green-600 font-normal">
                        (Preenchido automaticamente)
                      </span>
                    )}
                  </label>
                  <input
                    id="endereco"
                    type="text"
                    value={companyData.endereco}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, endereco: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                      cnpjExists === true
                        ? 'border-green-300 bg-green-50 focus:ring-green-500 focus:border-green-500'
                        : 'border-gray-300 bg-gray-50 focus:ring-[#2f4a8c] focus:border-[#2f4a8c] hover:border-[#1d335b] focus:bg-gray-100'
                    }`}
                    placeholder="Endereço completo"
                    required
                    disabled={cnpjExists === true}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cidade" className="block text-sm font-bold text-gray-600 tracking-wide mb-2">
                      Cidade *
                      {cnpjExists === true && (
                        <span className="ml-2 text-xs text-green-600 font-normal">
                          (Preenchido automaticamente)
                        </span>
                      )}
                    </label>
                    <input
                      id="cidade"
                      type="text"
                      value={companyData.cidade}
                      onChange={(e) => setCompanyData(prev => ({ ...prev, cidade: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                        cnpjExists === true
                          ? 'border-green-300 bg-green-50 focus:ring-green-500 focus:border-green-500'
                          : 'border-gray-300 bg-gray-50 focus:ring-[#2f4a8c] focus:border-[#2f4a8c] hover:border-[#1d335b] focus:bg-gray-100'
                      }`}
                      placeholder="Cidade"
                      required
                      disabled={cnpjExists === true}
                    />
                  </div>

                  <div>
                    <label htmlFor="estado" className="block text-sm font-bold text-gray-600 tracking-wide mb-2">
                      Estado *
                      {cnpjExists === true && (
                        <span className="ml-2 text-xs text-green-600 font-normal">
                          (Preenchido automaticamente)
                        </span>
                      )}
                    </label>
                    <input
                      id="estado"
                      type="text"
                      value={companyData.estado}
                      onChange={(e) => setCompanyData(prev => ({ ...prev, estado: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                        cnpjExists === true
                          ? 'border-green-300 bg-green-50 focus:ring-green-500 focus:border-green-500'
                          : 'border-gray-300 bg-gray-50 focus:ring-[#2f4a8c] focus:border-[#2f4a8c] hover:border-[#1d335b] focus:bg-gray-100'
                      }`}
                      placeholder="UF"
                      maxLength={2}
                      required
                      disabled={cnpjExists === true}
                    />
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex space-x-4">
                  {cnpjExists === true && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200 font-medium"
                    >
                      Novo Cadastro
                    </button>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isLoading || cnpjExists === true}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium text-lg shadow-lg transition-all duration-200 ${
                      cnpjExists === true
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#1d335b] to-[#2f4a8c] text-white hover:from-[#2f4a8c] hover:to-[#1d335b] focus:outline-none focus:ring-2 focus:ring-[#2f4a8c] focus:ring-offset-2 hover:shadow-xl transform hover:-translate-y-0.5'
                    }`}
                  >
                    {isLoading ? 'Cadastrando...' : (
                      <>
                        Cadastrar Empresa
                        <ArrowRight className="inline-block w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Aba Usuário */}
            {activeTab === 'user' && (
              <form onSubmit={handleUserSubmit} className="space-y-6">
                <div>
                  <label htmlFor="userName" className="block text-sm font-bold text-gray-600 tracking-wide mb-2">
                    Nome Completo *
                  </label>
                  <input
                    id="userName"
                    type="text"
                    value={userData.nome}
                    onChange={(e) => setUserData(prev => ({ ...prev, nome: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2f4a8c] focus:border-[#2f4a8c] hover:border-[#1d335b] bg-gray-50 focus:bg-gray-100 transition-all duration-200"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="userEmail" className="block text-sm font-bold text-gray-600 tracking-wide mb-2">
                    E-mail *
                  </label>
                  <input
                    id="userEmail"
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2f4a8c] focus:border-[#2f4a8c] hover:border-[#1d335b] bg-gray-50 focus:bg-gray-100 transition-all duration-200"
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="userPassword" className="block text-sm font-bold text-gray-600 tracking-wide mb-2">
                    Senha *
                  </label>
                  <input
                    id="userPassword"
                    type="password"
                    value={userData.senha}
                    onChange={(e) => setUserData(prev => ({ ...prev, senha: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2f4a8c] focus:border-[#2f4a8c] hover:border-[#1d335b] bg-gray-50 focus:bg-gray-100 transition-all duration-200"
                    placeholder="Sua senha"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-600 tracking-wide mb-2">
                    Confirmar Senha *
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={userData.confirmPassword}
                    onChange={(e) => setUserData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2f4a8c] focus:border-[#2f4a8c] hover:border-[#1d335b] bg-gray-50 focus:bg-gray-100 transition-all duration-200"
                    placeholder="Confirme sua senha"
                    required
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('company')}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200 font-medium"
                  >
                    <ArrowLeft className="inline-block w-5 h-5 mr-2" />
                    Voltar
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-[#1d335b] to-[#2f4a8c] text-white py-3 px-4 rounded-xl hover:from-[#2f4a8c] hover:to-[#1d335b] focus:outline-none focus:ring-2 focus:ring-[#2f4a8c] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {isLoading ? 'Cadastrando...' : 'Finalizar Cadastro'}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{" "}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-[#2f4a8c] hover:text-[#1d335b] font-medium transition-colors duration-200"
                >
                  Faça login aqui
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
