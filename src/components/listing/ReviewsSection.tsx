'use client';

import { useState } from 'react';
import { Star, User, ChevronDown, MessageSquarePlus } from 'lucide-react';
import { RangeReview } from '@/types/range';

interface ReviewsSectionProps {
  reviews: RangeReview[];
  rangeId: string;
  rangeName: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={`w-4 h-4 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-stone-300'}`} />
      ))}
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function ReviewsSection({ reviews, rangeId, rangeName }: ReviewsSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100 : 0,
  }));

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-stone-800 flex items-center gap-2">
          <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
          Reviews
          {reviews.length > 0 && <span className="text-base font-normal text-stone-500">({reviews.length})</span>}
        </h2>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium text-sm transition-colors"
        >
          <MessageSquarePlus className="w-4 h-4" />
          Write a Review
        </button>
      </div>

      {showForm && <ReviewForm rangeId={rangeId} rangeName={rangeName} onClose={() => setShowForm(false)} />}

      {reviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-4 rounded-xl bg-stone-50">
          <div className="text-center md:text-left md:border-r md:border-stone-200 md:pr-6">
            <p className="text-5xl font-bold text-stone-800 mb-2">{averageRating.toFixed(1)}</p>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <StarRating rating={Math.round(averageRating)} />
            </div>
            <p className="text-sm text-stone-500">
              Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm text-stone-600 w-6">{rating}</span>
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                </div>
                <span className="text-sm text-stone-500 w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {reviews.length > 0 ? (
        <div className="space-y-4">
          {displayedReviews.map((review) => (
            <div key={review.id} className="border-b border-stone-100 pb-4 last:border-0 last:pb-0">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-medium text-stone-800">{review.reviewer_name || 'Anonymous'}</p>
                    <p className="text-xs text-stone-400">{formatDate(review.created_at)}</p>
                  </div>
                  <StarRating rating={review.rating} />
                  {review.review_text && <p className="mt-2 text-stone-600 text-sm leading-relaxed">{review.review_text}</p>}
                </div>
              </div>
            </div>
          ))}

          {reviews.length > 3 && !showAll && (
            <button onClick={() => setShowAll(true)} className="flex items-center justify-center gap-2 w-full py-3 text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
              Show all {reviews.length} reviews
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <Star className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-600 mb-2">No reviews yet</p>
          <p className="text-sm text-stone-500">Be the first to share your experience at {rangeName}!</p>
        </div>
      )}
    </section>
  );
}

function ReviewForm({ rangeId, rangeName, onClose }: { rangeId: string; rangeName: string; onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rangeId, rating, reviewerName: name, reviewText: review }),
      });

      if (response.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mb-6 p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
        <p className="text-emerald-700 font-medium mb-2">Thank you for your review!</p>
        <p className="text-sm text-emerald-600">Your review will be visible once it&apos;s approved.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-6 rounded-xl bg-stone-50 border border-stone-200">
      <h3 className="font-semibold text-stone-800 mb-4">Share your experience</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-stone-700 mb-2">
          Your Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star className={`w-8 h-8 transition-colors ${star <= (hoverRating || rating) ? 'text-amber-400 fill-amber-400' : 'text-stone-300 hover:text-amber-200'}`} />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-stone-500">
              {rating} star{rating !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="reviewer-name" className="block text-sm font-medium text-stone-700 mb-1">
          Your Name <span className="text-stone-400">(optional)</span>
        </label>
        <input
          type="text"
          id="reviewer-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-stone-800 placeholder-stone-400"
          placeholder="Anonymous if left blank"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="review-text" className="block text-sm font-medium text-stone-700 mb-1">
          Your Review <span className="text-stone-400">(optional)</span>
        </label>
        <textarea
          id="review-text"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-stone-800 placeholder-stone-400 resize-none"
          placeholder="Tell others about your experience..."
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={rating === 0 || isSubmitting}
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-stone-300 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
        <button type="button" onClick={onClose} className="px-4 py-2.5 text-stone-600 hover:text-stone-800 font-medium transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}