import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Mail, Brain, BarChart3, Users, Zap,
  ArrowRight, CheckCircle2, Globe, Shield, MessageSquare,
  Phone, TrendingUp, Target, Sparkles
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
      initial={false}
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
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="hero__badge">
              <Sparkles size={14} />
              <span>Melbourne · English &amp; Chinese enquiries</span>
            </div>
            <h1>AI-Powered Lead Qualification for Real Estate</h1>
            <p className="hero__subtitle">
              Bring buyer requirements, follow-up and agent handover into a clear workflow.
              Discuss an AI approach shaped around your enquiry sources, languages and agency criteria.
            </p>
            <div className="hero__ctas">
              <Link to="/contact" className="btn btn--primary btn--lg">
                Discuss Your Workflow <ArrowRight size={18} />
              </Link>
              <a href="#how-it-works" className="btn btn--outline btn--lg">
                See How It Works
              </a>
            </div>
          </motion.div>
          <motion.div
            className="hero__visual"
            initial={false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="hero__mockup">
              <div className="hero__mockup-header">
                <div className="hero__dot hero__dot--red" />
                <div className="hero__dot hero__dot--yellow" />
                <div className="hero__dot hero__dot--green" />
                <span>Example enquiry workflow</span>
              </div>
              <div className="hero__mockup-body">
                <div className="hero__stat-row">
                  <StatCard label="Intake source" value="Email" icon={<Mail size={20} />} color="blue" />
                  <StatCard label="Buyer needs" value="Budget" icon={<Target size={20} />} color="green" />
                  <StatCard label="Next action" value="Review" icon={<Users size={20} />} color="purple" />
                  <StatCard label="Language scope" value="EN/ZH" icon={<Globe size={20} />} color="orange" />
                </div>
                <div className="hero__preview-row">
                  <div className="hero__email-preview">
                    <div className="hero__email-from">
                      <Mail size={14} /> Example buyer enquiry
                    </div>
                    <div className="hero__email-subject">Property inspection enquiry</div>
                    <div className="hero__email-body">
                      I'm looking around Glen Waverley with a budget of $1.2M. Is an inspection available next week?
                    </div>
                  </div>
                  <div className="hero__score-preview">
                    <div className="hero__score-header">
                      <Brain size={16} /> Qualification checklist
                    </div>
                    <div className="hero__score-value">
                      <span className="hero__score-number">Review</span>
                    </div>
                    <div className="hero__score-badge hero__score-badge--qualified">Buyer-stated details</div>
                    <div className="hero__score-dimensions">
                      <QualificationDetail label="Budget" value="Stated" />
                      <QualificationDetail label="Location" value="Stated" />
                      <QualificationDetail label="Buying timeline" value="Ask" />
                      <QualificationDetail label="Finance status" value="Unknown" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* WORKFLOW OVERVIEW */}
      <Section className="metrics">
        <motion.div className="metrics__grid" variants={stagger}>
          {[
            { value: 'Intake', label: 'Agree your enquiry sources', icon: <Mail size={24} /> },
            { value: 'Criteria', label: 'Define what matters to agents', icon: <Target size={24} /> },
            { value: 'EN/ZH', label: 'Discuss language and review', icon: <Globe size={24} /> },
            { value: 'Handover', label: 'Set ownership and next actions', icon: <Users size={24} /> },
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
          <h2>Shape Your Qualification Workflow</h2>
          <p>Connect the enquiry, buyer context and next action around your agency's process</p>
        </motion.div>
        <motion.div className="steps" variants={stagger}>
          {[
            {
              step: '01',
              icon: <Mail size={28} />,
              title: 'Agree the Intake',
              desc: 'Start with your enquiry emails and property-portal sources. Confirm the connection method, access and which enquiries belong in the workflow.',
              color: 'blue'
            },
            {
              step: '02',
              icon: <Brain size={28} />,
              title: 'Define Buyer Criteria',
              desc: 'Organise stated budget, location, timing and questions against criteria your agency defines. Keep missing details visible for agent follow-up.',
              color: 'purple'
            },
            {
              step: '03',
              icon: <MessageSquare size={28} />,
              title: 'Plan the Conversation',
              desc: 'Discuss English and Chinese responses, property terminology and review points. Agree which messages need approval and where automation is appropriate.',
              color: 'green'
            },
            {
              step: '04',
              icon: <TrendingUp size={28} />,
              title: 'Set the Next Action',
              desc: 'Define follow-up timing, enquiry ownership and escalation to an agent. Choose clear measures to evaluate whether the workflow helps your team.',
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
          <p>Start with the requirements that make a qualification useful to your agents</p>
        </motion.div>
        <motion.div className="features__grid" variants={stagger}>
          {[
            {
              icon: <Brain size={24} />,
              title: 'Agency-Defined Criteria',
              desc: 'Discuss budget, timing, location and buying requirements. Any scoring approach should show its criteria and support an agent’s judgement.',
            },
            {
              icon: <Globe size={24} />,
              title: 'Bilingual Communication',
              desc: 'English and Chinese enquiries are part of our focus. Agree terminology, language preferences and a review process for your team’s responses.',
            },
            {
              icon: <Users size={24} />,
              title: 'Agent Handover',
              desc: 'Plan how agents receive the buyer’s stated requirements, unanswered questions and next action, with clear ownership of each enquiry.',
            },
            {
              icon: <Shield size={24} />,
              title: 'Data & Access Requirements',
              desc: 'Include hosting location, providers, access and retention in the proposal. Confirm the complete data flow for your chosen configuration before rollout.',
            },
            {
              icon: <Zap size={24} />,
              title: 'Follow-Up Rules',
              desc: 'Define when to follow up, when to stop and when to bring in an agent. Review the supported channels and automation scope in your proposal.',
            },
            {
              icon: <BarChart3 size={24} />,
              title: 'Analytics & Reporting',
              desc: 'Agree a baseline and useful measures, such as information completeness, review time and qualified conversations. Define what each measure means before evaluating results.',
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
          <h2>Explore the Platform</h2>
          <p>Use these interface views to discuss your workflow; configuration is confirmed in your proposal</p>
        </motion.div>
        <motion.div className="screenshots__grid" variants={stagger}>
          {[
            { title: 'Dashboard', desc: 'A workspace overview for discussing agents, templates and navigation', file: 'dashboard.png' },
            { title: 'Visual Flow Builder', desc: 'A conversation-flow view for planning steps and handover points', file: 'flow-editor-booking.png' },
            { title: 'Agent Builder', desc: 'An agent and template view to explore your proposed qualification workflow', file: 'agents.png' },
            { title: 'Notifications', desc: 'A notification view to discuss which events should reach your team', file: 'notifications.png' },
            { title: 'Calendar', desc: 'A calendar view for discussing inspection and follow-up requirements', file: 'calendar.png' },
            { title: 'Billing', desc: 'A billing interface overview; request a quote for your agreed scope and usage', file: 'billing.png' },
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

      {/* IMPLEMENTATION SCOPE */}
      <Section className="trust">
        <motion.div className="section__header" variants={fadeUp}>
          <h2>Agree the Details Before Rollout</h2>
          <p>A scoped proposal connects the workflow to your systems, review rules and data requirements</p>
        </motion.div>
        <motion.div className="trust__grid" variants={stagger}>
          {[
            { label: 'Enquiry Sources', sub: 'Channels and connection methods' },
            { label: 'Qualification Criteria', sub: 'Buyer-stated facts and missing details' },
            { label: 'Language & Review', sub: 'English, Chinese and approval points' },
            { label: 'System Connections', sub: 'Supported scope and required access' },
            { label: 'Hosting & Data Flow', sub: 'Location, providers and retention' },
            { label: 'Evaluation Measures', sub: 'Baseline, definitions and review period' },
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
          <p>Choose a focused enquiry process and confirm the scope with your team</p>
        </motion.div>
        <motion.div className="use-cases__grid" variants={stagger}>
          {[
            {
              icon: <Target size={28} />,
              title: 'Buyer Lead Qualification',
              desc: 'Start with buyer enquiries and organise stated budget, location, timing and questions. Portal emails and direct contacts are use cases to assess individually.',
            },
            {
              icon: <Phone size={28} />,
              title: 'Inspection Enquiry Follow-Up',
              desc: 'Discuss how inspection questions reach the right agent and what information a reply needs. Any phone or scheduling connection requires an agreed scope.',
            },
            {
              icon: <Users size={28} />,
              title: 'Multi-Office Operations',
              desc: 'Agree enquiry ownership across agents or offices, handover details and escalation rules. Check the required system connections before implementation.',
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
          <h2>Give Your Enquiries a Clear Next Step</h2>
          <p>Share your enquiry sources, languages and current process. We'll discuss a qualification workflow and a demonstration suited to your agency.</p>
          <div className="hero__ctas">
            <Link to="/contact" className="btn btn--primary btn--lg">
              Discuss a Demonstration <ArrowRight size={18} />
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

function QualificationDetail({ label, value }) {
  return (
    <div className="hero__score-dim">
      <div className="hero__score-dim-label">
        <span>{label}</span>
        <span>{value}</span>
      </div>
    </div>
  )
}
