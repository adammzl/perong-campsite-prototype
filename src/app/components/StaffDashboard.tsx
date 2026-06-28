import { useState, useMemo } from "react";
import {
  TreePine, Users, Calendar, CreditCard, CheckCircle, Clock, LogOut,
  TrendingUp, AlertTriangle, Edit2, X, XCircle, MessageSquare,
  ChevronDown, ChevronUp, MapPin,
} from "lucide-react";
import type { Campsite, Booking, Payment, Activity, Equipment, RefundRequest, Invoice } from "../App";
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
  invoices: Invoice[];
  setInvoices: (i: Invoice[]) => void;
}

type TabId = "overview" | "ongoing" | "approvals" | "sites" | "activities" | "equipment" | "report" | "refunds" | "invoices";
type ActionType = "approve" | "reject" | "reschedule";

// ─── Inline SVG icons (safe replacements for missing lucide icons) ─────────────
function CheckIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12" /></svg>;
}
function PlusIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
}
function LogInIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>;
}
function LogOutIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
}
function BanknoteIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M6 12h.01M18 12h.01" /></svg>;
}
function BellIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
}
function CarIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2z" /><circle cx="7.5" cy="17.5" r="1.5" /><circle cx="17.5" cy="17.5" r="1.5" /></svg>;
}
function TentIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 20 L12 4 L21 20 Z" /><path d="M9 20 L12 15 L15 20" /></svg>;
}
function PackageIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>;
}
function ActivityIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
}
function FileTextIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>;
}
function EyeIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
}
function BarChartIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(d: string): string {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return d; }
}
function todayStr() { return new Date().toISOString().split("T")[0]; }
function genId(prefix: string) { return `${prefix}-${Math.floor(Math.random() * 9000 + 1000)}`; }

const bookingStatusStyle: Record<string, string> = {
  Pending:     "bg-accent/10 text-accent",
  Confirmed:   "bg-primary/10 text-primary",
  Completed:   "bg-muted text-muted-foreground",
  Rejected:    "bg-destructive/10 text-destructive",
  Rescheduled: "bg-purple-100 text-purple-700",
  CheckedIn:   "bg-emerald-100 text-emerald-700",
  CheckedOut:  "bg-blue-100 text-blue-700",
};
const payStatusStyle: Record<string, string> = {
  Unpaid:         "bg-destructive/10 text-destructive",
  ProofSubmitted: "bg-accent/10 text-accent",
  Verified:       "bg-primary/10 text-primary",
  Rejected:       "bg-destructive/10 text-destructive",
  Pending:        "bg-accent/10 text-accent",
};

// ─── Booking Review Modal ─────────────────────────────────────────────────────
function BookingReviewModal({ booking, onClose, onSubmit }: {
  booking: Booking;
  onClose: () => void;
  onSubmit: (d: { action: ActionType; feedback: string; suggestCheckIn: string; suggestCheckOut: string }) => void;
}) {
  const [action, setAction] = useState<ActionType>("approve");
  const [feedback, setFeedback] = useState("");
  const [sci, setSci] = useState("");
  const [sco, setSco] = useState("");
  const canSubmit = action === "approve" || (feedback.trim().length > 5 && (action !== "reschedule" || (sci && sco)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700 }} className="text-foreground text-lg">Review Booking</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{booking.id} · {booking.guest}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>

        <div className="bg-muted rounded-lg p-4 mb-4 text-sm space-y-1.5">
          {[
            ["Campsite", booking.site],
            ["Dates", booking.dates],
            ["Guests", `${booking.guests} pax`],
            ["Vehicle", `${booking.vehiclePlate} (${booking.vehicleCount} vehicle${booking.vehicleCount > 1 ? "s" : ""})`],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between">
              <span className="text-muted-foreground">{label}</span>
              <span className="text-foreground">{val}</span>
            </div>
          ))}
          {booking.activities.length > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Activities</span>
              <span className="text-foreground text-right text-xs">{booking.activities.map(a => a.name).join(", ")}</span>
            </div>
          )}
          {booking.equipment.length > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Equipment</span>
              <span className="text-foreground text-right text-xs">{booking.equipment.map(e => `${e.name} (${e.equipmentId})`).join(", ")}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-1.5 mt-1.5">
            <span className="text-muted-foreground font-medium">Total</span>
            <span style={{ fontFamily: "'DM Mono',monospace" }} className="text-foreground font-semibold">RM {booking.total}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment</span>
            <span className={`font-medium text-xs px-2 py-0.5 rounded-full ${payStatusStyle[booking.paymentStatus] ?? ""}`}>{booking.paymentStatus}</span>
          </div>
          {booking.paymentProofNote && (
            <div className="pt-1 border-t border-border">
              <p className="text-xs text-muted-foreground mb-0.5">Payment proof</p>
              <p className="text-xs text-foreground bg-white/60 rounded p-2 leading-relaxed">{booking.paymentProofNote}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-4">
          {([
            { val: "approve" as ActionType, label: "Approve", active: "bg-primary/10 text-primary border-primary" },
            { val: "reschedule" as ActionType, label: "Reschedule", active: "bg-purple-100 text-purple-700 border-purple-400" },
            { val: "reject" as ActionType, label: "Reject", active: "bg-destructive/10 text-destructive border-destructive" },
          ] as const).map(opt => (
            <button key={opt.val} onClick={() => setAction(opt.val)}
              className={`flex-1 py-2 rounded-lg text-sm border-2 transition-colors font-medium ${action === opt.val ? opt.active : "border-border text-muted-foreground hover:bg-muted"}`}>
              {opt.label}
            </button>
          ))}
        </div>

        {(action === "reject" || action === "reschedule") && (
          <div className="mb-4">
            <label className="block text-sm text-foreground mb-1">
              {action === "reject" ? "Reason for rejection" : "Reason for reschedule"} <span className="text-destructive">*</span>
            </label>
            <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={3}
              placeholder="Explain to the guest why their booking is being updated…"
              className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>
        )}

        {action === "reschedule" && (
          <div className="mb-4">
            <label className="block text-sm text-foreground mb-2">Suggest new dates <span className="text-destructive">*</span></label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Check-in</label>
                <input type="date" value={sci} onChange={e => setSci(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Check-out</label>
                <input type="date" value={sco} onChange={e => setSco(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
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
  payment: Payment;
  booking: Booking | undefined;
  onClose: () => void;
  onVerify: () => void;
  onReject: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700 }} className="text-foreground text-lg">Verify Payment</h3>
            <p className="text-xs text-muted-foreground">{payment.id} · {payment.bookingId}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>

        <div className="bg-muted rounded-lg p-4 space-y-2 text-sm mb-4">
          {[["Guest", payment.guest], ["Method", payment.method], ["Date", fmtDate(payment.date)]].map(([l, v]) => (
            <div key={l} className="flex justify-between"><span className="text-muted-foreground">{l}</span><span className="text-foreground">{v}</span></div>
          ))}
          <div className="flex justify-between border-t border-border pt-2 mt-2">
            <span className="text-muted-foreground font-medium">Amount</span>
            <span style={{ fontFamily: "'DM Mono',monospace" }} className="text-foreground font-semibold">RM {payment.amount}.00</span>
          </div>
        </div>

        {/* Proof image */}
        {payment.proofImage ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <p className="text-xs text-amber-700 font-medium mb-2 flex items-center gap-1"><EyeIcon size={11} /> Payment Receipt (Uploaded by Customer)</p>
            <img src={payment.proofImage} alt="Payment receipt" className="w-full max-h-64 object-contain rounded-lg border border-amber-200 bg-white" />
            {payment.proofNote && <p className="text-sm text-foreground mt-2 pt-2 border-t border-amber-200 leading-relaxed">{payment.proofNote}</p>}
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <p className="text-xs text-amber-700 font-medium mb-1 flex items-center gap-1"><EyeIcon size={11} /> Payment Proof from Customer</p>
            <p className="text-sm text-foreground leading-relaxed">{payment.proofNote || "No receipt or proof uploaded yet."}</p>
          </div>
        )}

        {booking && (
          <div className="bg-muted rounded-lg p-3 text-xs space-y-1 mb-5">
            <p className="text-muted-foreground font-medium">Linked Booking</p>
            <p className="text-foreground">{booking.site} · {booking.dates} · {booking.guests} pax</p>
            <p className="text-foreground">Booking status: <span className="font-medium">{booking.status}</span></p>
          </div>
        )}

        {payment.status === "Pending" ? (
          <div className="flex gap-3">
            <button onClick={onReject} className="flex-1 border border-destructive text-destructive py-2 rounded-lg text-sm hover:bg-destructive/10 flex items-center justify-center gap-1">
              <XCircle size={14} /> Reject
            </button>
            <button onClick={onVerify} className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-sm hover:opacity-90 flex items-center justify-center gap-1">
              <CheckCircle size={14} /> Verify Payment
            </button>
          </div>
        ) : (
          <p className={`text-center text-sm font-medium py-2 ${payment.status === "Verified" ? "text-primary" : "text-destructive"}`}>
            Payment {payment.status}
          </p>
        )}
      </div>
    </div>
  );
}


// ─── Invoice Modal ────────────────────────────────────────────────────────────
function InvoiceModal({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const nights = Math.max(1, Math.round((new Date(invoice.checkOut).getTime() - new Date(invoice.checkIn).getTime()) / 86400000));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Invoice Header */}
        <div className="bg-foreground text-white px-8 py-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>
                <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1.2rem" }}>Perong Campsite</span>
              </div>
              <p className="text-white/60 text-xs">Perong Forest Reserve, Pahang, Malaysia</p>
              <p className="text-white/60 text-xs">perong@campsite.my · +60 9-XXX XXXX</p>
            </div>
            <div className="text-right">
              <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1.4rem" }} className="text-white">INVOICE</p>
              <p style={{ fontFamily: "'DM Mono',monospace" }} className="text-white/80 text-sm">{invoice.id}</p>
              <p className="text-white/60 text-xs mt-1">{fmtDate(invoice.invoiceDate)}</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6">
          {/* Bill To + Booking Info */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Bill To</p>
              <p className="text-foreground font-semibold">{invoice.guest}</p>
              <p className="text-muted-foreground text-sm">{invoice.guestEmail}</p>
              <p className="text-muted-foreground text-sm">{invoice.phone}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Booking Details</p>
              <p style={{ fontFamily: "'DM Mono',monospace" }} className="text-foreground text-sm">{invoice.bookingId}</p>
              <p className="text-muted-foreground text-sm">{invoice.site}</p>
              <p className="text-muted-foreground text-sm">{fmtDate(invoice.checkIn)} – {fmtDate(invoice.checkOut)}</p>
              <p className="text-muted-foreground text-sm">{invoice.guests} guest{invoice.guests > 1 ? "s" : ""} · {nights} night{nights > 1 ? "s" : ""}</p>
              <p className="text-muted-foreground text-sm">Vehicle: {invoice.vehiclePlate}</p>
            </div>
          </div>

          {/* Line Items */}
          <div className="border border-border rounded-xl overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Description</th>
                  <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Qty</th>
                  <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Unit Price</th>
                  <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {/* Campsite row */}
                <tr className="border-t border-border">
                  <td className="px-4 py-3 text-foreground">
                    <p className="font-medium">{invoice.site}</p>
                    <p className="text-xs text-muted-foreground">{fmtDate(invoice.checkIn)} – {fmtDate(invoice.checkOut)}</p>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{nights} night{nights > 1 ? "s" : ""}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground" style={{ fontFamily: "'DM Mono',monospace" }}>
                    RM {nights > 0 ? (invoice.siteCost / nights).toFixed(2) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground" style={{ fontFamily: "'DM Mono',monospace" }}>RM {invoice.siteCost.toFixed(2)}</td>
                </tr>
                {/* Activities */}
                {invoice.activities.map((a, i) => (
                  <tr key={i} className="border-t border-border bg-muted/20">
                    <td className="px-4 py-3 text-foreground">
                      <p className="font-medium">{a.name}</p>
                      <p className="text-xs text-muted-foreground">Activity</p>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{a.pax} pax</td>
                    <td className="px-4 py-3 text-right text-muted-foreground" style={{ fontFamily: "'DM Mono',monospace" }}>RM {a.pricePerPax.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-foreground" style={{ fontFamily: "'DM Mono',monospace" }}>RM {(a.pax * a.pricePerPax).toFixed(2)}</td>
                  </tr>
                ))}
                {/* Equipment */}
                {invoice.equipment.map((e, i) => (
                  <tr key={i} className="border-t border-border bg-muted/20">
                    <td className="px-4 py-3 text-foreground">
                      <p className="font-medium">{e.name}</p>
                      <p className="text-xs text-muted-foreground">Equipment · {e.equipmentId}</p>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{e.nights} night{e.nights > 1 ? "s" : ""}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground" style={{ fontFamily: "'DM Mono',monospace" }}>RM {e.pricePerNight.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-foreground" style={{ fontFamily: "'DM Mono',monospace" }}>RM {(e.nights * e.pricePerNight).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Campsite</span>
                <span style={{ fontFamily: "'DM Mono',monospace" }}>RM {invoice.siteCost.toFixed(2)}</span>
              </div>
              {invoice.activitiesCost > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Activities</span>
                  <span style={{ fontFamily: "'DM Mono',monospace" }}>RM {invoice.activitiesCost.toFixed(2)}</span>
                </div>
              )}
              {invoice.equipmentCost > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Equipment Rental</span>
                  <span style={{ fontFamily: "'DM Mono',monospace" }}>RM {invoice.equipmentCost.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-foreground font-bold border-t border-border pt-2 text-base">
                <span>Total Amount</span>
                <span style={{ fontFamily: "'DM Mono',monospace" }}>RM {invoice.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-muted rounded-xl p-4 mb-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Payment Method</p>
              <p className="text-foreground font-medium">{invoice.paymentMethod || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Payment Status</p>
              <p className={`font-medium ${invoice.paymentStatus === "Verified" ? "text-primary" : "text-accent"}`}>{invoice.paymentStatus}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Invoice ID</p>
              <p style={{ fontFamily: "'DM Mono',monospace" }} className="text-foreground">{invoice.id}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Booking Ref</p>
              <p style={{ fontFamily: "'DM Mono',monospace" }} className="text-foreground">{invoice.bookingId}</p>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-muted-foreground border-t border-border pt-4">
            Thank you for choosing Perong Campsite. This invoice was generated on {fmtDate(invoice.invoiceDate)}.
            <br />For enquiries, contact us at perong@campsite.my
          </p>
        </div>

        {/* Close button */}
        <div className="px-8 pb-6">
          <button onClick={onClose} className="w-full border border-border text-foreground py-2.5 rounded-lg text-sm hover:bg-muted transition-colors">Close Invoice</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN STAFF DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export function StaffDashboard({
  userName, onLogout,
  campsites, setCampsites,
  activities, setActivities,
  equipment, setEquipment,
  bookings, setBookings,
  payments, setPayments,
  refunds, setRefunds,
  invoices, setInvoices,
}: StaffDashboardProps) {
  const [tab, setTab] = useState<TabId>("overview");
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [reviewPayment, setReviewPayment] = useState<Payment | null>(null);
  const [editingPrice, setEditingPrice] = useState<number | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [approvalsView, setApprovalsView] = useState<"bookings" | "payments">("bookings");
  const [reportMonth, setReportMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [newAct, setNewAct] = useState({ name: "", description: "", pricePerPax: "", icon: "🏕️" });
  const [newEq, setNewEq] = useState({ name: "", category: "tent" as "tent" | "equipment", pricePerNight: "" });
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const today = todayStr();

  const pendingBookings = bookings.filter(b => b.status === "Pending").length;
  const pendingPayments = payments.filter(p => p.status === "Pending").length;
  const pendingRefunds = refunds.filter(r => r.status === "Pending").length;
  const checkedInNow = bookings.filter(b => b.status === "CheckedIn").length;
  const availableSites = campsites.filter(s => s.available).length;
  const totalRevenue = payments.filter(p => p.status === "Verified").reduce((s, p) => s + p.amount, 0);
  const overdueCheckout = bookings.filter(b => b.status === "CheckedIn" && b.checkOut <= today);

  // ── Booking actions ──────────────────────────────────────────────────────────
  const handleBookingAction = (id: string, { action, feedback, suggestCheckIn, suggestCheckOut }: { action: ActionType; feedback: string; suggestCheckIn: string; suggestCheckOut: string }) => {
    const newStatus = action === "approve" ? "Confirmed" : action === "reject" ? "Rejected" : "Rescheduled";
    const updated = bookings.map(b => b.id !== id ? b : {
      ...b,
      status: newStatus as Booking["status"],
      staffFeedback: feedback || "",
      suggestedCheckIn: action === "reschedule" ? suggestCheckIn : "",
      suggestedCheckOut: action === "reschedule" ? suggestCheckOut : "",
    });
    setBookings(updated); saveData("pc_bookings", updated); setReviewBooking(null);
  };

  // ── Payment actions ──────────────────────────────────────────────────────────
  const verifyPayment = (id: string) => {
    const payObj = payments.find(p => p.id === id);
    const updatedPayments = payments.map(p => p.id === id ? { ...p, status: "Verified" as const } : p);
    const updatedBookings = payObj
      ? bookings.map(b => b.id === payObj.bookingId ? { ...b, paymentStatus: "Verified" as const } : b)
      : bookings;
    setPayments(updatedPayments); saveData("pc_payments", updatedPayments);
    setBookings(updatedBookings); saveData("pc_bookings", updatedBookings);
    setReviewPayment(null);
  };

  const rejectPayment = (id: string) => {
    const payObj = payments.find(p => p.id === id);
    const updatedPayments = payments.map(p => p.id === id ? { ...p, status: "Rejected" as const } : p);
    const updatedBookings = payObj
      ? bookings.map(b => b.id === payObj.bookingId ? { ...b, paymentStatus: "Rejected" as const } : b)
      : bookings;
    setPayments(updatedPayments); saveData("pc_payments", updatedPayments);
    setBookings(updatedBookings); saveData("pc_bookings", updatedBookings);
    setReviewPayment(null);
  };

  const generateInvoice = (booking: Booking, payment: Payment): Invoice => {
    const invId = `INV-${booking.id.replace("BK-", "")}`;
    // Check if invoice already exists
    const existing = invoices.find(inv => inv.bookingId === booking.id);
    if (existing) { setViewingInvoice(existing); return existing; }
    const newInvoice: Invoice = {
      id: invId,
      bookingId: booking.id,
      paymentId: payment.id,
      invoiceDate: todayStr(),
      guest: booking.guest,
      guestEmail: booking.guestEmail,
      phone: booking.phone,
      site: booking.site,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guests: booking.guests,
      vehiclePlate: booking.vehiclePlate,
      activities: booking.activities.map(a => ({ name: a.name, pax: a.pax, pricePerPax: a.pricePerPax })),
      equipment: booking.equipment.map(e => ({ name: e.name, equipmentId: e.equipmentId, nights: e.nights, pricePerNight: e.pricePerNight })),
      siteCost: booking.siteCost,
      activitiesCost: booking.activitiesCost,
      equipmentCost: booking.equipmentCost,
      totalAmount: booking.total,
      paymentMethod: payment.method,
      paymentStatus: payment.status,
    };
    const updated = [...invoices.filter(inv => inv.bookingId !== booking.id), newInvoice];
    setInvoices(updated);
    saveData("pc_invoices", updated);
    setViewingInvoice(newInvoice);
    return newInvoice;
  };

  // ── Site actions ─────────────────────────────────────────────────────────────
  const toggleSite = (id: number) => {
    const u = campsites.map(s => s.id === id ? { ...s, available: !s.available } : s);
    setCampsites(u); saveData("pc_campsites", u);
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

  // ── Check-in / Check-out / Complete ─────────────────────────────────────────
  const markCheckedIn = (id: string) => {
    const u = bookings.map(b => b.id === id ? { ...b, checkedIn: true, status: "CheckedIn" as const } : b);
    setBookings(u); saveData("pc_bookings", u);
  };
  const markCheckedOut = (id: string) => {
    const u = bookings.map(b => b.id === id ? { ...b, checkedOut: true, status: "CheckedOut" as const } : b);
    setBookings(u); saveData("pc_bookings", u);
  };
  const markCompleted = (id: string) => {
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
    const byStatus: Record<string, number> = {};
    inMonth.forEach(b => { byStatus[b.status] = (byStatus[b.status] ?? 0) + 1; });
    const actCounts: Record<string, number> = {};
    inMonth.forEach(b => b.activities.forEach(a => { actCounts[a.name] = (actCounts[a.name] ?? 0) + a.pax; }));
    const eqCounts: Record<string, number> = {};
    inMonth.forEach(b => b.equipment.forEach(e => { eqCounts[e.name] = (eqCounts[e.name] ?? 0) + 1; }));
    return { total: inMonth.length, revenue, byStatus, actCounts, eqCounts, bookings: inMonth };
  }, [bookings, payments, reportMonth]);

  const tabs: { id: TabId; label: string; badge?: number }[] = [
    { id: "overview",   label: "Overview" },
    { id: "ongoing",    label: "Ongoing",    badge: checkedInNow || undefined },
    { id: "approvals",  label: "Approvals",  badge: (pendingBookings + pendingPayments) || undefined },
    { id: "sites",      label: "Sites" },
    { id: "activities", label: "Activities" },
    { id: "equipment",  label: "Equipment" },
    { id: "refunds",    label: "Refunds",    badge: pendingRefunds || undefined },
    { id: "invoices",   label: "Invoices" },
    { id: "report",     label: "Reports" },
  ];

  return (
    <div style={{ fontFamily: "'Lato',sans-serif" }} className="min-h-screen bg-background">
      {reviewBooking && (
        <BookingReviewModal booking={reviewBooking} onClose={() => setReviewBooking(null)}
          onSubmit={d => handleBookingAction(reviewBooking.id, d)} />
      )}
      {reviewPayment && (
        <PaymentDetailModal payment={reviewPayment} booking={bookings.find(b => b.id === reviewPayment.bookingId)}
          onClose={() => setReviewPayment(null)} onVerify={() => verifyPayment(reviewPayment.id)} onReject={() => rejectPayment(reviewPayment.id)} />
      )}
      {viewingInvoice && (
        <InvoiceModal invoice={viewingInvoice} onClose={() => setViewingInvoice(null)} />
      )}

      {/* Header */}
      <header className="bg-foreground text-primary-foreground px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <TreePine size={22} className="text-secondary" />
          <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700 }} className="text-lg">Perong Campsite</span>
          <span className="hidden md:inline text-primary-foreground/50 text-sm ml-2">— Staff Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-primary-foreground/70 text-sm hidden md:block">Staff: {userName}</span>
          <button onClick={onLogout} className="flex items-center gap-1.5 text-primary-foreground/60 hover:text-primary-foreground text-sm">
            <LogOut size={16} /><span className="hidden md:inline">Sign out</span>
          </button>
        </div>
      </header>

      {/* Tab Nav */}
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
                { label: "Checked In Now", value: String(checkedInNow), icon: <LogInIcon size={20} className="text-emerald-600" />, sub: "active guests" },
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
                <p className="text-sm font-medium text-blue-800 flex items-center gap-2 mb-3">
                  <BellIcon size={15} /> {overdueCheckout.length} booking{overdueCheckout.length > 1 ? "s" : ""} due for check-out today
                </p>
                {overdueCheckout.map(b => (
                  <div key={b.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-3 mb-2 last:mb-0">
                    <div>
                      <p className="text-sm text-foreground">{b.guest} · {b.site}</p>
                      <p className="text-xs text-muted-foreground">{b.id} · Due: {fmtDate(b.checkOut)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => markCheckedOut(b.id)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-blue-700 flex items-center gap-1">
                        <LogOutIcon size={12} /> Check Out
                      </button>
                      <button onClick={() => markCompleted(b.id)} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs hover:opacity-90 flex items-center gap-1">
                        <CheckCircle size={12} /> Complete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600 }} className="text-foreground mb-4">Pending Actions</h3>
            <div className="space-y-3">
              {bookings.filter(b => b.status === "Pending").map(b => (
                <div key={b.id} className="bg-card border border-border rounded-lg px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-accent shrink-0" />
                    <div>
                      <p className="text-sm text-foreground">{b.guest} — <span className="text-muted-foreground">{b.site}</span></p>
                      <p className="text-xs text-muted-foreground">{b.dates} · {b.guests} pax · <span className={b.paymentStatus === "Verified" ? "text-primary" : "text-accent"}>{b.paymentStatus}</span></p>
                    </div>
                  </div>
                  <button onClick={() => setReviewBooking(b)} className="bg-primary/10 text-primary px-3 py-1 rounded text-xs hover:bg-primary hover:text-primary-foreground transition-colors">Review</button>
                </div>
              ))}
              {payments.filter(p => p.status === "Pending").map(p => (
                <div key={p.id} className="bg-card border border-border rounded-lg px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard size={16} className="text-accent shrink-0" />
                    <div>
                      <p className="text-sm text-foreground">{p.guest} — <span className="text-muted-foreground">Payment via {p.method}</span></p>
                      <p className="text-xs text-muted-foreground">{p.bookingId} · {fmtDate(p.date)}</p>
                    </div>
                  </div>
                  <button onClick={() => setReviewPayment(p)} className="bg-primary/10 text-primary px-3 py-1 rounded text-xs hover:bg-primary hover:text-primary-foreground transition-colors">View Proof</button>
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
            <p className="text-muted-foreground text-sm mb-6">Active check-ins, confirmed upcoming, and bookings awaiting completion.</p>
            {(["CheckedIn", "Confirmed", "CheckedOut"] as const).map(status => {
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
                            <p style={{ fontFamily: "'DM Mono',monospace" }} className="text-xs text-muted-foreground">{b.id} · {b.guestEmail}</p>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full ${bookingStatusStyle[b.status] ?? ""}`}>{b.status}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1"><MapPin size={11} />{b.site}</span>
                          <span className="flex items-center gap-1"><Calendar size={11} />{b.dates}</span>
                          <span className="flex items-center gap-1"><Users size={11} />{b.guests} pax</span>
                          <span className="flex items-center gap-1"><CarIcon size={11} />{b.vehiclePlate}</span>
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
                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          <span style={{ fontFamily: "'DM Mono',monospace" }} className="text-sm text-foreground">RM {b.total}</span>
                          <div className="flex gap-2">
                            {b.status === "Confirmed" && (
                              <button onClick={() => markCheckedIn(b.id)} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-emerald-700 flex items-center gap-1">
                                <LogInIcon size={12} /> Check In
                              </button>
                            )}
                            {b.status === "CheckedIn" && (
                              <button onClick={() => markCheckedOut(b.id)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-blue-700 flex items-center gap-1">
                                <LogOutIcon size={12} /> Check Out
                              </button>
                            )}
                            {b.status === "CheckedOut" && (
                              <button onClick={() => markCompleted(b.id)} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs hover:opacity-90 flex items-center gap-1">
                                <CheckCircle size={12} /> Mark Complete
                              </button>
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
              <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
                <TentIcon size={32} className="mx-auto mb-2 opacity-30" /> No ongoing bookings.
              </div>
            )}
          </div>
        )}

        {/* ── APPROVALS ── */}
        {tab === "approvals" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1.6rem" }} className="text-foreground mb-2">Approvals</h2>
            <p className="text-muted-foreground text-sm mb-6">Review booking requests and verify payments.</p>

            <div className="flex rounded-xl overflow-hidden border border-border mb-8 w-fit">
              {[
                { id: "bookings" as const, label: "Booking Requests", badge: pendingBookings },
                { id: "payments" as const, label: "Payment Verifications", badge: pendingPayments },
              ].map(v => (
                <button key={v.id} onClick={() => setApprovalsView(v.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 text-sm transition-colors ${approvalsView === v.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                  {v.label}
                  {v.badge > 0 && (
                    <span className={`text-xs rounded-full w-5 h-5 flex items-center justify-center ${approvalsView === v.id ? "bg-white/20 text-white" : "bg-accent text-accent-foreground"}`}>{v.badge}</span>
                  )}
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
                      <div className="flex gap-2 flex-wrap">
                        <span className={`text-xs px-3 py-1 rounded-full ${bookingStatusStyle[b.status] ?? "bg-muted text-muted-foreground"}`}>{b.status}</span>
                        <span className={`text-xs px-3 py-1 rounded-full ${payStatusStyle[b.paymentStatus] ?? "bg-muted text-muted-foreground"}`}>{b.paymentStatus}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><MapPin size={11} />{b.site}</span>
                      <span className="flex items-center gap-1"><Calendar size={11} />{b.dates}</span>
                      <span className="flex items-center gap-1"><Users size={11} />{b.guests} pax</span>
                      <span className="flex items-center gap-1"><CarIcon size={11} />{b.vehiclePlate} ({b.vehicleCount})</span>
                    </div>
                    {b.activities.length > 0 && <div className="flex flex-wrap gap-1 mb-2">{b.activities.map(a => <span key={a.activityId} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{a.name}</span>)}</div>}
                    {b.equipment.length > 0 && <div className="flex flex-wrap gap-1 mb-2">{b.equipment.map(e => <span key={e.equipmentId} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{e.name} ({e.equipmentId})</span>)}</div>}
                    {b.paymentProofNote && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-3">
                        <p className="text-xs text-amber-700 font-medium mb-1 flex items-center gap-1"><EyeIcon size={11} /> Payment Proof</p>
                        <p className="text-sm text-foreground">{b.paymentProofNote}</p>
                      </div>
                    )}
                    {b.staffFeedback && (
                      <div className="bg-muted rounded-lg p-3 mb-3"><p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><MessageSquare size={11} /> Staff note sent</p><p className="text-sm text-foreground">{b.staffFeedback}</p></div>
                    )}
                    {b.status === "Rescheduled" && b.suggestedCheckIn && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3 text-sm">
                        <p className="text-xs text-purple-600 mb-1">Suggested dates</p>
                        <p className="text-foreground">{fmtDate(b.suggestedCheckIn)} → {fmtDate(b.suggestedCheckOut)}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span style={{ fontFamily: "'DM Mono',monospace" }} className="text-sm text-foreground">RM {b.total}</span>
                      {b.status === "Pending" && (
                        <button onClick={() => setReviewBooking(b)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:opacity-90">
                          <CheckCircle size={15} /> Review & Respond
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {approvalsView === "payments" && (
              <div className="space-y-4">
                {payments.length === 0 && <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm"><CheckCircle size={32} className="text-primary mx-auto mb-2" /> No payments yet.</div>}
                {payments.map(p => {
                  const linked = bookings.find(b => b.id === p.bookingId);
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
                        <span className="flex items-center gap-1 text-muted-foreground"><CreditCard size={13} />{p.method}</span>
                        <span className="flex items-center gap-1 text-muted-foreground"><Calendar size={13} />{fmtDate(p.date)}</span>
                        <span style={{ fontFamily: "'DM Mono',monospace" }} className="text-foreground">RM {p.amount}.00</span>
                      </div>
                      {p.proofNote && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-3">
                          <p className="text-xs text-amber-700 font-medium mb-1 flex items-center gap-1"><EyeIcon size={11} /> Payment Proof</p>
                          <p className="text-sm text-foreground">{p.proofNote}</p>
                        </div>
                      )}
                      {linked && <p className="text-xs text-muted-foreground mb-3">Linked: {linked.site} · {linked.dates} · Booking: <span className="font-medium">{linked.status}</span></p>}
                      {p.status === "Pending" && (
                        <div className="flex gap-3 pt-3 border-t border-border">
                          <button onClick={() => rejectPayment(p.id)} className="flex items-center gap-2 border border-destructive text-destructive px-4 py-2 rounded-lg text-sm hover:bg-destructive/10"><XCircle size={15} /> Reject</button>
                          <button onClick={() => verifyPayment(p.id)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:opacity-90"><CheckCircle size={15} /> Verify Payment</button>
                        </div>
                      )}
                      {p.status === "Verified" && linked && (
                        <div className="pt-3 border-t border-border">
                          <button onClick={() => generateInvoice(linked, p)} className="flex items-center gap-2 border border-border text-foreground px-4 py-2 rounded-lg text-sm hover:bg-muted">
                            <FileTextIcon size={15} /> {invoices.find(inv => inv.bookingId === p.bookingId) ? "View Invoice" : "Generate Invoice"}
                          </button>
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
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1.6rem" }} className="text-foreground mb-2">Manage Sites</h2>
            <p className="text-muted-foreground text-sm mb-8">Changes reflect instantly on the customer side.</p>
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
                      <button onClick={() => savePrice(site.id)} className="text-primary"><CheckIcon size={16} /></button>
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
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600 }} className="text-foreground mb-4 flex items-center gap-2"><PlusIcon size={16} /> Add New Activity</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div><label className="block text-sm text-foreground mb-1">Activity Name</label><input type="text" value={newAct.name} onChange={e => setNewAct({...newAct, name: e.target.value})} placeholder="e.g. Rock Climbing" className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                <div><label className="block text-sm text-foreground mb-1">Price per Pax (RM)</label><input type="number" value={newAct.pricePerPax} onChange={e => setNewAct({...newAct, pricePerPax: e.target.value})} placeholder="e.g. 50" className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                <div className="md:col-span-2"><label className="block text-sm text-foreground mb-1">Description</label><input type="text" value={newAct.description} onChange={e => setNewAct({...newAct, description: e.target.value})} placeholder="Brief description" className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                <div><label className="block text-sm text-foreground mb-1">Icon (emoji)</label><input type="text" value={newAct.icon} onChange={e => setNewAct({...newAct, icon: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              </div>
              <button onClick={addActivity} disabled={!newAct.name || !newAct.pricePerPax} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-40 flex items-center gap-2"><PlusIcon size={15} /> Add Activity</button>
            </div>
          </div>
        )}

        {/* ── EQUIPMENT ── */}
        {tab === "equipment" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1.6rem" }} className="text-foreground mb-2">Equipment & Tent Inventory</h2>
            <p className="text-muted-foreground text-sm mb-6">Each item has a unique ID. Track availability, condition, and linked bookings.</p>
            {(["tent", "equipment"] as const).map(cat => (
              <div key={cat} className="mb-8">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  {cat === "tent" ? <TentIcon size={15} /> : <PackageIcon size={15} />}
                  {cat === "tent" ? "Tents" : "Camping Equipment"}
                </h3>
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
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600 }} className="text-foreground mb-4 flex items-center gap-2"><PlusIcon size={16} /> Add New Item</h3>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div><label className="block text-sm text-foreground mb-1">Item Name</label><input type="text" value={newEq.name} onChange={e => setNewEq({...newEq, name: e.target.value})} placeholder="e.g. 3-Person Tunnel Tent" className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                <div><label className="block text-sm text-foreground mb-1">Category</label>
                  <select value={newEq.category} onChange={e => setNewEq({...newEq, category: e.target.value as "tent" | "equipment"})} className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="tent">Tent</option><option value="equipment">Equipment</option>
                  </select>
                </div>
                <div><label className="block text-sm text-foreground mb-1">Price / Night (RM)</label><input type="number" value={newEq.pricePerNight} onChange={e => setNewEq({...newEq, pricePerNight: e.target.value})} placeholder="e.g. 25" className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              </div>
              <button onClick={addEquipment} disabled={!newEq.name || !newEq.pricePerNight} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-40 flex items-center gap-2"><PlusIcon size={15} /> Add Item</button>
            </div>
          </div>
        )}

        {/* ── REFUNDS ── */}
        {tab === "refunds" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1.6rem" }} className="text-foreground mb-2">Refund Requests</h2>
            <p className="text-muted-foreground text-sm mb-6">Process refunds from guests whose bookings were rejected or rescheduled.</p>
            {refunds.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
                <BanknoteIcon size={32} className="mx-auto mb-2 opacity-30" /> No refund requests yet.
              </div>
            ) : (
              <div className="space-y-4">
                {refunds.map(r => {
                  const linked = bookings.find(b => b.id === r.bookingId);
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
                        <span className="flex items-center gap-1 text-muted-foreground"><BanknoteIcon size={13} />RM {r.amount}.00</span>
                        <span className="flex items-center gap-1 text-muted-foreground"><CreditCard size={13} />{r.method}</span>
                        <span className="flex items-center gap-1 text-muted-foreground"><Calendar size={13} />{fmtDate(r.requestedAt)}</span>
                        <span className="text-muted-foreground text-xs">Reason: {r.reason}</span>
                      </div>
                      {linked && <p className="text-xs text-muted-foreground mb-3">Booking: {linked.site} · {linked.dates}</p>}
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

        {/* ── INVOICES ── */}
        {tab === "invoices" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1.6rem" }} className="text-foreground mb-2">Invoices</h2>
            <p className="text-muted-foreground text-sm mb-6">Generated invoices for verified bookings. Go to Approvals → Payment Verifications to generate new invoices.</p>
            {invoices.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
                <FileTextIcon size={32} className="mx-auto mb-2 opacity-30" />
                No invoices generated yet. Verify a payment to generate the first invoice.
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map(inv => {
                  const linkedBooking = bookings.find(b => b.id === inv.bookingId);
                  return (
                    <div key={inv.id} className="bg-card border border-border rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600 }} className="text-foreground">{inv.guest}</p>
                          <span style={{ fontFamily: "'DM Mono',monospace" }} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">{inv.id}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{inv.site} · {fmtDate(inv.checkIn)} – {fmtDate(inv.checkOut)}</p>
                        <p className="text-xs text-muted-foreground">Issued: {fmtDate(inv.invoiceDate)} · Booking: {inv.bookingId}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p style={{ fontFamily: "'DM Mono',monospace" }} className="text-foreground font-semibold">RM {inv.totalAmount.toFixed(2)}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${inv.paymentStatus === "Verified" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>{inv.paymentStatus}</span>
                        </div>
                        <button onClick={() => setViewingInvoice(inv)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:opacity-90">
                          <EyeIcon size={14} /> View Invoice
                        </button>
                      </div>
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
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1.6rem" }} className="text-foreground mb-2">Monthly Report</h2>
            <p className="text-muted-foreground text-sm mb-6">Bookings, revenue, activity and equipment summary for the selected month.</p>
            <div className="flex items-center gap-4 mb-8">
              <label className="text-sm text-foreground">Month:</label>
              <input type="month" value={reportMonth} onChange={e => setReportMonth(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Bookings", value: String(reportData.total) },
                { label: "Revenue", value: `RM ${reportData.revenue}` },
                { label: "Completed", value: String(reportData.byStatus["Completed"] ?? 0) },
                { label: "Rejected", value: String(reportData.byStatus["Rejected"] ?? 0) },
              ].map((s, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-5">
                  <p style={{ fontFamily: "'DM Mono',monospace" }} className="text-2xl text-foreground mb-1">{s.value}</p>
                  <p className="text-sm text-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600 }} className="text-foreground mb-4 flex items-center gap-2"><BarChartIcon size={16} /> Status Breakdown</h3>
                {Object.entries(reportData.byStatus).filter(([, v]) => v > 0).map(([status, count]) => (
                  <div key={status} className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-muted-foreground w-28 shrink-0">{status}</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${reportData.total > 0 ? (count / reportData.total) * 100 : 0}%` }} />
                    </div>
                    <span style={{ fontFamily: "'DM Mono',monospace" }} className="text-sm text-foreground w-6 text-right">{count}</span>
                  </div>
                ))}
                {reportData.total === 0 && <p className="text-muted-foreground text-sm">No bookings this month.</p>}
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600 }} className="text-foreground mb-4 flex items-center gap-2"><ActivityIcon size={16} /> Activity Participation</h3>
                {Object.keys(reportData.actCounts).length === 0
                  ? <p className="text-muted-foreground text-sm">No activities booked.</p>
                  : Object.entries(reportData.actCounts).map(([name, pax]) => (
                    <div key={name} className="flex justify-between text-sm mb-2 border-b border-border pb-1">
                      <span className="text-foreground">{name}</span>
                      <span style={{ fontFamily: "'DM Mono',monospace" }} className="text-muted-foreground">{pax} pax</span>
                    </div>
                  ))
                }
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 mb-8">
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600 }} className="text-foreground mb-4 flex items-center gap-2"><PackageIcon size={16} /> Equipment Usage</h3>
              {Object.keys(reportData.eqCounts).length === 0
                ? <p className="text-muted-foreground text-sm">No equipment rented.</p>
                : <div className="flex flex-wrap gap-3">
                  {Object.entries(reportData.eqCounts).map(([name, count]) => (
                    <div key={name} className="bg-muted rounded-lg px-4 py-2 text-sm">
                      <p className="text-foreground">{name}</p>
                      <p style={{ fontFamily: "'DM Mono',monospace" }} className="text-muted-foreground text-xs">{count} rental{count > 1 ? "s" : ""}</p>
                    </div>
                  ))}
                </div>
              }
            </div>

            <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600 }} className="text-foreground mb-4 flex items-center gap-2"><FileTextIcon size={16} /> Booking Details</h3>
            {reportData.bookings.length === 0
              ? <div className="bg-card border border-border rounded-xl p-6 text-center text-muted-foreground text-sm">No bookings in this period.</div>
              : (
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        {["ID", "Guest", "Campsite", "Dates", "Guests", "Total", "Status", "Payment"].map(h => (
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
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${bookingStatusStyle[b.status] ?? "bg-muted text-muted-foreground"}`}>{b.status}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${payStatusStyle[b.paymentStatus] ?? "bg-muted text-muted-foreground"}`}>{b.paymentStatus}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </div>
        )}
      </div>
    </div>
  );
}
