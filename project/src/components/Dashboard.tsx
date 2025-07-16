import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  BarChart3,
  PieChart,
  Zap,
  Globe,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  Eye,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { ApiCall } from '../types';
import { getStatusColor, formatJson } from '../utils/api';

interface DashboardProps {
  calls: ApiCall[];
  onRefresh: () => void;
}

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
  trend: 'up' | 'down' | 'stable';
}

interface StatusDistribution {
  success: number;
  clientError: number;
  serverError: number;
  total: number;
}

const Dashboard: React.FC<DashboardProps> = ({ calls, onRefresh }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [selectedCall, setSelectedCall] = useState<ApiCall | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Auto refresh a cada 30 segundos se ativado
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      onRefresh();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, onRefresh]);

  // Filtrar chamadas por período
  const filteredCalls = useMemo(() => {
    const now = new Date();
    const timeRanges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    const cutoff = new Date(now.getTime() - timeRanges[selectedTimeRange]);
    return calls.filter(call => call.timestamp >= cutoff);
  }, [calls, selectedTimeRange]);

  // Calcular métricas
  const metrics = useMemo((): MetricCard[] => {
    const totalCalls = filteredCalls.length;
    const successCalls = filteredCalls.filter(call => call.status >= 200 && call.status < 300).length;
    const errorCalls = filteredCalls.filter(call => call.status >= 400 || call.error).length;
    const avgResponseTime = totalCalls > 0 
      ? Math.round(filteredCalls.reduce((sum, call) => sum + call.duration, 0) / totalCalls)
      : 0;

    const successRate = totalCalls > 0 ? Math.round((successCalls / totalCalls) * 100) : 0;

    return [
      {
        title: 'Total de Chamadas',
        value: totalCalls.toLocaleString(),
        change: 12.5,
        icon: <Activity className="w-6 h-6" />,
        color: 'bg-blue-500',
        trend: 'up'
      },
      {
        title: 'Taxa de Sucesso',
        value: `${successRate}%`,
        change: successRate >= 95 ? 2.1 : -1.3,
        icon: <CheckCircle className="w-6 h-6" />,
        color: successRate >= 95 ? 'bg-green-500' : 'bg-orange-500',
        trend: successRate >= 95 ? 'up' : 'down'
      },
      {
        title: 'Tempo Médio',
        value: `${avgResponseTime}ms`,
        change: avgResponseTime < 500 ? -8.2 : 15.7,
        icon: <Clock className="w-6 h-6" />,
        color: avgResponseTime < 500 ? 'bg-green-500' : 'bg-red-500',
        trend: avgResponseTime < 500 ? 'up' : 'down'
      },
      {
        title: 'Erros',
        value: errorCalls.toLocaleString(),
        change: errorCalls === 0 ? -100 : 25.3,
        icon: <AlertTriangle className="w-6 h-6" />,
        color: errorCalls === 0 ? 'bg-green-500' : 'bg-red-500',
        trend: errorCalls === 0 ? 'up' : 'down'
      }
    ];
  }, [filteredCalls]);

  // Distribuição de status
  const statusDistribution = useMemo((): StatusDistribution => {
    const success = filteredCalls.filter(call => call.status >= 200 && call.status < 300).length;
    const clientError = filteredCalls.filter(call => call.status >= 400 && call.status < 500).length;
    const serverError = filteredCalls.filter(call => call.status >= 500 || call.error).length;
    
    return {
      success,
      clientError,
      serverError,
      total: filteredCalls.length
    };
  }, [filteredCalls]);

  // Métodos mais utilizados
  const methodStats = useMemo(() => {
    const methodCount = filteredCalls.reduce((acc, call) => {
      acc[call.method] = (acc[call.method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(methodCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  }, [filteredCalls]);

  // Chamadas recentes
  const recentCalls = useMemo(() => {
    return filteredCalls
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
  }, [filteredCalls]);

  const exportData = () => {
    const dataStr = JSON.stringify(filteredCalls, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `api-calls-${selectedTimeRange}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header do Dashboard */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Dashboard de APIs
                </h1>
                <p className="text-sm text-gray-500">
                  Monitoramento em tempo real das suas chamadas de API
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Seletor de Período */}
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1h">Última Hora</option>
                <option value="24h">Últimas 24h</option>
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
              </select>

              {/* Auto Refresh */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-lg transition-colors ${
                  autoRefresh 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={autoRefresh ? 'Auto-refresh ativo' : 'Ativar auto-refresh'}
              >
                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              </button>

              {/* Export */}
              <button
                onClick={exportData}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Exportar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 ${metric.color} rounded-lg flex items-center justify-center text-white`}>
                    {metric.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                </div>
                <div className={`flex items-center space-x-1 text-sm ${
                  metric.trend === 'up' ? 'text-green-600' : 
                  metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {metric.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : 
                   metric.trend === 'down' ? <ArrowDown className="w-4 h-4" /> : null}
                  <span>{Math.abs(metric.change)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Gráfico de Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Distribuição de Status</h3>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Sucesso (2xx)</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-gray-900">{statusDistribution.success}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({statusDistribution.total > 0 ? Math.round((statusDistribution.success / statusDistribution.total) * 100) : 0}%)
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Erro Cliente (4xx)</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-gray-900">{statusDistribution.clientError}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({statusDistribution.total > 0 ? Math.round((statusDistribution.clientError / statusDistribution.total) * 100) : 0}%)
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Erro Servidor (5xx)</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-gray-900">{statusDistribution.serverError}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({statusDistribution.total > 0 ? Math.round((statusDistribution.serverError / statusDistribution.total) * 100) : 0}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Barra de Progresso Visual */}
            <div className="mt-6">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div className="h-full flex">
                  <div 
                    className="bg-green-500 transition-all duration-500"
                    style={{ width: `${statusDistribution.total > 0 ? (statusDistribution.success / statusDistribution.total) * 100 : 0}%` }}
                  ></div>
                  <div 
                    className="bg-orange-500 transition-all duration-500"
                    style={{ width: `${statusDistribution.total > 0 ? (statusDistribution.clientError / statusDistribution.total) * 100 : 0}%` }}
                  ></div>
                  <div 
                    className="bg-red-500 transition-all duration-500"
                    style={{ width: `${statusDistribution.total > 0 ? (statusDistribution.serverError / statusDistribution.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Métodos Mais Utilizados */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Métodos HTTP</h3>
              <Zap className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {methodStats.map(([method, count], index) => {
                const percentage = filteredCalls.length > 0 ? (count / filteredCalls.length) * 100 : 0;
                const methodColors = {
                  GET: 'bg-green-500',
                  POST: 'bg-blue-500',
                  PUT: 'bg-orange-500',
                  PATCH: 'bg-purple-500',
                  DELETE: 'bg-red-500'
                };
                
                return (
                  <div key={method} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded text-white ${methodColors[method as keyof typeof methodColors] || 'bg-gray-500'}`}>
                          {method}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-gray-900">{count}</span>
                        <span className="text-sm text-gray-500 ml-2">({Math.round(percentage)}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${methodColors[method as keyof typeof methodColors] || 'bg-gray-500'}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Estatísticas de Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Performance</h3>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Tempo Mínimo</span>
                  <span className="font-semibold text-gray-900">
                    {filteredCalls.length > 0 ? Math.min(...filteredCalls.map(c => c.duration)) : 0}ms
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Tempo Máximo</span>
                  <span className="font-semibold text-gray-900">
                    {filteredCalls.length > 0 ? Math.max(...filteredCalls.map(c => c.duration)) : 0}ms
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Mediana</span>
                  <span className="font-semibold text-gray-900">
                    {filteredCalls.length > 0 ? 
                      Math.round(filteredCalls.sort((a, b) => a.duration - b.duration)[Math.floor(filteredCalls.length / 2)]?.duration || 0) 
                      : 0}ms
                  </span>
                </div>
              </div>

              {/* Indicador de Saúde */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Status do Sistema</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      statusDistribution.success / Math.max(statusDistribution.total, 1) >= 0.95 
                        ? 'bg-green-500' 
                        : statusDistribution.success / Math.max(statusDistribution.total, 1) >= 0.8 
                        ? 'bg-orange-500' 
                        : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-900">
                      {statusDistribution.success / Math.max(statusDistribution.total, 1) >= 0.95 
                        ? 'Excelente' 
                        : statusDistribution.success / Math.max(statusDistribution.total, 1) >= 0.8 
                        ? 'Bom' 
                        : 'Atenção'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Chamadas Recentes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Chamadas Recentes</h3>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {recentCalls.length} de {filteredCalls.length} chamadas
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Botão
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tempo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{call.buttonName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        call.method === 'GET' ? 'bg-green-100 text-green-800' :
                        call.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                        call.method === 'PUT' ? 'bg-orange-100 text-orange-800' :
                        call.method === 'PATCH' ? 'bg-purple-100 text-purple-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {call.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {call.error ? (
                          <XCircle className="w-4 h-4 text-red-500 mr-2" />
                        ) : call.status >= 200 && call.status < 300 ? (
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-orange-500 mr-2" />
                        )}
                        <span className={`text-sm font-medium ${getStatusColor(call.status)}`}>
                          {call.status} {call.statusText}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{call.duration}ms</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {call.timestamp.toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedCall(call)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {recentCalls.length === 0 && (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Nenhuma chamada encontrada
              </h3>
              <p className="text-gray-500 text-sm">
                Execute alguns botões para ver os dados aqui
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalhes da Chamada */}
      {selectedCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Detalhes da Chamada</h2>
                <button
                  onClick={() => setSelectedCall(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Informações Gerais</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Botão:</strong> {selectedCall.buttonName}</div>
                    <div><strong>Método:</strong> {selectedCall.method}</div>
                    <div><strong>URL:</strong> <code className="bg-gray-100 px-1 rounded">{selectedCall.url}</code></div>
                    <div><strong>Status:</strong> <span className={getStatusColor(selectedCall.status)}>{selectedCall.status} {selectedCall.statusText}</span></div>
                    <div><strong>Duração:</strong> {selectedCall.duration}ms</div>
                    <div><strong>Timestamp:</strong> {selectedCall.timestamp.toLocaleString('pt-BR')}</div>
                  </div>
                </div>
                
                {selectedCall.error && (
                  <div>
                    <h3 className="font-semibold text-red-800 mb-2">Erro</h3>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-700 text-sm">{selectedCall.error}</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Resposta</h3>
                <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-96">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                    {selectedCall.response ? formatJson(selectedCall.response) : 'Resposta vazia'}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;