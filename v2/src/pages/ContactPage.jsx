import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section className="contact-page">
      <div className="container">
        <motion.div
          className="contact-page__header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Get in Touch</h1>
          <p>Whether you're ready to start or just exploring,we'd love to hear from you.</p>
        </motion.div>

        <div className="contact-page__grid">
          <motion.div
            className="contact-page__info"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div className="contact-info-card" variants={fadeUp}>
              <Mail size={24} />
              <div>
                <h3>Email</h3>
                <a href="mailto:winston@arcsage.com.au">winston@arcsage.com.au</a>
              </div>
            </motion.div>
            <motion.div className="contact-info-card" variants={fadeUp}>
              <MapPin size={24} />
              <div>
                <h3>Location</h3>
                <p>Melbourne, VIC, Australia</p>
                <p className="contact-info-card__sub">Available worldwide</p>
              </div>
            </motion.div>
            <motion.div className="contact-info-card" variants={fadeUp}>
              <Clock size={24} />
              <div>
                <h3>Response Time</h3>
                <p>We typically reply within 24 hours</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="contact-page__form-wrap"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {submitted ? (
              <div className="contact-page__success">
                <CheckCircle2 size={48} />
                <h3>Message Sent</h3>
                <p>Thank you for reaching out. We'll get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="contact-form__row">
                  <div className="contact-form__field">
                    <label htmlFor="name">Name</label>
                    <input type="text" id="name" name="name" required placeholder="Your name" />
                  </div>
                  <div className="contact-form__field">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" required placeholder="you@company.com" />
                  </div>
                </div>
                <div className="contact-form__field">
                  <label htmlFor="company">Company</label>
                  <input type="text" id="company" name="company" placeholder="Your company name" />
                </div>
                <div className="contact-form__field">
                  <label htmlFor="message">Message</label>
                  <textarea id="message" name="message" rows="5" required placeholder="Tell us about your needs..." />
                </div>
                <button type="submit" className="btn btn--primary btn--lg btn--full">
                  <Send size={18} /> Send Message
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
