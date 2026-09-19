import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { HomePage } from "@/pages/HomePage";
import { OnboardingPage } from "@/pages/OnboardingPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { BookingPage } from "@/pages/BookingPage";
import { MyAppointmentPage } from "@/pages/MyAppointmentPage";
import { AdminDashboardPage } from "@/pages/AdminDashboardPage";
import { GateCheckinPage } from "@/pages/GateCheckinPage";
import { DockOperationsPage } from "@/pages/DockOperationsPage";
import { QueueBoardPage } from "@/pages/QueueBoardPage";
import { SettingsPage } from "@/pages/SettingsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/my-appointment" element={<MyAppointmentPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/gate" element={<GateCheckinPage />} />
          <Route path="/dock-ops" element={<DockOperationsPage />} />
          <Route path="/queue" element={<QueueBoardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
