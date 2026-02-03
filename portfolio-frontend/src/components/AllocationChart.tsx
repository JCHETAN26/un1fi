import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { categoryLabels, categoryColors, AssetCategory } from '@/types/portfolio';

interface AllocationItem {
  category: AssetCategory;
  value: number;
  percentage: number;
}

interface Props {
  data: AllocationItem[];
}

export const AllocationChart = ({ data }: Props) => {
  const chartColors = [
    'hsl(222, 47%, 45%)',   // stocks
    'hsl(43, 96%, 56%)',    // gold
    'hsl(220, 14%, 75%)',   // silver
    'hsl(25, 95%, 53%)',    // crypto
    'hsl(262, 52%, 47%)',   // real estate
    'hsl(173, 58%, 39%)',   // fixed income
    'hsl(220, 14%, 65%)',   // cash
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="card-elevated p-6 animate-slide-up">
      <h3 className="text-lg font-semibold mb-4">Asset Allocation</h3>
      
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={chartColors[index % chartColors.length]}
                    strokeWidth={0}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex-1 grid grid-cols-2 gap-3">
          {data.map((item, index) => (
            <div key={item.category} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: chartColors[index % chartColors.length] }}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{categoryLabels[item.category]}</p>
                <p className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
