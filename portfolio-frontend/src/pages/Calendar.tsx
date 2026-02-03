import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileHeader } from '@/components/MobileHeader';
import { BottomNav } from '@/components/BottomNav';
import { investmentApi } from '@/lib/api';
import { Asset } from '@/types/portfolio';
import { mockAssets } from '@/data/mockPortfolio';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Landmark, Coins, TrendingUp, Bell, Clock, DollarSign,
  AlertTriangle, CheckCircle2, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CalendarEvent {
  id: string;
  date: Date;
  type: 'maturity' | 'dividend' | 'interest' | 'reminder';
  title: string;
  description: string;
  amount?: number;
  assetId?: string;
  assetName: string;
  category: string;
}

const eventTypeConfig = {
  maturity: { 
    icon: Landmark, 
    color: 'bg-blue-500', 
    lightColor: 'bg-blue-500/10 text-blue-600',
    label: 'Maturity' 
  },
  dividend: { 
    icon: DollarSign, 
    color: 'bg-green-500', 
    lightColor: 'bg-green-500/10 text-green-600',
    label: 'Dividend' 
  },
  interest: { 
    icon: TrendingUp, 
    color: 'bg-purple-500', 
    lightColor: 'bg-purple-500/10 text-purple-600',
    label: 'Interest' 
  },
  reminder: { 
    icon: Bell, 
    color: 'bg-amber-500', 
    lightColor: 'bg-amber-500/10 text-amber-600',
    label: 'Reminder' 
  },
};

const Calendar = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      const data = await investmentApi.getAssets();
      const transformedAssets: Asset[] = data.map((item: any) => ({
        id: item.id || item._id,
        name: item.name,
        category: item.category || item.assetType,
        quantity: parseFloat(item.quantity) || 1,
        purchasePrice: parseFloat(item.purchasePrice) || 0,
        currentPrice: parseFloat(item.currentPrice) || parseFloat(item.purchasePrice) || 0,
        currency: item.currency || 'USD',
        platform: item.platform || '',
        lastUpdated: new Date(),
        maturityDate: item.maturityDate,
        interestRate: item.interestRate || item.expectedReturn,
      }));
      setAssets(transformedAssets.length > 0 ? transformedAssets : mockAssets);
    } catch (error) {
      setAssets(mockAssets);
    } finally {
      setLoading(false);
    }
  };

  // Generate calendar events from assets
  const events = useMemo(() => {
    const allEvents: CalendarEvent[] = [];

    assets.forEach(asset => {
      // Maturity dates for fixed income
      if (asset.maturityDate) {
        const maturityDate = new Date(asset.maturityDate);
        allEvents.push({
          id: `${asset.id}-maturity`,
          date: maturityDate,
          type: 'maturity',
          title: `${asset.name} Matures`,
          description: `Your ${asset.category.replace('_', ' ')} investment matures`,
          amount: asset.currentPrice * asset.quantity,
          assetId: asset.id,
          assetName: asset.name,
          category: asset.category,
        });

        // Add reminder 30 days before maturity
        const reminderDate = new Date(maturityDate);
        reminderDate.setDate(reminderDate.getDate() - 30);
        if (reminderDate > new Date()) {
          allEvents.push({
            id: `${asset.id}-maturity-reminder`,
            date: reminderDate,
            type: 'reminder',
            title: `${asset.name} Matures in 30 days`,
            description: 'Start planning your reinvestment strategy',
            assetId: asset.id,
            assetName: asset.name,
            category: asset.category,
          });
        }
      }

      // Quarterly interest payments for fixed income
      if (asset.interestRate && asset.category === 'fixed_income') {
        const today = new Date();
        for (let i = 0; i < 4; i++) {
          const interestDate = new Date(today.getFullYear(), (Math.floor(today.getMonth() / 3) + i) * 3 + 2, 15);
          if (interestDate > today) {
            const quarterlyInterest = (asset.currentPrice * asset.quantity * (asset.interestRate / 100)) / 4;
            allEvents.push({
              id: `${asset.id}-interest-${i}`,
              date: interestDate,
              type: 'interest',
              title: `${asset.name} Interest Payment`,
              description: `Quarterly interest at ${asset.interestRate}% APY`,
              amount: quarterlyInterest,
              assetId: asset.id,
              assetName: asset.name,
              category: asset.category,
            });
          }
        }
      }

      // Simulated dividend dates for stocks (quarterly)
      if (asset.category === 'stocks') {
        const today = new Date();
        const quarters = [2, 5, 8, 11];
        quarters.forEach((month, i) => {
          const divDate = new Date(today.getFullYear(), month, 15);
          if (divDate > today && divDate < new Date(today.getFullYear() + 1, today.getMonth(), 1)) {
            allEvents.push({
              id: `${asset.id}-dividend-${i}`,
              date: divDate,
              type: 'dividend',
              title: `${asset.name} Dividend`,
              description: 'Expected quarterly dividend payment',
              amount: asset.currentPrice * asset.quantity * 0.005,
              assetId: asset.id,
              assetName: asset.name,
              category: asset.category,
            });
          }
        });
      }
    });

    return allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [assets]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { daysInMonth: lastDay.getDate(), startingDay: firstDay.getDay() };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);

  const getEventsForDay = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return events.filter(e => 
      e.date.getFullYear() === date.getFullYear() &&
      e.date.getMonth() === date.getMonth() &&
      e.date.getDate() === date.getDate()
    );
  };

  const displayEvents = selectedDate 
    ? events.filter(e => 
        e.date.getFullYear() === selectedDate.getFullYear() &&
        e.date.getMonth() === selectedDate.getMonth() &&
        e.date.getDate() === selectedDate.getDate()
      )
    : events.filter(e => e.date >= new Date()).slice(0, 5);

  const navigateMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
    setSelectedDate(null);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return currentMonth.getFullYear() === today.getFullYear() &&
           currentMonth.getMonth() === today.getMonth() &&
           day === today.getDate();
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return currentMonth.getFullYear() === selectedDate.getFullYear() &&
           currentMonth.getMonth() === selectedDate.getMonth() &&
           day === selectedDate.getDate();
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  const upcomingTotals = useMemo(() => {
    const next30Days = events.filter(e => {
      const diff = (e.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 30 && e.amount;
    });
    return next30Days.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [events]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader />
      <main className="px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Financial Calendar</h1>
          <p className="text-muted-foreground text-sm">Your money's schedule</p>
        </div>

        {/* Upcoming Summary */}
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 text-primary-foreground">
          <div className="flex items-center gap-3 mb-3">
            <CalendarIcon className="h-6 w-6" />
            <span className="font-medium">Next 30 Days</span>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(upcomingTotals)}</p>
          <p className="text-primary-foreground/70 text-sm mt-1">
            Expected from {events.filter(e => {
              const diff = (e.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
              return diff >= 0 && diff <= 30;
            }).length} events
          </p>
        </div>

        {/* Calendar Grid */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-secondary rounded-lg">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="font-semibold">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-secondary rounded-lg">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startingDay }).map((_, i) => <div key={`empty-${i}`} className="aspect-square" />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative transition-colors ${
                    isSelected(day) ? 'bg-primary text-primary-foreground' : 
                    isToday(day) ? 'bg-primary/20 text-primary font-bold' : 'hover:bg-secondary'
                  }`}
                >
                  {day}
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayEvents.slice(0, 3).map((e, idx) => (
                        <div key={idx} className={`w-1.5 h-1.5 rounded-full ${eventTypeConfig[e.type].color}`} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          {Object.entries(eventTypeConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${config.color}`} />
              <span className="text-xs text-muted-foreground">{config.label}</span>
            </div>
          ))}
        </div>

        {/* Events List */}
        <div>
          <h3 className="font-semibold mb-3">
            {selectedDate ? `Events on ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'Upcoming Events'}
          </h3>
          {displayEvents.length === 0 ? (
            <div className="bg-card rounded-xl p-6 border border-border text-center">
              <CalendarIcon className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No events {selectedDate ? 'on this day' : 'coming up'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayEvents.map((event) => {
                const config = eventTypeConfig[event.type];
                const Icon = config.icon;
                const daysUntil = Math.ceil((event.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <button
                    key={event.id}
                    onClick={() => event.assetId && navigate(`/asset/${event.assetId}`)}
                    className="w-full bg-card rounded-xl p-4 border border-border text-left hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${config.lightColor}`}><Icon className="h-5 w-5" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                          </div>
                          {event.amount && <p className="font-semibold text-green-500 whitespace-nowrap">+{formatCurrency(event.amount)}</p>}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : daysUntil < 0 ? `${Math.abs(daysUntil)} days ago` : `In ${daysUntil} days`}
                            {' • '}{event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Button variant="outline" className="w-full" onClick={() => { navigate('/alerts'); toast.info('Create custom reminders in Alerts'); }}>
          <Bell className="h-4 w-4 mr-2" />Set Custom Reminder
        </Button>
      </main>
      <BottomNav />
    </div>
  );
};

export default Calendar;