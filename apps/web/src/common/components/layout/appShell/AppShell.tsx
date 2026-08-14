"use client";

import { useLocation } from "react-router-dom";
import Sidebar from "../sidebar/sidebar";
import Header from "../header/Header";
import styles from "./appShell.module.css";

const headerTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/products": "Ürünler",
  "/categories": "Kategoriler",
  "/purchase": "Ürün Alış",
  "/purchase/iade": "Ürün İade",
  "/suppliers": "Tedarikçiler",
  "/customers": "Müştərilər",
  "/companies": "Şirketler",
  "/settings/kassa-ekle": "Kassa Ekle",
  "/settings/anbar-ekle": "Anbar Ekle",
  "/kasalar": "Kassalar",
  "/banklar": "Banklar",
  "/maliyye/hesabat": "Maliyyə Hesabatı",
  "/maliyye/gider-analizi": "Xərc Analizi",
  "/maliyye/menfeet-zererler": "Mənfəət & Zərər",
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const pathname = location.pathname;

  if (pathname === "/login" || pathname === "/pos" || pathname.startsWith("/pos/")) {
    return <>{children}</>;
  }

  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.contentArea}>
        <Header title={headerTitles[pathname] ?? "ERP"} />
        <main className={styles.pageContent}>{children}</main>
      </div>
    </div>
  );
}
