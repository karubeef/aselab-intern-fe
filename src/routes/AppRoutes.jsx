import { Routes, Route } from "react-router-dom";
import Landing from "../pages/Landing";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/Dashboard";
import Admin from "../pages/Admin";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import RoleProtectedRoute from "./RoleProtectedRoute";
import ReportList from "../pages/reports/ReportList";
import CreateReport from "../pages/reports/CreateReport";
import ReportDetail from "../pages/reports/ReportDetail";
import AdminReportVerification from "../pages/reports/AdminReportVerification";
import EditReport from "../pages/reports/EditReport";
import MapPage from "../pages/MapPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN"]}>
            <Admin />
          </RoleProtectedRoute>
        }
      />
      <Route 
        path="/reports" 
        element={
          <ReportList />
      } 
      />
      <Route
        path="/reports/new"
        element={
          <ProtectedRoute>
            <CreateReport />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/admin/verify-reports" 
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminReportVerification />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/reports/:id/edit"
        element={
          <ProtectedRoute>
            <EditReport />
          </ProtectedRoute>
        }
      />
      <Route path="/map" element={<MapPage />} />
      <Route path="/reports/:id" element={<ReportDetail />} />
      <Route path="*" element={<NotFound />} />
      </Routes>
    );
  
}