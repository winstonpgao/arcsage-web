import { Link } from 'react-router-dom'
import {
  ArrowRight, BarChart3, Building2, CheckCircle2, ClipboardList,
  Globe2, Mail, MapPin, MessageSquare, Route, UserRoundCheck,
} from 'lucide-react'

const steps = [
  { icon: Mail, title: '汇总房产咨询', text: '从咨询邮件或双方确认的渠道开始，梳理咨询来源、接入方式，以及每类咨询由谁负责。' },
  { icon: ClipboardList, title: '整理买家需求', text: '提取买家已经说明的预算、区域、购房时间和问题。没有提供的信息，留给后续沟通确认。' },
  { icon: MessageSquare, title: '安排合适的跟进', text: '讨论中英文回复、看房咨询和跟进规则，明确哪些消息需要审核，哪些场景适合自动化。' },
  { icon: UserRoundCheck, title: '交接给经纪人', text: '让经纪人接收买家的原始需求、沟通背景和下一步事项，由团队继续判断和推进。' },
]

const questions = [
  { title: '房源与区域', text: '买家在咨询哪套房源？对区域、房型和用途有什么要求？' },
  { title: '预算与条件', text: '买家已经说明哪些预算和购房条件？哪些信息还需要确认？' },
  { title: '时间与准备情况', text: '何时计划购房或看房？贷款及资金准备情况应视为买家自述，后续再核实。' },
  { title: '语言与下一步', text: '中文还是英文更方便？下一步是补充信息、安排联系，还是由经纪人进一步解答？' },
]

const faqs = [
  { question: '什么是房地产 AI 线索筛选？', answer: 'AI 根据咨询内容整理买家已经表达的需求，按照中介团队确定的标准辅助排序，并帮助安排下一步沟通。评分用于辅助经纪人判断，不代表成交概率，也不能验证买家的财务状况。' },
  { question: '可以处理中文和英文咨询吗？', answer: '中英文沟通是 ArcSage 的产品方向之一。您可以与我们讨论常用房产术语、回复风格、审核方式，以及哪些情况应直接交给经纪人处理。' },
  { question: '可以接入现有的房产咨询渠道吗？', answer: '请先提供咨询来源和团队正在使用的系统。房产平台发送的咨询邮件及直接邮件是相关场景。具体接入方式、权限和支持范围需要在方案中确认，每项原生集成都应单独核实。' },
  { question: '如何报价？', answer: '报价根据咨询量、渠道、语言、所需系统连接和持续支持范围确定。建议在方案中分别列明初始设置、持续服务和可能产生的用量费用。' },
  { question: '怎样判断是否有效？', answer: '先记录当前的响应时间、咨询信息完整度、经纪人审核时间和后续跟进情况，再约定改善目标。合格沟通、看房结果等业务指标也应单独记录，并由团队核对。' },
  { question: 'ArcSage 在哪里？怎样联系？', answer: 'ArcSage 位于澳大利亚墨尔本。欢迎发送邮件至 winston@arcsage.com.au，介绍您的咨询流程并讨论演示范围。' },
]

export default function LeadQualificationZhPage() {
  return (
    <article className="geo-page geo-page--zh" lang="zh-Hans">
      <section className="geo-hero">
        <div className="container">
          <div className="geo-topline">
            <span className="geo-eyebrow"><Building2 size={16} aria-hidden="true" /> 面向澳洲房地产中介</span>
            <nav className="geo-language" aria-label="页面语言"><Link to="/real-estate-ai-lead-qualification" lang="en" hrefLang="en">English</Link><span aria-current="page">中文</span></nav>
          </div>
          <div className="geo-hero__grid">
            <div className="geo-hero__copy">
              <h1>房地产 AI 线索筛选。<br /><span>让每一条咨询，都有清晰的下一步。</span></h1>
              <p className="geo-lead">把买家需求、后续跟进和经纪人交接串联起来。与 ArcSage 一起梳理具体场景，确定适合您团队的中英文沟通与自动化方案。</p>
              <div className="geo-actions"><Link to="/contact" className="btn btn--primary btn--lg">讨论您的咨询流程 <ArrowRight size={18} aria-hidden="true" /></Link><a href="#qualification-workflow-zh" className="btn btn--outline btn--lg">了解处理流程</a></div>
              <p className="geo-location"><MapPin size={16} aria-hidden="true" /> 澳大利亚 · 墨尔本 <span aria-hidden="true">·</span> 中文与英文</p>
            </div>
            <aside className="geo-flow-card" aria-label="房产咨询处理流程">
              <div className="geo-flow-card__heading"><Route size={20} aria-hidden="true" /><span>从第一条咨询，到有效沟通</span></div>
              <ol className="geo-flow-card__steps">{steps.map(({ icon: Icon, title }, index) => <li key={title}><span className="geo-flow-card__icon"><Icon size={20} aria-hidden="true" /></span><div><small>第 {index + 1} 步</small><strong>{title}</strong></div><CheckCircle2 size={17} aria-hidden="true" className="geo-flow-card__check" /></li>)}</ol>
              <p className="geo-flow-card__note">上线前，在方案中确认渠道、系统连接、人工审核与自动化规则。</p>
            </aside>
          </div>
        </div>
      </section>

      <section className="geo-section" aria-labelledby="buyer-context-zh">
        <div className="container"><div className="geo-section__intro"><span className="geo-eyebrow">先了解买家，再决定跟进</span><h2 id="buyer-context-zh">好的筛选，从问对问题开始。</h2><p>让经纪人看清买家真正表达的需求，也看清尚待确认的信息，准备更有针对性的沟通。</p></div><div className="geo-card-grid geo-card-grid--four">{questions.map(({ title, text }, index) => <section className="geo-info-card" key={title}><span className="geo-card-number">0{index + 1}</span><h3>{title}</h3><p>{text}</p></section>)}</div></div>
      </section>

      <section className="geo-section geo-section--soft" id="qualification-workflow-zh" aria-labelledby="workflow-zh">
        <div className="container"><div className="geo-section__intro"><span className="geo-eyebrow">围绕团队现有流程设计</span><h2 id="workflow-zh">把咨询与下一步行动连接起来。</h2><p>先选择一个需要改善的具体场景，确定范围、审核节点与交接方式，再考虑扩展。</p></div><ol className="geo-workflow">{steps.map(({ icon: Icon, title, text }, index) => <li key={title}><div className="geo-workflow__marker"><Icon size={24} aria-hidden="true" /><span>0{index + 1}</span></div><h3>{title}</h3><p>{text}</p></li>)}</ol></div>
      </section>

      <section className="geo-section" aria-labelledby="use-cases-zh">
        <div className="container geo-split">
          <div className="geo-section__intro"><span className="geo-eyebrow">从熟悉的业务场景开始</span><h2 id="use-cases-zh">先改善一种沟通，再评估实际价值。</h2><p>明确的范围，便于团队核对信息是否准确、跟进是否合适，以及经纪人是否更容易接手。</p><Link to="/guides/real-estate-ai-lead-qualification" className="geo-text-link">阅读英文采购指南 <ArrowRight size={17} aria-hidden="true" /></Link></div>
          <div className="geo-use-cases"><section><Building2 size={22} aria-hidden="true" /><div><h3>买家房源咨询</h3><p>整理房源意向、购房条件和待解答的问题，为经纪人的后续联系提供背景。</p></div></section><section><Globe2 size={22} aria-hidden="true" /><div><h3>中英文客户沟通</h3><p>结合客户语言偏好、澳洲房产术语和团队审核要求，讨论合适的回复方式。</p></div></section><section><BarChart3 size={22} aria-hidden="true" /><div><h3>持续跟进与团队交接</h3><p>明确咨询归属、下一步事项和评估指标，让改善有具体的判断依据。</p></div></section></div>
        </div>
      </section>

      <section className="geo-section geo-section--dark" aria-labelledby="platform-zh">
        <div className="container"><div className="geo-section__intro"><span className="geo-eyebrow">了解平台</span><h2 id="platform-zh">带着具体流程，讨论平台如何配合。</h2><p>通过演示了解工作台，并一起确认您的咨询流程需要呈现哪些信息和下一步事项。</p></div><figure className="geo-platform"><img src="/screenshots/dashboard.png" alt="ArcSage 工作台，展示智能体模板及工作区导航" width="1440" height="900" loading="lazy" /><figcaption>ArcSage 平台概览，具体配置以双方确认的范围为准。</figcaption></figure></div>
      </section>

      <section className="geo-section" aria-labelledby="faq-zh"><div className="container"><div className="geo-section__intro"><span className="geo-eyebrow">决定前，先了解清楚</span><h2 id="faq-zh">房地产团队常问的问题。</h2></div><div className="geo-faq-grid">{faqs.map(({ question, answer }) => <section className="geo-faq" key={question}><h3>{question}</h3><p>{answer}</p></section>)}</div></div></section>

      <section className="geo-cta" aria-labelledby="next-step-zh"><div className="container geo-cta__inner"><div><span className="geo-eyebrow">从您的团队开始</span><h2 id="next-step-zh">告诉我们，哪一步咨询处理最需要改善。</h2><p>介绍您的咨询来源、客户语言和目前的处理方式，我们一起讨论合适的演示和方案范围。</p></div><div className="geo-cta__actions"><Link to="/contact" className="btn btn--primary btn--lg">讨论演示安排 <ArrowRight size={18} aria-hidden="true" /></Link><a href="mailto:winston@arcsage.com.au">winston@arcsage.com.au</a></div></div></section>
    </article>
  )
}
