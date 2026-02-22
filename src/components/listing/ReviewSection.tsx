'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Star, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Review {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    user_id: string;
    profiles: {
        full_name: string | null;
        avatar_url: string | null;
    };
    owner_reply?: string;
    owner_reply_created_at?: string;
}

interface ReviewSectionProps {
    listingId: string;
    initialReviews?: Review[];
}

export function ReviewSection({ listingId, initialReviews = [] }: ReviewSectionProps) {
    const [reviews, setReviews] = useState<Review[]>(initialReviews);
    const [userReview, setUserReview] = useState<Review | null>(null);
    const [loading, setLoading] = useState(initialReviews.length === 0);
    const [showForm, setShowForm] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // Form State
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            const { data: { user } } = await supabase.auth.getUser();
            setUserId(user?.id || null);

            // If we have initial reviews and a user, check if one belongs to user
            if (initialReviews.length > 0 && user) {
                const myReview = initialReviews.find(r => r.user_id === user.id);
                if (myReview) {
                    setUserReview(myReview);
                    setRating(myReview.rating);
                    setComment(myReview.comment);
                }
            }

            if (initialReviews.length === 0) {
                // Fetch reviews
                const { data } = await supabase
                    .from('reviews')
                    .select(`
                    *,
                    profiles (
                        full_name,
                        avatar_url
                    )
                `)
                    .eq('listing_id', listingId)
                    .order('created_at', { ascending: false });

                if (data) {
                    setReviews(data);
                    if (user) {
                        const myReview = data.find((r: Review) => r.user_id === user.id);
                        if (myReview) {
                            setUserReview(myReview);
                            setRating(myReview.rating);
                            setComment(myReview.comment);
                        }
                    }
                }
                setLoading(false);
            }
        }
        fetchData();
    }, [listingId, supabase, initialReviews]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) {
            router.push('/auth/login');
            return;
        }
        setSubmitting(true);

        try {
            const payload = {
                user_id: userId,
                listing_id: listingId,
                rating,
                comment,
                updated_at: new Date().toISOString()
            };

            if (userReview) {
                // Update
                const { error } = await supabase
                    .from('reviews')
                    .update(payload)
                    .eq('id', userReview.id);
                if (error) throw error;
            } else {
                // Insert
                const { error } = await supabase
                    .from('reviews')
                    .insert(payload);
                if (error) throw error;
            }

            router.refresh();
            window.location.reload(); // Simple reload to refresh state
        } catch (error) {
            console.error(error);
            alert('Error submitting review');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = () => {
        setShowForm(true);
    };

    const handleDelete = async () => {
        if (!userReview || !confirm("Are you sure you want to delete your review?")) return;

        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', userReview.id);

        if (!error) {
            window.location.reload();
        }
    };

    const averageRating = reviews.length
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : '0.0';

    if (loading) return <div className="py-8 text-center text-stone-500">Loading reviews...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-8" id="reviews">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
                        Reviews
                        <span className="text-lg font-normal text-stone-500">({reviews.length})</span>
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex text-yellow-400">
                            <Star className="w-5 h-5 fill-current" />
                        </div>
                        <span className="font-bold text-stone-900">{averageRating}</span>
                        <span className="text-stone-400">out of 5</span>
                    </div>
                </div>

                {!showForm && !userReview && (
                    <button
                        onClick={() => userId ? setShowForm(true) : router.push('/auth/login')}
                        className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                    >
                        Write a Review
                    </button>
                )}
            </div>

            {(showForm || (userReview && showForm)) && (
                <form onSubmit={handleSubmit} className="mb-8 bg-stone-50 p-6 rounded-xl border border-stone-200">
                    <h3 className="font-bold text-stone-900 mb-4">{userReview ? 'Edit Your Review' : 'Write a Review'}</h3>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-stone-700 mb-2">Rating</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`p-1 focus:outline-none transition-colors ${rating >= star ? 'text-yellow-400' : 'text-stone-300'}`}
                                >
                                    <Star className={`w-8 h-8 ${rating >= star ? 'fill-current' : ''}`} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-stone-700 mb-2">Comment</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none text-stone-900 bg-white"
                            rows={4}
                            placeholder="Share your experience..."
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 text-stone-600 hover:bg-stone-200 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                        >
                            {submitting ? 'Submitting...' : 'Post Review'}
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-6">
                {reviews.length === 0 ? (
                    <p className="text-stone-500 italic">No reviews yet. Be the first to share your experience!</p>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="border-b border-stone-100 last:border-0 pb-6 last:pb-0">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    {review.profiles?.avatar_url ? (
                                        <img src={review.profiles.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                                            <UserIcon className="w-6 h-6" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold text-stone-900">{review.profiles?.full_name || 'Anonymous'}</p>
                                        <p className="text-xs text-stone-400">{new Date(review.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-stone-200'}`} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-stone-600 leading-relaxed mb-2">{review.comment}</p>

                            {review.owner_reply && (
                                <div className="mt-4 bg-stone-50 rounded-lg p-4 border border-stone-200 ml-4 lg:ml-8 relative before:content-[''] before:absolute before:left-[-1rem] before:top-4 before:w-4 before:h-4 before:border-l-2 before:border-b-2 before:border-stone-300 before:rounded-bl-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                            Owner Response
                                        </span>
                                        {review.owner_reply_created_at && (
                                            <span className="text-xs text-stone-500">
                                                {new Date(review.owner_reply_created_at).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-stone-600">{review.owner_reply}</p>
                                </div>
                            )}


                            {userId === review.user_id && !showForm && (
                                <div className="mt-3 flex gap-4 text-sm">
                                    <button onClick={handleEdit} className="text-stone-500 hover:text-emerald-600 font-medium">Edit</button>
                                    <button onClick={handleDelete} className="text-stone-500 hover:text-red-600 font-medium">Delete</button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
