import { useState, useEffect } from "react";
import { HiX } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { addLeadNoteApi } from "../utils/api.js";

const TEMPLATES = [
  {
    id: "syllabus",
    title: "📘 Syllabus & Curriculum Details",
    getText: (name, course) =>
      `Hi ${name}! 🎓 Thank you for connecting with Shiksha Design & Tech Academy.\n\nHere is the detailed curriculum breakdown for our ${course}. It covers industry live projects, 1-on-1 mentor guidance, and comprehensive placement portfolio support.\n\nFeel free to reply here if you'd like to schedule a quick 10-minute counselor call! ✨`
  },
  {
    id: "demo",
    title: "🎯 Free Interactive Live Demo Invitation",
    getText: (name, course) =>
      `Hi ${name}! 🚀 You are invited to an exclusive Free Live Interactive Demo session for ${course} at Shiksha.\n\nMeet our lead mentor, review real-world design & tech workflows, and get all your questions answered live.\n\nWould you prefer a slot this Saturday (11:00 AM) or Sunday (4:00 PM)? Let me know so I can reserve your seat!`
  },
  {
    id: "fees",
    title: "💳 Fees, Cohort Timings & EMI Plans",
    getText: (name, course) =>
      `Hi ${name}! 📚 Sharing the schedule & fee options for ${course} at Shiksha:\n\n• Cohort Options: Weekend live classes or weekday evening batches.\n• Flexible Fee Plans: 0% Interest EMI options available.\n• Early-Bird Scholarship discount is active for the upcoming intake.\n\nWhen is a good time today to connect for a quick 5-minute fee consultation?`
  },
  {
    id: "followup",
    title: "👋 Quick Follow-up from Admissions Desk",
    getText: (name, course) =>
      `Hi ${name}! 👋 This is following up from the Admissions Desk at Shiksha regarding your interest in ${course}.\n\nSeats for our upcoming cohort are filling up fast. Are you still planning to upskill this month? Let me know how I can assist you!`
  }
];

export const cleanDigits = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : digits;
};

export default function WhatsAppModal({ isOpen, onClose, lead, onMessageSent }) {
  const [selectedTemplate, setSelectedTemplate] = useState("syllabus");
  const [message, setMessage] = useState("");
  const [customizing, setCustomizing] = useState(false);

  useEffect(() => {
    if (lead) {
      const candidateName = lead.name || "Student";
      const courseName = lead.course || "Professional Training Program";
      const tpl = TEMPLATES.find((t) => t.id === selectedTemplate) || TEMPLATES[0];
      setMessage(tpl.getText(candidateName, courseName));
    }
  }, [lead, selectedTemplate]);

  if (!isOpen || !lead) return null;

  const candidatePhone = cleanDigits(lead.phone);

  const handleSend = async () => {
    if (!candidatePhone || candidatePhone.length < 10) {
      alert("Invalid phone number. Must have at least 10 digits.");
      return;
    }

    const tpl = TEMPLATES.find((t) => t.id === selectedTemplate);
    const tplTitle = tpl?.title || "Custom WhatsApp Message";

    // 1. Log activity in CRM timeline notes
    try {
      await addLeadNoteApi(
        lead._id,
        `[Sent WhatsApp]: Template: "${tplTitle}". Message: "${message.slice(0, 100)}..."`
      );
      if (onMessageSent) onMessageSent();
    } catch (err) {
      console.error("Failed to auto-log WhatsApp note:", err);
    }

    // 2. Open WhatsApp Web or App
    const whatsappUrl = `https://wa.me/91${candidatePhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20 text-white">
              <FaWhatsapp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Send WhatsApp Template</h2>
              <p className="text-xs text-emerald-100">
                To: <span className="font-bold text-white">{lead.name}</span> (+91 {candidatePhone})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-700 cursor-pointer"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
          {/* Template Selectors */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Select Pre-Composed Template
            </label>
            <div className="space-y-2">
              {TEMPLATES.map((t) => {
                const isSelected = selectedTemplate === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(t.id);
                      setCustomizing(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold ring-1 ring-emerald-500"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 font-medium"
                    }`}
                  >
                    <span>{t.title}</span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editable Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">Message Preview</label>
              <button
                type="button"
                onClick={() => setCustomizing(!customizing)}
                className="text-[11px] text-emerald-700 hover:underline font-semibold cursor-pointer"
              >
                {customizing ? "Preview Mode" : "Customize Text"}
              </button>
            </div>
            <textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          <p className="text-[11px] text-slate-500 italic">
            💡 Clicking send will launch WhatsApp with this pre-filled message and auto-record a
            confirmation note in candidate's CRM timeline.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSend}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-2"
          >
            <FaWhatsapp className="w-4 h-4" />
            Launch WhatsApp Chat
          </button>
        </div>
      </div>
    </div>
  );
}
