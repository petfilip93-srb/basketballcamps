import React, { useState } from 'react';
import { CampWithCountry } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BookingModalProps {
  camp: CampWithCountry;
  onClose: () => void;
  onSignInRequired?: () => void;
}

export function BookingModal({ camp, onClose, onSignInRequired }: BookingModalProps) {
  const { userProfile } = useAuth();
  const [participantName, setParticipantName] = useState('');
  const [participantAge, setParticipantAge] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [participantPhone, setParticipantPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!userProfile) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
              <span className="text-3xl">🏀</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign In Required</h2>
            <p className="text-slate-600">
              To book a spot at this camp, please sign in or create an account.
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => {
                onClose();
                onSignInRequired?.();
              }}
              className="w-full py-3 bg-black text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
            >
              Sign In / Sign Up
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-200 text-slate-900 rounded-lg font-medium hover:bg-slate-300 transition-colors"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!participantAge || isNaN(Number(participantAge))) {
        throw new Error('Please enter a valid age');
      }

      const { error: dbError } = await supabase
        .from('booking_requests')
        .insert({
          camp_id: camp.id,
          user_id: userProfile.id,
          participant_name: participantName,
          participant_age: Number(participantAge),
          participant_email: participantEmail,
          participant_phone: participantPhone,
          message: message,
        });

      if (dbError) throw dbError;

      const campCountry = camp.countries?.name || 'Unknown';

      const mailtoLink = `mailto:${camp.owner_id}?cc=${import.meta.env.VITE_ADMIN_EMAIL || 'admin@basketballcamps.com'}&subject=Basketball Camp Booking Request - ${camp.name}&body=${encodeURIComponent(
        `Hello,\n\nI would like to book a spot at your camp: ${camp.name}\n\nCamp Details:\n- Location: ${camp.location}, ${campCountry}\n- Dates: ${new Date(camp.start_date).toLocaleDateString()} - ${new Date(camp.end_date).toLocaleDateString()}\n- Price: €${camp.price}\n\nParticipant Information:\n- Name: ${participantName}\n- Age: ${participantAge}\n- Email: ${participantEmail}\n- Phone: ${participantPhone}\n\nMessage:\n${message}\n\nPlease confirm the booking and payment details.\n\nBest regards,\n${userProfile.full_name}`
      )}`;

      window.location.href = mailtoLink;
      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Book a Spot</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <h3 className="font-semibold text-slate-900 mb-2">{camp.name}</h3>
            <p className="text-sm text-slate-600">
              {new Date(camp.start_date).toLocaleDateString()} - {new Date(camp.end_date).toLocaleDateString()}
            </p>
            <p className="text-sm text-slate-600">€{camp.price.toFixed(2)}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">Booking request sent! Check your email.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Participant Name
              </label>
              <input
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Age
              </label>
              <input
                type="number"
                value={participantAge}
                onChange={(e) => setParticipantAge(e.target.value)}
                min="1"
                max="120"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={participantEmail}
                onChange={(e) => setParticipantEmail(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={participantPhone}
                onChange={(e) => setParticipantPhone(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Message (optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Tell the camp organizer anything else they should know..."
              />
            </div>

            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-black text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating booking request...' : 'Send Booking Request'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 bg-slate-200 text-slate-900 rounded-lg font-medium hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-slate-50 rounded-lg text-xs text-slate-600 space-y-2">
            <p className="font-medium text-slate-700">Booking Process:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Submit your booking request</li>
              <li>Camp will email you payment details</li>
              <li>After payment, your spot is confirmed</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
