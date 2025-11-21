import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { BasketballRating } from './BasketballRating';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface LeaveReviewFormProps {
  campId: string;
  onReviewSubmitted?: () => void;
}

export function LeaveReviewForm({ campId, onReviewSubmitted }: LeaveReviewFormProps) {
  const { userProfile } = useAuth();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!rating || !reviewText.trim()) {
        throw new Error('Please provide a rating and review text');
      }

      if (!userProfile) {
        throw new Error('You must be logged in to leave a review');
      }

      const verificationToken = crypto.randomUUID();

      const { error: dbError } = await supabase
        .from('reviews')
        .insert({
          camp_id: campId,
          user_id: userProfile.id,
          participant_name: participantName || userProfile.full_name,
          participant_email: participantEmail || userProfile.full_name,
          rating,
          review_text: reviewText,
          verification_token: verificationToken,
          status: 'pending_email_verification',
        });

      if (dbError) throw dbError;

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-review-verification`;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify({ reviewId: campId }),
      });

      setSuccess(true);
      setRating(0);
      setReviewText('');
      setParticipantName('');
      setParticipantEmail('');

      setTimeout(() => {
        setSuccess(false);
        onReviewSubmitted?.();
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-900">Review submitted!</p>
            <p className="text-sm text-green-700">Check your email to verify your review</p>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Your Rating
        </label>
        <div className="flex items-center gap-4">
          <BasketballRating
            rating={rating}
            onChange={setRating}
            size="lg"
          />
          <span className="text-lg font-semibold text-slate-900">{rating}/5</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Participant Name
        </label>
        <input
          type="text"
          value={participantName}
          onChange={(e) => setParticipantName(e.target.value)}
          placeholder={userProfile?.full_name || 'Your name'}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
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
          placeholder="Your email"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Your Review
        </label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={5}
          placeholder="Share your experience at this camp..."
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          required
        />
        <p className="text-xs text-slate-500 mt-1">
          {reviewText.length} characters
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || !rating || !reviewText.trim()}
        className="w-full py-3 bg-black text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
