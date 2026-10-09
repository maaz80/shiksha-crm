import { useState, useEffect, useCallback, useRef } from "react";
import CrmLayout from "../components/CrmLayout.jsx";
import KanbanBoard from "../components/KanbanBoard.jsx";
import LeadsTable from "../components/LeadsTable.jsx";
import AnalyticsView from "../components/AnalyticsView.jsx";
import LeadProfileDrawer from "../components/LeadProfileDrawer.jsx";
import WhatsAppModal from "../components/WhatsAppModal.jsx";
import AddLeadModal from "../components/AddLeadModal.jsx";
import AdminToggleSwitch from "../components/AdminToggleSwitch.jsx";
import CustomDropdown from "../components/CustomDropdown.jsx";
import {
  fetchLeadsApi,
  fetchAnalyticsApi,
  syncLeadsApi,
  updateLeadStatusApi
} from "../utils/api.js";
import { usePermissions } from "../context/PermissionsContext.jsx";
import {
  HiOutlineFilter,
  HiOutlineViewBoards,
  HiOutlineTable,
  HiOutlineSparkles,
  HiOutlineX,
  HiOutlineCheckCircle
} from "react-icons/hi";

export default function CrmDashboard() {
  const { hasAccess } = usePermissions();

  // Tab & Filters State
  const [activeTab, setActiveTab] = useState("kanban"); // 'kanban' | 'table' | 'followups' | 'analytics'
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [courseFilter, setCourseFilter] = useState("All");
  const [page, setPage] = useState(1);

  // Data State
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 100, total: 0, pages: 1 });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Alert & Modals State
  const [newLeadAlert, setNewLeadAlert] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const selectedLeadRef = useRef(null);
  const [whatsAppLead, setWhatsAppLead] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Sync ref and state safely
  const handleSelectLead = (lead) => {
    selectedLeadRef.current = lead;
    setSelectedLead(lead);
  };

  const handleCloseLeadDrawer = () => {
    selectedLeadRef.current = null;
    setSelectedLead(null);
  };

  // Track total for real-time sound/alert
  const previousTotalRef = useRef(0);

  // Extract distinct course list for filters
  const availableCourses = analytics?.courses?.map((c) => c.course) || [];

  // Show Toast helper
  const showToast = (message, type = "success") => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Main Data Loader
  const loadData = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setLoading(true);

      try {
        const params = {
          page,
          limit: activeTab === "kanban" ? 200 : 50,
          search: searchQuery,
          status: statusFilter,
          priority: priorityFilter,
          course: courseFilter
        };

        if (activeTab === "followups") {
          params.followUp = "today";
        }

        const [leadsRes, analyticsRes] = await Promise.all([
          fetchLeadsApi(params),
          fetchAnalyticsApi().catch(() => null)
        ]);

        if (leadsRes?.success) {
          const newLeads = leadsRes.leads || [];
          const newTotal = leadsRes.pagination?.total || 0;

          // Real-time notification check: incoming lead detection
          if (previousTotalRef.current > 0 && newTotal > previousTotalRef.current && newLeads.length > 0) {
            const latest = newLeads[0];
            setNewLeadAlert(latest);
            setTimeout(() => setNewLeadAlert(null), 9000);
          }

          previousTotalRef.current = newTotal;
          setLeads(newLeads);
          setPagination(leadsRes.pagination || { page: 1, limit: 50, total: newTotal, pages: 1 });

          // Refresh selected lead only if drawer is still open
          if (selectedLeadRef.current) {
            const currentId = selectedLeadRef.current._id;
            const freshLead = newLeads.find((l) => l._id === currentId);
            if (freshLead && selectedLeadRef.current && selectedLeadRef.current._id === currentId) {
              selectedLeadRef.current = freshLead;
              setSelectedLead(freshLead);
            }
          }
        }

        if (analyticsRes?.success) {
          setAnalytics(analyticsRes.analytics);
        }
      } catch (err) {
        if (!isSilent) console.error("Error loading CRM data:", err.message);
      } finally {
        if (!isSilent) setLoading(false);
      }
    },
    [activeTab, page, searchQuery, statusFilter, priorityFilter, courseFilter]
  );

  // Initial load
  useEffect(() => {
    loadData(false);
  }, [loadData]);

  // Automated 4-Second Real-Time Background Polling
  useEffect(() => {
    const timer = setInterval(() => {
      loadData(true);
    }, 4000);
    return () => clearInterval(timer);
  }, [loadData]);

  // Handle Tab Switch (Check Permissions)
  const handleTabChange = (newTab) => {
    if (newTab === "table" && !hasAccess("leadsTable")) return;
    if (newTab === "followups" && !hasAccess("followups")) return;
    if (newTab === "analytics" && !hasAccess("analytics")) return;
    setActiveTab(newTab);
    setPage(1);
  };

  // Sync Database Leads Action
  const handleSyncDb = async () => {
    if (!hasAccess("syncDb")) return;
    setSyncing(true);
    try {
      const res = await syncLeadsApi();
      if (res?.success) {
        showToast(res.message || "Database sync completed!");
        loadData(false);
      }
    } catch (err) {
      alert("Failed to sync database: " + err.message);
    } finally {
      setSyncing(false);
    }
  };

  // Move Lead Stage (Kanban Drag / Button)
  const handleMoveStage = async (lead, newStage) => {
    if (!hasAccess("updateStatus")) return;

    if (newStage === "Enrolled" || newStage === "Lost") {
      // Open drawer to capture required fee / drop reason
      handleSelectLead(lead);
      return;
    }

    try {
      const res = await updateLeadStatusApi(lead._id, { status: newStage });
      if (res?.success) {
        // Optimistically update local state
        setLeads((prev) =>
          prev.map((l) => (l._id === lead._id ? { ...l, status: newStage, lastActivityAt: new Date() } : l))
        );
        loadData(true);
      }
    } catch (err) {
      alert("Failed to update lead status: " + err.message);
    }
  };

  // Callback when lead is updated or deleted from drawer
  const handleLeadUpdated = (updatedLead, isDeleted = false) => {
    if (isDeleted) {
      setLeads((prev) => prev.filter((l) => l._id !== selectedLeadRef.current?._id));
      handleCloseLeadDrawer();
      showToast("Lead record deleted successfully", "info");
      loadData(true);
      return;
    }
    if (updatedLead) {
      setLeads((prev) => prev.map((l) => (l._id === updatedLead._id ? updatedLead : l)));
      handleSelectLead(updatedLead);
      loadData(true);
    }
  };

  // Callback when new lead is manually added
  const handleLeadAdded = (newLead, isNew) => {
    showToast(isNew ? `Lead "${newLead.name}" added successfully!` : `Lead "${newLead.name}" updated!`);
    loadData(false);
  };

  return (
    <CrmLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      searchQuery={searchQuery}
      onSearchChange={(q) => {
        setSearchQuery(q);
        setPage(1);
      }}
      onOpenAddModal={() => setAddModalOpen(true)}
      onSyncDb={handleSyncDb}
      syncing={syncing}
      totalCount={pagination.total}
    >
      <div className="space-y-4">
        {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-slide-in text-xs font-semibold">
            <HiOutlineCheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMsg.message}</span>
            <button
              onClick={() => setToastMsg(null)}
              className="text-slate-400 hover:text-white ml-2 cursor-pointer"
            >
              <HiOutlineX className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Real-Time Live Lead Alert Banner */}
        {newLeadAlert && (
          <div className="bg-amber-400 text-slate-950 p-3.5 rounded-2xl shadow-md flex items-center justify-between animate-slide-in">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-900 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-900" />
              </span>
              <div>
                <p className="font-bold text-xs">
                  New Inbound Inquiry Captured: <span className="underline">{newLeadAlert.name}</span> (
                  {newLeadAlert.course || "Program Inquiry"})
                </p>
                <p className="text-[11px] text-slate-900/80">
                  Source: {newLeadAlert.source} • Priority: {newLeadAlert.priority || "Warm"} (
                  {newLeadAlert.leadScore || 60}pts)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSelectLead(newLeadAlert)}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                View Profile
              </button>
              <button
                onClick={() => setNewLeadAlert(null)}
                className="p-1 rounded-lg text-slate-900/70 hover:text-slate-900 cursor-pointer"
              >
                <HiOutlineX className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Multi-Filter Toolbar (Visible for Board and Table views) */}
        {activeTab !== "analytics" && (
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mr-1">
                <HiOutlineFilter className="w-4 h-4 text-slate-400" />
                Filters:
              </span>

              {/* Status Filter */}
              <div className="w-36">
                <CustomDropdown
                  size="sm"
                  value={statusFilter}
                  onChange={(val) => {
                    setStatusFilter(val);
                    setPage(1);
                  }}
                  options={[
                    { value: "All", label: "All Stages" },
                    { value: "Pending", label: "Pending" },
                    { value: "Contacted", label: "Contacted" },
                    { value: "In Discussion", label: "In Discussion" },
                    { value: "Demo Scheduled", label: "Demo Scheduled" },
                    { value: "Enrolled", label: "Enrolled 🎉" },
                    { value: "Lost", label: "Lost / Dropped" }
                  ]}
                />
              </div>

              {/* Priority Filter */}
              <div className="w-34">
                <CustomDropdown
                  size="sm"
                  value={priorityFilter}
                  onChange={(val) => {
                    setPriorityFilter(val);
                    setPage(1);
                  }}
                  options={[
                    { value: "All", label: "All Priorities" },
                    { value: "Hot", label: "🔥 Hot" },
                    { value: "Warm", label: "⚡ Warm" },
                    { value: "Cold", label: "❄️ Cold" }
                  ]}
                />
              </div>

              {/* Course Filter */}
              {availableCourses.length > 0 && (
                <div className="w-48">
                  <CustomDropdown
                    size="sm"
                    value={courseFilter}
                    onChange={(val) => {
                      setCourseFilter(val);
                      setPage(1);
                    }}
                    options={[
                      { value: "All", label: "All Programs" },
                      ...availableCourses.map((c) => ({ value: c, label: c }))
                    ]}
                    searchable={true}
                    searchPlaceholder="Filter programs..."
                  />
                </div>
              )}

              {/* Clear Filter Button if active */}
              {(statusFilter !== "All" || priorityFilter !== "All" || courseFilter !== "All" || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("All");
                    setPriorityFilter("All");
                    setCourseFilter("All");
                    setSearchQuery("");
                    setPage(1);
                  }}
                  className="text-xs text-rose-600 hover:underline font-semibold ml-1 cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* View Mode Switcher & Admin Quick Toggles */}
            <div className="flex items-center gap-2">
              <AdminToggleSwitch permissionKey="kanban" label="Kanban" />
              <AdminToggleSwitch permissionKey="leadsTable" label="Table" />

              {/* Board / Table Pill */}
              <div className="p-1 rounded-xl bg-slate-100 flex items-center gap-1">
                {hasAccess("kanban") && (
                  <button
                    onClick={() => setActiveTab("kanban")}
                    title="Pipeline Kanban View"
                    className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "kanban"
                        ? "bg-white text-blue-600 shadow-2xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <HiOutlineViewBoards className="w-4 h-4" />
                    <span className="hidden sm:inline">Board</span>
                  </button>
                )}

                {hasAccess("leadsTable") && (
                  <button
                    onClick={() => setActiveTab("table")}
                    title="Tabular Directory View"
                    className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "table"
                        ? "bg-white text-blue-600 shadow-2xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <HiOutlineTable className="w-4 h-4" />
                    <span className="hidden sm:inline">Table</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* View Switcher Output */}
        {loading && leads.length === 0 ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-semibold text-slate-500">Connecting to Shiksha Lead Pipeline...</p>
          </div>
        ) : activeTab === "kanban" ? (
          hasAccess("kanban") ? (
            <KanbanBoard
              leads={leads}
              onSelectLead={handleSelectLead}
              onOpenWhatsApp={(l) => setWhatsAppLead(l)}
              onMoveStage={handleMoveStage}
            />
          ) : (
            <div className="py-20 text-center text-slate-400 text-xs">
              Kanban view has been disabled by Administrator.
            </div>
          )
        ) : activeTab === "table" || activeTab === "followups" ? (
          <LeadsTable
            leads={leads}
            pagination={pagination}
            onPageChange={(p) => setPage(p)}
            onSelectLead={handleSelectLead}
            onOpenWhatsApp={(l) => setWhatsAppLead(l)}
            onDeleteLead={(l) => handleLeadUpdated(null, true)}
          />
        ) : activeTab === "analytics" ? (
          <AnalyticsView analytics={analytics} />
        ) : null}
      </div>

      {/* Slide-over Profile Drawer */}
      <LeadProfileDrawer
        isOpen={!!selectedLead}
        onClose={handleCloseLeadDrawer}
        lead={selectedLead}
        onLeadUpdated={handleLeadUpdated}
        onOpenWhatsApp={(l) => setWhatsAppLead(l)}
      />

      {/* WhatsApp Template Modal */}
      <WhatsAppModal
        isOpen={!!whatsAppLead}
        onClose={() => setWhatsAppLead(null)}
        lead={whatsAppLead}
        onMessageSent={() => loadData(true)}
      />

      {/* Manual Ingestion Add Lead Modal */}
      <AddLeadModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onLeadAdded={handleLeadAdded}
        availableCourses={availableCourses}
      />
    </CrmLayout>
  );
}
