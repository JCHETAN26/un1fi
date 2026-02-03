import { useState, useEffect } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { analyticsApi } from '@/lib/api';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';

interface HistoryData {
    date: string;
    value: number;
    assets: number;
    liabilities: number;
}

export const HistoricalNetWorthChart = () => {
    const [data, setData] = useState<HistoryData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const userId = '00000000-0000-0000-0000-000000000001'; // Mock user ID
                const history = await analyticsApi.getHistory(userId);

                // Format dates for display
                const formattedData = history.map((item: any) => ({
                    ...item,
                    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    value: parseFloat(item.value),
                    assets: parseFloat(item.assets),
                    liabilities: parseFloat(item.liabilities)
                }));

                setData(formattedData);
            } catch (err) {
                console.error('Failed to fetch history:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
            maximumFractionDigits: 1
        }).format(value);
    };

    const latest = data.length > 0 ? data[data.length - 1].value : 0;
    const initial = data.length > 0 ? data[0].value : 0;
    const change = latest - initial;
    const changePercent = initial !== 0 ? (change / initial) * 100 : 0;

    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center bg-card rounded-xl border border-border">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    if (error || data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center bg-card rounded-xl border border-border">
                <p className="text-muted-foreground text-sm text-center px-4">
                    Unable to load historical data.<br />Start tracking to see your progress!
                </p>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-xl border border-border p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-lg">Net Worth History</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        {change >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {change >= 0 ? '+' : ''}{changePercent.toFixed(1)}% (30d)
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Current</p>
                    <p className="text-xl font-bold">{formatCurrency(latest)}</p>
                </div>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" opacity={0.5} />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                            minTickGap={30}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                            tickFormatter={formatCurrency}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '12px',
                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                            }}
                            labelStyle={{ color: 'hsl(var(--muted-foreground))', fontWeight: 'bold', marginBottom: '4px' }}
                            formatter={(value: number) => [new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value), 'Net Worth']}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="hsl(var(--primary))"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorNetWorth)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
