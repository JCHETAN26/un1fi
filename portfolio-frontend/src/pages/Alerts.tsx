import { useState } from 'react';
import { MobileHeader } from '@/components/MobileHeader';
import { BottomNav } from '@/components/BottomNav';
import { 
  Bell, BellOff, TrendingUp, TrendingDown, Calendar, 
  ChevronRight, Plus, Trash2, Clock, DollarSign,
  AlertTriangle, CheckCircle2, XCircle, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Alert {
  id: string;
  type: 'price_above' | 'price_below' | 'maturity' | 'rebalance';
  asset: string;
  condition: string;
  value?: number;
  date?: string;
  isActive: boolean;
  triggered?: boolean;
}

const mockAlerts: Alert[] = [
  { 
    id: '1', 
    type: 'price_above', 
    asset: 'Apple Inc.', 
    condition: 'Price rises above', 
    value: 200, 
    isActive: true 
  },
  { 
    id: '2', 
    type: 'price_below', 
    asset: 'Bitcoin', 
    condition: 'Price falls below', 
    value: 40000, 
    isActive: true 
  },
  { 
    id: '3', 
    type: 'maturity', 
    asset: 'Treasury Bond 3Y', 
    condition: 'Matures on', 
    date: '2026-06-15', 
    isActive: true 
  },
  { 
    id: '4', 
    type: 'rebalance', 
    asset: 'Portfolio', 
    condition: 'Monthly rebalance reminder', 
    isActive: false 
  },
];

const triggeredAlerts = [
  {
    id: 't1',
    type: 'price_above',
    asset: 'Gold (XAU)',
    message: 'Gold has risen above $2,000',
    time: '2 hours ago',
    status: 'success',
  },
  {
    id: 't2',
    type: 'price_below',
    asset: 'Microsoft',
    message: 'MSFT dropped below $350',
    time: '1 day ago',
    status: 'warning',
  },
];

const Alerts = () => {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAlert, setNewAlert] = useState({
    type: 'price_above' as 'price_above' | 'price_below' | 'maturity' | 'rebalance',
    asset: '',
    value: '',
    date: '',
  });

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ));
    toast.success('Alert updated');
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
    toast.success('Alert deleted');
  };

  const createAlert = () => {
    if (!newAlert.asset) {
      toast.error('Please enter an asset name');
      return;
    }

    const alert: Alert = {
      id: Date.now().toString(),
      type: newAlert.type,
      asset: newAlert.asset,
      condition: newAlert.type === 'price_above' ? 'Price rises above' :
                 newAlert.type === 'price_below' ? 'Price falls below' :
                 newAlert.type === 'maturity' ? 'Matures on' : 'Reminder',
      value: newAlert.value ? parseFloat(newAlert.value) : undefined,
      date: newAlert.date || undefined,
      isActive: true,
    };

    setAlerts([alert, ...alerts]);
    setShowCreateModal(false);
    setNewAlert({ type: 'price_above', asset: '', value: '', date: '' });
    toast.success('Alert created!');
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'price_above': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'price_below': return <TrendingDown className="h-5 w-5 text-red-500" />;
      case 'maturity': return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'rebalance': return <Clock className="h-5 w-5 text-purple-500" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader />

      <main className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Alerts</h1>
            <p className="text-muted-foreground text-sm">Stay informed about your investments</p>
          </div>
          <Button size="sm" className="gap-1" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" />
            New
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-3 border border-border text-center">
            <Bell className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{alerts.filter(a => a.isActive).length}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="bg-card rounded-xl p-3 border border-border text-center">
            <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-green-500" />
            <p className="text-2xl font-bold">{triggeredAlerts.length}</p>
            <p className="text-xs text-muted-foreground">Triggered</p>
          </div>
          <div className="bg-card rounded-xl p-3 border border-border text-center">
            <BellOff className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">{alerts.filter(a => !a.isActive).length}</p>
            <p className="text-xs text-muted-foreground">Paused</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-secondary rounded-lg p-1">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'active' 
                ? 'bg-background shadow-sm' 
                : 'text-muted-foreground'
            }`}
          >
            Active Alerts
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'history' 
                ? 'bg-background shadow-sm' 
                : 'text-muted-foreground'
            }`}
          >
            History
          </button>
        </div>

        {/* Active Alerts */}
        {activeTab === 'active' && (
          <div className="space-y-3 animate-fade-in">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className={`bg-card rounded-xl p-4 border transition-opacity ${
                  alert.isActive ? 'border-border' : 'border-border opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-secondary rounded-lg">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{alert.asset}</p>
                    <p className="text-sm text-muted-foreground">
                      {alert.condition}
                      {alert.value && ` $${alert.value.toLocaleString()}`}
                      {alert.date && ` ${new Date(alert.date).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={alert.isActive} 
                      onCheckedChange={() => toggleAlert(alert.id)}
                    />
                    <button 
                      onClick={() => deleteAlert(alert.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {alerts.length === 0 && (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No alerts set up yet</p>
                <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Alert
                </Button>
              </div>
            )}
          </div>
        )}

        {/* History */}
        {activeTab === 'history' && (
          <div className="space-y-3 animate-fade-in">
            {triggeredAlerts.map((alert) => (
              <div 
                key={alert.id}
                className="bg-card rounded-xl p-4 border border-border"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-secondary rounded-lg">
                    {getStatusIcon(alert.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{alert.asset}</p>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Alert Card */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
          <h3 className="font-semibold mb-2">💡 Pro Tip</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Set price alerts to buy low and sell high. Get notified when your fixed income investments mature.
          </p>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" />
            Create Smart Alert
          </Button>
        </div>
      </main>

      {/* Create Alert Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Alert</DialogTitle>
            <DialogDescription>
              Set up a new price or maturity alert for your investments.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Alert Type */}
            <div>
              <Label className="mb-2 block">Alert Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: 'price_above', label: 'Price Above', icon: TrendingUp, color: 'text-green-500' },
                  { type: 'price_below', label: 'Price Below', icon: TrendingDown, color: 'text-red-500' },
                  { type: 'maturity', label: 'Maturity', icon: Calendar, color: 'text-blue-500' },
                  { type: 'rebalance', label: 'Reminder', icon: Clock, color: 'text-purple-500' },
                ].map(({ type, label, icon: Icon, color }) => (
                  <button
                    key={type}
                    onClick={() => setNewAlert({ ...newAlert, type: type as any })}
                    className={`p-3 rounded-lg border-2 flex items-center gap-2 transition-all ${
                      newAlert.type === type 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${color}`} />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Asset Name */}
            <div>
              <Label htmlFor="asset">Asset Name</Label>
              <Input
                id="asset"
                placeholder="e.g., Apple Inc., Bitcoin"
                value={newAlert.asset}
                onChange={(e) => setNewAlert({ ...newAlert, asset: e.target.value })}
                className="mt-1.5"
              />
            </div>

            {/* Price Value (for price alerts) */}
            {(newAlert.type === 'price_above' || newAlert.type === 'price_below') && (
              <div>
                <Label htmlFor="value">Target Price ($)</Label>
                <Input
                  id="value"
                  type="number"
                  placeholder="0.00"
                  value={newAlert.value}
                  onChange={(e) => setNewAlert({ ...newAlert, value: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            )}

            {/* Date (for maturity/reminder) */}
            {(newAlert.type === 'maturity' || newAlert.type === 'rebalance') && (
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newAlert.date}
                  onChange={(e) => setNewAlert({ ...newAlert, date: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={createAlert}>
              <Bell className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default Alerts;
