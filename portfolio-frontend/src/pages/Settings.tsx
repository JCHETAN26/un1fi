import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileHeader } from '@/components/MobileHeader';
import { BottomNav } from '@/components/BottomNav';
import { usePremium } from '@/contexts/PremiumContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  User, Bell, Shield, CreditCard, Moon, Sun,
  ChevronRight, LogOut, Download, HelpCircle,
  Globe, Palette, Lock, Smartphone, Mail,
  Crown, Check, ExternalLink
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { authApi } from '@/lib/api';

const Settings = () => {
  const navigate = useNavigate();
  const { isPremium, isLoading: isPremiumLoading } = usePremium();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [user, setUser] = useState<{ name: string, email: string } | null>({
    name: 'Demo User',
    email: 'demo@example.com',
  });
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [biometric, setBiometric] = useState(false);

  const handleLogout = async () => {
    toast.success('Signed out (Demo session cleared)');
  };

  const isDarkMode = resolvedTheme === 'dark';

  const toggleDarkMode = (enabled: boolean) => {
    setTheme(enabled ? 'dark' : 'light');
    toast.success(enabled ? 'Dark mode enabled' : 'Light mode enabled');
  };


  const handleExportData = () => {
    toast.success('Preparing your data export...');
  };

  const SettingItem = ({
    icon: Icon,
    label,
    value,
    onClick,
    toggle,
    checked,
    onCheckedChange,
    badge
  }: {
    icon: React.ElementType;
    label: string;
    value?: string;
    onClick?: () => void;
    toggle?: boolean;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    badge?: string;
  }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors"
    >
      <div className="p-2 bg-secondary rounded-lg">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <p className="font-medium">{label}</p>
          {badge && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        {value && <p className="text-sm text-muted-foreground">{value}</p>}
      </div>
      {toggle ? (
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
      ) : (
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      )}
    </button>
  );

  const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3 bg-secondary/30">
        {title}
      </p>
      <div className="divide-y divide-border">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader />

      <main className="px-4 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your account and preferences</p>
        </div>

        {/* Profile Card */}
        {user && (
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-5 text-primary-foreground">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-primary-foreground/80 text-sm">{user.email}</p>
                {isPremium ? (
                  <div className="flex items-center gap-1 mt-1">
                    <Crown className="h-4 w-4 text-yellow-300" />
                    <span className="text-xs font-medium">Premium Member</span>
                  </div>
                ) : (
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full mt-1 inline-block">
                    Free Plan
                  </span>
                )}
              </div>
              <ChevronRight className="h-6 w-6 opacity-60" />
            </div>
          </div>
        )}

        {/* Premium Upgrade */}
        {!isPremium && (
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-4 border border-amber-500/20">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Crown className="h-6 w-6 text-amber-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Upgrade to Premium</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Get advanced analytics, risk analysis, and personalized recommendations.
                </p>
                <ul className="space-y-1 mb-4">
                  {['Diversification analysis', 'Risk assessment', 'Rebalancing suggestions', 'Priority support'].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => navigate('/premium')}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  Upgrade to Premium
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Premium Status */}
        {isPremium && (
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-4 border border-amber-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Crown className="h-6 w-6 text-amber-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Premium Active</h3>
                <p className="text-sm text-muted-foreground">
                  You have access to all premium features
                </p>
              </div>
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </div>
          </div>
        )}

        {/* Preferences */}
        <SettingSection title="Preferences">
          <SettingItem
            icon={isDarkMode ? Moon : Sun}
            label="Dark Mode"
            toggle
            checked={isDarkMode}
            onCheckedChange={toggleDarkMode}
          />
          <SettingItem
            icon={Globe}
            label="Currency"
            value="USD ($)"
            onClick={() => toast.info('Currency selector coming soon')}
          />
          <SettingItem
            icon={Palette}
            label="App Theme"
            value="Default"
            onClick={() => toast.info('Theme customization coming soon')}
          />
        </SettingSection>

        {/* Notifications */}
        <SettingSection title="Notifications">
          <SettingItem
            icon={Bell}
            label="Enable Notifications"
            toggle
            checked={notifications}
            onCheckedChange={setNotifications}
          />
          <SettingItem
            icon={Smartphone}
            label="Push Notifications"
            toggle
            checked={pushAlerts}
            onCheckedChange={setPushAlerts}
          />
          <SettingItem
            icon={Mail}
            label="Email Alerts"
            toggle
            checked={emailAlerts}
            onCheckedChange={setEmailAlerts}
          />
        </SettingSection>

        {/* Security */}
        <SettingSection title="Security">
          <SettingItem
            icon={Lock}
            label="Change Password"
            onClick={() => toast.info('Password change coming soon')}
          />
          <SettingItem
            icon={Shield}
            label="Biometric Login"
            value="Face ID / Touch ID"
            toggle
            checked={biometric}
            onCheckedChange={setBiometric}
          />
        </SettingSection>

        {/* Data */}
        <SettingSection title="Data & Privacy">
          <SettingItem
            icon={Download}
            label="Export Data"
            value="Download all your data"
            onClick={handleExportData}
          />
          <SettingItem
            icon={CreditCard}
            label="Connected Accounts"
            value="3 platforms linked"
            badge="Manage"
            onClick={() => toast.info('Account management coming soon')}
          />
        </SettingSection>

        {/* Support */}
        <SettingSection title="Support">
          <SettingItem
            icon={HelpCircle}
            label="Help Center"
            onClick={() => toast.info('Opening help center...')}
          />
          <SettingItem
            icon={ExternalLink}
            label="Terms of Service"
            onClick={() => toast.info('Opening terms...')}
          />
        </SettingSection>

        {/* Logout */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full text-destructive border-destructive/20 hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>

        {/* App Version */}
        <p className="text-center text-xs text-muted-foreground">
          un1fi v1.0.0
        </p>
      </main>

      <BottomNav />
    </div>
  );
};

export default Settings;
