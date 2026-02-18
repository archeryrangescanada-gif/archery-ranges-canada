import { Ruler, Target, Building2, TreePine, Crosshair, Weight, Check, X, Settings, History, Shield } from 'lucide-react';
import { FacilityType, BowType } from '@/types/range';

interface RangeSpecificationsProps {
  lengthYards?: number | string;
  numberOfLanes?: number | string;
  facilityType?: FacilityType | string;
  bowTypesAllowed?: BowType[] | string;
  maxDrawWeight?: number | string;
}

const bowTypeData: Record<BowType, { label: string; icon: React.ReactNode }> = {
  recurve: { label: 'Recurve', icon: <Target className="w-5 h-5" /> },
  compound: { label: 'Compound', icon: <Settings className="w-5 h-5" /> },
  longbow: { label: 'Longbow', icon: <Shield className="w-5 h-5" /> },
  crossbow: { label: 'Crossbow', icon: <Crosshair className="w-5 h-5" /> },
  traditional: { label: 'Traditional', icon: <History className="w-5 h-5" /> },
};

export function RangeSpecifications({ lengthYards, numberOfLanes, facilityType, bowTypesAllowed, maxDrawWeight }: RangeSpecificationsProps) {
  const allowedBows = Array.isArray(bowTypesAllowed)
    ? bowTypesAllowed
    : typeof bowTypesAllowed === 'string'
      ? bowTypesAllowed.split(',').map(s => s.trim().toLowerCase() as BowType).filter(Boolean)
      : [];

  const allBowTypes: BowType[] = ['recurve', 'compound', 'longbow', 'crossbow', 'traditional'];
  const availableBows = allBowTypes.filter(type => allowedBows.includes(type));
  const unavailableBows = allBowTypes.filter(type => !allowedBows.includes(type));

  const hasSpecs = lengthYards || numberOfLanes || facilityType || (bowTypesAllowed && bowTypesAllowed.length > 0) || maxDrawWeight;

  if (!hasSpecs) return null;

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
      <h2 className="text-xl font-semibold text-stone-800 mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
        Range Specifications
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {lengthYards && (
          <div className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-xl p-4 border border-stone-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Ruler className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm text-stone-500">Range Length</span>
            </div>
            <p className="text-2xl font-bold text-stone-800">
              {lengthYards}
              <span className="text-sm font-normal text-stone-500 ml-1">yards</span>
            </p>
          </div>
        )}

        {numberOfLanes && (
          <div className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-xl p-4 border border-stone-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-stone-500">Lanes</span>
            </div>
            <p className="text-2xl font-bold text-stone-800">
              {numberOfLanes}
              <span className="text-sm font-normal text-stone-500 ml-1">{numberOfLanes === 1 ? 'lane' : 'lanes'}</span>
            </p>
          </div>
        )}

        {maxDrawWeight && (
          <div className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-xl p-4 border border-stone-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Weight className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-sm text-stone-500">Max Draw</span>
            </div>
            <p className="text-2xl font-bold text-stone-800">
              {maxDrawWeight}
              <span className="text-sm font-normal text-stone-500 ml-1">lbs</span>
            </p>
          </div>
        )}

        {facilityType && (
          <div className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-xl p-4 border border-stone-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                {facilityType === 'indoor' ? (
                  <Building2 className="w-5 h-5 text-purple-600" />
                ) : facilityType === 'outdoor' ? (
                  <TreePine className="w-5 h-5 text-purple-600" />
                ) : (
                  <Crosshair className="w-5 h-5 text-purple-600" />
                )}
              </div>
              <span className="text-sm text-stone-500">Facility</span>
            </div>
            <p className="text-lg font-bold text-stone-800 capitalize">
              {(facilityType as string) === 'both' ? 'Indoor & Outdoor' : facilityType}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            Bow Types Allowed
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {availableBows.map((bowType) => (
              <div key={bowType} className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                  {bowTypeData[bowType].icon}
                </div>
                <p className="font-medium text-emerald-800">{bowTypeData[bowType].label}</p>
                <Check className="w-5 h-5 text-emerald-500 ml-auto" />
              </div>
            ))}
          </div>

          {unavailableBows.length > 0 && (
            <div>
              <p className="text-sm text-stone-500 mb-3">Not allowed at this location:</p>
              <div className="flex flex-wrap gap-2">
                {unavailableBows.map((bowType) => (
                  <div key={bowType} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-100 border border-stone-200 text-stone-500">
                    <span className="text-stone-400">{bowTypeData[bowType].icon}</span>
                    <span className="text-sm">{bowTypeData[bowType].label}</span>
                    <X className="w-4 h-4 text-stone-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
  );
}