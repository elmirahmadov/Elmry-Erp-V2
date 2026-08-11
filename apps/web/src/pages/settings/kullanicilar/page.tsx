import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../common/contexts/AuthContext";
import Loading from "../../../common/components/loading/Loading";
import {
  createUser,
  fetchUsersByCompany,
  updateUser,
  type CompanyUser,
} from "../../../common/actions/users.actions";

export default function KullanicilarPage() {
  const { user } = useAuth();
  const companyId = user?.companyId;

  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CompanyUser | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(2);

  const canSubmit = useMemo(() => {
    if (!companyId || !name.trim() || !email.trim()) return false;
    if (!editing && password.trim().length < 6) return false;
    return true;
  }, [companyId, name, email, password, editing]);

  const loadUsers = async (cid: number) => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await fetchUsersByCompany(cid));
    } catch (e) {
      setError((e as Error).message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!companyId) return;
    void loadUsers(companyId);
  }, [companyId]);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setEmail("");
    setPassword("");
    setRoleId(2);
    setModalOpen(true);
  };

  const openEdit = (item: CompanyUser) => {
    setEditing(item);
    setName(item.name || "");
    setEmail(item.email);
    setPassword("");
    setRoleId(item.roleId);
    setModalOpen(true);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit || !companyId) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      if (editing) {
        await updateUser(editing.id, {
          name: name.trim(),
          email: email.trim(),
          roleId,
          companyId,
          ...(password.trim() ? { password: password.trim() } : {}),
        });
        setSuccess("Kullanici guncellendi.");
      } else {
        await createUser({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          companyId,
          roleId,
        });
        setSuccess("Kullanici olusturuldu.");
      }
      setModalOpen(false);
      await loadUsers(companyId);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: "calc(100vh - var(--header-height))" }}
    >
      <div className="shrink-0 border-b border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-semibold text-foreground">
              Kullanicilar
            </h1>
            <p className="text-xs text-muted-foreground">
              Sirketin tum kullanicilari. Sube atamasi Subeler sayfasindan
              yapilir.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            disabled={!companyId}
            className="bg-success px-3 py-2 text-sm font-medium text-success-foreground disabled:opacity-50"
          >
            + Kullanici Ekle
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        {success && <p className="mt-2 text-sm text-success">{success}</p>}
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-card">
        {loading ? (
          <div className="flex h-52 items-center justify-center">
            <Loading />
          </div>
        ) : users.length === 0 ? (
          <div className="flex h-52 items-center justify-center text-sm text-muted-foreground">
            Henuz kullanici yok.
          </div>
        ) : (
          <table className="w-full min-w-[800px] border-collapse">
            <thead className="sticky top-0 bg-secondary">
              <tr>
                <th className="border-b border-border px-3 py-2 text-left text-xs">
                  Ad
                </th>
                <th className="border-b border-border px-3 py-2 text-left text-xs">
                  Email
                </th>
                <th className="border-b border-border px-3 py-2 text-left text-xs">
                  Rol
                </th>
                <th className="border-b border-border px-3 py-2 text-left text-xs">
                  Subeler
                </th>
                <th className="border-b border-border px-3 py-2 text-center text-xs">
                  Islem
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((item) => (
                <tr key={item.id} className="hover:bg-accent">
                  <td className="px-3 py-2 text-sm">{item.name || "-"}</td>
                  <td className="px-3 py-2 text-sm">{item.email}</td>
                  <td className="px-3 py-2 text-sm">
                    {item.roleId === 1 ? "Admin" : "Kullanici"}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    {item.branches?.length
                      ? item.branches.map((b) => b.branch.name).join(", ")
                      : "Atanmamis"}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="text-sm text-primary"
                    >
                      Duzenle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setModalOpen(false)}
          />
          <form
            onSubmit={onSubmit}
            className="relative mx-4 w-full max-w-md space-y-4 border border-border bg-card p-6"
          >
            <h2 className="text-lg font-bold">
              {editing ? "Kullanici Duzenle" : "Kullanici Ekle"}
            </h2>
            <input
              className="w-full border border-border bg-secondary px-3 py-2 text-sm"
              placeholder="Ad"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              className="w-full border border-border bg-secondary px-3 py-2 text-sm"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="w-full border border-border bg-secondary px-3 py-2 text-sm"
              placeholder={editing ? "Yeni sifre (opsiyonel)" : "Sifre"}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!editing}
            />
            <select
              className="w-full border border-border bg-secondary px-3 py-2 text-sm"
              value={roleId}
              onChange={(e) => setRoleId(Number(e.target.value))}
            >
              <option value={1}>Admin</option>
              <option value={2}>Kullanici</option>
            </select>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 border border-border py-2 text-sm"
              >
                Iptal
              </button>
              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="flex-1 bg-primary py-2 text-sm text-primary-foreground disabled:opacity-50"
              >
                {submitting ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
