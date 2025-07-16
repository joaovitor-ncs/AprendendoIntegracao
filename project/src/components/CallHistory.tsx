import React from 'react';
import { History, Clock, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { ApiCall } from '../types';
import { getStatusColor } from '../utils/api';

interface CallHistoryProps {
  calls: ApiCall[];
  onSelectCall: (call: ApiCall) => void;
  onClearHistory: () => void;
  selectedCallId?: string;
}

const CallHistory: React.FC<CallHistoryProps> = ({
  calls,
  onSelectCall,
  onClearHistory,
  selectedCallId
}) => {
  if (calls.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-medium text-gray-600 mb-1">
            Histórico Vazio
          </h3>
          <p className="text-gray-500 text-sm">
            As chamadas de API aparecerão aqui
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">Histórico de Chamadas</h3>
          </div>
          <button
            onClick={onClearHistory}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Limpar histórico"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {calls.length} chamada(s) realizadas
        </p>
      </div>

      {/* Lista de Chamadas */}
      <div className="max-h-96 overflow-y-auto">
        {calls.map((call) => {
          const isSelected = selectedCallId === call.id;
          const isSuccess = call.status >= 200 && call.status < 300;
          const hasError = call.error || call.status >= 400;

          return (
            <div
              key={call.id}
              onClick={() => onSelectCall(call)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                isSelected ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Nome e Método */}
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-800 truncate">
                      {call.buttonName}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      call.method === 'GET' ? 'bg-green-100 text-green-800' :
                      call.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                      call.method === 'PUT' ? 'bg-orange-100 text-orange-800' :
                      call.method === 'PATCH' ? 'bg-purple-100 text-purple-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {call.method}
                    </span>
                  </div>

                  {/* Status e Duração */}
                  <div className="flex items-center space-x-3 text-sm">
                    <span className={`font-medium ${getStatusColor(call.status)}`}>
                      {call.status} {call.statusText}
                    </span>
                    <span className="text-gray-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {call.duration}ms
                    </span>
                  </div>

                  {/* Timestamp */}
                  <div className="text-xs text-gray-400 mt-1">
                    {call.timestamp.toLocaleString('pt-BR')}
                  </div>

                  {/* URL */}
                  <div className="text-xs text-gray-500 font-mono mt-1 truncate">
                    {call.url}
                  </div>

                  {/* Erro (se houver) */}
                  {call.error && (
                    <div className="text-xs text-red-600 mt-1 truncate">
                      Erro: {call.error}
                    </div>
                  )}
                </div>

                {/* Ícone de Status */}
                <div className="ml-3 flex-shrink-0">
                  {hasError ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CallHistory;