import { useState, useMemo } from "react";
import {
  TreePine, Users, Calendar, CreditCard, CheckCircle, Clock, LogOut,
  TrendingUp, AlertTriangle, Edit2, Check, X, XCircle, MessageSquare,
  ChevronDown, ChevronUp, Package, Activity as ActivityIcon, FileText,
  Eye, Car, Tent, MapPin, Bell, LogIn, LogOut as LogOutIcon, Banknote,
  BarChart2, RefreshCw, Shield, Plus, Trash2,
} from "lucide-react";
import type { Campsite, Booking, Payment, Activity, Equipment, RefundRequest } from "../App";
import { saveData } from "../App";

interface StaffDashboardProps {
  userName: string;
  onLogout: () => void;
  campsites: Campsite[];
  setCampsites: (c: Campsite[]) => void;
  activities: Activity[];
  setActivities: (a: Activity[]) => void;
  equipment: Equipment[];
  setEquipment: (e: Equipment[]) => void;
  bookings: Booking[];
  setBookings: (b: Booking[]) => void;
  payments: Payment[];
  setPayments: (p: Payment[]) => void;
  refunds: RefundRequest[];
  setRefunds: (r: RefundRequest[]) => void;
}

type TabId = "overview" | "ongoing" | "approvals" | "sites" | "activities" | "equipment" | "report" | "refunds";
type ActionType = "approve" | "reject" | "reschedule";

function fmtDate(d: string): string {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return d; }
}

function todayStr() { return new Date().toISOString().split("T")[0]; }
function genId(prefix: string) { return `${prefix}-${Math.floor(Math.random() * 9000 + 1000)}`; }

const bookingStatusStyle: Record<string, string> = {
  Pending:    "bg-accent/10 text-accent",
  Confirmed:  "bg-primary/10 text-primary",
  Completed:  "bg-muted text-muted-foreground",
  Rejected:   "bg-destructive/10 text-destructive",
  Rescheduled:"bg-purple-100 text-purple-700",
  CheckedIn:  "bg-emerald-100 text-emerald-700",
  CheckedOut: "bg-blue-100 text-blue-700",
};

const payStatusStyle: Record<string, string> = {
  Pending:  "bg-accent/10 text-accent",
  Verified: "bg-primary/10 text-primary",
  Rejected: "bg-destructive/10 text-destructive",
};

// ─── Booking Review Modal ─────────────────────────────────────────────────────
function BookingReviewModal({ booking, onClose, onSubmit }: {
  booking: Booking; onClose: () => void;
  onSubmit: (d: { action: ActionType; feedback: string; suggestCheckIn: string; suggestCheckOut: string }) => void;
}) {
  const [action, setAction] = useState<ActionType>("approve");
  const [feedback, setFeedback] = useState("");
  const [sci, setSci] = useState(""); const [sco, setSco] = useState("");
  const canSubmit = action === "approve" || (feedback.trim().length > 5 && (action !== "reschedule" || (sci && sco)));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div><h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700 }} className="text-foreground text-lg">Review Booking</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{booking.id} · {booking.guest}</p></div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>
        <div className="bg-muted rounded-lg p-4 mb-4 text-sm space-y-1.5">
          <div className="flex justify-between"><span className="text-muted-foreground">Campsite</span><span className="text-foreground">{booking.site}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Dates</span><span className="text-foreground">{booking.dates}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Guests</span><span className="text-foreground">{booking.guests} pax</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Vehicle</span><span className="text-foreground">{booking.vehiclePlate} ({booking.vehicleCount} vehicle{booking.vehicleCount>1?"s":""})</span></div>
          {booking.activities.length > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Activities</span><span className="text-foreground">{booking.activities.map(a=>a.name).join(", ")}</span></div>}
          {booking.equipment.length > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Equipment</span><span className="text-foreground text-right text-xs">{booking.equipment.map(e=>`${e.name} (${e.equipmentId})`).join(", ")}</span></div>}
          <div className="flex justify-between border-t border-border pt-1.5 mt-1.5"><span className="text-muted-foreground font-medium">Total</span><span style={{ fontFamily: "'DM Mono',monospace" }} className="text-foreground font-semibold">RM {booking.total}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Payment</span><span className={`font-medium ${booking.paymentStatus === "Verified" ? "text-primary" : booking.paymentStatus === "Unpaid" ? "text-destructive" : "text-accent"}`}>{booking.paymentStatus}</span></div>
          {booking.paymentProofNote && <div className="pt-1 border-t border-border"><p className="text-xs text-muted-foreground mb-0.5">Payment proof</p><p className="text-xs text-foreground bg-white/60 rounded p-2">{booking.paymentProofNote}</p></div>}
        </div>
        <div className="flex gap-2 mb-4">
          {([{ val: "approve" as ActionType, label: "Approve", active: "bg-primary/10 text-primary border-primary" },
            { val: "reschedule" as ActionType, label: "Reschedule", active: "bg-purple-100 text-purple-700 border-purple-400" },
            { val: "reject" as ActionType, label: "Reject", active: "bg-destructive/10 text-destructive border-destructive" }
          ] as const).map(opt => (
            <button key={opt.val} onClick={() => setAction(opt.val)}
              className={`flex-1 py-2 rounded-lg text-sm border-2 transition-colors font-medium ${action === opt.val ? opt.active : "border-border text-muted-foreground hover:bg-muted"}`}>
              {opt.label}
            </button>
          ))}
        </div>
        {(action === "reject" || action === "reschedule") && (
          <div className="mb-4">
            <label className="block text-sm text-foreground mb-1">{action === "reject" ? "Reason for rejection" : "Reason for reschedule"} <span className="text-destructive">*</span></label>
            <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={3}
              placeholder="Explain to the guest why their booking is being updated…"
              className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>
        )}
        {action === "reschedule" && (
          <div className="mb-4">
            <label className="block text-sm text-foreground mb-2">Suggest new dates <span className="text-destructive">*</span></label>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs text-muted-foreground mb-1">Check-in</label><input type="date" value={sci} onChange={e => setSci(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              <div><label className="block text-xs text-muted-foreground mb-1">Check-out</label><input type="date" value={sco} onChange={e => setSco(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
            </div>
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-border text-foreground py-2 rounded-lg text-sm hover:bg-muted">Cancel</button>
          <button disabled={!canSubmit} onClick={() => onSubmit({ action, feedback, suggestCheckIn: sci, suggestCheckOut: sco })}
            className={`flex-1 py-2 rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed ${action === "approve" ? "bg-primary text-primary-foreground hover:opacity-90" : action === "reject" ? "bg-destructive text-white hover:opacity-90" : "bg-purple-600 text-white hover:opacity-90"}`}>
            {action === "approve" ? "Confirm Approval" : action === "reject" ? "Send Rejection" : "Send Reschedule"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Payment Detail Modal ─────────────────────────────────────────────────────
function PaymentDetailModal({ payment, booking, onClose, onVerify, onReject }: {
  payment: Payment; booking: Booking | undefined; onClose: () => void;
  onVerify: () => void; onReject: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-5">
          <div><h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700 }} className="text-foreground text-lg">Verify Payment</h3>
            <p className="text-xs text-muted-foreground">{payment.id} · {payment.bookingId}</p></div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>
        <div className="space-y-3 text-sm mb-5">
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="flex justify-between"><span className="text-muted-foreground">Guest</span><span className="text-foreground">{payment.guest}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span className="text-foreground">{payment.method}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="text-foreground">{fmtDate(payment.date)}</span></div>
            <div className="flex justify-between border-t border-border pt-2 mt-2">
              <span className="text-muted-foreground font-medium">Amount</span>
              <span style={{ fontFamily: "'DM Mono',monospace" }} className="text-foreground font-semibold">RM {payment.amount}.00</span>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-xs text-amber-700 font-medium mb-1 flex items-center gap-1"><Eye size={11} /> Payment Proof</p>
            <p className="text-sm text-foreground leading-relaxed">{payment.proofNote || "No proof provided."}</p>
          </div>
          {booking && (
            <div className="bg-muted rounded-lg p-3 text-xs space-y-1">
              <p className="text-muted-foreground font-medium">Linked Booking</p>
              <p className="text-foreground">{booking.site} · {booking.dates}</p>
              <p className="text-foreground">Status: <span className={`font-medium ${bookingStatusStyle[booking.status]?.split(" ")[1] ?? ""}`}>{booking.status}</span></p>
            </div>
          )}
        </div>
        {payment.status === "Pending" && (
          <div className="flex gap-3">
            <button onClick={onReject} className="flex-1 border border-destructive text-destructive py-2 rounded-lg text-sm hover:bg-destructive/10 flex items-center justify-center gap-1"><XCircle size={14} /> Reject</button>
            <button onClick={onVerify} className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-sm hover:opacity-90 flex items-center justify-center gap-1"><CheckCircle size={14} /> Verify Payment</button>
          </div>
        )}
        {payment.status !== "Pending" && (
          <p className={`text-center text-sm font-medium ${payment.status === "Verified" ? "text-primary" : "text-destructive"}`}>{payment.status}</p>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN STAFF DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export function StaffDashboard({ userName, onLogout, campsites, setCampsites, activities, setActivities, equipment, setEquipment, bookings, setBookings, payments, setPayments, refunds, setRefunds }: StaffDashboardProps) {
  const [tab, setTab] = useState<TabId>("overview");
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [reviewPayment, setReviewPayment] = useState<Payment | null>(null);
  const [editingPrice, setEditingPrice] = useState<number | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [approvalsView, setApprovalsView] = useState<"bookings"|"payments">("bookings");
  const [reportMonth, setReportMonth] = useState(() => new Date().toISOString().slice(0,7));
  const today = todayStr();

  // New activity form
  const [newAct, setNewAct] = useState({ name: "", description: "", pricePerPax: "", icon: "🏕️" });
  // New equipment form
  const [newEq, setNewEq] = useState({ name: "", category: "tent" as "tent"|"equipment", pricePerNight: "" });

  const pendingBookings = bookings.filter(b => b.status === "Pending").length;
  const pendingPayments = payments.filter(p => p.status === "Pending").length;
  const pendingRefunds = refunds.filter(r => r.status === "Pending").length;
  const checkedInNow = bookings.filter(b => b.status === "CheckedIn").length;
  const availableSites = campsites.filter(s => s.available).length;
  const totalRevenue = payments.filter(p => p.status === "Verified").reduce((s, p) => s + p.amount, 0);

  // Bookings needing check-out nudge
  const overdueCheckout = bookings.filter(b => b.status === "CheckedIn" && b.checkOut <= today);

  // ── Booking actions ──────────────────────────────────────────────────────────
  const handleBookingAction = (id: string, { action, feedback, suggestCheckIn, suggestCheckOut }: { action: ActionType; feedback: string; suggestCheckIn: string; suggestCheckOut: string }) => {
    const newStatus = action === "approve" ? "Confirmed" : action === "reject" ? "Rejected" : "Rescheduled";
    const updated = bookings.map(b => b.id !== id ? b : { ...b, status: newStatus as Booking["status"], staffFeedback: feedback || "", suggestedCheckIn: action === "reschedule" ? suggestCheckIn : "", suggestedCheckOut: action === "reschedule" ? suggestCheckOut : "" });
    setBookings(updated); saveData("pc_bookings", updated); setReviewBooking(null);
  };

  // ── Payment actions ──────────────────────────────────────────────────────────
  const verifyPayment = (id: string) => {
    const updated = payments.map(p => p.id === id ? { ...p, status: "Verified" as const } : p);
    const paymentObj = payments.find(p => p.id === id);
    const updatedBookings = paymentObj ? bookings.map(b => b.id === paymentObj.bookingId ? { ...b, paymentStatus: "Verified" as const } : b) : bookings;
    setPayments(updated); saveData("pc_payments", updated);
    setBookings(updatedBookings); saveData("pc_bookings", updatedBookings);
    setReviewPayment(null);
  };

  const rejectPayment = (id: string) => {
    const updated = payments.map(p => p.id === id ? { ...p, status: "Rejected" as const } : p);
    const paymentObj = payments.find(p => p.id === id);
    const updatedBookings = paymentObj ? bookings.map(b => b.id === paymentObj.bookingId ? { ...b, paymentStatus: "Rejected" as const } : b) : bookings;
    setPayments(updated); saveData("pc_payments", updated);
    setBookings(updatedBookings); saveData("pc_bookings", updatedBookings);
    setReviewPayment(null);
  };

  // ── Campsite actions ─────────────────────────────────────────────────────────
  const toggleSite = (id: number) => {
    const updated = campsites.map(s => s.id === id ? { ...s, available: !s.available } : s);
    setCampsites(updated); saveData("pc_campsites", updated);
  };
  const savePrice = (id: number) => {
    const v = parseFloat(priceInput);
    if (!isNaN(v) && v > 0) { const u = campsites.map(s => s.id === id ? { ...s, price: v } : s); setCampsites(u); saveData("pc_campsites", u); }
    setEditingPrice(null);
  };

  // ── Activity actions ─────────────────────────────────────────────────────────
  const toggleActivity = (id: string) => {
    const u = activities.map(a => a.id === id ? { ...a, available: !a.available } : a);
    setActivities(u); saveData("pc_activities", u);
  };
  const addActivity = () => {
    if (!newAct.name || !newAct.pricePerPax) return;
    const act: Activity = { id: genId("ACT"), name: newAct.name, description: newAct.description, pricePerPax: Number(newAct.pricePerPax), available: true, icon: newAct.icon };
    const u = [...activities, act]; setActivities(u); saveData("pc_activities", u);
    setNewAct({ name: "", description: "", pricePerPax: "", icon: "🏕️" });
  };

  // ── Equipment actions ────────────────────────────────────────────────────────
  const toggleEquipment = (id: string) => {
    const u = equipment.map(e => e.id === id ? { ...e, available: !e.available } : e);
    setEquipment(u); saveData("pc_equipment", u);
  };
  const updateCondition = (id: string, condition: Equipment["condition"]) => {
    const u = equipment.map(e => e.id === id ? { ...e, condition } : e);
    setEquipment(u); saveData("pc_equipment", u);
  };
  const addEquipment = () => {
    if (!newEq.name || !newEq.pricePerNight) return;
    const prefix = newEq.category === "tent" ? "EQ-T" : "EQ-S";
    const eq: Equipment = { id: genId(prefix), name: newEq.name, category: newEq.category, pricePerNight: Number(newEq.pricePerNight), available: true, condition: "Good", currentBookingId: "" };
    const u = [...equipment, eq]; setEquipment(u); saveData("pc_equipment", u);
    setNewEq({ name: "", category: "tent", pricePerNight: "" });
  };

  // ── Check-in / Check-out ─────────────────────────────────────────────────────
  const markCheckedIn = (id: string) => {
    const u = bookings.map(b => b.id === id ? { ...b, checkedIn: true, status: "CheckedIn" as const } : b);
    setBookings(u); saveData("pc_bookings", u);
  };
  const markCheckedOut = (id: string) => {
    const u = bookings.map(b => b.id === id ? { ...b, checkedOut: true, status: "CheckedOut" as const } : b);
    setBookings(u); saveData("pc_bookings", u);
  };
  const markCompleted = (id: string) => {
    // Release equipment
    const booking = bookings.find(b => b.id === id);
    const releasedIds = booking?.equipment.map(e => e.equipmentId) ?? [];
    const updatedEquipment = equipment.map(eq => releasedIds.includes(eq.id) ? { ...eq, available: true, currentBookingId: "" } : eq);
    const u = bookings.map(b => b.id === id ? { ...b, status: "Completed" as const } : b);
    setBookings(u); saveData("pc_bookings", u);
    setEquipment(updatedEquipment); saveData("pc_equipment", updatedEquipment);
  };

  // ── Refund processing ────────────────────────────────────────────────────────
  const processRefund = (id: string, approve: boolean) => {
    const u = refunds.map(r => r.id === id ? { ...r, status: approve ? "Processed" as const : "Rejected" as const } : r);
    setRefunds(u); saveData("pc_refunds", u);
  };

  // ── Report data ──────────────────────────────────────────────────────────────
  const reportData = useMemo(() => {
    const inMonth = bookings.filter(b => b.checkIn.startsWith(reportMonth));
    const revenue = payments.filter(p => p.status === "Verified" && p.date.startsWith(reportMonth)).reduce((s, p) => s + p.amount, 0);
    const byStatus = { Confirmed: 0, Completed: 0, Rejected: 0, Rescheduled: 0, Pending: 0, CheckedIn: 0, CheckedOut: 0 } as Record<string, number>;
    inMonth.forEach(b => { byStatus[b.status] = (byStatus[b.status] ?? 0) + 1; });
    const actCounts: Record<string, number> = {};
    inMonth.forEach(b => b.activities.forEach(a => { actCounts[a.name] = (actCounts[a.name] ?? 0) + a.pax; }));
    const eqCounts: Record<string, number> = {};
    inMonth.forEach(b => b.equipment.forEach(e => { eqCounts[e.name] = (eqCounts[e.name] ?? 0) + 1; }));
    return { total: inMonth.length, revenue, byStatus, actCounts, eqCounts, bookings: inMonth };
  }, [bookings, payments, reportMonth]);

  const tabs: { id: TabId; label: string; badge?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "ongoing", label: "Ongoing", badge: checkedInNow || undefined },
    { id: "approvals", label: "Approvals", badge: (pendingBookings + pendingPayments) || undefined },
    { id: "sites", label: "Manage Sites" },
    { id: "activities", label: "Activities" },
    { id: "equipment", label: "Equipment" },
    { id: "refunds", label: "Refunds", badge: pendingRefunds || undefined },
    { id: "report", label: "Reports" },
  ];

  return (
    <div style={{ fontFamily: "'Lato',sans-serif" }} className="min-h-screen bg-background">
      {reviewBooking && <BookingReviewModal booking={reviewBooking} onClose={() => setReviewBooking(null)} onSubmit={d => handleBookingAction(reviewBooking.id, d)} />}
      {reviewPayment && <PaymentDetailModal payment={reviewPayment} booking={bookings.find(b => b.id === reviewPayment.bookingId)} onClose={() => setReviewPayment(null)} onVerify={() => verifyPayment(reviewPayment.id)} onReject={() => rejectPayment(reviewPayment.id)} />}

      <header className="bg-foreground text-primary-foreground px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <TreePine size={22} className="text-secondary" />
          <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700 }} className="text-lg">Perong Campsite</span>
          <span className="hidden md:inline text-primary-foreground/50 text-sm ml-2">— Staff Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-primary-foreground/70 text-sm hidden md:block">Staff: {userName}</span>
          <button onClick={onLogout} className="flex items-center gap-1 text-primary-foreground/60 hover:text-primary-foreground text-sm"><LogOut size={16} /><span className="hidden md:inline ml-1">Sign out</span></button>
        </div>
      </header>

      <div className="bg-card border-b border-border px-4 overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-4 text-sm border-b-2 transition-colors whitespace-nowrap ${tab === t.id ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t.label}
              {!!t.badge && <span className="bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">{t.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1.6rem" }} className="text-foreground mb-6">Dashboard Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Available Sites", value: `${availableSites}/${campsites.length}`, icon: <TreePine size={20} className="text-primary" />, sub: "campsites" },
                { label: "Pending Approvals", value: String(pendingBookings + pendingPayments), icon: <Clock size={20} className="text-accent" />, sub: "bookings + payments" },
                { label: "Currently Checked In", value: String(checkedInNow), icon: <LogIn size={20} className="text-emerald-600" />, sub: "active guests" },
                { label: "Total Revenue", value: `RM ${totalRevenue}`, icon: <TrendingUp size={20} className="text-primary" />, sub: "verified payments" },
              ].map((stat, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-5">
                  <div className="mb-3">{stat.icon}</div>
                  <p style={{ fontFamily: "'DM Mono',monospace" }} className="text-2xl text-foreground mb-1">{stat.value}</p>
                  <p className="text-sm text-foreground">{stat.label}</p>
                  <p className="text-xs text-muted-foreground">{stat.sub}</p>
                </div>
              ))}
            </div>

            {overdueCheckout.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm font-medium text-blue-800 flex items-center gap-2 mb-3"><Bell size={15} /> {overdueCheckout.length} booking{overdueCheckout.length>1?"s":""} due for check-out today</p>
                {overdueCheckout.map(b => (
                  <div key={b.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-3 mb-2">
                    <div><p className="text-sm text-foreground">{b.guest} · {b.site}</p><p className="text-xs text-muted-foreground">{b.id} · Due: {fmtDate(b.checkOut)}</p></div>
                    <div className="flex gap-2">
                      <button onClick={() => markCheckedOut(b.id)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-blue-700 flex items-center gap-1"><LogOutIcon size={12} /> Check Out</button>
                      <button onClick={() => markCompleted(b.id)} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs hover:opacity-90 flex items-center gap-1"><CheckCircle size={12} /> Complete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600 }} className="text-foreground mb-4">Pending Actions</h3>
            <div className="space-y-3">
              {bookings.filter(b => b.status === "Pending").map(b => (
                <div key={b.id} className="bg-card border border-border rounded-lg px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3"><Clock size={16} className="text-accent shrink-0" />
                    <div><p className="text-sm text-foreground">{b.guest} — <span className="text-muted-foreground">{b.site}</span></p>
                      <p className="text-xs text-muted-foreground">{b.dates} · {b.guests} pax · <span className={b.paymentStatus === "Verified" ? "text-primary" : "text-accent"}>{b.paymentStatus}</span></p></div>
                  </div>
                  <button onClick={() => setReviewBooking(b)} className="bg-primary/10 text-primary px-3 py-1 rounded text-xs hover:bg-primary hover:text-primary-foreground">Review</button>
                </div>
              ))}
              {payments.filter(p => p.status === "Pending").map(p => (
                <div key={p.id} className="bg-card border border-border rounded-lg px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3"><CreditCard size={16} className="text-accent shrink-0" />
                    <div><p className="text-sm text-foreground">{p.guest} — <span className="text-muted-foreground">Payment via {p.method}</span></p>
                      <p className="text-xs text-muted-foreground">{p.bookingId} · {fmtDate(p.date)}</p></div>
                  </div>
                  <button onClick={() => setReviewPayment(p)} className="bg-primary/10 text-primary px-3 py-1 rounded text-xs hover:bg-primary hover:text-primary-foreground">View Proof</button>
                </div>
              ))}
              {pendingBookings === 0 && pendingPayments === 0 && (
                <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground text-sm">
                  <CheckCircle size={32} className="text-primary mx-auto mb-2" /> All caught up!
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ONGOING ── */}
        {tab === "ongoing" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1.6rem" }} className="text-foreground mb-2">Ongoing Bookings</h2>
            <p className="text-muted-foreground text-sm mb-6">Active check-ins, confirmed upcoming, and bookings awaiting check-out.</p>
            {["CheckedIn","Confirmed","CheckedOut"].map(status => {
              const group = bookings.filter(b => b.status === status);
              if (!group.length) return null;
              const label = status === "CheckedIn" ? "🟢 Currently Checked In" : status === "Confirmed" ? "🔵 Confirmed — Arriving Soon" : "🔵 Checked Out — Awaiting Completion";
              return (
                <div key={status} className="mb-8">
                  <h3 className="text-sm font-semibold text-foreground mb-3">{label}</h3>
                  <div className="space-y-3">
                    {group.map(b => (
                      <div key={b.id} className="bg-card border border-border rounded-xl p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                          <div>
                            <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600 }} className="text-foreground">{b.guest}</p>
                            <p style={{ fontFamily: "'DM Mono',monospace" }} className="text-xs text-muted-foreground">{b.id}</p>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full ${bookingStatusStyle[b.status] ?? ""}`}>{b.status}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1"><MapPin size={11} />{b.site}</span>
                          <span className="flex items-center gap-1"><Calendar size={11} />{b.dates}</span>
                          <span className="flex items-center gap-1"><Users size={11} />{b.guests} pax</span>
                          <span className="flex items-center gap-1"><Car size={11} />{b.vehiclePlate}</span>
                        </div>
                        {b.activities.length > 0 && <div className="flex flex-wrap gap-1 mb-2">{b.activities.map(a => <span key={a.activityId} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{a.icon ?? ""} {a.name}</span>)}</div>}
                        {b.equipment.length > 0 && <div className="flex flex-wrap gap-1 mb-2">{b.equipment.map(e => <span key={e.equipmentId} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{e.name} ({e.equipmentId})</span>)}</div>}
                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          <span style={{ fontFamily: "'DM Mono',monospace" }} className="text-sm text-foreground">RM {b.total}</span>
                          <div className="flex gap-2">
                            {b.status === "Confirmed" && !b.checkedIn && (
                              <button onClick={() => markCheckedIn(b.id)} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-emerald-700 flex items-center gap-1"><LogIn size={12} /> Check In</button>
                            )}
                            {b.status === "CheckedIn" && (
                              <button onClick={() => markCheckedOut(b.id)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-blue-700 flex items-center gap-1"><LogOutIcon size={12} /> Check Out</button>
                            )}
                            {b.status === "CheckedOut" && (
                              <button onClick={() => markCompleted(b.id)} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs hover:opacity-90 flex items-center gap-1"><CheckCircle size={12} /> Mark Complete</button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {checkedInNow === 0 && bookings.filter(b => b.status === "Confirmed" || b.status === "CheckedOut").length === 0 && (
              <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm"><Tent size={32} className="mx-auto mb-2 opacity-30" />No ongoing bookings at the moment.</div>
            )}
          </div>
        )}

        {/* ── APPROVALS ── */}
        {tab === "approvals" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1.6rem" }} className="text-foreground mb-2">Approvals</h2>
            <p className="text-muted-foreground text-sm mb-6">Review bookings and verify payments in one place.</p>
            <div className="flex rounded-xl overflow-hidden border border-border mb-8 w-fit">
              {[{ id: "bookings", label: "Booking Requests", badge: pendingBookings },
                { id: "payments", label: "Payment Verifications", badge: pendingPayments }
              ].map(v => (
                <button key={v.id} onClick={() => setApprovalsView(v.id as "bookings"|"payments")}
                  className={`flex items-center gap-2 px-5 py-2.5 text-sm transition-colors ${approvalsView === v.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                  {v.label}
                  {v.badge > 0 && <span className={`text-xs rounded-full w-5 h-5 flex items-center justify-center ${approvalsView === v.id ? "bg-white/20 text-white" : "bg-accent text-accent-foreground"}`}>{v.badge}</span>}
                </button>
              ))}
            </div>

            {approvalsView === "bookings" && (
              <div className="space-y-4">
                {bookings.map(b => (
                  <div key={b.id} className="bg-card border border-border rounded-xl p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600 }} className="text-foreground">{b.guest}</p>
                        <p style={{ fontFamily: "'DM Mono',monospace" }} className="text-xs text-muted-foreground">{b.id} · {b.guestEmail}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`text-xs px-3 py-1 rounded-full ${bookingStatusStyle[b.status] ?? "bg-muted text-muted-foreground"}`}>{b.status}</span>
                        <span className={`text-xs px-3 py-1 rounded-full ${payStatusStyle[b.paymentStatus] ?? "bg-muted text-muted-foreground"}`}>{b.paymentStatus}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><MapPin size={11} />{b.site}</span>
                      <span className="flex items-center gap-1"><Calendar size={11} />{b.dates}</span>
                      <span className="flex items-center gap-1"><Users size={11} />{b.guests} pax</span>
                      <span className="flex items-center gap-1"><Car size={11} />{b.vehiclePlate} ({b.vehicleCount})</span>
                    </div>
                    {b.activities.length > 0 && <div className="flex flex-wrap gap-1 mb-2">{b.activities.map(a => <span key={a.activityId} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{a.name}</span>)}</div>}
                    {b.equipment.length > 0 && <div className="flex flex-wrap gap-1 mb-2">{b.equipment.map(e => <span key={e.equipmentId} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{e.name} ({e.equipmentId})</span>)}</div>}
                    {b.staffFeedback && (
                      <div className="bg-muted rounded-lg p-3 mb-3 text-sm"><p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><MessageSquare size={11} /> Staff note sent</p><p className="text-foreground">{b.staffFeedback}</p></div>
                    )}
                    {b.status === "Rescheduled" && b.suggestedCheckIn && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3 text-sm"><p className="text-xs text-purple-600 mb-1">Suggested dates</p><p className="text-foreground">{fmtDate(b.suggestedCheckIn)} → {fmtDate(b.suggestedCheckOut)}</p></div>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span style={{ fontFamily: "'DM Mono',monospace" }} className="text-sm text-foreground">RM {b.total}</span>
                      {b.status === "Pending" && <button onClick={() => setReviewBooking(b)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:opacity-90"><CheckCircle size={15} /> Review & Respond</button>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {approvalsView === "payments" && (
              <div className="space-y-4">
                {payments.map(p => {
                  const linkedBooking = bookings.find(b => b.id === p.bookingId);
                  return (
                    <div key={p.id} className="bg-card border border-border rounded-xl p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                        <div>
                          <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600 }} className="text-foreground">{p.guest}</p>
                          <p style={{ fontFamily: "'DM Mono',monospace" }} className="text-xs text-muted-foreground">{p.id} · {p.bookingId}</p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full ${payStatusStyle[p.status] ?? "bg-muted text-muted-foreground"}`}>{p.status}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-3">
                        <div className="flex items-center gap-1 text-muted-foreground"><CreditCard size={13} />{p.method}</div>
                        <div className="flex items-center gap-1 text-muted-foreground"><Calendar size={13} />{fmtDate(p.date)}</div>
                        <div style={{ fontFamily: "'DM Mono',monospace" }} className="text-foreground">RM {p.amount}.00</div>
                      </div>
                      {p.proofNote && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-3">
                          <p className="text-xs text-amber-700 font-medium mb-1 flex items-center gap-1"><Eye size={11} /> Payment Proof</p>
                          <p className="text-sm text-foreground">{p.proofNote}</p>
                        </div>
                      )}
                      {linkedBooking && (
                        <p className="text-xs text-muted-foreground mb-3">Linked: {linkedBooking.site} · {linkedBooking.dates} · Booking: <span className={bookingStatusStyle[linkedBooking.status]?.split(" ")[1] ?? ""}>{linkedBooking.status}</span></p>
                      )}
                      {p.status === "Pending" && (
                        <div className="flex gap-3 pt-3 border-t border-border">
                          <button onClick={() => rejectPayment(p.id)} className="flex items-center gap-2 border border-destructive text-destructive px-4 py-2 rounded-lg text-sm hover:bg-destructive/10"><XCircle size={15} /> Reject</button>
                          <button onClick={() => verifyPayment(p.id)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:opacity-90"><CheckCircle size={15} /> Verify Payment</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── MANAGE SITES ── */}
        {tab === "sites" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1.6rem" }} className="text-foreground mb-2">Manage Campsite Availability</h2>
            <p className="text-muted-foreground text-sm mb-8">Changes instantly reflect on the customer side.</p>
            <div className="space-y-3">
              {campsites.map(site => (
                <div key={site.id} className="bg-card border border-border rounded-xl p-5 flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-48">
                    <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600 }} className="text-foreground">{site.name}</p>
                    <p className="text-xs text-muted-foreground">{site.type} · Up to {site.capacity} pax</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {editingPrice === site.id ? (<>
                      <span className="text-sm text-muted-foreground">RM</span>
                      <input type="number" value={priceInput} onChange={e => setPriceInput(e.target.value)} className="w-20 px-2 py-1 rounded border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                      <button onClick={() => savePrice(site.id)} className="text-primary"><Check size={16} /></button>
                      <button onClick={() => setEditingPrice(null)} className="text-muted-foreground"><X size={16} /></button>
                    </>) : (
                      <button onClick={() => { setEditingPrice(site.id); setPriceInput(String(site.price)); }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                        <span style={{ fontFamily: "'DM Mono',monospace" }}>RM {site.price}/night</span><Edit2 size={13} />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-3 py-1 rounded-full ${site.available ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{site.available ? "Available" : "Unavailable"}</span>
                    <button onClick={() => toggleSite(site.id)} className={`relative w-11 h-6 rounded-full transition-colors ${site.available ? "bg-primary" : "bg-muted-foreground/40"}`}>
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${site.available ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ACTIVITIES ── */}
        {tab === "activities" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1.6rem" }} className="text-foreground mb-2">Manage Activities</h2>
            <p className="text-muted-foreground text-sm mb-6">Toggle availability or add new activity packages.</p>
            <div className="space-y-3 mb-8">
              {activities.map(act => (
                <div key={act.id} className="bg-card border border-border rounded-xl p-5 flex flex-wrap items-center gap-4">
                  <div className="text-2xl">{act.icon}</div>
                  <div className="flex-1 min-w-48">
                    <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600 }} className="text-foreground">{act.name}</p>
                    <p className="text-xs text-muted-foreground">{act.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span style={{ fontFamily: "'DM Mono',monospace" }} className="text-sm text-foreground">RM {act.pricePerPax}/pax</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-3 py-1 rounded-full ${act.available ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{act.available ? "Active" : "Inactive"}</span>
                      <button onClick={() => toggleActivity(act.id)} className={`relative w-11 h-6 rounded-full transition-colors ${act.available ? "bg-primary" : "bg-muted-foreground/40"}`}>
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${act.available ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600 }} className="text-foreground mb-4 flex items-center gap-2"><Plus size={16} /> Add New Activity</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div><label className="block text-sm text-foreground mb-1">Activity Name</label><input type="text" value={newAct.name} onChange={e => setNewAct({...newAct, name: e.target.value})} placeholder="e.g. Rock Climbing" className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                <div><label className="block text-sm text-foreground mb-1">Price per Pax (RM)</label><input type="number" value={newAct.pricePerPax} onChange={e => setNewAct({...newAct, pricePerPax: e.target.value})} placeholder="e.g. 50" className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                <div className="md:col-span-2"><label className="block text-sm text-foreground mb-1">Description</label><input type="text" value={newAct.description} onChange={e => setNewAct({...newAct, description: e.target.value})} placeholder="Brief description of the activity" className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                <div><label className="block text-sm text-foreground mb-1">Icon (emoji)</label><input type="text" value={newAct.icon} onChange={e => setNewAct({...newAct, icon: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              </div>
              <button onClick={addActivity} disabled={!newAct.name || !newAct.pricePerPax} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-40 flex items-center gap-2"><Plus size={15} /> Add Activity</button>
            </div>
          </div>
        )}

        {/* ── EQUIPMENT ── */}
        {tab === "equipment" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1.6rem" }} className="text-foreground mb-2">Equipment & Tent Inventory</h2>
            <p className="text-muted-foreground text-sm mb-6">Each item has a unique ID. Track availability, condition, and linked bookings.</p>
            {(["tent","equipment"] as const).map(cat => (
              <div key={cat} className="mb-8">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">{cat === "tent" ? <Tent size={15} /> : <Package size={15} />}{cat === "tent" ? "Tents" : "Camping Equipment"}</h3>
                <div className="space-y-3">
                  {equipment.filter(eq => eq.category === cat).map(eq => (
                    <div key={eq.id} className={`bg-card border rounded-xl p-4 flex flex-wrap items-center gap-4 ${!eq.available ? "border-accent/40" : "border-border"}`}>
                      <div className="flex-1 min-w-48">
                        <div className="flex items-center gap-2">
                          <p className="text-foreground text-sm font-medium">{eq.name}</p>
                          <span style={{ fontFamily: "'DM Mono',monospace" }} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{eq.id}</span>
                        </div>
                        {eq.currentBookingId && <p className="text-xs text-accent mt-0.5">In use: {eq.currentBookingId}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Condition:</span>
                        <select value={eq.condition} onChange={e => updateCondition(eq.id, e.target.value as Equipment["condition"])}
                          className="text-xs border border-border rounded px-2 py-1 bg-input-background text-foreground focus:outline-none">
                          <option>Good</option><option>Fair</option><option>Needs Repair</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-3">
                        <span style={{ fontFamily: "'DM Mono',monospace" }} className="text-xs text-foreground">RM {eq.pricePerNight}/night</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${eq.available ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>{eq.available ? "Available" : "Rented Out"}</span>
                        <button onClick={() => toggleEquipment(eq.id)} className={`relative w-10 h-5 rounded-full transition-colors ${eq.available ? "bg-primary" : "bg-muted-foreground/40"}`}>
                          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${eq.available ? "translate-x-5" : "translate-x-0.5"}`} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600 }} className="text-foreground mb-4 flex items-center gap-2"><Plus size={16} /> Add New Item</h3>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div><label className="block text-sm text-foreground mb-1">Item Name</label><input type="text" value={newEq.name} onChange={e => setNewEq({...newEq, name: e.target.value})} placeholder="e.g. 3-Person Tunnel Tent" className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                <div><label className="block text-sm text-foreground mb-1">Category</label>
                  <select value={newEq.category} onChange={e => setNewEq({...newEq, category: e.target.value as "tent"|"equipment"})} className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="tent">Tent</option><option value="equipment">Equipment</option>
                  </select>
                </div>
                <div><label className="block text-sm text-foreground mb-1">Price / Night (RM)</label><input type="number" value={newEq.pricePerNight} onChange={e => setNewEq({...newEq, pricePerNight: e.target.value})} placeholder="e.g. 25" className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              </div>
              <button onClick={addEquipment} disabled={!newEq.name || !newEq.pricePerNight} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-40 flex items-center gap-2"><Plus size={15} /> Add Item</button>
            </div>
          </div>
        )}

        {/* ── REFUNDS ── */}
        {tab === "refunds" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1.6rem" }} className="text-foreground mb-2">Refund Requests</h2>
            <p className="text-muted-foreground text-sm mb-6">Process refunds from guests whose bookings were rejected or rescheduled.</p>
            {refunds.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm"><Banknote size={32} className="mx-auto mb-2 opacity-30" />No refund requests yet.</div>
            ) : (
              <div className="space-y-4">
                {refunds.map(r => {
                  const linkedBooking = bookings.find(b => b.id === r.bookingId);
                  return (
                    <div key={r.id} className="bg-card border border-border rounded-xl p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                        <div>
                          <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600 }} className="text-foreground">{r.guest}</p>
                          <p style={{ fontFamily: "'DM Mono',monospace" }} className="text-xs text-muted-foreground">{r.id} · Booking: {r.bookingId}</p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full ${r.status === "Processed" ? "bg-primary/10 text-primary" : r.status === "Rejected" ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"}`}>{r.status}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                        <div className="flex items-center gap-1 text-muted-foreground"><Banknote size={13} />RM {r.amount}.00</div>
                        <div className="flex items-center gap-1 text-muted-foreground"><CreditCard size={13} />{r.method}</div>
                        <div className="flex items-center gap-1 text-muted-foreground"><Calendar size={13} />{fmtDate(r.requestedAt)}</div>
                        <div className="text-muted-foreground text-xs">Reason: {r.reason}</div>
                      </div>
                      {linkedBooking && <p className="text-xs text-muted-foreground mb-3">Booking: {linkedBooking.site} · {linkedBooking.dates}</p>}
                      {r.status === "Pending" && (
                        <div className="flex gap-3 pt-3 border-t border-border">
                          <button onClick={() => processRefund(r.id, false)} className="flex items-center gap-2 border border-destructive text-destructive px-4 py-2 rounded-lg text-sm hover:bg-destructive/10"><XCircle size={15} /> Reject</button>
                          <button onClick={() => processRefund(r.id, true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:opacity-90"><CheckCircle size={15} /> Process Refund</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── REPORT ── */}
        {tab === "report" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1.6rem" }} className="text-foreground mb-2">Monthly Booking Report</h2>
            <p className="text-muted-foreground text-sm mb-6">A summary of all bookings, revenue, and activity data for the selected month.</p>
            <div className="flex items-center gap-4 mb-8">
              <label className="text-sm text-foreground">Select Month:</label>
              <input type="month" value={reportMonth} onChange={e => setReportMonth(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Bookings", value: String(reportData.total), sub: "that month" },
                { label: "Revenue", value: `RM ${reportData.revenue}`, sub: "verified payments" },
                { label: "Completed", value: String(reportData.byStatus.Completed ?? 0), sub: "stays finished" },
                { label: "Rejected", value: String(reportData.byStatus.Rejected ?? 0), sub: "bookings rejected" },
              ].map((s, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-5">
                  <p style={{ fontFamily: "'DM Mono',monospace" }} className="text-2xl text-foreground mb-1">{s.value}</p>
                  <p className="text-sm text-foreground">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Status breakdown */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600 }} className="text-foreground mb-4 flex items-center gap-2"><BarChart2 size={16} /> Booking Status Breakdown</h3>
                {Object.entries(reportData.byStatus).filter(([, v]) => v > 0).map(([status, count]) => (
                  <div key={status} className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-muted-foreground w-28">{status}</span>
                    <div className="flex-1 bg-muted rounded-full h-2"><div className="bg-primary h-2 rounded-full" style={{ width: `${reportData.total > 0 ? (count / reportData.total) * 100 : 0}%` }} /></div>
                    <span style={{ fontFamily: "'DM Mono',monospace" }} className="text-sm text-foreground w-8 text-right">{count}</span>
                  </div>
                ))}
                {reportData.total === 0 && <p className="text-muted-foreground text-sm">No bookings this month.</p>}
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600 }} className="text-foreground mb-4 flex items-center gap-2"><ActivityIcon size={16} /> Activity Participation</h3>
                {Object.keys(reportData.actCounts).length === 0 ? <p className="text-muted-foreground text-sm">No activities booked.</p> : (
                  Object.entries(reportData.actCounts).map(([name, pax]) => (
                    <div key={name} className="flex justify-between text-sm mb-2 border-b border-border pb-1">
                      <span className="text-foreground">{name}</span>
                      <span style={{ fontFamily: "'DM Mono',monospace" }} className="text-muted-foreground">{pax} pax</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 mb-8">
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600 }} className="text-foreground mb-4 flex items-center gap-2"><Package size={16} /> Equipment Usage</h3>
              {Object.keys(reportData.eqCounts).length === 0 ? <p className="text-muted-foreground text-sm">No equipment rented.</p> : (
                <div className="flex flex-wrap gap-3">
                  {Object.entries(reportData.eqCounts).map(([name, count]) => (
                    <div key={name} className="bg-muted rounded-lg px-4 py-2 text-sm">
                      <p className="text-foreground">{name}</p>
                      <p style={{ fontFamily: "'DM Mono',monospace" }} className="text-muted-foreground text-xs">{count} rental{count > 1 ? "s" : ""}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Booking list */}
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600 }} className="text-foreground mb-4 flex items-center gap-2"><FileText size={16} /> Booking Details</h3>
            {reportData.bookings.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-6 text-center text-muted-foreground text-sm">No bookings in this period.</div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      {["ID","Guest","Campsite","Dates","Guests","Total","Status","Payment"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.bookings.map((b, i) => (
                      <tr key={b.id} className={i % 2 === 0 ? "bg-card" : "bg-muted/30"}>
                        <td style={{ fontFamily: "'DM Mono',monospace" }} className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{b.id}</td>
                        <td className="px-4 py-3 text-foreground whitespace-nowrap">{b.guest}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{b.site}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{b.dates}</td>
                        <td className="px-4 py-3 text-muted-foreground">{b.guests}</td>
                        <td style={{ fontFamily: "'DM Mono',monospace" }} className="px-4 py-3 text-foreground whitespace-nowrap">RM {b.total}</td>
                        <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${bookingStatusStyle[b.status] ?? "bg-muted text-muted-foreground"}`}>{b.status}</span></td>
                        <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${payStatusStyle[b.paymentStatus] ?? "bg-muted text-muted-foreground"}`}>{b.paymentStatus}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Inline Check icon
function Check({ size, className }: { size: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12" /></svg>;
}
