import {
  HiOutlineTrendingUp,
  HiOutlineUserGroup,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineCalendar,
  HiOutlineAcademicCap,
  HiOutlineGlobeAlt
} from "react-icons/hi";

export default function AnalyticsView({ analytics = null }) {
  if (!analytics) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs italic">
        Loading analytics metrics...
      </div>
    );
  }

  const {
    totalLeads = 0,
    todayLeads = 0,
    conversionRate = 0,
    stages = {},
    priorities = {},
    followUps = {},
    sources = [],
    courses = []
  } = analytics;

  const enrolled = stages.Enrolled || 0;
  const lost = stages.Lost || 0;
  const inPipeline = totalLeads - enrolled - lost;

  const funnelStages = [
    { label: "1. Inbound Inquiries", count: totalLeads, color: "bg-slate-800 text-white" },
    { label: "2. Contacted", count: stages.Contacted || 0, color: "bg-blue-600 text-white" },
    { label: "3. In Discussion", count: stages["In Discussion"] || 0, color: "bg-purple-600 text-white" },
    { label: "4. Demo Scheduled", count: stages["Demo Scheduled"] || 0, color: "bg-indigo-600 text-white" },
    { label: "5. Enrolled 🎉", count: enrolled, color: "bg-emerald-600 text-white" }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Inquiries */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <HiOutlineUserGroup className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-semibold block">Total Inquiries</span>
            <span className="text-xl font-extrabold text-slate-900">{totalLeads}</span>
          </div>
        </div>

        {/* Today's Inquiries */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 shrink-0">
            <HiOutlineSparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-semibold block">Today's Leads</span>
            <span className="text-xl font-extrabold text-slate-900">{todayLeads}</span>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <HiOutlineTrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-semibold block">Conversion Rate</span>
            <span className="text-xl font-extrabold text-emerald-600">{conversionRate}%</span>
          </div>
        </div>

        {/* Enrolled Students */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <HiOutlineCheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-semibold block">Enrolled Students</span>
            <span className="text-xl font-extrabold text-slate-900">{enrolled}</span>
          </div>
        </div>

        {/* Dropped / Lost */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 shrink-0">
            <HiOutlineXCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-semibold block">Lost / Dropped</span>
            <span className="text-xl font-extrabold text-slate-900">{lost}</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Pipeline Funnel & Callback Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Pipeline Funnel Visualizer */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Admissions Pipeline Funnel</h3>
            <span className="text-xs text-slate-400 font-medium">
              Active in Funnel: <span className="font-bold text-blue-600">{inPipeline}</span>
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {funnelStages.map((st, sIdx) => {
              const pct = totalLeads > 0 ? Math.round((st.count / totalLeads) * 100) : 0;
              return (
                <div key={sIdx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>{st.label}</span>
                    <span>
                      {st.count} leads ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${st.color}`}
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Follow-up Callback Urgency Tracker */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <HiOutlineCalendar className="w-4 h-4 text-blue-600" />
              Follow-up Callbacks Due
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Prioritized callback schedule</p>
          </div>

          <div className="space-y-2.5">
            {/* Today */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-900 block">Due Today</span>
                <span className="text-[11px] text-amber-700">Immediate action needed</span>
              </div>
              <span className="text-xl font-extrabold text-amber-900">
                {followUps.today || 0}
              </span>
            </div>

            {/* Overdue */}
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-rose-900 block">Overdue Callbacks</span>
                <span className="text-[11px] text-rose-700">Missed scheduled window</span>
              </div>
              <span className="text-xl font-extrabold text-rose-900">
                {followUps.overdue || 0}
              </span>
            </div>

            {/* Upcoming */}
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-900 block">Upcoming Callbacks</span>
                <span className="text-[11px] text-blue-700">Scheduled for future dates</span>
              </div>
              <span className="text-xl font-extrabold text-blue-900">
                {followUps.upcoming || 0}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 italic text-center">
            Updated automatically with every counselor call log.
          </div>
        </div>
      </div>

      {/* Bottom Grid: Source Channels & Course Demand */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Source Channels */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <HiOutlineGlobeAlt className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">Lead Acquisition Channels</h3>
          </div>

          <div className="space-y-2 pt-1 text-xs">
            {sources.length === 0 ? (
              <p className="text-slate-400 italic">No channel data recorded</p>
            ) : (
              sources.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <span className="font-semibold text-slate-800">{s.source}</span>
                  <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                    {s.count} leads
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Course Demand */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <HiOutlineAcademicCap className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">Top Program Inquiries</h3>
          </div>

          <div className="space-y-2 pt-1 text-xs">
            {courses.length === 0 ? (
              <p className="text-slate-400 italic">No program data recorded</p>
            ) : (
              courses.map((c, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <span className="font-semibold text-slate-800 line-clamp-1">{c.course}</span>
                  <span className="font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 shrink-0">
                    {c.count} students
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
