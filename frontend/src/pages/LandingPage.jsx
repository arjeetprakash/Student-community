import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const spaces = {
  "Study Rooms": ["DSA Sprint", "GATE Prep", "Final Year Projects"],
  "Campus Clubs": ["Design Circle", "Robotics Hub", "Literary Club"],
  "Career Desk": ["Resume Reviews", "Mock Interviews", "Referral Board"]
};

const testimonials = [
  {
    quote: "I found my project teammates in one day and we shipped our first hackathon app in a week.",
    by: "Aditi, CSE 3rd Year"
  },
  {
    quote: "Notices and club updates are finally in one place. I never miss deadlines now.",
    by: "Rohan, ECE 2nd Year"
  },
  {
    quote: "The career desk threads helped me crack my internship interview prep schedule.",
    by: "Mehul, IT 4th Year"
  }
];

const faqItems = [
  {
    q: "Can students from different years join the same space?",
    a: "Yes. Spaces are open by interest, not by year. You can collaborate across batches."
  },
  {
    q: "How are official notices verified?",
    a: "Notices posted through admin accounts are marked official and pinned on the notice board."
  },
  {
    q: "Can I create a private community group?",
    a: "Yes, moderators can create private groups for projects, clubs, and focused study circles."
  }
];

export default function LandingPage() {
  const [activeSpace, setActiveSpace] = useState("Study Rooms");
  const [activeFaq, setActiveFaq] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 3600);

    return () => clearInterval(timer);
  }, []);

  const currentSpaces = useMemo(() => spaces[activeSpace], [activeSpace]);

  const handleJoin = () => {
    if (!email.trim()) {
      return;
    }
    setJoined(true);
    setEmail("");
  };

  return (
    <div className="landing-root">
      <div className="landing-aura" />

      <nav className="landing-nav">
        <h2 className="landing-brand">StudentHub</h2>

        <div className="landing-nav-actions">
          <a href="#spaces" className="landing-link">Spaces</a>
          <a href="#events" className="landing-link">Events</a>
          <a href="#faq" className="landing-link">FAQ</a>
          <Link to="/login" className="landing-btn light">Student Login</Link>
          <Link to="/login?mode=admin" className="landing-btn ghost">Admin Login</Link>
        </div>
      </nav>

      <header className="landing-hero">
        <p className="landing-eyebrow">Campus-first digital community</p>
        <h1>Connect, collaborate, and stay updated in one student network.</h1>
        <p className="landing-sub">
          Build study momentum, discover events, and engage with clubs and mentors without hopping between apps.
        </p>

        <div className="landing-cta-row">
          <Link to="/login" className="landing-btn primary">Join Student Space</Link>
          <a href="#events" className="landing-btn outline">See Upcoming Events</a>
        </div>

        <div className="landing-kpi-grid">
          <article>
            <h3>120+</h3>
            <p>Active study groups</p>
          </article>
          <article>
            <h3>40+</h3>
            <p>Club communities</p>
          </article>
          <article>
            <h3>98%</h3>
            <p>Notice reach within 24h</p>
          </article>
          <article>
            <h3>1,500+</h3>
            <p>Peer discussions weekly</p>
          </article>
        </div>
      </header>

      <section id="spaces" className="landing-section glass">
        <div className="landing-section-head">
          <h2>Interactive community spaces</h2>
          <p>Switch context instantly and jump into discussions that match your goals.</p>
        </div>

        <div className="landing-tabs">
          {Object.keys(spaces).map((space) => (
            <button
              key={space}
              className={`landing-tab ${activeSpace === space ? "active" : ""}`}
              onClick={() => setActiveSpace(space)}
            >
              {space}
            </button>
          ))}
        </div>

        <div className="landing-space-grid tab-content">
          {currentSpaces.map((item) => (
            <div key={item} className="landing-space-card">
              <h3>{item}</h3>
              <p>Live threads, resource sharing, and peer support curated for this space.</p>
            </div>
          ))}
        </div>
      </section>

      <section id="events" className="landing-section">
        <div className="landing-section-head">
          <h2>What makes a great campus community</h2>
          <p>Essential features designed for student engagement, discovery, and coordination.</p>
        </div>

        <div className="landing-feature-grid">
          <article className="landing-feature-card">
            <h3>Event Calendar</h3>
            <p>Centralized calendar for hackathons, workshops, and placement drives.</p>
          </article>
          <article className="landing-feature-card">
            <h3>Smart Notice Board</h3>
            <p>Pinned and verified notices with quick filters for department and batch.</p>
          </article>
          <article className="landing-feature-card">
            <h3>Mentor Connect</h3>
            <p>Directly connect with seniors and alumni for guidance on projects and careers.</p>
          </article>
          <article className="landing-feature-card">
            <h3>Resource Exchange</h3>
            <p>Share notes, previous papers, and curated links inside topic channels.</p>
          </article>
        </div>

        <div className="landing-event-strip">
          <span>Apr 12: Open Source Meetup</span>
          <span>Apr 18: Internship AMA</span>
          <span>Apr 25: Inter-branch Quiz Night</span>
          <span>May 01: Portfolio Review Camp</span>
        </div>
      </section>

      <section className="landing-section split">
        <article className="landing-testimonial">
          <h2>Student voices</h2>
          <p className="quote">"{testimonials[testimonialIndex].quote}"</p>
          <p className="by">{testimonials[testimonialIndex].by}</p>
          <div className="dots">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setTestimonialIndex(i)}
                className={`dot ${testimonialIndex === i ? "active" : ""}`}
                aria-label={`Show testimonial ${i + 1}`}
              />
            ))}
          </div>
        </article>

        <article id="faq" className="landing-faq">
          <h2>Frequently asked questions</h2>
          {faqItems.map((item, index) => (
            <button
              key={item.q}
              className={`landing-faq-item ${activeFaq === index ? "open" : ""}`}
              onClick={() => setActiveFaq(activeFaq === index ? -1 : index)}
            >
              <span>{item.q}</span>
              <span>{activeFaq === index ? "-" : "+"}</span>
              {activeFaq === index && <p>{item.a}</p>}
            </button>
          ))}
        </article>
      </section>

      <section className="landing-section community-cta">
        <h2>Get community updates</h2>
        <p>Receive weekly event highlights, top discussions, and opportunity alerts.</p>
        <div className="landing-newsletter">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your college email"
            type="email"
          />
          <button onClick={handleJoin}>Subscribe</button>
        </div>
        {joined && <p className="joined-msg">You are on the list. Welcome to the community loop.</p>}
      </section>
    </div>
  );
}