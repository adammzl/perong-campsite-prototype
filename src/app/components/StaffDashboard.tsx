import { useState } from "react";
import {
  TreePine, Users, Calendar, CreditCard, CheckCircle, Clock,
  LogOut, TrendingUp, AlertTriangle, Edit2, Check, X,
  XCircle, MessageSquare, ChevronDown, ChevronUp,
} from "lucide-react";
import type { Campsite, Booking, Payment } from "../App";
import { saveData } from "../App";

interface StaffDashboardProps {
  userName: string;
  onLogout: () => void;
  campsites: Campsite[];
  setCampsites: (campsites: Campsite[]) => void;
  bookings: Booking[];
  setBookings: (bookings: Booking[]) => void;
  payments: Payment[];
  setPayments: (payments: Payment[]) => void;
}

type TabId = "overview" | "availability" | "bookings" | "payments";
type ActionType = "approve" | "reject" | "reschedule";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(d: string): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

const bookingStatusStyle: Record<string, string> = {
  Pending: "bg-accent/10 text-accent",
  Confirmed: "bg-primary/10 text-primary",
  Completed: "bg-muted text-muted-foreground",
  Rejected: "bg-destructive/10 text-destructive",
  Rescheduled: "bg-purple-100 text-purple-700",
};

const payStatusStyle: Record<string, string> = {
  Pending: "bg-accent/10 text-accent",
  Approved: "bg-primary/10 text-primary",
  Rejected: "bg-destructive/10 text-destructive",
};

// ─── Staff Action Modal ───────────────────────────────────────────────────────
function StaffActionModal({
  booking,
  onClose,
  onSubmit,
}: {
  booking: Booking;
  onClose: () => void;
  onSubmit: (data: { action: ActionType; feedback: string; suggestCheckIn: string; suggestCheckOut: string }) => void;
}) {
  const [action, setAction] = useState<ActionType>("approve");
  const [feedback, setFeedback] = useState("");
  const [suggestCheckIn, setSuggestCheckIn] = useState("");
  const [suggestCheckOut, setSuggestCheckOut] = useState("");

  const canSubmit =
    action === "approve" ||
    (feedback.trim().length > 5 &&
      (action !== "reschedule" || (suggestCheckIn !== "" && suggestCheckOut !== "")));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
              className="text-foreground text-lg"
            >
              Review Booking
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{booking.id} · {booking.guest}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        {/* Booking summary */}
        <div className="bg-muted rounded-lg p-3 mb-5 text-sm space-y-1">
          <p className="text-foreground font-medium">{booking.site}</p>
          <p className="text-muted-foreground">
            {fmtDate(booking.checkIn)} → {fmtDate(booking.checkOut)} · {booking.guests} guests
          </p>
          <p style={{ fontFamily: "'DM Mono', monospace" }} className="text-foreground">RM {booking.total}</p>
        </div>

        {/* Action selector */}
        <div className="flex gap-2 mb-5">
          {(
            [
              { val: "approve" as ActionType, label: "Approve", active: "bg-primary/10 text-primary border-primary" },
              { val: "reschedule" as ActionType, label: "Reschedule", active: "bg-purple-100 text-purple-700 border-purple-400" },
              { val: "reject" as ActionType, label: "Reject", active: "bg-destructive/10 text-destructive border-destructive" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.val}
              onClick={() => setAction(opt.val)}
              className={`flex-1 py-2 rounded-lg text-sm border-2 transition-colors font-medium ${
                action === opt.val ? opt.active : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Feedback textarea */}
        {(action === "reject" || action === "reschedule") && (
          <div className="mb-4">
            <label className="block text-sm text-foreground mb-1">
              {action === "reject" ? "Reason for rejection" : "Reason for reschedule"}{" "}
              <span className="text-destructive">*</span>
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              placeholder="Please explain to the guest why their booking is being updated…"
              className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
        )}

        {/* Suggested dates */}
        {action === "reschedule" && (
          <div className="mb-5">
            <label className="block text-sm text-foreground mb-2">
              Suggest new dates <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Check-in</label>
                <input
                  type="date"
                  value={suggestCheckIn}
                  onChange={(e) => setSuggestCheckIn(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Check-out</label>
                <input
                  type="date"
                  value={suggestCheckOut}
                  onChange={(e) => setSuggestCheckOut(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>
        )}

        {/* Validation hint */}
        {(action === "reject" || action === "reschedule") &&
          feedback.trim().length > 0 &&
          feedback.trim().length <= 5 && (
            <p className="text-xs text-destructive mb-3">Please provide a more detailed reason.</p>
          )}

        {/* Footer buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-border text-foreground py-2 rounded-lg text-sm hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!canSubmit}
            onClick={() => onSubmit({ action, feedback, suggestCheckIn, suggestCheckOut })}
            className={`flex-1 py-2 rounded-lg text-sm transition-opacity font-medium disabled:opacity-40 disabled:cursor-not-allowed ${
              action === "approve"
                ? "bg-primary text-primary-foreground hover:opacity-90"
                : action === "reject"
                ? "bg-destructive text-white hover:opacity-90"
                : "bg-purple-600 text-white hover:opacity-90"
            }`}
          >
            {action === "approve"
              ? "Confirm Approval"
              : action === "reject"
              ? "Send Rejection"
              : "Send Reschedule"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Booking Card ─────────────────────────────────────────────────────────────
function BookingCard({
  booking,
  onReview,
}: {
  booking: Booking;
  onReview: (b: Booking) => void;
}) {
  const [showNote, setShowNote] = useState(false);

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      {/* Top row */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }} className="text-foreground">
            {booking.guest}
          </p>
          <p style={{ fontFamily: "'DM Mono', monospace" }} className="text-xs text-muted-foreground">
            {booking.id}
          </p>
        </div>
        <span
          className={`text-xs px-3 py-1 rounded-full ${
            bookingStatusStyle[booking.status] ?? "bg-muted text-muted-foreground"
          }`}
        >
          {booking.status}
        </span>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
        <div className="flex items-center gap-1 text-muted-foreground">
          <TreePine size={13} /><span>{booking.site}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Calendar size={13} /><span>{booking.dates}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Users size={13} /><span>{booking.guests} guests</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <CreditCard size={13} />
          <span style={{ fontFamily: "'DM Mono', monospace" }}>RM {booking.total}</span>
        </div>
      </div>

      {/* Staff feedback (collapsible) */}
      {booking.staffFeedback && (
        <div className="mb-3">
          <button
            onClick={() => setShowNote((p) => !p)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-1"
          >
            <MessageSquare size={11} />
            Staff note sent to guest
            {showNote ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
          {showNote && (
            <div className="bg-muted rounded-lg p-3 text-sm">
              <p className="text-foreground">{booking.staffFeedback}</p>
            </div>
          )}
        </div>
      )}

      {/* Suggested dates badge */}
      {booking.status === "Rescheduled" && booking.suggestedCheckIn && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3 text-sm">
          <p className="text-xs text-purple-600 mb-1">Suggested dates sent to guest</p>
          <p className="text-foreground">
            {fmtDate(booking.suggestedCheckIn)} → {fmtDate(booking.suggestedCheckOut)}
          </p>
        </div>
      )}

      {/* Action button — only for Pending */}
      {booking.status === "Pending" && (
        <div className="flex gap-3 pt-3 border-t border-border">
          <button
            onClick={() => onReview(booking)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:opacity-90"
          >
            <CheckCircle size={15} /> Review & Respond
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function StaffDashboard({
  userName,
  onLogout,
  campsites,
  setCampsites,
  bookings,
  setBookings,
  payments,
  setPayments,
}: StaffDashboardProps) {
  const [tab, setTab] = useState<TabId>("overview");
  const [editingPrice, setEditingPrice] = useState<number | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [actionBooking, setActionBooking] = useState<Booking | null>(null);

  // Derived stats
  const pendingBookings = bookings.filter((b) => b.status === "Pending").length;
  const pendingPayments = payments.filter((p) => p.status === "Pending").length;
  const availableSites = campsites.filter((s) => s.available).length;
  const totalRevenue = payments
    .filter((p) => p.status === "Approved")
    .reduce((sum, p) => sum + p.amount, 0);

  // Booking actions
  const handleBookingAction = (
    bookingId: string,
    { action, feedback, suggestCheckIn, suggestCheckOut }: {
      action: ActionType;
      feedback: string;
      suggestCheckIn: string;
      suggestCheckOut: string;
    }
  ) => {
    const newStatus =
      action === "approve" ? "Confirmed" : action === "reject" ? "Rejected" : "Rescheduled";
    const updated = bookings.map((b) =>
      b.id !== bookingId
        ? b
        : {
            ...b,
            status: newStatus as Booking["status"],
            staffFeedback: feedback || "",
            suggestedCheckIn: action === "reschedule" ? suggestCheckIn : "",
            suggestedCheckOut: action === "reschedule" ? suggestCheckOut : "",
          }
    );
    setBookings(updated);
    saveData("pc_bookings", updated);
    setActionBooking(null);
  };

  // Payment actions
  const approvePayment = (id: string) => {
    const updated = payments.map((p) => (p.id === id ? { ...p, status: "Approved" as const } : p));
    setPayments(updated);
    saveData("pc_payments", updated);
  };
  const rejectPayment = (id: string) => {
    const updated = payments.map((p) => (p.id === id ? { ...p, status: "Rejected" as const } : p));
    setPayments(updated);
    saveData("pc_payments", updated);
  };

  // Site management
  const toggleAvailability = (id: number) => {
    const updated = campsites.map((s) => (s.id === id ? { ...s, available: !s.available } : s));
    setCampsites(updated);
    saveData("pc_campsites", updated);
  };
  const savePrice = (id: number) => {
    const val = parseFloat(priceInput);
    if (!isNaN(val) && val > 0) {
      const updated = campsites.map((s) => (s.id === id ? { ...s, price: val } : s));
      setCampsites(updated);
      saveData("pc_campsites", updated);
    }
    setEditingPrice(null);
  };

  const tabs: { id: TabId; label: string; badge?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "availability", label: "Manage Sites" },
    { id: "bookings", label: "Approve Bookings", badge: pendingBookings || undefined },
    { id: "payments", label: "Approve Payments", badge: pendingPayments || undefined },
  ];

  return (
    <div style={{ fontFamily: "'Lato', sans-serif" }} className="min-h-screen bg-background">
      {actionBooking && (
        <StaffActionModal
          booking={actionBooking}
          onClose={() => setActionBooking(null)}
          onSubmit={(data) => handleBookingAction(actionBooking.id, data)}
        />
      )}

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
          <button
            onClick={onLogout}
            className="flex items-center gap-1 text-primary-foreground/60 hover:text-primary-foreground text-sm"
          >
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
                tab === t.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
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

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div>
            <h2
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.6rem" }}
              className="text-foreground mb-6"
            >
              Dashboard Overview
            </h2>

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                {
                  label: "Available Sites",
                  value: String(availableSites),
                  icon: <TreePine size={20} className="text-primary" />,
                  sub: `of ${campsites.length} total`,
                },
                {
                  label: "Pending Bookings",
                  value: String(pendingBookings),
                  icon: <Clock size={20} className="text-accent" />,
                  sub: "awaiting approval",
                },
                {
                  label: "Pending Payments",
                  value: String(pendingPayments),
                  icon: <AlertTriangle size={20} className="text-accent" />,
                  sub: "to verify",
                },
                {
                  label: "Total Revenue",
                  value: `RM ${totalRevenue}`,
                  icon: <TrendingUp size={20} className="text-primary" />,
                  sub: "approved payments",
                },
              ].map((stat, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-5">
                  <div className="mb-3">{stat.icon}</div>
                  <p style={{ fontFamily: "'DM Mono', monospace" }} className="text-2xl text-foreground mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-foreground">{stat.label}</p>
                  <p className="text-xs text-muted-foreground">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Pending actions list */}
            <h3
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
              className="text-foreground mb-4"
            >
              Pending Actions
            </h3>
            <div className="space-y-3">
              {bookings
                .filter((b) => b.status === "Pending")
                .map((b) => (
                  <div
                    key={b.id}
                    className="bg-card border border-border rounded-lg px-5 py-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Clock size={16} className="text-accent shrink-0" />
                      <div>
                        <p className="text-sm text-foreground">
                          {b.guest} — <span className="text-muted-foreground">{b.site}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{b.dates} · {b.guests} guests</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs text-muted-foreground hidden md:block"
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      >
                        RM {b.total}
                      </span>
                      <button
                        onClick={() => setActionBooking(b)}
                        className="bg-primary/10 text-primary px-3 py-1 rounded text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}

              {payments
                .filter((p) => p.status === "Pending")
                .map((p) => (
                  <div
                    key={p.id}
                    className="bg-card border border-border rounded-lg px-5 py-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard size={16} className="text-accent shrink-0" />
                      <div>
                        <p className="text-sm text-foreground">
                          {p.guest} — <span className="text-muted-foreground">Payment via {p.method}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{p.bookingId} · {p.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs text-muted-foreground hidden md:block"
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      >
                        RM {p.amount}
                      </span>
                      <button
                        onClick={() => approvePayment(p.id)}
                        className="bg-primary/10 text-primary px-3 py-1 rounded text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
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

        {/* ── MANAGE SITES ── */}
        {tab === "availability" && (
          <div>
            <h2
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.6rem" }}
              className="text-foreground mb-2"
            >
              Manage Campsite Availability
            </h2>
            <p className="text-muted-foreground text-sm mb-8">
              Changes here are reflected instantly on the customer side.
            </p>
            <div className="space-y-3">
              {campsites.map((site) => (
                <div
                  key={site.id}
                  className="bg-card border border-border rounded-xl p-5 flex flex-wrap items-center gap-4"
                >
                  <div className="flex-1 min-w-48">
                    <p
                      style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
                      className="text-foreground"
                    >
                      {site.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{site.type} · Up to {site.capacity} pax</p>
                  </div>

                  {/* Price editor */}
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
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                      >
                        <span style={{ fontFamily: "'DM Mono', monospace" }}>RM {site.price}/night</span>
                        <Edit2 size={13} />
                      </button>
                    )}
                  </div>

                  {/* Availability toggle */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        site.available ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {site.available ? "Available" : "Unavailable"}
                    </span>
                    <button
                      onClick={() => toggleAvailability(site.id)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        site.available ? "bg-primary" : "bg-muted-foreground/40"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          site.available ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── BOOKING APPROVALS ── */}
        {tab === "bookings" && (
          <div>
            <h2
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.6rem" }}
              className="text-foreground mb-2"
            >
              Booking Approvals
            </h2>
            <p className="text-muted-foreground text-sm mb-8">
              Approve, reject with feedback, or suggest a reschedule.
            </p>
            <div className="space-y-4">
              {bookings.map((b) => (
                <BookingCard key={b.id} booking={b} onReview={setActionBooking} />
              ))}
            </div>
          </div>
        )}

        {/* ── PAYMENT VERIFICATIONS ── */}
        {tab === "payments" && (
          <div>
            <h2
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.6rem" }}
              className="text-foreground mb-2"
            >
              Payment Verifications
            </h2>
            <p className="text-muted-foreground text-sm mb-8">
              Verify and approve payment submissions from guests.
            </p>
            <div className="space-y-4">
              {payments.map((p) => (
                <div key={p.id} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <p
                        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
                        className="text-foreground"
                      >
                        {p.guest}
                      </p>
                      <p style={{ fontFamily: "'DM Mono', monospace" }} className="text-xs text-muted-foreground">
                        {p.id} · {p.bookingId}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        payStatusStyle[p.status] ?? "bg-muted text-muted-foreground"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <CreditCard size={13} /><span>{p.method}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar size={13} /><span>{p.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span style={{ fontFamily: "'DM Mono', monospace" }} className="text-foreground">
                        RM {p.amount}.00
                      </span>
                    </div>
                  </div>

                  {p.status === "Pending" && (
                    <div className="flex gap-3 pt-3 border-t border-border">
                      <button
                        onClick={() => approvePayment(p.id)}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:opacity-90"
                      >
                        <CheckCircle size={15} /> Approve Payment
                      </button>
                      <button
                        onClick={() => rejectPayment(p.id)}
                        className="flex items-center gap-2 border border-destructive text-destructive px-4 py-2 rounded-lg text-sm hover:bg-destructive/10"
                      >
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
