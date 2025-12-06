'use client'

import { useState } from 'react'

interface ImageGalleryProps {
  images: string[]
  altText: string
}

export default function ImageGallery({ images, altText }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-200 rounded-xl h-96 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">📸</span>
          <p className="text-gray-600">No images available</p>
        </div>
      </div>
    )
  }

  const openLightbox = (index: number) => {
    setSelectedImage(index)
    setIsLightboxOpen(true)
  }

  const closeLightbox = () => {
    setIsLightboxOpen(false)
  }

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <>
      {/* Main Gallery */}
      <div className="space-y-4">
        {/* Main Image */}
        <div 
          className="relative h-96 rounded-xl overflow-hidden cursor-pointer group"
          onClick={() => openLightbox(selectedImage)}
        >
          <img
            src={images[selectedImage]}
            alt={`${altText} - Image ${selectedImage + 1}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity" />
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {selectedImage + 1} / {images.length}
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-xl">🔍 Click to enlarge</span>
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-3">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative h-24 rounded-lg overflow-hidden transition-all ${
                  index === selectedImage
                    ? 'ring-4 ring-green-500 scale-105'
                    : 'hover:scale-105 opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={image}
                  alt={`${altText} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 z-10"
          >
            ×
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-4 text-white text-lg z-10">
            {selectedImage + 1} / {images.length}
          </div>

          {/* Previous Button */}
          {images.length > 1 && (
            <button
              onClick={prevImage}
              className="absolute left-4 text-white text-6xl hover:text-gray-300 z-10"
            >
              ‹
            </button>
          )}

          {/* Main Image */}
          <div className="max-w-7xl max-h-screen p-4">
            <img
              src={images[selectedImage]}
              alt={`${altText} - Image ${selectedImage + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Next Button */}
          {images.length > 1 && (
            <button
              onClick={nextImage}
              className="absolute right-4 text-white text-6xl hover:text-gray-300 z-10"
            >
              ›
            </button>
          )}

          {/* Keyboard Hint */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm opacity-50">
            Press ESC to close • Use arrow keys to navigate
          </div>
        </div>
      )}
    </>
  )
}