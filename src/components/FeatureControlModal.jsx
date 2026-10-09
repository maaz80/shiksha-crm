import { HiX, HiOutlineShieldCheck, HiOutlineRefresh, HiCheck } from "react-icons/hi";
import { usePermissions, DEFAULT_PERMISSIONS } from "../context/PermissionsContext.jsx";
import { useState } from "react";

const FEATURE_CATEGORIES = [
  {
    title: "Views & Navigation",
    description: "Control which tabs counselors can see in the CRM interface",
    features: [
      { key: "kanban", name: "Kanban Pipeline Board", desc: "6-stage visual drag/shift pipeline" },
      { key: "leadsTable", name: "Leads Directory Table", desc: "Paginated tabular view with search" },
      { key: "followups", name: "Follow-up Reminders", desc: "Due, overdue and upcoming callback list" },
      { key: "analytics", name: "Analytics & Reports", desc: "Conversion rates, funnels and sources" }
    ]
  },
  {
    title: "Data Tools & Ingestion",
    description: "Control data management and export capabilities",
    features: [
      { key: "addLead", name: "Add Manual Lead", desc: "Modal for walk-ins and phone calls" },
      { key: "syncDb", name: "One-Click DB Sync", desc: "Fast-sync website inquiries into CRM" },
      { key: "exportCsv", name: "Export to CSV", desc: "Download leads report as a spreadsheet" }
    ]
  },
  {
    title: "Counselor Actions & Interactions",
    description: "Permissions for interacting with candidate profiles",
    features: [
      { key: "callLead", name: "Direct Phone Dial", desc: "tel: one-click dialer launcher" },
      { key: "whatsapp", name: "WhatsApp Dispatcher", desc: "Pre-composed template messages via wa.me" },
      { key: "updateStatus", name: "Change Pipeline Stage", desc: "Shift leads between stages (Enrolled, Lost, etc.)" },
      { key: "addNotes", name: "Add Discussion Notes", desc: "Record remarks in candidate call history" },
      { key: "scheduleFollowup", name: "Schedule Callbacks", desc: "Set future callback date and reminders" },
      { key: "deleteLead", name: "Delete Lead", desc: "Permanently delete lead records" }
    ]
  }
];

export default function FeatureControlModal({ isOpen, onClose }) {
  const { permissions, togglePermission, updatePermission } = usePermissions();
  const [savedMsg, setSavedMsg] = useState(false);

  if (!isOpen) return null;

  const handleResetDefaults = async () => {
    try {
      for (const [key, val] of Object.entries(DEFAULT_PERMISSIONS)) {
        await updatePermission(key, val);
      }
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2500);
    } catch (e) {
      alert("Failed to reset permissions: " + e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/30 text-blue-400">
              <HiOutlineShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">Staff Feature Switchboard</h2>
              <p className="text-xs text-slate-400">
                Instantly enable or disable capabilities for Counselors in real-time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar flex-1">
          {savedMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2">
              <HiCheck className="w-4 h-4 text-emerald-600" />
              Permissions reset to defaults successfully!
            </div>
          )}

          {FEATURE_CATEGORIES.map((cat, cIdx) => (
            <div key={cIdx} className="space-y-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">{cat.title}</h3>
                <p className="text-xs text-slate-500">{cat.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {cat.features.map((feat) => {
                  const isEnabled = permissions[feat.key] !== false;
                  return (
                    <div
                      key={feat.key}
                      onClick={() => togglePermission(feat.key)}
                      className={`p-3 rounded-xl border transition cursor-pointer select-none flex items-start justify-between gap-3 ${
                        isEnabled
                          ? "bg-slate-50/80 border-slate-200 hover:border-blue-400"
                          : "bg-slate-100/50 border-slate-200 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <p className="font-semibold text-xs text-slate-900">{feat.name}</p>
                        <p className="text-[11px] text-slate-500 leading-tight">{feat.desc}</p>
                      </div>

                      {/* Switch */}
                      <button
                        type="button"
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isEnabled ? "bg-blue-600" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            isEnabled ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
          >
            <HiOutlineRefresh className="w-4 h-4" />
            Reset All to Defaults
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer"
          >
            Done & Apply
          </button>
        </div>
      </div>
    </div>
  );
}
