import { Home, PieChart, Plus, Calendar, Target } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { id: 'home', path: '/', icon: Home, label: 'Home' },
    { id: 'analytics', path: '/analytics', icon: PieChart, label: 'Analytics' },
    { id: 'add', path: '/add-asset', icon: Plus, label: 'Add', isAction: true },
    { id: 'calendar', path: '/calendar', icon: Calendar, label: 'Calendar' },
    { id: 'goals', path: '/goals', icon: Target, label: 'Goals' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-bottom z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          if (item.isAction) {
            return (
              <button
                key={item.id}
                className="flex flex-col items-center justify-center -mt-6"
                onClick={() => handleNavigation(item.path)}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
                  isActive 
                    ? 'bg-primary scale-110' 
                    : 'bg-accent hover:scale-105'
                }`}>
                  <Icon className={`h-6 w-6 ${isActive ? 'text-primary-foreground' : 'text-accent-foreground'}`} />
                </div>
              </button>
            );
          }
          
          return (
            <button
              key={item.id}
              className="flex flex-col items-center justify-center min-w-[64px] py-2 touch-target"
              onClick={() => handleNavigation(item.path)}
            >
              <Icon 
                className={`h-6 w-6 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`} 
              />
              <span 
                className={`text-xs mt-1 transition-colors ${
                  isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
