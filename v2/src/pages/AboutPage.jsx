import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MapPin, Calendar, ArrowRight, Lightbulb, Heart, Eye, Shield } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } }
}

export default function AboutPage() {
  return (
    <>
      {/* HERO */}
      <section className="about-hero">
        <div className="container">
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1>Building Intelligent Systems for Real Estate</h1>
            <p className="about-hero__subtitle">
              We focus on AI, data and automation for property enquiry workflows,
              with English and Chinese communication and clear agent handover.
            </p>
            <div className="about-hero__meta">
              <span><Calendar size={16} /> Founded 2025</span>
              <span><MapPin size={16} /> Melbourne, Australia</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* OUR STORY */}
      <motion.section
        className="section about-story"
        initial={false}
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
      >
        <div className="container">
          <motion.div className="section__header" variants={fadeUp}>
            <h2>Our Story</h2>
          </motion.div>
          <motion.div className="about-story__content" variants={fadeUp}>
            <p>
              A property enquiry can contain a preferred area, a budget, a question about an inspection
              or only a few details. ArcSage's focus is helping real estate teams connect that information
              to a useful next conversation, including when buyers prefer English or Chinese.
            </p>
            <p>
              Our approach starts with the agency's process: where enquiries arrive, which buyer
              requirements matter, who reviews a response and how the next action reaches an agent.
              AI can help organise stated information; missing details need follow-up, and finance
              information remains self-reported until verified.
            </p>
            <p>
              A focused demonstration and scoped proposal help turn those requirements into an
              implementation plan. We discuss the supported connections, languages, review points
              and data requirements with your team, then agree how a workflow would be evaluated.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* TEAM */}
      <motion.section
        className="section about-team"
        initial={false}
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
      >
        <div className="container">
          <motion.div className="section__header" variants={fadeUp}>
            <h2>Our Team</h2>
            <p>Technical and business perspectives on your agency's enquiry workflow</p>
          </motion.div>
          <motion.div className="team__grid" variants={stagger}>
            <motion.div className="team-card" variants={fadeUp}>
              <div className="team-card__avatar">WG</div>
              <h3>Winston Gao</h3>
              <span className="team-card__role">Co-Founder & CTO</span>
              <p>
                Leads ArcSage's technical planning, with a focus on AI and data workflows,
                system connections and application development. Works on translating enquiry
                requirements into a proposed architecture and review process.
              </p>
              <div className="team-card__skills">
                <span>AI/ML Engineering</span>
                <span>Cloud Architecture</span>
                <span>Data Science</span>
                <span>Full-Stack Dev</span>
              </div>
            </motion.div>
            <motion.div className="team-card" variants={fadeUp}>
              <div className="team-card__avatar">IW</div>
              <h3>Iris Wang</h3>
              <span className="team-card__role">Co-Founder & CEO</span>
              <p>
                Leads ArcSage's business direction, with a focus on agency workflows,
                buyer communication and client requirements. Brings the business perspective
                to discussions about the proposed service scope and next steps.
              </p>
              <div className="team-card__skills">
                <span>Business Strategy</span>
                <span>Real Estate</span>
                <span>Client Relations</span>
                <span>Market Analysis</span>
              </div>
            </motion.div>
          </motion.div>
          <motion.div className="team__collective" variants={fadeUp}>
            <h3>Areas of Focus</h3>
            <div className="team__expertise-grid">
              {[
                'Applied Data Science',
                'Large Language Models (LLMs)',
                'Voice AI & Conversational AI',
                'Cloud Infrastructure (GCP)',
                'Enterprise Automation',
                'Real Estate Workflows',
                'Multilingual NLP (EN/ZH)',
                'Data Warehouse Design',
              ].map((skill, i) => (
                <div key={i} className="expertise-tag">{skill}</div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* VALUES */}
      <motion.section
        className="section about-values"
        initial={false}
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
      >
        <div className="container">
          <motion.div className="section__header" variants={fadeUp}>
            <h2>Our Values</h2>
          </motion.div>
          <motion.div className="values__grid" variants={stagger}>
            {[
              {
                icon: <Lightbulb size={28} />,
                title: 'Innovation',
                desc: 'Start with a practical agency problem, explore a focused AI workflow and evaluate it against agreed criteria.',
              },
              {
                icon: <Heart size={28} />,
                title: 'Human-Centric',
                desc: 'Keep agents involved in review and buyer conversations, with useful context and clear responsibility for the next action.',
              },
              {
                icon: <Eye size={28} />,
                title: 'Clarity',
                desc: 'Agree qualification criteria and show the information behind a proposed next action. Keep unknown details separate from stated facts.',
              },
              {
                icon: <Shield size={28} />,
                title: 'Trust & Privacy',
                desc: 'Confirm data flow, hosting, access and retention for the proposed configuration, with review points defined before rollout.',
              },
            ].map((v, i) => (
              <motion.div key={i} className="value-card" variants={fadeUp}>
                <div className="value-card__icon">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section
        className="section final-cta"
        initial={false}
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
      >
        <div className="container">
          <motion.div className="final-cta__content" variants={fadeUp}>
            <h2>Explore a Workflow for Your Agency</h2>
            <p>Discuss your enquiry process, the scope of a demonstration and the requirements that matter to your team.</p>
            <Link to="/contact" className="btn btn--primary btn--lg">
              Get in Touch <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </>
  )
}
