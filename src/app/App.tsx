import { useState, useEffect } from "react";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";
import { CustomerDashboard } from "./components/CustomerDashboard";
import { StaffDashboard } from "./components/StaffDashboard";

/* MARKER-MAKE-KIT-INVOKED */

type Page = "landing" | "auth" | "customer" | "staff";
type UserRole = "customer" | "staff";

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface Campsite {
  id: number;
  name: string;
  type: string;
  price: number; // per night
  capacity: number;
  rating: number;
  available: boolean;
  features: string[];
  description: string;
  img: string;
  gallery: string[];
}

export interface Activity {
  id: string;           // e.g. "ACT-001"
  name: string;         // e.g. "4x4 Off-Road"
  description: string;
  pricePerPax: number;
  available: boolean;
  icon: string;         // emoji
}

export interface Equipment {
  id: string;           // e.g. "EQ-T-001"
  name: string;         // e.g. "2-Person Dome Tent"
  category: "tent" | "equipment";
  pricePerNight: number;
  available: boolean;   // false = rented out
  condition: "Good" | "Fair" | "Needs Repair";
  currentBookingId: string; // booking using it, or ""
}

export interface RefundRequest {
  id: string;
  bookingId: string;
  guest: string;
  amount: number;
  method: string;
  reason: string;       // rejected | rescheduled
  status: "Pending" | "Processed" | "Rejected";
  requestedAt: string;
}

export interface BookingActivity {
  activityId: string;
  name: string;
  pax: number;
  pricePerPax: number;
}

export interface BookingEquipment {
  equipmentId: string;
  name: string;
  nights: number;
  pricePerNight: number;
}

export interface Booking {
  id: string;
  guest: string;
  guestEmail: string;
  phone: string;
  vehiclePlate: string;
  vehicleCount: number;
  siteId: number;
  site: string;
  checkIn: string;
  checkOut: string;
  dates: string;
  guests: number;
  activities: BookingActivity[];
  equipment: BookingEquipment[];
  siteCost: number;
  activitiesCost: number;
  equipmentCost: number;
  total: number;
  status: "Pending" | "Confirmed" | "CheckedIn" | "CheckedOut" | "Completed" | "Rejected" | "Rescheduled" | "Declined";
  staffFeedback: string;
  suggestedCheckIn: string;
  suggestedCheckOut: string;
  paymentStatus: "Unpaid" | "ProofSubmitted" | "Verified" | "Rejected";
  paymentMethod: string;
  paymentProofNote: string; // simulated "proof" description
  paymentDate: string;
  checkedIn: boolean;
  checkedOut: boolean;
  _isNew?: boolean;
  ownerId: string; // email of customer who made it
}

export interface Payment {
  id: string;
  bookingId: string;
  guest: string;
  amount: number;
  method: string;
  proofNote: string;
  proofImage: string; // base64 data URL of uploaded receipt/screenshot
  date: string;
  status: "Pending" | "Verified" | "Rejected";
}

export interface Invoice {
  id: string;           // e.g. "INV-2483"
  bookingId: string;
  paymentId: string;
  invoiceDate: string;
  guest: string;
  guestEmail: string;
  phone: string;
  site: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  vehiclePlate: string;
  activities: { name: string; pax: number; pricePerPax: number }[];
  equipment: { name: string; equipmentId: string; nights: number; pricePerNight: number }[];
  siteCost: number;
  activitiesCost: number;
  equipmentCost: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT DATA
// ═══════════════════════════════════════════════════════════════════════════════

export const DEFAULT_CAMPSITES: Campsite[] = [
  { id: 1, name: "Riverside Clearing A", type: "Open Plot", price: 35, capacity: 6, rating: 4.9, available: true,
    features: ["River access", "Firepit", "Picnic table"],
    description: "A spacious open clearing right beside the gentle Perong River. Perfect for groups who love the sound of flowing water and stargazing.",
    img: "https://images.unsplash.com/photo-1507777767380-68bdac55c642?w=800&h=500&fit=crop&auto=format",
    gallery: ["https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=280&fit=crop","https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=400&h=280&fit=crop"] },
  { id: 2, name: "Hilltop Nook B", type: "Sheltered Platform", price: 55, capacity: 4, rating: 4.8, available: true,
    features: ["Sunrise view", "Wooden platform", "Electricity point"],
    description: "Perched on a gentle ridge overlooking the forest canopy with a power outlet. Catch breathtaking sunrises every morning.",
    img: "https://images.unsplash.com/photo-1624923686627-514dd5e57bae?w=800&h=500&fit=crop&auto=format",
    gallery: ["https://images.unsplash.com/photo-1559521783-1d1599583485?w=400&h=280&fit=crop","https://images.unsplash.com/photo-1526491109672-74740652b963?w=400&h=280&fit=crop"] },
  { id: 3, name: "Firefly Valley C", type: "Forest Plot", price: 40, capacity: 8, rating: 4.9, available: false,
    features: ["Firefly trail", "Large clearing", "Water tap nearby"],
    description: "Nestled in a magical valley famous for its firefly displays at dusk. Large clearing for big groups.",
    img: "https://images.unsplash.com/photo-1470246973918-29a93221c455?w=800&h=500&fit=crop&auto=format",
    gallery: ["https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=400&h=280&fit=crop","https://images.unsplash.com/photo-1561015664-e8a4b59e2f63?w=400&h=280&fit=crop"] },
  { id: 4, name: "Waterfall Base D", type: "Open Plot", price: 45, capacity: 10, rating: 4.7, available: true,
    features: ["Waterfall access", "Swimming hole", "Large area"],
    description: "5-minute walk to a stunning 12m waterfall with a natural swimming hole. Ideal for multiple tents.",
    img: "https://images.unsplash.com/photo-1592859600972-1b0834d83747?w=800&h=500&fit=crop&auto=format",
    gallery: ["https://images.unsplash.com/photo-1432163648788-0de1fa3d4c73?w=400&h=280&fit=crop","https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=280&fit=crop"] },
  { id: 5, name: "Canopy Suite E", type: "Premium Platform", price: 90, capacity: 2, rating: 5.0, available: true,
    features: ["Elevated deck", "360° views", "Private shower"],
    description: "Elevated hardwood deck with 360° panoramic views, private outdoor shower, and fairy lighting.",
    img: "https://images.unsplash.com/photo-1448518340475-e3c680e9b4be?w=800&h=500&fit=crop&auto=format",
    gallery: ["https://images.unsplash.com/photo-1521401830884-6c03c1c87ebb?w=400&h=280&fit=crop","https://images.unsplash.com/photo-1485016778165-3adf8d8c92b9?w=400&h=280&fit=crop"] },
  { id: 6, name: "Stream Edge F", type: "Open Plot", price: 30, capacity: 4, rating: 4.6, available: true,
    features: ["Streamside", "Shaded area", "Toilet nearby"],
    description: "A quiet, shaded site along a babbling stream. Clean toilet facilities 50m away.",
    img: "https://images.unsplash.com/photo-1576176539998-0237d1ac6a85?w=800&h=500&fit=crop&auto=format",
    gallery: ["https://images.unsplash.com/photo-1544465544-1b71aee9dfa3?w=400&h=280&fit=crop","https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=280&fit=crop"] },
];

export const DEFAULT_ACTIVITIES: Activity[] = [
  { id: "ACT-001", name: "4x4 Off-Road Adventure", description: "Guided 4x4 trail through the jungle terrain. Vehicles provided.", pricePerPax: 80, available: true, icon: "🚙" },
  { id: "ACT-002", name: "Kayaking", description: "Paddle down the Perong River with a certified guide. Life vests included.", pricePerPax: 45, available: true, icon: "🛶" },
  { id: "ACT-003", name: "Jungle Trekking", description: "Guided 3-hour trek through primary rainforest. Flora & fauna briefing included.", pricePerPax: 35, available: true, icon: "🥾" },
];

export const DEFAULT_EQUIPMENT: Equipment[] = [
  { id: "EQ-T-001", name: "2-Person Dome Tent", category: "tent", pricePerNight: 20, available: true, condition: "Good", currentBookingId: "" },
  { id: "EQ-T-002", name: "2-Person Dome Tent", category: "tent", pricePerNight: 20, available: true, condition: "Good", currentBookingId: "" },
  { id: "EQ-T-003", name: "4-Person Family Tent", category: "tent", pricePerNight: 35, available: false, condition: "Good", currentBookingId: "BK-2481" },
  { id: "EQ-T-004", name: "4-Person Family Tent", category: "tent", pricePerNight: 35, available: true, condition: "Fair", currentBookingId: "" },
  { id: "EQ-T-005", name: "6-Person Group Tent", category: "tent", pricePerNight: 50, available: true, condition: "Good", currentBookingId: "" },
  { id: "EQ-S-001", name: "Sleeping Bag (Adult)", category: "equipment", pricePerNight: 8, available: true, condition: "Good", currentBookingId: "" },
  { id: "EQ-S-002", name: "Sleeping Bag (Adult)", category: "equipment", pricePerNight: 8, available: false, condition: "Good", currentBookingId: "BK-2479" },
  { id: "EQ-S-003", name: "Sleeping Bag (Child)", category: "equipment", pricePerNight: 5, available: true, condition: "Good", currentBookingId: "" },
  { id: "EQ-L-001", name: "Camping Lantern", category: "equipment", pricePerNight: 5, available: true, condition: "Good", currentBookingId: "" },
  { id: "EQ-L-002", name: "Camping Lantern", category: "equipment", pricePerNight: 5, available: true, condition: "Fair", currentBookingId: "" },
  { id: "EQ-C-001", name: "Cooking Set (4-pax)", category: "equipment", pricePerNight: 12, available: true, condition: "Good", currentBookingId: "" },
  { id: "EQ-C-002", name: "Portable Stove", category: "equipment", pricePerNight: 8, available: true, condition: "Good", currentBookingId: "" },
];

export const DEFAULT_BOOKINGS: Booking[] = [
  { id: "BK-2483", guest: "Nurul Ain Binti Aziz", guestEmail: "nurul@demo.com", phone: "012-3456789", vehiclePlate: "WXY 1234", vehicleCount: 1,
    siteId: 5, site: "Canopy Suite E", checkIn: "2026-07-20", checkOut: "2026-07-22", dates: "20–22 Jul 2026", guests: 2,
    activities: [{ activityId: "ACT-002", name: "Kayaking", pax: 2, pricePerPax: 45 }],
    equipment: [{ equipmentId: "EQ-S-001", name: "Sleeping Bag (Adult)", nights: 2, pricePerNight: 8 }],
    siteCost: 180, activitiesCost: 90, equipmentCost: 16, total: 286,
    status: "Pending", staffFeedback: "", suggestedCheckIn: "", suggestedCheckOut: "",
    paymentStatus: "ProofSubmitted", paymentMethod: "FPX", paymentProofNote: "Transferred via Maybank2u, ref TXN-88210", paymentDate: "2026-07-01",
    checkedIn: false, checkedOut: false, ownerId: "nurul@demo.com" },
  { id: "BK-2482", guest: "Lim Wei Jian", guestEmail: "lim@demo.com", phone: "016-7654321", vehiclePlate: "VKL 5678", vehicleCount: 2,
    siteId: 4, site: "Waterfall Base D", checkIn: "2026-07-17", checkOut: "2026-07-19", dates: "17–19 Jul 2026", guests: 5,
    activities: [{ activityId: "ACT-003", name: "Jungle Trekking", pax: 5, pricePerPax: 35 }],
    equipment: [],
    siteCost: 90, activitiesCost: 175, equipmentCost: 0, total: 265,
    status: "Confirmed", staffFeedback: "", suggestedCheckIn: "", suggestedCheckOut: "",
    paymentStatus: "Verified", paymentMethod: "Card", paymentProofNote: "Visa ending 4242", paymentDate: "2026-07-01",
    checkedIn: false, checkedOut: false, ownerId: "lim@demo.com" },
  { id: "BK-2481", guest: "Amirah Hassan", guestEmail: "amirah@demo.com", phone: "011-9988776", vehiclePlate: "BNM 9900", vehicleCount: 1,
    siteId: 1, site: "Riverside Clearing A", checkIn: "2026-06-28", checkOut: "2026-06-30", dates: "28–30 Jun 2026", guests: 4,
    activities: [],
    equipment: [{ equipmentId: "EQ-T-003", name: "4-Person Family Tent", nights: 2, pricePerNight: 35 }],
    siteCost: 70, activitiesCost: 0, equipmentCost: 70, total: 140,
    status: "Confirmed", staffFeedback: "", suggestedCheckIn: "", suggestedCheckOut: "",
    paymentStatus: "Verified", paymentMethod: "Touch 'n Go", paymentProofNote: "TnG wallet transfer confirmed", paymentDate: "2026-06-20",
    checkedIn: false, checkedOut: false, ownerId: "amirah@demo.com" },
  { id: "BK-2479", guest: "Raj Subramaniam", guestEmail: "raj@demo.com", phone: "017-1122334", vehiclePlate: "QRS 4400", vehicleCount: 1,
    siteId: 2, site: "Hilltop Nook B", checkIn: "2026-06-10", checkOut: "2026-06-12", dates: "10–12 Jun 2026", guests: 2,
    activities: [{ activityId: "ACT-001", name: "4x4 Off-Road Adventure", pax: 2, pricePerPax: 80 }],
    equipment: [{ equipmentId: "EQ-S-002", name: "Sleeping Bag (Adult)", nights: 2, pricePerNight: 8 }],
    siteCost: 110, activitiesCost: 160, equipmentCost: 16, total: 286,
    status: "CheckedIn", staffFeedback: "", suggestedCheckIn: "", suggestedCheckOut: "",
    paymentStatus: "Verified", paymentMethod: "Card", paymentProofNote: "Mastercard ending 9876", paymentDate: "2026-06-05",
    checkedIn: true, checkedOut: false, ownerId: "raj@demo.com" },
  { id: "BK-2309", guest: "Sarah Chen", guestEmail: "sarah@demo.com", phone: "019-5544332", vehiclePlate: "DEF 2200", vehicleCount: 1,
    siteId: 2, site: "Hilltop Nook B", checkIn: "2026-05-22", checkOut: "2026-05-24", dates: "22–24 May 2026", guests: 2,
    activities: [],
    equipment: [],
    siteCost: 110, activitiesCost: 0, equipmentCost: 0, total: 110,
    status: "Completed", staffFeedback: "", suggestedCheckIn: "", suggestedCheckOut: "",
    paymentStatus: "Verified", paymentMethod: "FPX", paymentProofNote: "CIMB Clicks transfer confirmed", paymentDate: "2026-05-15",
    checkedIn: true, checkedOut: true, ownerId: "sarah@demo.com" },
];

export const DEFAULT_PAYMENTS: Payment[] = [
  { id: "PAY-8821", bookingId: "BK-2483", guest: "Nurul Ain Binti Aziz", amount: 286, method: "FPX", proofNote: "Transferred via Maybank2u, ref TXN-88210", proofImage: "", date: "2026-07-01", status: "Pending" },
  { id: "PAY-8820", bookingId: "BK-2482", guest: "Lim Wei Jian", amount: 265, method: "Card", proofNote: "Visa ending 4242", proofImage: "", date: "2026-07-01", status: "Verified" },
  { id: "PAY-8819", bookingId: "BK-2481", guest: "Amirah Hassan", amount: 140, method: "Touch 'n Go", proofNote: "TnG wallet transfer confirmed", proofImage: "", date: "2026-06-20", status: "Verified" },
  { id: "PAY-8817", bookingId: "BK-2479", guest: "Raj Subramaniam", amount: 286, method: "Card", proofNote: "Mastercard ending 9876", proofImage: "", date: "2026-06-05", status: "Verified" },
  { id: "PAY-8710", bookingId: "BK-2309", guest: "Sarah Chen", amount: 110, method: "FPX", proofNote: "CIMB Clicks transfer confirmed", proofImage: "", date: "2026-05-15", status: "Verified" },
];

export const DEFAULT_REFUNDS: RefundRequest[] = [];
export const DEFAULT_INVOICES: Invoice[] = [];

// ═══════════════════════════════════════════════════════════════════════════════
// PERSISTENCE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function loadData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

export function saveData(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════════

export default function App() {
  // Persist login session across reloads
  const [page, setPage] = useState<Page>(() => {
    const saved = localStorage.getItem("pc_session");
    if (saved) {
      const s = JSON.parse(saved);
      return s.page as Page;
    }
    return "landing";
  });
  const [userName, setUserName] = useState<string>(() => {
    const saved = localStorage.getItem("pc_session");
    return saved ? JSON.parse(saved).userName : "";
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    const saved = localStorage.getItem("pc_session");
    return saved ? JSON.parse(saved).userEmail : "";
  });

  const [campsites, setCampsites] = useState<Campsite[]>(() => loadData("pc_campsites", DEFAULT_CAMPSITES));
  const [activities, setActivities] = useState<Activity[]>(() => loadData("pc_activities", DEFAULT_ACTIVITIES));
  const [equipment, setEquipment] = useState<Equipment[]>(() => loadData("pc_equipment", DEFAULT_EQUIPMENT));
  const [bookings, setBookings] = useState<Booking[]>(() => loadData("pc_bookings", DEFAULT_BOOKINGS));
  const [payments, setPayments] = useState<Payment[]>(() => loadData("pc_payments", DEFAULT_PAYMENTS));
  const [refunds, setRefunds] = useState<RefundRequest[]>(() => loadData("pc_refunds", DEFAULT_REFUNDS));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadData("pc_invoices", DEFAULT_INVOICES));

  // Persist all data on change
  useEffect(() => { saveData("pc_campsites", campsites); }, [campsites]);
  useEffect(() => { saveData("pc_activities", activities); }, [activities]);
  useEffect(() => { saveData("pc_equipment", equipment); }, [equipment]);
  useEffect(() => { saveData("pc_bookings", bookings); }, [bookings]);
  useEffect(() => { saveData("pc_payments", payments); }, [payments]);
  useEffect(() => { saveData("pc_refunds", refunds); }, [refunds]);
  useEffect(() => { saveData("pc_invoices", invoices); }, [invoices]);

  // Persist session
  useEffect(() => {
    if (page === "customer" || page === "staff") {
      saveData("pc_session", { page, userName, userEmail });
    } else {
      localStorage.removeItem("pc_session");
    }
  }, [page, userName, userEmail]);

  const handleLogin = (role: UserRole, name: string, email: string) => {
    setUserName(name);
    setUserEmail(email);
    setPage(role === "customer" ? "customer" : "staff");
  };

  const handleLogout = () => {
    setUserName("");
    setUserEmail("");
    localStorage.removeItem("pc_session");
    setPage("landing");
  };

  const sharedProps = {
    campsites, setCampsites,
    activities, setActivities,
    equipment, setEquipment,
    bookings, setBookings,
    payments, setPayments,
    refunds, setRefunds,
    invoices, setInvoices,
  };

  if (page === "landing") return <LandingPage onGetStarted={() => setPage("auth")} />;
  if (page === "auth") return <AuthPage onBack={() => setPage("landing")} onLogin={handleLogin} />;
  if (page === "customer") return <CustomerDashboard userName={userName} userEmail={userEmail} onLogout={handleLogout} {...sharedProps} />;
  return <StaffDashboard userName={userName} onLogout={handleLogout} {...sharedProps} />;
}
