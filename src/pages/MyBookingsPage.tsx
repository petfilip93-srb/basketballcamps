import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { AlertCircle, Calendar, MapPin, Users } from 'lucide-react';

interface Booking {
  id: string;
  camp_id: string;
  created_at: string;
  camps: {
    name: string;
    location: string;
    start_date: string;
    end_date: string;
    age_min: number;
    age_max: number;
    countries: {
      name: string;
    };
  };
}

export function MyBookingsPage() {
  const { userProfile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userProfile) return;

    const fetchBookings = async () => {
      try {
        const { data, error: bookingsError } = await supabase
          .from('booking_requests')
          .select(`
            id,
            camp_id,
            created_at,
            camps (
              name,
              location,
              start_date,
              end_date,
              age_min,
              age_max,
              countries (
                name
              )
            )
          `)
          .eq('user_id', userProfile.id)
          .order('created_at', { ascending: false });

        if (bookingsError) throw bookingsError;
        setBookings(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-1">My Bookings</h1>
          <p className="text-white">Track your camp bookings</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-slate-200 shadow-sm">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No Bookings Yet</h2>
            <p className="text-slate-600 text-lg mb-6">
              Ready to elevate your game? Book your first basketball camp today!
            </p>
            <p className="text-slate-500 text-sm">
              Browse our selection of camps and find the perfect fit for your skills and schedule.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{booking.camps.name}</h3>
                    <p className="text-sm text-slate-500">
                      Booked on {new Date(booking.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">Location</p>
                      <p className="text-sm text-slate-600">
                        {booking.camps.location}, {booking.camps.countries.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">Dates</p>
                      <p className="text-sm text-slate-600">
                        {new Date(booking.camps.start_date).toLocaleDateString()} - {new Date(booking.camps.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">Age Range</p>
                      <p className="text-sm text-slate-600">
                        {booking.camps.age_min} - {booking.camps.age_max} years
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
