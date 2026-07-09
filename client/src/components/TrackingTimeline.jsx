const statusConfig = {
  pending: { color: 'bg-amber-400', ring: 'ring-amber-200', icon: '📋', label: 'Pending' },
  in_transit: { color: 'bg-blue-500', ring: 'ring-blue-200', icon: '🚚', label: 'In Transit' },
  out_for_delivery: { color: 'bg-indigo-500', ring: 'ring-indigo-200', icon: '📦', label: 'Out for Delivery' },
  delivered: { color: 'bg-emerald-500', ring: 'ring-emerald-200', icon: '✅', label: 'Delivered' },
  exception: { color: 'bg-red-500', ring: 'ring-red-200', icon: '⚠️', label: 'Exception' },
};

export default function TrackingTimeline({ events }) {
  if (!events || events.length === 0) {
    return <p className="text-gray-500 text-center py-8">No tracking events yet.</p>;
  }

  return (
    <div className="relative">
      <div className="absolute left-[17px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-brand-500 to-gray-200 rounded-full" />

      {events.map((event, i) => {
        const cfg = statusConfig[event.status] || { color: 'bg-gray-400', ring: 'ring-gray-200', icon: '📦', label: event.status };

        return (
          <div key={event.id} className="flex gap-4 pb-7 relative">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={`w-[34px] h-[34px] rounded-full ${cfg.color} ring-4 ${cfg.ring} flex items-center justify-center text-xs z-10 shadow-sm`}>
                <span className="text-white leading-none">{event.icon}</span>
              </div>
            </div>

            <div className="flex-1 pt-1 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-sm text-gray-900">{cfg.label}</p>
                <span className="text-xs text-gray-400">
                  {new Date(event.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              {event.location && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-0.5">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {event.location}
                </div>
              )}
              {event.description && (
                <p className="text-sm text-gray-500 mt-0.5">{event.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-1.5">
                {new Date(event.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
