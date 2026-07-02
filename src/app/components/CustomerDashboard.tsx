import { useState, useCallback, useRef } from "react";
import {
  TreePine, MapPin, Users, Calendar, CreditCard, CheckCircle, Clock,
  LogOut, Star, ChevronRight, X,
  ChevronDown, XCircle,
} from "lucide-react";
import type {
  Campsite, Booking, Payment, Activity, Equipment,
  BookingActivity, BookingEquipment, RefundRequest, Invoice,
} from "../App";
import { saveData } from "../App";

// ─── Inline SVG icons (lucide version-safe) ────────────────────────────────────
function BanknoteIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>;
}
function ArrowLeftRightIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="17 8 21 12 17 16"/><line x1="3" y1="12" x2="21" y2="12"/><polyline points="7 8 3 12 7 16"/></svg>;
}
function UploadIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
}
function CarIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2z"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="17.5" cy="17.5" r="1.5"/></svg>;
}
function PackageIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
}
function ActivityIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
}
function LogInIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>;
}
function LogOutIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}
function CheckInlineIcon({ size = 12, className = "" }: { size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>;
}
function RefreshCwIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
}
function TentIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 20 L12 4 L21 20 Z"/><path d="M9 20 L12 15 L15 20"/></svg>;
}
function CalendarCheckIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/></svg>;
}
function MessageSquareIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}
function InfoIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
}
function ChevronUpIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="18 15 12 9 6 15"/></svg>;
}
function AlertCircleIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}

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
  invoices: Invoice[];
  setInvoices: (i: Invoice[]) => void;
}

type TabId = "home" | "browse" | "booking" | "payment" | "mybookings";
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
            <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center"><BanknoteIcon size={18} className="text-destructive" /></div>
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
            <ArrowLeftRightIcon size={15} /> Select Refund Method
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
        const icon = isActionable ? (b.status === "Rescheduled" ? <CalendarCheckIcon size={18} className="text-purple-600 shrink-0 mt-0.5" /> : <XCircle size={18} className="text-destructive shrink-0 mt-0.5" />)
          : isCheckInDue ? <LogInIcon size={18} className="text-emerald-600 shrink-0 mt-0.5" /> : <LogOutIcon size={18} className="text-blue-600 shrink-0 mt-0.5" />;
        const title = isActionable ? (b.status === "Rescheduled" ? "Your booking has been rescheduled" : "Your booking was not approved")
          : isCheckInDue ? "Time to check in!" : "Time to check out!";
        return (
          <div key={b.id} className={`border rounded-xl overflow-hidden ${bgClass}`}>
            <div className="px-5 py-4 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">{icon}
                <div><p className="text-sm font-medium text-foreground">{title}</p><p className="text-xs text-muted-foreground mt-0.5">{b.site} · {b.id}</p></div>
              </div>
              <button onClick={() => setExpanded(p => ({ ...p, [b.id]: !p[b.id] }))} className="text-muted-foreground hover:text-foreground shrink-0">
                {expanded[b.id] ? <ChevronUpIcon size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
            {expanded[b.id] && (
              <div className="px-5 pb-4 border-t border-current/10">
                {b.staffFeedback && <div className="bg-white/60 rounded-lg p-3 my-3"><p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><MessageSquareIcon size={11} /> Staff note</p><p className="text-sm text-foreground">{b.staffFeedback}</p></div>}
                {b.status === "Rescheduled" && b.suggestedCheckIn && (
                  <div className="bg-white/60 rounded-lg p-3 mb-3"><p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Calendar size={11} /> Suggested new dates</p>
                    <p className="text-sm text-foreground font-medium">{fmtDate(b.suggestedCheckIn)} → {fmtDate(b.suggestedCheckOut)}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  {b.status === "Rescheduled" && <button onClick={() => onAcceptReschedule(b.id)} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-purple-700 flex items-center gap-1.5"><CheckCircle size={13} /> Accept new dates</button>}
                  {isActionable && <button onClick={() => onDeclineReschedule(b.id)} className="border border-border text-foreground px-4 py-2 rounded-lg text-xs hover:bg-muted flex items-center gap-1.5"><RefreshCwIcon size={13} /> Make new booking</button>}
                  {isActionable && b.paymentStatus === "Verified" && <button onClick={() => onRequestRefund(b)} className="bg-destructive/10 text-destructive border border-destructive/30 px-4 py-2 rounded-lg text-xs font-medium hover:bg-destructive/20 flex items-center gap-1.5"><BanknoteIcon size={13} /> Request Refund</button>}
                  {isCheckInDue && <button onClick={() => onCheckIn(b.id)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-emerald-700 flex items-center gap-1.5"><LogInIcon size={13} /> Check In Now</button>}
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
export function CustomerDashboard({ userName, userEmail, onLogout, campsites, activities, equipment, setEquipment, bookings, setBookings, payments, setPayments, refunds, setRefunds, invoices, setInvoices }: CustomerDashboardProps) {
  const [tab, setTab] = useState<TabId>("home");
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
  const [payProofImage, setPayProofImage] = useState<string>(""); // base64
  const [payProofFileName, setPayProofFileName] = useState<string>("");
  const [payingForId, setPayingForId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setPayingForId(bookingId); setPayStep("method"); setPayProofNote(""); setPayProofImage(""); setPayProofFileName(""); setTab("payment");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Limit to 4MB
    if (file.size > 4 * 1024 * 1024) { alert("File too large. Please upload an image under 4MB."); return; }
    setPayProofFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => { setPayProofImage(ev.target?.result as string ?? ""); };
    reader.readAsDataURL(file);
  };

  const handleSubmitPayment = () => {
    const bk = bookings.find(b => b.id === payingForId);
    if (!bk) return;
    const newPaymentId = genId("PAY");
    const updatedBookings = bookings.map(b => b.id === payingForId ? { ...b, paymentStatus: "ProofSubmitted" as const, paymentMethod: payMethod, paymentProofNote: payProofNote, paymentDate: today } : b);
    const newPayment: Payment = { id: newPaymentId, bookingId: payingForId!, guest: bk.guest, amount: bk.total, method: payMethod, proofNote: payProofNote, proofImage: payProofImage, date: today, status: "Pending" };
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

        {/* ── HOME ── */}
        {tab === "home" && (
          <div className="max-w-4xl mx-auto">
            {/* Welcome banner */}
            <div className="relative overflow-hidden rounded-2xl mb-8" style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, #2d5a3d 100%)" }}>
              <div className="absolute inset-0 opacity-10">
                <div style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} className="w-full h-full" />
              </div>
              <div className="relative px-8 py-10">
                <div className="flex items-center gap-3 mb-4">
                  <TreePine size={32} className="text-secondary" />
                  <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1.6rem" }} className="text-white">Perong Campsite</span>
                </div>
                <h1 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "2rem" }} className="text-white mb-2">
                  Welcome back, {userName} 👋
                </h1>
                <p className="text-white/70 text-base max-w-xl leading-relaxed">
                  We're glad to have you here. Before you dive in, please take a moment to read through the guidelines and FAQs below — they'll make your stay smooth and enjoyable for everyone.
                </p>
                <button onClick={() => setTab("browse")}
                  className="mt-6 bg-white text-primary font-semibold px-6 py-3 rounded-xl text-sm hover:bg-white/90 transition-colors flex items-center gap-2 w-fit">
                  <ChevronRight size={16} /> Browse Available Campsites
                </button>
              </div>
            </div>

            {/* Quick actions row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
              {[
                { label: "Browse Sites", sub: "View available campsites", tab: "browse" as TabId, icon: <TentIcon size={20} className="text-primary" /> },
                { label: "Make a Booking", sub: "Book your stay", tab: "booking" as TabId, icon: <CalendarCheckIcon size={20} className="text-primary" /> },
                { label: "Payment", sub: "Submit proof of payment", tab: "payment" as TabId, icon: <CreditCard size={20} className="text-primary" /> },
                { label: "My Bookings", sub: "Track your bookings", tab: "mybookings" as TabId, icon: <Users size={20} className="text-primary" /> },
              ].map(q => (
                <button key={q.tab} onClick={() => setTab(q.tab)}
                  className="bg-card border border-border rounded-xl p-4 text-left hover:shadow-md hover:border-primary/30 transition-all group">
                  <div className="mb-2">{q.icon}</div>
                  <p className="text-foreground text-sm font-semibold group-hover:text-primary transition-colors">{q.label}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{q.sub}</p>
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">

              {/* Booking Rules */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700 }} className="text-foreground text-lg mb-4 flex items-center gap-2">
                  <InfoIcon size={18} className="text-primary" /> Booking Guidelines
                </h2>
                <div className="space-y-3">
                  {[
                    { rule: "Minimum stay is 1 night. Check-in is from 2:00 PM, check-out by 12:00 PM noon.", icon: "🕑" },
                    { rule: "All bookings are subject to staff approval. You will be notified once your booking is confirmed.", icon: "✅" },
                    { rule: "Payment proof must be submitted within 24 hours of making a booking or your slot may be released.", icon: "💳" },
                    { rule: "Vehicle plate number and number of vehicles are mandatory. Unregistered vehicles will not be permitted entry.", icon: "🚗" },
                    { rule: "Bookings can be rescheduled or cancelled by staff under certain circumstances (e.g. site maintenance). A full refund will be issued.", icon: "📅" },
                    { rule: "Children under 12 must be accompanied by a responsible adult at all times.", icon: "👨‍👩‍👧" },
                    { rule: "Maximum guest count is determined by the campsite capacity. Do not exceed the stated limit.", icon: "👥" },
                    { rule: "Activities and equipment rentals must be selected at time of booking and cannot be added after confirmation.", icon: "🏕️" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <span className="text-lg shrink-0 mt-0.5">{item.icon}</span>
                      <p className="text-sm text-foreground leading-relaxed">{item.rule}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Camping Etiquette + FAQs */}
              <div className="space-y-6">
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700 }} className="text-foreground text-lg mb-4 flex items-center gap-2">
                    <TentIcon size={18} className="text-primary" /> Camping Etiquette
                  </h2>
                  <div className="space-y-3">
                    {[
                      { rule: "Quiet hours are strictly observed from 11:00 PM to 6:00 AM. Please keep noise to a minimum.", icon: "🌙" },
                      { rule: "All rubbish must be disposed of in the designated bins. Leave your site cleaner than you found it.", icon: "🗑️" },
                      { rule: "Open fires are only permitted in designated firepits. Never leave a fire unattended.", icon: "🔥" },
                      { rule: "Do not disturb wildlife or remove any plants, stones, or natural materials from the site.", icon: "🌿" },
                      { rule: "Respect other guests' privacy and personal space. Keep noise and light pollution to your own campsite area.", icon: "🤝" },
                      { rule: "Pets are allowed but must be kept on a leash at all times and are not permitted in rental equipment.", icon: "🐾" },
                      { rule: "Alcohol is permitted in moderation. Disruptive behaviour will result in immediate removal from the site.", icon: "🍺" },
                      { rule: "Any rented equipment that is damaged or lost will be charged to the booking guest at replacement cost.", icon: "🏕️" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <span className="text-lg shrink-0 mt-0.5">{item.icon}</span>
                        <p className="text-sm text-foreground leading-relaxed">{item.rule}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700 }} className="text-foreground text-lg mb-4 flex items-center gap-2">
                    <MessageSquareIcon size={18} className="text-primary" /> Frequently Asked Questions
                  </h2>
                  <div className="space-y-4">
                    {[
                      { q: "How do I know if my booking is confirmed?", a: "Your booking status in 'My Bookings' will change from Pending to Confirmed once a staff member approves it. You will also see a green notification banner." },
                      { q: "What payment methods are accepted?", a: "We accept FPX Online Banking (Maybank2u, CIMB Clicks, RHB, Public Bank), credit/debit cards (Visa, Mastercard), and e-Wallets (Touch &apos;n Go, GrabPay, Boost)." },
                      { q: "Can I add activities after confirming my booking?", a: "No — activities and equipment rentals must be selected during the booking process. Contact staff directly if you need to make changes after confirmation." },
                      { q: "What happens if my booking is rejected?", a: "You will receive a notification with the staff reason. If you have already paid, you can request a full refund directly from the My Bookings page." },
                      { q: "Is there mobile network coverage at the campsite?", a: "Coverage varies by location within the site. Riverside Clearing A and Stream Edge F have the best reception. Canopy Suite E and Firefly Valley C may have limited signal." },
                      { q: "What should I bring that is NOT provided?", a: "Personal toiletries, insect repellent, torch/headlamp (unless renting a lantern), food and cooking ingredients, and appropriate clothing for the forest environment." },
                    ].map((item, i) => (
                      <div key={i} className="border-b border-border pb-4 last:border-0 last:pb-0">
                        <p className="text-sm font-semibold text-foreground mb-1">{item.q}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Emergency contact */}
                <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5">
                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700 }} className="text-foreground mb-3 flex items-center gap-2">
                    <AlertCircleIcon size={16} className="text-destructive" /> Emergency Contacts
                  </h3>
                  <div className="space-y-2 text-sm">
                    {[
                      ["Campsite Management", "+60 9-XXX XXXX"],
                      ["Emergency (Police/Fire/Ambulance)", "999"],
                      ["Nearest Hospital (Hospital Temerloh)", "+60 9-296 1211"],
                    ].map(([label, num]) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-muted-foreground">{label}</span>
                        <span style={{ fontFamily: "'DM Mono',monospace" }} className="text-foreground font-medium">{num}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium bg-black/50 px-3 py-1.5 rounded-full flex items-center gap-1.5"><InfoIcon size={13} /> View details</span>
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
                <TentIcon size={40} className="text-muted-foreground mx-auto mb-4" />
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
                    <div><label className="block text-sm text-foreground mb-1 flex items-center gap-1"><CarIcon size={13} /> Vehicle Plate <span className="text-destructive">*</span></label>
                      <input type="text" placeholder="e.g. WXY 1234" value={form.vehiclePlate} onChange={e => setForm({...form, vehiclePlate: e.target.value.toUpperCase()})} className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring uppercase" /></div>
                    <div><label className="block text-sm text-foreground mb-1 flex items-center gap-1"><CarIcon size={13} /> No. of Vehicles <span className="text-destructive">*</span></label>
                      <select value={form.vehicleCount} onChange={e => setForm({...form, vehicleCount: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} vehicle{n>1?"s":""}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1"><AlertCircleIcon size={11} /> Vehicle plate and count are mandatory for site access.</p>
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
                            {selected && <CheckInlineIcon size={12} className="text-white" />}
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
                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600 }} className="text-foreground mb-1 flex items-center gap-2"><PackageIcon size={16} /> Tent & Equipment Rental</h3>
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
                                {sel && <CheckInlineIcon size={10} className="text-white" />}
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
                    className="bg-destructive text-white px-6 py-2 rounded-lg text-sm hover:opacity-90 font-semibold flex items-center gap-2"><AlertCircleIcon size={15} /> Pay Now</button>
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
                  <UploadIcon size={16} className="text-accent shrink-0" />
                  <p className="text-sm text-foreground">Attach your payment receipt so staff can verify your payment.</p>
                </div>

                {/* Hidden file input */}
                <input ref={fileInputRef} type="file" accept="image/*,application/pdf" onChange={handleFileUpload} className="hidden" />

                {/* Upload area */}
                <div className="mb-5">
                  <label className="block text-sm text-foreground mb-2">
                    Upload Receipt / Screenshot <span className="text-muted-foreground text-xs">(JPG, PNG — max 4MB)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full border-2 border-dashed rounded-xl py-6 flex flex-col items-center gap-2 transition-colors cursor-pointer ${payProofImage ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted"}`}
                  >
                    {payProofImage ? (
                      <>
                        <img src={payProofImage} alt="Receipt preview" className="max-h-40 max-w-full object-contain rounded-lg mb-1" />
                        <p className="text-xs text-primary font-medium">{payProofFileName}</p>
                        <p className="text-xs text-muted-foreground">Click to change</p>
                      </>
                    ) : (
                      <>
                        <UploadIcon size={28} className="text-muted-foreground" />
                        <p className="text-sm text-foreground font-medium">Click to upload receipt</p>
                        <p className="text-xs text-muted-foreground">Supports JPG, PNG images</p>
                      </>
                    )}
                  </button>
                </div>

                {/* Notes */}
                <div className="mb-5">
                  <label className="block text-sm text-foreground mb-2">Additional notes <span className="text-muted-foreground text-xs">(optional)</span></label>
                  <textarea value={payProofNote} onChange={e => setPayProofNote(e.target.value)} rows={3}
                    placeholder={`e.g. Transferred RM ${payingForBooking?.total ?? "—"}.00 via Maybank2u, ref TXN-XXXXXX`}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                </div>

                <div className="bg-muted rounded-lg p-4 flex justify-between items-center mb-5">
                  <span className="text-sm text-muted-foreground">Amount Due</span>
                  <span style={{ fontFamily: "'DM Mono',monospace" }} className="text-foreground font-semibold">RM {payingForBooking?.total ?? "—"}.00</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setPayStep("method")} className="flex-1 border border-border text-foreground py-2 rounded-lg text-sm hover:bg-muted">Back</button>
                  <button onClick={handleSubmitPayment} disabled={!payProofImage && !payProofNote.trim()}
                    className="flex-1 bg-accent text-accent-foreground py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-40">Submit Payment</button>
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
                    <span className="flex items-center gap-1"><CarIcon size={11} />{b.vehiclePlate}</span>
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
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><MessageSquareIcon size={11} /> Staff note</p>
                      <p className="text-sm text-foreground">{b.staffFeedback}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-border">
                    {b.paymentStatus === "Unpaid" && !["Rejected","Rescheduled","Declined"].includes(b.status) && (
                      <button onClick={() => handleGoToPay(b.id)} className="flex items-center gap-2 bg-destructive text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-destructive/90 animate-pulse">
                        <AlertCircleIcon size={13} /> Pending Payment
                      </button>
                    )}
                    {b.paymentStatus === "Verified" && (b.status === "Rejected" || b.status === "Rescheduled") && (
                      <button onClick={() => setRefundBooking(b)} className="flex items-center gap-2 bg-destructive/10 text-destructive border border-destructive/30 px-4 py-2 rounded-lg text-xs font-medium hover:bg-destructive/20">
                        <BanknoteIcon size={13} /> Request Refund
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
