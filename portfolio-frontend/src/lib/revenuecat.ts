import { Purchases, LOG_LEVEL, PurchasesPackage, CustomerInfo } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

// RevenueCat API Keys
const REVENUECAT_IOS_API_KEY = 'test_EgCFrewPHSLuFTeflUjdEYZJrMW';
const REVENUECAT_ANDROID_API_KEY = 'test_EgCFrewPHSLuFTeflUjdEYZJrMW';

// Premium entitlement identifier configured in RevenueCat
export const PREMIUM_ENTITLEMENT_ID = 'un1fi Pro';

// Product identifiers
export const PRODUCTS = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  LIFETIME: 'lifetime',
} as const;

export interface SubscriptionPackage {
  id: string;
  title: string;
  description: string;
  price: string;
  pricePerMonth?: string;
  package: PurchasesPackage;
  isPopular?: boolean;
}

class RevenueCatService {
  private initialized = false;
  private isNative = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    this.isNative = Capacitor.isNativePlatform();

    if (!this.isNative) {
      console.log('RevenueCat: Running in web mode (mock)');
      this.initialized = true;
      return;
    }

    try {
      const platform = Capacitor.getPlatform();
      const apiKey = platform === 'ios' ? REVENUECAT_IOS_API_KEY : REVENUECAT_ANDROID_API_KEY;

      await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
      
      await Purchases.configure({
        apiKey,
        appUserID: null, // Let RevenueCat generate anonymous ID
      });

      this.initialized = true;
      console.log('RevenueCat: Initialized successfully');
    } catch (error) {
      console.error('RevenueCat: Failed to initialize', error);
      throw error;
    }
  }

  async identifyUser(userId: string): Promise<void> {
    if (!this.isNative) {
      console.log('RevenueCat: Mock identify user', userId);
      return;
    }

    try {
      await Purchases.logIn({ appUserID: userId });
      console.log('RevenueCat: User identified', userId);
    } catch (error) {
      console.error('RevenueCat: Failed to identify user', error);
      throw error;
    }
  }

  async logoutUser(): Promise<void> {
    if (!this.isNative) return;

    try {
      await Purchases.logOut();
      console.log('RevenueCat: User logged out');
    } catch (error) {
      console.error('RevenueCat: Failed to logout', error);
    }
  }

  async getOfferings(): Promise<SubscriptionPackage[]> {
    if (!this.isNative) {
      // Return mock data for web testing
      return [
        {
          id: 'monthly',
          title: 'Monthly',
          description: 'Billed monthly',
          price: '$9.99/month',
          package: {} as PurchasesPackage,
        },
        {
          id: 'yearly',
          title: 'Yearly',
          description: 'Billed annually',
          price: '$79.99/year',
          pricePerMonth: '$6.67/month',
          package: {} as PurchasesPackage,
          isPopular: true,
        },
      ];
    }

    try {
      const offerings = await Purchases.getOfferings();
      
      if (!offerings.current) {
        console.log('RevenueCat: No current offering found');
        return [];
      }

      const packages: SubscriptionPackage[] = [];

      offerings.current.availablePackages.forEach((pkg) => {
        const product = pkg.product;
        
        packages.push({
          id: pkg.identifier,
          title: product.title || pkg.identifier,
          description: product.description || '',
          price: product.priceString,
          pricePerMonth: pkg.identifier.includes('annual') || pkg.identifier.includes('yearly')
            ? `${(product.price / 12).toFixed(2)}/month`
            : undefined,
          package: pkg,
          isPopular: pkg.identifier.includes('annual') || pkg.identifier.includes('yearly'),
        });
      });

      return packages;
    } catch (error) {
      console.error('RevenueCat: Failed to get offerings', error);
      return [];
    }
  }

  async purchasePackage(pkg: PurchasesPackage): Promise<{ success: boolean; customerInfo?: CustomerInfo }> {
    if (!this.isNative) {
      console.log('RevenueCat: Mock purchase', pkg);
      return { success: true };
    }

    try {
      const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
      
      const isPremium = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;
      
      return { success: isPremium, customerInfo };
    } catch (error: any) {
      if (error.userCancelled) {
        console.log('RevenueCat: Purchase cancelled by user');
        return { success: false };
      }
      console.error('RevenueCat: Purchase failed', error);
      throw error;
    }
  }

  async restorePurchases(): Promise<{ success: boolean; customerInfo?: CustomerInfo }> {
    if (!this.isNative) {
      console.log('RevenueCat: Mock restore purchases');
      return { success: false };
    }

    try {
      const { customerInfo } = await Purchases.restorePurchases();
      
      const isPremium = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;
      
      return { success: isPremium, customerInfo };
    } catch (error) {
      console.error('RevenueCat: Failed to restore purchases', error);
      throw error;
    }
  }

  async checkPremiumStatus(): Promise<boolean> {
    if (!this.isNative) {
      // For web testing, check localStorage
      return localStorage.getItem('un1fi_premium_mock') === 'true';
    }

    try {
      const { customerInfo } = await Purchases.getCustomerInfo();
      return customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;
    } catch (error) {
      console.error('RevenueCat: Failed to check premium status', error);
      return false;
    }
  }

  async getCustomerInfo(): Promise<CustomerInfo | null> {
    if (!this.isNative) return null;

    try {
      const { customerInfo } = await Purchases.getCustomerInfo();
      return customerInfo;
    } catch (error) {
      console.error('RevenueCat: Failed to get customer info', error);
      return null;
    }
  }

  // For web testing purposes
  mockSetPremium(isPremium: boolean): void {
    if (!this.isNative) {
      localStorage.setItem('un1fi_premium_mock', isPremium.toString());
    }
  }
}

export const revenueCat = new RevenueCatService();
export default revenueCat;
