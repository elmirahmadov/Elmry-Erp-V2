"use client";

import { useLocation } from "react-router-dom";
import Sidebar from "../sidebar/sidebar";
import Header from "../header/Header";
import styles from "./appShell.module.css";

function resolveTitle(pathname: string): string {
  if (pathname.startsWith("/companies")) {
    return "Şirketler";
  }
  return "Admin";
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const pathname = location.pathname;

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.contentArea}>
        <Header title={resolveTitle(pathname)} />
        <main className={styles.pageContent}>{children}</main>
      </div>
    </div>
  );
}
