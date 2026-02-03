import { Asset, PortfolioSummary, AllocationData } from '@/types/portfolio';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper for auth token
const getAuthToken = () => localStorage.getItem('authToken');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
});

import { supabaseApi } from './supabaseApi';
import { supabase } from './supabase';

// Auth API (Bypassed for now)
export const authApi = {
  async login(email: string, password: string) {
    return { user: { id: 'demo-user', email: 'demo@example.com' } };
  },

  async register(email: string, password: string, name: string) {
    return { user: { id: 'demo-user', email: 'demo@example.com' } };
  },

  async logout() {
    console.log('Logout bypassed');
  },

  async isAuthenticated() {
    return true;
  },
};

// Portfolio API
export const portfolioApi = {
  async getPortfolios() {
    const response = await fetch(`${API_BASE_URL}/portfolios`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch portfolios');
    return response.json();
  },

  async getPortfolio(id: string) {
    const response = await fetch(`${API_BASE_URL}/portfolios/${id}`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch portfolio');
    return response.json();
  },

  async createPortfolio(name: string, description?: string) {
    const response = await fetch(`${API_BASE_URL}/portfolios`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ name, description }),
    });
    if (!response.ok) throw new Error('Failed to create portfolio');
    return response.json();
  },
};

// Asset/Investment types for the API
export interface CreateAssetPayload {
  category: string;
  name: string;
  symbol?: string;
  quantity: number;
  purchasePrice: number;
  currentPrice?: number;
  platform?: string;
  purchaseDate: string;
  maturityDate?: string;
  interestRate?: number;
  notes?: string;
  currency?: string;
  isLiability?: boolean;
  metadata?: any;
}

// Local storage helpers for offline/demo mode
const LOCAL_ASSETS_KEY = 'un1fi_assets';
const LOCAL_PORTFOLIO_KEY = 'un1fi_portfolio_id';

function getLocalAssets(): CreateAssetPayload[] {
  try {
    const data = localStorage.getItem(LOCAL_ASSETS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocalAsset(asset: CreateAssetPayload): CreateAssetPayload & { id: string } {
  const assets = getLocalAssets();
  const newAsset = { ...asset, id: `local_${Date.now()}` };
  assets.push(newAsset);
  localStorage.setItem(LOCAL_ASSETS_KEY, JSON.stringify(assets));
  return newAsset;
}

function getOrCreateLocalPortfolioId(): string {
  let id = localStorage.getItem(LOCAL_PORTFOLIO_KEY);
  if (!id) {
    id = `demo_${Date.now()}`;
    localStorage.setItem(LOCAL_PORTFOLIO_KEY, id);
  }
  return id;
}

// Investment API
export const investmentApi = {
  async getInvestments() {
    return getLocalAssets();
  },

  async createInvestment(asset: CreateAssetPayload) {
    return saveLocalAsset(asset);
  },

  async updatePrice(investmentId: string, currentPrice: number) {
    const assets = getLocalAssets();
    const idx = assets.findIndex((a: any) => a.id === investmentId);
    if (idx >= 0) {
      (assets[idx] as any).currentPrice = currentPrice;
      localStorage.setItem(LOCAL_ASSETS_KEY, JSON.stringify(assets));
      return assets[idx];
    }
    return null;
  },

  async deleteInvestment(investmentId: string) {
    const assets = getLocalAssets();
    const filtered = assets.filter((a: any) => a.id !== investmentId);
    localStorage.setItem(LOCAL_ASSETS_KEY, JSON.stringify(filtered));
    return { success: true };
  },

  async getAssets() {
    return this.getInvestments();
  },

  clearLocalAssets() {
    localStorage.removeItem(LOCAL_ASSETS_KEY);
  },
};

// Analytics API
export const analyticsApi = {
  async getAnalytics(portfolioId: string) {
    const response = await fetch(`${API_BASE_URL}/analytics/${portfolioId}`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch analytics');
    return response.json();
  },

  async getPremiumAnalytics(portfolioId: string) {
    const response = await fetch(`${API_BASE_URL}/analytics/${portfolioId}/premium`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch premium analytics');
    return response.json();
  },

  async getHistory(userId: string) {
    const response = await fetch(`${API_BASE_URL}/analytics/history/${userId}`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch history');
    return response.json();
  },

  async getComparison(userId: string) {
    const response = await fetch(`${API_BASE_URL}/analytics/comparison/${userId}`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch comparison');
    return response.json();
  },
};

// Price API (for real-time updates)
export const priceApi = {
  async getStockPrice(symbol: string) {
    const response = await fetch(`${API_BASE_URL}/prices/stock/${symbol}`, {
      headers: authHeaders(),
    });
    if (!response.ok) return null;
    return response.json();
  },

  async getCryptoPrice(symbol: string) {
    const response = await fetch(`${API_BASE_URL}/prices/crypto/${symbol}`, {
      headers: authHeaders(),
    });
    if (!response.ok) return null;
    return response.json();
  },
};
