'use client'

import { useState, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Upload, X, Camera } from 'lucide-react'

interface AvatarUploadProps {
    uid: string
    url: string | null
    size?: number
    onUpload: (url: string) => void
}

export default function AvatarUpload({ uid, url, size = 150, onUpload }: AvatarUploadProps) {
    const supabase = createClientComponentClient()
    const [uploading, setUploading] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState<string | null>(url)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.')
            }

            const file = event.target.files[0]
            const fileExt = file.name.split('.').pop()
            const filePath = `${uid}-${Math.random()}.${fileExt}`

            // Upload file to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            setAvatarUrl(publicUrl)
            onUpload(publicUrl)
        } catch (error) {
            console.error('Error uploading avatar:', error)
            alert('Error uploading avatar!')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="flex flex-col items-center">
            <div
                className="relative group cursor-pointer"
                style={{ width: size, height: size }}
                onClick={() => fileInputRef.current?.click()}
            >
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="rounded-full object-cover w-full h-full border-4 border-white shadow-lg group-hover:opacity-75 transition-opacity"
                    />
                ) : (
                    <div className="w-full h-full rounded-full bg-stone-200 flex items-center justify-center border-4 border-white shadow-lg text-stone-400 group-hover:bg-stone-300 transition-colors">
                        <UserIcon size={size / 2} />
                    </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white w-8 h-8" />
                </div>

                {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/80">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                    </div>
                )}
            </div>

            <input
                type="file"
                id="single"
                accept="image/*"
                onChange={uploadAvatar}
                disabled={uploading}
                ref={fileInputRef}
                className="hidden"
            />

            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mt-4 text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
                {uploading ? 'Uploading...' : 'Upload New Photo'}
            </button>
        </div>
    )
}

function UserIcon({ size }: { size: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    )
}
