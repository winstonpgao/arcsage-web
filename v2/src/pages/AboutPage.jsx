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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1>Building Intelligent Systems for Real Estate</h1>
            <p className="about-hero__subtitle">
              We combine deep expertise in AI, data science, and enterprise automation
              to help real estate agencies qualify leads faster and smarter.
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
        initial="hidden"
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
              ArcSage was born from a simple observation: real estate agencies spend countless hours
              manually sorting through thousands of email enquiries, trying to identify which leads
              are genuinely ready to buy. Most of this work is repetitive, time-sensitive, and
              happens across multiple languages and time zones.
            </p>
            <p>
              We saw an opportunity to apply modern AI including large language models, intelligent scoring
              systems, and conversational voice agents to solve this problem at scale. Not as a
              generic chatbot, but as a purpose-built platform that understands the nuances of
              real estate: property preferences, budget signals, pre-approval status, and cultural context.
            </p>
            <p>
              Today, ArcSage is live in production, processing over 25,000 leads for Australian
              real estate agencies. Our platform handles the entire qualification pipeline,from
              initial enquiry to scored lead to personalised follow-up. In minutes, not days.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* TEAM */}
      <motion.section
        className="section about-team"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
      >
        <div className="container">
          <motion.div className="section__header" variants={fadeUp}>
            <h2>Our Team</h2>
            <p>Engineers and data scientists building at the intersection of AI and real estate</p>
          </motion.div>
          <motion.div className="team__grid" variants={stagger}>
            <motion.div className="team-card" variants={fadeUp}>
              <div className="team-card__avatar">WG</div>
              <h3>Winston Gao</h3>
              <span className="team-card__role">Co-Founder & CTO</span>
              <p>
                AI and data engineer with deep experience in enterprise AI systems, ML infrastructure,
                and automation platforms. Background spanning data analytics, cloud architecture (GCP),
                and full-stack development. Leads ArcSage's technical vision, from LLM pipeline design
                to voice AI agent development.
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
                Business strategist with extensive experience in real estate operations, client management,
                and go-to-market execution. Deep understanding of the Australian property market, multicultural
                buyer dynamics, and agency workflows. Drives ArcSage's product-market fit and customer relationships.
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
            <h3>Collective Expertise</h3>
            <div className="team__expertise-grid">
              {[
                'Applied Data Science',
                'Large Language Models (LLMs)',
                'Voice AI & Conversational AI',
                'Cloud Infrastructure (GCP)',
                'Enterprise Automation',
                'Real Estate Domain Knowledge',
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
        initial="hidden"
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
                desc: 'We push boundaries with cutting-edge AI while keeping solutions practical and production-ready.',
              },
              {
                icon: <Heart size={28} />,
                title: 'Human-Centric',
                desc: 'Technology should amplify human capability, not replace it. We build tools that make agents better at their jobs.',
              },
              {
                icon: <Eye size={28} />,
                title: 'Clarity',
                desc: 'We turn complex data into clear, actionable insights. No black boxes, every score is explainable.',
              },
              {
                icon: <Shield size={28} />,
                title: 'Trust & Privacy',
                desc: 'Australian data residency, transparent AI, and ethical practices. We handle your data with the care it deserves.',
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
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
      >
        <div className="container">
          <motion.div className="final-cta__content" variants={fadeUp}>
            <h2>Want to See ArcSage in Action?</h2>
            <p>We'd love to walk you through the platform and discuss how it fits your agency.</p>
            <Link to="/contact" className="btn btn--primary btn--lg">
              Get in Touch <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </>
  )
}
