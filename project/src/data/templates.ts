import { ApiTemplate } from '../types';

// Templates pré-configurados para aprendizado
export const apiTemplates: ApiTemplate[] = [
  {
    id: 'get-users',
    name: 'Listar Usuários',
    description: 'Busca uma lista de usuários usando GET - método mais básico para ler dados',
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/users',
    headers: {
      'Content-Type': 'application/json'
    },
    category: 'basic'
  },
  {
    id: 'get-user',
    name: 'Buscar Usuário por ID',
    description: 'Busca um usuário específico usando parâmetro na URL',
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/users/1',
    headers: {
      'Content-Type': 'application/json'
    },
    category: 'basic'
  },
  {
    id: 'create-post',
    name: 'Criar Post',
    description: 'Cria um novo post usando POST - método para criar novos recursos',
    method: 'POST',
    url: 'https://jsonplaceholder.typicode.com/posts',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'Meu primeiro post',
      body: 'Este é o conteúdo do meu post de exemplo',
      userId: 1
    }, null, 2),
    category: 'basic'
  },
  {
    id: 'update-post',
    name: 'Atualizar Post',
    description: 'Atualiza um post existente usando PUT - substitui o recurso completamente',
    method: 'PUT',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: 1,
      title: 'Post atualizado',
      body: 'Conteúdo modificado do post',
      userId: 1
    }, null, 2),
    category: 'basic'
  },
  {
    id: 'delete-post',
    name: 'Deletar Post',
    description: 'Remove um post usando DELETE - método para excluir recursos',
    method: 'DELETE',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    headers: {
      'Content-Type': 'application/json'
    },
    category: 'basic'
  },
  {
    id: 'github-user',
    name: 'GitHub - Perfil de Usuário',
    description: 'Busca informações de um usuário do GitHub usando API pública',
    method: 'GET',
    url: 'https://api.github.com/users/octocat',
    headers: {
      'Accept': 'application/vnd.github.v3+json'
    },
    category: 'example'
  },
  {
    id: 'cep-lookup',
    name: 'Consultar CEP',
    description: 'Busca informações de endereço através do CEP usando ViaCEP',
    method: 'GET',
    url: 'https://viacep.com.br/ws/01310-100/json/',
    headers: {
      'Content-Type': 'application/json'
    },
    category: 'example'
  }
];