// src/lib/supabase-admin.ts
import { getAdminClient } from './supabase/admin'

// Listings Operations
export const listingsAPI = {
  async getAll(filters?: { status?: string; province?: string; search?: string }) {
    const supabaseAdmin = getAdminClient()
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
    const supabaseAdmin = getAdminClient()
    return supabaseAdmin
      .from('business_listings')
      .select('*')
      .eq('id', id)
      .single()
  },

  async create(data: any) {
    const supabaseAdmin = getAdminClient()
    return supabaseAdmin
      .from('business_listings')
      .insert(data)
      .select()
      .single()
  },

  async update(id: string, data: any) {
    const supabaseAdmin = getAdminClient()
    return supabaseAdmin
      .from('business_listings')
      .update(data)
      .eq('id', id)
      .select()
      .single()
  },

  async delete(id: string) {
    const supabaseAdmin = getAdminClient()
    return supabaseAdmin
      .from('business_listings')
      .delete()
      .eq('id', id)
  }
}

// Claims Operations
export const claimsAPI = {
  async getAll(status?: string) {
    const supabaseAdmin = getAdminClient()
    let query = supabaseAdmin
      .from('listing_claims')
      .select(`
        *,
        listing:business_listings(name),
        user:profiles(full_name, email, phone)
      `)
    
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    
    return query.order('created_at', { ascending: false })
  },

  async approve(claimId: string, adminId: string) {
    const supabaseAdmin = getAdminClient()
    const { data: claim, error: claimError } = await supabaseAdmin
      .from('listing_claims')
      .select('*, listing_id, user_id')
      .eq('id', claimId)
      .single()

    if (claimError) throw claimError

    // Update claim status
    await supabaseAdmin
      .from('listing_claims')
      .update({
        status: 'approved',
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', claimId)

    // Update listing
    await supabaseAdmin
      .from('business_listings')
      .update({
        claimed: true,
        claimed_at: new Date().toISOString(),
        owner_id: claim.user_id
      })
      .eq('id', claim.listing_id)

    // TODO: Send approval email
    
    return { success: true }
  },

  async reject(claimId: string, adminId: string, reason: string) {
    const supabaseAdmin = getAdminClient()
    await supabaseAdmin
      .from('listing_claims')
      .update({
        status: 'rejected',
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason
      })
      .eq('id', claimId)

    // TODO: Send rejection email
    
    return { success: true }
  }
}

// Ads Operations
export const adsAPI = {
  async getAll(filters?: { status?: string }) {
    const supabaseAdmin = getAdminClient()
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
    const supabaseAdmin = getAdminClient()
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
    const supabaseAdmin = getAdminClient()
    return supabaseAdmin
      .from('ads')
      .update(data)
      .eq('id', id)
      .select()
      .single()
  },

  async delete(id: string) {
    const supabaseAdmin = getAdminClient()
    return supabaseAdmin
      .from('ads')
      .delete()
      .eq('id', id)
  },

  async trackImpression(adId: string, data: any) {
    const supabaseAdmin = getAdminClient()
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
    const supabaseAdmin = getAdminClient()
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
    const supabaseAdmin = getAdminClient()
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
    const supabaseAdmin = getAdminClient()
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
    const supabaseAdmin = getAdminClient()
    return supabaseAdmin
      .from('announcements')
      .insert(data)
      .select()
      .single()
  },

  async update(id: string, data: any) {
    const supabaseAdmin = getAdminClient()
    return supabaseAdmin
      .from('announcements')
      .update(data)
      .eq('id', id)
      .select()
      .single()
  },

  async delete(id: string) {
    const supabaseAdmin = getAdminClient()
    return supabaseAdmin
      .from('announcements')
      .delete()
      .eq('id', id)
  },

  async trackClick(announcementId: string, userId?: string) {
    const supabaseAdmin = getAdminClient()
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
    const supabaseAdmin = getAdminClient()
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
    const supabaseAdmin = getAdminClient()
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
    const supabaseAdmin = getAdminClient()
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
    const supabaseAdmin = getAdminClient()
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
    const supabaseAdmin = getAdminClient()
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
    const supabaseAdmin = getAdminClient()
    return supabaseAdmin.storage
      .from(bucket)
      .remove([path])
  }
}