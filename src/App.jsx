import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { PermissionsProvider } from "./context/PermissionsContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import CrmDashboard from "./pages/CrmDashboard.jsx";

export default function App() {
  return (
    <PermissionsProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <CrmDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </PermissionsProvider>
  );
}
