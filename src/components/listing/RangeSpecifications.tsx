import { Ruler, Target, Building2, TreePine, Crosshair, Weight } from 'lucide-react';
import { FacilityType, BowType } from '@/types/range';

interface RangeSpecificationsProps {
  lengthYards?: number;
  numberOfLanes?: number;
  facilityType?: FacilityType;
  bowTypesAllowed?: BowType[];
  maxDrawWeight?: number;
}

const bowTypeLabels: Record<BowType, string> = {
  recurve: 'Recurve',
  compound: 'Compound',
  longbow: 'Longbow',
  crossbow: 'Crossbow',
  traditional: 'Traditional',
};

const bowTypeColors: Record<BowType, string> = {
  recurve: 'bg-blue-100 text-blue-700 border-blue-200',
  compound: 'bg-purple-100 text-purple-700 border-purple-200',
  longbow: 'bg-amber-100 text-amber-700 border-amber-200',
  crossbow: 'bg-red-100 text-red-700 border-red-200',
  traditional: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export function RangeSpecifications({ lengthYards, numberOfLanes, facilityType, bowTypesAllowed, maxDrawWeight }: RangeSpecificationsProps) {
  const hasSpecs = lengthYards || numberOfLanes || facilityType || (bowTypesAllowed && bowTypesAllowed.length > 0) || maxDrawWeight;

  if (!hasSpecs) return null;

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
      <h2 className="text-xl font-semibold text-stone-800 mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
        Range Specifications
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
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
            <p className="text-lg font-bold text-stone-800 capitalize">{facilityType === 'both' ? 'Indoor & Outdoor' : facilityType}</p>
          </div>
        )}
      </div>

      {bowTypesAllowed && bowTypesAllowed.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3">Bow Types Allowed</h3>
          <div className="flex flex-wrap gap-2">
            {bowTypesAllowed.map((bowType) => (
              <span key={bowType} className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border ${bowTypeColors[bowType]}`}>
                {bowTypeLabels[bowType]}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}