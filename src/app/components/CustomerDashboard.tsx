import { useState, useCallback } from "react";
import {
  TreePine, MapPin, Users, Calendar, CreditCard, CheckCircle, Clock,
  LogOut, Star, Tent, ChevronRight, X, MessageSquare, CalendarCheck,
  RefreshCw, Info, ChevronDown, ChevronUp, XCircle, AlertCircle,
  Banknote, ArrowLeftRight, Upload, Car, Package, Activity as ActivityIcon,
  LogIn, LogOut as LogOutIcon, Bell,
} from "lucide-react";
import type {
  Campsite, Booking, Payment, Activity, Equipment,
  BookingActivity, BookingEquipment, RefundRequest,
} from "../App";
import { saveData } from "../App";

interface CustomerDashboardProps {
  userName: string;
  userEmail: string;
  onLogout: () => void;
  campsites: Campsite[];
  activities: Activity[];
  equipment: Equipment[];
  setEquipment: (e: Equipment[]) => void;
  bookings: Booking[];
  setBookings: (b: Booking[]) => void;
  payments: Payment[];
  setPayments: (p: Payment[]) => void;
  refunds: RefundRequest[];
  setRefunds: (r: RefundRequest[]) => void;
}

type TabId = "browse" | "booking" | "payment" | "mybookings";
type BookingStep = "site" | "extras" | "review" | "done";
type PayStep = "method" | "proof" | "done";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(d: string): string {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return d; }
}
function nightsBetween(a: string, b: string): number {
  if (!a || !b) return 1;
  return Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
}
function genId(prefix: string) {
  return `${prefix}-${Math.floor(Math.random() * 9000 + 1000)}`;
}
function todayStr() { return new Date().toISOString().split("T")[0]; }

const statusColor: Record<string, string> = {
  Confirmed:  "bg-primary/10 text-primary",
  Pending:    "bg-accent/10 text-accent",
  Completed:  "bg-muted text-muted-foreground",
  Rejected:   "bg-destructive/10 text-destructive",
  Rescheduled:"bg-purple-100 text-purple-700",
  CheckedIn:  "bg-emerald-100 text-emerald-700",
  CheckedOut: "bg-blue-100 text-blue-700",
};
const payColor: Record<string, string> = {
  Unpaid:         "text-destructive",
  ProofSubmitted: "text-accent",
  Verified:       "text-primary",
  Rejected:       "text-destructive",
};

// ─── Campsite Popup ────────────────────────────────────────────────────────────
function CampsitePopup({ site, onClose, onBook }: { site: Campsite; onClose: () => void; onBook: (s: Campsite) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="relative h-52 overflow-hidden">
          <img src={site.img} alt={site.name} className="w-full h-full object-cover" />
          <button onClick={onClose} className="absolute top-3 right-3 bg-black/40 text-white rounded-full p-1 hover:bg-black/60"><X size={18} /></button>
          <span className={`absolute top-3 left-3 text-xs px-2 py-1 rounded-full font-medium ${site.available ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {site.available ? "Available" : "Unavailable"}
          </span>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between mb-1">
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1.2rem" }} className="text-foreground">{site.name}</h3>
            <div className="flex items-center gap-1 text-accent text-sm"><Star size={13} className="fill-accent" />{site.rating}</div>
          </div>
          <p className="text-xs text-muted-foreground mb-3">{site.type}</p>
          <p className="text-sm text-foreground/80 mb-4 leading-relaxed">{site.description}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
            <span className="flex items-center gap-1"><Users size={12} /> Up to {site.capacity} pax</span>
            <span className="flex items-center gap-1"><MapPin size={12} /> Perong Forest</span>
          </div>
          {site.gallery.length > 0 && (
            <div className="flex gap-2 mb-4">{site.gallery.map((g, i) => <img key={i} src={g} alt="" className="flex-1 h-20 object-cover rounded-lg" />)}</div>
          )}
          <div className="flex flex-wrap gap-1 mb-5">
            {site.features.map(f => <span key={f} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{f}</span>)}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span style={{ fontFamily: "'DM Mono',monospace" }} className="text-foreground font-semibold">RM {site.price}</span>
              <span className="text-muted-foreground text-xs"> / night</span>
            </div>
            <button disabled={!site.available} onClick={() => { onBook(site); onClose(); }}
              className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed">
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Refund Modal ─────────────────────────────────────────────────────────────
function RefundModal({ booking, onClose, onSubmit }: { booking: Booking; onClose: () => void; onSubmit: (method: string) => void }) {
  const [step, setStep] = useState<"info"|"method"|"done">("info");
  const [method, setMethod] = useState("bank");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center"><Banknote size={18} className="text-destructive" /></div>
            <div>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700 }} className="text-foreground text-lg">{step === "done" ? "Refund Requested" : "Request a Refund"}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{booking.id} · {booking.site}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>
        {step === "info" && (<>
          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 mb-5 text-sm">
            <p className="font-medium text-destructive mb-1">{booking.status === "Rejected" ? "Booking rejected" : "Booking rescheduled"}</p>
            {booking.staffFeedback && <p className="text-foreground/80 text-xs leading-relaxed">{booking.staffFeedback}</p>}
          </div>
          <div className="bg-muted rounded-lg p-4 mb-5 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Booking</span><span style={{ fontFamily: "'DM Mono',monospace" }}>{booking.id}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Original dates</span><span>{booking.dates}</span></div>
            <div className="flex justify-between border-t border-border pt-2 mt-2">
              <span className="text-muted-foreground font-medium">Refund amount</span>
              <span style={{ fontFamily: "'DM Mono',monospace" }} className="font-semibold">RM {booking.total}.00</span>
            </div>
          </div>
          <button onClick={() => setStep("method")} className="w-full bg-primary text-primary-foreground py-3 rounded-lg text-sm hover:opacity-90 flex items-center justify-center gap-2">
            <ArrowLeftRight size={15} /> Select Refund Method
          </button>
        </>)}
        {step === "method" && (<>
          <p className="text-sm text-muted-foreground mb-4">Choose how you'd like to receive your refund.</p>
          <div className="space-y-3 mb-5">
            {[{ id: "bank", label: "Bank Transfer", sub: "3–5 business days" },
              { id: "ewallet", label: "e-Wallet Refund", sub: "TnG / GrabPay / Boost — 1–2 days" },
              { id: "original", label: "Refund to Original Payment", sub: "Same card / FPX — 5–7 days" }
            ].map(m => (
              <button key={m.id} onClick={() => setMethod(m.id)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-lg border transition-colors text-left ${method === m.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted"}`}>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${method === m.id ? "border-primary" : "border-muted-foreground"}`}>
                  {method === m.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <div><p className="text-foreground text-sm">{m.label}</p><p className="text-muted-foreground text-xs">{m.sub}</p></div>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep("info")} className="flex-1 border border-border text-foreground py-2 rounded-lg text-sm hover:bg-muted">Back</button>
            <button onClick={() => { onSubmit(method); setStep("done"); }} className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-sm hover:opacity-90">Submit Request</button>
          </div>
        </>)}
        {step === "done" && (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={28} className="text-primary" /></div>
            <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1.1rem" }} className="text-foreground mb-2">Refund Request Submitted</p>
            <p className="text-muted-foreground text-sm mb-5 leading-relaxed">Your refund of <span className="text-foreground font-medium">RM {booking.total}.00</span> has been submitted. You'll hear from us within 24 hours.</p>
            <button onClick={onClose} className="bg-primary text-primary-foreground px-8 py-2 rounded-lg text-sm hover:opacity-90">Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Notification Banners ─────────────────────────────────────────────────────
function NotificationBanner({ bookings, onAcceptReschedule, onDeclineReschedule, onRequestRefund, onCheckIn, onCheckOut }:
  { bookings: Booking[]; onAcceptReschedule: (id: string) => void; onDeclineReschedule: (id: string) => void; onRequestRefund: (b: Booking) => void; onCheckIn: (id: string) => void; onCheckOut: (id: string) => void }) {
  const today = todayStr();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const notifications = bookings.filter(b => {
    if (b.status === "Rescheduled" || b.status === "Rejected") return true;
    if (b.status === "Confirmed" && b.checkIn <= today && !b.checkedIn) return true;
    if (b.status === "CheckedIn" && b.checkOut <= today && !b.checkedOut) return true;
    return false;
  });

  if (!notifications.length) return null;

  return (
    <div className="mb-6 space-y-3">
      {notifications.map(b => {
        const isCheckInDue = b.status === "Confirmed" && b.checkIn <= today && !b.checkedIn;
        const isCheckOutDue = b.status === "CheckedIn" && b.checkOut <= today && !b.checkedOut;
        const isActionable = b.status === "Rescheduled" || b.status === "Rejected";
        const bgClass = isActionable ? (b.status === "Rescheduled" ? "border-purple-300 bg-purple-50" : "border-destructive/30 bg-destructive/5")
          : isCheckInDue ? "border-emerald-300 bg-emerald-50" : "border-blue-300 bg-blue-50";
        const icon = isActionable ? (b.status === "Rescheduled" ? <CalendarCheck size={18} className="text-purple-600 shrink-0 mt-0.5" /> : <XCircle size={18} className="text-destructive shrink-0 mt-0.5" />)
          : isCheckInDue ? <LogIn size={18} className="text-emerald-600 shrink-0 mt-0.5" /> : <LogOutIcon size={18} className="text-blue-600 shrink-0 mt-0.5" />;
        const title = isActionable ? (b.status === "Rescheduled" ? "Your booking has been rescheduled" : "Your booking was not approved")
          : isCheckInDue ? "Time to check in!" : "Time to check out!";
        return (
          <div key={b.id} className={`border rounded-xl overflow-hidden ${bgClass}`}>
            <div className="px-5 py-4 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">{icon}
                <div><p className="text-sm font-medium text-foreground">{title}</p><p className="text-xs text-muted-foreground mt-0.5">{b.site} · {b.id}</p></div>
              </div>
              <button onClick={() => setExpanded(p => ({ ...p, [b.id]: !p[b.id] }))} className="text-muted-foreground hover:text-foreground shrink-0">
                {expanded[b.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
            {expanded[b.id] && (
              <div className="px-5 pb-4 border-t border-current/10">
                {b.staffFeedback && <div className="bg-white/60 rounded-lg p-3 my-3"><p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><MessageSquare size={11} /> Staff note</p><p className="text-sm text-foreground">{b.staffFeedback}</p></div>}
                {b.status === "Rescheduled" && b.suggestedCheckIn && (
                  <div className="bg-white/60 rounded-lg p-3 mb-3"><p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Calendar size={11} /> Suggested new dates</p>
                    <p className="text-sm text-foreground font-medium">{fmtDate(b.suggestedCheckIn)} → {fmtDate(b.suggestedCheckOut)}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  {b.status === "Rescheduled" && <button onClick={() => onAcceptReschedule(b.id)} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-purple-700 flex items-center gap-1.5"><CheckCircle size={13} /> Accept new dates</button>}
                  {isActionable && <button onClick={() => onDeclineReschedule(b.id)} className="border border-border text-foreground px-4 py-2 rounded-lg text-xs hover:bg-muted flex items-center gap-1.5"><RefreshCw size={13} /> Make new booking</button>}
                  {isActionable && b.paymentStatus === "Verified" && <button onClick={() => onRequestRefund(b)} className="bg-destructive/10 text-destructive border border-destructive/30 px-4 py-2 rounded-lg text-xs font-medium hover:bg-destructive/20 flex items-center gap-1.5"><Banknote size={13} /> Request Refund</button>}
                  {isCheckInDue && <button onClick={() => onCheckIn(b.id)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-emerald-700 flex items-center gap-1.5"><LogIn size={13} /> Check In Now</button>}
                  {isCheckOutDue && <button onClick={() => onCheckOut(b.id)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-blue-700 flex items-center gap-1.5"><LogOutIcon size={13} /> Check Out Now</button>}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN CUSTOMER DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export function CustomerDashboard({ userName, userEmail, onLogout, campsites, activities, equipment, setEquipment, bookings, setBookings, payments, setPayments, refunds, setRefunds }: CustomerDashboardProps) {
  const [tab, setTab] = useState<TabId>("browse");
  const [popupSite, setPopupSite] = useState<Campsite | null>(null);
  const [refundBooking, setRefundBooking] = useState<Booking | null>(null);

  // Booking wizard state
  const [selectedSite, setSelectedSite] = useState<Campsite | null>(null);
  const [bookingStep, setBookingStep] = useState<BookingStep>("site");
  const [form, setForm] = useState({ checkIn: "", checkOut: "", guests: "2", name: userName, phone: "", vehiclePlate: "", vehicleCount: "1" });
  const [selectedActivities, setSelectedActivities] = useState<BookingActivity[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<BookingEquipment[]>([]);
  const [lastBookingId, setLastBookingId] = useState<string | null>(null);
  const [lastBookingTotal, setLastBookingTotal] = useState(0);

  // Payment state
  const [payStep, setPayStep] = useState<PayStep>("method");
  const [payMethod, setPayMethod] = useState("fpx");
  const [payProofNote, setPayProofNote] = useState("");
  const [payingForId, setPayingForId] = useState<string | null>(null);

  const myBookings = bookings.filter(b => b.ownerId === userEmail);
  const today = todayStr();

  const notifCount = myBookings.filter(b =>
    b.status === "Rescheduled" || b.status === "Rejected" ||
    (b.status === "Confirmed" && b.checkIn <= today && !b.checkedIn) ||
    (b.status === "CheckedIn" && b.checkOut <= today && !b.checkedOut)
  ).length;
  const unpaidCount = myBookings.filter(b => b.paymentStatus === "Unpaid" && b.status !== "Rejected" && b.status !== "Declined").length;

  const nights = form.checkIn && form.checkOut ? nightsBetween(form.checkIn, form.checkOut) : 1;
  const siteCost = selectedSite ? selectedSite.price * nights : 0;
  const activitiesCost = selectedActivities.reduce((s, a) => s + a.pax * a.pricePerPax, 0);
  const equipmentCost = selectedEquipment.reduce((s, e) => s + e.nights * e.pricePerNight, 0);
  const totalCost = siteCost + activitiesCost + equipmentCost;

  const handleBook = (site: Campsite) => { setSelectedSite(site); setBookingStep("site"); setTab("booking"); };

  const toggleActivity = (act: Activity) => {
    setSelectedActivities(prev => {
      const exists = prev.find(a => a.activityId === act.id);
      if (exists) return prev.filter(a => a.activityId !== act.id);
      return [...prev, { activityId: act.id, name: act.name, pax: Number(form.guests) || 1, pricePerPax: act.pricePerPax }];
    });
  };

  const toggleEquipment = (eq: Equipment) => {
    setSelectedEquipment(prev => {
      const exists = prev.find(e => e.equipmentId === eq.id);
      if (exists) return prev.filter(e => e.equipmentId !== eq.id);
      return [...prev, { equipmentId: eq.id, name: eq.name, nights, pricePerNight: eq.pricePerNight }];
    });
  };

  const handleConfirmBooking = () => {
    const newId = genId("BK");
    const newBooking: Booking = {
      id: newId, guest: form.name, guestEmail: userEmail, phone: form.phone,
      vehiclePlate: form.vehiclePlate, vehicleCount: Number(form.vehicleCount),
      siteId: selectedSite!.id, site: selectedSite!.name,
      checkIn: form.checkIn, checkOut: form.checkOut,
      dates: `${fmtDate(form.checkIn)} – ${fmtDate(form.checkOut)}`,
      guests: Number(form.guests),
      activities: selectedActivities,
      equipment: selectedEquipment,
      siteCost, activitiesCost, equipmentCost, total: totalCost,
      status: "Pending", staffFeedback: "", suggestedCheckIn: "", suggestedCheckOut: "",
      paymentStatus: "Unpaid", paymentMethod: "", paymentProofNote: "", paymentDate: "",
      checkedIn: false, checkedOut: false, _isNew: true, ownerId: userEmail,
    };
    // Mark equipment as unavailable
    const updatedEquipment = equipment.map(eq =>
      selectedEquipment.find(se => se.equipmentId === eq.id) ? { ...eq, available: false, currentBookingId: newId } : eq
    );
    const updatedBookings = [...bookings, newBooking];
    setBookings(updatedBookings); saveData("pc_bookings", updatedBookings);
    setEquipment(updatedEquipment); saveData("pc_equipment", updatedEquipment);
    setLastBookingId(newId); setLastBookingTotal(totalCost);
    setBookingStep("done");
  };

  const handleGoToPay = (bookingId: string) => {
    setPayingForId(bookingId); setPayStep("method"); setPayProofNote(""); setTab("payment");
  };

  const handleSubmitPayment = () => {
    const bk = bookings.find(b => b.id === payingForId);
    if (!bk) return;
    const newPaymentId = genId("PAY");
    const updatedBookings = bookings.map(b => b.id === payingForId ? { ...b, paymentStatus: "ProofSubmitted" as const, paymentMethod: payMethod, paymentProofNote: payProofNote, paymentDate: today } : b);
    const newPayment: Payment = { id: newPaymentId, bookingId: payingForId!, guest: bk.guest, amount: bk.total, method: payMethod, proofNote: payProofNote, date: today, status: "Pending" };
    const updatedPayments = [...payments.filter(p => p.bookingId !== payingForId), newPayment];
    setBookings(updatedBookings); saveData("pc_bookings", updatedBookings);
    setPayments(updatedPayments); saveData("pc_payments", updatedPayments);
    setPayStep("done");
  };

  const handleAcceptReschedule = useCallback((id: string) => {
    const updated = bookings.map(b => b.id !== id ? b : { ...b, status: "Confirmed" as const, checkIn: b.suggestedCheckIn, checkOut: b.suggestedCheckOut, dates: `${fmtDate(b.suggestedCheckIn)} – ${fmtDate(b.suggestedCheckOut)}` });
    setBookings(updated); saveData("pc_bookings", updated);
  }, [bookings, setBookings]);

  const handleDeclineReschedule = useCallback((id: string) => {
    const updated = bookings.map(b => b.id === id ? { ...b, status: "Declined" as const } : b);
    setBookings(updated); saveData("pc_bookings", updated); setTab("browse");
  }, [bookings, setBookings]);

  const handleCheckIn = (id: string) => {
    const updated = bookings.map(b => b.id === id ? { ...b, checkedIn: true, status: "CheckedIn" as const } : b);
    setBookings(updated); saveData("pc_bookings", updated);
  };

  const handleCheckOut = (id: string) => {
    const updated = bookings.map(b => b.id === id ? { ...b, checkedOut: true, status: "CheckedOut" as const } : b);
    setBookings(updated); saveData("pc_bookings", updated);
  };

  const handleSubmitRefund = (booking: Booking, method: string) => {
    const newRefund: RefundRequest = {
      id: genId("REF"), bookingId: booking.id, guest: booking.guest,
      amount: booking.total, method, reason: booking.status,
      status: "Pending", requestedAt: today,
    };
    const updated = [...refunds, newRefund];
    setRefunds(updated); saveData("pc_refunds", updated);
    setRefundBooking(null);
  };

  const availableEquipment = equipment.filter(eq => eq.available);

  const tabs: { id: TabId; label: string; badge?: number }[] = [
    { id: "browse", label: "Browse Campsites" },
    { id: "booking", label: "Make a Booking" },
    { id: "payment", label: "Payment" },
    { id: "mybookings", label: "My Bookings", badge: (notifCount + unpaidCount) || undefined },
  ];

  const payingForBooking = payingForId ? bookings.find(b => b.id === payingForId) : null;

  return (
    <div style={{ fontFamily: "'Lato',sans-serif" }} className="min-h-screen bg-background">
      {popupSite && <CampsitePopup site={popupSite} onClose={() => setPopupSite(null)} onBook={handleBook} />}
      {refundBooking && <RefundModal booking={refundBooking} onClose={() => setRefundBooking(null)} onSubmit={m => handleSubmitRefund(refundBooking, m)} />}

      {/* Header */}
      <header className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <TreePine size={22} className="text-secondary" />
          <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700 }} className="text-lg">Perong Campsite</span>
          <span className="hidden md:inline text-primary-foreground/50 text-sm ml-2">— Guest Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-primary-foreground/80 text-sm hidden md:block">Hello, {userName}</span>
          <button onClick={onLogout} className="flex items-center gap-1 text-primary-foreground/70 hover:text-primary-foreground text-sm"><LogOut size={16} /><span className="hidden md:inline ml-1">Sign out</span></button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-card border-b border-border px-6 overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-4 text-sm border-b-2 transition-colors whitespace-nowrap ${tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t.label}
              {!!t.badge && <span className="bg-destructive text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{t.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ── BROWSE ── */}
        {tab === "browse" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1.6rem" }} className="text-foreground mb-2">Available Campsites</h2>
            <p className="text-muted-foreground text-sm mb-8">Click a site to view details, then book your stay.</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campsites.map(site => (
                <div key={site.id} onClick={() => setPopupSite(site)}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer group">
                  <div className="relative h-44 overflow-hidden">
                    <img src={site.img} alt={site.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <span className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full font-medium ${site.available ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {site.available ? "Available" : "Unavailable"}
                    </span>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium bg-black/50 px-3 py-1.5 rounded-full flex items-center gap-1.5"><Info size={13} /> View details</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-1">
                      <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600 }} className="text-foreground">{site.name}</h3>
                      <div className="flex items-center gap-1 text-accent text-sm"><Star size={13} className="fill-accent" />{site.rating}</div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{site.type}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1"><Users size={12} /> Up to {site.capacity} pax</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {site.features.map(f => <span key={f} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{f}</span>)}
                    </div>
                    <div className="flex items-center justify-between">
                      <div><span style={{ fontFamily: "'DM Mono',monospace" }} className="text-foreground">RM {site.price}</span><span className="text-muted-foreground text-xs"> / night</span></div>
                      <button disabled={!site.available} onClick={e => { e.stopPropagation(); handleBook(site); }}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed">Book Now</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── BOOKING WIZARD ── */}
        {tab === "booking" && (
          <div className="max-w-2xl mx-auto">
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1.6rem" }} className="text-foreground mb-6">Make a Booking</h2>

            {!selectedSite ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <Tent size={40} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No campsite selected yet.</p>
                <button onClick={() => setTab("browse")} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm hover:opacity-90">Browse Campsites</button>
              </div>
            ) : bookingStep === "site" ? (
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Selected Site</p>
                    <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600 }} className="text-foreground">{selectedSite.name}</p>
                    <p className="text-sm text-muted-foreground">RM {selectedSite.price}/night · Up to {selectedSite.capacity} pax</p>
                  </div>
                  <button onClick={() => setSelectedSite(null)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm text-foreground mb-1">Check-in <span className="text-destructive">*</span></label>
                      <input type="date" value={form.checkIn} onChange={e => setForm({...form, checkIn: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                    <div><label className="block text-sm text-foreground mb-1">Check-out <span className="text-destructive">*</span></label>
                      <input type="date" value={form.checkOut} onChange={e => setForm({...form, checkOut: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                  </div>
                  <div><label className="block text-sm text-foreground mb-1">Guests <span className="text-destructive">*</span></label>
                    <select value={form.guests} onChange={e => setForm({...form, guests: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      {Array.from({ length: selectedSite.capacity }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n} guest{n > 1 ? "s" : ""}</option>)}
                    </select>
                  </div>
                  <div><label className="block text-sm text-foreground mb-1">Full Name <span className="text-destructive">*</span></label>
                    <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                  <div><label className="block text-sm text-foreground mb-1">Phone <span className="text-destructive">*</span></label>
                    <input type="tel" placeholder="+60 12-345 6789" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm text-foreground mb-1 flex items-center gap-1"><Car size={13} /> Vehicle Plate <span className="text-destructive">*</span></label>
                      <input type="text" placeholder="e.g. WXY 1234" value={form.vehiclePlate} onChange={e => setForm({...form, vehiclePlate: e.target.value.toUpperCase()})} className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring uppercase" /></div>
                    <div><label className="block text-sm text-foreground mb-1 flex items-center gap-1"><Car size={13} /> No. of Vehicles <span className="text-destructive">*</span></label>
                      <select value={form.vehicleCount} onChange={e => setForm({...form, vehicleCount: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} vehicle{n>1?"s":""}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1"><AlertCircle size={11} /> Vehicle plate and count are mandatory for site access.</p>
                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1"><AlertCircle size={11} /> If multiple vehicles are present, add a coma(,) before typing the next plate number.</p>
                <div className="bg-muted rounded-lg p-4 mt-5 flex items-center justify-between">
                  <div><p className="text-sm text-muted-foreground">{nights} night{nights>1?"s":""} · {form.guests} pax</p>
                    <p style={{ fontFamily: "'DM Mono',monospace" }} className="text-foreground">RM {siteCost}.00 site</p></div>
                  <button onClick={() => setBookingStep("extras")} disabled={!form.checkIn || !form.checkOut || !form.name || !form.phone || !form.vehiclePlate}
                    className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-40 flex items-center gap-1">
                    Next: Activities & Equipment <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ) : bookingStep === "extras" ? (
              <div className="space-y-6">
                {/* Activities */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600 }} className="text-foreground mb-1 flex items-center gap-2"><ActivityIcon size={16} /> Additional Activities</h3>
                  <p className="text-xs text-muted-foreground mb-4">Optional — select any activities you'd like to add.</p>
                  <div className="space-y-3">
                    {activities.filter(a => a.available).map(act => {
                      const selected = !!selectedActivities.find(a => a.activityId === act.id);
                      return (
                        <button key={act.id} onClick={() => toggleActivity(act)}
                          className={`w-full flex items-start gap-4 px-4 py-4 rounded-lg border transition-colors text-left ${selected ? "border-primary bg-primary/5" : "border-border hover:bg-muted"}`}>
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 ${selected ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                            {selected && <Check size={12} className="text-white" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-foreground text-sm font-medium">{act.icon} {act.name}</p>
                              <span style={{ fontFamily: "'DM Mono',monospace" }} className="text-sm text-foreground">RM {act.pricePerPax}/pax</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{act.description}</p>
                            {selected && <p className="text-xs text-primary mt-1">{Number(form.guests)} pax × RM {act.pricePerPax} = RM {Number(form.guests)*act.pricePerPax}</p>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Equipment Rental */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600 }} className="text-foreground mb-1 flex items-center gap-2"><Package size={16} /> Tent & Equipment Rental</h3>
                  <p className="text-xs text-muted-foreground mb-4">Optional — items are rented per night. Each item has its own ID.</p>
                  {(["tent","equipment"] as const).map(cat => (
                    <div key={cat} className="mb-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">{cat === "tent" ? "🏕️ Tents" : "🎒 Equipment"}</p>
                      <div className="space-y-2">
                        {availableEquipment.filter(eq => eq.category === cat).map(eq => {
                          const sel = !!selectedEquipment.find(e => e.equipmentId === eq.id);
                          return (
                            <button key={eq.id} onClick={() => toggleEquipment(eq)}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors text-left ${sel ? "border-primary bg-primary/5" : "border-border hover:bg-muted"}`}>
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${sel ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                                {sel && <Check size={10} className="text-white" />}
                              </div>
                              <div className="flex-1 flex items-center justify-between">
                                <div>
                                  <p className="text-foreground text-sm">{eq.name}</p>
                                  <p className="text-xs text-muted-foreground">{eq.id} · Condition: {eq.condition}</p>
                                </div>
                                <span style={{ fontFamily: "'DM Mono',monospace" }} className="text-sm text-foreground shrink-0 ml-2">RM {eq.pricePerNight}/night</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cost summary */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <h4 className="text-foreground text-sm font-medium mb-3">Cost Summary</h4>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between text-muted-foreground"><span>Site ({nights} night{nights>1?"s":""})</span><span style={{ fontFamily: "'DM Mono',monospace" }}>RM {siteCost}</span></div>
                    {activitiesCost > 0 && <div className="flex justify-between text-muted-foreground"><span>Activities</span><span style={{ fontFamily: "'DM Mono',monospace" }}>RM {activitiesCost}</span></div>}
                    {equipmentCost > 0 && <div className="flex justify-between text-muted-foreground"><span>Equipment rental</span><span style={{ fontFamily: "'DM Mono',monospace" }}>RM {equipmentCost}</span></div>}
                    <div className="flex justify-between text-foreground font-semibold border-t border-border pt-2 mt-2"><span>Total</span><span style={{ fontFamily: "'DM Mono',monospace" }}>RM {totalCost}</span></div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setBookingStep("site")} className="flex-1 border border-border text-foreground py-2 rounded-lg text-sm hover:bg-muted">Back</button>
                    <button onClick={() => setBookingStep("review")} className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-sm hover:opacity-90 flex items-center justify-center gap-1">
                      Review Booking <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ) : bookingStep === "review" ? (
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600 }} className="text-foreground mb-5">Review & Confirm</h3>
                <div className="space-y-2 text-sm mb-5">
                  {[["Campsite", selectedSite.name], ["Dates", `${fmtDate(form.checkIn)} – ${fmtDate(form.checkOut)}`], ["Duration", `${nights} night${nights>1?"s":""}`],
                    ["Guests", `${form.guests} pax`], ["Name", form.name], ["Phone", form.phone],
                    ["Vehicle", `${form.vehiclePlate} · ${form.vehicleCount} vehicle${Number(form.vehicleCount)>1?"s":""}`]
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground">{label}</span><span className="text-foreground">{val}</span></div>
                  ))}
                  {selectedActivities.length > 0 && (
                    <div className="border-b border-border pb-2">
                      <span className="text-muted-foreground block mb-1">Activities</span>
                      {selectedActivities.map(a => <p key={a.activityId} className="text-foreground text-xs">{a.name} × {a.pax} pax = RM {a.pax*a.pricePerPax}</p>)}
                    </div>
                  )}
                  {selectedEquipment.length > 0 && (
                    <div className="border-b border-border pb-2">
                      <span className="text-muted-foreground block mb-1">Equipment</span>
                      {selectedEquipment.map(e => <p key={e.equipmentId} className="text-foreground text-xs">{e.name} ({e.equipmentId}) × {e.nights} nights = RM {e.nights*e.pricePerNight}</p>)}
                    </div>
                  )}
                  <div className="flex justify-between pt-1"><span className="text-foreground font-semibold">Total</span><span style={{ fontFamily: "'DM Mono',monospace" }} className="text-foreground font-semibold">RM {totalCost}.00</span></div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setBookingStep("extras")} className="flex-1 border border-border text-foreground py-2 rounded-lg text-sm hover:bg-muted">Edit</button>
                  <button onClick={handleConfirmBooking} className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-sm hover:opacity-90">Confirm Booking</button>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <CheckCircle size={48} className="text-primary mx-auto mb-4" />
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1.3rem" }} className="text-foreground mb-2">Booking Submitted!</h3>
                <p className="text-muted-foreground text-sm mb-2">Awaiting staff approval. Please proceed to payment.</p>
                <p style={{ fontFamily: "'DM Mono',monospace" }} className="text-accent text-sm mb-6">Ref: {lastBookingId} · RM {lastBookingTotal}.00</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => { setPayingForId(lastBookingId); setPayStep("method"); setPayProofNote(""); setTab("payment"); }}
                    className="bg-destructive text-white px-6 py-2 rounded-lg text-sm hover:opacity-90 font-semibold flex items-center gap-2"><AlertCircle size={15} /> Pay Now</button>
                  <button onClick={() => { setBookingStep("site"); setSelectedSite(null); setSelectedActivities([]); setSelectedEquipment([]); setTab("browse"); }}
                    className="border border-border text-foreground px-6 py-2 rounded-lg text-sm hover:bg-muted">Back to Browse</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PAYMENT ── */}
        {tab === "payment" && (
          <div className="max-w-lg mx-auto">
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1.6rem" }} className="text-foreground mb-2">Payment</h2>
            {payingForBooking && payStep !== "done" && (
              <div className="bg-muted rounded-lg px-4 py-3 mb-4 text-sm">
                <p className="text-foreground font-medium">{payingForBooking.site}</p>
                <p className="text-muted-foreground text-xs">{payingForBooking.id} · {payingForBooking.dates}</p>
                <p style={{ fontFamily: "'DM Mono',monospace" }} className="text-foreground mt-1">Total: RM {payingForBooking.total}.00</p>
              </div>
            )}
            {!payingForId ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center mt-4">
                <CreditCard size={40} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No booking selected for payment.</p>
                <button onClick={() => setTab("mybookings")} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm hover:opacity-90">View My Bookings</button>
              </div>
            ) : payStep === "method" ? (
              <div className="bg-card border border-border rounded-xl p-6 mt-4">
                <p className="text-muted-foreground text-sm mb-5">Choose your payment method.</p>
                <div className="space-y-3 mb-6">
                  {[{ id: "fpx", label: "FPX Online Banking", sub: "Maybank2u, CIMB Clicks, RHB, Public Bank" },
                    { id: "card", label: "Credit / Debit Card", sub: "Visa, Mastercard" },
                    { id: "ewallet", label: "e-Wallet", sub: "Touch 'n Go, GrabPay, Boost" }
                  ].map(m => (
                    <button key={m.id} onClick={() => setPayMethod(m.id)}
                      className={`w-full flex items-center gap-4 px-4 py-4 rounded-lg border transition-colors text-left ${payMethod === m.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted"}`}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${payMethod === m.id ? "border-primary" : "border-muted-foreground"}`}>
                        {payMethod === m.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      <div><p className="text-foreground text-sm">{m.label}</p><p className="text-muted-foreground text-xs">{m.sub}</p></div>
                    </button>
                  ))}
                </div>
                <button onClick={() => setPayStep("proof")} className="w-full bg-primary text-primary-foreground py-3 rounded-lg text-sm hover:opacity-90">Continue</button>
              </div>
            ) : payStep === "proof" ? (
              <div className="bg-card border border-border rounded-xl p-6 mt-4">
                <div className="flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-lg px-4 py-3 mb-5">
                  <Upload size={16} className="text-accent shrink-0" />
                  <p className="text-sm text-foreground">Upload your payment proof so staff can verify your payment.</p>
                </div>
                <p className="text-sm text-muted-foreground mb-3">Describe your payment proof (e.g. transaction reference, bank receipt):</p>
                <textarea value={payProofNote} onChange={e => setPayProofNote(e.target.value)} rows={4}
                  placeholder={`e.g. Transferred RM ${payingForBooking?.total ?? "—"}.00 via Maybank2u at 3:15 PM, ref TXN-${Math.floor(Math.random()*900000+100000)}`}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none mb-5" />
                <div className="bg-muted rounded-lg p-4 flex justify-between items-center mb-5">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span style={{ fontFamily: "'DM Mono',monospace" }} className="text-foreground">RM {payingForBooking?.total ?? "—"}.00</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setPayStep("method")} className="flex-1 border border-border text-foreground py-2 rounded-lg text-sm hover:bg-muted">Back</button>
                  <button onClick={handleSubmitPayment} disabled={!payProofNote.trim()} className="flex-1 bg-accent text-accent-foreground py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-40">Submit Payment</button>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-8 text-center mt-4">
                <CheckCircle size={48} className="text-primary mx-auto mb-4" />
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1.3rem" }} className="text-foreground mb-2">Payment Submitted!</h3>
                <p className="text-muted-foreground text-sm mb-2">Your proof of payment is pending staff verification.</p>
                <button onClick={() => setTab("mybookings")} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm hover:opacity-90 mt-4">View My Bookings</button>
              </div>
            )}
          </div>
        )}

        {/* ── MY BOOKINGS ── */}
        {tab === "mybookings" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1.6rem" }} className="text-foreground mb-2">My Bookings</h2>
            <p className="text-muted-foreground text-sm mb-6">Your full booking history.</p>
            <NotificationBanner bookings={myBookings} onAcceptReschedule={handleAcceptReschedule} onDeclineReschedule={handleDeclineReschedule}
              onRequestRefund={setRefundBooking} onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} />
            <div className="space-y-4">
              {myBookings.filter(b => b.status !== "Declined").map(b => (
                <div key={b.id} className={`bg-card border rounded-xl p-5 ${b.paymentStatus === "Unpaid" && !["Rejected","Rescheduled","Declined"].includes(b.status) ? "border-destructive/40" : "border-border"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600 }} className="text-foreground">{b.site}</p>
                      <p style={{ fontFamily: "'DM Mono',monospace" }} className="text-xs text-muted-foreground">{b.id}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs px-3 py-1 rounded-full ${statusColor[b.status] ?? "bg-muted text-muted-foreground"}`}>{b.status}</span>
                      <span className={`text-xs font-medium ${payColor[b.paymentStatus]}`}>{b.paymentStatus}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground border-t border-border pt-3 mb-3">
                    <span className="flex items-center gap-1"><Calendar size={11} />{b.dates}</span>
                    <span className="flex items-center gap-1"><Users size={11} />{b.guests} guests</span>
                    <span className="flex items-center gap-1"><Car size={11} />{b.vehiclePlate}</span>
                    <span style={{ fontFamily: "'DM Mono',monospace" }} className="flex items-center gap-1"><CreditCard size={11} />RM {b.total}</span>
                  </div>
                  {b.activities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {b.activities.map(a => <span key={a.activityId} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{a.name}</span>)}
                    </div>
                  )}
                  {b.equipment.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {b.equipment.map(e => <span key={e.equipmentId} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{e.name} ({e.equipmentId})</span>)}
                    </div>
                  )}
                  {b.staffFeedback && (b.status === "Rejected" || b.status === "Rescheduled") && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><MessageSquare size={11} /> Staff note</p>
                      <p className="text-sm text-foreground">{b.staffFeedback}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-border">
                    {b.paymentStatus === "Unpaid" && !["Rejected","Rescheduled","Declined"].includes(b.status) && (
                      <button onClick={() => handleGoToPay(b.id)} className="flex items-center gap-2 bg-destructive text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-destructive/90 animate-pulse">
                        <AlertCircle size={13} /> Pending Payment
                      </button>
                    )}
                    {b.paymentStatus === "Verified" && (b.status === "Rejected" || b.status === "Rescheduled") && (
                      <button onClick={() => setRefundBooking(b)} className="flex items-center gap-2 bg-destructive/10 text-destructive border border-destructive/30 px-4 py-2 rounded-lg text-xs font-medium hover:bg-destructive/20">
                        <Banknote size={13} /> Request Refund
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// small Check icon needed inline
function Check({ size, className }: { size: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12" /></svg>;
}
