import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { categoryLabels } from '@/types/portfolio';

interface AllocationItem {
  category: string;
  value: number;
  percentage: number;
}

interface Props {
  data: AllocationItem[];
}

const COLORS: Record<string, string> = {
  stocks: 'hsl(222, 47%, 45%)',
  gold: 'hsl(43, 96%, 56%)',
  silver: 'hsl(220, 14%, 75%)',
  real_estate: 'hsl(262, 52%, 47%)',
  fixed_income: 'hsl(173, 58%, 39%)',
  crypto: 'hsl(25, 95%, 53%)',
  cash: 'hsl(220, 9%, 46%)',
  liabilities: 'hsl(0, 100%, 50%)',
};

export const MobileAllocationChart = ({ data }: Props) => {
  const topCategories = data.slice(0, 4);

  return (
    <div className="px-4 animate-slide-up">
      <h2 className="text-lg font-semibold mb-4">Allocation</h2>
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-4">
          <div className="w-28 h-28">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[entry.category] || 'hsl(220, 14%, 75%)'}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 space-y-2">
            {topCategories.map((item) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[item.category] }}
                  />
                  <span className="text-sm">{categoryLabels[item.category as keyof typeof categoryLabels]}</span>
                </div>
                <span className="text-sm font-medium">{item.percentage.toFixed(0)}%</span>
              </div>
            ))}
            {data.length > 4 && (
              <p className="text-xs text-muted-foreground">+{data.length - 4} more</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
