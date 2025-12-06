'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { SubscriptionTier, getMaxPhotos, getMaxVideos } from '@/types/range';
import { ChevronLeft, ChevronRight, Play, X, Expand, ImageIcon } from 'lucide-react';

interface MediaSectionProps {
  images: string[];
  videos: string[];
  rangeName: string;
  tier: SubscriptionTier;
  showCarousel: boolean;
  showVideo: boolean;
}

function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function MediaSection({ images, videos, rangeName, tier, showCarousel, showVideo }: MediaSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  const displayImages = images.slice(0, getMaxPhotos(tier, images.length));
  const displayVideos = videos.slice(0, getMaxVideos(tier, videos.length));

  const hasImages = displayImages.length > 0;
  const hasVideos = showVideo && displayVideos.length > 0;
  const totalMedia = displayImages.length + (hasVideos ? displayVideos.length : 0);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? totalMedia - 1 : prev - 1));
  }, [totalMedia]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === totalMedia - 1 ? 0 : prev + 1));
  }, [totalMedia]);

  const openVideo = (url: string) => {
    setActiveVideoUrl(url);
    setShowVideoModal(true);
  };

  // No media placeholder
  if (!hasImages && !hasVideos) {
    return (
      <div className="relative h-64 md:h-96 bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
        <div className="text-center text-stone-500">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No photos available</p>
          <p className="text-sm">Check back soon for images of this range</p>
        </div>
      </div>
    );
  }

  // Single image (Basic tier or only one image)
  if (!showCarousel || totalMedia === 1) {
    const imageUrl = displayImages[0];
    return (
      <div className="relative h-64 md:h-96 lg:h-[500px] overflow-hidden bg-stone-900">
        {hasVideos && displayVideos[0] ? (
          <div className="relative w-full h-full cursor-pointer group" onClick={() => openVideo(displayVideos[0])}>
            <Image
              src={`https://img.youtube.com/vi/${getYouTubeId(displayVideos[0])}/maxresdefault.jpg`}
              alt={`${rangeName} video thumbnail`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
              <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                <Play className="w-10 h-10 text-emerald-600 ml-1" fill="currentColor" />
              </div>
            </div>
          </div>
        ) : imageUrl ? (
          <>
            <Image src={imageUrl} alt={rangeName} fill className="object-cover" priority />
            <button
              onClick={() => setShowLightbox(true)}
              className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors backdrop-blur-sm"
            >
              <Expand className="w-4 h-4" />
              View Full
            </button>
          </>
        ) : null}

        {showVideoModal && activeVideoUrl && <VideoModal videoUrl={activeVideoUrl} onClose={() => setShowVideoModal(false)} />}

        {showLightbox && imageUrl && <Lightbox images={displayImages} currentIndex={0} onClose={() => setShowLightbox(false)} rangeName={rangeName} />}
      </div>
    );
  }

  // Full carousel (Pro/Premium tiers)
  return (
    <div className="relative h-64 md:h-96 lg:h-[500px] overflow-hidden bg-stone-900">
      {/* Video displayed first if available */}
      {hasVideos && currentIndex === 0 && displayVideos[0] ? (
        <div className="relative w-full h-full cursor-pointer group" onClick={() => openVideo(displayVideos[0])}>
          <Image
            src={`https://img.youtube.com/vi/${getYouTubeId(displayVideos[0])}/maxresdefault.jpg`}
            alt={`${rangeName} video thumbnail`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
            <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
              <Play className="w-10 h-10 text-emerald-600 ml-1" fill="currentColor" />
            </div>
            <span className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">Watch Video</span>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full">
          <Image
            src={displayImages[hasVideos ? currentIndex - 1 : currentIndex] || displayImages[0]}
            alt={`${rangeName} - Image ${currentIndex + 1}`}
            fill
            className="object-cover transition-opacity duration-300"
            priority={currentIndex === 0}
          />
          <button
            onClick={() => setShowLightbox(true)}
            className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors backdrop-blur-sm"
          >
            <Expand className="w-4 h-4" />
            View Gallery
          </button>
        </div>
      )}

      {/* Navigation Arrows */}
      {totalMedia > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110 z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6 text-stone-700" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110 z-10"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6 text-stone-700" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {totalMedia > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {Array.from({ length: totalMedia }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentIndex ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/75'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Media Counter */}
      <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1.5 rounded-lg text-sm backdrop-blur-sm z-10">
        {currentIndex + 1} / {totalMedia}
        {hasVideos && currentIndex === 0 && <span className="ml-2 text-emerald-300">• Video</span>}
      </div>

      {showVideoModal && activeVideoUrl && <VideoModal videoUrl={activeVideoUrl} onClose={() => setShowVideoModal(false)} />}

      {showLightbox && <Lightbox images={displayImages} currentIndex={hasVideos ? currentIndex - 1 : currentIndex} onClose={() => setShowLightbox(false)} rangeName={rangeName} />}
    </div>
  );
}

function VideoModal({ videoUrl, onClose }: { videoUrl: string; onClose: () => void }) {
  const videoId = getYouTubeId(videoUrl);
  if (!videoId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
        <X className="w-6 h-6 text-white" />
      </button>

      <div className="relative w-full max-w-5xl aspect-video" onClick={(e) => e.stopPropagation()}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title="Video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full rounded-xl"
        />
      </div>
    </div>
  );
}

function Lightbox({ images, currentIndex, onClose, rangeName }: { images: string[]; currentIndex: number; onClose: () => void; rangeName: string }) {
  const [index, setIndex] = useState(Math.max(0, currentIndex));

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10">
        <X className="w-6 h-6 text-white" />
      </button>

      <div className="relative w-full h-full flex items-center justify-center p-4 md:p-16" onClick={(e) => e.stopPropagation()}>
        <Image src={images[index]} alt={`${rangeName} - Image ${index + 1}`} fill className="object-contain" />

        {images.length > 1 && (
          <>
            <button
              onClick={() => setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>
            <button
              onClick={() => setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>
          </>
        )}

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
          {index + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}