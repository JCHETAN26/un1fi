import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileHeader } from '@/components/MobileHeader';
import { BottomNav } from '@/components/BottomNav';
import { Autocomplete } from '@/components/Autocomplete';
import { searchStocks, searchCrypto, popularStocks, popularCryptos } from '@/lib/stockSearch';
import { priceService } from '@/lib/priceService';
import { investmentApi, CreateAssetPayload } from '@/lib/api';
import {
  TrendingUp, Building2, Coins, Bitcoin, Landmark,
  PiggyBank, Package, ChevronRight, ChevronLeft, Check,
  Calendar, DollarSign, Hash, FileText, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

type AssetCategory = 'stocks' | 'gold' | 'silver' | 'crypto' | 'real_estate' | 'fixed_income' | 'cash' | 'liabilities';

interface CategoryOption {
  id: AssetCategory;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

const categories: CategoryOption[] = [
  { id: 'stocks', label: 'Stocks', icon: TrendingUp, color: 'bg-blue-500', description: 'Equities & ETFs' },
  { id: 'gold', label: 'Gold', icon: Coins, color: 'bg-yellow-500', description: 'Physical & ETFs' },
  { id: 'silver', label: 'Silver', icon: Coins, color: 'bg-gray-400', description: 'Physical & ETFs' },
  { id: 'crypto', label: 'Crypto', icon: Bitcoin, color: 'bg-orange-500', description: 'Bitcoin, Ethereum...' },
  { id: 'real_estate', label: 'Real Estate', icon: Building2, color: 'bg-purple-500', description: 'Properties & REITs' },
  { id: 'fixed_income', label: 'Fixed Income', icon: Landmark, color: 'bg-green-500', description: 'Bonds & Deposits' },
  { id: 'cash', label: 'Cash', icon: PiggyBank, color: 'bg-gray-600', description: 'Savings & Accounts' },
  { id: 'liabilities', label: 'Liabilities', icon: Landmark, color: 'bg-red-500', description: 'Loans & Credit Cards' },
];

const AddAsset = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(null);
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    quantity: '',
    purchasePrice: '',
    currentPrice: '',
    platform: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    maturityDate: '',
    interestRate: '',
    notes: '',
  });

  const handleCategorySelect = async (category: AssetCategory) => {
    setSelectedCategory(category);
    setStep(2);

    // Auto-fetch price for gold and silver
    if (category === 'gold') {
      setFormData(prev => ({ ...prev, name: 'Gold (Physical)', symbol: 'GC=F' }));
      await fetchGoldSilverPrice(category);
    } else if (category === 'silver') {
      setFormData(prev => ({ ...prev, name: 'Silver (Physical)', symbol: 'SI=F' }));
      await fetchGoldSilverPrice(category);
    }
  };

  // Fetch gold/silver prices immediately
  const fetchGoldSilverPrice = async (category: 'gold' | 'silver') => {
    setFetchingPrice(true);
    try {
      const price = category === 'gold'
        ? await priceService.getGoldPrice()
        : await priceService.getSilverPrice();

      if (price?.price) {
        setFormData(prev => ({ ...prev, currentPrice: price.price.toString() }));
        toast.success(`Current ${category} price: $${price.price.toLocaleString()}/oz`);
      }
    } catch (e) {
      console.error(`Failed to fetch ${category} price:`, e);
    } finally {
      setFetchingPrice(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Auto-fetch current price when stock/crypto is selected
  const fetchCurrentPrice = async (symbol: string, category: AssetCategory) => {
    setFetchingPrice(true);
    try {
      let price = null;
      if (category === 'stocks') {
        price = await priceService.getStockPrice(symbol);
      } else if (category === 'crypto') {
        price = await priceService.getCryptoPrice(symbol);
      } else if (category === 'gold') {
        price = await priceService.getGoldPrice();
      } else if (category === 'silver') {
        price = await priceService.getSilverPrice();
      }

      if (price?.price) {
        setFormData(prev => ({ ...prev, currentPrice: price.price.toString() }));
        toast.success(`Current price: $${price.price.toLocaleString()}`);
      }
    } catch (e) {
      console.error('Failed to fetch price:', e);
    } finally {
      setFetchingPrice(false);
    }
  };

  // Handle stock selection from autocomplete
  const handleStockSelect = async (option: { value: string; label: string }) => {
    setFormData(prev => ({
      ...prev,
      name: option.label,
      symbol: option.value,
    }));
    if (selectedCategory) {
      await fetchCurrentPrice(option.value, selectedCategory);
    }
  };

  // Handle crypto selection from autocomplete
  const handleCryptoSelect = async (option: { value: string; label: string }) => {
    setFormData(prev => ({
      ...prev,
      name: option.label,
      symbol: option.value,
    }));
    await fetchCurrentPrice(option.value, 'crypto');
  };

  // Search handlers for autocomplete
  const handleStockSearch = async (query: string) => {
    const results = await searchStocks(query);
    return results.map(r => ({
      value: r.symbol,
      label: r.name,
      sublabel: `${r.exchange} • ${r.type}`,
    }));
  };

  const handleCryptoSearch = async (query: string) => {
    const results = await searchCrypto(query);
    return results.map(r => ({
      value: r.id,
      label: r.name,
      sublabel: r.symbol,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.quantity || !formData.purchasePrice) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    // Create asset payload
    const assetPayload: CreateAssetPayload = {
      category: selectedCategory!,
      name: formData.name,
      symbol: formData.symbol || undefined,
      quantity: parseFloat(formData.quantity),
      purchasePrice: parseFloat(formData.purchasePrice),
      currentPrice: formData.currentPrice ? parseFloat(formData.currentPrice) : undefined,
      platform: formData.platform || undefined,
      purchaseDate: formData.purchaseDate,
      maturityDate: formData.maturityDate || undefined,
      interestRate: formData.interestRate ? parseFloat(formData.interestRate) : undefined,
      isLiability: selectedCategory === 'liabilities',
      metadata: selectedCategory === 'fixed_income' || selectedCategory === 'liabilities' ? {
        interestRate: formData.interestRate ? parseFloat(formData.interestRate) : undefined,
        maturityDate: formData.maturityDate || undefined,
      } : {},
    };

    try {
      await investmentApi.createInvestment(assetPayload);
      toast.success('Asset added successfully!', {
        description: `${formData.name} has been added to your portfolio.`,
      });
      navigate('/');
    } catch (error) {
      console.error('Failed to save asset:', error);
      toast.error('Failed to add asset', {
        description: 'Please try again later.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const totalValue = formData.quantity && formData.currentPrice
    ? (parseFloat(formData.quantity) * parseFloat(formData.currentPrice)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    : '$0.00';

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Custom Header */}
      <div className="bg-card border-b border-border px-4 py-4 pt-14">
        <div className="flex items-center justify-between">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="p-2 -ml-2">
              <ChevronLeft className="h-6 w-6" />
            </button>
          ) : (
            <button onClick={() => navigate('/')} className="p-2 -ml-2">
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          <h1 className="text-lg font-semibold">Add Investment</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Progress indicator */}
        <div className="flex gap-2 mt-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-muted'
                }`}
            />
          ))}
        </div>
      </div>

      <main className="px-4 py-6">
        {/* Step 1: Select Category */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-semibold mb-2">What type of asset?</h2>
            <p className="text-muted-foreground mb-6">Select the category that best describes your investment.</p>

            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${selectedCategory === category.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-lg ${category.color} flex items-center justify-center mb-3`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="font-medium">{category.label}</p>
                    <p className="text-xs text-muted-foreground">{category.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Basic Details */}
        {step === 2 && selectedCategoryData && (
          <div className="animate-fade-in space-y-5">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 rounded-xl ${selectedCategoryData.color} flex items-center justify-center`}>
                <selectedCategoryData.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{selectedCategoryData.label} Details</h2>
                <p className="text-sm text-muted-foreground">Enter your investment information</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Stock Autocomplete */}
              {selectedCategory === 'stocks' && (
                <div>
                  <Label className="flex items-center gap-2 mb-1.5">
                    <FileText className="h-4 w-4" />
                    Search Stock *
                  </Label>
                  <Autocomplete
                    placeholder="Type to search (e.g., WMT, Apple)"
                    onSearch={handleStockSearch}
                    onSelect={handleStockSelect}
                    options={popularStocks.map(s => ({
                      value: s.symbol,
                      label: s.name,
                      sublabel: `${s.exchange} • ${s.type}`,
                    }))}
                  />
                  {formData.symbol && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Selected: {formData.symbol}
                    </p>
                  )}
                </div>
              )}

              {/* Crypto Autocomplete */}
              {selectedCategory === 'crypto' && (
                <div>
                  <Label className="flex items-center gap-2 mb-1.5">
                    <Bitcoin className="h-4 w-4" />
                    Search Cryptocurrency *
                  </Label>
                  <Autocomplete
                    placeholder="Type to search (e.g., BTC, Ethereum)"
                    onSearch={handleCryptoSearch}
                    onSelect={handleCryptoSelect}
                    options={popularCryptos.map(c => ({
                      value: c.id,
                      label: c.name,
                      sublabel: c.symbol,
                    }))}
                  />
                  {formData.symbol && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Selected: {formData.name}
                    </p>
                  )}
                </div>
              )}

              {/* Gold/Silver type selector with live price */}
              {(selectedCategory === 'gold' || selectedCategory === 'silver') && (
                <div className="space-y-4">
                  {/* Live Price Banner */}
                  <div className={`p-4 rounded-xl ${selectedCategory === 'gold' ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-gray-400/10 border border-gray-400/30'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Live {selectedCategory === 'gold' ? 'Gold' : 'Silver'} Price</p>
                        <p className="text-2xl font-bold">
                          {fetchingPrice ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Fetching...
                            </span>
                          ) : formData.currentPrice ? (
                            `$${parseFloat(formData.currentPrice).toLocaleString()}/oz`
                          ) : (
                            'Loading...'
                          )}
                        </p>
                      </div>
                      <Coins className={`h-10 w-10 ${selectedCategory === 'gold' ? 'text-yellow-500' : 'text-gray-400'}`} />
                    </div>
                  </div>

                  {/* Asset Name / Type */}
                  <div>
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Type *
                    </Label>
                    <div className="grid grid-cols-3 gap-2 mt-1.5">
                      {(selectedCategory === 'gold'
                        ? ['Gold (Physical)', 'Gold ETF', 'Gold Coins']
                        : ['Silver (Physical)', 'Silver ETF', 'Silver Coins']
                      ).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, name: type }))}
                          className={`p-2.5 text-sm rounded-lg border-2 transition-all ${formData.name === type
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                            }`}
                        >
                          {type.split(' ')[1] || type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Regular name input for other asset types */}
              {selectedCategory !== 'stocks' && selectedCategory !== 'crypto' && selectedCategory !== 'gold' && selectedCategory !== 'silver' && (
                <div>
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Asset Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder={
                      selectedCategory === 'real_estate' ? 'e.g., Apartment Madrid' :
                        selectedCategory === 'fixed_income' ? 'e.g., Treasury Bond 3Y' :
                          'e.g., High-Yield Savings'
                    }
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1.5"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="quantity" className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    {selectedCategory === 'gold' || selectedCategory === 'silver' ? 'Ounces *' : 'Quantity *'}
                  </Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    placeholder="0"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="purchasePrice" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Buy Price *
                  </Label>
                  <Input
                    id="purchasePrice"
                    name="purchasePrice"
                    type="number"
                    placeholder="0.00"
                    value={formData.purchasePrice}
                    onChange={handleInputChange}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="currentPrice" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Current Price
                    {fetchingPrice && <Loader2 className="h-3 w-3 animate-spin" />}
                  </Label>
                  <Input
                    id="currentPrice"
                    name="currentPrice"
                    type="number"
                    placeholder={fetchingPrice ? 'Fetching...' : '0.00'}
                    value={formData.currentPrice}
                    onChange={handleInputChange}
                    className="mt-1.5"
                    disabled={fetchingPrice}
                  />
                </div>
                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Input
                    id="platform"
                    name="platform"
                    placeholder="e.g., Renta 4"
                    value={formData.platform}
                    onChange={handleInputChange}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="purchaseDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Purchase Date
                </Label>
                <Input
                  id="purchaseDate"
                  name="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={handleInputChange}
                  className="mt-1.5"
                />
              </div>

              {/* Fixed Income & Liabilities specific fields */}
              {(selectedCategory === 'fixed_income' || selectedCategory === 'liabilities') && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="maturityDate">Maturity Date</Label>
                      <Input
                        id="maturityDate"
                        name="maturityDate"
                        type="date"
                        value={formData.maturityDate}
                        onChange={handleInputChange}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="interestRate">Interest Rate %</Label>
                      <Input
                        id="interestRate"
                        name="interestRate"
                        type="number"
                        step="0.1"
                        placeholder="4.5"
                        value={formData.interestRate}
                        onChange={handleInputChange}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <Button onClick={() => setStep(3)} className="w-full mt-6" size="lg">
              Continue
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 3: Review & Confirm */}
        {step === 3 && selectedCategoryData && (
          <div className="animate-fade-in space-y-5">
            <div className="text-center mb-6">
              <div className={`w-16 h-16 rounded-2xl ${selectedCategoryData.color} flex items-center justify-center mx-auto mb-4`}>
                <selectedCategoryData.icon className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold">Review Investment</h2>
              <p className="text-sm text-muted-foreground">Confirm the details are correct</p>
            </div>

            <div className="bg-card rounded-xl border border-border p-4 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-muted-foreground">Asset</span>
                <span className="font-medium">{formData.name || 'Not specified'}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{selectedCategoryData.label}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-medium">{formData.quantity || '0'}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-muted-foreground">Purchase Price</span>
                <span className="font-medium">${formData.purchasePrice || '0.00'}</span>
              </div>
              {formData.platform && (
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-muted-foreground">Platform</span>
                  <span className="font-medium">{formData.platform}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2">
                <span className="font-semibold">Total Value</span>
                <span className="text-xl font-bold text-primary">{totalValue}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Add any notes about this investment..."
                value={formData.notes}
                onChange={handleInputChange}
                className="mt-1.5"
                rows={3}
              />
            </div>

            <Button onClick={handleSubmit} className="w-full" size="lg" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Add to Portfolio
                </>
              )}
            </Button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default AddAsset;
