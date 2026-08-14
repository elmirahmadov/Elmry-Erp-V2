"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiUsers } from "react-icons/fi";
import { useAuth } from "../../common/contexts/AuthContext";
import {
  fetchProducts,
  searchProducts,
  type ProductRecord,
} from "../../common/actions/products.actions";
import { fetchAllCategories, type CategoryRecord } from "../../common/actions/categories.actions";
import { createTillTransaction } from "../../common/actions/tills.actions";
import { createBankTransaction } from "../../common/actions/banks.actions";
import {
  addCustomerDebt,
  addCustomerPaidSale,
  fetchCustomers,
} from "../../common/actions/customers.actions";
import {
  getRetailCustomer,
  isRetailCustomer,
  RETAIL_CUSTOMER_ID,
  toPosCustomers,
  type PosCustomer,
} from "../../common/utils/posCustomers";
import styles from "./pos.module.css";

type CartLine = {
  productId: number;
  name: string;
  imageUrl?: string | null;
  unitPrice: number;
  quantity: number;
  stockUnit: string;
};

type PayMode = "cash" | "card" | "split" | "credit";

type PosWorkspace = {
  branchId: number;
  tillId: number;
  warehouseId: number;
  bankId?: number;
  branchName?: string;
  tillName?: string;
  warehouseName?: string;
  bankName?: string;
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export default function PosPage() {
  const { user, refreshSession, isLoading: authLoading } = useAuth();
  const companyId = user?.companyId;
  const searchRef = useRef<HTMLInputElement>(null);
  const refreshedRef = useRef(false);

  const prefs = useMemo<PosWorkspace | null>(() => {
    if (
      !user?.posBranchId ||
      !user?.posTillId ||
      !user?.posWarehouseId
    ) {
      return null;
    }
    return {
      branchId: user.posBranchId,
      tillId: user.posTillId,
      warehouseId: user.posWarehouseId,
      bankId: user.posBankId || undefined,
      branchName: user.posBranchName || undefined,
      tillName: user.posTillName || undefined,
      warehouseName: user.posWarehouseName || undefined,
      bankName: user.posBankName || undefined,
    };
  }, [user]);

  // Bir kez DB-də təyin edilibsə, köhnə sessiyanı yenilə — yenidən soruşmasın
  useEffect(() => {
    if (authLoading || !user || prefs || refreshedRef.current) return;
    refreshedRef.current = true;
    void refreshSession();
  }, [authLoading, user, prefs, refreshSession]);

  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<number | "all">(
    "all",
  );
  const [selectedSubId, setSelectedSubId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<ProductRecord[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"success" | "error">("success");
  const [busy, setBusy] = useState(false);

  const [customers, setCustomers] = useState<PosCustomer[]>([]);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customerModalQuery, setCustomerModalQuery] = useState("");

  const [payOpen, setPayOpen] = useState(false);
  const [payMode, setPayMode] = useState<PayMode>("cash");
  const [cashAmount, setCashAmount] = useState("");
  const [cardAmount, setCardAmount] = useState("");

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(null), 2800);
    return () => window.clearTimeout(timer);
  }, [message]);

  const showPopup = (text: string, tone: "success" | "error" = "success") => {
    setMessageTone(tone);
    setMessage(text);
  };

  useEffect(() => {
    if (!companyId) return;
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchCustomers(companyId);
        if (cancelled) return;
        const next = toPosCustomers(list);
        setCustomers(next);
        setCustomerId(RETAIL_CUSTOMER_ID);
      } catch {
        if (cancelled) return;
        setCustomers([getRetailCustomer()]);
        setCustomerId(RETAIL_CUSTOMER_ID);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  useEffect(() => {
    if (!companyId) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [productList, categoryList] = await Promise.all([
          fetchProducts(companyId),
          fetchAllCategories(companyId),
        ]);
        if (cancelled) return;
        setProducts(productList.filter((p) => p.isActive !== false));
        setCategories(categoryList);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  const parentCategories = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories],
  );

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedSubId != null) {
        return (
          p.subCategoryId === selectedSubId ||
          p.parentCategoryId === selectedSubId
        );
      }
      if (selectedParentId === "all") return true;
      const inParent = p.parentCategoryId === selectedParentId;
      const inChild = categories.some(
        (c) =>
          c.parentId === selectedParentId &&
          (p.subCategoryId === c.id || p.parentCategoryId === c.id),
      );
      return inParent || inChild;
    });
  }, [products, selectedParentId, selectedSubId, categories]);

  // Axtarış: yazı dayandıqdan 1 saniyə sonra API
  useEffect(() => {
    if (!companyId) return;
    const q = search.trim();
    if (!q) {
      setSearchResults([]);
      setSearchOpen(false);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const list = await searchProducts(companyId, { q });
          setSearchResults(list.filter((p) => p.isActive !== false));
          setSearchOpen(true);
        } catch (e) {
          showPopup((e as Error).message, "error");
          setSearchResults([]);
          setSearchOpen(true);
        } finally {
          setSearchLoading(false);
        }
      })();
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [search, companyId]);

  // Müştəri yalnız modaldan seçilir

  const selectedCustomer = customers.find((c) => c.id === customerId) ?? null;

  const modalCustomerList = useMemo(() => {
    const q = customerModalQuery.trim().toLowerCase();
    const list = [...customers].sort((a, b) => {
      if (isRetailCustomer(a)) return -1;
      if (isRetailCustomer(b)) return 1;
      return a.name.localeCompare(b.name, "tr");
    });
    if (!q) return list;
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.toLowerCase().includes(q)),
    );
  }, [customers, customerModalQuery]);

  const pickCustomer = (customer: PosCustomer | null) => {
    const next = customer ?? getRetailCustomer();
    setCustomerId(next.id);
    setCustomerModalOpen(false);
  };

  const openCustomerModal = () => {
    setCustomerModalQuery("");
    setCustomerModalOpen(true);
  };

  const warehouseQty = (product: ProductRecord) => {
    if (prefs?.warehouseId != null && product.warehouseStocks?.length) {
      const row = product.warehouseStocks.find(
        (w) => w.warehouseId === prefs.warehouseId,
      );
      if (row) return row.quantity;
    }
    if (prefs?.branchId != null && product.branchStocks?.length) {
      const row = product.branchStocks.find((b) => b.branchId === prefs.branchId);
      if (row) return row.quantity;
    }
    return (
      product.branchStockQuantity ??
      product.companyStockQuantity ??
      product.stockQuantity ??
      0
    );
  };

  const addToCart = (product: ProductRecord) => {
    setMessage(null);
    setCart((prev) => {
      const existing = prev.find((line) => line.productId === product.id);
      if (existing) {
        return prev.map((line) =>
          line.productId === product.id
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name?.trim() || `Məhsul #${product.id}`,
          imageUrl: product.imageUrl,
          unitPrice: Number(product.salePrice) || 0,
          quantity: 1,
          stockUnit: product.stockUnit || "adet",
        },
      ];
    });
  };

  const pickSearchProduct = (product: ProductRecord) => {
    addToCart(product);
    setSearch("");
    setSearchResults([]);
    setSearchOpen(false);
    searchRef.current?.focus();
  };

  const changeQty = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((line) =>
          line.productId === productId
            ? { ...line, quantity: line.quantity + delta }
            : line,
        )
        .filter((line) => line.quantity > 0),
    );
  };

  const removeLine = (productId: number) => {
    setCart((prev) => prev.filter((line) => line.productId !== productId));
  };

  const total = cart.reduce(
    (sum, line) => sum + line.unitPrice * line.quantity,
    0,
  );
  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setSearchOpen(false);
      return;
    }
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (searchResults.length === 1) {
      pickSearchProduct(searchResults[0]);
      return;
    }
    const q = search.trim().toLowerCase();
    if (!q) return;
    const exact = searchResults.find(
      (p) =>
        p.barcode?.toLowerCase() === q ||
        String(p.id) === q ||
        p.name?.toLowerCase() === q,
    );
    if (exact) pickSearchProduct(exact);
  };

  const openPay = (mode: PayMode) => {
    if (!cart.length) return;
    if (!prefs) {
      showPopup("İstifadəçinin POS iş məkanı təyin edilməyib.", "error");
      return;
    }
    if (mode === "credit" && isRetailCustomer(selectedCustomer)) {
      showPopup("Açıq hesab üçün pərakəndədən başqa müştəri seçin.", "error");
      return;
    }
    setPayMode(mode);
    if (mode === "split") {
      const half = Math.floor(total * 50) / 100;
      setCashAmount(String(half));
      setCardAmount(String(Number((total - half).toFixed(2))));
    } else {
      setCashAmount(String(total));
      setCardAmount(String(total));
    }
    setPayOpen(true);
    setMessage(null);
  };

  const completeSale = async () => {
    if (!companyId || !prefs || !cart.length) return;
    setBusy(true);
    setMessage(null);
    try {
      const descBase = `POS satış · ${itemCount} məhsul · ${
        selectedCustomer?.name || "Pərakəndə"
      }`;

      if (payMode === "credit") {
        if (!customerId || isRetailCustomer(selectedCustomer)) {
          throw new Error("Açıq hesab üçün müştəri seçin");
        }
        await addCustomerDebt(customerId, companyId, total);
        const refreshed = await fetchCustomers(companyId);
        setCustomers(toPosCustomers(refreshed));
        showPopup(
          `Açıq hesab: ${selectedCustomer?.name} +${formatMoney(total)} ₼ borc. Kassaya düşmədi.`,
        );
      } else if (payMode === "cash") {
        await createTillTransaction(prefs.tillId, {
          companyId,
          type: "medaxil",
          amount: total,
          description: descBase,
          counterpartyType: "customer",
          counterpartyId: customerId ?? undefined,
          counterpartyName: selectedCustomer?.name,
          paymentMethod: "Nağd",
          category: "POS Satış",
        });
        if (customerId && !isRetailCustomer(selectedCustomer)) {
          await addCustomerPaidSale(customerId, companyId, total);
        }
        showPopup(`Nağd ödəniş kassaya yazıldı: ${formatMoney(total)} ₼`);
      } else if (payMode === "card") {
        if (!prefs.bankId) {
          throw new Error(
            "Kart ödənişi üçün istifadəçiyə bank hesabı təyin edin (Ayarlar → Kullanıcılar).",
          );
        }
        await createBankTransaction(prefs.bankId, {
          companyId,
          type: "medaxil",
          amount: total,
          description: descBase,
          counterpartyType: "customer",
          counterpartyId: customerId ?? undefined,
          counterpartyName: selectedCustomer?.name,
          paymentMethod: "Kart",
          category: "POS Satış",
        });
        if (customerId && !isRetailCustomer(selectedCustomer)) {
          await addCustomerPaidSale(customerId, companyId, total);
        }
        showPopup(`Kart ödənişi banka yazıldı: ${formatMoney(total)} ₼`);
      } else {
        const cash = Number(cashAmount) || 0;
        const card = Number(cardAmount) || 0;
        if (Math.abs(cash + card - total) > 0.02) {
          throw new Error("Nağd + kart cəmi satış məbləğinə bərabər olmalıdır.");
        }
        if (card > 0 && !prefs.bankId) {
          throw new Error(
            "Kart hissəsi üçün istifadəçiyə bank hesabı təyin edin (Ayarlar → Kullanıcılar).",
          );
        }
        if (cash > 0) {
          await createTillTransaction(prefs.tillId, {
            companyId,
            type: "medaxil",
            amount: cash,
            description: `${descBase} (nağd hissə)`,
            counterpartyType: "customer",
            counterpartyId: customerId ?? undefined,
            counterpartyName: selectedCustomer?.name,
            paymentMethod: "Nağd",
            category: "POS Satış",
          });
        }
        if (card > 0 && prefs.bankId) {
          await createBankTransaction(prefs.bankId, {
            companyId,
            type: "medaxil",
            amount: card,
            description: `${descBase} (kart hissə)`,
            counterpartyType: "customer",
            counterpartyId: customerId ?? undefined,
            counterpartyName: selectedCustomer?.name,
            paymentMethod: "Kart",
            category: "POS Satış",
          });
        }
        if (customerId && !isRetailCustomer(selectedCustomer)) {
          await addCustomerPaidSale(customerId, companyId, total);
        }
        showPopup(
          `Bölünmüş ödəniş: ${formatMoney(cash)} ₼ nağd (kassa) + ${formatMoney(card)} ₼ kart (bank)`,
        );
      }

      setCart([]);
      setPayOpen(false);
      pickCustomer(null);
    } catch (e) {
      showPopup((e as Error).message, "error");
    } finally {
      setBusy(false);
    }
  };

  if (!prefs) {
    return (
      <div className={styles.gate}>
        <div className={styles.gateCard}>
          <h1>POS iş məkanı təyin edilməyib</h1>
          <p>
            Hızlı Satış üçün şube, anbar və kassa bir dəfə istifadəçi kartında
            seçilməlidir. Sonra artıq soruşulmur.
          </p>
          <div className={styles.gateActions}>
            <Link to="/settings/kullanicilar" className={styles.gatePrimary}>
              Kullanıcılara keç
            </Link>
            <button
              type="button"
              className={styles.gateSecondary}
              onClick={() => {
                refreshedRef.current = false;
                void refreshSession();
              }}
            >
              Yenilə
            </button>
            <Link to="/dashboard" className={styles.gateSecondary}>
              ERP-yə qayıt
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pos}>
      <header className={styles.topBar}>
        <div className={styles.searchWrap}>
          <input
            className={`${styles.search} ${styles.customerSearchInput}`}
            type="text"
            readOnly
            placeholder="Müştəri seçmək üçün klikləyin"
            value={selectedCustomer?.name || "Pərakəndə Satış"}
            onClick={openCustomerModal}
            onFocus={(e) => e.currentTarget.blur()}
            autoComplete="off"
          />
          <button
            type="button"
            className={styles.customerIconBtn}
            title="Müştəri seç"
            onClick={openCustomerModal}
          >
            <FiUsers size={16} />
          </button>
          {customerId != null && !isRetailCustomer(selectedCustomer) ? (
            <button
              type="button"
              className={styles.clearPickCustomer}
              title="Pərakəndəyə qayıt"
              onClick={() => pickCustomer(null)}
            >
              ×
            </button>
          ) : null}
        </div>

        <div className={styles.searchWrap}>
          <input
            ref={searchRef}
            className={styles.search}
            type="text"
            placeholder="Ad, kod və ya barkod — 1 sn sonra axtarılır"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (e.target.value.trim()) setSearchOpen(true);
            }}
            onFocus={() => {
              if (search.trim() && searchResults.length) setSearchOpen(true);
            }}
            onBlur={() => {
              window.setTimeout(() => setSearchOpen(false), 180);
            }}
            onKeyDown={onSearchKeyDown}
            autoComplete="off"
          />
          {searchOpen && search.trim() ? (
            <div className={styles.searchDropdown} role="listbox">
              {searchLoading ? (
                <div className={styles.searchEmpty}>Axtarılır…</div>
              ) : searchResults.length === 0 ? (
                <div className={styles.searchEmpty}>Nəticə yoxdur</div>
              ) : (
                searchResults.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    className={styles.searchItem}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pickSearchProduct(product)}
                  >
                    <div className={styles.searchThumb}>
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt=""
                          className={styles.searchImg}
                        />
                      ) : (
                        <span className={styles.searchImgFallback}>
                          {(product.name || "?").slice(0, 1).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className={styles.searchMeta}>
                      <span className={styles.searchName}>
                        {product.name?.trim() || `Məhsul #${product.id}`}
                      </span>
                      <span className={styles.searchSub}>
                        {product.barcode || `#${product.id}`} ·{" "}
                        {formatMoney(Number(product.salePrice) || 0)} ₼
                      </span>
                    </div>
                    <span className={styles.searchStock}>
                      {warehouseQty(product)} {product.stockUnit || "əd"}
                    </span>
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.mainStage}>
          <aside className={styles.categoryPanel}>
            <div className={styles.categoryPanelTitle}>Kateqoriyalar</div>
            <div className={styles.categoryScroll}>
              <button
                type="button"
                className={`${styles.catItem} ${
                  selectedParentId === "all" && !search.trim()
                    ? styles.catItemActive
                    : ""
                }`}
                onClick={() => {
                  setSelectedParentId("all");
                  setSelectedSubId(null);
                  setSearch("");
                }}
              >
                Hamısı
              </button>
              {parentCategories.map((cat) => {
                const open = selectedParentId === cat.id && !search.trim();
                const children = categories.filter((c) => c.parentId === cat.id);
                return (
                  <div key={cat.id} className={styles.catGroup}>
                    <button
                      type="button"
                      className={`${styles.catItem} ${
                        open && selectedSubId == null ? styles.catItemActive : ""
                      }`}
                      onClick={() => {
                        setSelectedParentId(cat.id);
                        setSelectedSubId(null);
                        setSearch("");
                      }}
                    >
                      <span>{cat.name}</span>
                      {children.length > 0 ? (
                        <span className={styles.catCount}>{children.length}</span>
                      ) : null}
                    </button>
                    {open && children.length > 0 ? (
                      <div className={styles.subList}>
                        {children.map((sub) => (
                          <button
                            key={sub.id}
                            type="button"
                            className={`${styles.subItem} ${
                              selectedSubId === sub.id
                                ? styles.subItemActive
                                : ""
                            }`}
                            onClick={() => {
                              setSelectedSubId(sub.id);
                              setSearch("");
                            }}
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </aside>

          <section className={styles.productStage}>
            <div className={styles.productStageHead}>
              <span>
                {loading
                  ? "Yüklənir…"
                  : error
                    ? error
                    : `${filteredProducts.length} məhsul`}
              </span>
            </div>
            <div className={styles.grid}>
              {!loading && filteredProducts.length === 0 ? (
                <div className={styles.empty}>
                  Bu kateqoriyada məhsul yoxdur.
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    className={styles.productCard}
                    onClick={() => addToCart(product)}
                  >
                    <div className={styles.productThumb}>
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt=""
                          className={styles.productImg}
                        />
                      ) : (
                        <span className={styles.productImgFallback}>
                          {(product.name || "?").slice(0, 1).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className={styles.productName}>
                      {product.name?.trim() || `Məhsul #${product.id}`}
                    </span>
                    <span className={styles.productPrice}>
                      {formatMoney(Number(product.salePrice) || 0)} ₼
                    </span>
                  </button>
                ))
              )}
            </div>
          </section>
        </div>

        <aside className={styles.cart}>
          <div className={styles.cartHeader}>
            Səbət {itemCount > 0 ? `(${itemCount})` : ""}
            {selectedCustomer ? (
              <span className={styles.cartCustomerTag}>
                {selectedCustomer.name}
              </span>
            ) : null}
          </div>

          <div className={styles.cartList}>
            {cart.length === 0 ? (
              <div className={styles.empty}>
                Kateqoriyadan məhsul seçin və ya barkod oxudun.
              </div>
            ) : (
              cart.map((line) => (
                <div key={line.productId} className={styles.cartRow}>
                  <div className={styles.cartThumb}>
                    {line.imageUrl ? (
                      <img
                        src={line.imageUrl}
                        alt=""
                        className={styles.cartImg}
                      />
                    ) : (
                      <span className={styles.cartImgFallback}>
                        {(line.name || "?").slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className={styles.cartInfo}>
                    <div className={styles.cartName}>{line.name}</div>
                    <div className={styles.cartLineMeta}>
                      {formatMoney(line.unitPrice)} ₼ ·{" "}
                      {formatMoney(line.unitPrice * line.quantity)} ₼
                    </div>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => removeLine(line.productId)}
                    >
                      Sil
                    </button>
                  </div>
                  <div className={styles.qtyControls}>
                    <button
                      type="button"
                      className={styles.qtyBtn}
                      onClick={() => changeQty(line.productId, -1)}
                    >
                      −
                    </button>
                    <span className={styles.qtyValue}>{line.quantity}</span>
                    <button
                      type="button"
                      className={styles.qtyBtn}
                      onClick={() => changeQty(line.productId, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className={styles.cartFooter}>
            <div className={styles.totalRow}>
              <span>Cəmi</span>
              <span className={styles.totalValue}>{formatMoney(total)} ₼</span>
            </div>

            <div className={styles.payGrid}>
              <button
                type="button"
                className={styles.payCash}
                disabled={!cart.length}
                onClick={() => openPay("cash")}
              >
                Nağd
              </button>
              <button
                type="button"
                className={styles.payCard}
                disabled={!cart.length}
                onClick={() => openPay("card")}
              >
                Kart
              </button>
              <button
                type="button"
                className={styles.paySplit}
                disabled={!cart.length}
                onClick={() => openPay("split")}
              >
                İkisi
              </button>
              <button
                type="button"
                className={styles.payCredit}
                disabled={!cart.length}
                onClick={() => openPay("credit")}
              >
                Açıq hesab
              </button>
            </div>

            <button
              type="button"
              className={styles.clearBtn}
              disabled={!cart.length}
              onClick={() => {
                setCart([]);
                setMessage(null);
              }}
            >
              Səbəti təmizlə
            </button>
          </div>
        </aside>
      </div>

      {payOpen ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <h2>
              {payMode === "cash" && "Nağd ödəniş"}
              {payMode === "card" && "Kart ödənişi"}
              {payMode === "split" && "Nağd + Kart"}
              {payMode === "credit" && "Açıq hesab"}
            </h2>
            <p className={styles.modalLead}>
              Cəmi <strong>{formatMoney(total)} ₼</strong>
              {selectedCustomer ? (
                <>
                  {" "}
                  · {selectedCustomer.name}
                </>
              ) : null}
            </p>

            {payMode === "credit" ? (
              <p className={styles.modalNote}>
                Bu satış heç bir kassaya yazılmır. Məbləğ müştərinin borcuna
                əlavə olunur.
              </p>
            ) : (
              <p className={styles.modalNote}>
                {payMode === "card"
                  ? (
                    <>
                      Kart ödənişi{" "}
                      <strong>{prefs.bankName || "seçilmiş bank"}</strong>
                      a medaxil kimi düşəcək.
                    </>
                  )
                  : payMode === "split"
                    ? (
                      <>
                        Nağd →{" "}
                        <strong>{prefs.tillName || "kassa"}</strong>, kart →{" "}
                        <strong>{prefs.bankName || "bank"}</strong>.
                      </>
                    )
                    : (
                      <>
                        Pul{" "}
                        <strong>{prefs.tillName || "seçilmiş kassa"}</strong>ya
                        medaxil kimi düşəcək.
                      </>
                    )}{" "}
                Stok çıxışı anbar:{" "}
                <strong>{prefs.warehouseName || prefs.warehouseId}</strong>.
              </p>
            )}

            {payMode === "split" ? (
              <div className={styles.splitFields}>
                <label>
                  Nağd
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={cashAmount}
                    onChange={(e) => {
                      setCashAmount(e.target.value);
                      const cash = Number(e.target.value) || 0;
                      setCardAmount(String(Math.max(0, Number((total - cash).toFixed(2)))));
                    }}
                  />
                </label>
                <label>
                  Kart
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={cardAmount}
                    onChange={(e) => {
                      setCardAmount(e.target.value);
                      const card = Number(e.target.value) || 0;
                      setCashAmount(String(Math.max(0, Number((total - card).toFixed(2)))));
                    }}
                  />
                </label>
              </div>
            ) : null}

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.ghostBtn}
                disabled={busy}
                onClick={() => setPayOpen(false)}
              >
                Ləğv
              </button>
              <button
                type="button"
                className={styles.confirmBtn}
                disabled={busy}
                onClick={() => void completeSale()}
              >
                {busy ? "Yazılır…" : "Təsdiqlə"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {customerModalOpen ? (
        <div
          className={styles.modalOverlay}
          onClick={() => setCustomerModalOpen(false)}
        >
          <div
            className={styles.customerModal}
            role="dialog"
            aria-modal="true"
            aria-label="Müştəri seç"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.customerModalHeader}>
              <h3>Müştəri seç</h3>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setCustomerModalOpen(false)}
                aria-label="Bağla"
              >
                ×
              </button>
            </div>
            <input
              className={styles.customerModalSearch}
              type="text"
              placeholder="Ad və ya telefon axtar…"
              value={customerModalQuery}
              onChange={(e) => setCustomerModalQuery(e.target.value)}
              autoFocus
            />
            <div className={styles.customerModalList}>
              {modalCustomerList.length === 0 ? (
                <div className={styles.searchEmpty}>Müştəri tapılmadı</div>
              ) : (
                modalCustomerList.map((c) => {
                  const active = customerId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className={`${styles.customerModalItem} ${
                        active ? styles.customerModalItemActive : ""
                      }`}
                      onClick={() => pickCustomer(c)}
                    >
                      <div className={styles.searchThumb}>
                        <span className={styles.searchImgFallback}>
                          {c.name.slice(0, 1).toUpperCase()}
                        </span>
                      </div>
                      <div className={styles.searchMeta}>
                        <span className={styles.searchName}>{c.name}</span>
                        <span className={styles.searchSub}>
                          {isRetailCustomer(c)
                            ? "Standart POS müştərisi"
                            : c.phone || "Telefon yoxdur"}
                        </span>
                      </div>
                      {c.debt > 0 ? (
                        <span className={styles.searchStock}>
                          borc {formatMoney(c.debt)} ₼
                        </span>
                      ) : (
                        <span className={styles.searchStockMuted}>—</span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : null}

      {message ? (
        <div
          className={styles.toastOverlay}
          onClick={() => setMessage(null)}
          role="status"
          aria-live="polite"
        >
          <div
            className={`${styles.toastPopup} ${
              messageTone === "error" ? styles.toastError : styles.toastSuccess
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <p className={styles.toastText}>{message}</p>
            <button
              type="button"
              className={styles.toastClose}
              onClick={() => setMessage(null)}
              aria-label="Bağla"
            >
              ×
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
