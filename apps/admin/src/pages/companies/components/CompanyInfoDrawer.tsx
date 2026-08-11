import { FormEvent, useEffect, useState } from "react";
import SideDrawer from "../../../common/components/SideDrawer";
import {
  fetchCompany,
  updateCompany,
  type Company,
} from "../../../common/actions/admin.actions";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Resim okunamadi"));
    reader.readAsDataURL(file);
  });
}

interface CompanyInfoDrawerProps {
  isOpen: boolean;
  companyId: number | null;
  onClose: () => void;
  onSaved: (company: Company) => void;
}

export default function CompanyInfoDrawer({
  isOpen,
  companyId,
  onClose,
  onSaved,
}: CompanyInfoDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    ownerName: "",
    ownerSurname: "",
    phone: "",
    extraPhone: "",
    email: "",
    birthDate: "1990-01-01",
    imageUrl: "",
  });

  useEffect(() => {
    if (!isOpen || !companyId) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const c = await fetchCompany(companyId);
        if (cancelled) return;
        setForm({
          name: c.name || "",
          ownerName: c.ownerName || "",
          ownerSurname: c.ownerSurname || "",
          phone: c.phone || "",
          extraPhone: c.extraPhone || "",
          email: c.email || "",
          birthDate: c.birthDate
            ? new Date(c.birthDate).toISOString().slice(0, 10)
            : "1990-01-01",
          imageUrl: c.imageUrl || "",
        });
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
  }, [isOpen, companyId]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateCompany(companyId, {
        name: form.name.trim(),
        ownerName: form.ownerName.trim(),
        ownerSurname: form.ownerSurname.trim(),
        phone: form.phone.trim(),
        birthDate: form.birthDate,
        extraPhone: form.extraPhone.trim() || undefined,
        email: form.email.trim() || undefined,
        imageUrl: form.imageUrl || undefined,
      });
      onSaved(updated);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Şirket Bilgileri"
      widthClassName="max-w-xl"
    >
      {loading ? (
        <p className="text-sm text-muted-foreground">Yukleniyor...</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <input
            className="wv-input"
            placeholder="Sirket adi"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="wv-input"
              placeholder="Sahip adi"
              value={form.ownerName}
              onChange={(e) =>
                setForm((f) => ({ ...f, ownerName: e.target.value }))
              }
              required
            />
            <input
              className="wv-input"
              placeholder="Sahip soyadi"
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
              placeholder="Telefon"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
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
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </form>
      )}
    </SideDrawer>
  );
}
