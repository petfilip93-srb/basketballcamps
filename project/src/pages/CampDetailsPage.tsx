import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CampWithCountry, Review, ReviewReply } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle } from 'lucide-react';
import { ReviewsSection } from '../components/ReviewsSection';
import { BookingModal } from '../components/BookingModal';

export function CampDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { userProfile } = useAuth();
  const [camp, setCamp] = useState<CampWithCountry | null>(null);
  const [reviews, setReviews] = useState<(Review & { review_replies?: ReviewReply[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const { data: campData, error: campError } = await supabase
          .from('camps')
          .select('*, countries(*)')
          .eq('id', id)
          .eq('status', 'approved')
          .maybeSingle();

        if (campError) throw campError;
        if (!campData) throw new Error('Camp not found');

        setCamp(campData);

        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*')
          .eq('camp_id', id)
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (reviewsError) throw reviewsError;
        setReviews(reviewsData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load camp details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading camp details...</p>
        </div>
      </div>
    );
  }

  if (error || !camp) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-900">{error || 'Camp not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const startDate = new Date(camp.start_date);
  const endDate = new Date(camp.end_date);
  const countryName = camp.countries?.name || 'Unknown';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {camp.image_url && (
          <img
            src={camp.image_url}
            alt={camp.name}
            className="w-full h-96 object-cover rounded-lg mb-8"
          />
        )}

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">{camp.name}</h1>
              <p className="text-slate-600 text-lg">{camp.location}, {countryName}</p>
            </div>
            <button
              onClick={() => setShowBookingModal(true)}
              className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
            >
              Book a Spot
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 py-8 border-y border-slate-200">
            <div>
              <p className="text-sm text-slate-600">Dates</p>
              <p className="font-semibold text-slate-900">
                {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Duration</p>
              <p className="font-semibold text-slate-900">{camp.duration_days} days</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Age Group</p>
              <p className="font-semibold text-slate-900">{camp.age_group_min}-{camp.age_group_max}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Price</p>
              <p className="font-semibold text-slate-900">€{camp.price.toFixed(2)}</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">About</h2>
            <p className="text-slate-700 text-lg leading-relaxed">{camp.description}</p>
          </div>

          {camp.coaches_info && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Coaches</h2>
              <p className="text-slate-700 text-lg">{camp.coaches_info}</p>
            </div>
          )}

          {camp.skill_levels && camp.skill_levels.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Skill Levels</h2>
              <div className="flex flex-wrap gap-2">
                {camp.skill_levels.map((level) => (
                  <span
                    key={level}
                    className="px-4 py-2 bg-slate-100 text-slate-900 rounded-lg font-medium"
                  >
                    {level}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <ReviewsSection campId={camp.id} reviews={reviews} />
      </div>

      {showBookingModal && (
        <BookingModal
          camp={camp}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </div>
  );
}
