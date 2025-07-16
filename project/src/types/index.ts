// Tipos principais do sistema de aprendizado de APIs

export interface ApiButton {
  id: string;
  name: string;
  color: string;
  icon: string;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: string;
  description?: string;
  createdAt: Date;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiCall {
  id: string;
  buttonId: string;
  buttonName: string;
  method: HttpMethod;
  url: string;
  status: number;
  statusText: string;
  response: any;
  duration: number;
  timestamp: Date;
  error?: string;
}

export interface ApiTemplate {
  id: string;
  name: string;
  description: string;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: string;
  category: 'basic' | 'advanced' | 'example';
}