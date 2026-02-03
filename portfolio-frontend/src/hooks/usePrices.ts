import { useState, useEffect, useCallback } from 'react';
import { priceService, PriceData } from '@/lib/priceService';

interface UsePricesOptions {
  refreshInterval?: number; // in milliseconds
  enabled?: boolean;
}

export function useStockPrice(symbol: string, options: UsePricesOptions = {}) {
  const { refreshInterval = 60000, enabled = true } = options;
  const [price, setPrice] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrice = useCallback(async () => {
    if (!enabled || !symbol) return;
    try {
      const data = await priceService.getStockPrice(symbol);
      setPrice(data);
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [symbol, enabled]);

  useEffect(() => {
    fetchPrice();
    if (refreshInterval > 0) {
      const interval = setInterval(fetchPrice, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchPrice, refreshInterval]);

  return { price, loading, error, refetch: fetchPrice };
}

export function useCryptoPrice(symbol: string, options: UsePricesOptions = {}) {
  const { refreshInterval = 60000, enabled = true } = options;
  const [price, setPrice] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrice = useCallback(async () => {
    if (!enabled || !symbol) return;
    try {
      const data = await priceService.getCryptoPrice(symbol);
      setPrice(data);
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [symbol, enabled]);

  useEffect(() => {
    fetchPrice();
    if (refreshInterval > 0) {
      const interval = setInterval(fetchPrice, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchPrice, refreshInterval]);

  return { price, loading, error, refetch: fetchPrice };
}

export function useGoldPrice(options: UsePricesOptions = {}) {
  const { refreshInterval = 60000, enabled = true } = options;
  const [price, setPrice] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrice = useCallback(async () => {
    if (!enabled) return;
    try {
      const data = await priceService.getGoldPrice();
      setPrice(data);
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchPrice();
    if (refreshInterval > 0) {
      const interval = setInterval(fetchPrice, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchPrice, refreshInterval]);

  return { price, loading, error, refetch: fetchPrice };
}

export function useSilverPrice(options: UsePricesOptions = {}) {
  const { refreshInterval = 60000, enabled = true } = options;
  const [price, setPrice] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrice = useCallback(async () => {
    if (!enabled) return;
    try {
      const data = await priceService.getSilverPrice();
      setPrice(data);
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchPrice();
    if (refreshInterval > 0) {
      const interval = setInterval(fetchPrice, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchPrice, refreshInterval]);

  return { price, loading, error, refetch: fetchPrice };
}

// Hook to get live prices for multiple assets
export function useLivePrices(
  assets: Array<{ id: string; category: string; symbol: string }>,
  options: UsePricesOptions = {}
) {
  const { refreshInterval = 60000, enabled = true } = options;
  const [prices, setPrices] = useState<Map<string, PriceData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrices = useCallback(async () => {
    if (!enabled || assets.length === 0) return;
    try {
      const results = await priceService.getMultiplePrices(
        assets.map(a => ({ category: a.category, symbol: a.symbol }))
      );
      setPrices(results);
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [assets, enabled]);

  useEffect(() => {
    fetchPrices();
    if (refreshInterval > 0) {
      const interval = setInterval(fetchPrices, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchPrices, refreshInterval]);

  // Helper to get price for a specific asset
  const getPrice = (category: string, symbol: string): PriceData | undefined => {
    return prices.get(`${category}:${symbol}`);
  };

  return { prices, loading, error, refetch: fetchPrices, getPrice };
}
