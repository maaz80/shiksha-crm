import { useState } from "react";
import {
  HiOutlinePhone,
  HiOutlineDownload,
  HiOutlineEye,
  HiOutlineTrash,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineCalendar
} from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { usePermissions } from "../context/PermissionsContext.jsx";

const STAGE_BADGES = {
  Pending: "bg-amber-50 text-amber-800 border-amber-200",
  Contacted: "bg-blue-50 text-blue-800 border-blue-200",
  "In Discussion": "bg-purple-50 text-purple-800 border-purple-200",
  "Demo Scheduled": "bg-indigo-50 text-indigo-800 border-indigo-200",
  Enrolled: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Lost: "bg-rose-50 text-rose-800 border-rose-200"
};

export default function LeadsTable({
  leads = [],
  pagination = { page: 1, limit: 50, total: 0, pages: 1 },
  onPageChange,
  onSelectLead,
  onOpenWhatsApp,
  onDeleteLead
}) {
  const { hasAccess } = usePermissions();

  const getCleanPhone = (phone) => {
    const d = String(phone || "").replace(/\D/g, "");
    return d.length >= 10 ? d.slice(-10) : d;
  };

  // CSV Export
  const handleExportCsv = () => {
    if (!hasAccess("exportCsv")) return;
    if (!leads || leads.length === 0) {
      alert("No leads available to export.");
      return;
    }

    const headers = [
      "Name",
      "Phone",
      "Email",
      "Course",
      "Source",
      "Status",
      "Priority",
      "Lead Score",
      "Follow-up Date",
      "Follow-up Time",
      "Created Date"
    ];

    const rows = leads.map((lead) => [
      `"${(lead.name || "").replace(/"/g, '""')}"`,
      `"${getCleanPhone(lead.phone)}"`,
      `"${(lead.email || "").replace(/"/g, '""')}"`,
      `"${(lead.course || "").replace(/"/g, '""')}"`,
      `"${(lead.source || "").replace(/"/g, '""')}"`,
      `"${lead.status || "Pending"}"`,
      `"${lead.priority || "Warm"}"`,
      lead.leadScore || 60,
      lead.followUpDate ? new Date(lead.followUpDate).toISOString().split("T")[0] : "",
      `"${lead.followUpTime || ""}"`,
      new Date(lead.createdAt).toISOString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `shiksha_leads_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
      {/* Table Header Controls */}
      <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <span className="font-bold text-xs text-slate-800">
            Candidate Directory ({pagination.total || leads.length} Records)
          </span>
        </div>

        {hasAccess("exportCsv") && (
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <HiOutlineDownload className="w-4 h-4 text-slate-500" />
            Export CSV
          </button>
        )}
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-5">Candidate</th>
              <th className="py-3 px-5">Program & Source</th>
              <th className="py-3 px-5">Score & Priority</th>
              <th className="py-3 px-5">Pipeline Stage</th>
              <th className="py-3 px-5">Callback Reminder</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                  No inquiries found matching criteria
                </td>
              </tr>
            ) : (
              leads.map((lead) => {
                const cleanPhone = getCleanPhone(lead.phone);
                const priority = lead.priority || "Warm";
                const stageClass = STAGE_BADGES[lead.status] || STAGE_BADGES.Pending;

                return (
                  <tr
                    key={lead._id}
                    onClick={() => onSelectLead(lead)}
                    className="hover:bg-blue-50/30 transition cursor-pointer group"
                  >
                    {/* Candidate */}
                    <td className="py-3 px-5">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition">
                        {lead.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {cleanPhone ? `+91 ${cleanPhone}` : "No phone"}{" "}
                        {lead.email ? `• ${lead.email}` : ""}
                      </div>
                    </td>

                    {/* Program & Source */}
                    <td className="py-3 px-5">
                      <div className="font-semibold text-slate-800 line-clamp-1">
                        {lead.course || "General Inquiry"}
                      </div>
                      <div className="text-[11px] text-slate-500">{lead.source}</div>
                    </td>

                    {/* Score & Priority */}
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            priority === "Hot"
                              ? "bg-rose-100 text-rose-700"
                              : priority === "Cold"
                              ? "bg-sky-100 text-sky-700"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {priority === "Hot" ? "🔥 Hot" : priority === "Cold" ? "❄️ Cold" : "⚡ Warm"}
                        </span>
                        <span className="font-semibold text-slate-500 text-[11px]">
                          {lead.leadScore || 60}pts
                        </span>
                      </div>
                    </td>

                    {/* Pipeline Stage */}
                    <td className="py-3 px-5">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${stageClass}`}
                      >
                        {lead.status || "Pending"}
                      </span>
                    </td>

                    {/* Follow-up */}
                    <td className="py-3 px-5">
                      {lead.followUpDate ? (
                        <div className="flex items-center gap-1.5 text-blue-600 font-semibold text-[11px]">
                          <HiOutlineCalendar className="w-3.5 h-3.5" />
                          <span>
                            {new Date(lead.followUpDate).toLocaleDateString("en-IN")}{" "}
                            {lead.followUpTime ? `@ ${lead.followUpTime}` : ""}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Not scheduled</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {hasAccess("callLead") && cleanPhone && (
                          <a
                            href={`tel:${cleanPhone}`}
                            title="Call Candidate"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                          >
                            <HiOutlinePhone className="w-4 h-4" />
                          </a>
                        )}

                        {hasAccess("whatsapp") && cleanPhone && (
                          <button
                            type="button"
                            onClick={() => onOpenWhatsApp(lead)}
                            title="Chat on WhatsApp"
                            className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                          >
                            <FaWhatsapp className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onSelectLead(lead)}
                          title="View Profile Drawer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                        >
                          <HiOutlineEye className="w-4 h-4" />
                        </button>

                        {hasAccess("deleteLead") && (
                          <button
                            type="button"
                            onClick={() => onDeleteLead(lead)}
                            title="Delete Lead"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination.pages > 1 && (
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Page <span className="font-bold text-slate-800">{pagination.page}</span> of{" "}
            <span className="font-bold text-slate-800">{pagination.pages}</span> (
            {pagination.total} leads)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <HiOutlineChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <HiOutlineChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
