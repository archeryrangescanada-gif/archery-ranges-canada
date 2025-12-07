import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rangeId, rating, reviewerName, reviewText } = body;

    if (!rangeId || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: range, error: rangeError } = await supabase.from('ranges').select('id, subscription_tier, subscription_expires_at').eq('id', rangeId).single();

    if (rangeError || !range) {
      return NextResponse.json({ error: 'Range not found' }, { status: 404 });
    }

    const tier = range.subscription_tier;
    const isExpired = range.subscription_expires_at && new Date(range.subscription_expires_at) < new Date();
    const reviewsAllowed = (tier === 'pro' || tier === 'premium') && !isExpired;

    if (!reviewsAllowed) {
      return NextResponse.json({ error: 'Reviews not available for this listing' }, { status: 403 });
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id || null;

    const { data, error } = await supabase
      .from('range_reviews')
      .insert({
        range_id: rangeId,
        user_id: userId,
        reviewer_name: reviewerName?.trim() || null,
        rating: ratingNum,
        review_text: reviewText?.trim() || null,
        is_approved: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating review:', error);
      return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      message: 'Review submitted successfully. It will be visible after approval.',
    });
  } catch (error) {
    console.error('Reviews API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rangeId = searchParams.get('rangeId');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (!rangeId) {
      return NextResponse.json({ error: 'Range ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error, count } = await supabase
      .from('range_reviews')
      .select('*', { count: 'exact' })
      .eq('range_id', rangeId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }

    return NextResponse.json({
      reviews: data,
      total: count,
      hasMore: (count || 0) > offset + limit,
    });
  } catch (error) {
    console.error('Reviews GET API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
