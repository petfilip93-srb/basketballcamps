import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { AlertCircle, LogOut, Check, X, Calendar, Users, Euro, MapPin } from 'lucide-react';

interface AdminPageProps {
  onSignOut?: () => void;
}

interface CampSubmission {
  id: string;
  camp_name: string;
  camp_email: string;
  location: string;
  description: string;
  age_group_min: number;
  age_group_max: number;
  gender: string;
  capacity: number;
  owner_name?: string;
  owner_email?: string;
  owner_phone?: string;
  created_at: string;
  country?: {
    name: string;
  };
}

interface CampSubmissionDate {
  start_date: string;
  end_date: string;
  duration_days: number;
  price: number;
}

interface CampSubmissionImage {
  image_url: string;
  image_order: number;
}

export function AdminPage({ onSignOut }: AdminPageProps = {}) {
  const { userProfile } = useAuth();
  const [pendingSubmissions, setPendingSubmissions] = useState<CampSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processedSubmission, setProcessedSubmission] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile?.user_type !== 'admin') {
      setError('Access denied. Only admins can access this page.');
      setLoading(false);
      return;
    }

    fetchPendingSubmissions();
  }, [userProfile]);

  const fetchPendingSubmissions = async () => {
    try {
      const { data, error: dbError } = await supabase
        .from('camp_submissions')
        .select(`
          *,
          country:countries(name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;
      setPendingSubmissions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pending submissions');
    } finally {
      setLoading(false);
    }
  };

  const approveSubmission = async (submissionId: string) => {
    try {
      setProcessedSubmission(submissionId);

      const { data: submission } = await supabase
        .from('camp_submissions')
        .select(`
          *,
          country:countries(name, id)
        `)
        .eq('id', submissionId)
        .single();

      if (!submission) throw new Error('Submission not found');

      const { data: dates } = await supabase
        .from('camp_submission_dates')
        .select('*')
        .eq('submission_id', submissionId)
        .order('start_date');

      const { data: images } = await supabase
        .from('camp_submission_images')
        .select('*')
        .eq('submission_id', submissionId)
        .order('image_order');

      if (!dates || dates.length === 0) {
        throw new Error('No dates found for this submission');
      }

      for (const dateRange of dates) {
        const { data: camp, error: campError } = await supabase
          .from('camps')
          .insert({
            camp_name: submission.camp_name,
            camp_email: submission.camp_email,
            country_id: submission.country_id,
            location: submission.location,
            description: submission.description,
            start_date: dateRange.start_date,
            end_date: dateRange.end_date,
            duration_days: dateRange.duration_days,
            age_group_min: submission.age_group_min,
            age_group_max: submission.age_group_max,
            gender: submission.gender,
            capacity: submission.capacity,
            price: dateRange.price,
            owner_id: submission.owner_id,
            status: 'approved'
          })
          .select()
          .single();

        if (campError) throw campError;

        if (images && images.length > 0) {
          const campImages = images.map((img: CampSubmissionImage) => ({
            camp_id: camp.id,
            image_url: img.image_url,
            image_order: img.image_order
          }));

          const { error: imagesError } = await supabase
            .from('camp_images')
            .insert(campImages);

          if (imagesError) throw imagesError;
        }
      }

      const { error: updateError } = await supabase
        .from('camp_submissions')
        .update({ status: 'approved' })
        .eq('id', submissionId);

      if (updateError) throw updateError;

      setPendingSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
      alert('Camp approved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve submission');
      alert('Failed to approve camp: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setProcessedSubmission(null);
    }
  };

  const rejectSubmission = async (submissionId: string, reason: string) => {
    if (!reason.trim()) {
      alert('Please enter a rejection reason');
      return;
    }

    try {
      setProcessedSubmission(submissionId);

      const { error: updateError } = await supabase
        .from('camp_submissions')
        .update({
          status: 'rejected',
          rejection_reason: reason
        })
        .eq('id', submissionId);

      if (updateError) throw updateError;

      setPendingSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
      alert('Camp rejected successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject submission');
      alert('Failed to reject camp: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setProcessedSubmission(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (error && userProfile?.user_type !== 'admin') {
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
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Admin Panel</h1>
            <p className="text-orange-100">Camp Approval Management</p>
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
        {error && userProfile?.user_type === 'admin' && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Pending Camp Submissions ({pendingSubmissions.length})
          </h2>

          {pendingSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 text-lg">No pending submissions to review</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingSubmissions.map((submission) => (
                <SubmissionReviewCard
                  key={submission.id}
                  submission={submission}
                  onApprove={() => approveSubmission(submission.id)}
                  onReject={(reason) => rejectSubmission(submission.id, reason)}
                  isProcessing={processedSubmission === submission.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface SubmissionReviewCardProps {
  submission: CampSubmission;
  onApprove: () => void;
  onReject: (reason: string) => void;
  isProcessing: boolean;
}

function SubmissionReviewCard({ submission, onApprove, onReject, isProcessing }: SubmissionReviewCardProps) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [dates, setDates] = useState<CampSubmissionDate[]>([]);
  const [images, setImages] = useState<CampSubmissionImage[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const { data: datesData } = await supabase
          .from('camp_submission_dates')
          .select('*')
          .eq('submission_id', submission.id)
          .order('start_date');

        const { data: imagesData } = await supabase
          .from('camp_submission_images')
          .select('*')
          .eq('submission_id', submission.id)
          .order('image_order');

        setDates(datesData || []);
        setImages(imagesData || []);
      } catch (err) {
        console.error('Failed to fetch submission details:', err);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [submission.id]);

  return (
    <div className="border-2 border-slate-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-1">{submission.camp_name}</h3>
          <p className="text-slate-600 flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {submission.location}, {submission.country?.name}
          </p>
        </div>
        <div className="text-right text-sm text-slate-500">
          <p>Submitted {new Date(submission.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      {submission.owner_name && (
        <div className="mb-4 p-4 bg-slate-50 rounded-lg">
          <h4 className="font-semibold text-slate-900 mb-2">Owner Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            <div>
              <span className="text-slate-600">Name:</span>{' '}
              <span className="font-medium">{submission.owner_name}</span>
            </div>
            <div>
              <span className="text-slate-600">Email:</span>{' '}
              <a href={`mailto:${submission.owner_email}`} className="font-medium text-blue-600 hover:underline">
                {submission.owner_email}
              </a>
            </div>
            <div>
              <span className="text-slate-600">Phone:</span>{' '}
              <span className="font-medium">{submission.owner_phone}</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 py-4 border-y border-slate-200">
        <div>
          <p className="text-xs text-slate-600 uppercase font-semibold mb-1">
            <Users className="w-3 h-3 inline" /> Age Group
          </p>
          <p className="font-medium text-slate-900">
            {submission.age_group_min}-{submission.age_group_max} years
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-600 uppercase font-semibold mb-1">Gender</p>
          <p className="font-medium text-slate-900 capitalize">{submission.gender}</p>
        </div>
        <div>
          <p className="text-xs text-slate-600 uppercase font-semibold mb-1">Capacity</p>
          <p className="font-medium text-slate-900">{submission.capacity} participants</p>
        </div>
        <div>
          <p className="text-xs text-slate-600 uppercase font-semibold mb-1">Camp Email</p>
          <a href={`mailto:${submission.camp_email}`} className="font-medium text-blue-600 hover:underline text-sm">
            {submission.camp_email}
          </a>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold text-slate-900 mb-2">Description</h4>
        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{submission.description}</p>
      </div>

      {!loadingDetails && dates.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-slate-900 mb-3">
            <Calendar className="w-4 h-4 inline" /> Camp Dates & Pricing
          </h4>
          <div className="space-y-2">
            {dates.map((date, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-slate-600">
                    {new Date(date.start_date).toLocaleDateString()} - {new Date(date.end_date).toLocaleDateString()}
                  </span>
                  <span className="text-slate-500">({date.duration_days} days)</span>
                </div>
                <div className="flex items-center gap-1 font-semibold text-slate-900">
                  <Euro className="w-4 h-4" />
                  {date.price.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loadingDetails && images.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-slate-900 mb-3">Camp Images ({images.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image.image_url}
                  alt={`Camp image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-slate-200"
                />
                {image.image_order === 0 && (
                  <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                    Profile
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showRejectForm ? (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Rejection Reason
          </label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm mb-3"
            placeholder="Explain why this submission is being rejected..."
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                onReject(rejectionReason);
                setShowRejectForm(false);
                setRejectionReason('');
              }}
              disabled={isProcessing || !rejectionReason.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Confirm Rejection
            </button>
            <button
              onClick={() => {
                setShowRejectForm(false);
                setRejectionReason('');
              }}
              disabled={isProcessing}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={onApprove}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            <Check className="w-5 h-5" />
            {isProcessing ? 'Approving...' : 'Approve Camp'}
          </button>
          <button
            onClick={() => setShowRejectForm(true)}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            <X className="w-5 h-5" />
            Reject Camp
          </button>
        </div>
      )}
    </div>
  );
}
