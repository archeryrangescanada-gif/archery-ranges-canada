'use client';

import { useEffect, useState } from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import dynamic from 'next/dynamic';
import L from 'leaflet';

// Dynamically import react-leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

// Fix for default marker icon issue with webpack
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapSectionProps {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
}

export function MapSection({ latitude, longitude, name, address }: MapSectionProps) {
  const [isClient, setIsClient] = useState(false);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  const appleMapsUrl = `https://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=d`;

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      <div className="p-6 border-b border-stone-200">
        <h2 className="text-xl font-semibold text-stone-800 flex items-center gap-2">
          <span className="w-1 h-6 bg-red-500 rounded-full"></span>
          Location
        </h2>
      </div>

      <div className="relative h-64 md:h-80 bg-stone-100">
        {isClient ? (
          <MapContainer
            center={[latitude, longitude]}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[latitude, longitude]} icon={defaultIcon}>
              <Popup>
                <div className="text-center">
                  <p className="font-medium">{name}</p>
                  <p className="text-sm text-gray-600">{address}</p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
            <MapPin className="w-12 h-12 text-stone-400 mb-3" />
            <p className="text-stone-600 font-medium">{name}</p>
            <p className="text-sm text-stone-500">{address}</p>
            <p className="text-xs text-stone-400 mt-2">
              Loading map...
            </p>
          </div>
        )}
      </div>

      <div className="p-4 bg-stone-50 flex flex-wrap gap-3">
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors min-w-[200px]"
        >
          <Navigation className="w-5 h-5" />
          Get Directions
        </a>

        <a
          href={appleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-stone-100 text-stone-700 font-medium rounded-xl border border-stone-300 transition-colors"
        >
          <ExternalLink className="w-5 h-5" />
          Apple Maps
        </a>
      </div>

      <div className="p-4 border-t border-stone-200">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-stone-800">{name}</p>
            <p className="text-sm text-stone-600">{address}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
