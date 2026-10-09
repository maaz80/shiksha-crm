import { useState, useEffect } from "react";
import {
  HiX,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineTag,
  HiOutlineChatAlt2,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineSparkles
} from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import {
  updateLeadApi,
  updateLeadStatusApi,
  addLeadNoteApi,
  scheduleFollowupApi,
  deleteLeadApi,
  fetchLeadByIdApi
} from "../utils/api.js";
import { usePermissions } from "../context/PermissionsContext.jsx";
import CustomDropdown from "./CustomDropdown.jsx";

const STAGES = [
  "Pending",
  "Contacted",
  "In Discussion",
  "Demo Scheduled",
  "Enrolled",
  "Lost"
];

const STAGE_LABELS = {
  Pending: "Pending Inquiry",
  Contacted: "Contacted",
  "In Discussion": "In Discussion",
  "Demo Scheduled": "Demo Scheduled",
  Enrolled: "Enrolled 🎉",
  Lost: "Lost / Dropped"
};

export default function LeadProfileDrawer({
  isOpen,
  onClose,
  lead,
  onLeadUpdated,
  onOpenWhatsApp
}) {
  const { hasAccess } = usePermissions();
  const [currentLead, setCurrentLead] = useState(lead);
  const [activeStage, setActiveStage] = useState(lead?.status || "Pending");
  const [enrollmentFee, setEnrollmentFee] = useState("");
  const [dropReason, setDropReason] = useState("");
  const [statusRemark, setStatusRemark] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [targetStage, setTargetStage] = useState("");

  // Follow-up state
  const [followDate, setFollowDate] = useState("");
  const [followTime, setFollowTime] = useState("");
  const [followNote, setFollowNote] = useState("");
  const [scheduling, setScheduling] = useState(false);

  // New Note state
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // Refresh lead details on open
  useEffect(() => {
    if (lead?._id) {
      setCurrentLead(lead);
      setActiveStage(lead.status || "Pending");
      if (lead.followUpDate) {
        try {
          const d = new Date(lead.followUpDate).toISOString().split("T")[0];
          setFollowDate(d);
        } catch {}
      }
      setFollowTime(lead.followUpTime || "");
      setFollowNote(lead.followUpNote || "");

      // Fetch fresh details (including latest notes)
      fetchLeadByIdApi(lead._id)
        .then((res) => {
          if (res?.success && res?.lead) {
            setCurrentLead(res.lead);
            setActiveStage(res.lead.status);
          }
        })
        .catch(() => {});
    }
  }, [lead]);

  if (!isOpen || !currentLead) return null;

  const handleStageClick = (newStage) => {
    if (!hasAccess("updateStatus")) return;
    if (newStage === activeStage) return;

    if (newStage === "Enrolled" || newStage === "Lost") {
      setTargetStage(newStage);
      setEnrollmentFee(currentLead.enrollmentFee || "");
      setDropReason(currentLead.dropReason || "");
      setStatusRemark("");
      setShowStatusModal(true);
    } else {
      executeStatusUpdate(newStage);
    }
  };

  const executeStatusUpdate = async (stage, fee = 0, reason = "", remark = "") => {
    try {
      const res = await updateLeadStatusApi(currentLead._id, {
        status: stage,
        enrollmentFee: fee,
        dropReason: reason,
        note: remark
      });
      if (res?.success) {
        setCurrentLead(res.lead);
        setActiveStage(stage);
        setShowStatusModal(false);
        if (onLeadUpdated) onLeadUpdated(res.lead);
      }
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  };

  const handlePriorityChange = async (priority) => {
    try {
      const res = await updateLeadApi(currentLead._id, { priority });
      if (res?.success) {
        setCurrentLead(res.lead);
        if (onLeadUpdated) onLeadUpdated(res.lead);
      }
    } catch (err) {
      alert("Failed to update priority: " + err.message);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      const res = await addLeadNoteApi(currentLead._id, newNote.trim());
      if (res?.success) {
        setCurrentLead(res.lead);
        setNewNote("");
        if (onLeadUpdated) onLeadUpdated(res.lead);
      }
    } catch (err) {
      alert("Failed to add note: " + err.message);
    } finally {
      setAddingNote(false);
    }
  };

  const handleScheduleFollowup = async (e) => {
    e.preventDefault();
    if (!followDate) {
      alert("Please select a callback date.");
      return;
    }
    setScheduling(true);
    try {
      const res = await scheduleFollowupApi(currentLead._id, {
        followUpDate: followDate,
        followUpTime: followTime,
        followUpNote: followNote
      });
      if (res?.success) {
        setCurrentLead(res.lead);
        alert("Callback reminder scheduled!");
        if (onLeadUpdated) onLeadUpdated(res.lead);
      }
    } catch (err) {
      alert("Failed to schedule: " + err.message);
    } finally {
      setScheduling(false);
    }
  };

  const handleDelete = async () => {
    if (!hasAccess("deleteLead")) return;
    if (window.confirm(`Are you sure you want to permanently delete "${currentLead.name}"? This action cannot be undone.`)) {
      try {
        await deleteLeadApi(currentLead._id);
        if (onLeadUpdated) onLeadUpdated(null, true);
        onClose();
      } catch (err) {
        alert("Failed to delete lead: " + err.message);
      }
    }
  };

  const rawPhone = String(currentLead.phone || "").replace(/\D/g, "");
  const cleanPhone = rawPhone.length >= 10 ? rawPhone.slice(-10) : rawPhone;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-in"
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
              {(currentLead.name || "U")[0].toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900 leading-tight">
                {currentLead.name}
              </h2>
              <p className="text-xs text-slate-500">
                {currentLead.course || "General Inquiry"} • {currentLead.source || "Website"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasAccess("deleteLead") && (
              <button
                type="button"
                onClick={handleDelete}
                title="Delete Lead"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              >
                <HiOutlineTrash className="w-5 h-5" />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
          {/* Quick Action Ribbon: Call & WhatsApp */}
          <div className="grid grid-cols-2 gap-3">
            {hasAccess("callLead") && cleanPhone ? (
              <a
                href={`tel:${cleanPhone}`}
                className="py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold flex items-center justify-center gap-2 border border-blue-200 transition"
              >
                <HiOutlinePhone className="w-4 h-4" />
                Call Candidate
              </a>
            ) : (
              <div className="py-2.5 px-3 rounded-xl bg-slate-100 text-slate-400 font-bold flex items-center justify-center gap-2">
                <HiOutlinePhone className="w-4 h-4" />
                No Phone
              </div>
            )}

            {hasAccess("whatsapp") && cleanPhone ? (
              <button
                type="button"
                onClick={() => onOpenWhatsApp(currentLead)}
                className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center gap-2 border border-emerald-200 transition cursor-pointer"
              >
                <FaWhatsapp className="w-4 h-4 text-emerald-600" />
                Open WhatsApp
              </button>
            ) : (
              <div className="py-2.5 px-3 rounded-xl bg-slate-100 text-slate-400 font-bold flex items-center justify-center gap-2">
                <FaWhatsapp className="w-4 h-4" />
                No WhatsApp
              </div>
            )}
          </div>

          {/* Lead Intelligence Card (Score, Priority, Tags) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <HiOutlineSparkles className="w-4 h-4 text-amber-500" />
                Lead Intelligence
              </span>
              <span className="font-bold text-blue-600 bg-blue-100/80 px-2.5 py-0.5 rounded-full text-[11px]">
                Score: {currentLead.leadScore || 60}/100 pts
              </span>
            </div>

            {/* Priority Selector */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Priority:</span>
              <div className="flex gap-1.5">
                {["Hot", "Warm", "Cold"].map((p) => {
                  const isCurrent = currentLead.priority === p;
                  return (
                    <button
                      key={p}
                      onClick={() => handlePriorityChange(p)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                        isCurrent
                          ? p === "Hot"
                            ? "bg-rose-500 text-white shadow-xs"
                            : p === "Warm"
                            ? "bg-amber-500 text-white shadow-xs"
                            : "bg-sky-500 text-white shadow-xs"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {p === "Hot" ? "🔥 Hot" : p === "Warm" ? "⚡ Warm" : "❄️ Cold"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Auto Tags */}
            {currentLead.autoTags && currentLead.autoTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentLead.autoTags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 text-[10px] font-medium"
                  >
                    <HiOutlineTag className="w-3 h-3 text-slate-400" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Pipeline Stage Transition Ribbon */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-700">Pipeline Stage</label>
            <div className="grid grid-cols-3 gap-2">
              {STAGES.map((stg) => {
                const isActive = activeStage === stg;
                return (
                  <button
                    key={stg}
                    onClick={() => handleStageClick(stg)}
                    disabled={!hasAccess("updateStatus")}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold text-center border transition cursor-pointer disabled:opacity-50 ${
                      isActive
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-200"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {STAGE_LABELS[stg]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-700">Candidate Information</h3>
            <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-[11px]">
              <div>
                <span className="text-slate-400 block">Phone</span>
                <span className="font-semibold text-slate-800">
                  {currentLead.phone || "Not Provided"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Email</span>
                <span className="font-semibold text-slate-800 break-all">
                  {currentLead.email || "Not Provided"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Source</span>
                <span className="font-semibold text-slate-800">{currentLead.source}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Inquiry Date</span>
                <span className="font-semibold text-slate-800">
                  {new Date(currentLead.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Form Answers / Preferences */}
          {currentLead.answersSummary && (
            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
              <span className="font-bold text-amber-900 block">Submitted Preferences</span>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                {currentLead.answersSummary}
              </p>
            </div>
          )}

          {/* Follow-up Callback Scheduler */}
          {hasAccess("scheduleFollowup") && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <HiOutlineCalendar className="w-4 h-4 text-blue-600" />
                  Follow-up Callback Reminder
                </span>
                {currentLead.followUpDate && (
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold">
                    Active: {new Date(currentLead.followUpDate).toLocaleDateString("en-IN")}
                  </span>
                )}
              </div>

              <form onSubmit={handleScheduleFollowup} className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={followDate}
                      onChange={(e) => setFollowDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-1">
                      Time Slot
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 02:30 PM"
                      value={followTime}
                      onChange={(e) => setFollowTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Callback objective (e.g. Demo feedback, fee balance)"
                    value={followNote}
                    onChange={(e) => setFollowNote(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={scheduling}
                  className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition cursor-pointer"
                >
                  {scheduling ? "Saving..." : "Set Callback Window"}
                </button>
              </form>
            </div>
          )}

          {/* Counselor Call Notes Timeline */}
          {hasAccess("addNotes") && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                <HiOutlineChatAlt2 className="w-4 h-4 text-slate-600" />
                Counselor Discussion History ({currentLead.notes?.length || 0})
              </h3>

              {/* Add Note Input */}
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  rows={2}
                  placeholder="Record call summary, student feedback, or requirements..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={addingNote || !newNote.trim()}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition cursor-pointer"
                >
                  {addingNote ? "Logging..." : "Log Note"}
                </button>
              </form>

              {/* Timeline Items */}
              <div className="space-y-2 pt-2">
                {currentLead.notes && currentLead.notes.length > 0 ? (
                  currentLead.notes
                    .slice()
                    .reverse()
                    .map((n, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-bold text-slate-700">{n.author || "Counselor"}</span>
                          <span>
                            {new Date(n.createdAt).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                        <p className="text-slate-800 text-[11px] leading-relaxed whitespace-pre-wrap">
                          {n.text}
                        </p>
                      </div>
                    ))
                ) : (
                  <p className="text-slate-400 italic text-center py-4">
                    No discussion remarks logged yet.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>ID: {currentLead._id}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 font-bold rounded-lg text-slate-700 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Stage Transition Modal (Enrolled / Lost) */}
      {showStatusModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">
              {targetStage === "Enrolled" ? "🎉 Mark Student as Enrolled" : "Mark Lead as Lost / Dropped"}
            </h3>

            {targetStage === "Enrolled" ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Moving candidate to Enrolled triggers automated student creation and official fee ledger sync.
                </p>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Initial Enrollment Fee Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 15000"
                    value={enrollmentFee}
                    onChange={(e) => setEnrollmentFee(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Specify why candidate dropped to help improve admissions funnel.
                </p>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Drop / Lost Reason
                  </label>
                  <CustomDropdown
                    value={dropReason}
                    onChange={(val) => setDropReason(val)}
                    placeholder="Select drop reason..."
                    options={[
                      { value: "Fee Budget Constraint", label: "Fee Budget Constraint" },
                      { value: "Batch Timing Mismatch", label: "Batch Timing Mismatch" },
                      { value: "Joined Another Institute", label: "Joined Another Institute" },
                      { value: "Not Responding / Switch Off", label: "Not Responding / Switch Off" },
                      { value: "Looking for Online Free Content", label: "Looking for Online Free Content" },
                      { value: "Other", label: "Other" }
                    ]}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Optional Remark Note
              </label>
              <input
                type="text"
                placeholder="Remarks..."
                value={statusRemark}
                onChange={(e) => setStatusRemark(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeStatusUpdate(targetStage, enrollmentFee, dropReason, statusRemark)}
                className={`px-4 py-1.5 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer ${
                  targetStage === "Enrolled" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                Confirm {targetStage}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
