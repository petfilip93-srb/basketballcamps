import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Edit, Plus, Image as ImageIcon, Calendar, MapPin, Users } from 'lucide-react';

interface Camp {
  id: string;
  camp_name: string;
  location: string;
  description: string;
  age_group_min: number;
  age_group_max: number;
  gender: string;
  capacity: number;
  average_rating: number;
  total_reviews: number;
  country: {
    name: string;
    flag_emoji: string;
  };
  camp_dates: Array<{
    start_date: string;
    end_date: string;
    duration_days: number;
    price: number;
  }>;
}

interface CampOwnerDashboardPageProps {
  onBack?: () => void;
  onAddCamp?: () => void;
  onSubmitFirstCamp?: () => void;
}

export function CampOwnerDashboardPage({ onBack, onAddCamp, onSubmitFirstCamp }: CampOwnerDashboardPageProps) {
  const { user, userProfile } = useAuth();
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading && user) {
        console.log('Query taking too long, forcing stop');
        setLoading(false);
        setError('Failed to load camps. Please try refreshing the page.');
      }
    }, 5000);

    if (user) {
      fetchMyCamps();
    } else {
      setLoading(false);
    }

    return () => clearTimeout(timer);
  }, [user]);

  const fetchMyCamps = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('camps')
        .select(`
          *,
          country:countries(name, flag_emoji),
          camp_dates(*)
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      setCamps(data || []);
    } catch (err) {
      console.error('Failed to load camps:', err);
      setCamps([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading your camps...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {userProfile && (
          <div className="mb-6 text-right">
            <p className="text-white text-lg">
              Welcome, <span className="font-semibold">{userProfile.full_name}</span>
            </p>
          </div>
        )}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Camps</h1>
            <p className="text-blue-200">Manage your basketball camps</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-colors font-semibold"
            >
              Back to Home
            </button>
            {camps.length > 0 && (
              <button
                onClick={onAddCamp}
                className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
              >
                <Plus className="w-5 h-5" />
                Add New Camp
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {camps.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">No Camps Yet</h2>
            <p className="text-slate-600 mb-6">
              You haven't added any camps yet. Start by submitting your first camp!
            </p>
            <button
              onClick={onSubmitFirstCamp}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Submit Your First Camp
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {camps.map((camp) => (
              <div key={camp.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{camp.camp_name}</h3>
                      <div className="flex items-center text-sm text-slate-600">
                        <span className="mr-2">{camp.country.flag_emoji}</span>
                        <MapPin className="w-4 h-4 mr-1" />
                        {camp.location}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-slate-600">
                      <Users className="w-4 h-4 mr-2" />
                      Ages {camp.age_group_min}-{camp.age_group_max} • {camp.gender}
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {camp.camp_dates.length} date{camp.camp_dates.length !== 1 ? 's' : ''} available
                    </div>
                  </div>

                  {camp.camp_dates.length > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-900 mb-1">Next Session</div>
                      <div className="text-xs text-blue-700">
                        {new Date(camp.camp_dates[0].start_date).toLocaleDateString()} - {new Date(camp.camp_dates[0].end_date).toLocaleDateString()}
                      </div>
                      <div className="text-lg font-bold text-blue-900 mt-1">
                        €{camp.camp_dates[0].price}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => window.location.href = `/camp-owner/edit/${camp.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Camp
                    </button>
                  </div>

                  {camp.total_reviews > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <div className="flex items-center gap-2">
                        <div className="text-yellow-500 font-bold">★ {camp.average_rating.toFixed(1)}</div>
                        <div className="text-sm text-slate-600">({camp.total_reviews} reviews)</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
