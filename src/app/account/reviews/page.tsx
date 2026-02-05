'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { Star, Edit, Trash2 } from 'lucide-react';

interface Review {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    listing_id: string;
    ranges: {
        name: string;
        slug: string;
    }
}

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Edit State
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [saving, setSaving] = useState(false);

    const supabase = createClientComponentClient();

    useEffect(() => {
        async function getReviews() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('reviews')
                .select(`
          id,
          rating,
          comment,
          created_at,
          listing_id,
          ranges:listing_id (
            name,
            slug
          )
        `)
                .eq('user_id', user.id);

            setReviews(data || []);
            setLoading(false);
        }

        getReviews();
    }, [supabase]);

    const handleEditClick = (review: Review) => {
        setEditingId(review.id);
        setRating(review.rating);
        setComment(review.comment);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingId) return;
        setSaving(true);

        try {
            const { error } = await supabase
                .from('reviews')
                .update({ rating, comment, updated_at: new Date().toISOString() })
                .eq('id', editingId);

            if (error) throw error;

            setReviews(reviews.map(r =>
                r.id === editingId ? { ...r, rating, comment } : r
            ));
            setEditingId(null);
        } catch (error) {
            console.error(error);
            alert('Failed to update review');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this review?")) return;

        try {
            const { error } = await supabase
                .from('reviews')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setReviews(reviews.filter(r => r.id !== id));
        } catch (error) {
            console.error(error);
            alert('Failed to delete review');
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-3xl font-bold text-stone-900 mb-8">My Reviews</h1>

                {loading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-stone-100">
                        <Star className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-stone-900">No reviews yet</h3>
                        <p className="text-stone-500 mb-6">You haven't customized any reviews yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <div key={review.id} className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm">

                                {editingId === review.id ? (
                                    <form onSubmit={handleUpdate} className="space-y-4">
                                        <h3 className="font-bold">Edit Review for {review.ranges.name}</h3>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setRating(star)}
                                                    className={`p-1 focus:outline-none ${rating >= star ? 'text-yellow-400' : 'text-stone-300'}`}
                                                >
                                                    <Star className={`w-8 h-8 ${rating >= star ? 'fill-current' : ''}`} />
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-stone-300 outline-none focus:ring-2 focus:ring-emerald-500"
                                            rows={3}
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                type="button"
                                                onClick={handleCancelEdit}
                                                className="px-4 py-2 text-stone-500 hover:bg-stone-100 rounded-lg"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                                            >
                                                {saving ? 'Saving...' : 'Update'}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-start mb-2">
                                            <Link href={`/${review.ranges.slug}`} className="font-bold text-lg text-stone-900 hover:text-emerald-600">
                                                {review.ranges.name}
                                            </Link>
                                            <span className="text-sm text-stone-400">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex mb-3">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    type="button"
                                                    key={i}
                                                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-stone-300'}`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-stone-600 mb-4">{review.comment}</p>

                                        <div className="flex gap-3 pt-3 border-t border-stone-100">
                                            <button
                                                onClick={() => handleEditClick(review)}
                                                className="flex items-center text-sm font-medium text-stone-500 hover:text-emerald-600 transition-colors"
                                            >
                                                <Edit className="w-4 h-4 mr-1.5" />
                                                Edit Review
                                            </button>
                                            <button
                                                onClick={() => handleDelete(review.id)}
                                                className="flex items-center text-sm font-medium text-stone-500 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4 mr-1.5" />
                                                Delete
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
