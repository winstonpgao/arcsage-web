import { Link } from 'react-router-dom'
import {
  ArrowRight, BarChart3, Building2, CheckCircle2, ClipboardList,
  Globe2, Mail, MapPin, MessageSquare, Route, UserRoundCheck,
} from 'lucide-react'

const steps = [
  { icon: Mail, title: 'Bring enquiries together', text: 'Start with enquiry emails or agreed intake channels. Confirm how enquiries reach your team and which sources belong in the workflow.' },
  { icon: ClipboardList, title: 'Understand the buyer', text: 'Organise the information a buyer has actually provided: budget, preferred locations, timing and questions. Missing details become follow-up questions.' },
  { icon: MessageSquare, title: 'Plan the next conversation', text: 'Discuss English and Chinese responses, inspection enquiries and follow-up rules. Choose which messages need review and which can be automated.' },
  { icon: UserRoundCheck, title: 'Hand over with context', text: 'Agree how your agents receive the enquiry, the buyer’s stated requirements and the next action. Keep human judgement in the sales conversation.' },
]

const questions = [
  { title: 'Property and location', text: 'Which listing, area or property type is the buyer asking about?' },
  { title: 'Budget and requirements', text: 'What budget and requirements has the buyer stated, and what still needs clarification?' },
  { title: 'Timing and readiness', text: 'When do they plan to buy or inspect? Treat finance information as self-reported until verified.' },
  { title: 'Language and next step', text: 'Would English or Chinese be more useful? What response or agent follow-up would move the enquiry forward?' },
]

const faqs = [
  { question: 'What is AI lead qualification for real estate?', answer: 'It uses AI to organise property enquiries, extract stated buyer requirements and help prioritise the next action against criteria your agency defines. A qualification score supports an agent’s judgement; it does not predict a sale or verify a buyer’s finances.' },
  { question: 'Can we discuss English and Chinese enquiries?', answer: 'Yes. English and Chinese communication is part of ArcSage’s advertised focus. We can discuss your terminology, response style, review process and the situations that should go straight to an agent.' },
  { question: 'Can it work with our existing enquiry sources?', answer: 'Start by sharing your enquiry sources and the systems your agents use. Enquiry emails from property portals and direct contacts are relevant use cases. The proposal should confirm the actual connection method, permissions and supported scope; a native integration should be checked individually.' },
  { question: 'How is pricing determined?', answer: 'Request a scoped quote based on enquiry volume, channels, languages, required connections and the amount of ongoing support. Ask for setup, recurring service and any usage charges to be shown separately.' },
  { question: 'What should we measure?', answer: 'Agree a baseline for response time, enquiries with complete information, agent review time and useful next steps. Track qualified conversations and inspection outcomes alongside those measures, with clear definitions and human review.' },
  { question: 'Where is ArcSage based?', answer: 'ArcSage is based in Melbourne, Australia. Contact winston@arcsage.com.au to discuss your agency’s enquiry workflow and the scope of a demonstration.' },
]

export default function LeadQualificationPage() {
  return (
    <article className="geo-page" lang="en">
      <section className="geo-hero">
        <div className="container">
          <div className="geo-topline">
            <span className="geo-eyebrow"><Building2 size={16} aria-hidden="true" /> For Australian real estate agencies</span>
            <nav className="geo-language" aria-label="Page language">
              <span aria-current="page">English</span>
              <Link to="/zh/real-estate-ai-lead-qualification" lang="zh-Hans" hrefLang="zh-Hans">中文</Link>
            </nav>
          </div>
          <div className="geo-hero__grid">
            <div className="geo-hero__copy">
              <h1>AI lead qualification.<br /><span>A clearer next step for every enquiry.</span></h1>
              <p className="geo-lead">Bring buyer requirements, follow-up and agent handover into one considered workflow. Discuss how ArcSage can fit the way your real estate team handles enquiries.</p>
              <div className="geo-actions">
                <Link to="/contact" className="btn btn--primary btn--lg">Discuss your workflow <ArrowRight size={18} aria-hidden="true" /></Link>
                <a href="#qualification-workflow" className="btn btn--outline btn--lg">Explore the approach</a>
              </div>
              <p className="geo-location"><MapPin size={16} aria-hidden="true" /> Melbourne, Australia <span aria-hidden="true">·</span> English &amp; Chinese</p>
            </div>
            <aside className="geo-flow-card" aria-label="Lead qualification workflow overview">
              <div className="geo-flow-card__heading"><Route size={20} aria-hidden="true" /><span>From enquiry to conversation</span></div>
              <ol className="geo-flow-card__steps">
                {steps.map(({ icon: Icon, title }, index) => (
                  <li key={title}><span className="geo-flow-card__icon"><Icon size={20} aria-hidden="true" /></span><div><small>Step {index + 1}</small><strong>{title}</strong></div><CheckCircle2 size={17} aria-hidden="true" className="geo-flow-card__check" /></li>
                ))}
              </ol>
              <p className="geo-flow-card__note">Your proposal confirms the channels, connections and automation rules before rollout.</p>
            </aside>
          </div>
        </div>
      </section>

      <section className="geo-section" aria-labelledby="buyer-context-title">
        <div className="container">
          <div className="geo-section__intro"><span className="geo-eyebrow">Know what matters</span><h2 id="buyer-context-title">A useful qualification asks the right questions.</h2><p>Give agents a clear view of the buyer’s stated needs. Keep the information that is known separate from the details that still need a conversation.</p></div>
          <div className="geo-card-grid geo-card-grid--four">
            {questions.map(({ title, text }, index) => <section className="geo-info-card" key={title}><span className="geo-card-number">0{index + 1}</span><h3>{title}</h3><p>{text}</p></section>)}
          </div>
        </div>
      </section>

      <section className="geo-section geo-section--soft" id="qualification-workflow" aria-labelledby="workflow-title">
        <div className="container">
          <div className="geo-section__intro"><span className="geo-eyebrow">A workflow shaped around your agency</span><h2 id="workflow-title">Connect the enquiry to the next action.</h2><p>Begin with a specific process your team wants to improve. Agree the scope, review points and handover before expanding it.</p></div>
          <ol className="geo-workflow">
            {steps.map(({ icon: Icon, title, text }, index) => <li key={title}><div className="geo-workflow__marker"><Icon size={24} aria-hidden="true" /><span>0{index + 1}</span></div><h3>{title}</h3><p>{text}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="geo-section" aria-labelledby="use-cases-title">
        <div className="container geo-split">
          <div className="geo-section__intro"><span className="geo-eyebrow">Where to start</span><h2 id="use-cases-title">Choose the conversation your team knows best.</h2><p>A focused scope makes it easier to check information quality and decide whether the workflow is useful to your agents.</p><Link to="/guides/real-estate-ai-lead-qualification" className="geo-text-link">Read the agency buyer’s guide <ArrowRight size={17} aria-hidden="true" /></Link></div>
          <div className="geo-use-cases">
            <section><Building2 size={22} aria-hidden="true" /><div><h3>Buyer enquiries</h3><p>Organise listing interest, requirements and questions so an agent can prepare a relevant follow-up.</p></div></section>
            <section><Globe2 size={22} aria-hidden="true" /><div><h3>English and Chinese communication</h3><p>Discuss how language preference, property terminology and agent review should work together.</p></div></section>
            <section><BarChart3 size={22} aria-hidden="true" /><div><h3>Follow-up and team handover</h3><p>Define enquiry ownership, next actions and the measures your team will use to judge improvement.</p></div></section>
          </div>
        </div>
      </section>

      <section className="geo-section geo-section--dark" aria-labelledby="platform-title">
        <div className="container">
          <div className="geo-section__intro"><span className="geo-eyebrow">See the platform</span><h2 id="platform-title">Discuss the workflow with a concrete view.</h2><p>Explore the dashboard and how your agreed enquiry process could be represented. A demonstration can help your team identify the details that matter.</p></div>
          <figure className="geo-platform"><img src="/screenshots/dashboard.png" alt="ArcSage dashboard showing agent templates and workspace navigation" width="1440" height="900" loading="lazy" /><figcaption>ArcSage platform overview. Configuration depends on the agreed scope.</figcaption></figure>
        </div>
      </section>

      <section className="geo-section" aria-labelledby="faq-title">
        <div className="container"><div className="geo-section__intro"><span className="geo-eyebrow">Before you decide</span><h2 id="faq-title">Questions from real estate teams.</h2></div><div className="geo-faq-grid">{faqs.map(({ question, answer }) => <section className="geo-faq" key={question}><h3>{question}</h3><p>{answer}</p></section>)}</div></div>
      </section>

      <section className="geo-cta" aria-labelledby="next-step-title">
        <div className="container geo-cta__inner"><div><span className="geo-eyebrow">Start with your agency</span><h2 id="next-step-title">Show us where your enquiries need a better next step.</h2><p>Share your enquiry sources, languages and current process. We’ll discuss the scope that makes sense for your team.</p></div><div className="geo-cta__actions"><Link to="/contact" className="btn btn--primary btn--lg">Discuss a demonstration <ArrowRight size={18} aria-hidden="true" /></Link><a href="mailto:winston@arcsage.com.au">winston@arcsage.com.au</a></div></div>
      </section>
    </article>
  )
}
