import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAuthBootstrap, loginAction } from "../../common/actions/auth.actions";
import { useAuth } from "../../common/contexts/AuthContext";

export default function LoginPage() {
  const [companyName, setCompanyName] = useState("Demo");
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await loginAction({ companyName, email, password });
      localStorage.setItem("admin_token", result.token);
      localStorage.setItem("admin_refreshToken", result.refreshToken);
      const bootstrap = await fetchAuthBootstrap();
      if (bootstrap.user.roleId !== 1) {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_refreshToken");
        throw new Error("Bu panele sadece admin kullanicilar girebilir.");
      }
      login(bootstrap, result.token);
      navigate("/companies", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giris basarisiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wv-login">
      <div className="wv-login-brand">
        <div className="wv-login-brand-inner">
          <div className="wv-login-brand-mark">ELMRY</div>
          <p className="wv-login-brand-tagline">
            Sirket, sube, anbar ve kasa yonetimi — admin panel.
          </p>
        </div>
      </div>
      <div className="wv-login-panel">
        <div className="wv-login-card wv-animate-fade-in">
          <h2 className="wv-login-title">Elmry Admin</h2>
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="wv-label" htmlFor="companyName">
                Brend
              </label>
              <input
                id="companyName"
                className="wv-input"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="wv-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="wv-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="wv-label" htmlFor="password">
                Sifre
              </label>
              <input
                id="password"
                type="password"
                className="wv-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="wv-btn wv-btn-primary wv-btn-lg w-full"
              disabled={loading}
            >
              {loading ? "Giris yapiliyor..." : "Daxil ol"}
            </button>
          </form>
          {error && <div className="wv-alert wv-alert-error mt-4">{error}</div>}
          <div className="wv-login-footer">
            <p>© Elmry Admin — 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
