import { Shield, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PremiumBanner = () => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary to-primary/80 p-6 md:p-8 animate-fade-in">
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-accent/20 backdrop-blur-sm">
            <Shield className="h-6 w-6 text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-primary-foreground">Portfolio Risk Analysis</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                <Sparkles className="h-3 w-3" />
                Premium
              </span>
            </div>
            <p className="text-primary-foreground/80 text-sm max-w-md">
              Get AI-powered insights on your portfolio diversification, risk exposure, and personalized recommendations to optimize returns.
            </p>
          </div>
        </div>
        
        <Button 
          variant="secondary" 
          className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-lg"
        >
          Analyze Risk
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
