import React from 'react';
import { Play, Edit, Trash2, Globe, Code, Database, Send, Download, Upload, Search, Settings } from 'lucide-react';
import { ApiButton } from '../types';

interface ButtonListProps {
  buttons: ApiButton[];
  onExecuteButton: (button: ApiButton) => void;
  onEditButton: (button: ApiButton) => void;
  onDeleteButton: (buttonId: string) => void;
  selectedButtonId?: string;
}

const ButtonList: React.FC<ButtonListProps> = ({
  buttons,
  onExecuteButton,
  onEditButton,
  onDeleteButton,
  selectedButtonId
}) => {
  // Mapeamento de ícones
  const iconMap = {
    Globe,
    Code,
    Database,
    Send,
    Download,
    Upload,
    Search,
    Settings
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Globe;
    return IconComponent;
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-orange-100 text-orange-800';
      case 'PATCH': return 'bg-purple-100 text-purple-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (buttons.length === 0) {
    return (
      <div className="text-center py-12">
        <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          Nenhum botão criado ainda
        </h3>
        <p className="text-gray-500 text-sm">
          Crie seu primeiro botão para começar a explorar APIs
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Meus Botões de API</h3>
        <span className="text-sm text-gray-500">{buttons.length} botão(ões)</span>
      </div>

      {buttons.map((button) => {
        const IconComponent = getIcon(button.icon);
        const isSelected = selectedButtonId === button.id;

        return (
          <div
            key={button.id}
            className={`group border rounded-lg p-4 transition-all hover:shadow-md ${
              isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Header do Botão */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: button.color }}
                >
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">{button.name}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getMethodColor(button.method)}`}>
                      {button.method}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEditButton(button)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar botão"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteButton(button.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Excluir botão"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Descrição */}
            {button.description && (
              <p className="text-sm text-gray-600 mb-3">{button.description}</p>
            )}

            {/* URL */}
            <div className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded mb-3 truncate">
              {button.url}
            </div>

            {/* Botão de Executar */}
            <button
              onClick={() => onExecuteButton(button)}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-4 h-4" />
              <span>Executar</span>
            </button>

            {/* Data de Criação */}
            <div className="text-xs text-gray-400 mt-2 text-center">
              Criado em {new Date(button.createdAt).toLocaleDateString('pt-BR')}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ButtonList;