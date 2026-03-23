import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Globe,
  Linkedin,
  Menu,
  Palette,
  ShoppingBag,
  Sparkles,
  Twitter,
  X,
  Zap,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useInView,
  useScroll,
  useTransform,
} from "motion/react";
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { useSubmitInquiry } from "./hooks/useQueries";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Ease curve: fast-out, decelerate — premium cinematic feel */
const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

// ─────────────────────────────────────────────────────────────────────────────
// #1 — SpotlightCard  (cursor-tracking radial glow)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Wraps any card with a subtle aurora spotlight that follows the cursor.
 * Used by Linear, Raycast, and Vercel to create surface "aliveness".
 */
function SpotlightCard({
  children,
  className = "",
  style,
  glowColor = "oklch(0.62 0.25 290 / 0.09)",
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  glowColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null);

  const handleMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={style}
      onMouseMove={handleMove}
      onMouseLeave={() => setMouse(null)}
    >
      {/* Spotlight layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius: "inherit",
          background: mouse
            ? `radial-gradient(500px at ${mouse.x}px ${mouse.y}px, ${glowColor}, transparent 80%)`
            : "transparent",
          transition: mouse ? "none" : "background 0.4s ease",
          zIndex: 1,
        }}
      />
      {/* Content sits above spotlight */}
      <div className="relative" style={{ zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// #2 — AnimatedStat  (count-up number on viewport enter)
// ─────────────────────────────────────────────────────────────────────────────
function AnimatedStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  // Extract numeric part and suffix (e.g. "50+" -> 50, "+")
  const match = value.match(/^(\d+)(.*)$/);
  const target = match ? Number.parseInt(match[1], 10) : 0;
  const suffix = match ? match[2] : value;
  const isNumeric = !!match;

  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView || !isNumeric) return;
    const duration = 1400;
    const start = performance.now();
    const frame = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // ease-out-expo
      const eased = t === 1 ? 1 : 1 - 2 ** (-10 * t);
      setCount(Math.floor(eased * target));
      if (t < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [inView, target, isNumeric]);

  return (
    <div ref={ref}>
      <div className="font-display font-extrabold text-2xl gradient-text">
        {isNumeric ? `${count}${suffix}` : value}
      </div>
      <div
        className="text-xs tracking-wide mt-0.5"
        style={{ color: "oklch(0.52 0.02 240)" }}
      >
        {label}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Logo
// ─────────────────────────────────────────────────────────────────────────────
function NexLogo({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      aria-label="BuildWithNex logo"
      role="img"
    >
      <defs>
        <linearGradient
          id="logoGrad"
          x1="0"
          y1="0"
          x2="36"
          y2="36"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#9A4DFF" />
          <stop offset="100%" stopColor="#24D7E8" />
        </linearGradient>
      </defs>
      <rect width="36" height="36" rx="8" fill="url(#logoGrad)" />
      <text
        x="5"
        y="27"
        fontFamily="Bricolage Grotesque, sans-serif"
        fontWeight="800"
        fontSize="22"
        fill="white"
      >
        N
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Particle field
// ─────────────────────────────────────────────────────────────────────────────
const PARTICLE_COLORS = [
  "oklch(0.62 0.25 290)",
  "oklch(0.75 0.2 200)",
  "oklch(0.65 0.22 250)",
];

const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: (i * 37 + 11) % 100,
  y: (i * 53 + 7) % 100,
  size: (i % 3) + 1.5,
  duration: (i % 4) + 3,
  delay: (i % 5) * 0.8,
  color: PARTICLE_COLORS[i % 3],
}));

function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLES.map((p) => {
        const boxShadow = `0 0 ${p.size * 4}px ${p.color}`;
        return (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: p.color,
              boxShadow,
            }}
            animate={{
              y: [0, -28, 0],
              opacity: [0.25, 0.9, 0.25],
              scale: [1, 1.6, 1],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Wave Band
// ─────────────────────────────────────────────────────────────────────────────
function WaveBand() {
  return (
    <div
      className="absolute left-0 right-0 wave-band pointer-events-none"
      style={{ top: "62%", height: "120px" }}
    >
      <div
        className="absolute inset-x-0 top-1/2"
        style={{
          height: "1px",
          background:
            "linear-gradient(90deg, transparent 5%, oklch(0.62 0.25 290 / 0.5) 35%, oklch(0.75 0.2 200 / 0.5) 65%, transparent 95%)",
        }}
      />
      {/* Wide soft haze */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, transparent, oklch(0.62 0.25 290 / 0.06) 40%, oklch(0.75 0.2 200 / 0.06) 60%, transparent)",
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section title with clip-path wipe reveal
// ─────────────────────────────────────────────────────────────────────────────
function SectionTitle({
  eyebrow,
  title,
  delay = 0,
}: {
  eyebrow: string;
  title: string;
  delay?: number;
}) {
  return (
    <div className="mb-16">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay }}
        className="section-label mb-4"
      >
        {eyebrow}
      </motion.div>
      <div style={{ overflow: "hidden" }}>
        <motion.h2
          initial={{ y: "110%" }}
          whileInView={{ y: "0%" }}
          viewport={{ once: true }}
          transition={{
            duration: 0.7,
            delay: delay + 0.05,
            ease: EASE_OUT_EXPO,
          }}
          className="font-display font-extrabold uppercase tracking-tight"
          style={{
            fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
            color: "oklch(0.95 0.01 240)",
          }}
        >
          {title}
        </motion.h2>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// #2 — GradientButton  (light-beam sweep + intensified glow on hover)
// ─────────────────────────────────────────────────────────────────────────────
interface GradientButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  variant?: "filled" | "outline";
  "data-ocid"?: string;
}

function GradientButton({
  children,
  onClick,
  className = "",
  type = "button",
  disabled = false,
  variant = "filled",
  "data-ocid": dataOcid,
}: GradientButtonProps) {
  const [hovered, setHovered] = useState(false);
  const base =
    "relative px-6 py-3 rounded-full font-semibold text-sm uppercase tracking-widest overflow-hidden flex items-center gap-2 justify-center select-none";

  const beam = (
    <AnimatePresence>
      {hovered && (
        <motion.span
          key="beam"
          initial={{ x: "-140%", skewX: "-18deg" }}
          animate={{ x: "220%", skewX: "-18deg" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{
            left: 0,
            width: "45%",
            background:
              "linear-gradient(90deg, transparent, oklch(1 0 0 / 0.22), transparent)",
          }}
        />
      )}
    </AnimatePresence>
  );

  if (variant === "outline") {
    return (
      <motion.button
        type={type}
        onClick={onClick}
        disabled={disabled}
        data-ocid={dataOcid}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        className={`${base} ${className}`}
        style={{
          background: "oklch(0.115 0.012 240)",
          border: hovered
            ? "1px solid oklch(0.75 0.2 200 / 0.75)"
            : "1px solid oklch(0.62 0.25 290 / 0.5)",
          color: "oklch(0.75 0.2 200)",
          boxShadow: hovered
            ? "0 0 28px oklch(0.62 0.25 290 / 0.45), 0 0 56px oklch(0.55 0.28 290 / 0.2)"
            : "0 0 16px oklch(0.62 0.25 290 / 0.15)",
          transition: "box-shadow 0.3s ease, border-color 0.3s ease",
        }}
      >
        {beam}
        {children}
      </motion.button>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      data-ocid={dataOcid}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      className={`${base} ${className}`}
      style={{
        background:
          "linear-gradient(135deg, oklch(0.55 0.28 290), oklch(0.72 0.2 200))",
        color: "white",
        boxShadow: hovered
          ? "0 0 36px oklch(0.62 0.25 290 / 0.75), 0 0 80px oklch(0.55 0.28 290 / 0.4), 0 0 120px oklch(0.62 0.25 290 / 0.15)"
          : "0 0 20px oklch(0.62 0.25 290 / 0.4), 0 0 44px oklch(0.55 0.28 290 / 0.18)",
        transition: "box-shadow 0.3s ease",
      }}
    >
      {beam}
      {children}
    </motion.button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────────────────────
function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { href: "#services", label: "Services" },
    { href: "#work", label: "Work" },
    { href: "#pricing", label: "Pricing" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "oklch(0.115 0.012 240 / 0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(24px) saturate(1.4)" : "none",
        borderBottom: scrolled ? "1px solid oklch(0.22 0.025 240)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3" data-ocid="nav.link">
          <NexLogo size={40} />
          <div className="flex flex-col leading-tight">
            <span
              className="font-display font-extrabold text-lg tracking-tight"
              style={{ color: "oklch(0.95 0.01 240)" }}
            >
              BUILDWITHNEX
            </span>
            <span
              className="text-xs tracking-widest"
              style={{ color: "oklch(0.72 0.2 200)" }}
            >
              WEB DESIGN STUDIO
            </span>
          </div>
        </a>

        <nav
          className="hidden md:flex items-center gap-8"
          aria-label="Main navigation"
        >
          {navLinks.map((link) => (
            <NavLink key={link.href} href={link.href}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          <GradientButton
            onClick={() =>
              document
                .getElementById("contact")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Get Your Free Proposal
          </GradientButton>
        </div>

        <button
          type="button"
          className="md:hidden p-2 rounded-lg"
          style={{ color: "oklch(0.65 0.02 240)" }}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          data-ocid="nav.toggle"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: "oklch(0.13 0.015 240)",
              borderBottom: "1px solid oklch(0.22 0.025 240)",
            }}
            className="md:hidden px-6 pb-6"
          >
            <nav className="flex flex-col gap-4 pt-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  data-ocid="nav.link"
                  className="text-sm font-medium tracking-wide"
                  style={{ color: "oklch(0.65 0.02 240)" }}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <GradientButton
                onClick={() => {
                  setMenuOpen(false);
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Get Your Free Proposal
              </GradientButton>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/** Nav link with animated underline */
function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      data-ocid="nav.link"
      className="relative text-sm font-medium tracking-wide pb-0.5"
      style={{
        color: hovered ? "oklch(0.88 0.02 240)" : "oklch(0.6 0.02 240)",
        transition: "color 0.2s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      <motion.span
        className="absolute bottom-0 left-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.62 0.25 290), oklch(0.75 0.2 200))",
        }}
        initial={{ width: "0%" }}
        animate={{ width: hovered ? "100%" : "0%" }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      />
    </a>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// #1 — Hero with staggered headline reveal
// ─────────────────────────────────────────────────────────────────────────────

/** One headline line: wraps content in overflow:hidden + animates y from 110% */
function HeroLine({
  children,
  index,
  started,
}: {
  children: ReactNode;
  index: number;
  started: boolean;
}) {
  return (
    <div style={{ overflow: "hidden", display: "block" }}>
      <motion.span
        style={{ display: "block" }}
        initial={{ y: "110%" }}
        animate={started ? { y: "0%" } : { y: "110%" }}
        transition={{
          duration: 0.72,
          delay: index * 0.13,
          ease: EASE_OUT_EXPO,
        }}
      >
        {children}
      </motion.span>
    </div>
  );
}

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  // Trigger headline entrance on mount (slight delay for page paint)
  const [headlineStarted, setHeadlineStarted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHeadlineStarted(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center overflow-hidden pt-20"
    >
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.1 0.018 260) 0%, oklch(0.115 0.012 240) 50%, oklch(0.12 0.015 280) 100%)",
        }}
      />

      {/* Orbs with drift animation */}
      <div
        className="absolute rounded-full blur-3xl pointer-events-none animate-orb-drift"
        style={{
          width: 700,
          height: 700,
          top: "-25%",
          right: "-12%",
          opacity: 0.2,
          background:
            "radial-gradient(circle, oklch(0.55 0.28 290), transparent 68%)",
        }}
      />
      <div
        className="absolute rounded-full blur-3xl pointer-events-none"
        style={{
          width: 450,
          height: 450,
          bottom: "-5%",
          left: "-6%",
          opacity: 0.14,
          animation: "orbDrift 16s ease-in-out infinite reverse",
          background:
            "radial-gradient(circle, oklch(0.72 0.2 200), transparent 68%)",
        }}
      />

      <WaveBand />
      <ParticleField />

      {/* Animated dot grid */}
      <div
        className="absolute inset-0 pointer-events-none animate-grid-drift"
        style={{
          opacity: 0.08,
          backgroundImage:
            "radial-gradient(circle, oklch(0.72 0.2 200) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* ── Left column ───────────────────────────────────── */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="section-label mb-7 flex items-center gap-2"
          >
            <Sparkles size={14} />
            Premium Web Design Studio
          </motion.div>

          {/* Staggered headline */}
          <h1
            className="font-display font-extrabold leading-none tracking-tight mb-7"
            style={{
              fontSize: "clamp(2.8rem, 5vw, 4.5rem)",
              color: "oklch(0.97 0.005 240)",
            }}
          >
            <HeroLine index={0} started={headlineStarted}>
              TRANSFORMING{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.62 0.25 290), oklch(0.75 0.2 200))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                IDEAS
              </span>
            </HeroLine>
            <HeroLine index={1} started={headlineStarted}>
              INTO DIGITAL
            </HeroLine>
            <HeroLine index={2} started={headlineStarted}>
              <motion.span
                style={{
                  display: "inline-block",
                  background:
                    "linear-gradient(90deg, oklch(0.62 0.25 290), oklch(0.75 0.2 200), oklch(0.62 0.25 290))",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "shimmer 3.5s linear infinite",
                }}
                initial={{ scale: 0.88 }}
                animate={headlineStarted ? { scale: 1 } : { scale: 0.88 }}
                transition={{
                  duration: 0.65,
                  delay: 0.38,
                  ease: [0.34, 1.56, 0.64, 1], // spring overshoot
                }}
              >
                MASTERPIECES.
              </motion.span>
            </HeroLine>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="text-base leading-relaxed mb-10"
            style={{ color: "oklch(0.62 0.02 240)", maxWidth: 480 }}
          >
            Premium custom web design and development for forward-thinking
            brands. We build experiences that captivate, convert, and endure.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex flex-wrap gap-4 items-center"
          >
            <GradientButton
              onClick={() =>
                document
                  .getElementById("services")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              data-ocid="hero.primary_button"
            >
              DISCOVER OUR SERVICES <ArrowRight size={16} />
            </GradientButton>
            <GradientButton
              variant="outline"
              onClick={() =>
                document
                  .getElementById("work")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              data-ocid="hero.secondary_button"
            >
              VIEW OUR WORK
            </GradientButton>
          </motion.div>

          {/* Count-up stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="mt-14 flex gap-10"
          >
            <AnimatedStat value="50+" label="Projects Delivered" />
            <AnimatedStat value="98%" label="Client Satisfaction" />
            <AnimatedStat value="5★" label="Average Rating" />
          </motion.div>
        </div>

        {/* ── Right column — Floating mockup ────────────────── */}
        <motion.div
          style={{ y }}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: EASE_OUT_EXPO }}
          className="relative flex justify-center"
        >
          <div
            className="absolute inset-0 rounded-3xl blur-3xl opacity-25 pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.55 0.28 290 / 0.6), oklch(0.72 0.2 200 / 0.6))",
              transform: "scale(0.8) translateY(12%)",
            }}
          />

          <motion.div
            animate={{ y: [0, -18, 0], rotate: [0, 0.8, 0] }}
            transition={{
              duration: 6.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="relative w-full"
            style={{ maxWidth: 520 }}
          >
            {/* Browser frame */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "oklch(0.14 0.018 240)",
                border: "1px solid oklch(0.3 0.045 270 / 0.55)",
                boxShadow:
                  "0 36px 90px oklch(0.115 0.012 240 / 0.85), 0 0 50px oklch(0.62 0.25 290 / 0.12), 0 0 1px oklch(0.62 0.25 290 / 0.3)",
              }}
            >
              {/* Chrome bar */}
              <div
                className="px-4 py-3 flex items-center gap-2"
                style={{
                  background: "oklch(0.16 0.02 240)",
                  borderBottom: "1px solid oklch(0.22 0.025 240)",
                }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: "oklch(0.65 0.22 30)" }}
                />
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: "oklch(0.75 0.2 90)" }}
                />
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: "oklch(0.62 0.22 145)" }}
                />
                <div
                  className="ml-4 flex-1 rounded-full text-xs px-3 py-1"
                  style={{
                    background: "oklch(0.13 0.015 240)",
                    color: "oklch(0.42 0.02 240)",
                  }}
                >
                  buildwithnex.com/yourproject
                </div>
              </div>
              <img
                src="/assets/generated/hero-mockup.dim_600x500.png"
                alt="Website mockup preview"
                className="w-full object-cover"
                style={{ maxHeight: 380 }}
              />
            </div>

            {/* Floating badge — Project Live */}
            <motion.div
              animate={{ y: [0, -9, 0] }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 1.2,
              }}
              className="absolute -bottom-5 -left-8 rounded-2xl px-4 py-3 flex items-center gap-3"
              style={{
                background: "oklch(0.145 0.018 240)",
                border: "1px solid oklch(0.24 0.03 240)",
                boxShadow: "0 8px 36px oklch(0.115 0.012 240 / 0.7)",
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "oklch(0.62 0.25 290 / 0.18)" }}
              >
                <Check size={14} style={{ color: "oklch(0.75 0.2 200)" }} />
              </div>
              <div>
                <div
                  className="text-xs font-semibold"
                  style={{ color: "oklch(0.9 0.01 240)" }}
                >
                  Project Live
                </div>
                <div
                  className="text-xs"
                  style={{ color: "oklch(0.5 0.02 240)" }}
                >
                  Just deployed ✦
                </div>
              </div>
            </motion.div>

            {/* Floating metric */}
            <motion.div
              animate={{ y: [0, 11, 0] }}
              transition={{
                duration: 5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 0.6,
              }}
              className="absolute -top-5 -right-8 rounded-2xl px-4 py-3"
              style={{
                background: "oklch(0.145 0.018 240)",
                border: "1px solid oklch(0.24 0.03 240)",
                boxShadow: "0 8px 36px oklch(0.115 0.012 240 / 0.7)",
              }}
            >
              <div className="text-xs" style={{ color: "oklch(0.5 0.02 240)" }}>
                Performance
              </div>
              <div className="font-display font-bold text-lg gradient-text">
                99/100
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 9, 0] }}
        transition={{
          duration: 2.2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <div
          className="text-xs tracking-widest"
          style={{ color: "oklch(0.4 0.02 240)" }}
        >
          SCROLL
        </div>
        <div
          className="w-px h-9"
          style={{
            background:
              "linear-gradient(to bottom, oklch(0.62 0.25 290 / 0.8), transparent)",
          }}
        />
      </motion.div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Services  (#3 SpotlightCard applied)
// ─────────────────────────────────────────────────────────────────────────────
const SERVICE_COLOR_BG = [
  "oklch(0.62 0.25 290 / 0.14)",
  "oklch(0.72 0.2 200 / 0.14)",
  "oklch(0.65 0.22 250 / 0.14)",
  "oklch(0.78 0.18 180 / 0.14)",
];
const SERVICE_COLOR_BORDER = [
  "oklch(0.62 0.25 290 / 0.3)",
  "oklch(0.72 0.2 200 / 0.3)",
  "oklch(0.65 0.22 250 / 0.3)",
  "oklch(0.78 0.18 180 / 0.3)",
];
const SERVICE_GLOW = [
  "oklch(0.62 0.25 290 / 0.1)",
  "oklch(0.72 0.2 200 / 0.1)",
  "oklch(0.65 0.22 250 / 0.1)",
  "oklch(0.78 0.18 180 / 0.1)",
];

const services = [
  {
    icon: Globe,
    title: "Custom Web Design",
    desc: "Bespoke, pixel-perfect websites crafted to reflect your brand identity and convert visitors into loyal customers.",
    color: "oklch(0.62 0.25 290)",
  },
  {
    icon: ShoppingBag,
    title: "eCommerce Solutions",
    desc: "High-converting online stores with seamless checkout flows, inventory management, and powerful payment integrations.",
    color: "oklch(0.72 0.2 200)",
  },
  {
    icon: Palette,
    title: "Branding & Strategy",
    desc: "Strategic visual identities that position your brand for long-term recognition, trust, and market leadership.",
    color: "oklch(0.65 0.22 250)",
  },
  {
    icon: Zap,
    title: "SEO & Performance",
    desc: "Lightning-fast load times, flawless Core Web Vitals, and search-engine optimization that drives measurable growth.",
    color: "oklch(0.78 0.18 180)",
  },
];

function Services() {
  return (
    <section id="services" className="relative py-32 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: "oklch(0.105 0.014 245)" }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <SectionTitle eyebrow="What We Do" title="OUR CORE SERVICES" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <SpotlightCard
                className="card-dark p-6 h-full cursor-default"
                glowColor={SERVICE_GLOW[i]}
                style={{
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
              >
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{
                      background: SERVICE_COLOR_BG[i],
                      border: `1px solid ${SERVICE_COLOR_BORDER[i]}`,
                    }}
                  >
                    <service.icon size={22} style={{ color: service.color }} />
                  </div>
                  <h3
                    className="font-display font-bold text-base mb-3"
                    style={{ color: "oklch(0.95 0.01 240)" }}
                  >
                    {service.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "oklch(0.58 0.02 240)" }}
                  >
                    {service.desc}
                  </p>
                </motion.div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Portfolio
// ─────────────────────────────────────────────────────────────────────────────
const projects = [
  {
    name: "Project Restaurant",
    category: "Web App · Branding",
    description:
      "A modern restaurant website with online menu, reservations, and a stunning visual experience.",
    image: "/assets/generated/portfolio-restaurant.dim_600x400.png",
    color: "oklch(0.62 0.25 290)",
    borderActive: "1px solid oklch(0.62 0.25 290)",
    shadowActive: "0 0 30px oklch(0.62 0.25 290 / 0.35)",
    overlayGradient:
      "linear-gradient(to top, oklch(0.62 0.25 290 / 0.4) 0%, transparent 60%)",
  },
  {
    name: "Project VÊTIR",
    category: "Clothing Brand · eCommerce",
    description:
      "A premium clothing brand site with editorial lookbooks, size guides, and a buttery-smooth shop experience.",
    image: "/assets/generated/portfolio-clothing.dim_600x400.png",
    color: "oklch(0.72 0.2 200)",
    borderActive: "1px solid oklch(0.72 0.2 200)",
    shadowActive: "0 0 30px oklch(0.72 0.2 200 / 0.35)",
    overlayGradient:
      "linear-gradient(to top, oklch(0.72 0.2 200 / 0.4) 0%, transparent 60%)",
  },
  {
    name: "Project GYM",
    category: "Fitness · Branding",
    description:
      "A bold, high-energy gym website built to convert visitors into members with cinematic visuals and seamless booking.",
    image: "/assets/generated/portfolio-gym.dim_800x600.jpg",
    color: "oklch(0.65 0.22 250)",
    borderActive: "1px solid oklch(0.65 0.22 250)",
    shadowActive: "0 0 30px oklch(0.65 0.22 250 / 0.35)",
    overlayGradient:
      "linear-gradient(to top, oklch(0.65 0.22 250 / 0.4) 0%, transparent 60%)",
  },
];

const OCID_WORK = ["work.item.1", "work.item.2", "work.item.3"];

function Portfolio() {
  const [active, setActive] = useState(0);

  return (
    <section id="work" className="relative py-32 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: "oklch(0.115 0.012 240)" }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between">
          <SectionTitle eyebrow="Our Portfolio" title="SELECT WORK" />
          <div className="flex gap-3 mb-16">
            <button
              type="button"
              data-ocid="work.pagination_prev"
              onClick={() =>
                setActive((p) => (p - 1 + projects.length) % projects.length)
              }
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                background: "oklch(0.18 0.02 240)",
                border: "1px solid oklch(0.24 0.025 240)",
                color: "oklch(0.6 0.02 240)",
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              data-ocid="work.pagination_next"
              onClick={() => setActive((p) => (p + 1) % projects.length)}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.28 290), oklch(0.72 0.2 200))",
                color: "white",
                boxShadow: "0 0 16px oklch(0.62 0.25 290 / 0.35)",
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={project.name}
              data-ocid={OCID_WORK[i]}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative rounded-2xl overflow-hidden cursor-pointer"
              style={{
                border:
                  active === i
                    ? project.borderActive
                    : "1px solid oklch(0.22 0.025 240)",
                boxShadow: active === i ? project.shadowActive : "none",
                transition: "all 0.35s ease",
              }}
              onClick={() => setActive(i)}
            >
              <img
                src={project.image}
                alt={project.name}
                className="w-full h-56 object-cover transition-transform duration-600 group-hover:scale-105"
              />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-350"
                style={{ background: project.overlayGradient }}
              />
              <div
                className="p-5"
                style={{ background: "oklch(0.13 0.015 240)" }}
              >
                <div
                  className="text-xs tracking-widest mb-1"
                  style={{ color: project.color }}
                >
                  {project.category}
                </div>
                <h3
                  className="font-display font-bold text-lg"
                  style={{ color: "oklch(0.95 0.01 240)" }}
                >
                  {project.name}
                </h3>
                <p
                  className="text-sm mt-2"
                  style={{ color: "oklch(0.58 0.02 240)" }}
                >
                  {project.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pricing  (#3 SpotlightCard applied)
// ─────────────────────────────────────────────────────────────────────────────
const plans = [
  {
    name: "ESSENTIAL",
    price: "$4,900",
    label: "Starting at",
    features: [
      "5-page custom website",
      "Mobile-responsive design",
      "Basic SEO setup",
      "2 revision rounds",
      "30-day support",
    ],
    featured: false,
  },
  {
    name: "PROFESSIONAL",
    price: "$9,500",
    label: "Starting at",
    features: [
      "12-page custom website",
      "Advanced UI/UX design",
      "Full SEO optimization",
      "eCommerce integration",
      "Unlimited revisions",
      "90-day priority support",
    ],
    featured: true,
  },
  {
    name: "ENTERPRISE",
    price: "Custom",
    label: "Tailored pricing",
    features: [
      "Unlimited pages & features",
      "Dedicated design team",
      "Custom integrations & API",
      "Performance consulting",
      "Annual retainer available",
      "24/7 dedicated support",
    ],
    featured: false,
  },
];

const OCID_PRICING = ["pricing.item.1", "pricing.item.2", "pricing.item.3"];
const OCID_PRICING_BTN = [
  "pricing.primary_button",
  "pricing.primary_button",
  "pricing.primary_button",
];

function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    projectDetails: "",
    message: "",
  });
  const { mutate, isPending, isSuccess } = useSubmitInquiry();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(form, {
      onSuccess: () => {
        toast.success("Message sent! We'll be in touch within 24 hours.");
        setForm({ name: "", email: "", projectDetails: "", message: "" });
      },
      onError: () => {
        toast.error("Something went wrong. Please try again.");
      },
    });
  };

  return (
    <SpotlightCard
      className="rounded-2xl p-8"
      glowColor="oklch(0.72 0.2 200 / 0.07)"
      style={{
        background: "oklch(0.13 0.015 240)",
        border: "1px solid oklch(0.22 0.025 240)",
      }}
    >
      <div id="contact" data-ocid="contact.panel">
        <div className="section-label mb-3">Get In Touch</div>
        <h3
          className="font-display font-extrabold uppercase tracking-tight mb-6"
          style={{ fontSize: "1.35rem", color: "oklch(0.95 0.01 240)" }}
        >
          LET&apos;S BUILD SOMETHING AMAZING
        </h3>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
              data-ocid="contact.success_state"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{
                  background: "oklch(0.55 0.25 145 / 0.2)",
                  border: "1px solid oklch(0.55 0.25 145 / 0.4)",
                }}
              >
                <Check size={28} style={{ color: "oklch(0.75 0.2 145)" }} />
              </div>
              <h4
                className="font-display font-bold text-lg mb-2"
                style={{ color: "oklch(0.95 0.01 240)" }}
              >
                Proposal Request Received!
              </h4>
              <p className="text-sm" style={{ color: "oklch(0.6 0.02 240)" }}>
                We&apos;ll review your project and reach out within 24 hours.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              <div>
                <label
                  htmlFor="form-name"
                  className="text-xs font-semibold tracking-widest mb-2 block"
                  style={{ color: "oklch(0.52 0.02 240)" }}
                >
                  YOUR NAME
                </label>
                <Input
                  id="form-name"
                  data-ocid="contact.input"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Alex Johnson"
                  required
                  style={{
                    background: "oklch(0.155 0.018 240)",
                    border: "1px solid oklch(0.25 0.025 240)",
                    color: "oklch(0.9 0.01 240)",
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="form-email"
                  className="text-xs font-semibold tracking-widest mb-2 block"
                  style={{ color: "oklch(0.52 0.02 240)" }}
                >
                  EMAIL ADDRESS
                </label>
                <Input
                  id="form-email"
                  data-ocid="contact.input"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="alex@company.com"
                  required
                  style={{
                    background: "oklch(0.155 0.018 240)",
                    border: "1px solid oklch(0.25 0.025 240)",
                    color: "oklch(0.9 0.01 240)",
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="form-project"
                  className="text-xs font-semibold tracking-widest mb-2 block"
                  style={{ color: "oklch(0.52 0.02 240)" }}
                >
                  PROJECT TYPE
                </label>
                <Input
                  id="form-project"
                  data-ocid="contact.input"
                  value={form.projectDetails}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, projectDetails: e.target.value }))
                  }
                  placeholder="e.g. eCommerce store, SaaS platform"
                  required
                  style={{
                    background: "oklch(0.155 0.018 240)",
                    border: "1px solid oklch(0.25 0.025 240)",
                    color: "oklch(0.9 0.01 240)",
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="form-message"
                  className="text-xs font-semibold tracking-widest mb-2 block"
                  style={{ color: "oklch(0.52 0.02 240)" }}
                >
                  YOUR MESSAGE
                </label>
                <Textarea
                  id="form-message"
                  data-ocid="contact.textarea"
                  value={form.message}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, message: e.target.value }))
                  }
                  placeholder="Tell us about your project goals, budget, and timeline"
                  rows={4}
                  required
                  style={{
                    background: "oklch(0.155 0.018 240)",
                    border: "1px solid oklch(0.25 0.025 240)",
                    color: "oklch(0.9 0.01 240)",
                    resize: "none",
                  }}
                />
              </div>
              <GradientButton
                type="submit"
                disabled={isPending}
                className="w-full mt-2 py-4"
                data-ocid="contact.submit_button"
              >
                {isPending ? "SENDING..." : "SEND YOUR PROPOSAL"}
              </GradientButton>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </SpotlightCard>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="relative py-32 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: "oklch(0.105 0.014 245)" }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <SectionTitle eyebrow="Investment" title="PRICING PACKAGES" />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                data-ocid={OCID_PRICING[i]}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <SpotlightCard
                  className="relative rounded-2xl p-6 h-full"
                  glowColor={
                    plan.featured
                      ? "oklch(0.62 0.25 290 / 0.12)"
                      : "oklch(0.62 0.25 290 / 0.07)"
                  }
                  style={{
                    background: plan.featured
                      ? "linear-gradient(160deg, oklch(0.17 0.03 270), oklch(0.14 0.02 240))"
                      : "oklch(0.13 0.015 240)",
                    border: plan.featured
                      ? "1px solid oklch(0.62 0.25 290 / 0.5)"
                      : "1px solid oklch(0.22 0.025 240)",
                    boxShadow: plan.featured
                      ? "0 0 48px oklch(0.62 0.25 290 / 0.12), 0 0 1px oklch(0.62 0.25 290 / 0.3)"
                      : "none",
                  }}
                >
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    {plan.featured && (
                      <div
                        className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold tracking-widest whitespace-nowrap"
                        style={{
                          background:
                            "linear-gradient(135deg, oklch(0.55 0.28 290), oklch(0.72 0.2 200))",
                          color: "white",
                          boxShadow: "0 0 14px oklch(0.62 0.25 290 / 0.5)",
                        }}
                      >
                        POPULAR
                      </div>
                    )}
                    <div
                      className="text-xs font-bold tracking-widest mb-4"
                      style={{ color: "oklch(0.62 0.25 290)" }}
                    >
                      {plan.name}
                    </div>
                    <div className="mb-6">
                      <div
                        className="text-xs"
                        style={{ color: "oklch(0.48 0.02 240)" }}
                      >
                        {plan.label}
                      </div>
                      <div
                        className="font-display font-extrabold text-3xl"
                        style={{ color: "oklch(0.95 0.01 240)" }}
                      >
                        {plan.price}
                      </div>
                    </div>
                    <ul className="flex flex-col gap-3 mb-8">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <Check
                            size={14}
                            className="mt-0.5 flex-shrink-0"
                            style={{ color: "oklch(0.72 0.2 200)" }}
                          />
                          <span
                            className="text-xs leading-relaxed"
                            style={{ color: "oklch(0.58 0.02 240)" }}
                          >
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <GradientButton
                      className="w-full text-xs py-3"
                      onClick={() =>
                        document
                          .getElementById("contact")
                          ?.scrollIntoView({ behavior: "smooth" })
                      }
                      data-ocid={OCID_PRICING_BTN[i]}
                    >
                      SELECT PLAN
                    </GradientButton>
                  </motion.div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ContactForm />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────────────────────────────────
function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer
      className="relative py-16"
      style={{
        background: "oklch(0.1 0.012 240)",
        borderTop: "1px solid oklch(0.18 0.02 240)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <NexLogo size={36} />
              <span
                className="font-display font-extrabold tracking-tight"
                style={{ color: "oklch(0.95 0.01 240)" }}
              >
                BUILDWITHNEX
              </span>
            </div>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "oklch(0.48 0.02 240)" }}
            >
              Transforming ideas into digital masterpieces. Premium web design
              for forward-thinking brands.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div
              className="text-xs font-bold tracking-widest mb-2"
              style={{ color: "oklch(0.42 0.02 240)" }}
            >
              NAVIGATION
            </div>
            {["Services", "Work", "Pricing", "Contact"].map((link) => (
              <NavLink key={link} href={`#${link.toLowerCase()}`}>
                {link}
              </NavLink>
            ))}
          </div>

          <div>
            <div
              className="text-xs font-bold tracking-widest mb-4"
              style={{ color: "oklch(0.42 0.02 240)" }}
            >
              CONNECT
            </div>
            <div className="flex gap-3">
              {[
                { icon: Twitter, label: "Twitter" },
                { icon: Linkedin, label: "LinkedIn" },
                { icon: Globe, label: "Website" },
              ].map(({ icon: Icon, label }) => (
                <SocialIcon key={label} icon={Icon} label={label} />
              ))}
            </div>
          </div>
        </div>

        <div
          className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs"
          style={{
            borderTop: "1px solid oklch(0.18 0.02 240)",
            color: "oklch(0.38 0.02 240)",
          }}
        >
          <span>&copy; {year} BUILDWITHNEX. All rights reserved.</span>
          <span>
            Built with ❤️ using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "oklch(0.62 0.2 200)" }}
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href="https://buildwithnex.com"
      aria-label={label}
      data-ocid="footer.link"
      className="w-10 h-10 rounded-xl flex items-center justify-center"
      style={{
        background: hovered ? "oklch(0.18 0.025 270)" : "oklch(0.15 0.018 240)",
        border: hovered
          ? "1px solid oklch(0.62 0.25 290 / 0.4)"
          : "1px solid oklch(0.22 0.025 240)",
        color: hovered ? "oklch(0.75 0.2 200)" : "oklch(0.52 0.02 240)",
        boxShadow: hovered ? "0 0 14px oklch(0.62 0.25 290 / 0.2)" : "none",
        transition: "all 0.25s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Icon size={16} />
    </a>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// App root
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div
      className="min-h-screen font-body"
      style={{ background: "oklch(0.115 0.012 240)" }}
    >
      <Toaster position="top-right" richColors />
      <Header />
      <main>
        <Hero />
        <Services />
        <Portfolio />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
