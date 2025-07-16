import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Clock, Copy, Eye, EyeOff } from 'lucide-react';
import { ApiCall } from '../types';
import { getStatusColor, getStatusDescription, formatJson } from '../utils/api';

interface ApiResponseProps {
  apiCall: ApiCall | null;
  isLoading: boolean;
}

const ApiResponse: React.FC<ApiResponseProps> = ({ apiCall, isLoading }) => {
  const [showRawResponse, setShowRawResponse] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center space-x-3 py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Fazendo chamada da API...</span>
        </div>
      </div>
    );
  }

  if (!apiCall) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-12">
          <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Resposta da API
          </h3>
          <p className="text-gray-500 text-sm">
            Execute um botão para ver a resposta aqui
          </p>
        </div>
      </div>
    );
  }

  const isSuccess = apiCall.status >= 200 && apiCall.status < 300;
  const hasError = apiCall.error || apiCall.status >= 400;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header da Resposta */}
      <div className={`p-4 border-b ${
        hasError ? 'bg-red-50 border-red-200' : 
        isSuccess ? 'bg-green-50 border-green-200' : 
        'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {hasError ? (
              <AlertCircle className="w-5 h-5 text-red-600" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
            <div>
              <h3 className="font-semibold text-gray-800">
                {apiCall.buttonName}
              </h3>
              <div className="flex items-center space-x-4 text-sm">
                <span className="font-medium">{apiCall.method}</span>
                <span className={`font-medium ${getStatusColor(apiCall.status)}`}>
                  {apiCall.status} {apiCall.statusText}
                </span>
                <span className="text-gray-500 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {apiCall.duration}ms
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowRawResponse(!showRawResponse)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
              title={showRawResponse ? 'Mostrar formatado' : 'Mostrar raw'}
            >
              {showRawResponse ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={() => copyToClipboard(formatJson(apiCall.response))}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
              title="Copiar resposta"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Description */}
        <div className="mt-2 text-sm text-gray-600">
          {getStatusDescription(apiCall.status)}
        </div>

        {/* URL */}
        <div className="mt-2 text-xs font-mono text-gray-500 bg-white p-2 rounded border">
          {apiCall.url}
        </div>
      </div>

      {/* Conteúdo da Resposta */}
      <div className="p-4">
        {apiCall.error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2">Erro na Requisição</h4>
            <p className="text-red-700 text-sm">{apiCall.error}</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-800">Resposta</h4>
              {copied && (
                <span className="text-green-600 text-sm">Copiado!</span>
              )}
            </div>

            {apiCall.response ? (
              <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-96">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                  {showRawResponse 
                    ? JSON.stringify(apiCall.response)
                    : formatJson(apiCall.response)
                  }
                </pre>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                Resposta vazia
              </div>
            )}
          </div>
        )}

        {/* Informações Adicionais */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Timestamp:</span>
              <div className="font-mono text-gray-800">
                {apiCall.timestamp.toLocaleString('pt-BR')}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Duração:</span>
              <div className="font-mono text-gray-800">
                {apiCall.duration}ms
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiResponse;