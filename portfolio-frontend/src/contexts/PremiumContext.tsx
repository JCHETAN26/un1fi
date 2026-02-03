import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { revenueCat, SubscriptionPackage, PREMIUM_ENTITLEMENT_ID } from '@/lib/revenuecat';
import { CustomerInfo } from '@revenuecat/purchases-capacitor';

interface PremiumContextType {
  isPremium: boolean;
  isLoading: boolean;
  packages: SubscriptionPackage[];
  customerInfo: CustomerInfo | null;
  purchasePackage: (pkg: SubscriptionPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  refreshStatus: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  useEffect(() => {
    initializeRevenueCat();
  }, []);

  const initializeRevenueCat = async () => {
    try {
      await revenueCat.initialize();
      await refreshStatus();
      await loadOfferings();
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStatus = async () => {
    try {
      const premium = await revenueCat.checkPremiumStatus();
      setIsPremium(premium);
      
      const info = await revenueCat.getCustomerInfo();
      setCustomerInfo(info);
    } catch (error) {
      console.error('Failed to refresh status:', error);
    }
  };

  const loadOfferings = async () => {
    try {
      const offerings = await revenueCat.getOfferings();
      setPackages(offerings);
    } catch (error) {
      console.error('Failed to load offerings:', error);
    }
  };

  const purchasePackage = async (pkg: SubscriptionPackage): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await revenueCat.purchasePackage(pkg.package);
      
      if (result.success) {
        setIsPremium(true);
        if (result.customerInfo) {
          setCustomerInfo(result.customerInfo);
        }
      }
      
      return result.success;
    } catch (error) {
      console.error('Purchase failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await revenueCat.restorePurchases();
      
      if (result.success) {
        setIsPremium(true);
        if (result.customerInfo) {
          setCustomerInfo(result.customerInfo);
        }
      }
      
      return result.success;
    } catch (error) {
      console.error('Restore failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        isLoading,
        packages,
        customerInfo,
        purchasePackage,
        restorePurchases,
        refreshStatus,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
}
