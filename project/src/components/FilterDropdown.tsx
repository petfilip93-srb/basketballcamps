import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface FilterDropdownProps {
  label: string;
  options: Array<{ value: string; label: string }>;
  selectedValues: string[];
  onToggle: (value: string) => void;
  placeholder?: string;
  maxHeight?: string;
}

export function FilterDropdown({
  label,
  options,
  selectedValues,
  onToggle,
  placeholder = 'Select...',
  maxHeight = '300px'
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSelectedLabels = () => {
    return options
      .filter(opt => selectedValues.includes(opt.value))
      .map(opt => opt.label);
  };

  const selectedLabels = getSelectedLabels();

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-left flex items-center justify-between hover:border-slate-400 transition-colors"
      >
        <span className={selectedValues.length === 0 ? 'text-slate-400' : 'text-slate-900'}>
          {selectedValues.length === 0
            ? placeholder
            : `${selectedValues.length} selected`}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg">
          <div className="p-2" style={{ maxHeight, overflowY: 'auto' }}>
            {options.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={() => onToggle(option.value)}
                  className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm text-slate-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface SelectedFiltersProps {
  selectedCountries: string[];
  selectedMonths: string[];
  countries: Array<{ value: string; label: string }>;
  months: Array<{ value: string; label: string }>;
  onRemoveCountry: (value: string) => void;
  onRemoveMonth: (value: string) => void;
  onClearAll: () => void;
}

export function SelectedFilters({
  selectedCountries,
  selectedMonths,
  countries,
  months,
  onRemoveCountry,
  onRemoveMonth,
  onClearAll
}: SelectedFiltersProps) {
  const hasFilters = selectedCountries.length > 0 || selectedMonths.length > 0;

  if (!hasFilters) return null;

  const getLabel = (value: string, options: Array<{ value: string; label: string }>) => {
    return options.find(opt => opt.value === value)?.label || value;
  };

  return (
    <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-slate-900">Active Filters</h3>
        <button
          onClick={onClearAll}
          className="text-xs text-orange-600 hover:text-orange-700 font-medium"
        >
          Clear All
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {selectedCountries.map(country => (
          <span
            key={country}
            className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-slate-300 rounded-full text-sm text-slate-700"
          >
            {getLabel(country, countries)}
            <button
              onClick={() => onRemoveCountry(country)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {selectedMonths.map(month => (
          <span
            key={month}
            className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-slate-300 rounded-full text-sm text-slate-700"
          >
            {getLabel(month, months)}
            <button
              onClick={() => onRemoveMonth(month)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
