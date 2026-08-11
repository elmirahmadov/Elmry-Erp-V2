import { FormEvent, useEffect, useState } from "react";
import SideDrawer from "../../../common/components/SideDrawer";
import {
  createWarehouse,
  fetchWarehouses,
  type Warehouse,
} from "../../../common/actions/admin.actions";

interface CompanyWarehousesDrawerProps {
  isOpen: boolean;
  companyId: number | null;
  companyName?: string;
  onClose: () => void;
}

export default function CompanyWarehousesDrawer({
  isOpen,
  companyId,
  companyName,
  onClose,
}: CompanyWarehousesDrawerProps) {
  const [items, setItems] = useState<Warehouse[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !companyId) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await fetchWarehouses(companyId);
        if (!cancelled) setItems(list);
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
    if (!companyId || !name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const created = await createWarehouse(name.trim(), companyId);
      setItems((prev) => [created, ...prev]);
      setName("");
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
      title={companyName ? `Anbarlar — ${companyName}` : "Anbarlar"}
      widthClassName="max-w-xl"
    >
      <form onSubmit={onSubmit} className="mb-4 flex gap-2">
        <input
          className="wv-input flex-1"
          placeholder="Yeni anbar adi"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={saving}
          className="shrink-0 rounded bg-success px-3 py-2 text-sm font-medium text-success-foreground hover:bg-success/90 disabled:opacity-50"
        >
          {saving ? "..." : "Ekle"}
        </button>
      </form>

      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted-foreground">Yukleniyor...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Henuz anbar yok.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead className="bg-secondary">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold">ID</th>
              <th className="px-3 py-2 text-left text-xs font-semibold">Ad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((w) => (
              <tr key={w.id} className="hover:bg-accent">
                <td className="px-3 py-2 text-sm">{w.id}</td>
                <td className="px-3 py-2 text-sm font-medium">{w.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </SideDrawer>
  );
}
