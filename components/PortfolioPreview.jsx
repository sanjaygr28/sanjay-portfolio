'use client'
import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Github, Linkedin, Mail, Phone, MapPin, Send, ChevronUp } from "lucide-react";

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
  // Replace this with your Formspree endpoint: https://formspree.io/f/XXXXXX
  const USE_FORMSPREE = true;
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xvgvzbpv';

  // ---------- REST OF STATE ----------
  const [tab, setTab] = useState('All');
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const containerRef = useRef(null);

  // contact form state
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

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
          // Formspree returns helpful messages in JSON
          const errMsg = data?.error || (data?.errors && data.errors.map(x=>x.message).join(', ')) || 'Submission failed';
          setSubmitResult({ ok: false, msg: errMsg });
        }
      } else {
        // fallback (not used here) — POST to /api/contact
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
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/8 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold">SG</div>
            <div>
              <div className="text-lg font-bold">SANJAY G R</div>
              <div className="text-xs opacity-90">Data Science</div>
            </div>
          </div>

          <nav className="flex items-center gap-3 sm:gap-4">
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
        </div>
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

          <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
            {filtered.map(p=>(
              <motion.article
                key={p.id}
                whileHover={{ scale: isTouchDevice ? 1.0 : 1.02 }}
                className="group relative bg-white/10 p-4 sm:p-5 rounded-2xl shadow-lg backdrop-blur-md overflow-hidden"
                role="article"
                aria-labelledby={`project-title-${p.id}`}
              >
                {/* Image area */}
                <div className="rounded-lg mb-3 overflow-hidden relative h-44 sm:h-48 md:h-52">
                  <img
                    src={p.img}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onClick={() => handleImageTap(p)}
                    style={{ cursor: 'pointer', touchAction: 'manipulation' }}
                  />

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
                      {isTouchDevice && (
                        <div className="mt-2 text-xs opacity-80">Tap again to open</div>
                      )}
                    </div>
                  </div>
                </div>

                <h3 id={`project-title-${p.id}`} className="font-bold text-base sm:text-lg mb-1">{p.title}</h3>
                <p className="text-xs sm:text-sm opacity-80 mb-3 leading-snug">{p.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{p.tech}</span>
                  <button
                    onClick={() => openProject(p)}
                    className="text-xs sm:text-sm px-3 py-1 rounded-full bg-white/10"
                    aria-label={`Quick view ${p.title}`}
                  >
                    View Details
                  </button>
                </div>
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
