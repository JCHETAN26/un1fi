import { User } from 'lucide-react';

export const MobileHeader = () => {
  return (
    <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border safe-area-top z-40">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-sm text-muted-foreground">Good morning</p>
          <h1 className="text-lg font-semibold">Welcome back!</h1>
        </div>
        <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center touch-target">
          <User className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
};
