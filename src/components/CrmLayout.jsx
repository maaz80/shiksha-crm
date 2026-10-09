import { useState } from "react";
import {
  HiOutlineViewBoards,
  HiOutlineTable,
  HiOutlineCalendar,
  HiOutlineChartBar,
  HiOutlinePlus,
  HiOutlineRefresh,
  HiOutlineAdjustments,
  HiOutlineLogout,
  HiOutlineSearch,
  HiMenu,
  HiX
} from "react-icons/hi";
import { getUser, clearAuth, isAdmin } from "../utils/auth.js";
import { usePermissions } from "../context/PermissionsContext.jsx";
import FeatureControlModal from "./FeatureControlModal.jsx";

const NAV_ITEMS = [
  { key: "kanban", label: "Pipeline Board", icon: HiOutlineViewBoards },
  { key: "table", label: "Leads Directory", icon: HiOutlineTable, permissionKey: "leadsTable" },
  { key: "followups", label: "Callback Alerts", icon: HiOutlineCalendar, permissionKey: "followups" },
  { key: "analytics", label: "Analytics & KPIs", icon: HiOutlineChartBar, permissionKey: "analytics" }
];

export default function CrmLayout({
  activeTab = "kanban",
  onTabChange,
  searchQuery = "",
  onSearchChange,
  onOpenAddModal,
  onSyncDb,
  syncing = false,
  totalCount = 0,
  children
}) {
  const user = getUser();
  const { hasAccess } = usePermissions();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featureModalOpen, setFeatureModalOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to sign out from Shiksha CRM?")) {
      clearAuth();
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-2xs">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Mobile Menu Toggle & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden cursor-pointer"
            >
              {mobileMenuOpen ? <HiX className="w-5 h-5" /> : <HiMenu className="w-5 h-5" />}
            </button>

            {/* Brand Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm shadow-blue-500/20">
                S
              </div>
              <div className="hidden sm:block">
                <span className="text-slate-900 font-extrabold text-base tracking-tight leading-none block">
                  Shiksha<span className="text-blue-600 font-bold ml-1">CRM</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase block">
                  Admissions & Lead Desk
                </span>
              </div>
            </div>
          </div>

          {/* Center: Global Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <HiOutlineSearch className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search candidate by name, phone, email, course..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Right: Actions & User Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Sync DB Button */}
            {hasAccess("syncDb") && (
              <button
                type="button"
                onClick={onSyncDb}
                disabled={syncing}
                title="Sync leads from website forms"
                className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <HiOutlineRefresh className={`w-4 h-4 text-slate-500 ${syncing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">{syncing ? "Syncing..." : "Sync DB"}</span>
              </button>
            )}

            {/* Admin Feature Control Switchboard */}
            {isAdmin() && (
              <button
                type="button"
                onClick={() => setFeatureModalOpen(true)}
                title="Staff Feature Controls Switchboard"
                className="p-2 sm:px-3 sm:py-2 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
              >
                <HiOutlineAdjustments className="w-4 h-4 text-blue-600" />
                <span className="hidden md:inline">Permissions</span>
              </button>
            )}

            {/* Add Lead Button */}
            {hasAccess("addLead") && (
              <button
                type="button"
                onClick={onOpenAddModal}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <HiOutlinePlus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Lead</span>
              </button>
            )}

            {/* Divider */}
            <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1" />

            {/* User Profile & Logout */}
            <div className="flex items-center gap-2">
              <div className="text-right hidden xl:block">
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  {user?.name || "Counselor"}
                </span>
                <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider block">
                  {user?.role === "crm_admin" ? "Administrator" : "Staff Counselor"}
                </span>
              </div>

              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              >
                <HiOutlineLogout className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar (Below navbar) */}
        <div className="px-4 pb-3 md:hidden">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <HiOutlineSearch className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search leads by name, phone, course..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </header>

      {/* Main Body with Sidebar & Content */}
      <div className="flex-1 flex">
        {/* Desktop Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col justify-between pt-20 pb-6 px-4 transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-[calc(100vh-64px)] lg:pt-5 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Navigation Views
            </div>

            {NAV_ITEMS.map((item) => {
              if (item.permissionKey && !hasAccess(item.permissionKey)) {
                return null;
              }

              const Icon = item.icon;
              const isActive = activeTab === item.key;

              return (
                <button
                  key={item.key}
                  onClick={() => {
                    onTabChange(item.key);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-2xs font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-blue-600" : "text-slate-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Cross-Portal Switcher */}
          {/* <div className="p-2.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between text-[11px] font-semibold text-indigo-700">
            <span className="flex items-center gap-1">🎓 ERP Operations</span>
            <a
              href="http://localhost:5175"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-md hover:bg-indigo-700 transition"
            >
              Open ERP ↗
            </a>
          </div> */}

          {/* Sidebar Footer Info */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between text-slate-500">
              <span>System Status</span>
              <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live 4s Poll
              </span>
            </div>
            <div className="text-slate-400 text-[10px]">
              Shiksha CRM Engine v2.0
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-2xs lg:hidden"
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          {children}
        </main>
      </div>

      {/* Feature Control Modal for Admin */}
      <FeatureControlModal
        isOpen={featureModalOpen}
        onClose={() => setFeatureModalOpen(false)}
      />
    </div>
  );
}
