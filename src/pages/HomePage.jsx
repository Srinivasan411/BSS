import { memo, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getContent } from "../api";
import CookieConsent from "../components/CookieConsent";
import SeoMeta from "../components/SeoMeta";
import SimpleChatbot from "../components/SimpleChatbot";
import WhatsAppButton from "../components/WhatsAppButton";
import { sanitizeFormData } from "../utils/sanitize";
import { validateLeadForm } from "../utils/validation";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Products", href: "#products" },
  { label: "Services", href: "#services" },
  { label: "Pricing", href: "#pricing" },
  { label: "Clients", href: "#clients" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Newsroom", href: "#newsroom" },
  { label: "Careers", href: "#careers" },
  { label: "Contact", href: "#contact" },
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [showTopButton, setShowTopButton] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [parallaxY, setParallaxY] = useState(0);
  const [pricingMode, setPricingMode] = useState("monthly");
  const [content, setContent] = useState({ settings: {}, clients: [], testimonials: [] });
  const [productIndex, setProductIndex] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [formSuccess, setFormSuccess] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formStartedAt] = useState(() => Date.now());
  const [formMessage, setFormMessage] = useState("");
  const [cookieManagerOpen, setCookieManagerOpen] = useState(false);

  useEffect(() => {
    getContent()
      .then((payload) => setContent(payload))
      .catch(() => setContent({ settings: {}, clients: [], testimonials: [] }));
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
    }, 4500);
    return () => clearInterval(timer);
  }, [content.testimonials.length]);

  const c1 = useCountUp(140, statsVisible);
  const c2 = useCountUp(310, statsVisible);
  const c3 = useCountUp(12, statsVisible);

  const settings = content.settings || {};
  const companyName = settings.companyName || "Brilliant Systems Solutions (BSS)";
  const heroHeading = settings.heroHeading || "Empowering Businesses with Smart IT & AI Solutions";
  const heroSubheading =
    settings.heroSubheading ||
    "A product and services company helping enterprises modernize technology with secure IT systems, AI automation, and strategic consulting.";
  const whatsappNumber = settings.whatsappNumber || "919000000000";
  const contactEmail = settings.contactEmail || "hello@bss-example.com";
  const canonicalUrl = "https://www.brilliantsystemssolutions.com/";
  const ogImage = `${canonicalUrl}og-image.jpg`;

  const clientLogos = useMemo(() => {
    const base = content.clients.length > 0 ? content.clients : [{ id: 0, name: "Your Logo", logoUrl: "" }];
    return [...base, ...base];
  }, [content.clients]);

  const currentProduct = products[productIndex];
  const activeTestimonial =
    content.testimonials[testimonialIndex] || {
      id: 0,
      name: "Client Name",
      company: "Company",
      rating: 5,
      feedback: "Add testimonials from /admin to display customer feedback here.",
    };
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

      <header
        className={`fixed inset-x-0 top-0 z-50 border-b border-gray-100 backdrop-blur-lg transition ${
          navScrolled ? "bg-white/70 shadow-md" : "bg-white/40"
        }`}
      >
        <nav className="container-wide flex items-center justify-between py-4">
          <a href="#home" className="text-base font-bold tracking-[0.16em] text-gray-900 sm:text-lg">
            BSS
          </a>

          <button
            type="button"
            className="rounded-lg border border-gray-200 p-2 text-gray-900 lg:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>

          <div className="hidden items-center gap-7 text-sm text-gray-700 lg:flex">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="nav-link transition hover:text-blue-700">
                {link.label}
              </a>
            ))}
            <Link to="/admin" className="rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 font-semibold text-white shadow-lg transition hover:shadow-xl">
              Admin
            </Link>
          </div>
        </nav>

        {mobileOpen ? (
          <div className="border-t border-gray-100 bg-white/90 px-4 py-3 lg:hidden">
            <div className="flex flex-col gap-3 text-sm text-gray-700">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                  {link.label}
                </a>
              ))}
              <Link to="/admin" onClick={() => setMobileOpen(false)} className="rounded-md border border-cyan-300/50 px-3 py-2 text-blue-700">
                Admin
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      <main className="mesh-bg relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 text-gray-700 [&_h1]:text-gray-900 [&_h2]:text-gray-900 [&_h3]:text-gray-900">
        <section id="home" className="relative overflow-hidden pt-28 sm:pt-32">
          <div className="blob -left-20 top-20 h-56 w-56 bg-blue-400/70" style={{ transform: `translateY(${parallaxY * 0.4}px)` }} />
          <div className="blob right-8 top-10 h-40 w-40 bg-indigo-400/70" style={{ transform: `translateY(${-parallaxY * 0.25}px)` }} />
          <div className="blob bottom-8 right-[-5%] h-64 w-64 bg-cyan-300/70" style={{ transform: `translateY(${parallaxY * 0.3}px)` }} />

          <div className="container-wide section-pad relative z-10">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div className="reveal-item">
                <p className="mb-5 inline-flex rounded-full border border-cyan-300/40 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                  Premium Enterprise Technology
                </p>
                <h1 className="max-w-4xl text-4xl font-black leading-[1.15] text-gray-900 sm:text-5xl lg:text-6xl">
                  {heroHeading}
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-gray-600 sm:text-lg">{heroSubheading}</p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <RippleButton href="#contact" className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:shadow-xl">
                    Get Free Consultation
                  </RippleButton>
                  <RippleButton href="#products" className="rounded-xl border border-blue-500 bg-white px-6 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50">
                    Explore Products
                  </RippleButton>
                </div>
              </div>

              <aside className="glass glow-border reveal-item rounded-3xl p-6 shadow-xl transition duration-300 hover:-translate-y-1 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900">Transformation Snapshot</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Secure IT, AI automation, and people operations consulting delivered as one integrated engagement model.
                </p>
                <ul className="mt-5 space-y-4 text-sm text-blue-700">
                  <li>- Enterprise-first architecture and governance</li>
                  <li>- Productized accelerators for faster go-live</li>
                  <li>- Continuous optimization and strategic advisory</li>
                </ul>
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
                <div className="rounded-2xl border border-cyan-300/30 bg-white p-4 transition hover:scale-[1.02]">Brilliant Systems Solutions, Madurai</div>
                <div className="rounded-2xl border border-cyan-300/30 bg-white p-4 transition hover:scale-[1.02]">Yangkhor Private Limited, Bhutan</div>
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
                  <div className="mb-5 h-1 w-20 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {currentProduct.badge}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {currentProduct.subtitle}
                    </span>
                  </div>
                  <div className="h-44 rounded-xl bg-gradient-to-br from-blue-300/45 via-indigo-300/35 to-cyan-300/45" aria-hidden="true" />
                  <h3 className="mt-5 text-2xl font-bold">{currentProduct.name}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-600">{currentProduct.description}</p>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {currentProduct.highlights.map((item) => (
                      <li key={item} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700">
                        {item}
                      </li>
                    ))}
                  </ul>
                  <RippleButton href="#contact" className="mt-5 inline-flex rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white">
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
                          ? "border-cyan-300 bg-gradient-to-r from-blue-600 to-cyan-500/20 text-blue-700 shadow-md"
                          : "border-gray-100 bg-white text-gray-600 hover:border-cyan-300/55"
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
                      className="mr-2 rounded-full border border-blue-200 px-3 py-1 text-xs"
                      aria-label="Previous product"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductIndex((prev) => (prev + 1) % products.length)}
                      className="rounded-full border border-blue-200 px-3 py-1 text-xs"
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
              <ul className="mt-6 space-y-3 text-sm text-blue-700">
                <li>- Unified dashboards for operations, HR, and IT decision-making</li>
                <li>- AI-assisted workflow orchestration with role-based controls</li>
                <li>- SLA-backed implementation and continuous optimization cycles</li>
              </ul>
            </article>
            <article className="reveal-item rounded-3xl border border-cyan-300/25 bg-gradient-to-br from-blue-500/25 to-indigo-500/20 p-8">
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
                  <div className="mb-5 h-1 w-20 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 font-bold text-white shadow-md">
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
          <div className="blob left-[-5%] top-16 h-44 w-44 bg-cyan-300/50" />
          <div className="container-wide relative z-10">
            <div className="reveal-item flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-3xl font-bold sm:text-4xl">Pricing Plans</h2>
              <div className="inline-flex rounded-full border border-gray-200 bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setPricingMode("monthly")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${pricingMode === "monthly" ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md" : "text-gray-700"}`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setPricingMode("yearly")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${pricingMode === "yearly" ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md" : "text-gray-700"}`}
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
                  <div className="mb-5 h-1 w-24 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
                  <h3 className="text-2xl font-semibold">{plan.name}</h3>
                  <p className="mt-3 text-3xl font-black text-blue-600">
                    {plan.amount ? `$${plan.amount}` : "Custom"}
                    <span className="text-sm font-medium text-gray-500">{plan.amount ? pricingMode === "monthly" ? " /month" : " /year" : ""}</span>
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-gray-600">
                    <li>- Dedicated onboarding</li>
                    <li>- Security-first delivery</li>
                    <li>- SLA-backed support</li>
                  </ul>
                  <RippleButton href="#contact" className="mt-6 inline-flex w-full justify-center rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white">
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

        <section id="testimonials" className="relative bg-gray-50 py-24">
          <div className="container-wide mx-auto max-w-5xl px-6">
            <div className="relative text-center">
              <h2 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">Testimonials</h2>
              <p className="mt-3 text-sm uppercase tracking-wide text-gray-500">
                Our Happy Clients Says
              </p>

              <div className="relative z-10 mx-auto mt-10 max-w-3xl rounded-3xl border border-gray-100 bg-white p-8 shadow-xl md:p-10">
                <div className="flex justify-center gap-1 text-amber-400" aria-label={`Rating ${activeTestimonial.rating || 5} out of 5`}>
                  {Array.from({ length: activeTestimonial.rating || 5 }).map((_, idx) => (
                    <svg key={`active-star-${idx}`} viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.03 3.167a1 1 0 00.95.69h3.328c.969 0 1.371 1.24.588 1.81l-2.693 1.955a1 1 0 00-.364 1.118l1.03 3.167c.3.921-.755 1.688-1.54 1.118L10 13.347l-2.693 1.955c-.784.57-1.838-.197-1.539-1.118l1.03-3.167a1 1 0 00-.364-1.118L3.74 8.594c-.783-.57-.38-1.81.588-1.81h3.329a1 1 0 00.95-.69l1.03-3.167z" />
                    </svg>
                  ))}
                </div>

                <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-gray-700 md:text-xl">
                  <span className="text-3xl text-blue-300">"</span>
                  {activeTestimonial.feedback}
                  <span className="text-3xl text-blue-300">"</span>
                </p>

                <div className="mt-8 flex items-center justify-center gap-3">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(activeTestimonial.name)}&background=e0f2fe&color=0f172a`}
                    alt={`${activeTestimonial.name} avatar`}
                    className="h-12 w-12 rounded-full border-2 border-white shadow-sm"
                    loading="lazy"
                  />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{activeTestimonial.name}</p>
                    <p className="text-sm text-gray-500">{activeTestimonial.company}</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-center gap-2">
                  {content.testimonials.map((item, idx) => (
                    <button
                      key={`${item.id}-t-dot`}
                      type="button"
                      onClick={() => setTestimonialIndex(idx)}
                      aria-label={`Go to testimonial ${idx + 1}`}
                      className={`h-2.5 rounded-full transition ${
                        idx === testimonialIndex ? "w-8 bg-blue-600" : "w-2.5 bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="newsroom" className="section-pad bg-transparent">
          <div className="container-wide">
            <h2 className="reveal-item text-3xl font-bold sm:text-4xl">Newsroom</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {newsroomItems.map((item) => (
                <article key={item.title} className="reveal-item overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 transition hover:-translate-y-1 hover:shadow-[0_24px_42px_-30px_rgba(34,211,238,0.8)]">
                  <div className="h-36 overflow-hidden rounded-xl bg-blue-50">
                    <div className="h-full w-full bg-gradient-to-br from-blue-300/40 to-cyan-300/40 transition duration-300 hover:scale-110" />
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-blue-600">{item.date}</p>
                  <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{item.summary}</p>
                  <a href="#newsroom" className="mt-4 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700">
                    Read More
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="careers" className="section-pad">
          <div className="container-wide">
            <div className="reveal-item rounded-3xl border border-cyan-300/35 bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-cyan-500/30 p-8 text-center backdrop-blur-sm sm:p-10">
              <h2 className="text-3xl font-bold sm:text-4xl">Join Our Growing Team</h2>
              <p className="mx-auto mt-3 max-w-3xl text-gray-700">
                Build meaningful enterprise products and consulting solutions with a team that values quality, speed, and innovation.
              </p>
              <RippleButton href="/careers" className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-sm font-bold text-white">
                Explore Careers
              </RippleButton>
            </div>
          </div>
        </section>

        <section id="contact" className="section-pad pb-24">
          <div className="container-wide grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <article className="reveal-item">
              <h2 className="text-3xl font-bold sm:text-4xl">Lead Generation Form</h2>
              <p className="mt-4 text-gray-600">
                Share your requirements and get a tailored strategy consultation from our team.
              </p>
              <p className="mt-2 text-sm text-blue-600">Contact email: {contactEmail}</p>
              <p className="mt-5 rounded-xl border border-cyan-300/40 bg-cyan-50 px-4 py-3 text-sm text-blue-700">
                Spam prevention: We never ask for OTPs, passwords, or payment data in this form.
              </p>
            </article>

            <form onSubmit={submitForm} noValidate className="glass reveal-item rounded-3xl p-6 sm:p-8">
              <div className="hidden" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  tabIndex="-1"
                  autoComplete="off"
                  value={formData.website}
                  onChange={(event) => setFormData((prev) => ({ ...prev, website: event.target.value }))}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FloatInput
                  id="name"
                  label="Name"
                  value={formData.name}
                  error={formErrors.name}
                  onChange={(value) => setFormData((prev) => ({ ...prev, name: value }))}
                />
                <FloatInput
                  id="company"
                  label="Company Name"
                  value={formData.company}
                  error={formErrors.company}
                  onChange={(value) => setFormData((prev) => ({ ...prev, company: value }))}
                />
                <FloatInput
                  id="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  error={formErrors.email}
                  onChange={(value) => setFormData((prev) => ({ ...prev, email: value }))}
                />
                <FloatInput
                  id="phone"
                  label="Phone"
                  type="tel"
                  value={formData.phone}
                  error={formErrors.phone}
                  onChange={(value) => setFormData((prev) => ({ ...prev, phone: value }))}
                />
              </div>

              <div className="mt-4">
                <label htmlFor="message" className="relative block">
                  <textarea
                    id="message"
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
                  submitLoading ? "bg-slate-400 text-slate-700" : "bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
                }`}
                disabled={submitLoading}
              >
                {submitLoading ? "Submitting..." : "Submit Inquiry"}
              </RippleButton>

              {formSuccess ? (
                <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                  <span aria-hidden="true">OK</span>
                  Message sent successfully. Team BSS will contact you soon.
                </p>
              ) : null}
              {formMessage && !formSuccess ? (
                <p className="mt-3 text-sm text-amber-700">{formMessage}</p>
              ) : null}
            </form>
          </div>
        </section>
      </main>

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
              <li><a href="#about">About</a></li>
              <li><a href="#products">Products</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="/sitemap.xml">XML Sitemap</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Contact</h3>
            <ul className="mt-2 space-y-1 text-xs">
              <li>Email: {contactEmail}</li>
              <li>WhatsApp: +{whatsappNumber}</li>
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
          className="fixed bottom-6 right-42 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-900 shadow-lg transition hover:-translate-y-0.5"
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

function RippleButton({ as = "a", href, type = "button", className, children, disabled = false }) {
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
      <div className="text-3xl font-black text-blue-600">
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
      <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-cyan-300 text-sm font-bold text-white">
        {icon}
      </div>
      <p className="text-sm font-semibold">{title}</p>
    </div>
  );
});

const FloatInput = memo(function FloatInput({ id, label, value, onChange, error, type = "text" }) {
  return (
    <div>
      <label htmlFor={id} className="relative block">
        <input
          id={id}
          name={id}
          type={type}
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

