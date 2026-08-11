import * as React from "react";
import { Theme } from "@radix-ui/themes";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "../pages/dashboard/page";
import LoginPage from "../pages/login/page";
import ProductsPage from "../pages/products/page";
import CategoriesPage from "../pages/categories/page";
import PurchasePage from "../pages/purchase/page";
import KullanicilarPage from "../pages/settings/kullanicilar/page";
import SubelerPage from "../pages/settings/subeler/page";
import KassalarPage from "../pages/kasalar/page";
import MaliyyeHesabatPage from "../pages/maliyye/hesabat/page";
import GiderAnaliziPage from "../pages/maliyye/gider-analizi/page";
import MenfeetZererlerPage from "../pages/maliyye/menfeet-zererler/page";
import AppShell from "../common/components/layout/appShell/AppShell";
import RequireAuth from "../common/components/auth/RequireAuth";
import SuppliersPage from "../pages/suppliers/page";

function App() {
  return (
    <Theme appearance="dark" accentColor="gold">
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <DashboardPage />
                </RequireAuth>
              }
            />
            <Route
              path="/products"
              element={
                <RequireAuth>
                  <ProductsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/categories"
              element={
                <RequireAuth>
                  <CategoriesPage />
                </RequireAuth>
              }
            />
            <Route
              path="/suppliers"
              element={
                <RequireAuth>
                  <SuppliersPage />
                </RequireAuth>
              }
            />
            <Route
              path="/purchase"
              element={
                <RequireAuth>
                  <PurchasePage mode="alis" />
                </RequireAuth>
              }
            />
            <Route
              path="/purchase/iade"
              element={
                <RequireAuth>
                  <PurchasePage mode="iade" />
                </RequireAuth>
              }
            />
            <Route
              path="/settings/kullanicilar"
              element={
                <RequireAuth>
                  <KullanicilarPage />
                </RequireAuth>
              }
            />
            <Route
              path="/settings/subeler"
              element={
                <RequireAuth>
                  <SubelerPage />
                </RequireAuth>
              }
            />
            <Route
              path="/kasalar"
              element={
                <RequireAuth>
                  <KassalarPage />
                </RequireAuth>
              }
            />
            <Route
              path="/maliyye/hesabat"
              element={
                <RequireAuth>
                  <MaliyyeHesabatPage />
                </RequireAuth>
              }
            />
            <Route
              path="/maliyye/gider-analizi"
              element={
                <RequireAuth>
                  <GiderAnaliziPage />
                </RequireAuth>
              }
            />
            <Route
              path="/maliyye/menfeet-zererler"
              element={
                <RequireAuth>
                  <MenfeetZererlerPage />
                </RequireAuth>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </Theme>
  );
}

export default App;
