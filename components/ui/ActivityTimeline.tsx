import { ActivityEvent } from "@/lib/types";
import { Mail, Phone, FileText, Plus } from "lucide-react";

const iconMap: Record<ActivityEvent["type"], React.ReactNode> = {
  email: <Mail size={12} />,
  call: <Phone size={12} />,
  note: <FileText size={12} />,
  created: <Plus size={12} />,
};

const colorMap: Record<ActivityEvent["type"], string> = {
  email: "bg-blue-100 text-blue-700",
  call: "bg-emerald-100 text-emerald-700",
  note: "bg-amber-100 text-amber-700",
  created: "bg-violet-100 text-violet-700",
};

interface ActivityTimelineProps {
  events: ActivityEvent[];
}

export function ActivityTimeline({ events }: ActivityTimelineProps) {
  return (
    <div className="space-y-0">
      {events.map((event, idx) => (
        <div key={event.id} className="flex gap-3">
          {/* Connector */}
          <div className="flex flex-col items-center">
            <div
              className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${colorMap[event.type]}`}
            >
              {iconMap[event.type]}
            </div>
            {idx < events.length - 1 && (
              <div className="w-px flex-1 bg-slate-200 my-1" />
            )}
          </div>

          {/* Content */}
          <div className="pb-5 flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800">{event.title}</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{event.description}</p>
            <p className="text-[11px] text-slate-400 mt-1">{event.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
