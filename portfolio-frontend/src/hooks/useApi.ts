import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { portfolioApi, investmentApi, analyticsApi, authApi, CreateAssetPayload } from '@/lib/api';
import { Asset } from '@/types/portfolio';

// Auth hooks
export const useAuth = () => {
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({ email, password, name }: { email: string; password: string; name: string }) =>
      authApi.register(email, password, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    },
  });

  const logout = () => {
    authApi.logout();
    queryClient.clear();
  };

  return {
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isAuthenticated: authApi.isAuthenticated(),
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
};

// Portfolio hooks
export const usePortfolios = () => {
  return useQuery({
    queryKey: ['portfolios'],
    queryFn: portfolioApi.getPortfolios,
    enabled: authApi.isAuthenticated(),
  });
};

export const usePortfolio = (portfolioId: string) => {
  return useQuery({
    queryKey: ['portfolio', portfolioId],
    queryFn: () => portfolioApi.getPortfolio(portfolioId),
    enabled: !!portfolioId && authApi.isAuthenticated(),
  });
};

export const useCreatePortfolio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string }) =>
      portfolioApi.createPortfolio(name, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    },
  });
};

// Investment hooks
export const useInvestments = (portfolioId: string) => {
  return useQuery({
    queryKey: ['investments', portfolioId],
    queryFn: () => investmentApi.getInvestments(portfolioId),
    enabled: !!portfolioId && authApi.isAuthenticated(),
  });
};

export const useCreateInvestment = (portfolioId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (investment: CreateAssetPayload) =>
      investmentApi.createInvestment(investment, portfolioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments', portfolioId] });
      queryClient.invalidateQueries({ queryKey: ['portfolio', portfolioId] });
      queryClient.invalidateQueries({ queryKey: ['analytics', portfolioId] });
    },
  });
};

export const useUpdateInvestmentPrice = (portfolioId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ investmentId, currentPrice }: { investmentId: string; currentPrice: number }) =>
      investmentApi.updatePrice(investmentId, currentPrice, portfolioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments', portfolioId] });
      queryClient.invalidateQueries({ queryKey: ['analytics', portfolioId] });
    },
  });
};

export const useDeleteInvestment = (portfolioId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (investmentId: string) =>
      investmentApi.deleteInvestment(investmentId, portfolioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments', portfolioId] });
      queryClient.invalidateQueries({ queryKey: ['analytics', portfolioId] });
    },
  });
};

// Analytics hooks
export const useAnalytics = (portfolioId: string) => {
  return useQuery({
    queryKey: ['analytics', portfolioId],
    queryFn: () => analyticsApi.getAnalytics(portfolioId),
    enabled: !!portfolioId && authApi.isAuthenticated(),
  });
};

export const usePremiumAnalytics = (portfolioId: string) => {
  return useQuery({
    queryKey: ['premium-analytics', portfolioId],
    queryFn: () => analyticsApi.getPremiumAnalytics(portfolioId),
    enabled: !!portfolioId && authApi.isAuthenticated(),
  });
};
