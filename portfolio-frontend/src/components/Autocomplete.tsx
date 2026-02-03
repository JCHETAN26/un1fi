import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AutocompleteOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface AutocompleteProps {
  placeholder?: string;
  options?: AutocompleteOption[];
  onSearch?: (query: string) => Promise<AutocompleteOption[]>;
  onSelect: (option: AutocompleteOption) => void;
  value?: string;
  debounceMs?: number;
}

export const Autocomplete = ({
  placeholder = 'Search...',
  options: staticOptions,
  onSearch,
  onSelect,
  value = '',
  debounceMs = 300,
}: AutocompleteProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [options, setOptions] = useState<AutocompleteOption[]>(staticOptions || []);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (staticOptions) {
      setOptions(staticOptions);
    }
  }, [staticOptions]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setInputValue(query);
    setHighlightIndex(-1);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query) {
      setOptions(staticOptions || []);
      setIsOpen(staticOptions && staticOptions.length > 0);
      return;
    }

    if (onSearch) {
      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const results = await onSearch(query);
          setOptions(results);
          setIsOpen(results.length > 0);
        } catch {
          setOptions([]);
        } finally {
          setLoading(false);
        }
      }, debounceMs);
    } else if (staticOptions) {
      const filtered = staticOptions.filter(
        opt =>
          opt.label.toLowerCase().includes(query.toLowerCase()) ||
          opt.value.toLowerCase().includes(query.toLowerCase())
      );
      setOptions(filtered);
      setIsOpen(filtered.length > 0);
    }
  };

  const handleSelect = (option: AutocompleteOption) => {
    setInputValue(option.label);
    setIsOpen(false);
    onSelect(option);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIndex(prev => (prev < options.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightIndex >= 0 && highlightIndex < options.length) {
          handleSelect(options[highlightIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleClear = () => {
    setInputValue('');
    setOptions(staticOptions || []);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => options.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-9"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {!loading && inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-secondary rounded"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {isOpen && options.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option, index) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option)}
              className={`w-full px-3 py-2.5 text-left flex items-center justify-between hover:bg-secondary transition-colors ${
                highlightIndex === index ? 'bg-secondary' : ''
              }`}
            >
              <div>
                <p className="font-medium text-sm">{option.label}</p>
                {option.sublabel && (
                  <p className="text-xs text-muted-foreground">{option.sublabel}</p>
                )}
              </div>
              <span className="text-xs font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                {option.value}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
