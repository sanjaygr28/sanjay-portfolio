'use client'
import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Github, Linkedin, Mail, Phone, MapPin, Send, ChevronUp, Menu, X } from "lucide-react";

export default function PortfolioPreview() {
  // ---------- THEME (persisted) ----------
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
      if (stored === 'dark') {
        setDarkMode(true);
        document.documentElement.classList.add('dark');
      } else if (stored === 'light') {
        setDarkMode(false);
        document.documentElement.classList.remove('dark');
      } else {
        const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(prefersDark);
        if (prefersDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    } catch (e) {}
  }, [darkMode]);

  // ---------- FORMSPREE CONFIG ----------
  const USE_FORMSPREE = true;
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xvgvzbpv';

  // ---------- REST OF STATE ----------
  const [tab, setTab] = useState('All');
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const containerRef = useRef(null);

  // mobile menu
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobilePanelRef = useRef(null);

  // contact form state
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  // ---------- VANTA refs ----------
  const globeRef = useRef(null);         // DOM node for the globe (has the classes your snippet used)
  const vantaInstanceRef = useRef(null); // hold VANTA instance so we can destroy
  const scriptsLoadedRef = useRef(false);
  const editPageUnsubRef = useRef(null);

  const projects = [
    { id: 1, title: 'Pre-owned Car Showroom Management', tag: 'Web Dev', desc: 'Web system for managing used car listings, customer inquiries, and purchase records.', tech: 'HTML, CSS, PHP, MySQL', img: '/projects/car_showroom.jpg', link: '/projects/1' },
    { id: 2, title: 'Predict Star Type', tag: 'ML', desc: 'Classifies stars using features like temperature, luminosity; uses KNN and Random Forest.', tech: 'Python, scikit-learn', img: '/projects/predict_star.jpg', link: '/projects/2' },
    { id: 3, title: 'Jarvis Automated Desktop', tag: 'Python App', desc: 'Voice-driven assistant automating desktop tasks (open apps, control system, fetch info).', tech: 'Python, SpeechRecognition, PyQT5', img: '/projects/Jarvis.jpg', link: '/projects/3' },
    { id: 4, title: 'AI-Powered Medical Diagnosis', tag: 'DL', desc: 'Flask web app predicting brain tumor, lung cancer, and fractures using CNN models.', tech: 'Python, TensorFlow, Flask', img: '/projects/medical_ai.png', link: '/projects/4' },
    { id: 5, title: 'Predicting Employee Attrition', tag: 'ML', desc: 'Model predicting employee turnover using feature engineering and scikit-learn.', tech: 'Python, scikit-learn, Pandas', img: '/projects/Employee_attrition.jpg', link: '/projects/5' }
  ];

  const tabs = ['All','ML','DL','Power BI','Web Dev','Python App'];
  const filtered = useMemo(()=> tab==='All'? projects : projects.filter(p=>p.tag===tab), [tab]);

  const openProject = (p) => {
    if (p.link) {
      window.open(p.link, '_blank');
    } else {
      window.open(p.img, '_blank');
    }
  };

  useEffect(() => {
    const touch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0);
    setIsTouchDevice(!!touch);
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        setActiveProjectId(null);
      }
    };
    const onScroll = () => setActiveProjectId(null);

    document.addEventListener('click', onDocClick);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      document.removeEventListener('click', onDocClick);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // close mobile menu when clicking outside or on link
  useEffect(() => {
    const onDocClick = (e) => {
      if (!mobileOpen) return;
      if (mobilePanelRef.current && !mobilePanelRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [mobileOpen]);

  // lock body scroll when menu open
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const original = document.body.style.overflow;
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = original || '';
    }
    return () => { document.body.style.overflow = original || ''; };
  }, [mobileOpen]);

  const handleImageTap = (p) => {
    if (!isTouchDevice) {
      openProject(p);
      return;
    }

    if (activeProjectId === p.id) {
      openProject(p);
      setActiveProjectId(null);
    } else {
      setActiveProjectId(p.id);
    }
  };

  // ---------- FORM SUBMIT HANDLER (Formspree) ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    const honeypot = form.website?.value || ''; // honeypot field

    // client validation
    if (!name || !email || !message) {
      setSubmitResult({ ok: false, msg: 'Please fill all fields.' });
      return;
    }
    if (honeypot) {
      // bot — silently ignore
      return;
    }

    setSubmitting(true);
    setSubmitResult(null);

    try {
      if (USE_FORMSPREE) {
        const res = await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message })
        });

        const data = await res.json();
        if (res.ok) {
          setSubmitResult({ ok: true, msg: 'Message sent — I will reply within 24 hours.' });
          form.reset();
        } else {
          const errMsg = data?.error || (data?.errors && data.errors.map(x=>x.message).join(', ')) || 'Submission failed';
          setSubmitResult({ ok: false, msg: errMsg });
        }
      } else {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message })
        });
        const data = await res.json();
        if (res.ok) {
          setSubmitResult({ ok: true, msg: data?.message || 'Message sent.' });
          form.reset();
        } else {
          setSubmitResult({ ok: false, msg: data?.error || 'Submission failed.' });
        }
      }
    } catch (err) {
      console.error('Contact form error:', err);
      setSubmitResult({ ok: false, msg: 'Network error. Try again later.' });
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- VANTA / three.js loader + init (uses your exact behaviour) ----------
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const THREE_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js';
    const VANTA_SRC = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js';

    const ensureScript = (src) => new Promise((resolve, reject) => {
      // if script already present, resolve immediately (or after load)
      const existing = Array.from(document.getElementsByTagName('script')).find(s => s.src && s.src.indexOf(src) !== -1);
      if (existing) {
        if (existing.getAttribute('data-loaded') === 'true') {
          resolve();
          return;
        }
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', (e) => reject(e));
        return;
      }
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => { s.setAttribute('data-loaded','true'); resolve(); };
      s.onerror = (e) => reject(e);
      document.head.appendChild(s);
    });

    let subscribed = false;

    const setVanta = () => {
      try {
        if (!window.VANTA) return;
        // ensure we destroy any previous instance
        if (vantaInstanceRef.current) {
          try { vantaInstanceRef.current.destroy(); } catch (e) {}
          vantaInstanceRef.current = null;
        }

        // find element by classes (to match your snippet's selector)
        const el = globeRef.current || document.querySelector('.s-page-1 .s-section-1 .s-section');
        if (!el) return;

        // init VANTA globe (same options you provided)
        vantaInstanceRef.current = window.VANTA.GLOBE({
          el,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00
        });

        // subscribe to window.edit_page.Event if available (Strikingly behaviour)
        if (window.edit_page && window.edit_page.Event && typeof window.edit_page.Event.subscribe === 'function') {
          try {
            // call subscribe and store returned token/unsub if provided
            const unsub = window.edit_page.Event.subscribe("Page.beforeNewOneFadeIn", setVanta);
            editPageUnsubRef.current = unsub;
            subscribed = true;
          } catch (e) {
            // ignore
          }
        }
      } catch (e) {
        // non-fatal
        // console.warn('Vanta init failed', e);
      }
    };

    (async () => {
      try {
        if (!scriptsLoadedRef.current) {
          await ensureScript(THREE_SRC);
          await ensureScript(VANTA_SRC);
          scriptsLoadedRef.current = true;
        }
        setVanta();
      } catch (e) {
        // loading failed — silently continue without background
        // console.warn('Failed to load Vanta scripts', e);
      }
    })();

    return () => {
      // cleanup on unmount
      try {
        if (vantaInstanceRef.current) {
          try { vantaInstanceRef.current.destroy(); } catch (e) {}
          vantaInstanceRef.current = null;
        }
        // if subscribe returned an unsubscribe function, try calling it
        if (subscribed && window.edit_page && window.edit_page.Event && typeof window.edit_page.Event.unsubscribe === 'function') {
          try {
            window.edit_page.Event.unsubscribe("Page.beforeNewOneFadeIn", editPageUnsubRef.current);
          } catch (e) {}
        } else if (editPageUnsubRef.current && typeof editPageUnsubRef.current === 'function') {
          try { editPageUnsubRef.current(); } catch (e) {}
        }
      } catch (e) {}
    };
  }, []); // run once on client

  // ---------- ROOT CLASS (theme) ----------
  const rootClass = `min-h-screen bg-aurora relative ${darkMode ? 'theme-dark text-white' : 'text-gray-100'}`;

  return (
    <div className={rootClass}>
      <style>{`
        .bg-aurora {
          background: linear-gradient(-45deg,#0f0c29 0%,#302b63 45%,#24243e 100%);
          background-size:400% 400%;
          animation: auroraMove 12s ease infinite;
        }
        @keyframes auroraMove {
          0%{background-position:0% 50%}
          50%{background-position:100% 50%}
          100%{background-position:0% 50%}
        }
        .theme-dark .bg-aurora {
          background: linear-gradient(180deg, #07070a 0%, #0b1220 60%, #071021 100%);
          background-size: auto;
          animation: none;
        }
        .theme-dark .bg-white\\/10 { background-color: rgba(255,255,255,0.03) !important; }
        .theme-dark .bg-white\\/5 { background-color: rgba(255,255,255,0.02) !important; }
        .theme-dark .text-gray-100 { color: #E6EEF8 !important; }
        .theme-dark a { color: #9FC5FF; }
        .theme-dark .shadow-lg { box-shadow: 0 6px 18px rgba(0,0,0,0.6); }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/8 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold">SG</div>
            <div>
              <div className="text-lg font-bold">SANJAY G R</div>
              <div className="text-xs opacity-90">Data Science</div>
            </div>
          </div>

          {/* Desktop nav (hidden on small screens) */}
          <nav className="hidden sm:flex items-center gap-3 sm:gap-4">
            <a href="#projects" className="text-sm hover:underline">Projects</a>
            <a href="#experience" className="text-sm hover:underline">Experience</a>
            <a href="#contact" className="text-sm hover:underline">Contact</a>

            <button
              onClick={() => setDarkMode(prev => !prev)}
              className={`p-2 rounded-full ${darkMode ? 'bg-yellow-400/10 hover:bg-yellow-400/20' : 'bg-white/10 hover:bg-white/20'}`}
              aria-label="Toggle theme"
              aria-pressed={darkMode}
              title={darkMode ? 'Switch to light' : 'Switch to dark'}
            >
              {darkMode ? <Sun size={16}/> : <Moon size={16}/>}
            </button>
          </nav>

          {/* Right side: desktop buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="#projects"
              className="px-4 py-2 rounded-full bg-white text-blue-700 font-semibold hover:opacity-95"
            >
              View Projects
            </a>
            <a
              href="/Sanjay_G_R_CV.pdf"
              download="Sanjay_G_R_CV.pdf"
              className="px-4 py-2 rounded-full border border-white/30 hover:bg-white/5"
              title="Download CV (PDF)"
            >
              Download CV
            </a>
          </div>

          {/* Mobile: hamburger */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(prev => !prev)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile panel (slide-down) */}
        <motion.div
          id="mobile-menu"
          ref={mobilePanelRef}
          initial={false}
          animate={mobileOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.22 }}
          className={`sm:hidden overflow-hidden bg-[#2b2547] border-t border-white/5`}
        >
          <div className="px-4 pt-4 pb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-bold">SG</div>
                <div>
                  <div className="font-semibold">SANJAY</div>
                  <div className="text-xs opacity-80">Data Science</div>
                </div>
              </div>

              <button
                onClick={() => { setDarkMode(prev => !prev); }}
                className={`p-2 rounded-full ${darkMode ? 'bg-yellow-400/10' : 'bg-white/10'}`}
                aria-label="Toggle theme"
                title={darkMode ? 'Switch to light' : 'Switch to dark'}
              >
                {darkMode ? <Sun size={16}/> : <Moon size={16}/>}
              </button>
            </div>

            <nav className="flex flex-col gap-2">
              <a onClick={() => setMobileOpen(false)} href="#projects" className="py-3 px-3 rounded-md hover:bg-white/5">Projects</a>
              <a onClick={() => setMobileOpen(false)} href="#experience" className="py-3 px-3 rounded-md hover:bg-white/5">Experience</a>
              <a onClick={() => setMobileOpen(false)} href="#contact" className="py-3 px-3 rounded-md hover:bg-white/5">Contact</a>
            </nav>

            <div className="mt-4 flex flex-col gap-2">
              <a onClick={() => setMobileOpen(false)} href="#projects" className="py-2 px-3 rounded-full bg-white text-blue-700 font-semibold text-center">View Projects</a>
              <a onClick={() => setMobileOpen(false)} href="/Sanjay_G_R_CV.pdf" download="Sanjay_G_R_CV.pdf" className="py-2 px-3 rounded-full border border-white/20 text-center">Download CV</a>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="flex gap-3">
                <a href="https://linkedin.com/in/sanjay-gr-807599316" className="p-2 bg-white/10 rounded-xl hover:bg-white/20 text-white transition"><Linkedin size={18} /></a>
                <a href="https://github.com/sanjaygr28" className="p-2 bg-white/10 rounded-xl hover:bg-white/20 text-white transition"><Github size={18} /></a>
              </div>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-6 pt-10">
        {/* Hero */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
          <motion.div initial={{ x:-30, opacity:0 }} animate={{ x:0, opacity:1 }} transition={{ duration:0.55 }}>
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-2 h-10 bg-gradient-to-b from-white/60 to-white/10 rounded-full"></div>
              <div className="text-sm uppercase opacity-90">Hi, I build ML & AI solutions</div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-3">
              SANJAY G R
              <br />
              <span className="text-xl sm:text-2xl font-medium opacity-90">Data Science</span>
            </h1>

            <p className="text-sm sm:text-base max-w-xl opacity-90 mb-5">I design and deploy data-driven systems — from exploratory analysis to production-ready ML models.</p>

            <div className="flex gap-3">
              <a
                href="#projects"
                className="px-5 py-2 rounded-full bg-white text-blue-700 font-semibold hover:opacity-95"
              >
              View Projects
              </a>
              <a
                href="/Sanjay_G_R_CV.pdf"
                download="Sanjay_G_R_CV.pdf"
                className="px-5 py-2 rounded-full border border-white/30 hover:bg-white/5"
              title="Download CV (PDF)"
              >
                Download CV
              </a>
            </div>
          </motion.div>

          <motion.div initial={{ x:30, opacity:0 }} animate={{ x:0, opacity:1 }} transition={{ duration:0.55 }} className="flex justify-center md:justify-end mt-4 md:mt-0">
            <div className="w-44 h-44 sm:w-56 sm:h-56 md:w-72 md:h-72 rounded-2xl bg-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
              <img src="/profile.png" alt="profile" className="w-full h-full object-cover" />
            </div>
          </motion.div>
        </section>

        {/* Vanta globe container (placed near top so it can act as a background/hero)
            NOTE: className matches your original selector: ".s-page-1 .s-section-1 .s-section"
        */}
        <div
          ref={globeRef}
          className="s-page-1 s-section-1 s-section pointer-events-none fixed inset-0 -z-10"
          aria-hidden="true"
        />

        {/* Projects */}
        <section id="projects" className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold">Featured Projects</h2>
            <div className="flex gap-2 items-center overflow-auto">
              {tabs.map(t=>(
                <button
                  key={t}
                  onClick={()=>{ setTab(t); setActiveProjectId(null); }}
                  className={`text-xs sm:text-sm px-3 py-1 rounded-full ${tab===t? 'bg-white text-blue-700 font-semibold' : 'bg-white/10'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Container: mobile = horizontal snap carousel, sm+ = grid */}
          <div
            ref={containerRef}
            className={`mt-5
              flex gap-4 px-4 sm:px-0 overflow-x-auto snap-x snap-mandatory
              sm:grid sm:grid-cols-1 sm:gap-5 sm:overflow-visible sm:snap-none
              md:grid-cols-2 lg:grid-cols-3`}
            aria-label="Featured projects list"
          >
            {filtered.map(p=>(
              <motion.article
                key={p.id}
                whileHover={{ scale: isTouchDevice ? 1.0 : 1.02 }}
                className={`
                  group relative bg-white/10 p-4 rounded-2xl shadow-lg backdrop-blur-md overflow-hidden
                  snap-start min-w-[82%] sm:min-w-0 sm:w-auto
                `}
                style={{ WebkitOverflowScrolling: 'touch' }}
                role="article"
                aria-labelledby={`project-title-${p.id}`}
              >
                {/* Image area */}
                <div className="rounded-lg mb-3 overflow-hidden relative h-56 sm:h-48 md:h-52">
                  <img
                    src={p.img}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onClick={() => handleImageTap(p)}
                    style={{ cursor: 'pointer', touchAction: 'manipulation' }}
                  />

                  {/* Overlay for hover/active - still there on desktop, but mobile will have visible CTA below */}
                  <div
                    className={
                      `absolute inset-0 bg-black/50 transition-opacity duration-250 flex items-center justify-center
                      ${ (activeProjectId === p.id) ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
                      group-hover:opacity-100 group-hover:pointer-events-auto`
                    }
                    aria-hidden="true"
                  >
                    <div className="text-center px-3">
                      <div className="mb-2 text-xs sm:text-sm font-medium bg-white/10 px-3 py-1 rounded-full inline-block">{p.tag}</div>
                      <div className="mt-2">
                        <button
                          onClick={() => openProject(p)}
                          className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-4 py-2 rounded-full shadow-md hover:opacity-95 transition"
                          aria-label={`View project ${p.title}`}
                        >
                          View Project
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <h3 id={`project-title-${p.id}`} className="font-bold text-base sm:text-lg mb-1">{p.title}</h3>
                <p className="text-xs sm:text-sm opacity-80 mb-3 leading-snug">{p.desc}</p>

                {/* Tags + actions area */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    {/* tags row - horizontally scrollable if too many */}
                    <div className="flex gap-2 overflow-x-auto py-1">
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full shrink-0">{p.tech}</span>
                      <span className="text-xs bg-white/10 px-2 py-1 rounded-full shrink-0">{p.tag}</span>
                    </div>
                  </div>

                  {/* CTA - always visible on mobile (so users don't need to tap overlay twice) */}
                  <div className="shrink-0">
                    <button
                      onClick={() => openProject(p)}
                      className="text-xs sm:text-sm px-3 py-1 rounded-full bg-white/10"
                      aria-label={`Open ${p.title}`}
                    >
                      View
                    </button>
                  </div>
                </div>

                {/* small hint for touch devices */}
                {isTouchDevice && (
                  <div className="mt-3 text-xs opacity-70">Swipe to browse • Tap image or View to open</div>
                )}
              </motion.article>
            ))}
          </div>
        </section>

        {/* Experience */}
        <section id="experience" className="mt-12">
          <h2 className="text-2xl font-bold">Experience</h2>
          <div className="mt-6 border-l border-white/10 pl-6">
            <div className="mb-6">
              <div className="text-sm font-semibold">Varcons Tech Pvt Ltd <span className="text-xs opacity-80">• Jan 2025 – May 2025</span></div>
              <div className="text-sm opacity-80">Data Science Intern — Feature engineering, model building, data cleaning.</div>
            </div>
            <div className="mb-6">
              <div className="text-sm font-semibold">Karunadu Technologies <span className="text-xs opacity-80">• Oct 2024 – Nov 2024</span></div>
              <div className="text-sm opacity-80">Python Development Intern — PyQT5 applications, scripting.</div>
            </div>
            <div className="mb-6">
              <div className="text-sm font-semibold">Karunadu Technologies <span className="text-xs opacity-80">• Oct 2023 – Nov 2023</span></div>
              <div className="text-sm opacity-80">ML & Data Science Intern — Django, PowerBI exposure.</div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="mt-16 py-12 sm:py-16 bg-gradient-to-r from-purple-600/40 to-blue-500/40 rounded-2xl backdrop-blur-md text-white">
          <div className="max-w-6xl mx-auto px-2 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">Get in Touch</h2>
              <p className="text-sm sm:text-base mb-6 opacity-90">I'm always excited to discuss new opportunities and challenging data problems. Whether you need a one-time analysis or ongoing data science support, I'm here to help.</p>

              <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl shadow-sm">
                  <div className="p-2 bg-white/20 text-white rounded-xl"><Mail size={20} /></div>
                  <div>
                    <p className="text-sm opacity-80">Email</p>
                    <p className="font-semibold text-white">sanjaygr28@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl shadow-sm">
                  <div className="p-2 bg-white/20 text-white rounded-xl"><Phone size={20} /></div>
                  <div>
                    <p className="text-sm opacity-80">Phone</p>
                    <p className="font-semibold text-white">+91 98455 71631</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl shadow-sm">
                  <div className="p-2 bg-white/20 text-white rounded-xl"><MapPin size={20} /></div>
                  <div>
                    <p className="text-sm opacity-80">Location</p>
                    <p className="font-semibold text-white">Bengaluru, India</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Follow Me</h3>
                <div className="flex gap-3">
                  <a href="https://linkedin.com/in/sanjay-gr-807599316" className="p-3 bg-white/10 rounded-xl hover:bg-white/20 text-white transition"><Linkedin size={18} /></a>
                  <a href="https://github.com/sanjaygr28" className="p-3 bg-white/10 rounded-xl hover:bg-white/20 text-white transition"><Github size={18} /></a>
                </div>
              </div>
            </div>

            {/* Form: uses handleSubmit */}
            <div className="bg-white/10 p-6 sm:p-8 rounded-2xl shadow-md">
              <h3 className="text-xl sm:text-2xl font-semibold mb-2">Send a Message</h3>
              <p className="text-sm mb-4 sm:mb-6 opacity-80">Fill out the form below and I'll get back to you within 24 hours.</p>

              <form className="flex flex-col gap-3" onSubmit={handleSubmit} aria-label="Contact form">
                {/* HONEYPOT (bots will fill this): name it 'website' and hide it */}
                <input type="text" name="website" autoComplete="off" tabIndex="-1" style={{display:'none'}} />

                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input name="name" type="text" placeholder="Your full name" className="w-full border border-white/20 rounded-lg px-3 py-2 bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input name="email" type="email" placeholder="your.email@example.com" className="w-full border border-white/20 rounded-lg px-3 py-2 bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <textarea name="message" rows="5" placeholder="Tell me about your project or data science needs..." className="w-full border border-white/20 rounded-lg px-3 py-2 bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white" required />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold py-3 rounded-lg shadow-md hover:opacity-90 transition disabled:opacity-50"
                    aria-disabled={submitting}
                  >
                    {submitting ? 'Sending...' : 'Send Message'} <Send size={16} />
                  </button>

                  {submitResult && (
                    <div className={`text-sm ${submitResult.ok ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {submitResult.msg}
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-10 py-6 border-t border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
            <div className="text-sm">© {new Date().getFullYear()} SANJAY G R</div>
            <div className="flex items-center gap-4">
              <a href="https://github.com/sanjaygr28">GitHub</a>
              <a href="https://linkedin.com/in/sanjay-gr-807599316">LinkedIn</a>
            </div>
          </div>
        </footer>

        {/* Back to top */}
        <button onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} className="fixed right-5 bottom-6 p-3 rounded-full bg-white/10 shadow-lg" aria-label="Back to top">
          <ChevronUp />
        </button>
      </main>
    </div>
  );
}
