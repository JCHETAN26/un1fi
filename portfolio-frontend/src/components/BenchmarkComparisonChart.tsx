import { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { analyticsApi } from '@/lib/api';
import { Loader2, Info } from 'lucide-react';

export const BenchmarkComparisonChart = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchComparison = async () => {
            try {
                const userId = '00000000-0000-0000-0000-000000000001'; // Mock user ID
                const comparison = await analyticsApi.getComparison(userId);

                const formattedData = comparison.map((item: any) => ({
                    ...item,
                    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                }));

                setData(formattedData);
            } catch (err) {
                console.error('Failed to fetch comparison:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchComparison();
    }, []);

    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center bg-card rounded-xl border border-border">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    if (error || data.length === 0) {
        return null; // Don't show if no data
    }

    return (
        <div className="bg-card rounded-xl border border-border p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Portfolio vs S&P 500</h3>
                <Info className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                            tickFormatter={(val) => `${val}%`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '12px',
                            }}
                            formatter={(value: number) => [`${value.toFixed(2)}%`]}
                        />
                        <Legend verticalAlign="top" height={36} />
                        <Line
                            type="monotone"
                            dataKey="user"
                            name="My Portfolio"
                            stroke="hsl(var(--primary))"
                            strokeWidth={3}
                            dot={false}
                            animationDuration={1500}
                        />
                        <Line
                            type="monotone"
                            dataKey="spy"
                            name="S&P 500 (SPY)"
                            stroke="hsl(var(--muted-foreground))"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            animationDuration={1500}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground text-center italic">
                % Growth since first data point (last 30 days)
            </p>
        </div>
    );
};
