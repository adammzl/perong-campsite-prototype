import { MapPin, Star, Wind, Droplets, TreePine, Phone, Mail, ChevronDown } from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
}

const HERO_IMG = "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=1600&h=900&fit=crop&auto=format";
const LAKE_IMG = "https://images.unsplash.com/photo-1448518340475-e3c680e9b4be?w=800&h=600&fit=crop&auto=format";
const TENT_IMG = "https://images.unsplash.com/photo-1624923686627-514dd5e57bae?w=800&h=600&fit=crop&auto=format";
const NIGHT_IMG = "https://images.unsplash.com/photo-1470246973918-29a93221c455?w=800&h=600&fit=crop&auto=format";
const TRAIL_IMG = "https://images.unsplash.com/photo-1592859600972-1b0834d83747?w=800&h=600&fit=crop&auto=format";
const GROUP_IMG = "https://images.unsplash.com/photo-1507777767380-68bdac55c642?w=800&h=600&fit=crop&auto=format";

const reviews = [
  { name: "Amirah Hassan", rating: 5, text: "Absolutely magical. The forest air, the crackling fire, and the silence at night — Perong Campsite restored my soul in just three days." },
  { name: "Raj Subramaniam", rating: 5, text: "Facilities were clean, the staff were incredibly warm, and the trails were breathtaking. Our family's best holiday in years." },
  { name: "Sarah Chen", rating: 5, text: "We came for a weekend and left wishing we had booked longer. The morning mist over the valley is something I'll never forget." },
];

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div
      style={{ fontFamily: "'Lato', sans-serif" }}
      className="min-h-screen bg-background text-foreground"
    >
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-2">
          <TreePine size={24} className="text-primary" />
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }} className="text-xl text-primary">
            Perong Campsite
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#about" className="text-muted-foreground hover:text-primary transition-colors text-sm tracking-wide uppercase">About</a>
          <a href="#scenery" className="text-muted-foreground hover:text-primary transition-colors text-sm tracking-wide uppercase">Gallery</a>
          <a href="#location" className="text-muted-foreground hover:text-primary transition-colors text-sm tracking-wide uppercase">Location</a>
          <button
            onClick={onGetStarted}
            className="bg-primary text-primary-foreground px-5 py-2 rounded text-sm tracking-wide hover:opacity-90 transition-opacity"
          >
            Book Now
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <img
          src={HERO_IMG}
          alt="Campfire surrounded by forest at Perong Campsite"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <p
            style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
            className="text-secondary text-lg mb-4 tracking-widest"
          >
            Where Nature Welcomes You Home
          </p>
          <h1
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(2.5rem, 6vw, 5rem)", lineHeight: 1.1 }}
            className="text-white mb-6"
          >
            Perong Campsite
          </h1>
          <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Nestled deep within ancient rainforest, where the trees breathe and the stars return your gaze.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-primary text-primary-foreground px-10 py-4 rounded text-base tracking-wide hover:bg-accent transition-colors shadow-lg"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
          >
            Start Booking a Campsite Now!
          </button>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/70">
          <ChevronDown size={28} />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-accent text-sm tracking-widest uppercase mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>
              Our Story
            </p>
            <h2
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.2 }}
              className="text-foreground mb-6"
            >
              A Sanctuary in the Heart of the Forest
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-5">
              Perong Campsite has been a beloved retreat for over two decades, tucked within 200 acres of protected rainforest in the highlands of Peninsular Malaysia. Here, you don't just camp — you reconnect with the earth beneath your feet and the sky above.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-5">
              We offer a range of campsite experiences, from rustic open plots beneath ancient fig trees to sheltered forest clearings with wooden platforms. Each site is thoughtfully positioned to give you both privacy and proximity to nature's finest features — cascading streams, firefly valleys, and sunrise ridge views that have moved even the most seasoned travelers.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our commitment is simple: leave the forest better than we found it, and give every guest memories that last a lifetime.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img src={TENT_IMG} alt="Tent in forest clearing" className="rounded-lg object-cover w-full h-48 col-span-2" />
            <img src={TRAIL_IMG} alt="Forest trail" className="rounded-lg object-cover w-full h-40" />
            <img src={GROUP_IMG} alt="Campers at campfire" className="rounded-lg object-cover w-full h-40" />
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-6 bg-muted">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-accent text-sm tracking-widest uppercase mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>
              Why Perong
            </p>
            <h2
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}
              className="text-foreground"
            >
              A Campsite Like No Other
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <TreePine size={32} className="text-primary" />,
                title: "Ancient Rainforest",
                desc: "Camp inside 200 acres of protected primary rainforest — home to hornbills, dusky langurs, and more species than you can count.",
              },
              {
                icon: <Wind size={32} className="text-primary" />,
                title: "Cool Highland Air",
                desc: "At 1,100 metres above sea level, Perong enjoys fresh, cool temperatures year-round. No humidity, no sweat — just clean mountain air.",
              },
              {
                icon: <Droplets size={32} className="text-primary" />,
                title: "Crystal Streams",
                desc: "Three natural streams wind through our grounds. Swim, wade, or simply listen — the sound of running water is free of charge.",
              },
              {
                icon: <Star size={32} className="text-primary" />,
                title: "Stargazing Paradise",
                desc: "Far from city light pollution, Perong is one of the best spots in the region to see the Milky Way stretch overhead on clear nights.",
              },
              {
                icon: <MapPin size={32} className="text-primary" />,
                title: "Easily Accessible",
                desc: "Just 3.5 hours from Kuala Lumpur via well-paved roads, with clear signage and ample parking at the campsite entrance.",
              },
              {
                icon: <Phone size={32} className="text-primary" />,
                title: "Dedicated Staff",
                desc: "Our friendly on-ground team is available 24/7 during your stay — for firewood, first aid, guided night walks, or just a warm cup of tea.",
              },
            ].map((item, i) => (
              <div key={i} className="bg-card p-6 rounded-lg border border-border hover:shadow-md transition-shadow">
                <div className="mb-4">{item.icon}</div>
                <h3
                  style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
                  className="text-foreground mb-2"
                >
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery / Scenery */}
      <section id="scenery" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-accent text-sm tracking-widest uppercase mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>
              Gallery
            </p>
            <h2
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}
              className="text-foreground"
            >
              Scenes from the Forest
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <img src={HERO_IMG} alt="Campfire gathering" className="rounded-lg object-cover w-full h-56 md:h-72 col-span-2 md:col-span-1" />
            <img src={LAKE_IMG} alt="Mountain lake" className="rounded-lg object-cover w-full h-56 md:h-72" />
            <img src={NIGHT_IMG} alt="Night camping in forest" className="rounded-lg object-cover w-full h-56 md:h-72" />
            <img src={TRAIL_IMG} alt="Forest trail" className="rounded-lg object-cover w-full h-56 md:h-72" />
            <img src={TENT_IMG} alt="Tent in forest" className="rounded-lg object-cover w-full h-56 md:h-72" />
            <img src={GROUP_IMG} alt="Campers gathered" className="rounded-lg object-cover w-full h-56 md:h-72 col-span-2 md:col-span-1" />
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-20 px-6 bg-muted">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-accent text-sm tracking-widest uppercase mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>
              Guest Stories
            </p>
            <h2
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}
              className="text-foreground"
            >
              Words from the Wild
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((r, i) => (
              <div key={i} className="bg-card p-8 rounded-lg border border-border">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <Star key={j} size={16} className="fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6 italic">"{r.text}"</p>
                <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }} className="text-foreground">
                  — {r.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section id="location" className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-accent text-sm tracking-widest uppercase mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>
              Find Us
            </p>
            <h2
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}
              className="text-foreground mb-6"
            >
              Located in the Highland Heart
            </h2>
            <div className="flex items-start gap-3 mb-5">
              <MapPin size={20} className="text-primary mt-1 shrink-0" />
              <p className="text-muted-foreground leading-relaxed">
                Perong Campsite, Jalan Hutan Simpan, KM 42, Cameron Highlands, Pahang, Malaysia, 39000
              </p>
            </div>
            <div className="flex items-center gap-3 mb-5">
              <Phone size={20} className="text-primary shrink-0" />
              <p className="text-muted-foreground">+60 9-491 2388</p>
            </div>
            <div className="flex items-center gap-3 mb-8">
              <Mail size={20} className="text-primary shrink-0" />
              <p className="text-muted-foreground">hello@perongcampsite.my</p>
            </div>
            <div className="bg-muted rounded-lg p-5 border border-border">
              <p style={{ fontFamily: "'DM Mono', monospace" }} className="text-sm text-muted-foreground mb-1">Getting Here</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>3.5 hrs from Kuala Lumpur via Route A148</li>
                <li>1 hr from Ipoh via Jalan Simpang Pulai</li>
                <li>Shuttle available from Tanah Rata town centre</li>
              </ul>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden border border-border h-80 bg-muted flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1632714394543-f7f797db5ee5?w=800&h=480&fit=crop&auto=format"
              alt="Mountain lake scenery near Perong Campsite"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-6 bg-primary text-primary-foreground text-center">
        <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }} className="text-secondary text-lg mb-3">
          Your adventure awaits
        </p>
        <h2
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(2rem, 4vw, 3.2rem)" }}
          className="mb-6"
        >
          Ready to Escape the Ordinary?
        </h2>
        <button
          onClick={onGetStarted}
          className="bg-secondary text-foreground px-10 py-4 rounded hover:bg-secondary/80 transition-colors text-base"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
        >
          Start Booking a Campsite Now!
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-primary-foreground py-10 px-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <TreePine size={20} className="text-secondary" />
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }} className="text-secondary">
            Perong Campsite
          </span>
        </div>
        <p className="text-white/50 text-sm">© 2026 Perong Campsite. All rights reserved.</p>
      </footer>
    </div>
  );
}
