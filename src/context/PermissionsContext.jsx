import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchPermissionsApi, updatePermissionsApi } from "../utils/api.js";
import { isAdmin, isAuthenticated } from "../utils/auth.js";

export const DEFAULT_PERMISSIONS = {
  kanban: true,
  leadsTable: true,
  followups: true,
  analytics: true,
  addLead: true,
  syncDb: true,
  exportCsv: true,
  callLead: true,
  whatsapp: true,
  deleteLead: true,
  updateStatus: true,
  addNotes: true,
  scheduleFollowup: true
};

const PermissionsContext = createContext({
  permissions: DEFAULT_PERMISSIONS,
  hasAccess: () => true,
  updatePermission: async () => {},
  togglePermission: async () => {},
  loading: false,
  refreshPermissions: async () => {}
});

export const PermissionsProvider = ({ children }) => {
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);
  const [loading, setLoading] = useState(false);

  const refreshPermissions = useCallback(async () => {
    if (!isAuthenticated()) return;
    try {
      const data = await fetchPermissionsApi();
      if (data?.success && data?.permissions) {
        setPermissions((prev) => ({ ...prev, ...data.permissions }));
      }
    } catch (err) {
      // Keep previous or default permissions if offline/error
    }
  }, []);

  // Initial fetch and 5-second background polling
  useEffect(() => {
    refreshPermissions();
    const interval = setInterval(refreshPermissions, 5000);
    return () => clearInterval(interval);
  }, [refreshPermissions]);

  // Admin always has full access; staff checks permissions
  const hasAccess = useCallback(
    (key) => {
      if (isAdmin()) return true;
      if (!key) return true;
      return permissions[key] !== false;
    },
    [permissions]
  );

  const updatePermission = async (key, value) => {
    const updated = { ...permissions, [key]: value };
    setPermissions(updated);
    try {
      await updatePermissionsApi(updated);
    } catch (err) {
      // Revert if failed
      refreshPermissions();
      throw err;
    }
  };

  const togglePermission = async (key) => {
    const nextVal = !permissions[key];
    await updatePermission(key, nextVal);
  };

  return (
    <PermissionsContext.Provider
      value={{
        permissions,
        hasAccess,
        updatePermission,
        togglePermission,
        loading,
        refreshPermissions
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => useContext(PermissionsContext);
