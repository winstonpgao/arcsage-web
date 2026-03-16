import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Mail, Brain, BarChart3, Clock, Users, Zap,
  ArrowRight, CheckCircle2, Globe, Shield, MessageSquare,
  Phone, TrendingUp, Target, Bot, Sparkles
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
}

function Section({ children, className = '', id }) {
  return (
    <motion.section
      id={id}
      className={`section ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={stagger}
    >
      <div className="container">{children}</div>
    </motion.section>
  )
}

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container">
          <motion.div
            className="hero__content"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="hero__badge">
              <Sparkles size={14} />
              <span>Live with clients in production</span>
            </div>
            <h1>AI-Powered Lead Qualification for Real Estate</h1>
            <p className="hero__subtitle">
              ArcSage automates lead intake, intelligent scoring, personalised follow-up,
              and multilingual communication, so your agents focus on closing deals, not chasing leads.
            </p>
            <div className="hero__ctas">
              <Link to="/contact" className="btn btn--primary btn--lg">
                Start Qualifying Leads <ArrowRight size={18} />
              </Link>
              <a href="#how-it-works" className="btn btn--outline btn--lg">
                See How It Works
              </a>
            </div>
          </motion.div>
          <motion.div
            className="hero__visual"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="hero__mockup">
              <div className="hero__mockup-header">
                <div className="hero__dot hero__dot--red" />
                <div className="hero__dot hero__dot--yellow" />
                <div className="hero__dot hero__dot--green" />
                <span>ArcSage Dashboard</span>
              </div>
              <div className="hero__mockup-body">
                <div className="hero__stat-row">
                  <StatCard label="Leads Processed" value="25,000+" icon={<Users size={20} />} color="blue" />
                  <StatCard label="Qualified" value="26" icon={<Target size={20} />} color="green" />
                  <StatCard label="Response Time" value="< 30s" icon={<Clock size={20} />} color="purple" />
                  <StatCard label="Coverage" value="24/7" icon={<Globe size={20} />} color="orange" />
                </div>
                <div className="hero__preview-row">
                  <div className="hero__email-preview">
                    <div className="hero__email-from">
                      <Mail size={14} /> john.buyer@email.com
                    </div>
                    <div className="hero__email-subject">RE: 42 Oak Street, Glen Waverley</div>
                    <div className="hero__email-body">
                      Hi, I'm interested in inspecting this property. My budget is around $1.2M and I'm pre-approved...
                    </div>
                  </div>
                  <div className="hero__score-preview">
                    <div className="hero__score-header">
                      <Brain size={16} /> AI Qualification Score
                    </div>
                    <div className="hero__score-value">
                      <span className="hero__score-number">82</span>
                      <span className="hero__score-max">/100</span>
                    </div>
                    <div className="hero__score-badge hero__score-badge--qualified">Qualified Lead</div>
                    <div className="hero__score-dimensions">
                      <ScoreDim label="Budget" value={90} />
                      <ScoreDim label="Timeline" value={75} />
                      <ScoreDim label="Location" value={85} />
                      <ScoreDim label="Pre-approval" value={95} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* METRICS BAR */}
      <Section className="metrics">
        <motion.div className="metrics__grid" variants={stagger}>
          {[
            { value: '25,000+', label: 'Leads processed', icon: <Users size={24} /> },
            { value: '24/7', label: 'Automated coverage', icon: <Clock size={24} /> },
            { value: '< 30s', label: 'Average response time', icon: <Zap size={24} /> },
            { value: '11', label: 'Scoring dimensions', icon: <BarChart3 size={24} /> },
          ].map((m, i) => (
            <motion.div key={i} className="metric-card" variants={fadeUp}>
              <div className="metric-card__icon">{m.icon}</div>
              <div className="metric-card__value">{m.value}</div>
              <div className="metric-card__label">{m.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* HOW IT WORKS */}
      <Section className="how-it-works" id="how-it-works">
        <motion.div className="section__header" variants={fadeUp}>
          <h2>How It Works</h2>
          <p>From inbox to qualified lead in minutes, not hours</p>
        </motion.div>
        <motion.div className="steps" variants={stagger}>
          {[
            {
              step: '01',
              icon: <Mail size={28} />,
              title: 'Lead Arrives',
              desc: 'Enquiries from portals (REA, Domain) and direct emails are automatically captured and deduplicated across your entire database.',
              color: 'blue'
            },
            {
              step: '02',
              icon: <Brain size={28} />,
              title: 'AI Analyses & Scores',
              desc: 'Our LLM engine reads the enquiry, extracts intent, budget, timeline, and scores across 11 qualification dimensions with a 100-point rubric.',
              color: 'purple'
            },
            {
              step: '03',
              icon: <MessageSquare size={28} />,
              title: 'Personalised Reply',
              desc: 'AI drafts and sends a contextual, personalised reply in English or Chinese within minutes. No templates, every response is unique.',
              color: 'green'
            },
            {
              step: '04',
              icon: <TrendingUp size={28} />,
              title: 'Smart Follow-Up',
              desc: 'Automated follow-up sequences nurture leads over time. Scores update dynamically as new information arrives. Qualified leads are flagged immediately.',
              color: 'orange'
            },
          ].map((s, i) => (
            <motion.div key={i} className={`step step--${s.color}`} variants={fadeUp}>
              <div className="step__number">{s.step}</div>
              <div className="step__icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* FEATURES */}
      <Section className="features">
        <motion.div className="section__header" variants={fadeUp}>
          <h2>Built for Real Estate Teams</h2>
          <p>Every feature designed around how agencies actually work</p>
        </motion.div>
        <motion.div className="features__grid" variants={stagger}>
          {[
            {
              icon: <Brain size={24} />,
              title: 'Intelligent Lead Scoring',
              desc: '11-dimension rubric with 100-point scale. Budget, timeline, location preference, pre-approval status, and more, all extracted and scored automatically.',
            },
            {
              icon: <Globe size={24} />,
              title: 'Bilingual Communication',
              desc: 'Native English and Chinese support. AI detects language automatically and responds in kind, critical for multicultural markets.',
            },
            {
              icon: <Bot size={24} />,
              title: 'Voice AI Agents',
              desc: 'Conversational voice agents for property inspections, follow-ups, and lead qualification calls. Built with Australian data residency.',
            },
            {
              icon: <Shield size={24} />,
              title: 'Australian Data Residency',
              desc: 'All data processed and stored in Australia (GCP Melbourne region). Full compliance with Australian privacy regulations.',
            },
            {
              icon: <Zap size={24} />,
              title: 'Automated Follow-Up',
              desc: 'Multi-stage follow-up sequences that adapt based on lead behaviour. No lead falls through the cracks.',
            },
            {
              icon: <BarChart3 size={24} />,
              title: 'Analytics & Reporting',
              desc: 'Real-time dashboards showing lead pipeline, qualification rates, response metrics, and agent performance.',
            },
          ].map((f, i) => (
            <motion.div key={i} className="feature-card" variants={fadeUp}>
              <div className="feature-card__icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* PLATFORM SCREENSHOTS */}
      <Section className="screenshots" id="platform">
        <motion.div className="section__header" variants={fadeUp}>
          <h2>The Platform</h2>
          <p>A comprehensive suite for lead qualification and voice AI</p>
        </motion.div>
        <motion.div className="screenshots__grid" variants={stagger}>
          {[
            { title: 'Dashboard', desc: 'At-a-glance metrics, recent agents, and quick actions', file: 'dashboard.png' },
            { title: 'Visual Flow Builder', desc: 'Drag-and-drop conversation flows with 33+ node types for lead qualification', file: 'flow-editor-booking.png' },
            { title: 'Agent Builder', desc: 'Create agents from templates: lead qualification, inspection booking, and more', file: 'agents.png' },
            { title: 'Analytics', desc: 'Call volume, success rates, duration trends, and latency tracking', file: 'analytics.png' },
            { title: 'Calendar', desc: 'Integrated scheduling for inspections, follow-ups, and team coordination', file: 'calendar.png' },
            { title: 'Billing & Pricing', desc: 'Transparent usage-based pricing with real-time cost tracking', file: 'billing.png' },
          ].map((s, i) => (
            <motion.div key={i} className="screenshot-card" variants={fadeUp}>
              <div className="screenshot-card__img">
                <img
                  src={`/screenshots/${s.file}`}
                  alt={s.title}
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.parentElement.classList.add('screenshot-card__img--placeholder')
                  }}
                />
                <div className="screenshot-card__placeholder-text">Screenshot: {s.title}</div>
              </div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* TECH STACK / TRUST */}
      <Section className="trust">
        <motion.div className="section__header" variants={fadeUp}>
          <h2>Enterprise-Grade Infrastructure</h2>
          <p>Built on trusted cloud platforms with security-first architecture</p>
        </motion.div>
        <motion.div className="trust__grid" variants={stagger}>
          {[
            { label: 'Google Cloud Platform', sub: 'Melbourne Region (australia-southeast1)' },
            { label: 'Vertex AI (Gemini)', sub: 'LLM processing in Australia' },
            { label: 'Australian Data Residency', sub: 'All data stays in AU' },
            { label: 'Microsoft 365 Integration', sub: 'Email via Microsoft Graph API' },
            { label: 'PostgreSQL', sub: 'Structured data with JSONB' },
            { label: 'Multi-LLM Architecture', sub: 'Google, OpenAI, Anthropic' },
          ].map((t, i) => (
            <motion.div key={i} className="trust-card" variants={fadeUp}>
              <CheckCircle2 size={20} className="trust-card__check" />
              <div>
                <strong>{t.label}</strong>
                <span>{t.sub}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* USE CASES */}
      <Section className="use-cases">
        <motion.div className="section__header" variants={fadeUp}>
          <h2>Built for Real Estate</h2>
          <p>Serving agencies across buyer acquisition, property management, and multi-office operations</p>
        </motion.div>
        <motion.div className="use-cases__grid" variants={stagger}>
          {[
            {
              icon: <Target size={28} />,
              title: 'Buyer Lead Qualification',
              desc: 'Automatically score and qualify buyer enquiries from REA, Domain, and direct email. AI extracts budget, timeline, location preferences, and pre-approval status.',
            },
            {
              icon: <Phone size={28} />,
              title: 'Voice AI for Inspections',
              desc: 'Conversational AI agents handle inspection bookings, follow-up calls, and lead qualification over the phone. Australian voices, Australian data residency.',
            },
            {
              icon: <Users size={28} />,
              title: 'Multi-Office Operations',
              desc: 'Route leads to the right agent across multiple branches. Track performance per office, per agent, per campaign.',
            },
          ].map((u, i) => (
            <motion.div key={i} className="use-case-card" variants={fadeUp}>
              <div className="use-case-card__icon">{u.icon}</div>
              <h3>{u.title}</h3>
              <p>{u.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* FINAL CTA */}
      <Section className="final-cta">
        <motion.div className="final-cta__content" variants={fadeUp}>
          <h2>Ready to Qualify Leads While You Sleep?</h2>
          <p>Join agencies already using ArcSage to automate lead qualification and never miss a qualified buyer again.</p>
          <div className="hero__ctas">
            <Link to="/contact" className="btn btn--primary btn--lg">
              Get Started <ArrowRight size={18} />
            </Link>
            <Link to="/about" className="btn btn--outline btn--lg">
              Learn About Our Team
            </Link>
          </div>
        </motion.div>
      </Section>
    </>
  )
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className={`hero__stat hero__stat--${color}`}>
      {icon}
      <div className="hero__stat-value">{value}</div>
      <div className="hero__stat-label">{label}</div>
    </div>
  )
}

function ScoreDim({ label, value }) {
  return (
    <div className="hero__score-dim">
      <div className="hero__score-dim-label">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="hero__score-dim-bar">
        <div className="hero__score-dim-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
