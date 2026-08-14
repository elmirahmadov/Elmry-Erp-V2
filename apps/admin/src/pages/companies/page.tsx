import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  FaCashRegister,
  FaEdit,
  FaStore,
  FaUniversity,
  FaWarehouse,
} from "react-icons/fa";
import CenterModal from "../../common/components/CenterModal";
import { Pagination } from "../../common/components/pagination";
import {
  fetchCompanies,
  setupCompany,
  type Company,
} from "../../common/actions/admin.actions";
import CompanyInfoDrawer from "./components/CompanyInfoDrawer";
import CompanyBranchesDrawer from "./components/CompanyBranchesDrawer";
import CompanyWarehousesDrawer from "./components/CompanyWarehousesDrawer";
import CompanyTillsDrawer from "./components/CompanyTillsDrawer";
import CompanyBanksDrawer from "./components/CompanyBanksDrawer";

const ITEMS_PER_PAGE = 20;

type DrawerKind = "info" | "branches" | "warehouses" | "tills" | "banks" | null;

const cellBase = "px-3 py-2 text-sm text-center whitespace-nowrap";
const thBase =
  "px-3 py-2 text-xs font-semibold text-foreground text-center whitespace-nowrap border-b border-border";

const actionBtn =
  "p-1 text-primary transition-colors hover:text-primary/80";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Resim okunamadi"));
    reader.readAsDataURL(file);
  });
}

const emptyForm = {
  name: "",
  ownerName: "",
  ownerSurname: "",
  phone: "",
  extraPhone: "",
  email: "",
  birthDate: "1990-01-01",
  imageUrl: "",
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [drawer, setDrawer] = useState<DrawerKind>(null);
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);

  const openDrawer = (kind: Exclude<DrawerKind, null>, company: Company) => {
    setActiveCompany(company);
    setDrawer(kind);
  };

  const closeDrawer = () => {
    setDrawer(null);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setCompanies(await fetchCompanies());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((c) => {
      const hay = [
        c.name,
        c.ownerName,
        c.ownerSurname,
        c.email,
        c.phone,
        c.extraPhone,
        String(c.id),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [companies, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await setupCompany({
        name: form.name.trim(),
        ownerName: form.ownerName.trim(),
        ownerSurname: form.ownerSurname.trim(),
        phone: form.phone.trim(),
        birthDate: form.birthDate,
        extraPhone: form.extraPhone.trim() || undefined,
        email: form.email.trim() || undefined,
        imageUrl: form.imageUrl || undefined,
      });
      setOpen(false);
      setForm(emptyForm);
      setSuccess("Sirket olusturuldu.");
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: "calc(100vh - var(--header-height))" }}
    >
      <div className="shrink-0">
        <div className="border-b border-border bg-card px-4 py-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Ad, sahip, email veya telefon ile ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-primary sm:w-80"
              />
            </div>
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded bg-success px-3 py-2 text-sm font-medium text-success-foreground hover:bg-success/90"
              >
                Olustur
              </button>
            </div>
          </div>
        </div>
        {error && (
          <p className="border-b border-border px-4 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        {success && (
          <p className="border-b border-border px-4 py-2 text-sm text-success">
            {success}
          </p>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Yukleniyor...
          </div>
        ) : (
          <table className="min-w-max w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-secondary">
              <tr>
                <th className={`${thBase} w-16`}>ID</th>
                <th className={`${thBase} w-24`}>Logo</th>
                <th className={`${thBase} w-52`}>Sirket Adi</th>
                <th className={`${thBase} w-40`}>Sahip</th>
                <th className={`${thBase} w-44`}>Email</th>
                <th className={`${thBase} w-36`}>Telefon</th>
                <th className={`${thBase} w-36`}>Ek No</th>
                <th className={`${thBase} w-40`}>Islem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-8 text-center text-sm text-muted-foreground"
                  >
                    {companies.length === 0
                      ? "Henuz sirket yok."
                      : "Arama sonucu bulunamadi."}
                  </td>
                </tr>
              ) : (
                paginated.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-accent">
                    <td className={`${cellBase} w-16`}>{c.id}</td>
                    <td className={`${cellBase} w-24`}>
                      {c.imageUrl ? (
                        <img
                          src={c.imageUrl}
                          alt={c.name}
                          className="inline-block h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td
                      className={`${cellBase} w-52 max-w-[208px] overflow-hidden text-ellipsis text-left font-medium text-card-foreground`}
                    >
                      {c.name}
                    </td>
                    <td className={`${cellBase} w-40`}>
                      {c.ownerName} {c.ownerSurname}
                    </td>
                    <td className={`${cellBase} w-44`}>{c.email || "-"}</td>
                    <td className={`${cellBase} w-36`}>{c.phone}</td>
                    <td className={`${cellBase} w-36`}>
                      {c.extraPhone || "-"}
                    </td>
                    <td className={`${cellBase} w-40`}>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openDrawer("info", c)}
                          className={actionBtn}
                          title="Bilgi"
                          aria-label="Bilgi"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDrawer("branches", c)}
                          className={actionBtn}
                          title="Şube"
                          aria-label="Şube"
                        >
                          <FaStore size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDrawer("warehouses", c)}
                          className={actionBtn}
                          title="Anbar"
                          aria-label="Anbar"
                        >
                          <FaWarehouse size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDrawer("tills", c)}
                          className={actionBtn}
                          title="Kassa"
                          aria-label="Kassa"
                        >
                          <FaCashRegister size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDrawer("banks", c)}
                          className={actionBtn}
                          title="Bank"
                          aria-label="Bank"
                        >
                          <FaUniversity size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="shrink-0">
        <Pagination
          currentPage={page}
          onPageChange={setCurrentPage}
          totalRows={filtered.length}
          totalPages={totalPages}
        />
      </div>

      <CompanyInfoDrawer
        isOpen={drawer === "info"}
        companyId={activeCompany?.id ?? null}
        onClose={closeDrawer}
        onSaved={(updated) => {
          setCompanies((prev) =>
            prev.map((item) => (item.id === updated.id ? updated : item)),
          );
          setActiveCompany(updated);
          setSuccess("Sirket bilgileri kaydedildi.");
        }}
      />
      <CompanyBranchesDrawer
        isOpen={drawer === "branches"}
        companyId={activeCompany?.id ?? null}
        companyName={activeCompany?.name}
        onClose={closeDrawer}
      />
      <CompanyWarehousesDrawer
        isOpen={drawer === "warehouses"}
        companyId={activeCompany?.id ?? null}
        companyName={activeCompany?.name}
        onClose={closeDrawer}
      />
      <CompanyTillsDrawer
        isOpen={drawer === "tills"}
        companyId={activeCompany?.id ?? null}
        companyName={activeCompany?.name}
        onClose={closeDrawer}
      />
      <CompanyBanksDrawer
        isOpen={drawer === "banks"}
        companyId={activeCompany?.id ?? null}
        companyName={activeCompany?.name}
        onClose={closeDrawer}
      />

      <CenterModal
        isOpen={open}
        title="Sirket Ac"
        onClose={() => setOpen(false)}
      >
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            className="wv-input"
            placeholder="Sirket adi *"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="wv-input"
              placeholder="Sahip adi *"
              value={form.ownerName}
              onChange={(e) =>
                setForm((f) => ({ ...f, ownerName: e.target.value }))
              }
              required
            />
            <input
              className="wv-input"
              placeholder="Sahip soyadi *"
              value={form.ownerSurname}
              onChange={(e) =>
                setForm((f) => ({ ...f, ownerSurname: e.target.value }))
              }
              required
            />
          </div>
          <input
            className="wv-input"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="wv-input"
              placeholder="Telefon *"
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              required
            />
            <input
              className="wv-input"
              placeholder="Ek numara"
              value={form.extraPhone}
              onChange={(e) =>
                setForm((f) => ({ ...f, extraPhone: e.target.value }))
              }
            />
          </div>
          <input
            className="wv-input"
            type="date"
            value={form.birthDate}
            onChange={(e) =>
              setForm((f) => ({ ...f, birthDate: e.target.value }))
            }
            required
          />
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Sirket resmi
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full text-sm"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const dataUrl = await fileToDataUrl(file);
                setForm((f) => ({ ...f, imageUrl: dataUrl }));
              }}
            />
            {form.imageUrl && (
              <img
                src={form.imageUrl}
                alt="Onizleme"
                className="mt-2 h-20 w-20 object-cover"
              />
            )}
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 border border-border py-2 text-sm"
            >
              Iptal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary py-2 text-sm text-primary-foreground disabled:opacity-50"
            >
              {saving ? "Kaydediliyor..." : "Olustur"}
            </button>
          </div>
        </form>
      </CenterModal>
    </div>
  );
}
