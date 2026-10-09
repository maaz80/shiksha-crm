import { useState } from "react";
import { HiX, HiOutlineUserAdd, HiOutlinePhone, HiOutlineMail, HiOutlineAcademicCap } from "react-icons/hi";
import { createLeadApi } from "../utils/api.js";
import CustomDropdown from "./CustomDropdown.jsx";

const DEFAULT_COURSES = [
  "Web Development Course in Delhi",
  "Figma Professional Training",
  "UI/UX Design Masterclass",
  "Graphic Design & Visual Identity",
  "Full-Stack Development Bootcamp",
  "General Inquiry"
];

const SOURCES = [
  "Walk-in Inquiry",
  "Direct Phone Call",
  "Referral / Word of Mouth",
  "WhatsApp Direct",
  "Instagram Direct",
  "Website Form",
  "Other"
];

export default function AddLeadModal({ isOpen, onClose, onLeadAdded, availableCourses = [] }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState(DEFAULT_COURSES[0]);
  const [source, setSource] = useState(SOURCES[0]);
  const [priority, setPriority] = useState("Warm");
  const [initialNote, setInitialNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const coursesList = availableCourses && availableCourses.length > 0
    ? Array.from(new Set([...availableCourses, ...DEFAULT_COURSES]))
    : DEFAULT_COURSES;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter candidate name.");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter candidate contact number.");
      return;
    }

    setLoading(true);
    try {
      const res = await createLeadApi({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        course,
        source,
        priority,
        initialNote: initialNote.trim()
      });

      if (res?.success) {
        onLeadAdded(res.lead, res.isNew);
        handleClose();
      }
    } catch (err) {
      setError(err.message || "Failed to create lead.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setPhone("");
    setEmail("");
    setCourse(DEFAULT_COURSES[0]);
    setSource(SOURCES[0]);
    setPriority("Warm");
    setInitialNote("");
    setError("");
    onClose();
  };

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/30 text-blue-400">
              <HiOutlineUserAdd className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Capture Inbound Inquiry</h2>
              <p className="text-xs text-slate-400">Register a new walk-in or offline telephone lead</p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Candidate Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <HiOutlinePhone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <HiOutlineMail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  placeholder="rahul@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>
          </div>

          {/* Course & Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Requested Program</label>
              <CustomDropdown
                value={course}
                onChange={(val) => setCourse(val)}
                options={coursesList}
                searchable={true}
                searchPlaceholder="Search programs..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Acquisition Source</label>
              <CustomDropdown
                value={source}
                onChange={(val) => setSource(val)}
                options={SOURCES}
                searchPlaceholder="Search sources..."
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Lead Priority</label>
            <div className="grid grid-cols-3 gap-2">
              {["Hot", "Warm", "Cold"].map((p) => {
                const isSelected = priority === p;
                const colors = {
                  Hot: "border-rose-400 bg-rose-50 text-rose-800",
                  Warm: "border-amber-400 bg-amber-50 text-amber-800",
                  Cold: "border-sky-400 bg-sky-50 text-sky-800"
                };
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition text-center ${
                      isSelected
                        ? `${colors[p]} ring-2 ring-offset-1 ring-blue-400`
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {p === "Hot" ? "🔥 Hot" : p === "Warm" ? "⚡ Warm" : "❄️ Cold"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Initial Discussion Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Counselor Remarks / Notes</label>
            <textarea
              rows={3}
              placeholder="e.g. Student visited center, interested in weekend batch. Discussed fees and portfolio review."
              value={initialNote}
              onChange={(e) => setInitialNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-2"
            >
              {loading ? "Creating..." : "Save Candidate Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
