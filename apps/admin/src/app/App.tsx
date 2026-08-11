import { Theme } from "@radix-ui/themes";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../common/contexts/AuthContext";
import RequireAdmin from "../common/components/RequireAdmin";
import AppShell from "../common/components/layout/appShell/AppShell";
import LoginPage from "../pages/login/page";
import CompaniesPage from "../pages/companies/page";

export default function App() {
  return (
    <Theme appearance="dark" accentColor="gold">
      <AuthProvider>
        <BrowserRouter>
          <AppShell>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <RequireAdmin>
                    <Navigate to="/companies" replace />
                  </RequireAdmin>
                }
              />
              <Route
                path="/companies"
                element={
                  <RequireAdmin>
                    <CompaniesPage />
                  </RequireAdmin>
                }
              />
              <Route path="*" element={<Navigate to="/companies" replace />} />
            </Routes>
          </AppShell>
        </BrowserRouter>
      </AuthProvider>
    </Theme>
  );
}
