import { Asset, categoryLabels, AssetCategory } from '@/types/portfolio';
import { AssetCard } from './AssetCard';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import { useState } from 'react';

interface Props {
  assets: Asset[];
}

const categories: (AssetCategory | 'all')[] = ['all', 'stocks', 'gold', 'silver', 'crypto', 'real_estate', 'fixed_income', 'cash'];

export const AssetList = ({ assets }: Props) => {
  const [filter, setFilter] = useState<AssetCategory | 'all'>('all');

  const filteredAssets = filter === 'all' 
    ? assets 
    : assets.filter(asset => asset.category === filter);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold">Your Assets</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Add Asset
          </Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === category
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
            }`}
          >
            {category === 'all' ? 'All' : categoryLabels[category]}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAssets.map((asset, index) => (
          <div key={asset.id} style={{ animationDelay: `${index * 50}ms` }}>
            <AssetCard asset={asset} />
          </div>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No assets found in this category.</p>
        </div>
      )}
    </div>
  );
};
