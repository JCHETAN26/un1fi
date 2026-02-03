import { useState } from 'react';
import { Asset, AssetCategory, categoryLabels } from '@/types/portfolio';
import { PremiumAssetCard } from './PremiumAssetCard';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  assets: Asset[];
}

const categories: (AssetCategory | 'all')[] = ['all', 'stocks', 'crypto', 'gold', 'silver', 'fixed_income', 'real_estate', 'cash'];

const categoryEmojis: Record<string, string> = {
  all: '📊',
  stocks: '📈',
  crypto: '₿',
  gold: '🥇',
  silver: '🥈',
  fixed_income: '🏦',
  real_estate: '🏠',
  cash: '💵',
};

export const PremiumAssetList = ({ assets }: Props) => {
  const [filter, setFilter] = useState<AssetCategory | 'all'>('all');
  const navigate = useNavigate();

  const filteredAssets = filter === 'all' 
    ? assets 
    : assets.filter(a => a.category === filter);

  // Sort by value (highest first)
  const sortedAssets = [...filteredAssets].sort((a, b) => 
    (b.currentPrice * b.quantity) - (a.currentPrice * a.quantity)
  );

  // Calculate totals for each category
  const categoryTotals = categories.reduce((acc, cat) => {
    if (cat === 'all') {
      acc[cat] = assets.length;
    } else {
      acc[cat] = assets.filter(a => a.category === cat).length;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="px-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold">Your Investments</h2>
          <p className="text-sm text-muted-foreground">
            {sortedAssets.length} {sortedAssets.length === 1 ? 'asset' : 'assets'}
          </p>
        </div>
        <button 
          onClick={() => navigate('/add-asset')}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>
      
      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        {categories.map((category) => {
          const count = categoryTotals[category] || 0;
          const isActive = filter === category;
          
          // Only show categories that have assets (except 'all')
          if (category !== 'all' && count === 0) return null;
          
          return (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <span>{categoryEmojis[category]}</span>
              <span>{category === 'all' ? 'All' : categoryLabels[category as AssetCategory]}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                isActive 
                  ? 'bg-primary-foreground/20' 
                  : 'bg-background/50'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Asset cards */}
      <div className="space-y-3">
        {sortedAssets.map((asset, index) => (
          <div
            key={asset.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <PremiumAssetCard asset={asset} />
          </div>
        ))}

        {sortedAssets.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-muted-foreground font-medium">No assets found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {filter === 'all' 
                ? 'Add your first investment to get started'
                : `No ${categoryLabels[filter as AssetCategory]} in your portfolio`
              }
            </p>
            <button 
              onClick={() => navigate('/add-asset')}
              className="mt-4 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Add Investment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
