import { Store, TreePine, Target, Package, GraduationCap, Car, Accessibility, Check, X } from 'lucide-react';

interface AmenitiesGridProps {
  hasProShop?: boolean;
  has3dCourse?: boolean;
  hasFieldCourse?: boolean;
  equipmentRental?: boolean;
  lessonsAvailable?: boolean;
  parkingAvailable?: boolean;
  accessibility?: string;
}

interface AmenityItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  available: boolean;
  details?: string;
}

export function AmenitiesGrid({ hasProShop, has3dCourse, hasFieldCourse, equipmentRental, lessonsAvailable, parkingAvailable, accessibility }: AmenitiesGridProps) {
  const amenities: AmenityItem[] = [
    { key: 'pro-shop', label: 'Pro Shop', icon: <Store className="w-5 h-5" />, available: hasProShop ?? false },
    { key: '3d-course', label: '3D Course', icon: <Target className="w-5 h-5" />, available: has3dCourse ?? false },
    { key: 'field-course', label: 'Field Course', icon: <TreePine className="w-5 h-5" />, available: hasFieldCourse ?? false },
    { key: 'equipment-rental', label: 'Equipment Rental', icon: <Package className="w-5 h-5" />, available: equipmentRental ?? false },
    { key: 'lessons', label: 'Lessons Available', icon: <GraduationCap className="w-5 h-5" />, available: lessonsAvailable ?? false },
    { key: 'parking', label: 'Parking', icon: <Car className="w-5 h-5" />, available: parkingAvailable ?? false },
  ];

  if (accessibility) {
    amenities.push({
      key: 'accessibility',
      label: 'Accessibility',
      icon: <Accessibility className="w-5 h-5" />,
      available: true,
      details: accessibility,
    });
  }

  const availableAmenities = amenities.filter((a) => a.available);
  const unavailableAmenities = amenities.filter((a) => !a.available && !a.details);

  if (amenities.length === 0) return null;

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
      <h2 className="text-xl font-semibold text-stone-800 mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
        Amenities & Features
      </h2>

      {availableAmenities.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {availableAmenities.map((amenity) => (
            <div key={amenity.key} className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">{amenity.icon}</div>
              <div>
                <p className="font-medium text-emerald-800">{amenity.label}</p>
                {amenity.details && <p className="text-xs text-emerald-600">{amenity.details}</p>}
              </div>
              <Check className="w-5 h-5 text-emerald-500 ml-auto" />
            </div>
          ))}
        </div>
      )}

      {unavailableAmenities.length > 0 && (
        <div>
          <p className="text-sm text-stone-500 mb-3">Not available at this location:</p>
          <div className="flex flex-wrap gap-2">
            {unavailableAmenities.map((amenity) => (
              <div key={amenity.key} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-100 border border-stone-200 text-stone-500">
                <span className="text-stone-400">{amenity.icon}</span>
                <span className="text-sm">{amenity.label}</span>
                <X className="w-4 h-4 text-stone-400" />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}