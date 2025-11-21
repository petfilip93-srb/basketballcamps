import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Camp, BookingRequest, Review } from '../types';
import { AlertCircle, LogOut } from 'lucide-react';

interface DashboardPageProps {
  onSignOut?: () => void;
}

export function DashboardPage({ onSignOut }: DashboardPageProps = {}) {
  const { userProfile } = useAuth();
  const [camps, setCamps] = useState<Camp[]>([]);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'camps' | 'bookings' | 'reviews'>('camps');

  useEffect(() => {
    if (userProfile?.user_type !== 'camp_owner') {
      setError('Access denied. Only camp owners can access this page.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const { data: campsData, error: campsError } = await supabase
          .from('camps')
          .select('*')
          .eq('owner_id', userProfile.id);

        if (campsError) throw campsError;
        setCamps(campsData || []);

        if (campsData && campsData.length > 0) {
          const campIds = campsData.map((c) => c.id);

          const { data: bookingsData, error: bookingsError } = await supabase
            .from('booking_requests')
            .select('*')
            .in('camp_id', campIds);

          if (bookingsError) throw bookingsError;
          setBookings(bookingsData || []);

          const { data: reviewsData, error: reviewsError } = await supabase
            .from('reviews')
            .select('*')
            .in('camp_id', campIds);

          if (reviewsError) throw reviewsError;
          setReviews(reviewsData || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
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
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Camp Owner Dashboard</h1>
            <p className="text-white">Welcome, {userProfile?.full_name}</p>
          </div>
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-8">
          <div className="flex border-b border-slate-200">
            {(['camps', 'bookings', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-4 font-medium transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'border-black text-black bg-slate-50'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} ({
                  tab === 'camps' ? camps.length : tab === 'bookings' ? bookings.length : reviews.length
                })
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'camps' && (
              <div className="space-y-4">
                {camps.length === 0 ? (
                  <p className="text-slate-600">No camps yet. Create your first camp!</p>
                ) : (
                  camps.map((camp) => (
                    <div key={camp.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-slate-900">{camp.name}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            camp.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : camp.status === 'pending_approval'
                              ? 'bg-yellow-100 text-yellow-800'
                              : camp.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {camp.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        {camp.location} • {new Date(camp.start_date).toLocaleDateString()} - {new Date(camp.end_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-slate-600">€{camp.price.toFixed(2)}</p>
                      {camp.rejection_reason && (
                        <p className="text-sm text-red-600 mt-2">Rejection reason: {camp.rejection_reason}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <p className="text-slate-600">No booking requests yet.</p>
                ) : (
                  bookings.map((booking) => (
                    <div key={booking.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-slate-900">{booking.participant_name}</h3>
                        <span className="text-xs text-slate-500">
                          {new Date(booking.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">Age: {booking.participant_age}</p>
                      <p className="text-sm text-slate-600">Email: {booking.participant_email}</p>
                      <p className="text-sm text-slate-600">Phone: {booking.participant_phone}</p>
                      {booking.message && (
                        <p className="text-sm text-slate-600 mt-2">Message: {booking.message}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-slate-600">No reviews yet.</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-900">{review.participant_name}</h3>
                          <div className="flex items-center gap-1">
                            {[...Array(review.rating)].map((_, i) => (
                              <span key={i} className="text-black">🏀</span>
                            ))}
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            review.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {review.status}
                        </span>
                      </div>
                      <p className="text-slate-700 mb-2">{review.review_text}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
