import { useState } from 'react';
import { usePremium } from '@/contexts/PremiumContext';
import { Button } from '@/components/ui/button';
import { 
  Crown, Check, X, Sparkles, Shield, TrendingUp, 
  PieChart, Bell, Zap, ArrowLeft, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface PaywallProps {
  onClose?: () => void;
  showBackButton?: boolean;
}

const features = [
  { icon: PieChart, title: 'Advanced Analytics', description: 'Deep dive into your portfolio performance' },
  { icon: TrendingUp, title: 'Risk Analysis', description: 'Understand your portfolio risk profile' },
  { icon: Sparkles, title: 'AI Recommendations', description: 'Get personalized investment suggestions' },
  { icon: Shield, title: 'Diversification Score', description: 'Optimize your asset allocation' },
  { icon: Bell, title: 'Smart Alerts', description: 'Never miss important market movements' },
  { icon: Zap, title: 'Real-time Sync', description: 'Instant updates across all platforms' },
];

export const Paywall = ({ onClose, showBackButton = true }: PaywallProps) => {
  const navigate = useNavigate();
  const { packages, purchasePackage, restorePurchases, isLoading } = usePremium();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(
    packages.find(p => p.isPopular)?.id || packages[0]?.id || null
  );
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePurchase = async () => {
    const pkg = packages.find(p => p.id === selectedPackage);
    if (!pkg) return;

    setIsPurchasing(true);
    try {
      const success = await purchasePackage(pkg);
      if (success) {
        toast.success('Welcome to Premium! 🎉');
        onClose?.();
        navigate('/');
      }
    } catch (error) {
      toast.error('Purchase failed. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setIsPurchasing(true);
    try {
      const success = await restorePurchases();
      if (success) {
        toast.success('Purchases restored successfully!');
        onClose?.();
        navigate('/');
      } else {
        toast.info('No previous purchases found.');
      }
    } catch (error) {
      toast.error('Failed to restore purchases.');
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with gradient */}
      <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 pt-12 pb-20 px-4">
        {showBackButton && (
          <button 
            onClick={() => { onClose ? onClose() : navigate(-1); }}
            className="absolute top-4 left-4 p-2 text-white/80 hover:text-white"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        )}
        
        <button 
          onClick={() => { onClose ? onClose() : navigate(-1); }}
          className="absolute top-4 right-4 p-2 text-white/80 hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="text-center text-white">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
            <Crown className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Unlock Premium</h1>
          <p className="text-white/90 max-w-xs mx-auto">
            Get the most out of your investments with advanced tools
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-10 space-y-6 pb-8">
        {/* Package Selection */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-lg">
          <p className="text-sm font-medium text-muted-foreground mb-3">Choose your plan</p>
          <div className="space-y-3">
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all relative ${
                  selectedPackage === pkg.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {pkg.isPopular && (
                  <span className="absolute -top-2 right-4 bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                    Best Value
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="font-semibold">{pkg.title}</p>
                    <p className="text-sm text-muted-foreground">{pkg.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{pkg.price}</p>
                    {pkg.pricePerMonth && (
                      <p className="text-xs text-green-600">{pkg.pricePerMonth}</p>
                    )}
                  </div>
                </div>
                {selectedPackage === pkg.id && (
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-sm font-medium text-muted-foreground mb-3">What you'll get</p>
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-start gap-2 p-2">
                  <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-tight">{feature.title}</p>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subscribe Button */}
        <Button
          onClick={handlePurchase}
          disabled={isPurchasing || isLoading || !selectedPackage}
          className="w-full h-14 text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
        >
          {isPurchasing ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Crown className="h-5 w-5 mr-2" />
              Subscribe Now
            </>
          )}
        </Button>

        {/* Restore & Terms */}
        <div className="text-center space-y-2">
          <button
            onClick={handleRestore}
            disabled={isPurchasing}
            className="text-sm text-primary hover:underline"
          >
            Restore Purchases
          </button>
          <p className="text-xs text-muted-foreground px-4">
            Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period. 
            Manage subscriptions in your device settings.
          </p>
          <div className="flex justify-center gap-4 text-xs text-muted-foreground">
            <button className="hover:underline">Privacy Policy</button>
            <button className="hover:underline">Terms of Use</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Paywall;
