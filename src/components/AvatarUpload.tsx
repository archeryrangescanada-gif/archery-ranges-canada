'use client'

import { useState, useRef } from 'react'
import { Upload, X, Camera } from 'lucide-react'

interface AvatarUploadProps {
    uid: string
    url: string | null
    size?: number
    onUpload: (url: string) => void
}

export default function AvatarUpload({ uid, url, size = 150, onUpload }: AvatarUploadProps) {
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
            
            // Client-side compression to bypass Vercel 4.5MB payload limit
            const compressImage = (file: File): Promise<Blob> => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader()
                    reader.readAsDataURL(file)
                    reader.onload = (e) => {
                        const img = new Image()
                        img.src = e.target?.result as string
                        img.onload = () => {
                            const canvas = document.createElement('canvas')
                            const MAX = 800
                            let width = img.width
                            let height = img.height

                            if (width > height && width > MAX) {
                                height *= MAX / width
                                width = MAX
                            } else if (height > MAX) {
                                width *= MAX / height
                                height = MAX
                            }

                            canvas.width = width
                            canvas.height = height
                            const ctx = canvas.getContext('2d')
                            ctx?.drawImage(img, 0, 0, width, height)

                            canvas.toBlob((blob) => {
                                if (blob) resolve(blob)
                                else reject(new Error('Compression failed'))
                            }, 'image/jpeg', 0.8)
                        }
                        img.onerror = reject
                    }
                    reader.onerror = reject
                })
            }

            const compressedBlob = await compressImage(file)
            const compressedFile = new File([compressedBlob], `avatar.jpg`, { type: 'image/jpeg' })

            // Upload via server-side API route (bypasses storage RLS)
            const formData = new FormData()
            formData.append('file', compressedFile)


            const response = await fetch('/api/user/upload-avatar', {
                method: 'POST',
                body: formData,
            })

            let result;
            try {
                result = await response.json()
            } catch (e) {
                // If it's not JSON, it's likely a server-level error like 413 Payload Too Large
                if (response.status === 413) {
                    throw new Error('Image is too large to upload. Please try a smaller photo (under 5MB).')
                }
                throw new Error('An unexpected server error occurred during upload.')
            }

            if (!response.ok) {
                throw new Error(result?.error || 'Upload failed')
            }

            setAvatarUrl(result.url)
            onUpload(result.url)
            
            // Notify other components (like the top nav) to refetch profile
            window.dispatchEvent(new Event('profile-updated'))
        } catch (error: any) {
            console.error('Error uploading avatar:', error)
            alert(error.message || 'Error uploading avatar!')
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

            <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
                >
                    {uploading ? 'Uploading...' : 'Upload New Photo'}
                </button>
                {avatarUrl && (
                    <button
                        type="button"
                        onClick={() => {
                            if (confirm('Are you sure you want to remove your profile photo?')) {
                                setAvatarUrl(null)
                                onUpload('') // Update parent with empty string to trigger DB update
                                window.dispatchEvent(new Event('profile-updated'))
                            }
                        }}
                        disabled={uploading}
                        className="text-sm font-medium text-red-500 hover:text-red-600 disabled:opacity-50"
                    >
                        Delete Photo
                    </button>
                )}
            </div>
            <p className="text-xs text-stone-400 mt-2">Maximum file size: 5MB</p>
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
