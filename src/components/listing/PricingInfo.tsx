import { DollarSign, Users, Calendar, GraduationCap, AlertCircle } from 'lucide-react';

interface PricingInfoProps {
  membershipRequired?: boolean;
  membershipPrice?: number;
  dropInPrice?: number;
  lessonPriceRange?: string;
}

export function PricingInfo({ membershipRequired, membershipPrice, dropInPrice, lessonPriceRange }: PricingInfoProps) {
  const hasPricing = membershipPrice || dropInPrice || lessonPriceRange || membershipRequired !== undefined;

  if (!hasPricing) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
      <h2 className="text-xl font-semibold text-stone-800 mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
        Pricing
      </h2>

      {membershipRequired && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 mb-6">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Membership Required</p>
            <p className="text-sm text-amber-700">This range requires a membership to shoot. Drop-in visits may be available for non-members.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dropInPrice !== undefined && (
          <div className="relative overflow-hidden rounded-xl border border-stone-200 p-5 bg-gradient-to-br from-white to-stone-50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-100 rounded-bl-[100px] opacity-50" />
            <div className="relative">
              <div className="flex items-center gap-2 text-stone-500 mb-3">
                <Calendar className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-medium">Drop-In Visit</span>
              </div>
              <p className="text-3xl font-bold text-stone-800">{formatPrice(dropInPrice)}</p>
              <p className="text-sm text-stone-500 mt-1">per session</p>
            </div>
          </div>
        )}

        {membershipPrice !== undefined && (
          <div className="relative overflow-hidden rounded-xl border border-stone-200 p-5 bg-gradient-to-br from-white to-stone-50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100 rounded-bl-[100px] opacity-50" />
            <div className="relative">
              <div className="flex items-center gap-2 text-stone-500 mb-3">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">Adult Membership</span>
              </div>
              <p className="text-3xl font-bold text-stone-800">{formatPrice(membershipPrice)}</p>
              <p className="text-sm text-stone-500 mt-1">per year</p>
            </div>
          </div>
        )}

        {lessonPriceRange && (
          <div className="relative overflow-hidden rounded-xl border border-stone-200 p-5 bg-gradient-to-br from-white to-stone-50">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-100 rounded-bl-[100px] opacity-50" />
            <div className="relative">
              <div className="flex items-center gap-2 text-stone-500 mb-3">
                <GraduationCap className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium">Lessons</span>
              </div>
              <p className="text-2xl font-bold text-stone-800">{lessonPriceRange}</p>
              <p className="text-sm text-stone-500 mt-1">varies by type</p>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-stone-400 mt-4">Prices are subject to change. Contact the range directly for the most current pricing.</p>
    </section>
  );
}