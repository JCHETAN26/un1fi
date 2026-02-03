import { Bell, Settings, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PremiumHeader = () => {
  const navigate = useNavigate();
  const currentHour = new Date().getHours();
  
  const getGreeting = () => {
    if (currentHour < 12) return 'Good morning';
    if (currentHour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="safe-area-top" />
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-sm text-muted-foreground">{getGreeting()}</p>
          <h1 className="text-xl font-bold tracking-tight">
            un<span className="text-primary">1</span>fi
          </h1>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={() => navigate('/alerts')}
            className="relative p-2.5 hover:bg-secondary rounded-xl transition-colors"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            {/* Notification dot */}
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
          </button>
          <button 
            onClick={() => navigate('/settings')}
            className="p-2.5 hover:bg-secondary rounded-xl transition-colors"
          >
            <Settings className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
};
