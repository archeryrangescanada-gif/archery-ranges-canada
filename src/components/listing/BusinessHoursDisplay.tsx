'use client';

import { Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { BusinessHours, DayOfWeek } from '@/types/range';

interface BusinessHoursDisplayProps {
  hours: BusinessHours | string;
}

const daysOrder: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const dayLabels: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

function getCurrentDay(): DayOfWeek {
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
}

function isCurrentlyOpen(hours: BusinessHours): { isOpen: boolean; nextChange: string | null } {
  const now = new Date();
  const currentDay = getCurrentDay();
  const dayHours = hours[currentDay];

  if (!dayHours || dayHours.closed) {
    return { isOpen: false, nextChange: 'Closed today' };
  }

  if (!dayHours.open || !dayHours.close) {
    return { isOpen: false, nextChange: null };
  }

  const currentTime = now.getHours() * 60 + now.getMinutes();
  const [openHour, openMin] = dayHours.open.split(':').map(Number);
  const [closeHour, closeMin] = dayHours.close.split(':').map(Number);
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;

  if (currentTime < openTime) {
    return { isOpen: false, nextChange: `Opens at ${formatTime(dayHours.open)}` };
  }

  if (currentTime >= openTime && currentTime < closeTime) {
    return { isOpen: true, nextChange: `Closes at ${formatTime(dayHours.close)}` };
  }

  return { isOpen: false, nextChange: 'Closed for today' };
}

export function BusinessHoursDisplay({ hours }: BusinessHoursDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (typeof hours === 'string') {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-stone-100">
            <Clock className="w-5 h-5 text-stone-500" />
          </div>
          <div>
            <h3 className="font-medium text-stone-800">Business Hours</h3>
            <p className="text-sm text-stone-500 whitespace-pre-line">{hours}</p>
          </div>
        </div>
      </div>
    );
  }

  const currentDay = getCurrentDay();
  const { isOpen, nextChange } = isCurrentlyOpen(hours);
  const todayHours = hours[currentDay];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-stone-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isOpen ? 'bg-emerald-100' : 'bg-stone-100'}`}>
            <Clock className={`w-5 h-5 ${isOpen ? 'text-emerald-600' : 'text-stone-500'}`} />
          </div>

          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-600'}`}>
                {isOpen ? 'Open Now' : 'Closed'}
              </span>
            </div>
            <p className="text-sm text-stone-500 mt-1">
              {nextChange || (todayHours?.closed ? 'Closed today' : todayHours?.open && todayHours?.close ? `${formatTime(todayHours.open)} - ${formatTime(todayHours.close)}` : 'Hours not available')}
            </p>
          </div>
        </div>

        {isExpanded ? <ChevronUp className="w-5 h-5 text-stone-400" /> : <ChevronDown className="w-5 h-5 text-stone-400" />}
      </button>

      {isExpanded && (
        <div className="border-t border-stone-200 px-6 py-4">
          <div className="space-y-3">
            {daysOrder.map((day) => {
              const dayHours = hours[day];
              const isToday = day === currentDay;

              return (
                <div key={day} className={`flex items-center justify-between py-2 px-3 rounded-lg ${isToday ? 'bg-emerald-50 border border-emerald-200' : ''}`}>
                  <span className={`font-medium ${isToday ? 'text-emerald-700' : 'text-stone-700'}`}>
                    {dayLabels[day]}
                    {isToday && <span className="ml-2 text-xs text-emerald-600">(Today)</span>}
                  </span>

                  <span className={`${dayHours?.closed ? 'text-stone-400' : isToday ? 'text-emerald-700 font-medium' : 'text-stone-600'}`}>
                    {dayHours?.closed ? 'Closed' : dayHours?.open && dayHours?.close ? `${formatTime(dayHours.open)} - ${formatTime(dayHours.close)}` : '—'}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-stone-400 mt-4 text-center">Hours may vary on holidays. Please call ahead to confirm.</p>
        </div>
      )}
    </div>
  );
}