import { useState } from "react";
import { TreePine, Eye, EyeOff, ArrowLeft } from "lucide-react";

type UserRole = "customer" | "staff";

interface AuthPageProps {
  onBack: () => void;
  onLogin: (role: UserRole, name: string, email: string) => void;
}

// ─── Inline alert icon (no lucide dependency) ─────────────────────────────────
function AlertIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
function CheckCircleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

// ─── Inline toast / error banner component ────────────────────────────────────
function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div
      className="flex items-start gap-3 bg-destructive/10 border border-destructive/40 text-destructive rounded-xl px-4 py-3.5"
      style={{ animation: "slideDown 0.2s ease-out" }}
    >
      <AlertIcon size={16} />
      <p className="text-sm leading-snug">{message}</p>
    </div>
  );
}

// ─── Inline field error ───────────────────────────────────────────────────────
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-destructive mt-1.5">
      <AlertIcon size={11} /> {message}
    </p>
  );
}

export function AuthPage({ onBack, onLogin }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<UserRole>("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", staffCode: "" });

  // Global banner error
  const [bannerError, setBannerError] = useState("");
  // Per-field inline errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearErrors = () => {
    setBannerError("");
    setFieldErrors({});
  };

  const setField = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    // Clear that field's error as the user types
    if (fieldErrors[key]) {
      setFieldErrors(prev => { const next = { ...prev }; delete next[key]; return next; });
    }
    setBannerError("");
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (mode === "register" && !form.name.trim()) {
      errors.name = "Full name is required.";
    }

    if (!form.email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!form.password) {
      errors.password = "Password is required.";
    } else if (form.password.length < 4) {
      errors.password = "Password must be at least 4 characters.";
    }

    if (role === "staff" && !form.staffCode.trim()) {
      errors.staffCode = "Staff access code is required.";
    } else if (role === "staff" && form.staffCode.trim() !== "PERONG2026") {
      errors.staffCode = "Invalid access code. Contact your administrator.";
      setBannerError("Staff access denied — the code you entered is incorrect.");
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    if (!validate()) return;

    setIsLoading(true);

    // Simulate a tiny async delay for UX realism
    setTimeout(() => {
      const displayName = mode === "register" ? form.name.trim() : form.email.split("@")[0];
      onLogin(role, displayName, form.email.toLowerCase().trim());
      setIsLoading(false);
    }, 400);
  };

  const switchMode = () => {
    setMode(m => m === "login" ? "register" : "login");
    setForm({ name: "", email: "", password: "", staffCode: "" });
    clearErrors();
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-3 rounded-lg border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 text-sm transition-colors ${
      fieldErrors[field]
        ? "border-destructive bg-destructive/5 focus:ring-destructive/30"
        : "border-border bg-input-background focus:ring-ring"
    }`;

  return (
    <div style={{ fontFamily: "'Lato', sans-serif" }} className="min-h-screen bg-background flex">
      {/* Slide-down animation keyframe */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-end p-12">
        <img
          src="https://images.unsplash.com/photo-1576176539998-0237d1ac6a85?w=900&h=1200&fit=crop&auto=format"
          alt="Perong Campsite"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <TreePine size={28} className="text-secondary" />
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }} className="text-2xl text-white">
              Perong Campsite
            </span>
          </div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }} className="text-white/80 text-xl leading-relaxed max-w-sm">
            &ldquo;The forest does not judge. It only welcomes.&rdquo;
          </p>
          <p className="text-white/50 text-sm mt-3">— A guest, 2024</p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 py-12 overflow-y-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 w-fit text-sm">
          <ArrowLeft size={16} /> Back to Home
        </button>

        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <TreePine size={24} className="text-primary" />
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }} className="text-xl text-primary">
            Perong Campsite
          </span>
        </div>

        <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "2rem" }} className="text-foreground mb-1">
          {mode === "login" ? "Welcome back" : "Create an account"}
        </h2>
        <p className="text-muted-foreground mb-8 text-sm">
          {mode === "login"
            ? "Sign in to manage your bookings or campsite operations."
            : "Register to start booking your forest escape."}
        </p>

        {/* Role selector */}
        <div className="flex rounded-xl overflow-hidden border border-border mb-6">
          {(["customer", "staff"] as UserRole[]).map(r => (
            <button
              key={r}
              type="button"
              onClick={() => { setRole(r); clearErrors(); }}
              className={`flex-1 py-3 text-sm transition-colors font-medium ${
                role === r ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {r === "customer" ? "🏕️ I'm a Guest" : "🔑 Staff Login"}
            </button>
          ))}
        </div>

        {/* Global banner error */}
        {bannerError && <div className="mb-4"><ErrorBanner message={bannerError} /></div>}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">

          {/* Full name — register only */}
          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Full Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Ahmad Razif"
                value={form.name}
                onChange={e => setField("name", e.target.value)}
                className={inputClass("name")}
              />
              <FieldError message={fieldErrors.name} />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Email Address <span className="text-destructive">*</span>
            </label>
            <input
              type="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={e => setField("email", e.target.value)}
              className={inputClass("email")}
              autoComplete="email"
            />
            <FieldError message={fieldErrors.email} />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Password <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setField("password", e.target.value)}
                className={`${inputClass("password")} pr-12`}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <FieldError message={fieldErrors.password} />
          </div>

          {/* Staff code */}
          {role === "staff" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Staff Access Code <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter your access code"
                value={form.staffCode}
                onChange={e => setField("staffCode", e.target.value.toUpperCase())}
                className={inputClass("staffCode")}
              />
              <FieldError message={fieldErrors.staffCode} />
              {!fieldErrors.staffCode && (
                <p className="text-xs text-muted-foreground mt-1.5">
                  Demo code: <span className="font-mono text-foreground">PERONG2026</span>
                </p>
              )}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl hover:opacity-90 transition-opacity text-sm font-semibold mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {isLoading ? (
              <>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  style={{ animation: "spin 0.8s linear infinite" }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                </svg>
                {mode === "login" ? "Signing in..." : "Creating account..."}
              </>
            ) : (
              mode === "login" ? "Sign In" : "Create Account"
            )}
          </button>
        </form>

        {/* Mode switch */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={switchMode} className="text-primary hover:underline font-medium">
            {mode === "login" ? "Register here" : "Sign in"}
          </button>
        </p>

        {/* Demo credentials */}
        <div className="mt-8 bg-muted rounded-xl p-5 text-xs text-muted-foreground space-y-1.5">
          <p className="font-semibold text-foreground mb-2 text-sm">Demo accounts</p>
          <p className="text-muted-foreground text-xs mb-2">Any password works for demo accounts.</p>
          <div className="space-y-1.5">
            {[
              { label: "Guest (pending booking + payment proof)", email: "nurul@demo.com" },
              { label: "Guest (confirmed booking)", email: "amirah@demo.com" },
              { label: "Guest (currently checked in)", email: "raj@demo.com" },
            ].map(d => (
              <div key={d.email} className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">{d.label}</span>
                <button
                  type="button"
                  onClick={() => { setRole("customer"); setForm(f => ({ ...f, email: d.email, password: "demo" })); clearErrors(); }}
                  className="font-mono text-foreground bg-background border border-border px-2 py-0.5 rounded hover:bg-muted transition-colors shrink-0"
                >
                  {d.email}
                </button>
              </div>
            ))}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-border mt-1">
              <span className="text-muted-foreground">Staff (code: PERONG2026)</span>
              <button
                type="button"
                onClick={() => { setRole("staff"); setForm(f => ({ ...f, email: "staff@perong.com", password: "demo", staffCode: "PERONG2026" })); clearErrors(); }}
                className="font-mono text-foreground bg-background border border-border px-2 py-0.5 rounded hover:bg-muted transition-colors shrink-0"
              >
                staff@perong.com
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
