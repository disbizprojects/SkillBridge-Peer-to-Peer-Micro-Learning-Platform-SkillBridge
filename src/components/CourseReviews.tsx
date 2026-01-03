import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, Loader } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d45a5820`;

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
  userHasLiked?: boolean;
}

interface CourseReviewsProps {
  courseId: string;
  canReview?: boolean;
}

export const CourseReviews: React.FC<CourseReviewsProps> = ({ courseId, canReview = false }) => {
  const { currentUser } = useApp();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [courseId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/courses/${courseId}/reviews`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('Please login to submit a review');
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('Review must be at least 10 characters');
      return;
    }

    try {
      setSubmitting(true);
      const token = currentUser.id; // Using userId as token for demo
      
      const response = await fetch(`${API_URL}/courses/${courseId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit review');
      }

      toast.success('Review submitted successfully!');
      setShowReviewForm(false);
      setComment('');
      setRating(5);
      fetchReviews();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeReview = async (reviewId: string) => {
    if (!currentUser) {
      toast.error('Please login to like reviews');
      return;
    }

    try {
      const token = currentUser.id; // Using userId as token for demo
      
      const response = await fetch(`${API_URL}/reviews/${reviewId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to like review');
      }

      fetchReviews();
    } catch (error) {
      console.error('Error liking review:', error);
      toast.error('Failed to like review');
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
    percentage: reviews.length > 0
      ? (reviews.filter((r) => r.rating === stars).length / reviews.length) * 100
      : 0,
  }));

  const StarRating: React.FC<{ rating: number; size?: number; interactive?: boolean; onRate?: (rating: number) => void }> = ({ 
    rating, 
    size = 20, 
    interactive = false,
    onRate 
  }) => {
    const [hover, setHover] = useState(0);

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${
              star <= (hover || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            } ${interactive ? 'cursor-pointer' : ''}`}
            style={{ width: size, height: size }}
            onMouseEnter={() => interactive && setHover(star)}
            onMouseLeave={() => interactive && setHover(0)}
            onClick={() => interactive && onRate && onRate(star)}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-2xl mb-4">Reviews & Ratings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Average Rating */}
          <div className="text-center md:text-left">
            <div className="text-5xl mb-2">{averageRating.toFixed(1)}</div>
            <StarRating rating={averageRating} size={24} />
            <p className="text-gray-600 mt-2">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {ratingDistribution.map(({ stars, count, percentage }) => (
              <div key={stars} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-8">{stars} ⭐</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Write Review Button */}
        {canReview && !showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="mt-6 w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-xl mb-4">Write Your Review</h4>
          
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Rating Selector */}
            <div>
              <label className="block text-sm mb-2">Your Rating</label>
              <StarRating 
                rating={rating} 
                size={32} 
                interactive 
                onRate={setRating}
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm mb-2">Your Review</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                rows={4}
                placeholder="Share your experience with this course..."
                required
                minLength={10}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 10 characters ({comment.length}/10)
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(false);
                  setComment('');
                  setRating(5);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || comment.trim().length < 10}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h4 className="text-xl">All Reviews</h4>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
            <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No reviews yet</p>
            <p className="text-sm mt-1">Be the first to review this course!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  {review.userAvatar ? (
                    <img
                      src={review.userAvatar}
                      alt={review.userName}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600">{review.userName.charAt(0)}</span>
                    </div>
                  )}

                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p>{review.userName}</p>
                        <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                      </div>
                      <StarRating rating={review.rating} size={16} />
                    </div>

                    <p className="text-gray-700 mb-3">{review.comment}</p>

                    {/* Helpful Button */}
                    <button
                      onClick={() => handleLikeReview(review.id)}
                      className={`flex items-center gap-2 text-sm ${
                        review.userHasLiked
                          ? 'text-blue-600'
                          : 'text-gray-600 hover:text-blue-600'
                      } transition-colors`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>Helpful ({review.helpful})</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};