import { useState, useEffect } from "react";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";
import { CustomerDashboard } from "./components/CustomerDashboard";
import { StaffDashboard } from "./components/StaffDashboard";
import { TreePine } from "lucide-react";

/* MARKER-MAKE-KIT-INVOKED */

type Page = "landing" | "auth" | "customer" | "staff";
type UserRole = "customer" | "staff";

// ─── Shared data types ────────────────────────────────────────────────────────
export interface Campsite {
  id: number;
  name: string;
  type: string;
  price: number;
  capacity: number;
  rating: number;
  available: boolean;
  features: string[];
  description: string;
  img: string;
  gallery: string[];
}

export interface Booking {
  id: string;
  guest: string;
  siteId: number;
  site: string;
  checkIn: string;
  checkOut: string;
  dates: string;
  guests: number;
  total: number;
  status: "Pending" | "Confirmed" | "Completed" | "Rejected" | "Rescheduled" | "Declined";
  staffFeedback: string;
  suggestedCheckIn: string;
  suggestedCheckOut: string;
  paid: boolean;
  _isNew?: boolean;
}

export interface Payment {
  id: string;
  bookingId: string;
  guest: string;
  amount: number;
  method: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
}

// ─── Default data ─────────────────────────────────────────────────────────────
const DEFAULT_CAMPSITES: Campsite[] = [
  {
    id: 1, name: "Riverside Clearing A", type: "Open Plot", price: 35, capacity: 6, rating: 4.9, available: true,
    features: ["River access", "Firepit", "Picnic table"],
    description: "A spacious open clearing right beside the gentle Perong River. Perfect for groups who love the sound of flowing water and stargazing from a flat, open field.",
    img: "https://images.unsplash.com/photo-1507777767380-68bdac55c642?w=800&h=500&fit=crop&auto=format",
    gallery: ["https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=280&fit=crop", "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=400&h=280&fit=crop"],
  },
  {
    id: 2, name: "Hilltop Nook B", type: "Sheltered Platform", price: 55, capacity: 4, rating: 4.8, available: true,
    features: ["Sunrise view", "Wooden platform", "Electricity point"],
    description: "Perched on a gentle ridge overlooking the forest canopy. The wooden platform keeps you off the ground and there's a power outlet for essentials. Catch breathtaking sunrises every morning.",
    img: "https://images.unsplash.com/photo-1624923686627-514dd5e57bae?w=800&h=500&fit=crop&auto=format",
    gallery: ["https://images.unsplash.com/photo-1559521783-1d1599583485?w=400&h=280&fit=crop", "https://images.unsplash.com/photo-1526491109672-74740652b963?w=400&h=280&fit=crop"],
  },
  {
    id: 3, name: "Firefly Valley C", type: "Forest Plot", price: 40, capacity: 8, rating: 4.9, available: false,
    features: ["Firefly trail", "Large clearing", "Water tap nearby"],
    description: "Nestled in a magical valley famous for its firefly displays at dusk. The large clearing can accommodate big groups and a water tap is just 30m away.",
    img: "https://images.unsplash.com/photo-1470246973918-29a93221c455?w=800&h=500&fit=crop&auto=format",
    gallery: ["https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=400&h=280&fit=crop", "https://images.unsplash.com/photo-1561015664-e8a4b59e2f63?w=400&h=280&fit=crop"],
  },
  {
    id: 4, name: "Waterfall Base D", type: "Open Plot", price: 45, capacity: 10, rating: 4.7, available: true,
    features: ["Waterfall access", "Swimming hole", "Large area"],
    description: "The most popular site for larger groups — a 5-minute walk leads to a stunning 12m waterfall with a natural swimming hole. The flat ground is ideal for multiple tents.",
    img: "https://images.unsplash.com/photo-1592859600972-1b0834d83747?w=800&h=500&fit=crop&auto=format",
    gallery: ["https://images.unsplash.com/photo-1432163648788-0de1fa3d4c73?w=400&h=280&fit=crop", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=280&fit=crop"],
  },
  {
    id: 5, name: "Canopy Suite E", type: "Premium Platform", price: 90, capacity: 2, rating: 5.0, available: true,
    features: ["Elevated deck", "360° views", "Private shower"],
    description: "Our most exclusive offering. An elevated hardwood deck with 360° panoramic views, complete with a private outdoor shower and ambient fairy lighting. Perfect for a romantic escape.",
    img: "https://images.unsplash.com/photo-1448518340475-e3c680e9b4be?w=800&h=500&fit=crop&auto=format",
    gallery: ["https://images.unsplash.com/photo-1521401830884-6c03c1c87ebb?w=400&h=280&fit=crop", "https://images.unsplash.com/photo-1485016778165-3adf8d8c92b9?w=400&h=280&fit=crop"],
  },
  {
    id: 6, name: "Stream Edge F", type: "Open Plot", price: 30, capacity: 4, rating: 4.6, available: true,
    features: ["Streamside", "Shaded area", "Toilet nearby"],
    description: "A quiet, shaded site along a babbling stream. Dense tree cover keeps it cool even in the afternoon. Clean toilet facilities are located just 50m from the pitch.",
    img: "https://images.unsplash.com/photo-1576176539998-0237d1ac6a85?w=800&h=500&fit=crop&auto=format",
    gallery: ["https://images.unsplash.com/photo-1544465544-1b71aee9dfa3?w=400&h=280&fit=crop", "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=280&fit=crop"],
  },
];

const DEFAULT_BOOKINGS: Booking[] = [
  { id: "BK-2483", guest: "Nurul Ain Binti Aziz", siteId: 5, site: "Canopy Suite E", checkIn: "2026-06-20", checkOut: "2026-06-22", dates: "20–22 Jun 2026", guests: 2, total: 180, status: "Pending", staffFeedback: "", suggestedCheckIn: "", suggestedCheckOut: "", paid: false },
  { id: "BK-2482", guest: "Lim Wei Jian", siteId: 4, site: "Waterfall Base D", checkIn: "2026-06-17", checkOut: "2026-06-19", dates: "17–19 Jun 2026", guests: 5, total: 90, status: "Pending", staffFeedback: "", suggestedCheckIn: "", suggestedCheckOut: "", paid: false },
  { id: "BK-2481", guest: "Amirah Hassan", siteId: 1, site: "Riverside Clearing A", checkIn: "2026-06-14", checkOut: "2026-06-16", dates: "14–16 Jun 2026", guests: 4, total: 105, status: "Confirmed", staffFeedback: "", suggestedCheckIn: "", suggestedCheckOut: "", paid: true },
  { id: "BK-2479", guest: "Raj Subramaniam", siteId: 2, site: "Hilltop Nook B", checkIn: "2026-06-10", checkOut: "2026-06-12", dates: "10–12 Jun 2026", guests: 2, total: 110, status: "Confirmed", staffFeedback: "", suggestedCheckIn: "", suggestedCheckOut: "", paid: true },
  { id: "BK-2309", guest: "Sarah Chen", siteId: 2, site: "Hilltop Nook B", checkIn: "2026-05-22", checkOut: "2026-05-24", dates: "22–24 May 2026", guests: 2, total: 110, status: "Completed", staffFeedback: "", suggestedCheckIn: "", suggestedCheckOut: "", paid: true },
];

const DEFAULT_PAYMENTS: Payment[] = [
  { id: "PAY-8821", bookingId: "BK-2483", guest: "Nurul Ain Binti Aziz", amount: 180, method: "FPX", date: "10 Jun 2026", status: "Pending" },
  { id: "PAY-8820", bookingId: "BK-2482", guest: "Lim Wei Jian", amount: 90, method: "Card", date: "09 Jun 2026", status: "Pending" },
  { id: "PAY-8819", bookingId: "BK-2481", guest: "Amirah Hassan", amount: 105, method: "Touch 'n Go", date: "08 Jun 2026", status: "Approved" },
  { id: "PAY-8817", bookingId: "BK-2479", guest: "Raj Subramaniam", amount: 110, method: "Card", date: "07 Jun 2026", status: "Approved" },
  { id: "PAY-8710", bookingId: "BK-2309", guest: "Sarah Chen", amount: 110, method: "FPX", date: "20 May 2026", status: "Approved" },
];

// ─── localStorage persistence (browser-native, no window.storage) ─────────────
function loadData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
export function saveData(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export default function App() {
  const [page, setPage] = useState<Page>("landing");
  const [userName, setUserName] = useState("");

  const [campsites, setCampsites] = useState<Campsite[]>(() => loadData("pc_campsites", DEFAULT_CAMPSITES));
  const [bookings, setBookings] = useState<Booking[]>(() => loadData("pc_bookings", DEFAULT_BOOKINGS));
  const [payments, setPayments] = useState<Payment[]>(() => loadData("pc_payments", DEFAULT_PAYMENTS));

  // Persist on every change
  useEffect(() => { saveData("pc_campsites", campsites); }, [campsites]);
  useEffect(() => { saveData("pc_bookings", bookings); }, [bookings]);
  useEffect(() => { saveData("pc_payments", payments); }, [payments]);

  const handleLogin = (role: UserRole, name: string) => {
    setUserName(name);
    setPage(role === "customer" ? "customer" : "staff");
  };

  const handleLogout = () => {
    setUserName("");
    setPage("landing");
  };

  if (page === "landing") return <LandingPage onGetStarted={() => setPage("auth")} />;
  if (page === "auth") return <AuthPage onBack={() => setPage("landing")} onLogin={handleLogin} />;

  if (page === "customer") {
    return (
      <CustomerDashboard
        userName={userName}
        onLogout={handleLogout}
        campsites={campsites}
        bookings={bookings}
        setBookings={(updated) => setBookings(updated)}
        payments={payments}
      />
    );
  }

  return (
    <StaffDashboard
      userName={userName}
      onLogout={handleLogout}
      campsites={campsites}
      setCampsites={(updated) => setCampsites(updated)}
      bookings={bookings}
      setBookings={(updated) => setBookings(updated)}
      payments={payments}
      setPayments={(updated) => setPayments(updated)}
    />
  );
}
