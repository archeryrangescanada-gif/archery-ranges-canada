import { Calendar, Clock, MapPin, Users, ExternalLink, DollarSign } from 'lucide-react';
import { RangeEvent } from '@/types/range';

interface EventsSectionProps {
  events: RangeEvent[];
  rangeName: string;
}

function formatEventDate(dateString: string): { day: string; month: string; weekday: string } {
  const date = new Date(dateString);
  return {
    day: date.getDate().toString(),
    month: date.toLocaleDateString('en-CA', { month: 'short' }),
    weekday: date.toLocaleDateString('en-CA', { weekday: 'short' }),
  };
}

function formatTime(timeString?: string): string {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function EventsSection({ events, rangeName }: EventsSectionProps) {
  if (events.length === 0) return null;

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
      <h2 className="text-xl font-semibold text-stone-800 mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-red-500 rounded-full"></span>
        Upcoming Events
        <span className="text-base font-normal text-stone-500">({events.length})</span>
      </h2>

      <div className="space-y-4">
        {events.map((event) => {
          const { day, month, weekday } = formatEventDate(event.event_date);

          return (
            <div
              key={event.id}
              className="flex gap-4 p-4 rounded-xl border border-stone-200 hover:border-stone-300 hover:shadow-sm transition-all"
            >
              {/* Date Badge */}
              <div className="flex-shrink-0 w-16 text-center">
                <div className="bg-red-500 text-white text-xs font-semibold py-1 rounded-t-lg">
                  {month}
                </div>
                <div className="bg-white border border-t-0 border-stone-200 rounded-b-lg py-2">
                  <p className="text-2xl font-bold text-stone-800">{day}</p>
                  <p className="text-xs text-stone-500">{weekday}</p>
                </div>
              </div>

              {/* Event Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-stone-800 mb-2 truncate">{event.title}</h3>

                {event.description && (
                  <p className="text-sm text-stone-600 mb-3 line-clamp-2">{event.description}</p>
                )}

                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-stone-500">
                  {event.start_time && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-stone-400" />
                      <span>
                        {formatTime(event.start_time)}
                        {event.end_time && ` - ${formatTime(event.end_time)}`}
                      </span>
                    </div>
                  )}

                  {event.location_details && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-stone-400" />
                      <span className="truncate max-w-[150px]">{event.location_details}</span>
                    </div>
                  )}

                  {event.max_participants && (
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-stone-400" />
                      <span>Max {event.max_participants}</span>
                    </div>
                  )}

                  {event.price !== undefined && event.price > 0 && (
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-stone-400" />
                      <span>${event.price.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Register Button */}
              {event.registration_url && (
                <div className="flex-shrink-0 self-center">
                  <a
                    href={event.registration_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Register
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {events.length >= 5 && (
        <div className="mt-4 text-center">
          <button className="text-red-500 hover:text-red-600 font-medium text-sm">
            View all events at {rangeName} →
          </button>
        </div>
      )}
    </section>
  );
}
