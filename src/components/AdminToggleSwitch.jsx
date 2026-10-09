import { usePermissions } from "../context/PermissionsContext.jsx";
import { isAdmin } from "../utils/auth.js";

export default function AdminToggleSwitch({ permissionKey, label, size = "sm" }) {
  const { permissions, togglePermission } = usePermissions();

  if (!isAdmin() || !permissionKey) return null;

  const isEnabled = permissions[permissionKey] !== false;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        togglePermission(permissionKey);
      }}
      title={`Admin Control: Click to toggle ${label || permissionKey} for staff`}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[11px] font-medium transition cursor-pointer select-none ${
        isEnabled
          ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
          : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full transition-colors ${
          isEnabled ? "bg-emerald-500 ring-2 ring-emerald-200" : "bg-rose-500 ring-2 ring-rose-200"
        }`}
      />
      <span className="hidden sm:inline">{label || permissionKey}:</span>
      <span className="font-bold">{isEnabled ? "ON" : "OFF"}</span>
    </div>
  );
}
