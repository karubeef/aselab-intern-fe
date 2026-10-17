
import { Route, Routes } from "react-router-dom";

import Landing from "../pages/Landing";
import PublicMapPage from "../pages/PublicMapPage";
import PublicInformationPage from "../pages/PublicInformationPage";
import PublicArticleDetailPage from "../pages/PublicArticleDetailPage";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

import ProtectedRoute from "./ProtectedRoute";
import RoleProtectedRoute from "./RoleProtectedRoute";

import Dashboard from "../pages/Dashboard";
import Admin from "../pages/Admin";
import NotFound from "../pages/NotFound";
import AdminDashboard from "../pages/AdminDashboard";

import ReportList from "../pages/reports/ReportList";
import CreateReport from "../pages/reports/CreateReport";
import ReportDetail from "../pages/reports/ReportDetail";
import EditReport from "../pages/reports/EditReport";
import MyReports from "../pages/reports/MyReports";

import MapPage from "../pages/MapPage";
import Challenges from "../pages/Challenges";

import AdminManageReports from "../pages/admin/AdminManageReports";
import AdminReportDetail from "../pages/admin/AdminReportDetail";

import AdminChallenges from "../pages/admin/AdminChallenges";
import AdminChallengeCreate from "../pages/admin/AdminChallengeCreate";
import AdminChallengeDetail from "../pages/admin/AdminChallengeDetail";

import AdminArticles from "../pages/admin/AdminArticles";
import AdminArticleCreate from "../pages/admin/AdminArticleCreate";
import AdminArticleDetail from "../pages/admin/AdminArticleDetail";
import AdminArticleEdit from "../pages/admin/AdminArticleEdit";

import ProfileRouter from "../pages/ProfileRouter";
import AdminProfileEdit from "../pages/admin/AdminProfileEdit";
import AdminPasswordChange from "../pages/admin/AdminPasswordChange";
import UserProfileEdit from "../pages/UserProfileEdit";
import UserPasswordChange from "../pages/UserPasswordChange";

const UserOnly = ({ children }) => (
  <RoleProtectedRoute allowedRoles={["USER"]}>
    {children}
  </RoleProtectedRoute>
);

const AdminOnly = ({ children }) => (
  <RoleProtectedRoute allowedRoles={["ADMIN"]}>
    {children}
  </RoleProtectedRoute>
);

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/public-map" element={<PublicMapPage />} />
      <Route path="/informasi" element={<PublicInformationPage />} />
      <Route
        path="/informasi/:id"
        element={<PublicArticleDetailPage />}
      />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />
      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />

      <Route
        path="/dashboard"
        element={
          <UserOnly>
            <Dashboard />
          </UserOnly>
        }
      />

      <Route
        path="/reports"
        element={<ReportList />}
      />

      <Route
        path="/reports/new"
        element={
          <UserOnly>
            <CreateReport />
          </UserOnly>
        }
      />

      <Route
        path="/reports/:id/edit"
        element={
          <UserOnly>
            <EditReport />
          </UserOnly>
        }
      />

      <Route
        path="/reports/:id"
        element={<ReportDetail />}
      />

      <Route
        path="/my-reports"
        element={
          <UserOnly>
            <MyReports />
          </UserOnly>
        }
      />

      <Route
        path="/map"
        element={
          <ProtectedRoute>
            <MapPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/challenges"
        element={
          <UserOnly>
            <Challenges />
          </UserOnly>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfileRouter />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/edit"
        element={
          <UserOnly>
            <UserProfileEdit />
          </UserOnly>
        }
      />

      <Route
        path="/profile/password"
        element={
          <UserOnly>
            <UserPasswordChange />
          </UserOnly>
        }
      />

      <Route
        path="/admin"
        element={
          <AdminOnly>
            <Admin />
          </AdminOnly>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <AdminOnly>
            <AdminDashboard />
          </AdminOnly>
        }
      />

      <Route
        path="/admin/manage-reports"
        element={
          <AdminOnly>
            <AdminManageReports />
          </AdminOnly>
        }
      />

      <Route
        path="/admin/manage-reports/:id"
        element={
          <AdminOnly>
            <AdminReportDetail />
          </AdminOnly>
        }
      />

      <Route
        path="/admin/challenges"
        element={
          <AdminOnly>
            <AdminChallenges />
          </AdminOnly>
        }
      />

      <Route
        path="/admin/challenges/new"
        element={
          <AdminOnly>
            <AdminChallengeCreate />
          </AdminOnly>
        }
      />

      <Route
        path="/admin/challenges/:id"
        element={
          <AdminOnly>
            <AdminChallengeDetail />
          </AdminOnly>
        }
      />

      <Route
        path="/admin/articles"
        element={
          <AdminOnly>
            <AdminArticles />
          </AdminOnly>
        }
      />

      <Route
        path="/admin/articles/new"
        element={
          <AdminOnly>
            <AdminArticleCreate />
          </AdminOnly>
        }
      />

      <Route
        path="/admin/articles/:id"
        element={
          <AdminOnly>
            <AdminArticleDetail />
          </AdminOnly>
        }
      />

      <Route
        path="/admin/articles/:id/edit"
        element={
          <AdminOnly>
            <AdminArticleEdit />
          </AdminOnly>
        }
      />

      <Route
        path="/admin/profile/edit"
        element={
          <AdminOnly>
            <AdminProfileEdit />
          </AdminOnly>
        }
      />

      <Route
        path="/admin/profile/password"
        element={
          <AdminOnly>
            <AdminPasswordChange />
          </AdminOnly>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
