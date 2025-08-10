import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useData } from '@/contexts/DataContext';
import { Upload as UploadIcon, FileSpreadsheet, CheckCircle, AlertCircle, Users, Building2, TrendingUp } from 'lucide-react';
import { UploadFile, Employee } from '@/types';
import * as XLSX from 'xlsx';
import type { ProcessedData } from '@/contexts/DataContext';



const Upload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { processedData, setProcessedData } = useData();

  // Função para validar CPF
  const validateCPF = (cpf: string): boolean => {
    // Remove todos os caracteres não numéricos
    const cleanCPF = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cleanCPF.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais (CPF inválido conhecido)
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
    
    return true;
  };

  // Função para validar email
  const validateEmail = (email: string): boolean => {
    // Remove espaços em branco
    const cleanEmail = email.trim();
    
    // Regex mais flexível para email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(cleanEmail);
  };

  // Função para validar telefone
  const validatePhone = (phone: string): boolean => {
    if (!phone) return true;
    const phoneRegex = /^[\d\s\-\(\)\+]+$/;
    return phoneRegex.test(phone);
  };

  const processFile = async (file: File): Promise<ProcessedData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Pega a primeira planilha
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Converte para JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length < 2) {
            reject(new Error('Arquivo vazio ou sem dados'));
            return;
          }
          
          // Primeira linha são os cabeçalhos
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1) as any[][];
          
          const employees: Employee[] = [];
          const errors: Array<{ row: number; field: string; message: string }> = [];
          
          rows.forEach((row, index) => {
            const rowNumber = index + 2; // +2 porque começamos da linha 2 (linha 1 é cabeçalho)
            
            // Cria um objeto com os dados da linha
            const rowData: any = {};
            headers.forEach((header, colIndex) => {
              const value = row[colIndex];
              
              // Converte datas do Excel durante o processamento
              const dateColumns = [
                'Data Nascimento', 'DATA NASCIMENTO', 'data nascimento', 'DataNascimento', 'Birth Date', 'BIRTH DATE',
                'Data Admissão', 'DATA ADMISSÃO', 'data admissão', 'DataAdmissao', 'Admission Date', 'ADMISSION DATE',
                'Data Afastamento', 'DATA AFASTAMENTO', 'data afastamento', 'DataAfastamento', 'Leave Date', 'LEAVE DATE',
                'Data', 'DATA', 'data', 'Date', 'DATE'
              ];
              
                             if (dateColumns.some(dateCol => header.toLowerCase().includes(dateCol.toLowerCase()))) {
                 // Converte número do Excel para data
                 if (typeof value === 'number') {
                   // Excel usa 1 de janeiro de 1900 como dia 1, mas com correção para ano bissexto
                   // Para datas após 28/02/1900, Excel considera 1900 como ano bissexto (erro histórico)
                   const excelEpoch = new Date(1900, 0, 1);
                   let daysToAdd = value - 1;
                   
                   // Se a data é após 28/02/1900, ajusta para o erro do Excel
                   if (value > 59) {
                     daysToAdd = value - 2; // Remove o dia extra que Excel adiciona incorretamente
                   }
                   
                   const date = new Date(excelEpoch.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
                   
                   if (!isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
                     rowData[header] = date.toLocaleDateString('pt-BR');
                   } else {
                     rowData[header] = value;
                   }
                 } else {
                   rowData[header] = value;
                 }
               } else {
                 rowData[header] = value;
               }
            });
            
                      // Debug: mostra os dados da primeira linha para verificar a estrutura
          if (index === 0) {
            console.log('=== DEBUG PRIMEIRA LINHA ===');
            console.log('Primeira linha de dados:', rowData);
            console.log('Headers encontrados:', headers);
            console.log('Valores da primeira linha:', Object.entries(rowData));
            console.log('Colunas que serão processadas dinamicamente:', headers.filter(header => 
              !['Nome', 'CPF', 'Email', 'Telefone', 'Endereço', 'Cidade', 'Estado', 'CEP', 'Cargo', 'Departamento', 'Empresa', 'Data de Admissão', 'Salário'].includes(header)
            ));
            
            // Debug específico para datas
            const dateColumns = [
              'Data Nascimento', 'DATA NASCIMENTO', 'data nascimento', 'DataNascimento', 'Birth Date', 'BIRTH DATE',
              'Data Admissão', 'DATA ADMISSÃO', 'data admissão', 'DataAdmissao', 'Admission Date', 'ADMISSION DATE',
              'Data Afastamento', 'DATA AFASTAMENTO', 'data afastamento', 'DataAfastamento', 'Leave Date', 'LEAVE DATE',
              'Data', 'DATA', 'data', 'Date', 'DATE'
            ];
            
                         console.log('=== DEBUG CONVERSÃO DE DATAS ===');
             headers.forEach((header, colIndex) => {
               const value = row[colIndex];
               if (dateColumns.some(dateCol => header.toLowerCase().includes(dateCol.toLowerCase()))) {
                 console.log(`Coluna de data detectada: ${header} = ${value} (tipo: ${typeof value})`);
                 if (typeof value === 'number') {
                   const excelEpoch = new Date(1900, 0, 1);
                   let daysToAdd = value - 1;
                   
                   // Se a data é após 28/02/1900, ajusta para o erro do Excel
                   if (value > 59) {
                     daysToAdd = value - 2; // Remove o dia extra que Excel adiciona incorretamente
                   }
                   
                   const date = new Date(excelEpoch.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
                   console.log(`Convertendo número Excel ${value} para data: ${date.toLocaleDateString('pt-BR')} (dias adicionados: ${daysToAdd})`);
                 }
               }
             });
            console.log('============================');
          }

          // Verifica se a linha tem dados válidos
          const hasValidData = Object.values(rowData).some(value => 
            value !== undefined && value !== null && value.toString().trim() !== ''
          );

          if (!hasValidData) {
            console.log(`Linha ${index + 1} ignorada - sem dados válidos`);
            return; // Pula linhas vazias
          }
            
            // Validações básicas
            const validationErrors: string[] = [];
            
            // Validação de nome (flexível - procura por colunas que podem conter o nome)
            const nameColumns = ['Nome', 'Name', 'NOME', 'NAME', 'Funcionário', 'FUNCIONARIO', 'Employee', 'EMPLOYEE'];
            const hasName = nameColumns.some(col => rowData[col] && rowData[col].toString().trim());
            
            // Debug para validação de nome
            if (index === 0) {
              console.log('=== DEBUG VALIDAÇÃO NOME ===');
              console.log('Colunas de nome procuradas:', nameColumns);
              console.log('Colunas disponíveis:', Object.keys(rowData));
              console.log('Tem nome?', hasName);
              console.log('Valores encontrados para nome:', nameColumns.map(col => ({ coluna: col, valor: rowData[col] })));
              console.log('============================');
            }
            
            if (!hasName) {
              // Se não encontrou uma coluna de nome específica, verifica se há pelo menos um campo com dados
              const hasAnyData = Object.values(rowData).some(value => 
                value !== undefined && value !== null && value.toString().trim() !== ''
              );
              
              if (!hasAnyData) {
                validationErrors.push('Pelo menos um campo deve conter dados');
              } else {
                // Se tem dados mas não tem nome específico, aceita mesmo assim
                console.log(`Linha ${rowNumber}: Aceitando registro sem nome específico, mas com dados válidos`);
              }
            }
            
            // Validação de CPF (flexível - procura por diferentes nomes de coluna)
            const cpfColumns = ['CPF', 'cpf', 'Cpf', 'Documento', 'DOCUMENTO', 'Document', 'DOCUMENT'];
            const cpfValue = cpfColumns.find(col => rowData[col] && rowData[col].toString().trim());
            if (cpfValue && cpfValue.toString().trim() && !validateCPF(cpfValue.toString().trim())) {
              validationErrors.push('CPF inválido');
            }
            
            // Validação de email (flexível - procura por diferentes nomes de coluna)
            const emailColumns = ['Email', 'EMAIL', 'email', 'E-mail', 'E-MAIL', 'e-mail', 'Mail', 'MAIL'];
            const emailValue = emailColumns.find(col => rowData[col] && rowData[col].toString().trim());
            if (emailValue && emailValue.toString().trim() && !validateEmail(emailValue.toString().trim())) {
              validationErrors.push('Email inválido');
            }
            
            // Validação de telefone (flexível - procura por diferentes nomes de coluna)
            const phoneColumns = ['Telefone', 'TELEFONE', 'telefone', 'Phone', 'PHONE', 'Celular', 'CELULAR', 'Fone', 'FONE'];
            const phoneValue = phoneColumns.find(col => rowData[col] && rowData[col].toString().trim());
            if (phoneValue && phoneValue.toString().trim() && !validatePhone(phoneValue.toString().trim())) {
              validationErrors.push('Telefone inválido');
            }
            
            // Se há erros de validação, adiciona aos erros
            if (validationErrors.length > 0) {
              validationErrors.forEach(error => {
                errors.push({
                  row: rowNumber,
                  field: 'Dados',
                  message: error
                });
              });
            } else {
              // Cria um objeto dinâmico com todos os dados da linha
              const employee: any = {
                id: `emp_${Date.now()}_${index}`,
                status: 'active',
                lastUpdate: new Date().toISOString()
              };

              // Adiciona todos os dados da linha como propriedades dinâmicas
              headers.forEach(header => {
                const value = rowData[header];
                if (value !== undefined && value !== null) {
                  employee[header] = value.toString().trim();
                } else {
                  employee[header] = '';
                }
                console.log(`Adicionando coluna: ${header} = ${employee[header]}`);
              });
              
              employees.push(employee);
            }
          });
          
          // Verifica se há funcionários processados
          console.log(`=== RESUMO DO PROCESSAMENTO ===`);
          console.log(`Total de linhas no arquivo: ${rows.length}`);
          console.log(`Funcionários processados: ${employees.length}`);
          console.log(`Erros encontrados: ${errors.length}`);
          console.log(`Taxa de sucesso: ${rows.length > 0 ? ((employees.length / rows.length) * 100).toFixed(1) : 0}%`);
          
          if (employees.length === 0) {
            console.log('⚠️ Nenhum funcionário foi processado. Verificando dados...');
            console.log('Headers:', headers);
            console.log('Primeira linha:', rows[0]);
            console.log('Primeiros 3 erros:', errors.slice(0, 3));
          }
          console.log(`==============================`);

          // Calcula estatísticas
          const companies = [...new Set(employees.map(emp => emp.company).filter(Boolean))] as string[];
          const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))] as string[];
          const averageSalary = employees.length > 0 
            ? employees.reduce((sum, emp) => sum + (emp.salary || 0), 0) / employees.length 
            : 0;
          
          const result = {
            employees,
            columns: headers,
            summary: {
              totalRecords: rows.length,
              validRecords: employees.length,
              invalidRecords: errors.length,
              companies,
              departments,
              averageSalary
            },
            errors,
            uploadedAt: new Date().toISOString(),
            fileName: file.name
          };

          console.log('Resultado final do processamento:', result);
          resolve(result);
          
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    
    for (const file of acceptedFiles) {
      try {
        // Simular upload
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const uploadedFile: UploadFile = {
          id: Date.now().toString(),
          filename: file.name,
          originalName: file.name,
          size: file.size,
          status: 'processing',
          uploadedAt: new Date().toISOString(),
          totalRecords: 0,
          processedRecords: 0
        };

        setUploadedFiles(prev => [...prev, uploadedFile]);

        // Processar arquivo
        setIsProcessing(true);
        const data = await processFile(file);
        
        // Atualizar arquivo com status concluído
        setUploadedFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, status: 'completed', processedAt: new Date().toISOString(), totalRecords: data.summary.totalRecords, processedRecords: data.summary.validRecords }
            : f
        ));

        // Armazenar dados processados na memória
        const processedDataToSave = {
          ...data,
          uploadedAt: new Date().toISOString(),
          fileName: file.name
        };
        
        console.log('Dados processados para salvar:', processedDataToSave);
        console.log('Total de funcionários processados:', data.employees.length);
        console.log('Colunas detectadas:', data.columns);
        console.log('Primeiro funcionário:', data.employees[0]);
        console.log('Colunas do primeiro funcionário:', data.employees[0] ? Object.keys(data.employees[0]) : 'Nenhum funcionário processado');
        
        setProcessedData(processedDataToSave);
        
      } catch (error) {
        console.error('Erro ao processar arquivo:', error);
        setUploadedFiles(prev => prev.map(f => 
          f.filename === file.name 
            ? { ...f, status: 'error', errorMessage: error instanceof Error ? error.message : 'Erro ao processar arquivo' }
            : f
        ));
      }
    }
    
    setIsUploading(false);
    setIsProcessing(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    multiple: true
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5" style={{ color: '#22c55e' }} />;
      case 'error':
        return <AlertCircle className="h-5 w-5" style={{ color: '#ef4444' }} />;
      case 'processing':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: '#1d335b' }}></div>;
      default:
        return <div className="h-5 w-5 bg-gray-300 rounded-full"></div>;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'processing':
        return 'Processando';
      case 'completed':
        return 'Concluído';
      case 'error':
        return 'Erro';
      default:
        return status;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para formatar matrícula no formato X.XXX.XXX-X
  const formatMatricula = (value: string | number): string => {
    if (!value) return '-';
    
    // Remove todos os caracteres não numéricos
    const cleanValue = value.toString().replace(/\D/g, '');
    
    // Se tem menos de 8 dígitos, retorna como está
    if (cleanValue.length < 8) return value.toString();
    
    // Formata no padrão X.XXX.XXX-X
    const formatted = cleanValue.replace(/^(\d{1})(\d{3})(\d{3})(\d{1})$/, '$1.$2.$3-$4');
    
    console.log(`formatMatricula: ${value} → ${cleanValue} → ${formatted}`);
    
    return formatted;
  };

  // Função para formatar mês/ano no formato AAAAMM para MM/AAAA
  const formatMonthYear = (value: string | number): string => {
    if (!value) return '-';
    
    const valueStr = value.toString();
    
    // Verifica se é um número no formato AAAAMM (6 dígitos)
    if (valueStr.length === 6 && /^\d{6}$/.test(valueStr)) {
      const year = valueStr.substring(0, 4);
      const month = valueStr.substring(4, 6);
      
      // Valida se o mês está entre 01 e 12
      const monthNum = parseInt(month, 10);
      if (monthNum >= 1 && monthNum <= 12) {
        const formatted = `${month}/${year}`;
        console.log(`formatMonthYear: ${value} → ${formatted}`);
        return formatted;
      }
    }
    
    // Se não for no formato esperado, retorna o valor original
    return valueStr;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1d335b' }}>Upload de Arquivos</h1>
        <p className="text-gray-600">
          Faça upload de arquivos Excel (.xlsx, .xls) ou CSV com dados dos filiados
        </p>
      </div>

      {/* Upload Area */}
      <div className="card">
        <div className="card-content">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Solte os arquivos aqui' : 'Arraste arquivos aqui ou clique para selecionar'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Suporta arquivos Excel (.xlsx, .xls) e CSV
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {(isUploading || isProcessing) && (
        <div className="card">
          <div className="card-content">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: '#1d335b' }}></div>
              <span className="text-sm font-medium text-gray-700">
                {isUploading ? 'Fazendo upload dos arquivos...' : 'Processando dados...'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Detected Columns */}
      {processedData && processedData.columns && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Estrutura do Arquivo Detectada</h3>
            <p className="text-sm text-gray-600 mt-1">
              Análise das colunas e tipos de dados encontrados no arquivo
            </p>
          </div>
          <div className="card-content">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Colunas Detectadas ({processedData.columns.length})</h4>
              <div className="flex flex-wrap gap-2">
                {processedData.columns.map((column, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                  >
                    {column}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Processed Data Summary */}
      {processedData && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Análise Detalhada dos Dados</h3>
            <p className="text-sm text-gray-600 mt-1">
              Informações detalhadas para auxiliar na estruturação do banco de dados
            </p>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <Users className="h-8 w-8" style={{ color: '#1d335b' }} />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total de Registros</p>
                    <p className="text-2xl font-bold" style={{ color: '#1d335b' }}>{processedData.summary.totalRecords.toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8" style={{ color: '#22c55e' }} />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Registros Válidos</p>
                    <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>{processedData.summary.validRecords.toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center">
                  <AlertCircle className="h-8 w-8" style={{ color: '#ef4444' }} />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Registros com Erro</p>
                    <p className="text-2xl font-bold" style={{ color: '#ef4444' }}>{processedData.summary.invalidRecords.toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8" style={{ color: '#8b5cf6' }} />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Taxa de Sucesso</p>
                    <p className="text-2xl font-bold" style={{ color: '#8b5cf6' }}>
                      {processedData.summary.totalRecords > 0 
                        ? ((processedData.summary.validRecords / processedData.summary.totalRecords) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>



            {/* Companies and Departments */}
            {processedData.summary.companies.length > 0 && processedData.summary.departments.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Empresas Encontradas</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {processedData.summary.companies.map((company, index) => (
                      <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                        <Building2 className="h-4 w-4 mr-2" style={{ color: '#1d335b' }} />
                        <span className="text-sm text-gray-700">{company}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Departamentos Encontrados</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {processedData.summary.departments.map((dept, index) => (
                      <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                        <Users className="h-4 w-4 mr-2" style={{ color: '#1d335b' }} />
                        <span className="text-sm text-gray-700">{dept}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Análise de Qualidade dos Dados */}
      {processedData && processedData.errors && processedData.errors.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Análise de Qualidade dos Dados</h3>
            <p className="text-sm text-gray-600 mt-1">
              Detalhes sobre erros encontrados durante o processamento
            </p>
          </div>
          <div className="card-content">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <AlertCircle className="h-5 w-5 mr-2" style={{ color: '#ef4444' }} />
                <span className="text-sm font-medium text-red-800">
                  {processedData.errors.length} erros encontrados
                </span>
              </div>
              <div className="text-sm text-red-700 space-y-2 max-h-40 overflow-y-auto">
                {processedData.errors.slice(0, 10).map((error, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded mr-2">
                      Linha {error.row}
                    </span>
                    <span>{error.message}</span>
                  </div>
                ))}
                {processedData.errors.length > 10 && (
                  <p className="text-xs text-red-600">
                    ... e mais {processedData.errors.length - 10} erros
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Amostra dos Primeiros 5 Registros */}
      {processedData && processedData.employees && processedData.employees.length > 0 && processedData.columns && processedData.columns.length > 0 ? (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Prévia dos Dados - Primeiros 5 Registros</h3>
            <p className="text-sm text-gray-600 mt-1">
              Visualização dos dados carregados para análise da estrutura
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {processedData.columns.length.toLocaleString('pt-BR')} colunas detectadas
              </span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                {processedData.employees.length.toLocaleString('pt-BR')} registros válidos
              </span>
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                Arquivo: {processedData.fileName}
              </span>
            </div>
          </div>
          <div className="card-content">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {/* Todas as colunas do arquivo */}
                    {processedData.columns.map((column) => (
                      <th key={column} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {processedData.employees.slice(0, 5).map((employee, index) => {
                    // Debug: Log das colunas e valores para o primeiro registro
                    if (index === 0) {
                      console.log('=== DEBUG TABELA AMOSTRA ===');
                      console.log('Colunas do arquivo:', processedData.columns);
                      console.log('Colunas do funcionário:', employee ? Object.keys(employee) : 'Funcionário undefined');
                      console.log('Primeiro funcionário:', employee);
                      console.log('============================');
                    }
                    
                    return (
                      <tr key={employee.id} className="hover:bg-gray-50">
                                                {/* Todas as colunas do arquivo */}
                        {processedData.columns.map((column) => {
                          const value = (employee as any)[column];
                          
                          // Debug para formatação
                          if (index === 0) {
                            console.log(`Coluna: ${column}, Valor: ${value}, Tipo: ${typeof value}`);
                          }
                          
                          // Formatação especial para diferentes tipos de dados
                          let displayValue = value || '-';
                          
                          // Formatação específica para matrícula - PRIORIDADE MÁXIMA
                          const matriculaColumns = [
                            'Matrícula', 'MATRICULA', 'matricula', 'Matricula', 'Registration', 'REGISTRATION',
                            'Matricula', 'MATRÍCULA', 'matrícula', 'Matrícula', 'Registro', 'REGISTRO',
                            'Mat', 'MAT', 'mat', 'Reg', 'REG', 'reg'
                          ];
                          
                          // Colunas que devem ser tratadas como texto puro (sem formatação)
                          const textOnlyColumns = [
                            'Motivo Afastamento', 'MOTIVO AFASTAMENTO', 'motivo afastamento', 'MotivoAfastamento',
                            'Motivo', 'MOTIVO', 'motivo', 'Reason', 'REASON', 'reason',
                            'Descrição', 'DESCRIÇÃO', 'descrição', 'Description', 'DESCRIPTION', 'description',
                            'Observação', 'OBSERVAÇÃO', 'observação', 'Observation', 'OBSERVATION', 'observation',
                            'Comentário', 'COMENTÁRIO', 'comentário', 'Comment', 'COMMENT', 'comment',
                            'Nota', 'NOTA', 'nota', 'Note', 'NOTE', 'note',
                            'Status', 'STATUS', 'status', 'Situação', 'SITUAÇÃO', 'situação',
                            'Tipo', 'TIPO', 'tipo', 'Type', 'TYPE', 'type',
                            'Categoria', 'CATEGORIA', 'categoria', 'Category', 'CATEGORY', 'category',
                            'Lotação', 'LOTAÇÃO', 'lotação', 'Lotacao', 'LOTACAO', 'lotacao', 'Location', 'LOCATION', 'location',
                            'Setor', 'SETOR', 'setor', 'Sector', 'SECTOR', 'sector',
                            'Área', 'AREA', 'area', 'Area', 'AREA', 'area',
                            'Cargo', 'CARGO', 'cargo', 'Position', 'POSITION', 'position', 'Job', 'JOB', 'job',
                            'Função', 'FUNÇÃO', 'função', 'Function', 'FUNCTION', 'function',
                            'Departamento', 'DEPARTAMENTO', 'departamento', 'Department', 'DEPARTMENT', 'department',
                            'Divisão', 'DIVISÃO', 'divisão', 'Division', 'DIVISION', 'division',
                            'Gerência', 'GERÊNCIA', 'gerência', 'Management', 'MANAGEMENT', 'management',
                            'Coordenação', 'COORDENAÇÃO', 'coordenação', 'Coordination', 'COORDINATION', 'coordination',
                            'Centro de Custo', 'CENTRO DE CUSTO', 'centro de custo', 'Cost Center', 'COST CENTER', 'cost center',
                            'Código', 'CÓDIGO', 'código', 'Code', 'CODE', 'code',
                            'Referência', 'REFERÊNCIA', 'referência', 'Reference', 'REFERENCE', 'reference',
                            'Identificação', 'IDENTIFICAÇÃO', 'identificação', 'Identification', 'IDENTIFICATION', 'identification',
                            'Número', 'NÚMERO', 'número', 'Number', 'NUMBER', 'number',
                            'Sequencial', 'SEQUENCIAL', 'sequencial', 'Sequential', 'SEQUENTIAL', 'sequential',
                            'Ordem', 'ORDEM', 'ordem', 'Order', 'ORDER', 'order',
                            'Classificação', 'CLASSIFICAÇÃO', 'classificação', 'Classification', 'CLASSIFICATION', 'classification',
                            'Grupo', 'GRUPO', 'grupo', 'Group', 'GROUP', 'group',
                            'Subgrupo', 'SUBGRUPO', 'subgrupo', 'Subgroup', 'SUBGROUP', 'subgroup',
                            'Filiação', 'FILIAÇÃO', 'filiação', 'Affiliation', 'AFFILIATION', 'affiliation',
                            'Vínculo', 'VÍNCULO', 'vínculo', 'Bond', 'BOND', 'bond',
                            'Contrato', 'CONTRATO', 'contrato', 'Contract', 'CONTRACT', 'contract',
                            'Modalidade', 'MODALIDADE', 'modalidade', 'Modality', 'MODALITY', 'modality',
                            'Regime', 'REGIME', 'regime', 'Regime', 'REGIME', 'regime',
                            'Jornada', 'JORNADA', 'jornada', 'Journey', 'JOURNEY', 'journey',
                            'Turno', 'TURNO', 'turno', 'Shift', 'SHIFT', 'shift',
                            'Horário', 'HORÁRIO', 'horário', 'Schedule', 'SCHEDULE', 'schedule',
                            'Local', 'LOCAL', 'local', 'Place', 'PLACE', 'place',
                            'Endereço', 'ENDEREÇO', 'endereço', 'Address', 'ADDRESS', 'address',
                            'Bairro', 'BAIRRO', 'bairro', 'Neighborhood', 'NEIGHBORHOOD', 'neighborhood',
                            'Cidade', 'CIDADE', 'cidade', 'City', 'CITY', 'city',
                            'Estado', 'ESTADO', 'estado', 'State', 'STATE', 'state',
                            'CEP', 'cep', 'Zip', 'ZIP', 'zip', 'Postal', 'POSTAL', 'postal',
                            'Telefone', 'TELEFONE', 'telefone', 'Phone', 'PHONE', 'phone', 'Tel', 'TEL', 'tel',
                            'Celular', 'CELULAR', 'celular', 'Mobile', 'MOBILE', 'mobile', 'Cell', 'CELL', 'cell',
                            'Email', 'EMAIL', 'email', 'E-mail', 'E-MAIL', 'e-mail', 'Mail', 'MAIL', 'mail',
                            'CPF', 'cpf', 'Cpf', 'Document', 'DOCUMENT', 'document',
                            'RG', 'rg', 'Rg', 'Identity', 'IDENTITY', 'identity',
                            'PIS', 'pis', 'Pis', 'PIS', 'pis',
                            'CTPS', 'ctps', 'Ctps', 'CTPS', 'ctps',
                            'Título', 'TÍTULO', 'título', 'Title', 'TITLE', 'title',
                            'Zona', 'ZONA', 'zona', 'Zone', 'ZONE', 'zone',
                            'Seção', 'SEÇÃO', 'seção', 'Section', 'SECTION', 'section',
                            'Observação', 'OBSERVAÇÃO', 'observação', 'Observation', 'OBSERVATION', 'observation',
                            'Observações', 'OBSERVAÇÕES', 'observações', 'Observations', 'OBSERVATIONS', 'observations'
                          ];
                          
                          // Formatação específica para campos de mês/ano - PRIORIDADE MÁXIMA
                          const monthYearColumns = [
                            'Mês', 'MES', 'mes', 'Month', 'MONTH', 'month',
                            'Mês/Ano', 'MES/ANO', 'mes/ano', 'Month/Year', 'MONTH/YEAR', 'month/year',
                            'Período', 'PERIODO', 'periodo', 'Period', 'PERIOD', 'period',
                            'Referência', 'REFERENCIA', 'referencia', 'Reference', 'REFERENCE', 'reference'
                          ];
                          
                          if (monthYearColumns.some(col => column.toLowerCase().includes(col.toLowerCase()))) {
                            if (index === 0) {
                              console.log(`Formatando mês/ano: ${column} = ${value} → ${formatMonthYear(value)}`);
                            }
                            displayValue = formatMonthYear(value);
                          }
                          // Formatação específica para matrícula
                          else if (matriculaColumns.includes(column)) {
                            if (index === 0) {
                              console.log(`Formatando matrícula: ${column} = ${value} → ${formatMatricula(value)}`);
                            }
                            displayValue = formatMatricula(value);
                          }
                          // Colunas de texto puro - PRIORIDADE ALTA
                          else if (textOnlyColumns.includes(column)) {
                            // Mantém o valor original sem formatação
                            displayValue = value || '-';
                            
                            if (index === 0) {
                              console.log(`Mantendo como texto puro: ${column} = ${value}`);
                            }
                          }
                          // Formatação específica para campos de data
                          else {
                            const dateColumns = [
                              'Data Nascimento', 'DATA NASCIMENTO', 'data nascimento', 'DataNascimento', 'Birth Date', 'BIRTH DATE',
                              'Data Admissão', 'DATA ADMISSÃO', 'data admissão', 'DataAdmissao', 'Admission Date', 'ADMISSION DATE',
                              'Data Afastamento', 'DATA AFASTAMENTO', 'data afastamento', 'DataAfastamento', 'Leave Date', 'LEAVE DATE',
                              'Data', 'DATA', 'data', 'Date', 'DATE'
                            ];
                            if (dateColumns.includes(column)) {
                              try {
                                // Como as datas já foram convertidas durante o processamento, apenas exibe o valor
                                displayValue = value;
                                
                                if (index === 0) {
                                  console.log(`Formatando data: ${column} = ${value} → ${displayValue}`);
                                }
                              } catch (error) {
                                console.log(`Erro ao formatar data ${column}:`, error);
                                displayValue = value;
                              }
                            }
                            // Formatação específica para campos de valor/moeda
                            else {
                              const currencyColumns = [
                                'Valor Mensalidade', 'VALOR MENSALIDADE', 'valor mensalidade', 'ValorMensalidade',
                                'Mensalidade', 'MENSALIDADE', 'mensalidade',
                                'Valor', 'VALOR', 'valor', 'Price', 'PRICE', 'price',
                                'Salário', 'SALARIO', 'salario', 'Salary', 'SALARY', 'salary',
                                'Remuneração', 'REMUNERACAO', 'remuneracao', 'Remuneration', 'REMUNERATION'
                              ];
                              
                              if (currencyColumns.includes(column)) {
                                const numValue = typeof value === 'number' ? value : Number(value.toString().replace(/[^\d.,]/g, ''));
                                if (!isNaN(numValue)) {
                                  if (index === 0) {
                                    console.log(`Formatando como moeda: ${column} = ${value} → ${formatCurrency(numValue)}`);
                                  }
                                  displayValue = formatCurrency(numValue);
                                }
                              }
                              // Se o valor parece ser um número (salário, etc.) - mas não é matrícula nem data nem valor específico
                              else if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value.replace(/[^\d.,]/g, ''))))) {
                                const numValue = typeof value === 'number' ? value : Number(value.replace(/[^\d.,]/g, ''));
                                
                                // Verifica se não é um campo de mês/ano (formato AAAAMM)
                                const isMonthYearField = monthYearColumns.some(col => column.toLowerCase().includes(col.toLowerCase()));
                                const isMonthYearValue = value.toString().length === 6 && /^\d{6}$/.test(value.toString());
                                
                                if (numValue > 1000 && !isMonthYearField && !isMonthYearValue) { // Provavelmente é um salário
                                  if (index === 0) {
                                    console.log(`Formatando como moeda genérica: ${column} = ${value} → ${formatCurrency(numValue)}`);
                                  }
                                  displayValue = formatCurrency(numValue);
                                }
                              }
                            }
                          }
                          
                          return (
                            <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {displayValue}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Mostrando 5 de {processedData.employees.length.toLocaleString('pt-BR')} registros processados
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Para ver todos os registros, acesse a página de Filiados
              </p>
            </div>
            
            {/* Recomendações para Estrutura do Banco */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">
                💡 Recomendações para Estrutura do Banco de Dados
              </h4>
              <div className="text-xs text-yellow-700 space-y-1">
                <p>• <strong>Tabela Principal:</strong> Considerar uma tabela flexível para os dados dinâmicos</p>
                <p>• <strong>Colunas Identificadas:</strong> {processedData.columns.length} campos diferentes detectados</p>
                <p>• <strong>Dados Únicos:</strong> {processedData.summary.companies.length} empresas, {processedData.summary.departments.length} departamentos</p>
                <p>• <strong>Volume:</strong> {processedData.employees.length} registros válidos para análise</p>
                <p>• <strong>Próximo Passo:</strong> Analise os dados acima e defina a estrutura ideal para seu banco</p>
              </div>
            </div>
          </div>
        </div>
      ) : processedData && (
        <div className="card">
          <div className="card-content">
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum registro processado
              </h4>
              <p className="text-gray-500">
                O arquivo foi carregado, mas nenhum registro válido foi encontrado. Verifique se o arquivo contém dados.
              </p>
              <div className="mt-4 text-sm text-gray-400">
                <p>Total de linhas no arquivo: {processedData.summary?.totalRecords || 0}</p>
                <p>Registros válidos: {processedData.summary?.validRecords || 0}</p>
                <p>Erros encontrados: {processedData.summary?.invalidRecords || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Arquivos Enviados</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileSpreadsheet className="h-8 w-8" style={{ color: '#1d335b' }} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.originalName}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)} • Enviado em {new Date(file.uploadedAt).toLocaleString('pt-BR')}
                      </p>
                      {file.totalRecords && (
                        <p className="text-xs text-gray-500">
                          {file.processedRecords} de {file.totalRecords} registros processados
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(file.status)}
                      <span className="text-sm font-medium text-gray-700">
                        {getStatusText(file.status)}
                      </span>
                    </div>
                    {file.errorMessage && (
                      <span className="text-xs" style={{ color: '#ef4444' }}>{file.errorMessage}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Upload;
