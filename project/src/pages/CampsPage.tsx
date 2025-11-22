import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CampWithCountry, Country } from '../types';
import { CampCard } from '../components/CampCard';
import { BookingModal } from '../components/BookingModal';
import { FilterDropdown, SelectedFilters } from '../components/FilterDropdown';
import { AlertCircle } from 'lucide-react';

interface CampsPageProps {
  onCampSelect: (camp: CampWithCountry) => void;
  onSignInRequired?: () => void;
}

export function CampsPage({ onCampSelect, onSignInRequired }: CampsPageProps) {
  const [camps, setCamps] = useState<CampWithCountry[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCamp, setSelectedCamp] = useState<CampWithCountry | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: countriesData, error: countriesError } = await supabase
          .from('countries')
          .select('*')
          .order('name');

        if (countriesError) throw countriesError;
        setCountries(countriesData || []);

        await fetchCamps();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    fetchCamps();
  }, [selectedCountries, selectedGender, selectedMonths]);

  const fetchCamps = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('camps')
        .select('*, countries(*)')
        .eq('status', 'approved')
        .order('start_date');

      if (selectedCountries.length > 0) {
        query = query.in('country_id', selectedCountries);
      }

      if (selectedGender) {
        if (selectedGender === 'both') {
          query = query.eq('gender', 'both');
        } else {
          query = query.or(`gender.eq.${selectedGender},gender.eq.both`);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      let filteredCamps = data || [];

      if (selectedMonths.length > 0) {
        filteredCamps = filteredCamps.filter(camp => {
          const startDate = new Date(camp.start_date);
          const month = (startDate.getMonth() + 1).toString();
          return selectedMonths.includes(month);
        });
      }

      setCamps(filteredCamps);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load camps');
    } finally {
      setLoading(false);
    }
  };

  const toggleCountry = (countryId: string) => {
    setSelectedCountries(prev =>
      prev.includes(countryId)
        ? prev.filter(id => id !== countryId)
        : [...prev, countryId]
    );
  };

  const toggleMonth = (month: string) => {
    setSelectedMonths(prev =>
      prev.includes(month)
        ? prev.filter(m => m !== month)
        : [...prev, month]
    );
  };

  const months = [
    { value: '1', label: 'Jan' },
    { value: '2', label: 'Feb' },
    { value: '3', label: 'Mar' },
    { value: '4', label: 'Apr' },
    { value: '5', label: 'May' },
    { value: '6', label: 'Jun' },
    { value: '7', label: 'Jul' },
    { value: '8', label: 'Aug' },
    { value: '9', label: 'Sep' },
    { value: '10', label: 'Oct' },
    { value: '11', label: 'Nov' },
    { value: '12', label: 'Dec' },
  ];

  const handleBookClick = (camp: CampWithCountry) => {
    setSelectedCamp(camp);
    setShowBookingModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950">
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Basketball Camps</h1>
          <p className="text-white">Find and book your perfect basketball camp experience</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Filters</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FilterDropdown
              label="Countries"
              options={countries.map(c => ({ value: c.id, label: c.name }))}
              selectedValues={selectedCountries}
              onToggle={toggleCountry}
              placeholder="Select countries"
            />

            <FilterDropdown
              label="Months"
              options={months}
              selectedValues={selectedMonths}
              onToggle={toggleMonth}
              placeholder="Select months"
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Participants
              </label>
              <div className="space-y-2 bg-white border border-slate-300 rounded-lg p-3">
                <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                  <input
                    type="radio"
                    name="gender"
                    value="boys"
                    checked={selectedGender === 'boys'}
                    onChange={(e) => setSelectedGender(e.target.value)}
                    className="w-4 h-4 text-orange-500 border-slate-300 focus:ring-orange-500"
                  />
                  <span className="text-sm text-slate-700">Boys Only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                  <input
                    type="radio"
                    name="gender"
                    value="girls"
                    checked={selectedGender === 'girls'}
                    onChange={(e) => setSelectedGender(e.target.value)}
                    className="w-4 h-4 text-orange-500 border-slate-300 focus:ring-orange-500"
                  />
                  <span className="text-sm text-slate-700">Girls Only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                  <input
                    type="radio"
                    name="gender"
                    value="both"
                    checked={selectedGender === 'both'}
                    onChange={(e) => setSelectedGender(e.target.value)}
                    className="w-4 h-4 text-orange-500 border-slate-300 focus:ring-orange-500"
                  />
                  <span className="text-sm text-slate-700">Boys & Girls</span>
                </label>
              </div>
            </div>
          </div>

          <SelectedFilters
            selectedCountries={selectedCountries}
            selectedMonths={selectedMonths}
            countries={countries.map(c => ({ value: c.id, label: c.name }))}
            months={months}
            onRemoveCountry={toggleCountry}
            onRemoveMonth={toggleMonth}
            onClearAll={() => {
              setSelectedCountries([]);
              setSelectedMonths([]);
              setSelectedGender('');
            }}
          />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-slate-700 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading camps...</p>
            </div>
          </div>
        )}

        {!loading && camps.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg">
              {selectedCountries.length > 0 || selectedGender || selectedMonths.length > 0
                ? 'No camps found matching your filters'
                : 'No camps available at the moment'}
            </p>
          </div>
        )}

        {!loading && camps.length > 0 && (
          <div>
            {selectedCountries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {camps.map((camp) => (
                  <CampCard
                    key={camp.id}
                    camp={camp}
                    onClick={() => onCampSelect(camp)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                {countries.map((country) => {
                  const countryCamps = camps.filter(c => c.country_id === country.id);
                  if (countryCamps.length === 0) return null;

                  return (
                    <div key={country.id}>
                      <h2 className="text-2xl font-bold text-slate-900 mb-4">{country.name}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {countryCamps.map((camp) => (
                          <CampCard
                            key={camp.id}
                            camp={camp}
                            onClick={() => onCampSelect(camp)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedCamp && showBookingModal && (
        <BookingModal
          camp={selectedCamp}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedCamp(null);
          }}
          onSignInRequired={onSignInRequired}
        />
      )}
    </div>
  );
}
