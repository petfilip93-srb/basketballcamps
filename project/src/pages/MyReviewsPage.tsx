import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Camp, Review } from '../types';
import { LeaveReviewForm } from '../components/LeaveReviewForm';
import { AlertCircle } from 'lucide-react';

export function MyReviewsPage() {
  const { userProfile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCampForReview, setSelectedCampForReview] = useState<string | null>(null);
  const [bookedCamps, setBookedCamps] = useState<Camp[]>([]);

  useEffect(() => {
    if (!userProfile) return;

    const fetchData = async () => {
      try {
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('booking_requests')
          .select('camp_id')
          .eq('user_id', userProfile.id);

        if (bookingsError) throw bookingsError;

        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*')
          .eq('user_id', userProfile.id)
          .order('created_at', { ascending: false });

        if (reviewsError) throw reviewsError;
        setReviews(reviewsData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userProfile]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const pageTitle = userProfile?.user_type === 'camp_owner' ? 'Reviews for My Camps' : 'My Reviews';
  const pageSubtitle = userProfile?.user_type === 'camp_owner'
    ? 'Reviews from camp participants'
    : 'Share your basketball camp experience';
  const emptyMessage = userProfile?.user_type === 'camp_owner'
    ? "You haven't received any reviews yet"
    : "No reviews yet";
  const emptySubtext = userProfile?.user_type === 'camp_owner'
    ? "When participants attend your camps and leave reviews, they will appear here"
    : "After attending a basketball camp, you can share your review here";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-1">{pageTitle}</h1>
          <p className="text-white">{pageSubtitle}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <div>
            {reviews.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center border border-slate-200">
                <p className="text-slate-600 text-lg mb-2">{emptyMessage}</p>
                <p className="text-slate-500 text-sm">
                  {emptySubtext}
                </p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg p-6 border border-slate-200">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-slate-900">{review.participant_name}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        review.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : review.status === 'pending_email_verification'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {review.status === 'pending_email_verification'
                        ? 'Pending Verification'
                        : review.status === 'published'
                        ? 'Published'
                        : 'Rejected'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <span key={i} className="text-lg">🏀</span>
                    ))}
                  </div>
                  <p className="text-slate-700 mb-2">{review.review_text}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
