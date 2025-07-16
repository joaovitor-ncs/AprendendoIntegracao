import React, { useState } from 'react';
import { Plus, Palette, Type, Globe, Code, BookOpen } from 'lucide-react';
import { ApiButton, HttpMethod, ApiTemplate } from '../types';
import { apiTemplates } from '../data/templates';
import { isValidUrl } from '../utils/api';

interface ButtonCreatorProps {
  onCreateButton: (button: Omit<ApiButton, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

const ButtonCreator: React.FC<ButtonCreatorProps> = ({ onCreateButton, onClose }) => {
  const [activeTab, setActiveTab] = useState<'custom' | 'template'>('custom');
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    icon: 'Globe',
    method: 'GET' as HttpMethod,
    url: '',
    headers: '{\n  "Content-Type": "application/json"\n}',
    body: '',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cores disponíveis para os botões
  const colors = [
    { name: 'Azul', value: '#3B82F6' },
    { name: 'Verde', value: '#10B981' },
    { name: 'Roxo', value: '#8B5CF6' },
    { name: 'Rosa', value: '#EC4899' },
    { name: 'Laranja', value: '#F59E0B' },
    { name: 'Vermelho', value: '#EF4444' },
    { name: 'Cinza', value: '#6B7280' },
    { name: 'Índigo', value: '#6366F1' }
  ];

  // Ícones disponíveis
  const icons = ['Globe', 'Code', 'Database', 'Send', 'Download', 'Upload', 'Search', 'Settings'];

  // Métodos HTTP com explicações
  const methods = [
    { value: 'GET', label: 'GET', description: 'Buscar dados - não modifica nada no servidor' },
    { value: 'POST', label: 'POST', description: 'Criar novos recursos - envia dados para o servidor' },
    { value: 'PUT', label: 'PUT', description: 'Atualizar recurso completo - substitui dados existentes' },
    { value: 'PATCH', label: 'PATCH', description: 'Atualizar parcialmente - modifica apenas campos específicos' },
    { value: 'DELETE', label: 'DELETE', description: 'Remover recursos - exclui dados do servidor' }
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'URL é obrigatória';
    } else if (!isValidUrl(formData.url)) {
      newErrors.url = 'URL inválida';
    }

    try {
      JSON.parse(formData.headers);
    } catch {
      newErrors.headers = 'Headers devem estar em formato JSON válido';
    }

    if (formData.body && ['POST', 'PUT', 'PATCH'].includes(formData.method)) {
      try {
        JSON.parse(formData.body);
      } catch {
        newErrors.body = 'Body deve estar em formato JSON válido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const headers = JSON.parse(formData.headers);
      
      onCreateButton({
        name: formData.name,
        color: formData.color,
        icon: formData.icon,
        method: formData.method,
        url: formData.url,
        headers,
        body: formData.body || undefined,
        description: formData.description || undefined
      });

      onClose();
    } catch (error) {
      console.error('Erro ao criar botão:', error);
    }
  };

  const handleTemplateSelect = (template: ApiTemplate) => {
    onCreateButton({
      name: template.name,
      color: '#3B82F6',
      icon: 'Globe',
      method: template.method,
      url: template.url,
      headers: template.headers,
      body: template.body,
      description: template.description
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Plus className="w-6 h-6" />
              <h2 className="text-xl font-bold">Criar Novo Botão de API</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'custom'
                  ? 'bg-white text-blue-600'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <Type className="w-4 h-4 inline mr-2" />
              Personalizado
            </button>
            <button
              onClick={() => setActiveTab('template')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'template'
                  ? 'bg-white text-blue-600'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Templates
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {activeTab === 'custom' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome e Aparência */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Botão *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: Buscar Usuários"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Breve descrição do que este botão faz"
                  />
                </div>
              </div>

              {/* Cor e Ícone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Palette className="w-4 h-4 inline mr-1" />
                    Cor do Botão
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: color.value })}
                        className={`w-12 h-12 rounded-lg border-2 transition-all ${
                          formData.color === color.value
                            ? 'border-gray-800 scale-110'
                            : 'border-gray-300 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ícone
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {icons.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Método HTTP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método HTTP *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {methods.map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, method: method.value as HttpMethod })}
                      className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                        formData.method === method.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      title={method.description}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {methods.find(m => m.value === formData.method)?.description}
                </p>
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="w-4 h-4 inline mr-1" />
                  URL da API *
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.url ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://api.exemplo.com/usuarios"
                />
                {errors.url && <p className="text-red-500 text-sm mt-1">{errors.url}</p>}
              </div>

              {/* Headers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Code className="w-4 h-4 inline mr-1" />
                  Headers (JSON)
                </label>
                <textarea
                  value={formData.headers}
                  onChange={(e) => setFormData({ ...formData, headers: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
                    errors.headers ? 'border-red-500' : 'border-gray-300'
                  }`}
                  rows={4}
                  placeholder='{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer token"\n}'
                />
                {errors.headers && <p className="text-red-500 text-sm mt-1">{errors.headers}</p>}
              </div>

              {/* Body (apenas para métodos que suportam) */}
              {['POST', 'PUT', 'PATCH'].includes(formData.method) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Body (JSON) - Opcional
                  </label>
                  <textarea
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
                      errors.body ? 'border-red-500' : 'border-gray-300'
                    }`}
                    rows={6}
                    placeholder='{\n  "nome": "João",\n  "email": "joao@exemplo.com"\n}'
                  />
                  {errors.body && <p className="text-red-500 text-sm mt-1">{errors.body}</p>}
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Criar Botão</span>
                </button>
              </div>
            </form>
          ) : (
            /* Templates */
            <div className="space-y-6">
              <div className="text-center">
                <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Templates Prontos para Aprender
                </h3>
                <p className="text-gray-600">
                  Escolha um template pré-configurado para começar a explorar APIs rapidamente
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {apiTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-800">{template.name}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        template.method === 'GET' ? 'bg-green-100 text-green-800' :
                        template.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                        template.method === 'PUT' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {template.method}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <div className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
                      {template.url}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ButtonCreator;