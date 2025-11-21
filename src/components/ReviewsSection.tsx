import React, { useState } from 'react';
import { Review, ReviewReply } from '../types';
import { BasketballRating } from './BasketballRating';

interface ReviewsSectionProps {
  campId: string;
  reviews: (Review & { review_replies?: ReviewReply[] })[];
}

export function ReviewsSection({ campId, reviews }: ReviewsSectionProps) {
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  const toggleExpanded = (reviewId: string) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Reviews from Participants</h2>

        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg">No reviews yet. Be the first to review this camp!</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-4xl font-bold text-black">{avgRating}</span>
                  <span className="text-slate-600">/ 5</span>
                </div>
                <BasketballRating rating={parseFloat(avgRating as string)} readonly size="md" />
                <p className="text-sm text-slate-600 mt-2">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{review.participant_name}</h3>
                      <p className="text-sm text-slate-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <BasketballRating rating={review.rating} readonly size="sm" />
                  </div>

                  <p className="text-slate-700 mb-4">{review.review_text}</p>

                  {review.review_replies && review.review_replies.length > 0 && (
                    <button
                      onClick={() => toggleExpanded(review.id)}
                      className="text-sm text-black hover:text-slate-900 font-medium mb-3"
                    >
                      {expandedReviews.has(review.id) ? '▼' : '▶'} Camp Reply
                      {review.review_replies.length > 1 ? `s (${review.review_replies.length})` : ''}
                    </button>
                  )}

                  {expandedReviews.has(review.id) && review.review_replies && (
                    <div className="mt-4 pl-4 border-l-4 border-slate-300 bg-slate-50 p-4 rounded">
                      {review.review_replies.map((reply) => (
                        <div key={reply.id} className="mb-3">
                          <p className="font-medium text-slate-900 text-sm mb-1">Camp Owner Reply</p>
                          <p className="text-slate-700">{reply.reply_text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
