"use client";

import { Link, useLocation } from "react-router-dom";
import {
  FaChartLine,
  FaBox,
  FaAngleDown,
  FaCog,
  FaCashRegister,
  FaMoneyBillWave,
  FaChartBar,
  FaChartPie,
  FaBalanceScale,
  FaClipboardList,
  FaUsers,
  FaStore,
} from "react-icons/fa";
import { useEffect, useState, type ReactNode } from "react";
import styles from "./sidebar.module.css";

const REPORT_PATHS = [
  "/maliyye/hesabat",
  "/maliyye/gider-analizi",
  "/maliyye/menfeet-zererler",
];

const isReportPath = (pathname: string) =>
  REPORT_PATHS.some((path) => pathname.startsWith(path));

const isActive = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`);

function SubMenu({
  open,
  children,
}: {
  open: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`${styles.subMenu} ${open ? styles.subMenuOpen : ""}`}
      aria-hidden={!open}
    >
      <div className={styles.subMenuInner}>{children}</div>
    </div>
  );
}

function subClass(pathname: string, path: string) {
  return `${styles.subItem} ${
    isActive(pathname, path) ? styles.subItemActive : ""
  }`;
}

export default function Sidebar() {
  const location = useLocation();
  const [productsOpen, setProductsOpen] = useState(
    location.pathname.startsWith("/products") ||
      location.pathname.startsWith("/categories") ||
      location.pathname.startsWith("/purchase"),
  );
  const [maliyyeOpen, setMaliyyeOpen] = useState(
    location.pathname.startsWith("/kasalar"),
  );
  const [hesabatOpen, setHesabatOpen] = useState(isReportPath(location.pathname));
  const [settingsOpen, setSettingsOpen] = useState(
    location.pathname.startsWith("/settings"),
  );

  useEffect(() => {
    if (location.pathname.startsWith("/settings")) {
      setSettingsOpen(true);
    }
    if (
      location.pathname.startsWith("/products") ||
      location.pathname.startsWith("/categories") ||
      location.pathname.startsWith("/purchase")
    ) {
      setProductsOpen(true);
    }
    if (location.pathname.startsWith("/kasalar")) {
      setMaliyyeOpen(true);
    }
    if (isReportPath(location.pathname)) {
      setHesabatOpen(true);
    }
  }, [location.pathname]);

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
            to="/dashboard"
            className={`${styles.navLink} ${
              isActive(location.pathname, "/dashboard")
                ? styles.navLinkActive
                : ""
            }`}
          >
            <span className={styles.navIcon}>
              <FaChartLine />
            </span>
            Dashboard
          </Link>
        </div>

        <div className={styles.navItem}>
          <button
            type="button"
            className={`${styles.navLink} ${styles.navToggle}`}
            onClick={() => setProductsOpen((prev) => !prev)}
            aria-expanded={productsOpen}
          >
            <span className={styles.navToggleLabel}>
              <span className={styles.navIcon}>
                <FaBox />
              </span>
              Ürünler
            </span>
            <span
              className={`${styles.navChevron} ${
                productsOpen ? styles.navChevronOpen : ""
              }`}
            >
              <FaAngleDown />
            </span>
          </button>

          <SubMenu open={productsOpen}>
            <Link to="/products" className={subClass(location.pathname, "/products")}>
              Ürün Listesi
            </Link>
            <Link
              to="/categories"
              className={subClass(location.pathname, "/categories")}
            >
              Kategoriler
            </Link>
            <Link
              to="/purchase"
              className={`${styles.subItem} ${
                location.pathname === "/purchase" ? styles.subItemActive : ""
              }`}
            >
              Ürün Alış
            </Link>
            <Link
              to="/purchase/iade"
              className={subClass(location.pathname, "/purchase/iade")}
            >
              Ürün İade
            </Link>
          </SubMenu>
        </div>

        <div className={styles.navItem}>
          <Link
            to="/suppliers"
            className={`${styles.navLink} ${
              isActive(location.pathname, "/suppliers")
                ? styles.navLinkActive
                : ""
            }`}
          >
            <span className={styles.navIcon}>
              <FaBox />
            </span>
            Tedarikçiler
          </Link>
        </div>

        <div className={styles.navItem}>
          <button
            type="button"
            className={`${styles.navLink} ${styles.navToggle}`}
            onClick={() => setMaliyyeOpen((prev) => !prev)}
            aria-expanded={maliyyeOpen}
          >
            <span className={styles.navToggleLabel}>
              <span className={styles.navIcon}>
                <FaMoneyBillWave />
              </span>
              Maliyyə
            </span>
            <span
              className={`${styles.navChevron} ${
                maliyyeOpen ? styles.navChevronOpen : ""
              }`}
            >
              <FaAngleDown />
            </span>
          </button>

          <SubMenu open={maliyyeOpen}>
            <Link to="/kasalar" className={subClass(location.pathname, "/kasalar")}>
              <span className={styles.navIcon}>
                <FaCashRegister />
              </span>
              Kassalar
            </Link>
          </SubMenu>
        </div>

        <div className={styles.navItem}>
          <button
            type="button"
            className={`${styles.navLink} ${styles.navToggle}`}
            onClick={() => setHesabatOpen((prev) => !prev)}
            aria-expanded={hesabatOpen}
          >
            <span className={styles.navToggleLabel}>
              <span className={styles.navIcon}>
                <FaClipboardList />
              </span>
              Hesabat
            </span>
            <span
              className={`${styles.navChevron} ${
                hesabatOpen ? styles.navChevronOpen : ""
              }`}
            >
              <FaAngleDown />
            </span>
          </button>

          <SubMenu open={hesabatOpen}>
            <Link
              to="/maliyye/hesabat"
              className={subClass(location.pathname, "/maliyye/hesabat")}
            >
              <span className={styles.navIcon}>
                <FaChartBar />
              </span>
              Maliyyə Hesabatı
            </Link>
            <Link
              to="/maliyye/gider-analizi"
              className={subClass(location.pathname, "/maliyye/gider-analizi")}
            >
              <span className={styles.navIcon}>
                <FaChartPie />
              </span>
              Xərc Analizi
            </Link>
            <Link
              to="/maliyye/menfeet-zererler"
              className={subClass(
                location.pathname,
                "/maliyye/menfeet-zererler",
              )}
            >
              <span className={styles.navIcon}>
                <FaBalanceScale />
              </span>
              Mənfəət & Zərər
            </Link>
          </SubMenu>
        </div>

        <div className={styles.navItem}>
          <button
            type="button"
            className={`${styles.navLink} ${styles.navToggle}`}
            onClick={() => setSettingsOpen((prev) => !prev)}
            aria-expanded={settingsOpen}
          >
            <span className={styles.navToggleLabel}>
              <span className={styles.navIcon}>
                <FaCog />
              </span>
              Ayarlar
            </span>
            <span
              className={`${styles.navChevron} ${
                settingsOpen ? styles.navChevronOpen : ""
              }`}
            >
              <FaAngleDown />
            </span>
          </button>

          <SubMenu open={settingsOpen}>
            <Link
              to="/settings/kullanicilar"
              className={subClass(location.pathname, "/settings/kullanicilar")}
            >
              <span className={styles.navIcon}>
                <FaUsers />
              </span>
              Kullanicilar
            </Link>
            <Link
              to="/settings/subeler"
              className={subClass(location.pathname, "/settings/subeler")}
            >
              <span className={styles.navIcon}>
                <FaStore />
              </span>
              Subeler
            </Link>
          </SubMenu>
        </div>
      </nav>
    </div>
  );
}
