// src/lib/supabase-helpers.ts
import { createClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from './supabase-admin'
import { EmailService } from '@/lib/email/service'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Admin client with service role (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Listings Operations
export const listingsAPI = {
  async getAll(filters?: { status?: string; province?: string; search?: string }) {
    let query = supabaseAdmin.from('business_listings').select('*')

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }
    if (filters?.province && filters.province !== 'all') {
      query = query.eq('province', filters.province)
    }
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }

    return query.order('created_at', { ascending: false })
  },

  async getById(id: string) {
    return supabaseAdmin
      .from('business_listings')
      .select('*')
      .eq('id', id)
      .single()
  },

  async create(data: any) {
    return supabaseAdmin
      .from('business_listings')
      .insert(data)
      .select()
      .single()
  },

  async update(id: string, data: any) {
    return supabaseAdmin
      .from('business_listings')
      .update(data)
      .eq('id', id)
      .select()
      .single()
  },

  async delete(id: string) {
    return supabaseAdmin
      .from('business_listings')
      .delete()
      .eq('id', id)
  }
}

// Claims Operations
export const claimsAPI = {
  async getAll(status?: string) {
    let query = supabaseAdmin
      .from('claims')
      .select(`
        *,
        listing:ranges(id, name, phone_number, website, address),
        user:profiles(full_name, email, phone)
      `)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    return query.order('created_at', { ascending: false })
  },

  async approve(claimId: string, adminId: string) {
    // 1. Fetch claim with listing info only (no user join needed)
    const { data: claim, error: claimError } = await supabaseAdmin
      .from('claims')
      .select('*, listing:ranges(id, name)')
      .eq('id', claimId)
      .single()

    if (claimError) {
      console.error('approve step 1 (fetch claim) failed:', claimError)
      return { error: claimError }
    }

    // 2. Update claim status
    const { error: updateError } = await supabaseAdmin
      .from('claims')
      .update({
        status: 'approved',
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', claimId)

    if (updateError) {
      console.error('approve step 2 (update claim status) failed:', updateError)
      return { error: updateError }
    }

    // 3. Update range/listing
    const { error: rangeError } = await supabaseAdmin
      .from('ranges')
      .update({
        is_claimed: true,
        owner_id: claim.user_id,
        status: 'active'
      })
      .eq('id', claim.listing_id)

    if (rangeError) {
      console.error('approve step 3 (update range) failed:', rangeError)
      return { error: rangeError }
    }

    // 4. Update user profile role
    const { error: roleError } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'owner' })
      .eq('id', claim.user_id)

    if (roleError) {
      console.error('approve step 4 (update profile role) failed:', roleError)
      return { error: roleError }
    }

    // 5. Send approval email
    try {
      await EmailService.sendVerificationApprovedEmail({
        to: claim.email_address,
        businessName: claim.first_name || claim.listing?.name,
        rangeName: claim.listing?.name,
        rangeId: claim.listing_id
      })
    } catch (emailErr) {
      console.error('Failed to send approval email:', emailErr)
    }

    return { success: true }
  },

  async reject(claimId: string, adminId: string, reason: string) {
    const { data: claim, error: claimError } = await supabaseAdmin
      .from('claims')
      .select('*, listing:ranges(id, name)')
      .eq('id', claimId)
      .single()

    if (claimError) return { error: claimError }

    const { error: updateError } = await supabaseAdmin
      .from('claims')
      .update({
        status: 'rejected',
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason
      })
      .eq('id', claimId)

    if (updateError) return { error: updateError }

    // Send rejection email
    try {
      await EmailService.sendVerificationRejectedEmail({
        to: claim.email_address,
        businessName: claim.first_name || claim.listing?.name,
        rangeName: claim.listing?.name,
        reason: reason
      })
    } catch (emailErr) {
      console.error('Failed to send rejection email:', emailErr)
    }

    return { success: true }
  },

  async markAsContacted(claimId: string, adminId: string, notes?: string) {
    return supabaseAdmin
      .from('claims')
      .update({
        status: 'contacted',
        admin_notes: notes,
        reviewed_by: adminId,
        updated_at: new Date().toISOString()
      })
      .eq('id', claimId)
  },

  async revoke(claimId: string, adminId: string, reason: string) {
    // 1. Fetch claim with listing info
    const { data: claim, error: claimError } = await supabaseAdmin
      .from('claims')
      .select('*, listing:ranges(id, name)')
      .eq('id', claimId)
      .single()

    if (claimError) return { error: claimError }

    // 2. Update claim status to rejected
    const { error: updateError } = await supabaseAdmin
      .from('claims')
      .update({
        status: 'rejected',
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason
      })
      .eq('id', claimId)

    if (updateError) return { error: updateError }

    // 3. Clear ownership from the range
    const { error: rangeError } = await supabaseAdmin
      .from('ranges')
      .update({
        owner_id: null,
        is_claimed: false
      })
      .eq('id', claim.listing_id)

    if (rangeError) return { error: rangeError }

    // 4. Downgrade role only if user has no other approved claims
    const { data: otherClaims } = await supabaseAdmin
      .from('claims')
      .select('id')
      .eq('user_id', claim.user_id)
      .eq('status', 'approved')
      .neq('id', claimId)

    if (!otherClaims || otherClaims.length === 0) {
      const { error: roleError } = await supabaseAdmin
        .from('profiles')
        .update({ role: 'user' })
        .eq('id', claim.user_id)

      if (roleError) return { error: roleError }
    }

    // 5. Send revocation email
    try {
      await EmailService.sendClaimRevokedEmail({
        to: claim.email_address,
        businessName: claim.first_name || claim.listing?.name,
        rangeName: claim.listing?.name,
        reason: reason
      })
    } catch (emailErr) {
      console.error('Failed to send revocation email:', emailErr)
    }

    return { success: true }
  }
}

// Ads Operations
export const adsAPI = {
  async getAll(filters?: { status?: string }) {
    let query = supabaseAdmin
      .from('ads')
      .select(`
        *,
        placements:ad_placement_assignments(
          placement:ad_placements(name, display_name)
        )
      `)

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    return query.order('created_at', { ascending: false })
  },

  async create(adData: any, placementIds: string[]) {
    // Create ad
    const { data: ad, error: adError } = await supabaseAdmin
      .from('ads')
      .insert(adData)
      .select()
      .single()

    if (adError) throw adError

    // Assign to placements
    if (placementIds.length > 0) {
      const assignments = placementIds.map((placementId, index) => ({
        ad_id: ad.id,
        placement_id: placementId,
        order_index: index
      }))

      await supabaseAdmin
        .from('ad_placement_assignments')
        .insert(assignments)
    }

    return ad
  },

  async update(id: string, data: any) {
    return supabaseAdmin
      .from('ads')
      .update(data)
      .eq('id', id)
      .select()
      .single()
  },

  async delete(id: string) {
    return supabaseAdmin
      .from('ads')
      .delete()
      .eq('id', id)
  },

  async trackImpression(adId: string, data: any) {
    await supabaseAdmin
      .from('ad_impressions')
      .insert({
        ad_id: adId,
        ...data
      })

    // Increment counter
    await supabaseAdmin.rpc('increment_ad_impressions', { ad_id: adId })
  },

  async trackClick(adId: string, data: any) {
    await supabaseAdmin
      .from('ad_clicks')
      .insert({
        ad_id: adId,
        ...data
      })

    // Increment counter
    await supabaseAdmin.rpc('increment_ad_clicks', { ad_id: adId })
  }
}

// Announcements Operations
export const announcementsAPI = {
  async getAll(filters?: { status?: string; category?: string }) {
    let query = supabaseAdmin.from('announcements').select('*')

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }
    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category)
    }

    return query.order('priority', { ascending: false }).order('created_at', { ascending: false })
  },

  async getActive(province?: string) {
    let query = supabaseAdmin
      .from('announcements')
      .select('*')
      .eq('status', 'published')
      .lte('publish_date', new Date().toISOString())
      .or(`expire_date.is.null,expire_date.gte.${new Date().toISOString()}`)

    if (province) {
      query = query.or(`province.is.null,province.eq.${province}`)
    }

    return query
      .order('is_pinned', { ascending: false })
      .order('priority', { ascending: false })
      .order('publish_date', { ascending: false })
  },

  async create(data: any) {
    return supabaseAdmin
      .from('announcements')
      .insert(data)
      .select()
      .single()
  },

  async update(id: string, data: any) {
    return supabaseAdmin
      .from('announcements')
      .update(data)
      .eq('id', id)
      .select()
      .single()
  },

  async delete(id: string) {
    return supabaseAdmin
      .from('announcements')
      .delete()
      .eq('id', id)
  },

  async trackClick(announcementId: string, userId?: string) {
    await supabaseAdmin
      .from('announcement_clicks')
      .insert({
        announcement_id: announcementId,
        user_id: userId
      })

    // Increment counter
    await supabaseAdmin.rpc('increment_announcement_clicks', { announcement_id: announcementId })
  }
}

// Users Operations
export const usersAPI = {
  async getAll(filters?: { role?: string; search?: string }) {
    let query = supabaseAdmin.from('profiles').select('*')

    if (filters?.role && filters.role !== 'all') {
      query = query.eq('role', filters.role)
    }
    if (filters?.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
    }

    return query.order('created_at', { ascending: false })
  },

  async updateRole(userId: string, role: string) {
    return supabaseAdmin
      .from('profiles')
      .update({ role })
      .eq('id', userId)
  }
}

// Analytics Operations
export const analyticsAPI = {
  async getPageViews(startDate: string, endDate: string) {
    // TODO: Implement page view tracking
    return []
  },

  async getAdPerformance(startDate: string, endDate: string) {
    const { data: impressions } = await supabaseAdmin
      .from('ad_impressions')
      .select('id')
      .gte('created_at', startDate)
      .lte('created_at', endDate)

    const { data: clicks } = await supabaseAdmin
      .from('ad_clicks')
      .select('id')
      .gte('created_at', startDate)
      .lte('created_at', endDate)

    const impressionCount = impressions?.length || 0
    const clickCount = clicks?.length || 0

    return {
      impressions: impressionCount,
      clicks: clickCount,
      ctr: impressionCount > 0 ? (clickCount / impressionCount) * 100 : 0
    }
  },

  async getTopListings(limit: number = 10) {
    return supabaseAdmin
      .from('business_listings')
      .select('id, name, views_count, clicks_count')
      .order('views_count', { ascending: false })
      .limit(limit)
  }
}

// Storage Operations
export const storageAPI = {
  async uploadImage(bucket: string, path: string, file: File) {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return publicUrl
  },

  async deleteImage(bucket: string, path: string) {
    return supabaseAdmin.storage
      .from(bucket)
      .remove([path])
  }
}