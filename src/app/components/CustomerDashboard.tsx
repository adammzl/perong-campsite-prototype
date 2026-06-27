import { useState, useCallback } from "react";
import {
  TreePine, MapPin, Users, Calendar, CreditCard, CheckCircle, Clock,
  LogOut, Star, Tent, ChevronRight, X, MessageSquare, CalendarCheck,
  RefreshCw, Info, ChevronDown, ChevronUp, XCircle, AlertCircle,
  Banknote, ArrowLeftRight,
} from "lucide-react";
import type { Campsite, Booking, Payment } from "../App";
import { saveData } from "../App";

interface CustomerDashboardProps {
  userName: string;
  onLogout: () => void;
  campsites: Campsite[];
  bookings: Booking[];
  setBookings: (bookings: Booking[]) => void;
  payments: Payment[];
}

type TabId = "browse" | "booking" | "payment" | "mybookings";
type BookingStep = "form" | "review" | "done";
type PayStep = "select" | "details" | "done";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(d: string): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });
  } catch { return d; }
}

function nightsBetween(a: string, b: string): number {
  if (!a || !b) return 1;
  return Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
}

const statusColor: Record<string, string> = {
  Confirmed: "bg-primary/10 text-primary",
  Pending: "bg-accent/10 text-accent",
  Completed: "bg-muted text-muted-foreground",
  Rejected: "bg-destructive/10 text-destructive",
  Rescheduled: "bg-purple-100 text-purple-700",
};

// ─── Refund Modal ─────────────────────────────────────────────────────────────
function RefundModal({
  booking,
  onClose,
}: {
  booking: Booking;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"info" | "method" | "done">("info");
  const [method, setMethod] = useState("bank");

  const isRejected = booking.status === "Rejected";

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
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isRejected ? "bg-destructive/10" : "bg-purple-100"}`}>
              <Banknote size={18} className={isRejected ? "text-destructive" : "text-purple-600"} />
            </div>
            <div>
              <h3
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
                className="text-foreground text-lg leading-tight"
              >
                {step === "done" ? "Refund Requested" : "Request a Refund"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">{booking.id} · {booking.site}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground shrink-0">
            <X size={18} />
          </button>
        </div>

        {step === "info" && (
          <>
            <div className={`rounded-xl p-4 mb-5 text-sm ${isRejected ? "bg-destructive/5 border border-destructive/20" : "bg-purple-50 border border-purple-200"}`}>
              <p className={`font-medium mb-1 ${isRejected ? "text-destructive" : "text-purple-700"}`}>
                {isRejected ? "Your booking was rejected" : "Your booking was rescheduled"}
              </p>
              {booking.staffFeedback && (
                <p className="text-foreground/80 text-xs leading-relaxed">{booking.staffFeedback}</p>
              )}
            </div>

            <div className="bg-muted rounded-lg p-4 mb-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Booking ref</span>
                <span style={{ fontFamily: "'DM Mono', monospace" }} className="text-foreground">{booking.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Original dates</span>
                <span className="text-foreground">{booking.dates}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 mt-2">
                <span className="text-muted-foreground font-medium">Refund amount</span>
                <span style={{ fontFamily: "'DM Mono', monospace" }} className="text-foreground font-semibold">
                  RM {booking.total}.00
                </span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              We apologise for the inconvenience. You are eligible for a full refund of{" "}
              <span className="text-foreground font-medium">RM {booking.total}.00</span>.
              Please proceed to select your preferred refund method.
            </p>

            <button
              onClick={() => setStep("method")}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <ArrowLeftRight size={15} /> Select Refund Method
            </button>
          </>
        )}

        {step === "method" && (
          <>
            <p className="text-sm text-muted-foreground mb-4">Choose how you'd like to receive your refund.</p>
            <div className="space-y-3 mb-5">
              {[
                { id: "bank", label: "Bank Transfer", sub: "3–5 business days" },
                { id: "ewallet", label: "e-Wallet Refund", sub: "Touch 'n Go, GrabPay, Boost — 1–2 days" },
                { id: "original", label: "Refund to Original Payment", sub: "Same card / FPX account — 5–7 days" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-lg border transition-colors text-left ${
                    method === m.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${method === m.id ? "border-primary" : "border-muted-foreground"}`}>
                    {method === m.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div>
                    <p className="text-foreground text-sm">{m.label}</p>
                    <p className="text-muted-foreground text-xs">{m.sub}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("info")}
                className="flex-1 border border-border text-foreground py-2 rounded-lg text-sm hover:bg-muted"
              >
                Back
              </button>
              <button
                onClick={() => setStep("done")}
                className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-sm hover:opacity-90"
              >
                Submit Request
              </button>
            </div>
          </>
        )}

        {step === "done" && (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-primary" />
            </div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.1rem" }} className="text-foreground mb-2">
              Refund Request Submitted
            </p>
            <p className="text-muted-foreground text-sm mb-5 leading-relaxed">
              Your refund of <span className="text-foreground font-medium">RM {booking.total}.00</span> has been submitted.
              You'll receive a confirmation via email within 24 hours.
            </p>
            <button onClick={onClose} className="bg-primary text-primary-foreground px-8 py-2 rounded-lg text-sm hover:opacity-90">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Campsite Detail Popup ────────────────────────────────────────────────────
function CampsitePopup({ site, onClose, onBook }: { site: Campsite; onClose: () => void; onBook: (s: Campsite) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="relative h-52 overflow-hidden">
          <img src={site.img} alt={site.name} className="w-full h-full object-cover" />
          <button onClick={onClose} className="absolute top-3 right-3 bg-black/40 text-white rounded-full p-1 hover:bg-black/60 transition-colors">
            <X size={18} />
          </button>
          <span className={`absolute top-3 left-3 text-xs px-2 py-1 rounded-full font-medium ${site.available ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {site.available ? "Available" : "Unavailable"}
          </span>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between mb-1">
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.2rem" }} className="text-foreground">{site.name}</h3>
            <div className="flex items-center gap-1 text-accent text-sm"><Star size={13} className="fill-accent" />{site.rating}</div>
          </div>
          <p className="text-xs text-muted-foreground mb-3">{site.type}</p>
          <p className="text-sm text-foreground/80 mb-4 leading-relaxed">{site.description}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
            <span className="flex items-center gap-1"><Users size={12} /> Up to {site.capacity} pax</span>
            <span className="flex items-center gap-1"><MapPin size={12} /> Perong Forest</span>
          </div>
          {site.gallery.length > 0 && (
            <div className="flex gap-2 mb-4">
              {site.gallery.map((g, i) => <img key={i} src={g} alt="" className="flex-1 h-20 object-cover rounded-lg" />)}
            </div>
          )}
          <div className="flex flex-wrap gap-1 mb-5">
            {site.features.map((f) => <span key={f} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{f}</span>)}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span style={{ fontFamily: "'DM Mono', monospace" }} className="text-foreground font-semibold">RM {site.price}</span>
              <span className="text-muted-foreground text-xs"> / night</span>
            </div>
            <button
              disabled={!site.available}
              onClick={() => { onBook(site); onClose(); }}
              className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Notification Banners ──────────────────────────────────────────────────────
function CustomerNotificationBanner({
  bookings,
  onAcceptReschedule,
  onDeclineReschedule,
  onRequestRefund,
}: {
  bookings: Booking[];
  onAcceptReschedule: (id: string) => void;
  onDeclineReschedule: (id: string) => void;
  onRequestRefund: (b: Booking) => void;
}) {
  const actionable = bookings.filter((b) => b.status === "Rescheduled" || b.status === "Rejected");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (!actionable.length) return null;

  return (
    <div className="mb-6 space-y-3">
      {actionable.map((b) => (
        <div
          key={b.id}
          className={`border rounded-xl overflow-hidden ${b.status === "Rescheduled" ? "border-purple-300 bg-purple-50" : "border-destructive/30 bg-destructive/5"}`}
        >
          {/* Collapsed header — always visible */}
          <div className="px-5 py-4 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {b.status === "Rescheduled"
                ? <CalendarCheck size={18} className="text-purple-600 shrink-0 mt-0.5" />
                : <XCircle size={18} className="text-destructive shrink-0 mt-0.5" />}
              <div>
                <p className="text-sm font-medium text-foreground">
                  {b.status === "Rescheduled" ? "Your booking has been rescheduled" : "Your booking was not approved"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{b.site} · {b.id}</p>
              </div>
            </div>
            <button
              onClick={() => setExpanded((prev) => ({ ...prev, [b.id]: !prev[b.id] }))}
              className="text-muted-foreground hover:text-foreground shrink-0"
            >
              {expanded[b.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {/* Expanded details */}
          {expanded[b.id] && (
            <div className="px-5 pb-4 border-t border-current/10">
              {b.staffFeedback && (
                <div className="bg-white/60 rounded-lg p-3 my-3">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><MessageSquare size={11} /> Staff note</p>
                  <p className="text-sm text-foreground">{b.staffFeedback}</p>
                </div>
              )}
              {b.status === "Rescheduled" && b.suggestedCheckIn && (
                <div className="bg-white/60 rounded-lg p-3 mb-3">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Calendar size={11} /> Suggested new dates</p>
                  <p className="text-sm text-foreground font-medium">{fmtDate(b.suggestedCheckIn)} → {fmtDate(b.suggestedCheckOut)}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                {b.status === "Rescheduled" && (
                  <button
                    onClick={() => onAcceptReschedule(b.id)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle size={13} /> Accept new dates
                  </button>
                )}
                <button
                  onClick={() => onDeclineReschedule(b.id)}
                  className="border border-border text-foreground px-4 py-2 rounded-lg text-xs hover:bg-muted transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw size={13} /> Make a new booking
                </button>
                {/* Refund button — shown if customer already paid */}
                {b.paid && (
                  <button
                    onClick={() => onRequestRefund(b)}
                    className="bg-destructive/10 text-destructive border border-destructive/30 px-4 py-2 rounded-lg text-xs font-medium hover:bg-destructive/20 transition-colors flex items-center gap-1.5"
                  >
                    <Banknote size={13} /> Request Refund
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function CustomerDashboard({
  userName,
  onLogout,
  campsites,
  bookings,
  setBookings,
  payments,
}: CustomerDashboardProps) {
  const [tab, setTab] = useState<TabId>("browse");
  const [selected, setSelected] = useState<Campsite | null>(null);
  const [bookingStep, setBookingStep] = useState<BookingStep>("form");
  const [bookingData, setBookingData] = useState({ checkIn: "", checkOut: "", guests: "2", name: userName, phone: "" });
  const [payStep, setPayStep] = useState<PayStep>("select");
  const [payMethod, setPayMethod] = useState("card");
  const [cardNum, setCardNum] = useState("");
  const [popupSite, setPopupSite] = useState<Campsite | null>(null);
  const [lastBookingId, setLastBookingId] = useState<string | null>(null);
  const [refundBooking, setRefundBooking] = useState<Booking | null>(null);
  // Track which booking we're paying for when coming from "Pending Payment" button
  const [payingForBookingId, setPayingForBookingId] = useState<string | null>(null);

  const myBookingIds = ["BK-2483", "BK-2481", "BK-2309"];
  const myBookings = bookings.filter((b) => myBookingIds.includes(b.id) || b._isNew);
  const actionableNotifs = myBookings.filter((b) => b.status === "Rescheduled" || b.status === "Rejected");
  // Unpaid confirmed/pending bookings that haven't been paid yet
  const unpaidBookings = myBookings.filter((b) => !b.paid && b.status !== "Rejected" && b.status !== "Declined");

  const nights =
    bookingData.checkIn && bookingData.checkOut
      ? nightsBetween(bookingData.checkIn, bookingData.checkOut)
      : 1;
  const total = selected ? selected.price * nights : 0;

  // For the payment page — use the amount from the booking being paid if coming from My Bookings
  const payingForBooking = payingForBookingId ? myBookings.find(b => b.id === payingForBookingId) : null;
  const paymentAmount = payingForBooking ? payingForBooking.total : total;

  const handleBook = (site: Campsite) => {
    setSelected(site);
    setBookingStep("form");
    setTab("booking");
  };

  const handleGoToPay = (bookingId: string) => {
    setPayingForBookingId(bookingId);
    setPayStep("select");
    setTab("payment");
  };

  const handleConfirmBooking = () => {
    const newId = `BK-${Math.floor(Math.random() * 9000 + 1000)}`;
    const n = nightsBetween(bookingData.checkIn, bookingData.checkOut);
    const newBooking: Booking = {
      id: newId,
      guest: bookingData.name,
      siteId: selected!.id,
      site: selected!.name,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      dates: `${fmtDate(bookingData.checkIn)} – ${fmtDate(bookingData.checkOut)}`,
      guests: Number(bookingData.guests),
      total: selected!.price * n,
      status: "Pending",
      staffFeedback: "",
      suggestedCheckIn: "",
      suggestedCheckOut: "",
      paid: false,
      _isNew: true,
    };
    const updated = [...bookings, newBooking];
    setBookings(updated);
    saveData("pc_bookings", updated);
    setLastBookingId(newId);
    setBookingStep("done");
  };

  const handlePaymentDone = () => {
    // Mark the booking as paid if we were paying for a specific one
    if (payingForBookingId) {
      const updated = bookings.map(b => b.id === payingForBookingId ? { ...b, paid: true } : b);
      setBookings(updated);
      saveData("pc_bookings", updated);
      setPayingForBookingId(null);
    }
    setPayStep("done");
  };

  const handleAcceptReschedule = useCallback(
    (bookingId: string) => {
      const updated = bookings.map((b) => {
        if (b.id !== bookingId) return b;
        return {
          ...b,
          status: "Confirmed" as const,
          checkIn: b.suggestedCheckIn,
          checkOut: b.suggestedCheckOut,
          dates: `${fmtDate(b.suggestedCheckIn)} – ${fmtDate(b.suggestedCheckOut)}`,
        };
      });
      setBookings(updated);
      saveData("pc_bookings", updated);
    },
    [bookings, setBookings]
  );

  const handleDeclineReschedule = useCallback(
    (bookingId: string) => {
      const updated = bookings.map((b) =>
        b.id === bookingId ? { ...b, status: "Declined" as const } : b
      );
      setBookings(updated);
      saveData("pc_bookings", updated);
      setTab("browse");
    },
    [bookings, setBookings]
  );

  // Badge = actionable notifs + unpaid bookings
  const myBookingsBadge = actionableNotifs.length + unpaidBookings.length || undefined;

  const tabs: { id: TabId; label: string; badge?: number }[] = [
    { id: "browse", label: "Available Campsites" },
    { id: "booking", label: "Make a Booking" },
    { id: "payment", label: "Payment" },
    { id: "mybookings", label: "My Bookings", badge: myBookingsBadge },
  ];

  return (
    <div style={{ fontFamily: "'Lato', sans-serif" }} className="min-h-screen bg-background">
      {popupSite && (
        <CampsitePopup site={popupSite} onClose={() => setPopupSite(null)} onBook={handleBook} />
      )}
      {refundBooking && (
        <RefundModal booking={refundBooking} onClose={() => setRefundBooking(null)} />
      )}

      {/* Header */}
      <header className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <TreePine size={22} className="text-secondary" />
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }} className="text-lg">Perong Campsite</span>
          <span className="hidden md:inline text-primary-foreground/50 text-sm ml-2">— Guest Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-primary-foreground/80 text-sm hidden md:block">Hello, {userName}</span>
          <button onClick={onLogout} className="flex items-center gap-1 text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">
            <LogOut size={16} /><span className="hidden md:inline">Sign out</span>
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
              className={`relative flex items-center gap-2 px-5 py-4 text-sm border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
              {!!t.badge && (
                <span className="bg-destructive text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{t.badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ── BROWSE ── */}
        {tab === "browse" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.6rem" }} className="text-foreground mb-2">
              Available Campsites
            </h2>
            <p className="text-muted-foreground text-sm mb-8">Hover over or click a site to learn more, then book your stay.</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campsites.map((site) => (
                <div
                  key={site.id}
                  onClick={() => setPopupSite(site)}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer group"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img src={site.img} alt={site.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <span className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full font-medium ${site.available ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {site.available ? "Available" : "Unavailable"}
                    </span>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium bg-black/50 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <Info size={13} /> View details
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-1">
                      <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }} className="text-foreground">{site.name}</h3>
                      <div className="flex items-center gap-1 text-accent text-sm"><Star size={13} className="fill-accent" />{site.rating}</div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{site.type}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1"><Users size={12} /> Up to {site.capacity} pax</span>
                      <span className="flex items-center gap-1"><MapPin size={12} /> Perong Forest</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {site.features.map((f) => <span key={f} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{f}</span>)}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span style={{ fontFamily: "'DM Mono', monospace" }} className="text-foreground">RM {site.price}</span>
                        <span className="text-muted-foreground text-xs"> / night</span>
                      </div>
                      <button
                        disabled={!site.available}
                        onClick={(e) => { e.stopPropagation(); handleBook(site); }}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── BOOKING ── */}
        {tab === "booking" && (
          <div className="max-w-xl mx-auto">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.6rem" }} className="text-foreground mb-2">
              Make a Booking
            </h2>
            {!selected ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center mt-6">
                <Tent size={40} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No campsite selected yet.</p>
                <button onClick={() => setTab("browse")} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm hover:opacity-90">
                  Browse Campsites
                </button>
              </div>
            ) : bookingStep === "form" ? (
              <div className="bg-card border border-border rounded-xl p-6 mt-4">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Selected Site</p>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }} className="text-foreground">{selected.name}</p>
                    <p className="text-sm text-muted-foreground">{selected.type} · RM {selected.price}/night</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-foreground mb-1">Check-in Date</label>
                      <input type="date" value={bookingData.checkIn} onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div>
                      <label className="block text-sm text-foreground mb-1">Check-out Date</label>
                      <input type="date" value={bookingData.checkOut} onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1">Number of Guests</label>
                    <select value={bookingData.guests} onChange={(e) => setBookingData({ ...bookingData, guests: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      {Array.from({ length: selected.capacity }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>{n} guest{n > 1 ? "s" : ""}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1">Full Name</label>
                    <input type="text" value={bookingData.name} onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1">Phone Number</label>
                    <input type="tel" placeholder="+60 12-345 6789" value={bookingData.phone} onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-4 mt-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{nights} night{nights > 1 ? "s" : ""} · {bookingData.guests} guest{Number(bookingData.guests) > 1 ? "s" : ""}</p>
                    <p style={{ fontFamily: "'DM Mono', monospace" }} className="text-foreground">RM {total}.00</p>
                  </div>
                  <button onClick={() => setBookingStep("review")} disabled={!bookingData.checkIn || !bookingData.checkOut}
                    className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center gap-1">
                    Review <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ) : bookingStep === "review" ? (
              <div className="bg-card border border-border rounded-xl p-6 mt-4">
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }} className="text-foreground mb-5">Review Booking</h3>
                <div className="space-y-3 text-sm mb-6">
                  {[
                    ["Campsite", selected.name], ["Type", selected.type],
                    ["Check-in", fmtDate(bookingData.checkIn)], ["Check-out", fmtDate(bookingData.checkOut)],
                    ["Guests", `${bookingData.guests} pax`], ["Name", bookingData.name], ["Phone", bookingData.phone],
                    ["Duration", `${nights} night${nights > 1 ? "s" : ""}`], ["Total", `RM ${total}.00`],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between border-b border-border pb-2">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="text-foreground" style={label === "Total" ? { fontFamily: "'DM Mono', monospace" } : {}}>{val}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setBookingStep("form")} className="flex-1 border border-border text-foreground py-2 rounded-lg text-sm hover:bg-muted">Edit</button>
                  <button onClick={handleConfirmBooking} className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-sm hover:opacity-90">Confirm Booking</button>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-8 text-center mt-4">
                <CheckCircle size={48} className="text-primary mx-auto mb-4" />
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.3rem" }} className="text-foreground mb-2">Booking Submitted!</h3>
                <p className="text-muted-foreground text-sm mb-2">Your booking is pending staff approval.</p>
                <p style={{ fontFamily: "'DM Mono', monospace" }} className="text-accent text-sm mb-6">Ref: {lastBookingId}</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => { setPayingForBookingId(lastBookingId); setPayStep("select"); setTab("payment"); }}
                    className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm hover:opacity-90"
                  >
                    Proceed to Payment
                  </button>
                  <button
                    onClick={() => { setBookingStep("form"); setSelected(null); setTab("browse"); }}
                    className="border border-border text-foreground px-6 py-2 rounded-lg text-sm hover:bg-muted"
                  >
                    Back to Browse
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PAYMENT ── */}
        {tab === "payment" && (
          <div className="max-w-lg mx-auto">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.6rem" }} className="text-foreground mb-2">Payment</h2>

            {/* Show which booking this payment is for */}
            {payingForBooking && payStep !== "done" && (
              <div className="bg-muted rounded-lg px-4 py-3 mb-4 flex items-center justify-between text-sm">
                <div>
                  <p className="text-foreground font-medium">{payingForBooking.site}</p>
                  <p className="text-muted-foreground text-xs">{payingForBooking.id} · {payingForBooking.dates}</p>
                </div>
                <span style={{ fontFamily: "'DM Mono', monospace" }} className="text-foreground">RM {payingForBooking.total}.00</span>
              </div>
            )}

            {payStep === "select" ? (
              <div className="bg-card border border-border rounded-xl p-6 mt-4">
                <p className="text-muted-foreground text-sm mb-5">Choose your payment method.</p>
                <div className="space-y-3 mb-6">
                  {[
                    { id: "card", label: "Credit / Debit Card", sub: "Visa, Mastercard" },
                    { id: "fpx", label: "FPX Online Banking", sub: "All major Malaysian banks" },
                    { id: "ewallet", label: "e-Wallet", sub: "Touch 'n Go, GrabPay, Boost" },
                  ].map((m) => (
                    <button key={m.id} onClick={() => setPayMethod(m.id)}
                      className={`w-full flex items-center gap-4 px-4 py-4 rounded-lg border transition-colors text-left ${payMethod === m.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted"}`}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${payMethod === m.id ? "border-primary" : "border-muted-foreground"}`}>
                        {payMethod === m.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      <div>
                        <p className="text-foreground text-sm">{m.label}</p>
                        <p className="text-muted-foreground text-xs">{m.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <button onClick={() => setPayStep("details")} className="w-full bg-primary text-primary-foreground py-3 rounded-lg text-sm hover:opacity-90">Continue</button>
              </div>
            ) : payStep === "details" ? (
              <div className="bg-card border border-border rounded-xl p-6 mt-4">
                <p className="text-sm text-muted-foreground mb-5">
                  {payMethod === "card" ? "Enter your card details." : payMethod === "fpx" ? "Select your bank." : "Select your e-wallet."}
                </p>
                {payMethod === "card" && (
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm text-foreground mb-1">Card Number</label>
                      <input type="text" placeholder="1234 5678 9012 3456" maxLength={19} value={cardNum}
                        onChange={(e) => setCardNum(e.target.value.replace(/\D/g, "").replace(/(\d{4})/g, "$1 ").trim())}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm text-foreground mb-1">Expiry</label><input type="text" placeholder="MM / YY" className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                      <div><label className="block text-sm text-foreground mb-1">CVV</label><input type="text" placeholder="•••" maxLength={3} className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                    </div>
                    <div><label className="block text-sm text-foreground mb-1">Name on Card</label><input type="text" placeholder="As printed on card" className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                  </div>
                )}
                {payMethod === "fpx" && (
                  <div className="space-y-2 mb-6">
                    {["Maybank2u", "CIMB Clicks", "RHB Now", "Public Bank", "Hong Leong Connect"].map((bank) => (
                      <button key={bank} className="w-full text-left px-4 py-3 rounded-lg border border-border hover:bg-muted text-sm text-foreground">{bank}</button>
                    ))}
                  </div>
                )}
                {payMethod === "ewallet" && (
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {["Touch 'n Go", "GrabPay", "Boost"].map((ew) => (
                      <button key={ew} className="border border-border rounded-lg p-3 text-xs text-foreground hover:bg-muted text-center">{ew}</button>
                    ))}
                  </div>
                )}
                <div className="bg-muted rounded-lg p-4 flex justify-between items-center mb-5">
                  <span className="text-sm text-muted-foreground">Amount Due</span>
                  <span style={{ fontFamily: "'DM Mono', monospace" }} className="text-foreground">RM {paymentAmount > 0 ? paymentAmount : "—"}.00</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setPayStep("select")} className="flex-1 border border-border text-foreground py-2 rounded-lg text-sm hover:bg-muted">Back</button>
                  <button onClick={handlePaymentDone} className="flex-1 bg-accent text-accent-foreground py-2 rounded-lg text-sm hover:opacity-90">Pay Now</button>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-8 text-center mt-4">
                <CheckCircle size={48} className="text-primary mx-auto mb-4" />
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.3rem" }} className="text-foreground mb-2">Payment Submitted!</h3>
                <p className="text-muted-foreground text-sm mb-2">Your payment is pending staff verification.</p>
                <p style={{ fontFamily: "'DM Mono', monospace" }} className="text-accent text-sm mb-6">TXN-{Math.floor(Math.random() * 900000 + 100000)}</p>
                <button onClick={() => setTab("mybookings")} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm hover:opacity-90">View My Bookings</button>
              </div>
            )}
          </div>
        )}

        {/* ── MY BOOKINGS ── */}
        {tab === "mybookings" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.6rem" }} className="text-foreground mb-2">My Bookings</h2>
            <p className="text-muted-foreground text-sm mb-6">Your booking history and status.</p>

            <CustomerNotificationBanner
              bookings={myBookings}
              onAcceptReschedule={handleAcceptReschedule}
              onDeclineReschedule={handleDeclineReschedule}
              onRequestRefund={setRefundBooking}
            />

            <div className="space-y-4">
              {myBookings
                .filter((b) => b.status !== "Declined")
                .map((b) => (
                  <div key={b.id} className={`bg-card border rounded-xl p-5 ${!b.paid && b.status !== "Rejected" && b.status !== "Rescheduled" ? "border-destructive/40" : "border-border"}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }} className="text-foreground">{b.site}</p>
                        <p style={{ fontFamily: "'DM Mono', monospace" }} className="text-xs text-muted-foreground">{b.id}</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full ${statusColor[b.status] ?? "bg-muted text-muted-foreground"}`}>{b.status}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm border-t border-border pt-3">
                      <div className="flex items-center gap-1 text-muted-foreground col-span-2 md:col-span-1">
                        <Calendar size={13} /><span>{b.dates}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users size={13} /><span>{b.guests} guests</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <CreditCard size={13} />
                        <span className={b.paid ? "text-primary" : "text-destructive font-medium"}>{b.paid ? "Paid" : "Unpaid"}</span>
                      </div>
                    </div>
                    {b.staffFeedback && (b.status === "Rejected" || b.status === "Rescheduled") && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><MessageSquare size={11} /> Staff note</p>
                        <p className="text-sm text-foreground">{b.staffFeedback}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <span style={{ fontFamily: "'DM Mono', monospace" }} className="text-foreground">RM {b.total}.00</span>

                      {/* Pending Payment CTA — only for unpaid, non-rejected bookings */}
                      {!b.paid && b.status !== "Rejected" && b.status !== "Rescheduled" && b.status !== "Declined" && (
                        <button
                          onClick={() => handleGoToPay(b.id)}
                          className="flex items-center gap-2 bg-destructive text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-destructive/90 transition-colors animate-pulse"
                        >
                          <AlertCircle size={13} /> Pending Payment
                        </button>
                      )}

                      {/* Refund CTA — for paid but rejected/rescheduled */}
                      {b.paid && (b.status === "Rejected" || b.status === "Rescheduled") && (
                        <button
                          onClick={() => setRefundBooking(b)}
                          className="flex items-center gap-2 bg-destructive/10 text-destructive border border-destructive/30 px-4 py-2 rounded-lg text-xs font-medium hover:bg-destructive/20 transition-colors"
                        >
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
