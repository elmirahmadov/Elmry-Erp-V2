import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  fetchAuthBootstrap,
  loginAction,
} from "../../common/actions/auth.actions";
import { useAuth } from "../../common/contexts/AuthContext";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("companyName", companyName);
      formData.append("email", email);
      formData.append("password", password);
      const userData = await loginAction(formData);
      if (userData && userData.token) {
        localStorage.setItem("token", userData.token);
        localStorage.setItem("refreshToken", userData.refreshToken);
        document.cookie = `token=${userData.token}; path=/; max-age=86400`;
        document.cookie = `refreshToken=${userData.refreshToken}; path=/; max-age=${7 * 24 * 60 * 60}`;
        const bootstrapData = await fetchAuthBootstrap();
        login(bootstrapData, userData.token);
        navigate("/dashboard", { replace: true });
      } else {
        setError("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="wv-login">
      <div className="wv-login-brand">
        <div className="wv-login-brand-inner">
          <div className="wv-login-brand-mark">ELMRY</div>
          <p className="wv-login-brand-tagline">
            Operasyon, stok ve maliyyə — tek panelde.
          </p>
        </div>
      </div>
      <div className="wv-login-panel">
        <div className="wv-login-card wv-animate-fade-in">
          <h2 className="wv-login-title">Elmry ERP</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="companyName" className="wv-label">
                Brend
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                className="wv-input"
                placeholder="Brend"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="wv-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="wv-input"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="wv-label">
                Şifrə
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="wv-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="wv-btn wv-btn-primary wv-btn-lg w-full"
              disabled={isLoading}
            >
              {isLoading ? "Daxil olunur..." : "Daxil ol"}
            </button>
          </form>
          {error && <div className="wv-alert wv-alert-error mt-4">{error}</div>}
          <div className="wv-login-footer">
            <p>© Elmry ERP — 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
