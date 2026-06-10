import { useState } from "react";
import { TreePine, CheckCircle, XCircle, Clock, LogOut, AlertTriangle, Users, CreditCard, Calendar, TrendingUp, Edit2, Check, X } from "lucide-react";

interface StaffDashboardProps {
  userName: string;
  onLogout: () => void;
}

type TabId = "overview" | "availability" | "bookings" | "payments";

const initialSites = [
  { id: 1, name: "Riverside Clearing A", type: "Open Plot", capacity: 6, available: true, price: 35 },
  { id: 2, name: "Hilltop Nook B", type: "Sheltered Platform", capacity: 4, available: true, price: 55 },
  { id: 3, name: "Firefly Valley C", type: "Forest Plot", capacity: 8, available: false, price: 40 },
  { id: 4, name: "Waterfall Base D", type: "Open Plot", capacity: 10, available: true, price: 45 },
  { id: 5, name: "Canopy Suite E", type: "Premium Platform", capacity: 2, available: true, price: 90 },
  { id: 6, name: "Stream Edge F", type: "Open Plot", capacity: 4, available: true, price: 30 },
];

const initialBookings = [
  { id: "BK-2483", guest: "Nurul Ain Binti Aziz", site: "Canopy Suite E", dates: "20–22 Jun 2026", guests: 2, total: 180, status: "Pending" as const },
  { id: "BK-2482", guest: "Lim Wei Jian", site: "Waterfall Base D", dates: "17–19 Jun 2026", guests: 5, total: 90, status: "Pending" as const },
  { id: "BK-2481", guest: "Amirah Hassan", site: "Riverside Clearing A", dates: "14–16 Jun 2026", guests: 4, total: 105, status: "Confirmed" as const },
  { id: "BK-2479", guest: "Raj Subramaniam", site: "Hilltop Nook B", dates: "10–12 Jun 2026", guests: 2, total: 110, status: "Confirmed" as const },
  { id: "BK-2309", guest: "Sarah Chen", site: "Hilltop Nook B", dates: "22–24 May 2026", guests: 2, total: 110, status: "Completed" as const },
];

const initialPayments = [
  { id: "PAY-8821", bookingId: "BK-2483", guest: "Nurul Ain Binti Aziz", amount: 180, method: "FPX", date: "10 Jun 2026", status: "Pending" as const },
  { id: "PAY-8820", bookingId: "BK-2482", guest: "Lim Wei Jian", amount: 90, method: "Card", date: "09 Jun 2026", status: "Pending" as const },
  { id: "PAY-8819", bookingId: "BK-2481", guest: "Amirah Hassan", amount: 105, method: "Touch 'n Go", date: "08 Jun 2026", status: "Approved" as const },
  { id: "PAY-8817", bookingId: "BK-2479", guest: "Raj Subramaniam", amount: 110, method: "Card", date: "07 Jun 2026", status: "Approved" as const },
  { id: "PAY-8710", bookingId: "BK-2309", guest: "Sarah Chen", amount: 110, method: "FPX", date: "20 May 2026", status: "Approved" as const },
];

type BookingStatus = "Pending" | "Confirmed" | "Completed" | "Rejected";
type PaymentStatus = "Pending" | "Approved" | "Rejected";

const bookingStatusStyle: Record<BookingStatus, string> = {
  Pending: "bg-accent/10 text-accent",
  Confirmed: "bg-primary/10 text-primary",
  Completed: "bg-muted text-muted-foreground",
  Rejected: "bg-destructive/10 text-destructive",
};

const payStatusStyle: Record<PaymentStatus, string> = {
  Pending: "bg-accent/10 text-accent",
  Approved: "bg-primary/10 text-primary",
  Rejected: "bg-destructive/10 text-destructive",
};

export function StaffDashboard({ userName, onLogout }: StaffDashboardProps) {
  const [tab, setTab] = useState<TabId>("overview");
  const [sites, setSites] = useState(initialSites);
  const [bookings, setBookings] = useState(initialBookings);
  const [payments, setPayments] = useState(initialPayments);
  const [editingPrice, setEditingPrice] = useState<number | null>(null);
  const [priceInput, setPriceInput] = useState("");

  const pendingBookings = bookings.filter((b) => b.status === "Pending").length;
  const pendingPayments = payments.filter((p) => p.status === "Pending").length;
  const availableSites = sites.filter((s) => s.available).length;
  const totalRevenue = payments.filter((p) => p.status === "Approved").reduce((s, p) => s + p.amount, 0);

  const approveBooking = (id: string) =>
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "Confirmed" as const } : b)));
  const rejectBooking = (id: string) =>
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "Rejected" as const } : b)));
  const approvePayment = (id: string) =>
    setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, status: "Approved" as const } : p)));
  const rejectPayment = (id: string) =>
    setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, status: "Rejected" as const } : p)));
  const toggleAvailability = (id: number) =>
    setSites((prev) => prev.map((s) => (s.id === id ? { ...s, available: !s.available } : s)));
  const savePrice = (id: number) => {
    const val = parseFloat(priceInput);
    if (!isNaN(val) && val > 0) setSites((prev) => prev.map((s) => (s.id === id ? { ...s, price: val } : s)));
    setEditingPrice(null);
  };

  const tabs: { id: TabId; label: string; badge?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "availability", label: "Manage Sites" },
    { id: "bookings", label: "Approve Bookings", badge: pendingBookings },
    { id: "payments", label: "Approve Payments", badge: pendingPayments },
  ];

  return (
    <div style={{ fontFamily: "'Lato', sans-serif" }} className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-foreground text-primary-foreground px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <TreePine size={22} className="text-secondary" />
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }} className="text-lg">
            Perong Campsite
          </span>
          <span className="hidden md:inline text-primary-foreground/50 text-sm ml-2">— Staff Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-primary-foreground/70 text-sm hidden md:block">Staff: {userName}</span>
          <button onClick={onLogout} className="flex items-center gap-1 text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">
            <LogOut size={16} />
            <span className="hidden md:inline">Sign out</span>
          </button>
        </div>
      </header>

      {/* Tab Nav */}
      <div className="bg-card border-b border-border px-6 overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-4 text-sm border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
              {!!t.badge && (
                <span className="bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ——— OVERVIEW ——— */}
        {tab === "overview" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.6rem" }} className="text-foreground mb-6">
              Dashboard Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { label: "Available Sites", value: availableSites, icon: <TreePine size={20} className="text-primary" />, sub: `of ${sites.length} total` },
                { label: "Pending Bookings", value: pendingBookings, icon: <Clock size={20} className="text-accent" />, sub: "awaiting approval" },
                { label: "Pending Payments", value: pendingPayments, icon: <AlertTriangle size={20} className="text-accent" />, sub: "to verify" },
                { label: "Total Revenue", value: `RM ${totalRevenue}`, icon: <TrendingUp size={20} className="text-primary" />, sub: "approved payments" },
              ].map((stat, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    {stat.icon}
                  </div>
                  <p style={{ fontFamily: "'DM Mono', monospace" }} className="text-2xl text-foreground mb-1">{stat.value}</p>
                  <p className="text-sm text-foreground">{stat.label}</p>
                  <p className="text-xs text-muted-foreground">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }} className="text-foreground mb-4">
              Pending Actions
            </h3>
            <div className="space-y-3">
              {bookings.filter((b) => b.status === "Pending").map((b) => (
                <div key={b.id} className="bg-card border border-border rounded-lg px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-accent shrink-0" />
                    <div>
                      <p className="text-sm text-foreground">{b.guest} — <span className="text-muted-foreground">{b.site}</span></p>
                      <p className="text-xs text-muted-foreground">{b.dates} · {b.guests} guests</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground hidden md:block" style={{ fontFamily: "'DM Mono', monospace" }}>RM {b.total}</span>
                    <button onClick={() => approveBooking(b.id)} className="bg-primary/10 text-primary px-3 py-1 rounded text-xs hover:bg-primary hover:text-primary-foreground transition-colors">
                      Approve
                    </button>
                  </div>
                </div>
              ))}
              {payments.filter((p) => p.status === "Pending").map((p) => (
                <div key={p.id} className="bg-card border border-border rounded-lg px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard size={16} className="text-accent shrink-0" />
                    <div>
                      <p className="text-sm text-foreground">{p.guest} — <span className="text-muted-foreground">Payment via {p.method}</span></p>
                      <p className="text-xs text-muted-foreground">{p.bookingId} · {p.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground hidden md:block" style={{ fontFamily: "'DM Mono', monospace" }}>RM {p.amount}</span>
                    <button onClick={() => approvePayment(p.id)} className="bg-primary/10 text-primary px-3 py-1 rounded text-xs hover:bg-primary hover:text-primary-foreground transition-colors">
                      Approve
                    </button>
                  </div>
                </div>
              ))}
              {pendingBookings === 0 && pendingPayments === 0 && (
                <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground text-sm">
                  <CheckCircle size={32} className="text-primary mx-auto mb-2" />
                  All caught up — no pending actions.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ——— MANAGE SITES ——— */}
        {tab === "availability" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.6rem" }} className="text-foreground mb-2">
              Manage Campsite Availability
            </h2>
            <p className="text-muted-foreground text-sm mb-8">Toggle availability and update pricing per night.</p>
            <div className="space-y-3">
              {sites.map((site) => (
                <div key={site.id} className="bg-card border border-border rounded-xl p-5 flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-48">
                    <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }} className="text-foreground">{site.name}</p>
                    <p className="text-xs text-muted-foreground">{site.type} · Up to {site.capacity} pax</p>
                  </div>
                  {/* Price edit */}
                  <div className="flex items-center gap-2">
                    {editingPrice === site.id ? (
                      <>
                        <span className="text-sm text-muted-foreground">RM</span>
                        <input
                          type="number"
                          value={priceInput}
                          onChange={(e) => setPriceInput(e.target.value)}
                          className="w-20 px-2 py-1 rounded border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <button onClick={() => savePrice(site.id)} className="text-primary hover:text-primary/80">
                          <Check size={16} />
                        </button>
                        <button onClick={() => setEditingPrice(null)} className="text-muted-foreground hover:text-foreground">
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => { setEditingPrice(site.id); setPriceInput(String(site.price)); }}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <span style={{ fontFamily: "'DM Mono', monospace" }}>RM {site.price}/night</span>
                        <Edit2 size={13} />
                      </button>
                    )}
                  </div>
                  {/* Availability toggle */}
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-3 py-1 rounded-full ${site.available ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {site.available ? "Available" : "Unavailable"}
                    </span>
                    <button
                      onClick={() => toggleAvailability(site.id)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${site.available ? "bg-primary" : "bg-muted-foreground/40"}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${site.available ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ——— BOOKINGS ——— */}
        {tab === "bookings" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.6rem" }} className="text-foreground mb-2">
              Booking Approvals
            </h2>
            <p className="text-muted-foreground text-sm mb-8">Review and approve or reject guest booking requests.</p>
            <div className="space-y-4">
              {bookings.map((b) => (
                <div key={b.id} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }} className="text-foreground">{b.guest}</p>
                      <p style={{ fontFamily: "'DM Mono', monospace" }} className="text-xs text-muted-foreground">{b.id}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full ${bookingStatusStyle[b.status as BookingStatus]}`}>
                      {b.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <TreePine size={13} />
                      <span>{b.site}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar size={13} />
                      <span>{b.dates}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users size={13} />
                      <span>{b.guests} guests</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <CreditCard size={13} />
                      <span style={{ fontFamily: "'DM Mono', monospace" }}>RM {b.total}</span>
                    </div>
                  </div>
                  {b.status === "Pending" && (
                    <div className="flex gap-3 pt-3 border-t border-border">
                      <button onClick={() => approveBooking(b.id)}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity">
                        <CheckCircle size={15} /> Approve
                      </button>
                      <button onClick={() => rejectBooking(b.id)}
                        className="flex items-center gap-2 border border-destructive text-destructive px-4 py-2 rounded-lg text-sm hover:bg-destructive/10 transition-colors">
                        <XCircle size={15} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ——— PAYMENTS ——— */}
        {tab === "payments" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.6rem" }} className="text-foreground mb-2">
              Payment Verifications
            </h2>
            <p className="text-muted-foreground text-sm mb-8">Verify and approve payment submissions from guests.</p>
            <div className="space-y-4">
              {payments.map((p) => (
                <div key={p.id} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }} className="text-foreground">{p.guest}</p>
                      <p style={{ fontFamily: "'DM Mono', monospace" }} className="text-xs text-muted-foreground">{p.id} · {p.bookingId}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full ${payStatusStyle[p.status as PaymentStatus]}`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <CreditCard size={13} />
                      <span>{p.method}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar size={13} />
                      <span>{p.date}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground font-medium">
                      <span style={{ fontFamily: "'DM Mono', monospace" }} className="text-foreground">RM {p.amount}.00</span>
                    </div>
                  </div>
                  {p.status === "Pending" && (
                    <div className="flex gap-3 pt-3 border-t border-border">
                      <button onClick={() => approvePayment(p.id)}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity">
                        <CheckCircle size={15} /> Approve Payment
                      </button>
                      <button onClick={() => rejectPayment(p.id)}
                        className="flex items-center gap-2 border border-destructive text-destructive px-4 py-2 rounded-lg text-sm hover:bg-destructive/10 transition-colors">
                        <XCircle size={15} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
