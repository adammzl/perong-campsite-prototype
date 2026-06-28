import { useState } from "react";
import { TreePine, Eye, EyeOff, ArrowLeft } from "lucide-react";

type UserRole = "customer" | "staff";

interface AuthPageProps {
  onBack: () => void;
  onLogin: (role: UserRole, name: string, email: string) => void;
}

export function AuthPage({ onBack, onLogin }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<UserRole>("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", staffCode: "" });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (role === "staff" && form.staffCode !== "PERONG2026") {
      setError("Invalid staff access code. Please contact your administrator.");
      return;
    }

    if (mode === "register" && !form.name) {
      setError("Please enter your full name.");
      return;
    }

    const displayName = mode === "register" ? form.name : form.email.split("@")[0];
    // Pass email so bookings can be linked to the customer account
    onLogin(role, displayName, form.email);
  };

  return (
    <div style={{ fontFamily: "'Lato', sans-serif" }} className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-end p-12">
        <img
          src="https://images.unsplash.com/photo-1576176539998-0237d1ac6a85?w=900&h=1200&fit=crop&auto=format"
          alt="Tents at Perong Campsite"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <TreePine size={28} className="text-secondary" />
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }} className="text-2xl text-white">
              Perong Campsite
            </span>
          </div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }} className="text-white/80 text-xl leading-relaxed">
            "The forest does not judge. It only welcomes."
          </p>
          <p className="text-white/50 text-sm mt-3">— A guest, 2024</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 py-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 w-fit"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Back to Home</span>
        </button>

        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <TreePine size={24} className="text-primary" />
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }} className="text-xl text-primary">
            Perong Campsite
          </span>
        </div>

        <h2
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "2rem" }}
          className="text-foreground mb-2"
        >
          {mode === "login" ? "Welcome back" : "Create an account"}
        </h2>
        <p className="text-muted-foreground mb-8 text-sm">
          {mode === "login"
            ? "Sign in to manage your bookings or campsite."
            : "Join us to book your forest escape."}
        </p>

        {/* Role selector */}
        <div className="flex rounded-lg overflow-hidden border border-border mb-6">
          {(["customer", "staff"] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex-1 py-3 text-sm transition-colors capitalize ${
                role === r
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {r === "customer" ? "I'm a Guest" : "Staff Login"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-sm text-foreground mb-1">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Ahmad Razif"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-border bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-foreground mb-1">Email Address</label>
            <input
              type="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-border bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-foreground mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 pr-12 rounded-lg border border-border bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {role === "staff" && (
            <div>
              <label className="block text-sm text-foreground mb-1">Staff Access Code</label>
              <input
                type="text"
                placeholder="Enter your staff code"
                value={form.staffCode}
                onChange={(e) => setForm({ ...form, staffCode: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-border bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">Hint: PERONG2026</p>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity text-sm tracking-wide mt-2"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
          >
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            className="text-primary hover:underline"
          >
            {mode === "login" ? "Register here" : "Sign in"}
          </button>
        </p>

        {/* Demo credentials hint */}
        <div className="mt-8 bg-muted rounded-lg p-4 text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground mb-2">Demo accounts (any password works):</p>
          <p>Customer: <span className="font-mono text-foreground">nurul@demo.com</span> — has pending booking + payment proof</p>
          <p>Customer: <span className="font-mono text-foreground">amirah@demo.com</span> — has confirmed booking due today</p>
          <p>Customer: <span className="font-mono text-foreground">raj@demo.com</span> — currently checked in</p>
          <p>Staff: any email + code <span className="font-mono text-foreground">PERONG2026</span></p>
        </div>
      </div>
    </div>
  );
}
