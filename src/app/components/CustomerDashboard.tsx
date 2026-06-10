import { useState } from "react";
import { TreePine, MapPin, Users, Calendar, CreditCard, CheckCircle, Clock, LogOut, Star, Tent, ChevronRight, X } from "lucide-react";

interface CustomerDashboardProps {
  userName: string;
  onLogout: () => void;
}

type TabId = "browse" | "booking" | "payment" | "mybookings";

const campsites = [
  {
    id: 1,
    name: "Riverside Clearing A",
    type: "Open Plot",
    price: 35,
    capacity: 6,
    rating: 4.9,
    available: true,
    features: ["River access", "Firepit", "Picnic table"],
    img: "https://images.unsplash.com/photo-1507777767380-68bdac55c642?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: 2,
    name: "Hilltop Nook B",
    type: "Sheltered Platform",
    price: 55,
    capacity: 4,
    rating: 4.8,
    available: true,
    features: ["Sunrise view", "Wooden platform", "Electricity point"],
    img: "https://images.unsplash.com/photo-1624923686627-514dd5e57bae?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: 3,
    name: "Firefly Valley C",
    type: "Forest Plot",
    price: 40,
    capacity: 8,
    rating: 4.9,
    available: false,
    features: ["Firefly trail", "Large clearing", "Water tap nearby"],
    img: "https://images.unsplash.com/photo-1470246973918-29a93221c455?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: 4,
    name: "Waterfall Base D",
    type: "Open Plot",
    price: 45,
    capacity: 10,
    rating: 4.7,
    available: true,
    features: ["Waterfall access", "Swimming hole", "Large area"],
    img: "https://images.unsplash.com/photo-1592859600972-1b0834d83747?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: 5,
    name: "Canopy Suite E",
    type: "Premium Platform",
    price: 90,
    capacity: 2,
    rating: 5.0,
    available: true,
    features: ["Elevated deck", "360° views", "Private shower"],
    img: "https://images.unsplash.com/photo-1448518340475-e3c680e9b4be?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: 6,
    name: "Stream Edge F",
    type: "Open Plot",
    price: 30,
    capacity: 4,
    rating: 4.6,
    available: true,
    features: ["Streamside", "Shaded area", "Toilet nearby"],
    img: "https://images.unsplash.com/photo-1576176539998-0237d1ac6a85?w=600&h=400&fit=crop&auto=format",
  },
];

const myBookings = [
  { id: "BK-2481", site: "Riverside Clearing A", dates: "14–16 Jun 2026", guests: 4, status: "Confirmed", paid: true, total: 105 },
  { id: "BK-2309", site: "Hilltop Nook B", dates: "22–24 May 2026", guests: 2, status: "Completed", paid: true, total: 110 },
];

const statusColor: Record<string, string> = {
  Confirmed: "bg-primary/10 text-primary",
  Pending: "bg-accent/10 text-accent",
  Completed: "bg-muted text-muted-foreground",
};

export function CustomerDashboard({ userName, onLogout }: CustomerDashboardProps) {
  const [tab, setTab] = useState<TabId>("browse");
  const [selected, setSelected] = useState<typeof campsites[0] | null>(null);
  const [bookingStep, setBookingStep] = useState<"form" | "review" | "done">("form");
  const [bookingData, setBookingData] = useState({ checkIn: "", checkOut: "", guests: "2", name: userName, phone: "" });
  const [payStep, setPayStep] = useState<"select" | "details" | "done">("select");
  const [payMethod, setPayMethod] = useState("card");
  const [cardNum, setCardNum] = useState("");

  const nights =
    bookingData.checkIn && bookingData.checkOut
      ? Math.max(
          1,
          Math.round(
            (new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime()) /
              86400000
          )
        )
      : 1;
  const total = selected ? selected.price * nights : 0;

  const handleBook = (site: typeof campsites[0]) => {
    setSelected(site);
    setBookingStep("form");
    setTab("booking");
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: "browse", label: "Available Campsites" },
    { id: "booking", label: "Make a Booking" },
    { id: "payment", label: "Payment" },
    { id: "mybookings", label: "My Bookings" },
  ];

  return (
    <div style={{ fontFamily: "'Lato', sans-serif" }} className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <TreePine size={22} className="text-secondary" />
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }} className="text-lg">
            Perong Campsite
          </span>
          <span className="hidden md:inline text-primary-foreground/50 text-sm ml-2">— Guest Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-primary-foreground/80 text-sm hidden md:block">Hello, {userName}</span>
          <button onClick={onLogout} className="flex items-center gap-1 text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">
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
              className={`px-5 py-4 text-sm border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ——— BROWSE ——— */}
        {tab === "browse" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.6rem" }} className="text-foreground mb-2">
              Available Campsites
            </h2>
            <p className="text-muted-foreground text-sm mb-8">Select a site to begin your booking.</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campsites.map((site) => (
                <div key={site.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-44 overflow-hidden">
                    <img src={site.img} alt={site.name} className="w-full h-full object-cover" />
                    <span className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full font-medium ${
                      site.available ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {site.available ? "Available" : "Booked"}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-1">
                      <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }} className="text-foreground">
                        {site.name}
                      </h3>
                      <div className="flex items-center gap-1 text-accent text-sm">
                        <Star size={13} className="fill-accent" />
                        {site.rating}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{site.type}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1"><Users size={12} /> Up to {site.capacity} pax</span>
                      <span className="flex items-center gap-1"><MapPin size={12} /> Perong Forest</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {site.features.map((f) => (
                        <span key={f} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{f}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span style={{ fontFamily: "'DM Mono', monospace" }} className="text-foreground">RM {site.price}</span>
                        <span className="text-muted-foreground text-xs"> / night</span>
                      </div>
                      <button
                        disabled={!site.available}
                        onClick={() => handleBook(site)}
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

        {/* ——— BOOKING ——— */}
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
                  <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
                    <X size={18} />
                  </button>
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
                    ["Campsite", selected.name],
                    ["Type", selected.type],
                    ["Check-in", bookingData.checkIn],
                    ["Check-out", bookingData.checkOut],
                    ["Guests", `${bookingData.guests} pax`],
                    ["Name", bookingData.name],
                    ["Phone", bookingData.phone],
                    ["Duration", `${nights} night${nights > 1 ? "s" : ""}`],
                    ["Total", `RM ${total}.00`],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between border-b border-border pb-2">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="text-foreground" style={label === "Total" ? { fontFamily: "'DM Mono', monospace" } : {}}>{val}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setBookingStep("form")} className="flex-1 border border-border text-foreground py-2 rounded-lg text-sm hover:bg-muted transition-colors">
                    Edit
                  </button>
                  <button onClick={() => setBookingStep("done")} className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-sm hover:opacity-90 transition-opacity">
                    Confirm Booking
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-8 text-center mt-4">
                <CheckCircle size={48} className="text-primary mx-auto mb-4" />
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.3rem" }} className="text-foreground mb-2">
                  Booking Submitted!
                </h3>
                <p className="text-muted-foreground text-sm mb-2">Your booking is pending staff approval.</p>
                <p style={{ fontFamily: "'DM Mono', monospace" }} className="text-accent text-sm mb-6">Ref: BK-{Math.floor(Math.random() * 9000 + 1000)}</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => { setTab("payment"); setPayStep("select"); }} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm hover:opacity-90">
                    Proceed to Payment
                  </button>
                  <button onClick={() => { setBookingStep("form"); setSelected(null); setTab("browse"); }} className="border border-border text-foreground px-6 py-2 rounded-lg text-sm hover:bg-muted">
                    Back to Browse
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ——— PAYMENT ——— */}
        {tab === "payment" && (
          <div className="max-w-lg mx-auto">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.6rem" }} className="text-foreground mb-2">
              Payment
            </h2>

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
                      className={`w-full flex items-center gap-4 px-4 py-4 rounded-lg border transition-colors text-left ${
                        payMethod === m.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                      }`}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        payMethod === m.id ? "border-primary" : "border-muted-foreground"
                      }`}>
                        {payMethod === m.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      <div>
                        <p className="text-foreground text-sm">{m.label}</p>
                        <p className="text-muted-foreground text-xs">{m.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <button onClick={() => setPayStep("details")} className="w-full bg-primary text-primary-foreground py-3 rounded-lg text-sm hover:opacity-90">
                  Continue
                </button>
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
                      <div>
                        <label className="block text-sm text-foreground mb-1">Expiry</label>
                        <input type="text" placeholder="MM / YY"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                      </div>
                      <div>
                        <label className="block text-sm text-foreground mb-1">CVV</label>
                        <input type="text" placeholder="•••" maxLength={3}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-foreground mb-1">Name on Card</label>
                      <input type="text" placeholder="As printed on card"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                  </div>
                )}
                {payMethod === "fpx" && (
                  <div className="space-y-2 mb-6">
                    {["Maybank2u", "CIMB Clicks", "RHB Now", "Public Bank", "Hong Leong Connect"].map((bank) => (
                      <button key={bank} className="w-full text-left px-4 py-3 rounded-lg border border-border hover:bg-muted text-sm text-foreground transition-colors">
                        {bank}
                      </button>
                    ))}
                  </div>
                )}
                {payMethod === "ewallet" && (
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {["Touch 'n Go", "GrabPay", "Boost"].map((ew) => (
                      <button key={ew} className="border border-border rounded-lg p-3 text-xs text-foreground hover:bg-muted text-center transition-colors">
                        {ew}
                      </button>
                    ))}
                  </div>
                )}
                <div className="bg-muted rounded-lg p-4 flex justify-between items-center mb-5">
                  <span className="text-sm text-muted-foreground">Amount Due</span>
                  <span style={{ fontFamily: "'DM Mono', monospace" }} className="text-foreground">RM 105.00</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setPayStep("select")} className="flex-1 border border-border text-foreground py-2 rounded-lg text-sm hover:bg-muted">
                    Back
                  </button>
                  <button onClick={() => setPayStep("done")} className="flex-1 bg-accent text-accent-foreground py-2 rounded-lg text-sm hover:opacity-90">
                    Pay Now
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-8 text-center mt-4">
                <CheckCircle size={48} className="text-primary mx-auto mb-4" />
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.3rem" }} className="text-foreground mb-2">
                  Payment Submitted!
                </h3>
                <p className="text-muted-foreground text-sm mb-2">Your payment is pending staff verification.</p>
                <p style={{ fontFamily: "'DM Mono', monospace" }} className="text-accent text-sm mb-6">TXN-{Math.floor(Math.random() * 900000 + 100000)}</p>
                <button onClick={() => setTab("mybookings")} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm hover:opacity-90">
                  View My Bookings
                </button>
              </div>
            )}
          </div>
        )}

        {/* ——— MY BOOKINGS ——— */}
        {tab === "mybookings" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.6rem" }} className="text-foreground mb-2">
              My Bookings
            </h2>
            <p className="text-muted-foreground text-sm mb-8">Your booking history and status.</p>
            <div className="space-y-4">
              {myBookings.map((b) => (
                <div key={b.id} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }} className="text-foreground">{b.site}</p>
                      <p style={{ fontFamily: "'DM Mono', monospace" }} className="text-xs text-muted-foreground">{b.id}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full ${statusColor[b.status]}`}>{b.status}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm border-t border-border pt-3">
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
                      <span className={b.paid ? "text-primary" : "text-accent"}>
                        {b.paid ? "Paid" : "Pending Payment"}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span style={{ fontFamily: "'DM Mono', monospace" }} className="text-foreground">RM {b.total}.00</span>
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
