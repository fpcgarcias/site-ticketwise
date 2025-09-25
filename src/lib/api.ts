// API Client para comunicação com o backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Tipos para autenticação
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  company_id?: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role?: string;
  company_id?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Classe para gerenciar API
class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.loadTokenFromStorage();
  }

  // Carregar token do localStorage
  private loadTokenFromStorage() {
    this.accessToken = localStorage.getItem('accessToken');
  }

  // Salvar tokens no localStorage
  private saveTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    this.accessToken = accessToken;
  }

  // Limpar tokens
  private clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.accessToken = null;
  }

  // Fazer requisição HTTP
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Adicionar token de autorização se disponível
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Se token expirou, tentar renovar
    if (response.status === 401 && this.accessToken) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Repetir requisição com novo token
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        const retryResponse = await fetch(url, {
          ...options,
          headers,
        });
        return this.handleResponse<T>(retryResponse);
      }
    }

    return this.handleResponse<T>(response);
  }

  // Processar resposta
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        error: 'Erro de conexão' 
      }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Registrar usuário
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.request<{ success: boolean; data: AuthResponse }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    this.saveTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  }

  // Login
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await this.request<{ success: boolean; data: AuthResponse }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    this.saveTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } finally {
      this.clearTokens();
    }
  }

  // Renovar token
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      const response = await this.request<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });

      this.saveTokens(response.accessToken, response.refreshToken);
      return true;
    } catch {
      this.clearTokens();
      return false;
    }
  }

  // Obter usuário atual
  async getCurrentUser(): Promise<User | null> {
    try {
      if (!this.accessToken) return null;
      
      const response = await this.request<{ user: User }>('/auth/me');
      return response.user;
    } catch {
      return null;
    }
  }

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Verificar se usuário existe
  async checkUser(email: string): Promise<any> {
    return this.request('/auth/check-user', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  // Registro pré-checkout (usuário + empresa)
  async preCheckoutRegister(userData: any, companyData: any): Promise<any> {
    return this.request('/auth/pre-checkout-register', {
      method: 'POST',
      body: JSON.stringify({ userData, companyData })
    });
  }

  // Registrar empresa
  async registerCompany(data: any): Promise<any> {
    return this.request('/company/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Listar empresas
  async listCompanies(): Promise<any> {
    return this.request('/company/list');
  }

  // Enviar formulário de contato
  async sendContact(data: any): Promise<any> {
    return this.request('/contact/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Métodos do Stripe
  async createCheckoutSession(data: any): Promise<any> {
    return this.request('/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getStripeProducts(): Promise<any> {
    return this.request('/stripe/products');
  }

  async getStripePrices(productId?: string): Promise<any> {
    const url = productId ? `/stripe/prices?product_id=${productId}` : '/stripe/prices';
    return this.request(url);
  }

  // Obter subscription do usuário
  async getUserSubscription(): Promise<any> {
    return this.request('/stripe/user-subscription');
  }
}

// Instância global da API
export const api = new ApiClient(API_BASE_URL);

// Hook para usar a API no React
export const useApi = () => api;