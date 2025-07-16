import { HttpMethod, ApiCall } from '../types';

// Utilitários para fazer chamadas de API e medir performance
export const makeApiCall = async (
  buttonId: string,
  buttonName: string,
  method: HttpMethod,
  url: string,
  headers: Record<string, string>,
  body?: string
): Promise<ApiCall> => {
  const startTime = Date.now();
  const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    // Configuração da requisição
    const requestConfig: RequestInit = {
      method,
      headers: {
        ...headers,
        // Adiciona headers padrão se não existirem
        'Accept': headers['Accept'] || 'application/json',
      }
    };

    // Adiciona body apenas para métodos que suportam
    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      requestConfig.body = body;
    }

    console.log(`🚀 Fazendo chamada ${method} para: ${url}`);
    console.log('📋 Headers:', headers);
    if (body) console.log('📦 Body:', body);

    const response = await fetch(url, requestConfig);
    const duration = Date.now() - startTime;
    
    let responseData;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    console.log(`✅ Resposta recebida em ${duration}ms:`, responseData);

    return {
      id: callId,
      buttonId,
      buttonName,
      method,
      url,
      status: response.status,
      statusText: response.statusText,
      response: responseData,
      duration,
      timestamp: new Date()
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Erro na chamada da API:', error);

    return {
      id: callId,
      buttonId,
      buttonName,
      method,
      url,
      status: 0,
      statusText: 'Network Error',
      response: null,
      duration,
      timestamp: new Date(),
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
};

// Função para validar URL
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Função para formatar JSON de forma legível
export const formatJson = (data: any): string => {
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
};

// Função para obter cor do status HTTP
export const getStatusColor = (status: number): string => {
  if (status >= 200 && status < 300) return 'text-green-600';
  if (status >= 300 && status < 400) return 'text-blue-600';
  if (status >= 400 && status < 500) return 'text-orange-600';
  if (status >= 500) return 'text-red-600';
  return 'text-gray-600';
};

// Função para obter descrição do status HTTP
export const getStatusDescription = (status: number): string => {
  const descriptions: Record<number, string> = {
    200: 'OK - Requisição bem-sucedida',
    201: 'Created - Recurso criado com sucesso',
    204: 'No Content - Operação bem-sucedida sem conteúdo',
    400: 'Bad Request - Requisição inválida',
    401: 'Unauthorized - Não autorizado',
    403: 'Forbidden - Acesso negado',
    404: 'Not Found - Recurso não encontrado',
    500: 'Internal Server Error - Erro interno do servidor'
  };
  
  return descriptions[status] || `Status ${status}`;
};