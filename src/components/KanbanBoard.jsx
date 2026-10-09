import {
  HiOutlinePhone,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineClock,
  HiOutlineCalendar,
  HiOutlineSparkles
} from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { usePermissions } from "../context/PermissionsContext.jsx";

const STAGES = [
  {
    key: "Pending",
    name: "Pending Inquiry",
    color: "border-amber-400 bg-amber-50/40",
    badge: "bg-amber-100 text-amber-800 border-amber-200"
  },
  {
    key: "Contacted",
    name: "Contacted",
    color: "border-blue-400 bg-blue-50/40",
    badge: "bg-blue-100 text-blue-800 border-blue-200"
  },
  {
    key: "In Discussion",
    name: "In Discussion",
    color: "border-purple-400 bg-purple-50/40",
    badge: "bg-purple-100 text-purple-800 border-purple-200"
  },
  {
    key: "Demo Scheduled",
    name: "Demo Scheduled",
    color: "border-indigo-400 bg-indigo-50/40",
    badge: "bg-indigo-100 text-indigo-800 border-indigo-200"
  },
  {
    key: "Enrolled",
    name: "Enrolled 🎉",
    color: "border-emerald-400 bg-emerald-50/40",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200"
  },
  {
    key: "Lost",
    name: "Dropped / Lost",
    color: "border-rose-400 bg-rose-50/40",
    badge: "bg-rose-100 text-rose-800 border-rose-200"
  }
];

export const formatRelativeTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today @ ${date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}`;
  } else if (diffDays === 1) {
    return `Yesterday @ ${date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}`;
  } else {
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }
};

export default function KanbanBoard({
  leads = [],
  onSelectLead,
  onOpenWhatsApp,
  onMoveStage
}) {
  const { hasAccess } = usePermissions();

  const getCleanPhone = (phone) => {
    const d = String(phone || "").replace(/\D/g, "");
    return d.length >= 10 ? d.slice(-10) : d;
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-1 custom-scrollbar min-h-[calc(100vh-220px)] items-start">
      {STAGES.map((col, idx) => {
        const colLeads = leads.filter((l) => (l.status || "Pending") === col.key);

        return (
          <div
            key={col.key}
            className={`shrink-0 w-80 rounded-2xl border-t-4 border border-slate-200/80 bg-slate-50/60 p-3.5 flex flex-col max-h-[calc(100vh-220px)] shadow-xs ${col.color}`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-800 tracking-tight">
                  {col.name}
                </span>
                <span
                  className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full border ${col.badge}`}
                >
                  {colLeads.length}
                </span>
              </div>
            </div>

            {/* Leads Cards Container */}
            <div className="flex-1 overflow-y-auto space-y-3 pt-3 pr-1 custom-scrollbar">
              {colLeads.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs italic">
                  No inquiries in this stage
                </div>
              ) : (
                colLeads.map((lead) => {
                  const cleanPhone = getCleanPhone(lead.phone);
                  const priority = lead.priority || "Warm";

                  return (
                    <div
                      key={lead._id}
                      onClick={() => onSelectLead(lead)}
                      className="p-3.5 rounded-xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-pointer group space-y-2.5"
                    >
                      {/* Card Top: Name & Priority / Score */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition leading-tight">
                            {lead.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                            {lead.course || "General Inquiry"}
                          </p>
                        </div>

                        <div className="flex flex-col items-end shrink-0 gap-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              priority === "Hot"
                                ? "bg-rose-100 text-rose-700"
                                : priority === "Cold"
                                ? "bg-sky-100 text-sky-700"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {priority === "Hot" ? "🔥 HOT" : priority === "Cold" ? "❄️ COLD" : "⚡ WARM"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {lead.leadScore || 60}pts
                          </span>
                        </div>
                      </div>

                      {/* Source & Timestamp */}
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                        <span className="truncate max-w-[140px] text-slate-600 font-medium">
                          {lead.source}
                        </span>
                        <span className="flex items-center gap-1 shrink-0 font-medium">
                          <HiOutlineClock className="w-3 h-3 text-slate-400" />
                          {formatRelativeTime(lead.createdAt)}
                        </span>
                      </div>

                      {/* Follow-up Indicator */}
                      {lead.followUpDate && (
                        <div className="flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50/80 px-2 py-1 rounded-md font-semibold">
                          <HiOutlineCalendar className="w-3 h-3 text-blue-500 shrink-0" />
                          <span className="truncate">
                            Callback: {new Date(lead.followUpDate).toLocaleDateString("en-IN")}{" "}
                            {lead.followUpTime || ""}
                          </span>
                        </div>
                      )}

                      {/* Bottom Quick Actions (Call, WhatsApp, Stage Move) */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs"
                      >
                        {/* Left: Direct Call & WhatsApp */}
                        <div className="flex items-center gap-1.5">
                          {hasAccess("callLead") && cleanPhone ? (
                            <a
                              href={`tel:${cleanPhone}`}
                              title={`Call ${lead.name}`}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition cursor-pointer"
                            >
                              <HiOutlinePhone className="w-3.5 h-3.5" />
                            </a>
                          ) : null}

                          {hasAccess("whatsapp") && cleanPhone ? (
                            <button
                              type="button"
                              onClick={() => onOpenWhatsApp(lead)}
                              title={`WhatsApp ${lead.name}`}
                              className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border border-emerald-200 transition cursor-pointer"
                            >
                              <FaWhatsapp className="w-3.5 h-3.5" />
                            </button>
                          ) : null}
                        </div>

                        {/* Right: Quick Stage Shifter Arrows */}
                        {hasAccess("updateStatus") && (
                          <div className="flex items-center gap-1">
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => onMoveStage(lead, STAGES[idx - 1].key)}
                                title={`Move backward to ${STAGES[idx - 1].name}`}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                              >
                                <HiOutlineChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {idx < STAGES.length - 1 && (
                              <button
                                type="button"
                                onClick={() => onMoveStage(lead, STAGES[idx + 1].key)}
                                title={`Move forward to ${STAGES[idx + 1].name}`}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                              >
                                <HiOutlineChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
