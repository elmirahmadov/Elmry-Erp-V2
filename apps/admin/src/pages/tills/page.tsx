import { FormEvent, useEffect, useState } from "react";
import {
  createTill,
  fetchCompanies,
  fetchTills,
  type Company,
  type Till,
} from "../../common/actions/admin.actions";

export default function TillsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [tills, setTills] = useState<Till[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const list = await fetchCompanies();
        setCompanies(list);
        setCompanyId(list[0]?.id ?? null);
      } catch (e) {
        setError((e as Error).message);
      }
    })();
  }, []);

  useEffect(() => {
    if (!companyId) {
      setTills([]);
      return;
    }
    void (async () => {
      setLoading(true);
      try {
        setTills(await fetchTills(companyId));
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [companyId]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!companyId || !name.trim()) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const created = await createTill(name.trim(), companyId);
      setTills((prev) => [created, ...prev]);
      setName("");
      setSuccess("Kassa olusturuldu. Sube atamasi ERP > Subeler'den yapilir.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Kasalar</h1>
        <p className="text-sm text-muted-foreground">
          Sirkete bagli bagimsiz kassa olusturun.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3 border border-border bg-card p-4">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Sirket</label>
          <select
            className="min-w-[220px] border border-border bg-secondary px-3 py-2 text-sm"
            value={companyId ?? ""}
            onChange={(e) => setCompanyId(Number(e.target.value))}
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Kassa adi</label>
            <input
              className="border border-border bg-secondary px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={saving || !companyId}
            className="bg-success px-3 py-2 text-sm text-success-foreground disabled:opacity-50"
          >
            {saving ? "Ekleniyor..." : "Kassa Ekle"}
          </button>
        </form>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-success">{success}</p>}

      <div className="overflow-auto border border-border bg-card">
        {loading ? (
          <p className="p-6 text-sm text-muted-foreground">Yukleniyor...</p>
        ) : (
          <table className="w-full min-w-[640px] border-collapse">
            <thead className="bg-secondary">
              <tr>
                <th className="px-3 py-2 text-left text-xs">ID</th>
                <th className="px-3 py-2 text-left text-xs">Ad</th>
                <th className="px-3 py-2 text-left text-xs">Bakiye</th>
                <th className="px-3 py-2 text-left text-xs">Bagli Subeler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tills.map((t) => (
                <tr key={t.id} className="hover:bg-accent">
                  <td className="px-3 py-2 text-sm">{t.id}</td>
                  <td className="px-3 py-2 text-sm font-medium">{t.name}</td>
                  <td className="px-3 py-2 text-sm">{t.balance}</td>
                  <td className="px-3 py-2 text-sm">
                    {t.branches?.length
                      ? t.branches.map((b) => b.branch.name).join(", ")
                      : "Atanmamis"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
