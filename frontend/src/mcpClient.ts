// src/mcpClient.ts
// Client MCP para integração frontend React <-> backend Django

export interface MCPContext {
  user?: string;
  session?: string;
  [key: string]: any;
}

export interface MCPResponse<T = any> {
  data: T;
  mcpMeta: any;
}




export async function mcpFetch<T = any>(
  url: string,
  options: RequestInit = {},
  context: MCPContext = {}
): Promise<MCPResponse<T>> {
  const token = localStorage.getItem('access_token');
  const headers = {
    ...(options.headers || {}),
    'X-MCP-Context': JSON.stringify(context),
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
  // Prepend API base URL if url is relative (starts with /)
  const apiBaseUrl = process.env.REACT_APP_API_URL || '';
  const fullUrl = url.startsWith('/') ? `${apiBaseUrl}${url}` : url;
  console.log('[mcpFetch] Request:', { url: fullUrl, headers, options });
  const response = await fetch(fullUrl, { ...options, headers });
  const mcpMeta = response.headers.get('X-MCP-Meta');
  const contentType = response.headers.get('content-type') || '';
  console.log('[mcpFetch] Response:', {
    url: fullUrl,
    status: response.status,
    statusText: response.statusText,
    contentType,
    mcpMeta,
  });

  // Helper to log and throw error with response body
  async function logAndThrowError(prefix: string): Promise<never> {
    const text = await response.text();
    console.error(`[mcpFetch] ${prefix} (first 500 chars):`, text.slice(0, 500));
    throw new Error(`${prefix}: ${text.slice(0, 200)}`);
  }

  if (!response.ok) {
    if (contentType.includes('application/json')) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        return logAndThrowError('Erro desconhecido do servidor');
      }
      console.error('[mcpFetch] API error JSON:', errorData);
      throw new Error(
        errorData?.mensagem || errorData?.message || JSON.stringify(errorData)
      );
    } else {
      return logAndThrowError('Erro HTTP não-JSON');
    }
  }

  if (!contentType.includes('application/json')) {
    return logAndThrowError('Resposta inesperada do servidor');
  }

  const data = await response.json();
  console.log('[mcpFetch] Parsed JSON data:', data);
  return { data, mcpMeta: mcpMeta ? JSON.parse(mcpMeta) : null };
}

// Exemplo de uso:
// import { mcpFetch } from './mcpClient';
// const { data, mcpMeta } = await mcpFetch('/api/games/quiz/questions/', {}, { user: '123', session: 'abc' });
