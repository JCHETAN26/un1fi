import { Shield, ChevronRight } from 'lucide-react';

export const MobilePremiumBanner = () => {
  return (
    <div className="px-4 animate-slide-up">
      <div className="bg-gradient-to-r from-accent/20 to-accent/10 rounded-xl p-4 border border-accent/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
            <Shield className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">Premium Risk Analysis</h3>
            <p className="text-xs text-muted-foreground">Get AI-powered insights</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        </div>
      </div>
    </div>
  );
};
