import { useState } from 'react';
import { Asset, AssetCategory, categoryLabels } from '@/types/portfolio';
import { MobileAssetCard } from './MobileAssetCard';

interface Props {
  assets: Asset[];
}

const categories: (AssetCategory | 'all')[] = ['all', 'stocks', 'gold', 'silver', 'crypto', 'real_estate', 'fixed_income', 'cash', 'liabilities'];

export const MobileAssetList = ({ assets }: Props) => {
  const [filter, setFilter] = useState<AssetCategory | 'all'>('all');

  const filteredAssets = filter === 'all'
    ? assets
    : assets.filter(a => a.category === filter);

  return (
    <div className="px-4 pb-24 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Your Assets</h2>
        <span className="text-sm text-muted-foreground">{filteredAssets.length} items</span>
      </div>

      {/* Horizontal scroll filter */}
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors touch-target ${filter === category
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground'
              }`}
          >
            {category === 'all' ? 'All' : categoryLabels[category]}
          </button>
        ))}
      </div>

      {/* Asset cards */}
      <div className="space-y-3 mt-2">
        {filteredAssets.map((asset) => (
          <MobileAssetCard key={asset.id} asset={asset} />
        ))}

        {filteredAssets.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No assets found in this category
          </div>
        )}
      </div>
    </div>
  );
};
