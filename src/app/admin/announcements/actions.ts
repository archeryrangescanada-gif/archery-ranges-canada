'use server'

import { announcementsAPI } from '@/lib/supabase-helpers'
import { revalidatePath } from 'next/cache'

export async function getAnnouncements(filters?: { status?: string; category?: string }) {
  try {
    const { data, error } = await announcementsAPI.getAll(filters)
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return { data: [], error: 'Failed to fetch announcements' }
  }
}

export async function togglePinnedAnnouncement(id: string, is_pinned: boolean) {
  try {
    const { data, error } = await announcementsAPI.update(id, { is_pinned })
    if (error) throw error
    revalidatePath('/admin/announcements')
    return { success: true, data }
  } catch (error) {
    console.error('Error updating pinned status:', error)
    return { success: false, error: 'Failed to update pinned status' }
  }
}

export async function toggleFeaturedAnnouncement(id: string, is_featured: boolean) {
  try {
    const { data, error } = await announcementsAPI.update(id, { is_featured })
    if (error) throw error
    revalidatePath('/admin/announcements')
    return { success: true, data }
  } catch (error) {
    console.error('Error updating featured status:', error)
    return { success: false, error: 'Failed to update featured status' }
  }
}

export async function deleteAnnouncement(id: string) {
  try {
    const { error } = await announcementsAPI.delete(id)
    if (error) throw error
    revalidatePath('/admin/announcements')
    return { success: true }
  } catch (error) {
    console.error('Error deleting announcement:', error)
    return { success: false, error: 'Failed to delete announcement' }
  }
}
