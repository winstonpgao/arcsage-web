import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, CheckCircle2, ClipboardList, MapPin, MessageSquare, Scale, Users } from 'lucide-react'

const criteria = [
  { title: 'Enquiry sources', question: 'Where do your enquiries come from?', detail: 'List the mailboxes, portal emails, website forms and other channels in scope. Confirm the actual connection method and which information will reach the workflow.' },
  { title: 'Qualification criteria', question: 'What makes an enquiry ready for an agent?', detail: 'Define the useful fields and priorities together. A missing budget should remain unknown. Finance readiness should remain self-reported until your team verifies it.' },
  { title: 'Conversation boundaries', question: 'Which conversations should a person handle?', detail: 'Agree review-before-send rules, escalation cases and how unanswered questions are handed over. Include changes to property information and unusual buyer requests.' },
  { title: 'Languages and terminology', question: 'How will English and Chinese responses be reviewed?', detail: 'Check local property terminology and examples from your own enquiries. Test the substance of each response as well as its language and tone.' },
  { title: 'Agent handover', question: 'Can an agent see the original context?', detail: 'Ask to see the enquiry, the stated requirements, a record of follow-up and the next action. Confirm ownership and where your team will work.' },
  { title: 'Information and access', question: 'What information is used, and who can access it?', detail: 'Ask for the proposed data flow, access arrangements, retention and hosting location for your configuration. Confirm these details for the actual services selected.' },
]

const quoteItems = [
  'Enquiry volumes, channels and operating hours',
  'Languages and the response review process',
  'Required system connections and handover points',
  'Setup, recurring service and usage charges',
  'Training, support and change requests',
  'Rollout scope and acceptance criteria',
]

const measures = [
  { title: 'Information quality', text: 'Are extracted requirements accurate? Are missing details clearly marked? Review a representative set of real enquiries.' },
  { title: 'Team effort', text: 'Measure agent review time and repeated manual steps before and after. Include the time spent checking or correcting responses.' },
  { title: 'Conversation progress', text: 'Track useful follow-ups, qualified conversations and inspection outcomes with definitions your team agrees in advance.' },
]

export default function BuyerGuidePage() {
  return (
    <article className="geo-page geo-guide" lang="en">
      <section className="geo-hero geo-hero--guide">
        <div className="container">
          <div className="geo-topline"><span className="geo-eyebrow"><BookOpen size={16} aria-hidden="true" /> The agency buyer’s guide</span><Link to="/real-estate-ai-lead-qualification" className="geo-text-link">Explore ArcSage <ArrowRight size={16} aria-hidden="true" /></Link></div>
          <div className="geo-guide__hero-copy"><h1>How to choose AI lead qualification for your real estate agency.</h1><p className="geo-lead">Start with the enquiry process, the decisions your agents make and the evidence you need. Use this guide to compare a proposed workflow and request a clear scope.</p><div className="geo-actions"><Link to="/contact" className="btn btn--primary btn--lg">Discuss your agency’s scope <ArrowRight size={18} aria-hidden="true" /></Link><a href="#buying-checklist" className="btn btn--outline btn--lg">View the checklist</a></div><p className="geo-location"><MapPin size={16} aria-hidden="true" /> ArcSage · Melbourne, Australia</p></div>
          <nav className="geo-guide__contents" aria-label="In this guide"><a href="#fit">Find the right fit</a><a href="#buying-checklist">Compare proposals</a><a href="#measure">Measure usefulness</a><a href="#quote">Request a quote</a></nav>
        </div>
      </section>

      <section className="geo-section" id="fit" aria-labelledby="fit-title">
        <div className="container"><div className="geo-section__intro"><span className="geo-eyebrow">01 · Find the right fit</span><h2 id="fit-title">Choose the process before the technology.</h2><p>Lead qualification is the work of understanding an enquiry and deciding its next step. Different parts of that process may call for different approaches.</p></div>
          <div className="geo-card-grid">
            <section className="geo-info-card"><span className="geo-icon-tile"><Users size={24} aria-hidden="true" /></span><h3>Agent-led review</h3><p>Useful when enquiry volumes are manageable or a conversation needs judgement. Keep the source information clear and the handover simple.</p></section>
            <section className="geo-info-card"><span className="geo-icon-tile"><ClipboardList size={24} aria-hidden="true" /></span><h3>Rules and forms</h3><p>Useful for predictable fields and routing. Agreed rules can direct an enquiry to a team or flag a missing detail without interpreting a conversation.</p></section>
            <section className="geo-info-card"><span className="geo-icon-tile"><MessageSquare size={24} aria-hidden="true" /></span><h3>AI-assisted qualification</h3><p>Worth exploring when enquiries arrive as varied free text or in different languages. Confirm information quality, review controls and how exceptions reach an agent.</p></section>
          </div>
          <div className="geo-guide__callout"><Scale size={26} aria-hidden="true" /><div><h3>A score is a prioritisation aid.</h3><p>Use it against your agency’s defined criteria. Verify important buyer statements through your normal process and keep the final sales judgement with your agents.</p></div></div>
        </div>
      </section>

      <section className="geo-section geo-section--soft" id="buying-checklist" aria-labelledby="checklist-title">
        <div className="container"><div className="geo-section__intro"><span className="geo-eyebrow">02 · Compare proposals</span><h2 id="checklist-title">Ask to see how the details will work.</h2><p>These six areas turn a broad promise into a workflow your agency can assess.</p></div><div className="geo-card-grid geo-card-grid--two">{criteria.map(({ title, question, detail }, index) => <section className="geo-guide-card" key={title}><div className="geo-guide-card__label"><span>0{index + 1}</span>{title}</div><h3>{question}</h3><p>{detail}</p></section>)}</div></div>
      </section>

      <section className="geo-section" id="measure" aria-labelledby="measure-title">
        <div className="container"><div className="geo-section__intro"><span className="geo-eyebrow">03 · Measure usefulness</span><h2 id="measure-title">Agree what improvement means before rollout.</h2><p>Record how the team works today. Then review the new workflow using the same definitions and a comparable set of enquiries.</p></div><div className="geo-card-grid">{measures.map(({ title, text }) => <section className="geo-info-card" key={title}><CheckCircle2 size={26} aria-hidden="true" className="geo-check" /><h3>{title}</h3><p>{text}</p></section>)}</div><p className="geo-guide__footnote">An increase in activity is one observation. Consider information quality, agent effort and business outcomes together, and account for changes in enquiry sources or property campaigns.</p></div>
      </section>

      <section className="geo-section geo-section--soft" id="quote" aria-labelledby="quote-title">
        <div className="container geo-split"><div className="geo-section__intro"><span className="geo-eyebrow">04 · Request a quote</span><h2 id="quote-title">Make the scope and ongoing costs clear.</h2><p>A useful quote explains what will be connected, what will be automated and what support is included. Pricing should follow the work your agency actually needs.</p><p className="geo-guide__paragraph">Share your enquiry sources, approximate volume, languages and the steps your agents take today. Ask for a demonstration around a relevant workflow and a proposal covering the items opposite.</p></div><ul className="geo-quote-list">{quoteItems.map(item => <li key={item}><CheckCircle2 size={20} aria-hidden="true" /><span>{item}</span></li>)}</ul></div>
      </section>

      <section className="geo-section" aria-labelledby="arcsage-scope-title"><div className="container geo-guide__closing"><span className="geo-eyebrow">About ArcSage</span><h2 id="arcsage-scope-title">A focus on property enquiries and bilingual communication.</h2><p>ArcSage is based in Melbourne. Its advertised focus is real-estate lead intake, qualification, follow-up and English/Chinese communication. Discuss the supported channels, connections and review arrangements for your agency.</p><div className="geo-actions"><Link to="/real-estate-ai-lead-qualification" className="geo-text-link">Explore the service <ArrowRight size={17} aria-hidden="true" /></Link><Link to="/zh/real-estate-ai-lead-qualification" className="geo-text-link" lang="zh-Hans" hrefLang="zh-Hans">了解中文服务介绍 <ArrowRight size={17} aria-hidden="true" /></Link></div></div></section>

      <section className="geo-cta" aria-labelledby="guide-next-title"><div className="container geo-cta__inner"><div><span className="geo-eyebrow">Bring your questions</span><h2 id="guide-next-title">Let’s map the next step for your agency.</h2><p>Start with a conversation about your enquiry workflow, requirements and the scope you want to assess.</p></div><div className="geo-cta__actions"><Link to="/contact" className="btn btn--primary btn--lg">Discuss your requirements <ArrowRight size={18} aria-hidden="true" /></Link><a href="mailto:winston@arcsage.com.au">winston@arcsage.com.au</a></div></div></section>
    </article>
  )
}
