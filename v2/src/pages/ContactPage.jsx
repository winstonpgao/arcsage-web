import { useEffect } from 'react'
import { Mail, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useExperiment } from '../experiments/ExperimentProvider'

export default function ContactPage() {
 const experiment = useExperiment()
 useEffect(() => {
  if (!experiment.ready || !experiment.active) return
  const record = () => { if (!document.hidden) void experiment.track('exposure', '/contact') }
  record(); document.addEventListener('visibilitychange', record)
  return () => document.removeEventListener('visibilitychange', record)
 }, [experiment.ready, experiment.active, experiment.variant])
 const label = experiment.variant === 'B' ? 'Discuss lead qualification' : 'Email us'
 return (
  <section className="contact-page" data-experiment-id="arcsage-contact-cta-v1" data-ab-variant={experiment.variant} data-experiment-ready={experiment.ready}>
   <div className="container">
    <div className="contact-page__header"><h1>Get in Touch</h1><p>Tell us how your agency handles buyer enquiries and what you want to improve.</p></div>
    <div className="contact-page__grid">
     <div className="contact-page__info">
      <div className="contact-info-card"><Mail size={24} /><div><h3>Email</h3><a href="mailto:winston@arcsage.com.au">winston@arcsage.com.au</a></div></div>
      <div className="contact-info-card"><MapPin size={24} /><div><h3>Location</h3><p>Melbourne, VIC, Australia</p></div></div>
     </div>
     <div className="contact-page__form-wrap contact-discussion">
      <span className="geo-eyebrow">Start a conversation</span><h2>Bring your workflow.<br />Explore the fit.</h2>
      <p>Share your enquiry sources, qualification criteria, languages and human review needs. Ask us about current scope, integrations and pricing.</p>
      <ul>{['Your team and enquiry volume','The qualification decisions you want to support','Existing tools and required handoff'].map(text => <li key={text}><CheckCircle2 size={18} />{text}</li>)}</ul>
      <a className="btn btn--primary btn--lg btn--full" data-testid="contact-cta" href="mailto:winston@arcsage.com.au?subject=ArcSage%20lead%20qualification%20enquiry" onClick={() => { if (experiment.active) void experiment.track('contact_intent', '/contact') }}><Mail size={19} />{label}<ArrowRight size={18} /></a>
      <p className="contact-discussion__note">Opens your email application. Your message is sent from there.</p>
     </div>
    </div>
   </div>
  </section>
 )
}
