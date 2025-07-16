import React, { useState, useMemo } from 'react';
import { 
  Eye, 
  List, 
  Grid, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Building,
  Calendar,
  Hash,
  FileText,
  Tag,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { ApiCall } from '../types';

interface DataVisualizationProps {
  apiCalls: ApiCall[];
  onClearData: () => void;
}

interface DataField {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'date' | 'email' | 'url' | 'object' | 'array';
  label: string;
  icon?: React.ReactNode;
}

const DataVisualization: React.FC<DataVisualizationProps> = ({ apiCalls, onClearData }) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'json'>('cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedCallIndex, setSelectedCallIndex] = useState<number>(0);

  // Função para detectar o tipo de dado e gerar label apropriado
  const detectFieldType = (key: string, value: any): DataField => {
    const lowerKey = key.toLowerCase();
    
    let type: DataField['type'] = 'string';
    let icon: React.ReactNode = <FileText className="w-4 h-4" />;
    let label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');

    // Detectar tipo baseado no valor
    if (typeof value === 'number') {
      type = 'number';
      icon = <Hash className="w-4 h-4" />;
    } else if (typeof value === 'boolean') {
      type = 'boolean';
      icon = <CheckCircle className="w-4 h-4" />;
    } else if (Array.isArray(value)) {
      type = 'array';
      icon = <List className="w-4 h-4" />;
    } else if (typeof value === 'object' && value !== null) {
      type = 'object';
      icon = <Grid className="w-4 h-4" />;
    }

    // Detectar tipos específicos baseado na chave
    if (lowerKey.includes('email') || (typeof value === 'string' && value.includes('@'))) {
      type = 'email';
      icon = <Mail className="w-4 h-4" />;
      label = 'Email';
    } else if (lowerKey.includes('phone') || lowerKey.includes('telefone')) {
      icon = <Phone className="w-4 h-4" />;
      label = 'Telefone';
    } else if (lowerKey.includes('url') || lowerKey.includes('website') || lowerKey.includes('site')) {
      type = 'url';
      icon = <Globe className="w-4 h-4" />;
      label = 'Website';
    } else if (lowerKey.includes('address') || lowerKey.includes('endereco')) {
      icon = <MapPin className="w-4 h-4" />;
      label = 'Endereço';
    } else if (lowerKey.includes('company') || lowerKey.includes('empresa')) {
      icon = <Building className="w-4 h-4" />;
      label = 'Empresa';
    } else if (lowerKey.includes('name') || lowerKey.includes('nome')) {
      icon = <User className="w-4 h-4" />;
      label = 'Nome';
    } else if (lowerKey.includes('title') || lowerKey.includes('titulo')) {
      icon = <Tag className="w-4 h-4" />;
      label = 'Título';
    } else if (lowerKey.includes('date') || lowerKey.includes('created') || lowerKey.includes('updated')) {
      type = 'date';
      icon = <Calendar className="w-4 h-4" />;
      label = 'Data';
    } else if (lowerKey.includes('id')) {
      icon = <Hash className="w-4 h-4" />;
      label = 'ID';
    } else if (lowerKey.includes('status')) {
      icon = <AlertCircle className="w-4 h-4" />;
      label = 'Status';
    }

    return { key, value, type, label, icon };
  };

  // Processar dados da resposta
  const processedData = useMemo(() => {
    if (apiCalls.length === 0) return [];

    return apiCalls.flatMap((apiCall, callIndex) => {
      const data = Array.isArray(apiCall.response) ? apiCall.response : [apiCall.response];
      
      return data.map((item, itemIndex) => {
        if (typeof item !== 'object' || item === null) {
          return {
            id: `${callIndex}-${itemIndex}`,
            callIndex,
            callInfo: {
              buttonName: apiCall.buttonName,
              method: apiCall.method,
              url: apiCall.url,
              timestamp: apiCall.timestamp,
              status: apiCall.status
            },
            fields: [{ key: 'value', value: item, type: 'string' as const, label: 'Valor', icon: <Info className="w-4 h-4" /> }]
          };
        }

        const fields = Object.entries(item).map(([key, value]) => detectFieldType(key, value));
        
        return {
          id: `${callIndex}-${itemIndex}`,
          callIndex,
          callInfo: {
            buttonName: apiCall.buttonName,
            method: apiCall.method,
            url: apiCall.url,
            timestamp: apiCall.timestamp,
            status: apiCall.status
          },
          fields
        };
      });
    });
  }, [apiCalls]);

  // Filtrar dados baseado na busca
  const filteredData = useMemo(() => {
    if (!searchTerm) return processedData;
    
    return processedData.filter(item =>
      item.fields.some(field =>
        field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(field.value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [processedData, searchTerm]);

  const toggleExpanded = (itemId: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(String(itemId))) {
      newExpanded.delete(String(itemId));
    } else {
      newExpanded.add(String(itemId));
    }
    setExpandedItems(newExpanded);
  };

  const formatValue = (field: DataField) => {
    const { value, type } = field;

    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">Não informado</span>;
    }

    switch (type) {
      case 'email':
        return (
          <a href={`mailto:${value}`} className="text-blue-600 hover:text-blue-800 flex items-center space-x-1">
            <span>{value}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        );
      case 'url':
        return (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center space-x-1">
            <span className="truncate">{value}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        );
      case 'boolean':
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {value ? 'Sim' : 'Não'}
          </span>
        );
      case 'date':
        try {
          const date = new Date(value);
          return (
            <span className="flex items-center space-x-1">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span>{date.toLocaleDateString('pt-BR')}</span>
            </span>
          );
        } catch {
          return <span>{String(value)}</span>;
        }
      case 'array':
        return (
          <span className="text-gray-600">
            Array ({value.length} {value.length === 1 ? 'item' : 'itens'})
          </span>
        );
      case 'object':
        return (
          <span className="text-gray-600">
            Objeto ({Object.keys(value).length} {Object.keys(value).length === 1 ? 'propriedade' : 'propriedades'})
          </span>
        );
      default:
        return <span>{String(value)}</span>;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (apiCalls.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Visualização de Dados
          </h3>
          <p className="text-gray-500">
            Execute uma chamada de API para ver os dados formatados aqui
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
              <Eye className="w-6 h-6 text-blue-600" />
              <span>Visualização de Dados das APIs</span>
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {filteredData.length} {filteredData.length === 1 ? 'registro encontrado' : 'registros encontrados'}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => copyToClipboard(JSON.stringify(apiCalls.map(c => c.response), null, 2))}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
              title="Copiar JSON"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
              title="Atualizar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClearData}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Limpar dados"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Controles */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar nos dados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Visualização:</span>
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'cards' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                }`}
                title="Cards"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                }`}
                title="Tabela"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('json')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'json' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                }`}
                title="JSON"
              >
                <FileText className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-6">
        {viewMode === 'cards' && (
          <div className="space-y-6">
            {filteredData.map((item, index) => (
              <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                {/* Header com informações da chamada */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 border-b border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        item.callInfo.method === 'GET' ? 'bg-green-100 text-green-800' :
                        item.callInfo.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                        item.callInfo.method === 'PUT' ? 'bg-orange-100 text-orange-800' :
                        item.callInfo.method === 'PATCH' ? 'bg-purple-100 text-purple-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.callInfo.method}
                      </span>
                      <span className="font-medium text-gray-800">{item.callInfo.buttonName}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-600">{item.callInfo.timestamp.toLocaleTimeString('pt-BR')}</span>
                    </div>
                    <span className="text-green-600 font-medium">{item.callInfo.status}</span>
                  </div>
                  <div className="text-xs text-gray-500 font-mono mt-1 truncate">
                    {item.callInfo.url}
                  </div>
                </div>
                
                <div 
                  className="bg-gray-50 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleExpanded(item.id)}
                >
                  <h3 className="font-medium text-gray-800 flex items-center space-x-2">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <span>Registro {index + 1}</span>
                  </h3>
                  {expandedItems.has(String(item.id)) ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                
                {expandedItems.has(String(item.id)) && (
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {item.fields.map((field) => (
                        <div key={field.key} className="bg-white border border-gray-100 rounded-lg p-3 hover:border-gray-200 transition-colors">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="text-blue-600">{field.icon}</div>
                            <span className="text-sm font-medium text-gray-700">{field.label}</span>
                          </div>
                          <div className="text-gray-900">
                            {formatValue(field)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {viewMode === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    #
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    API
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Método
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Horário
                  </th>
                  {filteredData[0]?.fields.map((field) => (
                    <th key={field.key} className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                      <div className="flex items-center space-x-2">
                        {field.icon}
                        <span>{field.label}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">
                      {index + 1}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm">
                      <span className="font-medium text-gray-800">{item.callInfo.buttonName}</span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        item.callInfo.method === 'GET' ? 'bg-green-100 text-green-800' :
                        item.callInfo.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                        item.callInfo.method === 'PUT' ? 'bg-orange-100 text-orange-800' :
                        item.callInfo.method === 'PATCH' ? 'bg-purple-100 text-purple-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.callInfo.method}
                      </span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">
                      {item.callInfo.timestamp.toLocaleTimeString('pt-BR')}
                    </td>
                    {item.fields.map((field) => (
                      <td key={field.key} className="border border-gray-200 px-4 py-3 text-sm">
                        {formatValue(field)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === 'json' && (
          <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
            <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
              {JSON.stringify(apiCalls.map(call => ({
                buttonName: call.buttonName,
                method: call.method,
                url: call.url,
                timestamp: call.timestamp,
                status: call.status,
                response: call.response
              })), null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataVisualization;