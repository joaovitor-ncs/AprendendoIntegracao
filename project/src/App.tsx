import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Zap, Code2, BarChart3, Eye } from 'lucide-react';
import { ApiButton, ApiCall } from './types';
import { makeApiCall } from './utils/api';
import ButtonCreator from './components/ButtonCreator';
import ButtonList from './components/ButtonList';
import ApiResponse from './components/ApiResponse';
import CallHistory from './components/CallHistory';
import DataVisualization from './components/DataVisualization';
import Dashboard from './components/Dashboard';

function App() {
  // Estados principais do sistema
  const [buttons, setButtons] = useState<ApiButton[]>([]);
  const [calls, setCalls] = useState<ApiCall[]>([]);
  const [currentCall, setCurrentCall] = useState<ApiCall | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [editingButton, setEditingButton] = useState<ApiButton | null>(null);
  const [selectedCallId, setSelectedCallId] = useState<string>();
  const [activeView, setActiveView] = useState<'lab' | 'data' | 'dashboard'>('lab');
  const [dataViewCalls, setDataViewCalls] = useState<ApiCall[]>([]);

  // Carrega dados do localStorage na inicialização
  useEffect(() => {
    const savedButtons = localStorage.getItem('api-buttons');
    const savedCalls = localStorage.getItem('api-calls');

    if (savedButtons) {
      try {
        const parsedButtons = JSON.parse(savedButtons);
        // Converte strings de data de volta para objetos Date
        const buttonsWithDates = parsedButtons.map((button: any) => ({
          ...button,
          createdAt: new Date(button.createdAt)
        }));
        setButtons(buttonsWithDates);
      } catch (error) {
        console.error('Erro ao carregar botões salvos:', error);
      }
    }

    if (savedCalls) {
      try {
        const parsedCalls = JSON.parse(savedCalls);
        // Converte strings de data de volta para objetos Date
        const callsWithDates = parsedCalls.map((call: any) => ({
          ...call,
          timestamp: new Date(call.timestamp)
        }));
        setCalls(callsWithDates);
      } catch (error) {
        console.error('Erro ao carregar histórico salvo:', error);
      }
    }
  }, []);

  // Salva botões no localStorage sempre que a lista muda
  useEffect(() => {
    localStorage.setItem('api-buttons', JSON.stringify(buttons));
  }, [buttons]);

  // Salva histórico no localStorage sempre que muda (limitado aos últimos 50)
  useEffect(() => {
    const limitedCalls = calls.slice(0, 50); // Mantém apenas os 50 mais recentes
    localStorage.setItem('api-calls', JSON.stringify(limitedCalls));
  }, [calls]);

  // Função para criar um novo botão
  const handleCreateButton = (buttonData: Omit<ApiButton, 'id' | 'createdAt'>) => {
    const newButton: ApiButton = {
      ...buttonData,
      id: `btn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };

    setButtons(prev => [newButton, ...prev]);
    console.log('✅ Novo botão criado:', newButton.name);
  };

  // Função para executar um botão (fazer chamada da API)
  const handleExecuteButton = async (button: ApiButton) => {
    setIsLoading(true);
    setCurrentCall(null);
    
    console.log(`🚀 Executando botão: ${button.name}`);
    
    try {
      const call = await makeApiCall(
        button.id,
        button.name,
        button.method,
        button.url,
        button.headers,
        button.body
      );

      setCurrentCall(call);
      setSelectedCallId(call.id);
      setCalls(prev => [call, ...prev]);
      
      // Adiciona à visualização de dados se a resposta for válida
      if (call.response && !call.error) {
        setDataViewCalls(prev => [call, ...prev]);
      }
      
      console.log('✅ Chamada concluída:', call);
    } catch (error) {
      console.error('❌ Erro ao executar botão:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para editar um botão
  const handleEditButton = (button: ApiButton) => {
    setEditingButton(button);
    setShowCreator(true);
  };

  // Função para deletar um botão
  const handleDeleteButton = (buttonId: string) => {
    if (confirm('Tem certeza que deseja excluir este botão?')) {
      setButtons(prev => prev.filter(btn => btn.id !== buttonId));
      // Remove também as chamadas relacionadas a este botão
      setCalls(prev => prev.filter(call => call.buttonId !== buttonId));
      console.log('🗑️ Botão excluído:', buttonId);
    }
  };

  // Função para selecionar uma chamada do histórico
  const handleSelectCall = (call: ApiCall) => {
    setCurrentCall(call);
    setSelectedCallId(call.id);
  };

  // Função para limpar o histórico
  const handleClearHistory = () => {
    if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
      setCalls([]);
      setCurrentCall(null);
      setSelectedCallId(undefined);
      setDataViewCalls([]);
      console.log('🧹 Histórico limpo');
    }
  };

  // Função para limpar apenas a visualização de dados
  const handleClearDataView = () => {
    if (confirm('Tem certeza que deseja limpar a visualização de dados?')) {
      setDataViewCalls([]);
      console.log('🧹 Visualização de dados limpa');
    }
  };
  // Função para atualizar dados (para o dashboard)
  const handleRefreshData = () => {
    // Em um sistema real, aqui faria uma nova busca dos dados
    console.log('🔄 Dados atualizados');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  API Learning Lab
                </h1>
                <p className="text-sm text-gray-500">
                  Aprenda APIs na prática criando botões personalizados
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Zap className="w-4 h-4" />
                  <span>{buttons.length} botões</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{calls.length} chamadas</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 border-r border-gray-300 pr-3">
                <button
                  onClick={() => setActiveView('lab')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeView === 'lab'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <Code2 className="w-4 h-4 inline mr-1" />
                  Lab
                </button>
                <button
                  onClick={() => setActiveView('data')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeView === 'data'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                   }`}
                 >
                   <Eye className="w-4 h-4 inline mr-1" />
                   Dados
                 </button>
                <button
                  onClick={() => setActiveView('dashboard')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeView === 'dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 inline mr-1" />
                  Dashboard
                </button>
              </div>
              
              <button
                onClick={() => setShowCreator(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Novo Botão</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Layout Principal */}
      {activeView === 'lab' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar - Lista de Botões */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-24">
                <ButtonList
                  buttons={buttons}
                  onExecuteButton={handleExecuteButton}
                  onEditButton={handleEditButton}
                  onDeleteButton={handleDeleteButton}
                  selectedButtonId={currentCall?.buttonId}
                />
              </div>
            </div>

            {/* Área Principal - Resposta da API */}
            <div className="lg:col-span-6">
              <ApiResponse
                apiCall={currentCall}
                isLoading={isLoading}
              />
            </div>

            {/* Sidebar Direita - Histórico */}
            <div className="lg:col-span-3">
              <div className="sticky top-24">
                <CallHistory
                  calls={calls}
                  onSelectCall={handleSelectCall}
                  onClearHistory={handleClearHistory}
                  selectedCallId={selectedCallId}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'data' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Lista de Botões */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-24">
                <ButtonList
                  buttons={buttons}
                  onExecuteButton={handleExecuteButton}
                  onEditButton={handleEditButton}
                  onDeleteButton={handleDeleteButton}
                  selectedButtonId={currentCall?.buttonId}
                />
              </div>
            </div>

            {/* Área Principal - Visualização de Dados */}
            <div className="lg:col-span-3">
              <DataVisualization 
                apiCalls={dataViewCalls} 
                onClearData={handleClearDataView}
              />
            </div>
          </div>
        </div>
      )}

      {activeView === 'dashboard' && (
        <Dashboard 
          calls={calls} 
          onRefresh={handleRefreshData}
        />
      )}

      {/* Modal do Criador de Botões */}
      {showCreator && (
        <ButtonCreator
          onCreateButton={handleCreateButton}
          onClose={() => {
            setShowCreator(false);
            setEditingButton(null);
          }}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>
              🚀 <strong>API Learning Lab</strong> - Sistema educativo para aprender APIs na prática
            </p>
            <p className="mt-1">
              Crie botões, configure chamadas e veja as respostas em tempo real
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;