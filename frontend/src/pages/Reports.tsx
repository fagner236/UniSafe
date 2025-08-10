import { useState } from 'react';
import { FileText, Download, BarChart3, PieChart, TrendingUp } from 'lucide-react';

const Reports = () => {
  const [selectedDateRange, setSelectedDateRange] = useState('month');
  const [selectedFormat, setSelectedFormat] = useState('pdf');

  const reports = [
    {
      id: 1,
      name: 'Relatório de Funcionários',
      description: 'Lista completa de todos os funcionários',
      icon: FileText,
      type: 'list'
    },
    {
      id: 2,
      name: 'Estatísticas por Departamento',
      description: 'Análise detalhada por departamento',
      icon: BarChart3,
      type: 'chart'
    },
    {
      id: 3,
      name: 'Distribuição Salarial',
      description: 'Gráfico de distribuição por faixa salarial',
      icon: PieChart,
      type: 'chart'
    },
    {
      id: 4,
      name: 'Tendências Mensais',
      description: 'Evolução dos dados ao longo do tempo',
      icon: TrendingUp,
      type: 'trend'
    }
  ];

  const handleGenerateReport = (reportId: number) => {
    console.log(`Gerando relatório ${reportId}...`);
    // Implementar geração de relatório
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1d335b' }}>Relatórios</h1>
        <p className="text-gray-600">
          Gere relatórios personalizados dos seus dados
        </p>
      </div>

      {/* Configurações */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Configurações</h3>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Período
              </label>
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="week">Última semana</option>
                <option value="month">Último mês</option>
                <option value="quarter">Último trimestre</option>
                <option value="year">Último ano</option>
                <option value="all">Todos os dados</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Formato
              </label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Relatórios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => {
          const IconComponent = report.icon;
          return (
            <div key={report.id} className="card">
              <div className="card-content">
                <div className="flex items-center mb-4">
                  <IconComponent className="h-8 w-8" style={{ color: '#1d335b' }} />
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">{report.name}</h3>
                    <p className="text-sm text-gray-500">{report.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleGenerateReport(report.id)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg text-white font-medium transition-colors"
                  style={{ backgroundColor: '#1d335b' }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Gerar Relatório
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Reports;
