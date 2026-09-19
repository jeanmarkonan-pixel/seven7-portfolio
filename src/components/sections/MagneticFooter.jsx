import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ArrowUpRight, Mail, Phone, Github, Send, PartyPopper } from 'lucide-react'
import { CONTACT } from '../../data/services'
import { useLanguage } from '../../hooks/useLanguage'

/**
 * MagneticFooter — CTA magnétique géant + formulaire de contact réel.
 * Envoi via client mail pré-rempli (fallback fiable sans backend).
 */
export default function MagneticFooter() {
  const buttonRef = useRef(null)
  const wrapRef = useRef(null)
  const { lang } = useLanguage()
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  // Magnétisme du bouton CTA
  useEffect(() => {
    const wrap = wrapRef.current
    const btn = buttonRef.current
    if (!wrap || !btn) return

    const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' })
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' })

    const onMove = (e) => {
      const rect = wrap.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.hypot(dx, dy)
      const radius = Math.max(rect.width, rect.height) * 0.9
      if (dist < radius) {
        const pull = 0.35 * (1 - dist / radius)
        xTo(dx * pull)
        yTo(dy * pull)
      } else {
        xTo(0)
        yTo(0)
      }
    }

    const onLeave = () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' })
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    wrap.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      wrap.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const subject = `[SEVEN7] ${form.subject || 'Contact'} — ${form.name}`
    const body = [
      `Nom / Name : ${form.name}`,
      `Email : ${form.email}`,
      `Sujet / Subject : ${form.subject}`,
      '',
      form.message,
    ].join('\n')
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setSent(true)
    setTimeout(() => {
      setSent(false)
      setForm({ name: '', email: '', subject: '', message: '' })
    }, 5000)
  }

  const inputClass = 'w-full rounded-xl border border-titanium/10 bg-titanium/[0.03] px-4 py-3 text-sm text-titanium placeholder:text-titanium/25 outline-none backdrop-blur-sm transition-colors focus:border-accent-400/50'

  const subjects = lang === 'fr'
    ? ['Site Web / Portfolio', "Outil d'Audit Digital", 'Application Web', 'UI/UX & Prototypage', 'Vibecoding / IA', 'Maintenance & Support', 'Autre']
    : ['Website / Portfolio', 'Digital Audit Tool', 'Web Application', 'UI/UX & Prototyping', 'Vibecoding / AI', 'Maintenance & Support', 'Other']

  return (
    <footer className="relative flex min-h-screen flex-col justify-between px-6 pb-10 pt-32 md:px-16" id="contact">
      <div>
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.5em] text-accent-400/70">
          Contact
        </p>
        <h2 className="max-w-5xl font-grotesk text-[clamp(40px,9vw,120px)] font-black leading-[0.95] tracking-tight text-titanium">
          {lang === 'fr' ? 'TRAVAILLONS' : "LET'S WORK"}
          <br />
          <span className="font-serif font-medium italic text-transparent" style={{ WebkitTextStroke: '1.5px rgba(237,237,237,0.85)' }}>
            {lang === 'fr' ? 'ensemble' : 'together'}
          </span>
        </h2>
      </div>

      {/* FOOTER_MIDDLE */}
      <div className="my-16 grid items-center gap-16 lg:grid-cols-2">
        {/* CTA magnétique */}
        <div ref={wrapRef} className="flex justify-center lg:justify-start">
          <a
            ref={buttonRef}
            href={`mailto:${CONTACT.email}`}
            className="group flex h-40 w-40 items-center justify-center rounded-full border border-titanium/15 bg-titanium/[0.03] backdrop-blur-md transition-colors duration-500 hover:border-accent-400/60 hover:bg-accent-400/10 md:h-48 md:w-48"
            data-cursor-label="Go"
          >
            <span className="flex flex-col items-center gap-2 text-center">
              <ArrowUpRight className="h-6 w-6 text-accent-400 transition-transform duration-500 group-hover:rotate-45" strokeWidth={1.5} />
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-titanium/70">
                {lang === 'fr' ? 'Démarrer' : 'Start'}
              </span>
            </span>
          </a>
        </div>

        {/* Formulaire de contact */}
        {sent ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.05] p-12 text-center">
            <PartyPopper className="h-10 w-10 text-emerald-300" strokeWidth={1.5} />
            <h3 className="font-grotesk text-2xl font-extrabold text-titanium">
              {lang === 'fr' ? 'Message envoyé !' : 'Message sent!'}
            </h3>
            <p className="max-w-xs text-sm text-titanium/50">
              {lang === 'fr'
                ? 'Je vous recontacte très vite avec un devis personnalisé. Merci !'
                : "I'll get back to you very soon with a personalized quote. Thanks!"}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={lang === 'fr' ? 'Nom' : 'Name'} className={inputClass} />
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className={inputClass} />
            </div>
            <select required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={`${inputClass} appearance-none ${form.subject ? '' : 'text-titanium/25'}`}>
              <option value="" disabled className="bg-abyss">{lang === 'fr' ? 'Choisir un sujet' : 'Choose a subject'}</option>
              {subjects.map((opt) => (
                <option key={opt} value={opt} className="bg-abyss text-titanium">{opt}</option>
              ))}
            </select>
            <textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={lang === 'fr' ? 'Décrivez votre projet...' : 'Describe your project...'} className={`${inputClass} resize-none`} />
            <button type="submit" className="group flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-accent-400 to-cascade-2 px-6 py-4 font-mono text-xs font-bold uppercase tracking-[0.25em] text-abyss transition-all duration-300 hover:shadow-[0_10px_40px_rgba(251,146,60,0.3)]" data-cursor-label={lang === 'fr' ? 'Envoyer' : 'Send'}>
              <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" strokeWidth={2} />
              {lang === 'fr' ? 'Envoyer le message' : 'Send message'}
            </button>
          </form>
        )}
      </div>

      {/* Barre de contact */}
      <div className="flex flex-col gap-6 border-t border-titanium/10 pt-8 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-6">
          <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 font-mono text-xs text-titanium/50 transition-colors hover:text-accent-400">
            <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
            {CONTACT.email}
          </a>
          <a href={CONTACT.phoneHref} className="flex items-center gap-2 font-mono text-xs text-titanium/50 transition-colors hover:text-accent-400">
            <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
            {CONTACT.phone}
          </a>
          <span className="flex items-center gap-2 font-mono text-xs text-titanium/30">
            <Github className="h-3.5 w-3.5" strokeWidth={1.5} />
            {CONTACT.github}
          </span>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-titanium/30">
          © 2026 SEVEN7 — {lang === 'fr' ? 'Construit avec passion & IA' : 'Built with passion & AI'}
        </p>
      </div>
    </footer>
  )
}
