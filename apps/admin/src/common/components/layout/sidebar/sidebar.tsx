"use client";

import { Link, useLocation } from "react-router-dom";
import { FaBuilding } from "react-icons/fa";
import styles from "./sidebar.module.css";

const isActive = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`);

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}>
            <span />
            <span />
            <span />
            <span />
          </div>
          <span className={styles.logoText}>Logistra</span>
        </div>
      </div>

      <nav className={styles.nav}>
        <div className={styles.navItem}>
          <Link
            to="/companies"
            className={`${styles.navLink} ${
              isActive(location.pathname, "/companies")
                ? styles.navLinkActive
                : ""
            }`}
          >
            <span className={styles.navIcon}>
              <FaBuilding />
            </span>
            Şirketler
          </Link>
        </div>
      </nav>
    </div>
  );
}
