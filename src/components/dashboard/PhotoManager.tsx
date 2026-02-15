'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Loader2, Image as ImageIcon, Plus } from 'lucide-react'
import { SubscriptionTier, getPhotoLimit, getUpgradeLink } from '@/lib/subscription-utils'
import Link from 'next/link'

interface PhotoManagerProps {
    rangeId: string
    currentPhotos: string[]
    tier: SubscriptionTier
    onPhotosChange: (photos: string[]) => void
}

export function PhotoManager({ rangeId, currentPhotos, tier, onPhotosChange }: PhotoManagerProps) {
    const supabase = createClient()
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const photoLimit = getPhotoLimit(tier)
    const canUpload = photoLimit === -1 || currentPhotos.length < photoLimit

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!canUpload) {
            setError(`You have reached the limit of ${photoLimit} photo(s) for your plan.`)
            return
        }

        setUploading(true)
        setError('')

        try {
            // 1. Upload to storage
            const fileExt = file.name.split('.').pop()
            const fileName = `${rangeId}/${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `range-photos/${fileName}`

            const { error: uploadError, data } = await supabase.storage
                .from('range-images')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // 2. Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('range-images')
                .getPublicUrl(filePath)

            // 3. Update parent state
            const newPhotos = [...currentPhotos, publicUrl]
            onPhotosChange(newPhotos)

            // Note: Parent component handles saving to database when "Save" is clicked
            // or we could save immediately here if preferred. 
            // In the context of settings page, we'll let handleSave do it.
        } catch (err: any) {
            setError(err.message || 'Failed to upload image')
        } finally {
            setUploading(false)
            // Reset input
            e.target.value = ''
        }
    }

    const handleDelete = async (index: number) => {
        const newPhotos = currentPhotos.filter((_, i) => i !== index)
        onPhotosChange(newPhotos)

        // Note: Real deletion from storage could be done here too, 
        // but for now we just remove from the list.
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-stone-700">Photos ({currentPhotos.length}/{photoLimit === -1 ? 'Unlimited' : photoLimit})</h3>
                {tier === 'bronze' && (
                    <a href={getUpgradeLink(tier, rangeId)} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                        Upgrade for more photos
                    </a>
                )}
                {tier === 'silver' && (
                    <a href={getUpgradeLink(tier, rangeId)} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                        Upgrade for unlimited photos
                    </a>
                )}
            </div>

            {error && (
                <div className="text-xs text-red-500 font-medium bg-red-50 p-2 rounded">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {currentPhotos.map((photo, index) => (
                    <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-stone-200 bg-stone-100">
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                        <button
                            onClick={() => handleDelete(index)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}

                {canUpload && (
                    <label className={`relative aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${uploading ? 'bg-stone-50 border-stone-300' : 'border-stone-200 hover:border-emerald-500 hover:bg-emerald-50'}`}>
                        {uploading ? (
                            <>
                                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mb-2" />
                                <span className="text-xs text-stone-500 font-medium">Uploading...</span>
                            </>
                        ) : (
                            <>
                                <Plus className="w-6 h-6 text-stone-400 mb-2" />
                                <span className="text-xs text-stone-500 font-medium">Add Photo</span>
                            </>
                        )}
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleUpload}
                            disabled={uploading}
                        />
                    </label>
                )}
            </div>

            <p className="text-xs text-stone-400">
                {tier === 'bronze'
                    ? `Bronze plan: ${photoLimit} photo allowed. Upgrade to Silver for 5 photos.`
                    : tier === 'silver'
                        ? `Silver plan: ${photoLimit} photos allowed. Upgrade to Gold for unlimited photos.`
                        : `${tier.charAt(0).toUpperCase() + tier.slice(1)} plan: ${photoLimit} photos allowed.`}
            </p>
        </div>
    )
}
