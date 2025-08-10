import { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Search, Download, Eye, Edit, Trash, Filter, ChevronUp, ChevronDown } from 'lucide-react';

const Employees = () => {
  const { processedData, hasData } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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
        return `${month}/${year}`;
      }
    }
    
    // Se não for no formato esperado, retorna o valor original
    return valueStr;
  };

  // Função para ordenar os dados
  const sortData = (data: any[], column: string, direction: 'asc' | 'desc') => {
    return [...data].sort((a, b) => {
      let valueA = (a as any)[column];
      let valueB = (b as any)[column];

      // Se os valores são números, compara numericamente
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return direction === 'asc' ? valueA - valueB : valueB - valueA;
      }

      // Se os valores são strings, compara alfabeticamente
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        const comparison = valueA.localeCompare(valueB, 'pt-BR', { numeric: true });
        return direction === 'asc' ? comparison : -comparison;
      }

      // Converte para string para comparação
      const strA = String(valueA || '');
      const strB = String(valueB || '');
      const comparison = strA.localeCompare(strB, 'pt-BR', { numeric: true });
      return direction === 'asc' ? comparison : -comparison;
    });
  };

  // Função para lidar com a ordenação
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Se clicar na mesma coluna, inverte a direção
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Se clicar em uma nova coluna, define como ascendente
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Volta para a primeira página ao ordenar
  };

  // Filtra os funcionários baseado no termo de busca
  const filteredEmployees = processedData?.employees.filter(emp => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Busca em todas as colunas do arquivo
    return processedData!.columns.some(column => {
      const value = (emp as any)[column];
      if (value) {
        return value.toString().toLowerCase().includes(searchLower);
      }
      return false;
    });
  }) || [];

  // Aplica ordenação aos dados filtrados
  const sortedEmployees = sortColumn 
    ? sortData(filteredEmployees, sortColumn, sortDirection)
    : filteredEmployees;

  // Lógica de paginação
  const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = sortedEmployees.slice(startIndex, endIndex);

  // Reset para primeira página quando mudar a busca ou ordenação
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage, sortColumn, sortDirection]);

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1d335b' }}>Filiados</h1>
          <p className="text-gray-600">Visualize todos os registros do arquivo carregado</p>
        </div>
        
        <div className="card">
          <div className="card-content">
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 text-gray-400 mb-4">📄</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum arquivo carregado
              </h3>
              <p className="text-gray-500 mb-6">
                Para visualizar os filiados, faça upload de um arquivo Excel ou CSV na página de Upload.
              </p>
              <a
                href="/upload"
                className="inline-flex items-center px-4 py-2 rounded-lg text-white font-medium transition-colors"
                style={{ backgroundColor: '#1d335b' }}
              >
                Ir para Upload
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1d335b' }}>Filiados</h1>
          <p className="text-gray-600">
            Visualizando {processedData!.summary.totalRecords.toLocaleString('pt-BR')} registros do arquivo: {processedData!.fileName}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Exibindo {startIndex + 1} a {Math.min(endIndex, sortedEmployees.length)} de {sortedEmployees.length.toLocaleString('pt-BR')} registros do arquivo
          </p>
        </div>
        <button 
          className="btn btn-primary"
          style={{ backgroundColor: '#1d335b' }}
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </button>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar em todas as colunas..."
                  className="input pl-10 h-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Itens por página
              </label>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="input h-10"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
                <option value={1000}>1000</option>
              </select>
            </div>

            <div>
              <button
                onClick={() => setSearchTerm('')}
                className="btn btn-secondary w-full h-10"
                style={{ backgroundColor: '#c9504c', color: 'white' }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpar Filtros
              </button>
            </div>

            <div>
              <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md border border-gray-200 h-10 flex items-center">
                {sortedEmployees.length.toLocaleString('pt-BR')} registros encontrados
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Filiados */}
      <div className="card">
        <div className="card-content">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {/* Todas as colunas do arquivo */}
                  {processedData!.columns.map((column) => (
                    <th 
                      key={column} 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort(column)}
                      title={`Ordenar por ${column}`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{column}</span>
                        <div className="flex flex-col ml-2">
                          {sortColumn === column ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="h-3 w-3 text-red-600" />
                            ) : (
                              <ChevronDown className="h-3 w-3 text-red-600" />
                            )
                          ) : (
                            <div className="flex flex-col">
                              <ChevronUp className="h-3 w-3 text-gray-400" />
                              <ChevronDown className="h-3 w-3 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </th>
                  ))}
                  
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentEmployees.length > 0 ? (
                  currentEmployees.map((employee, index) => (
                    <tr key={employee.id || index} className="hover:bg-gray-50">
                      {/* Todas as colunas do arquivo */}
                      {processedData!.columns.map((column) => {
                        const value = (employee as any)[column];
                        
                        // Formatação especial para diferentes tipos de dados
                        let displayValue = value || '-';
                        
                        // Formatação específica para matrícula - PRIORIDADE MÁXIMA
                        const matriculaColumns = [
                          'Matrícula', 'MATRICULA', 'matricula', 'Matricula', 'Registration', 'REGISTRATION',
                          'Matricula', 'MATRÍCULA', 'matrícula', 'Matrícula', 'Registro', 'REGISTRO',
                          'Mat', 'MAT', 'mat', 'Reg', 'REG', 'reg'
                        ];
                        
                        // Formatação específica para campos de mês/ano - PRIORIDADE MÁXIMA
                        const monthYearColumns = [
                          'Mês', 'MES', 'mes', 'Month', 'MONTH', 'month',
                          'Mês/Ano', 'MES/ANO', 'mes/ano', 'Month/Year', 'MONTH/YEAR', 'month/year',
                          'Período', 'PERIODO', 'periodo', 'Period', 'PERIOD', 'period',
                          'Referência', 'REFERENCIA', 'referencia', 'Reference', 'REFERENCE', 'reference'
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
                        
                        if (monthYearColumns.some(col => column.toLowerCase().includes(col.toLowerCase()))) {
                          displayValue = formatMonthYear(value);
                        }
                        else if (matriculaColumns.includes(column)) {
                          displayValue = formatMatricula(value);
                        }
                        // Colunas de texto puro - PRIORIDADE ALTA
                        else if (textOnlyColumns.includes(column)) {
                          // Mantém o valor original sem formatação
                          displayValue = value || '-';
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
                            } catch (error) {
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
                              const numValue = typeof value === 'number' ? value : Number(value.toString().replace(/[^\d,.-]/g, ''));
                              if (!isNaN(numValue)) {
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
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-900"
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            className="text-green-600 hover:text-green-900"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900"
                            title="Excluir"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={processedData!.columns.length + 1} className="px-6 py-4 text-center text-gray-500">
                      Nenhum registro encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Controles de Paginação */}
          {sortedEmployees.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Página {currentPage} de {totalPages} ({sortedEmployees.length.toLocaleString('pt-BR')} registros)
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Botão Primeira Página */}
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Primeira página"
                >
                  ««
                </button>
                
                {/* Botão Página Anterior */}
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Página anterior"
                >
                  «
                </button>
                
                {/* Números das páginas */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`px-3 py-1 text-sm border rounded-md transition-colors ${
                          currentPage === pageNumber
                            ? 'bg-red-600 text-white border-red-600'
                            : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                        style={{
                          backgroundColor: currentPage === pageNumber ? '#c9504c' : undefined,
                          borderColor: currentPage === pageNumber ? '#c9504c' : undefined
                        }}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>
                
                {/* Botão Próxima Página */}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Próxima página"
                >
                  »
                </button>
                
                {/* Botão Última Página */}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Última página"
                >
                  »»
                </button>
              </div>
            </div>
          )}

          {/* Mensagem quando não há resultados */}
          {filteredEmployees.length === 0 && (
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">🔍</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum resultado encontrado
              </h4>
              <p className="text-gray-500">
                Tente ajustar os filtros de busca para encontrar os registros desejados.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Employees;
