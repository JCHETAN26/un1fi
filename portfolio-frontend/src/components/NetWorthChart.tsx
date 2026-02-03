import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface NetWorthDataPoint {
  date: string;
  value: number;
  timestamp: number;
}

interface Props {
  currentValue: number;
}

const STORAGE_KEY = 'un1fi_networth_history';
const TIME_RANGES = ['1W', '1M', '3M', '1Y', 'ALL'] as const;
type TimeRange = typeof TIME_RANGES[number];

// Get historical data from localStorage
const getStoredHistory = (): NetWorthDataPoint[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// Save data point to history
const saveToHistory = (value: number): void => {
  const history = getStoredHistory();
  const today = new Date().toISOString().split('T')[0];
  
  // Check if we already have today's entry
  const existingIndex = history.findIndex(h => h.date === today);
  
  const newPoint: NetWorthDataPoint = {
    date: today,
    value,
    timestamp: Date.now(),
  };
  
  if (existingIndex >= 0) {
    // Update today's value
    history[existingIndex] = newPoint;
  } else {
    // Add new entry
    history.push(newPoint);
  }
  
  // Keep last 365 days only
  const yearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
  const filtered = history.filter(h => h.timestamp > yearAgo);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

// Generate demo data if no history exists
const generateDemoData = (currentValue: number): NetWorthDataPoint[] => {
  const data: NetWorthDataPoint[] = [];
  const now = Date.now();
  
  // Generate 90 days of data with realistic fluctuations
  for (let i = 90; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    
    // Create a gradual upward trend with daily fluctuations
    const baseGrowth = 1 + (90 - i) * 0.002; // ~0.2% daily growth
    const randomFactor = 1 + (Math.random() - 0.5) * 0.03; // ±1.5% daily variation
    const value = (currentValue / 1.2) * baseGrowth * randomFactor;
    
    data.push({
      date: dateStr,
      value: Math.round(value),
      timestamp: date.getTime(),
    });
  }
  
  // Make sure last point matches current value
  if (data.length > 0) {
    data[data.length - 1].value = currentValue;
  }
  
  return data;
};

// Filter data by time range
const filterByTimeRange = (data: NetWorthDataPoint[], range: TimeRange): NetWorthDataPoint[] => {
  const now = Date.now();
  let cutoff: number;
  
  switch (range) {
    case '1W':
      cutoff = now - 7 * 24 * 60 * 60 * 1000;
      break;
    case '1M':
      cutoff = now - 30 * 24 * 60 * 60 * 1000;
      break;
    case '3M':
      cutoff = now - 90 * 24 * 60 * 60 * 1000;
      break;
    case '1Y':
      cutoff = now - 365 * 24 * 60 * 60 * 1000;
      break;
    case 'ALL':
    default:
      return data;
  }
  
  return data.filter(d => d.timestamp >= cutoff);
};

export const NetWorthChart = ({ currentValue }: Props) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const [data, setData] = useState<NetWorthDataPoint[]>([]);
  
  useEffect(() => {
    // Save current value to history
    if (currentValue > 0) {
      saveToHistory(currentValue);
    }
    
    // Load history or generate demo
    let history = getStoredHistory();
    if (history.length < 7) {
      history = generateDemoData(currentValue);
    }
    
    setData(history);
  }, [currentValue]);
  
  const filteredData = filterByTimeRange(data, timeRange);
  
  // Calculate change
  const startValue = filteredData[0]?.value || currentValue;
  const change = currentValue - startValue;
  const changePercent = startValue > 0 ? (change / startValue) * 100 : 0;
  const isPositive = change >= 0;
  
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
          <p className="text-xs text-muted-foreground">
            {formatDate(payload[0].payload.date)}
          </p>
          <p className="font-semibold">
            ${payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="px-4">
      <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Net Worth</p>
            <h2 className="text-2xl font-bold">${currentValue.toLocaleString()}</h2>
            <div className="flex items-center gap-1 mt-1">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
              </span>
              <span className="text-sm text-muted-foreground">
                ({isPositive ? '+' : ''}${Math.abs(change).toLocaleString()})
              </span>
            </div>
          </div>
          
          {/* Time range selector */}
          <div className="flex bg-secondary rounded-lg p-0.5">
            {TIME_RANGES.map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        
        {/* Chart */}
        <div className="h-[160px] -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop 
                    offset="0%" 
                    stopColor={isPositive ? '#22c55e' : '#ef4444'} 
                    stopOpacity={0.3}
                  />
                  <stop 
                    offset="100%" 
                    stopColor={isPositive ? '#22c55e' : '#ef4444'} 
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                tickFormatter={formatDate}
                interval="preserveStartEnd"
                minTickGap={50}
              />
              <YAxis 
                hide 
                domain={['dataMin - 1000', 'dataMax + 1000']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={isPositive ? '#22c55e' : '#ef4444'}
                strokeWidth={2}
                fill="url(#netWorthGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
