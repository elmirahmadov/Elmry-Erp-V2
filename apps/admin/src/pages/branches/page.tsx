import { FormEvent, useEffect, useState } from "react";
import {
  createBranch,
  fetchBranches,
  fetchCompanies,
  type Branch,
  type Company,
} from "../../common/actions/admin.actions";

export default function BranchesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
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
      setBranches([]);
      return;
    }
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        setBranches(await fetchBranches(companyId));
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
      const created = await createBranch(name.trim(), companyId);
      setBranches((prev) => [...prev, created]);
      setName("");
      setSuccess("Sube olusturuldu.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Subeler</h1>
        <p className="text-sm text-muted-foreground">
          Sirket secip yeni sube acin.
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
            <label className="mb-1 block text-xs text-muted-foreground">Sube adi</label>
            <input
              className="border border-border bg-secondary px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Yeni sube adi"
              required
            />
          </div>
          <button
            type="submit"
            disabled={saving || !companyId}
            className="bg-success px-3 py-2 text-sm text-success-foreground disabled:opacity-50"
          >
            {saving ? "Ekleniyor..." : "Sube Ac"}
          </button>
        </form>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-success">{success}</p>}

      <div className="overflow-auto border border-border bg-card">
        {loading ? (
          <p className="p-6 text-sm text-muted-foreground">Yukleniyor...</p>
        ) : branches.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">Bu sirkette sube yok.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-secondary">
              <tr>
                <th className="px-3 py-2 text-left text-xs">ID</th>
                <th className="px-3 py-2 text-left text-xs">Ad</th>
                <th className="px-3 py-2 text-left text-xs">Sirket ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {branches.map((b) => (
                <tr key={b.id} className="hover:bg-accent">
                  <td className="px-3 py-2 text-sm">{b.id}</td>
                  <td className="px-3 py-2 text-sm font-medium">{b.name}</td>
                  <td className="px-3 py-2 text-sm">{b.companyId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
