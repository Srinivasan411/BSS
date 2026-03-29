import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getContent } from "../api";
import CookieConsent from "../components/CookieConsent";
import SeoMeta from "../components/SeoMeta";
import SimpleChatbot from "../components/SimpleChatbot";
import WhatsAppButton from "../components/WhatsAppButton";
import { sanitizeFormData } from "../utils/sanitize";
import { validateLeadForm } from "../utils/validation";

const navLinks = [
  { label: "About", id: "about" },
  { label: "Products", id: "products" },
  { label: "Services", id: "services" },
  { label: "Pricing", id: "pricing" },
  { label: "Clients", id: "clients" },
  { label: "Testimonials", id: "testimonials" },
  { label: "Newsroom", id: "newsroom" },
  { label: "Careers", id: "careers" },
  { label: "Contact", id: "contact" },
];

const products = [
  {
    name: "Existing Product",
    badge: "Core Platform",
    subtitle: "Workflow Governance Suite",
    description:
      "Enterprise workflow platform for governance, approvals, and operational visibility.",
    highlights: ["Role-based approvals", "Audit-ready logs", "Cross-team dashboards"],
  },
  {
    name: "GoBoat",
    badge: "Field Operations",
    subtitle: "Mobility & Tracking Module",
    description:
      "Smart operations module with AI-based tracking for logistics-heavy field teams.",
    highlights: ["Live route intelligence", "Task SLA tracking", "Mobile-first workflows"],
  },
  {
    name: "Premise Pro",
    badge: "Facility Intelligence",
    subtitle: "Asset & Premise Control",
    description:
      "Unified asset and facility intelligence suite for modern distributed enterprises.",
    highlights: ["Asset lifecycle visibility", "Maintenance automation", "Compliance monitoring"],
  },
];

const services = [
  {
    title: "Corporate IT Services",
    text: "Infrastructure modernization, cybersecurity, cloud migration, and long-term managed support.",
  },
  {
    title: "AI-Based Automation",
    text: "Copilot-style workflows and process automation that cut manual effort and improve reliability.",
  },
  {
    title: "HR & Payroll Consulting",
    text: "Compliance-first HR and payroll architecture designed for scale and audit readiness.",
  },
];

const plans = {
  monthly: [
    { name: "Basic", amount: 99, featured: false },
    { name: "Professional", amount: 249, featured: true },
    { name: "Enterprise", amount: null, featured: false },
  ],
  yearly: [
    { name: "Basic", amount: 990, featured: false },
    { name: "Professional", amount: 2490, featured: true },
    { name: "Enterprise", amount: null, featured: false },
  ],
};

const newsroomItems = [
  {
    title: "How AI Automation Improves Corporate Operations",
    date: "February 18, 2026",
    summary:
      "A practical adoption framework for AI-enabled operations with minimal disruption and measurable ROI.",
  },
  {
    title: "BSS Expands Consulting Services in South Asia",
    date: "January 30, 2026",
    summary:
      "Expanded regional delivery capabilities for enterprise IT transformation and advisory programs.",
  },
  {
    title: "Enterprise Security Checklist for 2026",
    date: "January 10, 2026",
    summary:
      "A concise baseline for security, resilience, and compliance in growing business environments.",
  },
];

const initialForm = {
  name: "",
  company: "",
  email: "",
  phone: "",
  message: "",
  website: "",
};

function useCountUp(target, started) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!started) return;

    let frame;
    const duration = 1200;
    const start = performance.now();

    const tick = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started, target]);

  return value;
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [showTopButton, setShowTopButton] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [parallaxY, setParallaxY] = useState(0);
  const [pricingMode, setPricingMode] = useState("monthly");
  const [content, setContent] = useState({ settings: {}, clients: [], testimonials: [], contactDetails: null });
  const [productIndex, setProductIndex] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [expandedTestimonialId, setExpandedTestimonialId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [formSuccess, setFormSuccess] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formStartedAt] = useState(() => Date.now());
  const [formMessage, setFormMessage] = useState("");
  const [cookieManagerOpen, setCookieManagerOpen] = useState(false);
  const headerRef = useRef(null);
  const lastActiveElementRef = useRef(null);
  const demoFirstFieldRef = useRef(null);

  useEffect(() => {
    getContent()
      .then((payload) => setContent(payload))
      .catch(() => setContent({ settings: {}, clients: [], testimonials: [], contactDetails: null }));
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setShowTopButton(window.scrollY > 340);
      setNavScrolled(window.scrollY > 24);
      setParallaxY(window.scrollY * 0.18);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        }
      },
      { threshold: 0.2 },
    );

    const items = document.querySelectorAll(".reveal-item");
    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    const target = document.getElementById("hero-stats");
    if (target) observer.observe(target);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setProductIndex((prev) => (prev + 1) % products.length);
    }, 4800);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (content.testimonials.length < 2) return;
    const timer = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % content.testimonials.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [content.testimonials.length]);

  const c1 = useCountUp(140, statsVisible);
  const c2 = useCountUp(310, statsVisible);
  const c3 = useCountUp(12, statsVisible);

  const settings = content.settings || {};
  const contactDetails = content.contactDetails || {};
  const companyName = settings.companyName || "Brilliant Systems Solutions (BSS)";
  const heroHeading = settings.heroHeading || "Empowering Businesses with Smart IT & AI Solutions";
  const heroSubheading =
    settings.heroSubheading ||
    "A product and services company helping enterprises modernize technology with secure IT systems, AI automation, and strategic consulting.";
  const whatsappNumber = contactDetails.whatsappNumber || settings.whatsappNumber || "919000000000";
  const contactEmail = contactDetails.email || settings.contactEmail || "hello@bss-example.com";
  const canonicalUrl = "https://www.brilliantsystemssolutions.com/";
  const ogImage = `${canonicalUrl}og-image.jpg`;
  const contactAddress = [
    contactDetails.addressLine1,
    contactDetails.addressLine2,
    contactDetails.city,
    contactDetails.state,
    contactDetails.postalCode,
    contactDetails.country,
  ]
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .join(", ");

  const scrollToSection = useCallback((id) => {
    const target = document.getElementById(id);
    if (!target) return;

    const headerOffset = headerRef.current?.getBoundingClientRect().height ?? 0;
    const y = target.getBoundingClientRect().top + window.scrollY - Math.min(200, headerOffset + 12);
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });

    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  const openDemo = useCallback(() => {
    lastActiveElementRef.current = document.activeElement;
    setDemoOpen(true);
  }, []);

  const closeDemo = useCallback(() => {
    setDemoOpen(false);
  }, []);

  useEffect(() => {
    if (!demoOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") closeDemo();
    };

    window.addEventListener("keydown", onKeyDown);
    setTimeout(() => demoFirstFieldRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      lastActiveElementRef.current?.focus?.();
    };
  }, [closeDemo, demoOpen]);

  useEffect(() => {
    if (!demoOpen) return;
    if (!formSuccess) return;
    const timer = setTimeout(() => setDemoOpen(false), 1200);
    return () => clearTimeout(timer);
  }, [demoOpen, formSuccess]);

  const clientLogos = useMemo(() => {
    const base = content.clients.length > 0 ? content.clients : [{ id: 0, name: "Your Logo", logoUrl: "" }];
    return [...base, ...base];
  }, [content.clients]);

  const currentProduct = products[productIndex];
  const testimonials = useMemo(() => {
    if (content.testimonials.length > 0) return content.testimonials;
    return [
      {
        id: "seed-1",
        name: "Client Name",
        company: "Company",
        rating: 5,
        feedback: "Add testimonials from /admin to display customer feedback here.",
      },
      {
        id: "seed-2",
        name: "Client Name",
        company: "Company",
        rating: 5,
        feedback: "Share project outcomes, delivery experience, and customer impact to build trust.",
      },
      {
        id: "seed-3",
        name: "Client Name",
        company: "Company",
        rating: 5,
        feedback: "You can add multiple testimonials in the Admin portal and they will appear here automatically.",
      },
    ];
  }, [content.testimonials]);

  const testimonialCount = testimonials.length;
  const safeIndex = testimonialCount ? ((testimonialIndex % testimonialCount) + testimonialCount) % testimonialCount : 0;
  const getTestimonial = (offset) => testimonials[(safeIndex + offset) % testimonialCount];
  const pricingCards = plans[pricingMode];

  const submitForm = async (event) => {
    event.preventDefault();
    setFormSuccess(false);
    setFormMessage("");

    const cleaned = sanitizeFormData(formData);
    const { errors } = validateLeadForm(cleaned);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;
    if (cleaned.website) return;

    if (Date.now() - formStartedAt < 2500) {
      setFormMessage("Please review your details for a moment before submitting.");
      return;
    }

    setSubmitLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSubmitLoading(false);
    setFormData(initialForm);
    setFormSuccess(true);
    setFormMessage("Message sent securely. Team BSS will contact you shortly.");
  };

  return (
    <div className="text-slate-900">
      <SeoMeta
        title="Brilliant Systems Solutions (BSS) | Enterprise IT, AI & Automation"
        description="Brilliant Systems Solutions helps enterprises modernize IT, deploy AI automation, and transform operations through secure, scalable digital solutions."
        keywords="enterprise IT services, AI automation, HR payroll consulting, BSS, corporate technology partner"
        canonical={canonicalUrl}
        ogImage={ogImage}
        companyName={companyName}
        contactEmail={contactEmail}
      />

      <div ref={headerRef} className="fixed inset-x-0 top-0 z-50">
        <div className="bg-[color:var(--brand-dark)] text-white">
          <div className="container-wide flex flex-col gap-2 py-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium tracking-wide sm:text-sm">
              AI-driven content, data & process automation for enterprises - book a demo today.
            </p>
            <div className="flex items-center gap-2 sm:gap-3">
              <SocialLink href="https://www.linkedin.com" label="LinkedIn">
                <LinkedInIcon />
              </SocialLink>
              <SocialLink href="https://www.facebook.com" label="Facebook">
                <FacebookIcon />
              </SocialLink>
              <SocialLink href="https://x.com" label="X">
                <XIcon />
              </SocialLink>
              <SocialLink href="https://www.instagram.com" label="Instagram">
                <InstagramIcon />
              </SocialLink>
              <SocialLink href={`https://wa.me/${whatsappNumber}`} label="WhatsApp">
                <WhatsAppIcon />
              </SocialLink>
            </div>
          </div>
        </div>

        <header
          className={`border-b border-gray-100 backdrop-blur-lg transition ${
            navScrolled ? "bg-white/80 shadow-md" : "bg-white/60"
          }`}
        >
          <nav className="container-wide flex items-center justify-between py-4">
            <button
              type="button"
              onClick={() => scrollToSection("home")}
              className="max-w-[220px] truncate text-left text-base font-semibold tracking-wide text-[color:var(--brand-dark)] sm:max-w-none sm:text-lg"
              aria-label="Go to top"
            >
              {companyName}
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
                aria-label="Open menu"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <span className="hidden sm:inline">Menu</span>
              </button>

              <RippleButton
                as="button"
                type="button"
                onClick={openDemo}
                className="rounded-lg bg-[linear-gradient(90deg,var(--brand-primary),var(--brand-dark))] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
              >
                Schedule Demo
              </RippleButton>

              <Link
                to="/admin"
                className="hidden rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 sm:inline-flex"
              >
                Admin
              </Link>
            </div>
          </nav>
        </header>
      </div>

      {menuOpen ? (
        <div className="fixed inset-0 z-[60]">
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-slate-900/35 backdrop-blur-[2px]"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="absolute right-0 top-0 h-full w-full max-w-sm overflow-y-auto bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Navigation</p>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-md border border-slate-200 bg-white p-2 text-slate-800 transition hover:bg-slate-50"
                aria-label="Close"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="mt-4 grid gap-2">
              {navLinks.map((link) => {
                const id = link.id;
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      if (id === "contact") {
                        openDemo();
                        return;
                      }
                      scrollToSection(id);
                    }}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    {link.label}
                    <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                );
              })}

              <div className="mt-2 grid gap-2">
                <RippleButton
                  as="button"
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    openDemo();
                  }}
                  className="w-full justify-center rounded-xl bg-[linear-gradient(90deg,var(--brand-primary),var(--brand-dark))] px-4 py-3 text-sm font-semibold text-white shadow-lg"
                >
                  Schedule Demo
                </RippleButton>
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  Admin
                </Link>
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      {demoOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/55 backdrop-blur-[2px]"
            aria-label="Close demo form"
            onClick={closeDemo}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Book a demo form"
            className="relative z-10 w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-[0_40px_90px_-55px_rgba(15,23,42,0.75)]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--brand-primary)]">
                  Schedule a demo
                </p>
                <h2 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">Hire to Retire Solution Demonstration</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Share your details and we will reach out to schedule a live walkthrough.
                </p>
              </div>
              <button
                type="button"
                onClick={closeDemo}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-800 shadow-sm transition hover:bg-slate-50"
                aria-label="Close"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="max-h-[calc(100vh-10rem)] overflow-y-auto px-6 py-6 sm:px-8">
              <LeadForm
                idPrefix="demo"
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                firstFieldRef={demoFirstFieldRef}
                formData={formData}
                formErrors={formErrors}
                setFormData={setFormData}
                submitForm={submitForm}
                submitLoading={submitLoading}
                formSuccess={formSuccess}
                formMessage={formMessage}
              />
            </div>
          </div>
        </div>
      ) : null}

      <main className="mesh-bg relative overflow-hidden bg-white text-gray-700 [&_h1]:text-gray-900 [&_h2]:text-gray-900 [&_h3]:text-gray-900">
        <section id="home" className="relative overflow-hidden pt-40 sm:pt-44">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div
              className="absolute -left-32 top-16 h-72 w-72 rounded-full bg-blue-300/35 blur-3xl"
              style={{ transform: `translateY(${parallaxY * 0.35}px)` }}
            />
            <div
              className="absolute -right-40 top-10 h-80 w-80 rounded-full bg-slate-300/30 blur-3xl"
              style={{ transform: `translateY(${-parallaxY * 0.25}px)` }}
            />
            <div
              className="absolute bottom-10 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-200/25 blur-3xl"
              style={{ transform: `translateY(${parallaxY * 0.2}px)` }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(37,99,235,0.10),transparent_45%),radial-gradient(circle_at_70%_30%,rgba(15,23,42,0.07),transparent_55%)]" />
          </div>

          <div className="container-wide section-pad relative z-10">
            <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div className="reveal-item">
                <div className="mb-6 inline-flex flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
                  <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[color:var(--brand-dark)]">
                    <span className="h-2 w-2 rounded-full bg-[color:var(--brand-primary)]" aria-hidden="true" />
                    Enterprise Delivery
                  </span>
                  <span className="text-slate-500">Salesforce</span>
                  <span className="text-slate-400" aria-hidden="true">•</span>
                  <span className="text-slate-500">AI Automation</span>
                  <span className="text-slate-400" aria-hidden="true">•</span>
                  <span className="text-slate-500">App Development</span>
                </div>

                <h1 className="max-w-4xl text-4xl font-black leading-[1.1] text-gray-900 sm:text-5xl lg:text-6xl">
                  <span className="bg-gradient-to-r from-[color:var(--brand-dark)] via-slate-900 to-[color:var(--brand-primary)] bg-clip-text text-transparent">
                    {heroHeading}
                  </span>
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-gray-600 sm:text-lg">{heroSubheading}</p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <RippleButton
                    as="button"
                    type="button"
                    onClick={openDemo}
                    className="rounded-xl bg-[linear-gradient(90deg,var(--brand-primary),var(--brand-dark))] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:shadow-xl"
                  >
                    Book a Free Consultation
                  </RippleButton>
                  <RippleButton
                    as="button"
                    type="button"
                    onClick={() => scrollToSection("services")}
                    className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-[color:var(--brand-dark)] transition hover:bg-slate-50"
                  >
                    View Services
                  </RippleButton>
                  <button
                    type="button"
                    onClick={() => scrollToSection("contact")}
                    className="text-sm font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-900"
                  >
                    Talk to Sales
                  </button>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 backdrop-blur">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                    Fast kickoff & clear milestones
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 backdrop-blur">
                    <span className="h-2 w-2 rounded-full bg-blue-500" aria-hidden="true" />
                    Security-first architecture
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 backdrop-blur">
                    <span className="h-2 w-2 rounded-full bg-violet-500" aria-hidden="true" />
                    Automation-driven outcomes
                  </span>
                </div>
              </div>

              <aside className="reveal-item relative">
                <div className="glow-border rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-xl backdrop-blur sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--brand-primary)]">
                      Delivery model
                    </p>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                      Transparent, measurable, reliable
                    </span>
                  </div>

                  <h2 className="mt-4 text-xl font-bold text-slate-900 sm:text-2xl">
                    Build, integrate, and automate - end to end.
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    From discovery to go-live, BSS delivers secure systems and automation playbooks that reduce manual work and improve operational clarity.
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="text-xs font-semibold text-slate-500">Phase 1</p>
                      <p className="mt-1 font-semibold text-slate-900">Strategy & Architecture</p>
                      <p className="mt-2 text-xs leading-6 text-slate-600">Security baseline, system design, and delivery plan.</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="text-xs font-semibold text-slate-500">Phase 2</p>
                      <p className="mt-1 font-semibold text-slate-900">Execution & Integration</p>
                      <p className="mt-2 text-xs leading-6 text-slate-600">Apps, automation, and data flows with QA gates.</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-2">
                      <p className="text-xs font-semibold text-slate-500">Phase 3</p>
                      <p className="mt-1 font-semibold text-slate-900">Optimization & Support</p>
                      <p className="mt-2 text-xs leading-6 text-slate-600">Continuous improvements, monitoring, and advisory support.</p>
                    </div>
                  </div>
                </div>

                <div
                  className="pointer-events-none absolute -bottom-8 -right-10 h-40 w-40 rounded-full bg-[color:var(--brand-primary)]/15 blur-3xl"
                  aria-hidden="true"
                />
              </aside>
            </div>

            <div id="hero-stats" className="mt-10 grid gap-4 sm:grid-cols-3">
              <StatCard label="Clients" value={c1} suffix="+" />
              <StatCard label="Projects" value={c2} suffix="+" />
              <StatCard label="Years Experience" value={c3} suffix="+" />
            </div>
          </div>
        </section>

        <WaveDivider className="text-gray-900/10" />

        <section id="about" className="section-pad bg-transparent">
          <div className="container-wide grid gap-8 lg:grid-cols-2">
            <article className="glass reveal-item rounded-3xl p-7 sm:p-9">
              <h2 className="text-3xl font-bold sm:text-4xl">About {companyName}</h2>
              <p className="mt-5 text-gray-600">
                We help enterprises unify technology strategy and execution with secure digital foundations, automation-first operating models, and measurable business outcomes.
              </p>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <IconGlass title="Corporate IT Services" icon="IT" />
                <IconGlass title="AI-Based Automation" icon="AI" />
                <IconGlass title="HR & Payroll" icon="HR" />
                <IconGlass title="Advisory & Compliance" icon="CX" />
              </div>
            </article>

            <article className="glass reveal-item rounded-3xl p-7 sm:p-9">
              <h3 className="text-2xl font-semibold">Associated Companies</h3>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:scale-[1.02]">Brilliant Systems Solutions, Madurai</div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:scale-[1.02]">Yangkhor Private Limited, Bhutan</div>
              </div>
            </article>
          </div>
        </section>

        <WaveDivider className="text-gray-900/12" flip />

        <section id="products" className="section-pad">
          <div className="container-wide">
            <h2 className="reveal-item text-3xl font-bold sm:text-4xl">Products</h2>
            <p className="reveal-item mt-3 max-w-3xl text-gray-600">
              Discover BSS product suites designed for enterprise teams that need secure,
              scalable, and insight-driven operations.
            </p>
            <div className="liquid-border glow-border mt-8 rounded-3xl p-6 sm:p-8">
              <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
                <article className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg transition hover:-translate-y-2 hover:shadow-2xl">
                  <div className="mb-5 h-1 w-20 rounded-full bg-gradient-to-r from-[color:var(--brand-primary)] to-[color:var(--brand-dark)]" />
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {currentProduct.badge}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {currentProduct.subtitle}
                    </span>
                  </div>
                  <div className="h-44 rounded-xl bg-gradient-to-br from-blue-50 via-white to-emerald-50" aria-hidden="true" />
                  <h3 className="mt-5 text-2xl font-bold">{currentProduct.name}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-600">{currentProduct.description}</p>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {currentProduct.highlights.map((item) => (
                      <li key={item} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700">
                        {item}
                      </li>
                    ))}
                  </ul>
                  <RippleButton as="button" type="button" onClick={() => scrollToSection("contact")} className="mt-5 inline-flex rounded-lg bg-gradient-to-r from-slate-900 to-slate-700 px-4 py-2 text-sm font-semibold text-white">
                    Get Access
                  </RippleButton>
                </article>

                <div className="space-y-3">
                  {products.map((product, index) => (
                    <button
                      key={product.name}
                      type="button"
                      onClick={() => setProductIndex(index)}
                      className={`block w-full rounded-xl border px-4 py-3 text-left transition ${
                        productIndex === index
                          ? "border-blue-300 bg-blue-50 text-blue-800 shadow-md"
                          : "border-gray-100 bg-white text-gray-600 hover:border-blue-300/70"
                      }`}
                      aria-label={`View ${product.name}`}
                    >
                      <p className="text-sm font-semibold">{product.name}</p>
                      <p className="mt-1 text-xs text-gray-500">{product.subtitle}</p>
                    </button>
                  ))}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setProductIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1))}
                      className="mr-2 rounded-full border border-blue-200 px-3 py-1 text-xs text-slate-700"
                      aria-label="Previous product"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductIndex((prev) => (prev + 1) % products.length)}
                      className="rounded-full border border-blue-200 px-3 py-1 text-xs text-slate-700"
                      aria-label="Next product"
                    >
                      Next
                    </button>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    {products.map((product, index) => (
                      <button
                        key={`${product.name}-dot`}
                        type="button"
                        onClick={() => setProductIndex(index)}
                        aria-label={`Go to ${product.name}`}
                        className={`h-2.5 rounded-full transition ${
                          productIndex === index ? "w-8 bg-blue-600" : "w-2.5 bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <WaveDivider className="text-gray-900/10" />

        <section className="section-pad">
          <div className="container-wide grid gap-8 lg:grid-cols-2 lg:items-center">
            <article className="reveal-item rounded-3xl border border-gray-100 bg-white p-8 backdrop-blur-xl">
              <h2 className="text-3xl font-bold sm:text-4xl">Enterprise Features</h2>
              <p className="mt-4 text-gray-600">
                Product-led acceleration plus consulting-led governance gives leadership teams confidence across technology, process, and compliance.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                <li>- Unified dashboards for operations, HR, and IT decision-making</li>
                <li>- AI-assisted workflow orchestration with role-based controls</li>
                <li>- SLA-backed implementation and continuous optimization cycles</li>
              </ul>
            </article>
            <article className="reveal-item rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-emerald-50 p-8">
              <h3 className="text-2xl font-semibold">Story-Led Delivery</h3>
              <p className="mt-3 text-gray-600">
                From strategy workshops to production rollouts, every phase maps directly to executive outcomes and measurable value realization.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-white p-4 text-sm">Discovery & Blueprint</div>
                <div className="rounded-xl border border-gray-100 bg-white p-4 text-sm">Secure Architecture</div>
                <div className="rounded-xl border border-gray-100 bg-white p-4 text-sm">Launch & Enablement</div>
                <div className="rounded-xl border border-gray-100 bg-white p-4 text-sm">Scale & Optimize</div>
              </div>
            </article>
          </div>
        </section>

        <section id="services" className="section-pad bg-transparent">
          <div className="container-wide">
            <h2 className="reveal-item text-3xl font-bold sm:text-4xl">Services</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {services.map((service) => (
                <article key={service.title} className="service-tilt reveal-item rounded-2xl border border-gray-100 bg-white p-8 shadow-lg transition hover:-translate-y-2 hover:shadow-2xl">
                  <div className="mb-5 h-1 w-20 rounded-full bg-gradient-to-r from-[color:var(--brand-primary)] to-[color:var(--brand-dark)]" />
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-slate-900 to-slate-700 font-bold text-white shadow-md">
                    {service.title.slice(0, 2).toUpperCase()}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{service.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{service.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="section-pad relative overflow-hidden">
          <div className="blob left-[-5%] top-16 h-44 w-44 bg-blue-200/60" />
          <div className="container-wide relative z-10">
            <div className="reveal-item flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-3xl font-bold sm:text-4xl">Pricing Plans</h2>
              <div className="inline-flex rounded-full border border-gray-200 bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setPricingMode("monthly")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${pricingMode === "monthly" ? "bg-[linear-gradient(90deg,var(--brand-primary),var(--brand-dark))] text-white shadow-md" : "text-gray-700"}`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setPricingMode("yearly")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${pricingMode === "yearly" ? "bg-[linear-gradient(90deg,var(--brand-primary),var(--brand-dark))] text-white shadow-md" : "text-gray-700"}`}
                >
                  Yearly
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {pricingCards.map((plan) => (
                <article
                  key={plan.name}
                  className={`reveal-item rounded-2xl border bg-white p-8 shadow-lg transition hover:-translate-y-2 hover:shadow-2xl ${
                    plan.featured ? "ring-2 ring-blue-500 border-blue-200" : "border-gray-100"
                  }`}
                >
                  <div className="mb-5 h-1 w-24 rounded-full bg-gradient-to-r from-[color:var(--brand-primary)] to-[color:var(--brand-dark)]" />
                  <h3 className="text-2xl font-semibold">{plan.name}</h3>
                  <p className="mt-3 text-3xl font-black text-slate-900">
                    {plan.amount ? `$${plan.amount}` : "Custom"}
                    <span className="text-sm font-medium text-gray-500">{plan.amount ? pricingMode === "monthly" ? " /month" : " /year" : ""}</span>
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-gray-600">
                    <li>- Dedicated onboarding</li>
                    <li>- Security-first delivery</li>
                    <li>- SLA-backed support</li>
                  </ul>
                  <RippleButton as="button" type="button" onClick={() => scrollToSection("contact")} className="mt-6 inline-flex w-full justify-center rounded-lg bg-[linear-gradient(90deg,var(--brand-primary),var(--brand-dark))] px-4 py-2 text-sm font-semibold text-white">
                    Choose Plan
                  </RippleButton>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="clients" className="section-pad bg-transparent">
          <div className="container-wide">
            <h2 className="reveal-item text-3xl font-bold sm:text-4xl">Client Logos</h2>
            <div className="marquee reveal-item mt-8 overflow-hidden rounded-2xl border border-gray-100 bg-transparent p-4">
              <div className="marquee-track gap-4">
                {clientLogos.map((client, index) => (
                  <div key={`${client.id}-${index}`} className="flex min-w-[180px] items-center justify-center rounded-xl border border-gray-100 bg-white px-4 py-5 text-sm font-semibold text-gray-500 grayscale transition hover:grayscale-0 hover:text-blue-600">
                    {client.logoUrl ? (
                      <img src={client.logoUrl} alt={client.name} className="h-8 w-auto object-contain" loading="lazy" />
                    ) : (
                      client.name
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="relative bg-slate-50 py-24">
          <div className="container-wide">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="inline-flex items-center rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--brand-primary)] shadow-sm">
                  Testimonials
                </span>
                <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                  What Our Clients Say About Us
                </h2>
                <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
                  Trusted by teams that need reliable automation, delivery transparency, and measurable outcomes.
                </p>
              </div>

              <div className="flex items-center gap-2 lg:justify-end">
                <button
                  type="button"
                  onClick={() => setTestimonialIndex((prev) => prev - 1)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm transition hover:bg-slate-50"
                  aria-label="Previous testimonials"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setTestimonialIndex((prev) => prev + 1)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm transition hover:bg-slate-50"
                  aria-label="Next testimonials"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {[getTestimonial(0), getTestimonial(1), getTestimonial(2)].map((item, index) => {
                const hiddenClass = index === 1 ? "hidden sm:block" : index === 2 ? "hidden lg:block" : "";
                const rating = Math.max(1, Math.min(5, Number(item?.rating) || 5));
                const isExpanded = expandedTestimonialId === item.id;

                return (
                  <article
                    key={item.id}
                    className={`${hiddenClass} rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_26px_46px_-32px_rgba(43,45,66,0.45)]`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=e0f2fe&color=0f172a`}
                          alt={`${item.name} avatar`}
                          className="h-11 w-11 rounded-xl border border-slate-200"
                          loading="lazy"
                        />
                        <div>
                          <p className="text-base font-semibold text-slate-900">{item.name}</p>
                          <p className="text-sm text-slate-500">{item.company || "Client"}</p>
                        </div>
                      </div>
                      <QuoteMark />
                    </div>

                    <div className="mt-4 flex gap-1 text-amber-400" aria-label={`Rating ${rating} out of 5`}>
                      {Array.from({ length: rating }).map((_, idx) => (
                        <svg key={`${item.id}-star-${idx}`} viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.03 3.167a1 1 0 00.95.69h3.328c.969 0 1.371 1.24.588 1.81l-2.693 1.955a1 1 0 00-.364 1.118l1.03 3.167c.3.921-.755 1.688-1.54 1.118L10 13.347l-2.693 1.955c-.784.57-1.838-.197-1.539-1.118l1.03-3.167a1 1 0 00-.364-1.118L3.74 8.594c-.783-.57-.38-1.81.588-1.81h3.329a1 1 0 00.95-.69l1.03-3.167z" />
                        </svg>
                      ))}
                    </div>

                    <p className={`mt-4 text-sm leading-7 text-slate-600 ${isExpanded ? "" : "line-clamp-4"}`}>
                      {item.feedback}
                    </p>

                    {String(item.feedback || "").length > 160 ? (
                      <button
                        type="button"
                        onClick={() => setExpandedTestimonialId((prev) => (prev === item.id ? null : item.id))}
                        className="mt-3 inline-flex text-sm font-semibold text-[color:var(--brand-primary)] hover:underline"
                      >
                        {isExpanded ? "Read Less" : "Read More"}
                      </button>
                    ) : null}
                  </article>
                );
              })}
            </div>

            <div className="mt-8 flex items-center justify-center gap-2">
              {Array.from({ length: Math.min(testimonialCount, 8) }).map((_, idx) => (
                <button
                  key={`t-dot-${idx}`}
                  type="button"
                  onClick={() => setTestimonialIndex(idx)}
                  aria-label={`Go to testimonial ${idx + 1}`}
                  className={`h-2.5 rounded-full transition ${idx === safeIndex ? "w-8 bg-blue-600" : "w-2.5 bg-gray-300"}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="newsroom" className="section-pad bg-transparent">
          <div className="container-wide">
            <h2 className="reveal-item text-3xl font-bold sm:text-4xl">Newsroom</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {newsroomItems.map((item) => (
                <article key={item.title} className="reveal-item overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 transition hover:-translate-y-1 hover:shadow-[0_24px_42px_-30px_rgba(245,158,11,0.5)]">
                  <div className="h-36 overflow-hidden rounded-xl bg-blue-50">
                    <div className="h-full w-full bg-gradient-to-br from-blue-200/50 to-emerald-200/50 transition duration-300 hover:scale-110" />
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-orange-600">{item.date}</p>
                  <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{item.summary}</p>
                  <button
                    type="button"
                    onClick={() => scrollToSection("newsroom")}
                    className="mt-4 inline-flex text-sm font-semibold text-slate-900 hover:text-blue-700"
                  >
                    Read More
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="careers" className="section-pad">
          <div className="container-wide">
            <div className="reveal-item rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-emerald-50 p-8 text-center backdrop-blur-sm sm:p-10">
              <h2 className="text-3xl font-bold sm:text-4xl">Join Our Growing Team</h2>
              <p className="mx-auto mt-3 max-w-3xl text-gray-700">
                Build meaningful enterprise products and consulting solutions with a team that values quality, speed, and innovation.
              </p>
              <RippleButton href="/careers" className="mt-6 inline-flex rounded-xl bg-[linear-gradient(90deg,var(--brand-primary),var(--brand-dark))] px-6 py-3 text-sm font-bold text-white">
                Explore Careers
              </RippleButton>
            </div>
          </div>
        </section>
      </main>

      <button
        type="button"
        onClick={openDemo}
        className="demo-tab"
        aria-label="Book a demo"
      >
        Book A Demo
      </button>

      <div id="contact" className="sr-only" aria-hidden="true" />

      <footer className="border-t border-slate-800 bg-slate-950 py-10 text-sm text-slate-300">
        <div className="container-wide grid gap-8 md:grid-cols-4">
          <div>
            <h2 className="text-base font-semibold text-white">BSS</h2>
            <p className="mt-2 text-xs text-slate-400">
              Enterprise IT, AI automation, and HR consulting for growth-stage and large organizations.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Sitemap</h3>
            <ul className="mt-2 space-y-1 text-xs">
              <li>
                <button type="button" onClick={() => scrollToSection("about")} className="hover:text-white">
                  About
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollToSection("products")} className="hover:text-white">
                  Products
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollToSection("services")} className="hover:text-white">
                  Services
                </button>
              </li>
              <li><a href="/sitemap.xml">XML Sitemap</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Contact</h3>
            <ul className="mt-2 space-y-1 text-xs">
              <li>Email: {contactEmail}</li>
              {contactDetails.phonePrimary ? <li>Phone: {contactDetails.phonePrimary}</li> : null}
              <li>WhatsApp: +{whatsappNumber}</li>
              {contactAddress ? <li>Address: {contactAddress}</li> : null}
              <li><a href="/privacy-policy">Privacy Policy</a></li>
              <li><a href="/terms-and-conditions">Terms & Conditions</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Social</h3>
            <ul className="mt-2 space-y-1 text-xs">
              <li><a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
              <li><a href="https://x.com" target="_blank" rel="noopener noreferrer">X (Twitter)</a></li>
              <li>
                <button
                  type="button"
                  onClick={() => setCookieManagerOpen(true)}
                  className="text-left underline underline-offset-2"
                >
                  Manage Cookies
                </button>
              </li>
            </ul>
          </div>
        </div>
        <p className="container-wide mt-8 border-t border-white/10 pt-4 text-xs text-slate-400">
          &copy; {new Date().getFullYear()} {companyName}. All rights reserved.
        </p>
      </footer>

      <WhatsAppButton phoneNumber={whatsappNumber} />

      <SimpleChatbot />

      {showTopButton ? (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-20 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-900 shadow-lg transition hover:-translate-y-0.5"
          aria-label="Scroll to top"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5v14M6 11l6-6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : null}
      <CookieConsent
        openManager={cookieManagerOpen}
        onCloseManager={() => setCookieManagerOpen(false)}
      />
    </div>
  );
}

function SocialLink({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
    >
      {children}
    </a>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.5 24h4V7.98h-4V24ZM8.5 7.98h3.83v2.19h.05c.53-1 1.83-2.19 3.77-2.19 4.03 0 4.78 2.65 4.78 6.09V24h-4v-8.64c0-2.06-.04-4.71-2.87-4.71-2.87 0-3.31 2.24-3.31 4.56V24h-4V7.98Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.09 4.39 23.08 10.12 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.79-4.69 4.54-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.08 24 18.09 24 12.07Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.6l-5.16-6.4L5.9 22H2.8l7.25-8.29L.8 2h6.76l4.66 5.78L18.9 2Zm-1.16 18h1.72L6.73 3.9H4.9l12.84 16.1Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7Zm10 2c1.65 0 3 1.35 3 3v10c0 1.65-1.35 3-3 3H7c-1.65 0-3-1.35-3-3V7c0-1.65 1.35-3 3-3h10Zm-5 3.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5Zm0 7.3A2.8 2.8 0 1 1 14.8 12 2.8 2.8 0 0 1 12 14.8ZM17.7 6.1a1.05 1.05 0 1 0 1.05 1.05A1.05 1.05 0 0 0 17.7 6.1Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M20.5 3.5A11 11 0 0 0 2.3 16.6L1 23l6.6-1.3A11 11 0 1 0 20.5 3.5Zm-8.6 18a9 9 0 0 1-4.6-1.2l-.3-.2-3.9.8.8-3.8-.2-.3A9 9 0 1 1 11.9 21.5Zm5.3-6.4c-.3-.1-1.9-.9-2.2-1-.3-.1-.5-.1-.7.1-.2.3-.9 1-1.1 1.2-.2.2-.4.2-.7.1-1.8-.9-2.9-1.6-4-3.4-.3-.5.3-.5.9-1.7.1-.2.1-.5 0-.7-.1-.2-.7-1.7-1-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-1 .4-.4.4-1.3 1.2-1.3 2.9 0 1.7 1.3 3.3 1.5 3.6.2.3 2.4 3.8 6 5.3.9.4 1.5.6 2 .7.9.2 1.6.1 2.3.1.7-.1 2-.9 2.3-1.8.3-.9.3-1.7.2-1.8-.1-.1-.3-.2-.7-.3Z" />
    </svg>
  );
}

function QuoteMark() {
  return (
    <svg viewBox="0 0 64 64" className="h-10 w-10 text-[color:var(--brand-primary)]/20" fill="currentColor" aria-hidden="true">
      <path d="M18 28c0-8 5-14 13-16v8c-3 1-5 4-5 8h5v16H18V28zm18 0c0-8 5-14 13-16v8c-3 1-5 4-5 8h5v16H36V28z" />
    </svg>
  );
}

function RippleButton({
  as = "a",
  href,
  type = "button",
  onClick,
  className,
  children,
  disabled = false,
}) {
  const [ripples, setRipples] = useState([]);
  const Element = as;

  const handleClick = (event) => {
    if (disabled) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const key = `${Date.now()}-${Math.random()}`;

    setRipples((prev) => [...prev, { x, y, key }]);
    setTimeout(() => setRipples((prev) => prev.filter((ripple) => ripple.key !== key)), 650);
    onClick?.(event);
  };

  const props = {
    className: `ripple-btn ${className}`,
    onClick: handleClick,
  };

  if (Element === "a") props.href = href;
  if (Element === "button") {
    props.type = type;
    props.disabled = disabled;
  }

  return (
    <Element {...props}>
      {children}
      {ripples.map((ripple) => (
        <span key={ripple.key} className="ripple-dot" style={{ left: ripple.x, top: ripple.y }} />
      ))}
    </Element>
  );
}

const StatCard = memo(function StatCard({ label, value, suffix }) {
  return (
    <div className="glass reveal-item rounded-2xl p-5">
      <div className="text-3xl font-black text-slate-900">
        {value}
        {suffix}
      </div>
      <p className="mt-1 text-sm text-gray-600">{label}</p>
    </div>
  );
});

const IconGlass = memo(function IconGlass({ title, icon }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 transition hover:scale-[1.03]">
      <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[linear-gradient(135deg,var(--brand-primary),var(--brand-dark))] text-sm font-bold text-white">
        {icon}
      </div>
      <p className="text-sm font-semibold">{title}</p>
    </div>
  );
});

const FloatInput = memo(function FloatInput({
  id,
  name = id,
  label,
  value,
  onChange,
  error,
  type = "text",
  inputRef,
}) {
  return (
    <div>
      <label htmlFor={id} className="relative block">
        <input
          id={id}
          name={name}
          type={type}
          ref={inputRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={label}
          className={`form-field peer ${error ? "border-red-500 focus:border-red-500" : ""}`}
          required
        />
        <span className="floating-label pointer-events-none absolute left-4 top-3 text-sm text-gray-500 transition">
          {label}
        </span>
      </label>
      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
});

function LeadForm({
  idPrefix,
  className = "",
  firstFieldRef,
  formData,
  formErrors,
  setFormData,
  submitForm,
  submitLoading,
  formSuccess,
  formMessage,
}) {
  const websiteId = `${idPrefix}-website`;
  const nameId = `${idPrefix}-name`;
  const companyId = `${idPrefix}-company`;
  const emailId = `${idPrefix}-email`;
  const phoneId = `${idPrefix}-phone`;
  const messageId = `${idPrefix}-message`;

  return (
    <form onSubmit={submitForm} noValidate className={className}>
      <div className="hidden" aria-hidden="true">
        <label htmlFor={websiteId}>Website</label>
        <input
          id={websiteId}
          name="website"
          tabIndex="-1"
          autoComplete="off"
          value={formData.website}
          onChange={(event) => setFormData((prev) => ({ ...prev, website: event.target.value }))}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FloatInput
          id={nameId}
          name="name"
          label="Name"
          value={formData.name}
          error={formErrors.name}
          inputRef={firstFieldRef}
          onChange={(value) => setFormData((prev) => ({ ...prev, name: value }))}
        />
        <FloatInput
          id={companyId}
          name="company"
          label="Company Name"
          value={formData.company}
          error={formErrors.company}
          onChange={(value) => setFormData((prev) => ({ ...prev, company: value }))}
        />
        <FloatInput
          id={emailId}
          name="email"
          label="Email"
          type="email"
          value={formData.email}
          error={formErrors.email}
          onChange={(value) => setFormData((prev) => ({ ...prev, email: value }))}
        />
        <FloatInput
          id={phoneId}
          name="phone"
          label="Phone"
          type="tel"
          value={formData.phone}
          error={formErrors.phone}
          onChange={(value) => setFormData((prev) => ({ ...prev, phone: value }))}
        />
      </div>

      <div className="mt-4">
        <label htmlFor={messageId} className="relative block">
          <textarea
            id={messageId}
            name="message"
            value={formData.message}
            onChange={(event) => setFormData((prev) => ({ ...prev, message: event.target.value }))}
            placeholder="Message"
            className={`form-field peer min-h-[130px] ${formErrors.message ? "border-red-500 focus:border-red-500" : ""}`}
            required
          />
          <span className="floating-label pointer-events-none absolute left-4 top-3 text-sm text-gray-500 transition">
            Message
          </span>
        </label>
        {formErrors.message ? <p className="mt-1 text-xs text-rose-600">{formErrors.message}</p> : null}
      </div>

      <RippleButton
        as="button"
        type="submit"
        className={`mt-6 rounded-xl px-6 py-3 text-sm font-bold ${
          submitLoading ? "bg-slate-400 text-slate-700" : "bg-gradient-to-r from-slate-900 to-slate-700 text-white"
        }`}
        disabled={submitLoading}
      >
        {submitLoading ? "Submitting..." : "Schedule A Free Demo"}
      </RippleButton>

      {formSuccess ? (
        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
          <span aria-hidden="true">OK</span>
          Message sent successfully. Team BSS will contact you soon.
        </p>
      ) : null}
      {formMessage && !formSuccess ? <p className="mt-3 text-sm text-amber-700">{formMessage}</p> : null}
    </form>
  );
}

function WaveDivider({ className, flip = false }) {
  return (
    <div className={`wave-divider ${className}`} aria-hidden="true">
      <svg
        className={`h-14 w-full ${flip ? "rotate-180" : ""}`}
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0,64L48,69.3C96,75,192,85,288,74.7C384,64,480,32,576,26.7C672,21,768,43,864,58.7C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
        />
      </svg>
    </div>
  );
}
