import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Layout from './Layout';
import Hero from './Hero';
import Section from './Section';
import FeaturesCarousel from './FeaturesCarousel';
import ContactPage from './ContactPage';
import AboutPage from './AboutPage';
import Integrations from './Integrations';
import {
  MessageSquare,
  ShoppingBag,
  Users,
  ShieldCheck,
  Search,
  Calendar,
  Bell,
  Database,
  Zap,
  Clock,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import chatUi from './chat_ui.png';
import dashboardUi from './dashboard_ui.png';
import knowledgeNetwork from './knowledge_network.png';
import ecommerceUi from './ecommerce_ui.png';
import workflowUi from './workflow_ui.png';
import collaborationUi from './collaboration_ui.png';
import improvementUi from './improvement_ui.png';
import communicationDetailed from './communication_detailed.png';
import robotOptionB from './robot_option_b.png';
import ecommerceDetailed from './ecommerce_detailed.png';
import workflowDetailed from './workflow_detailed.png';
import dashboardDarker from './dashboard_darker.png';

// Helper Icon Component
const CheckListIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 0 0 1-2-2V5a2 0 0 1 2-2h11" />
  </svg>
);

const HomePage = () => {
  return (
    <Layout>
      <Hero />

      {/* Group 1: Customer Experience */}
      <Section
        id="features"
        title="Customer Experience"
        subtitle="Seamless interactions that feel human."
      >
        <FeaturesCarousel features={[
          {
            title: "Communication",
            subtitle: "Every conversation, perfectly handled",
            description: "ArcSage transforms how you talk to customers. From instant answers to complex problem-solving, we ensure every interaction is friendly, accurate, and on-brand.",
            image: communicationDetailed,
            imagePosition: "right",
            items: [
              { text: "Natural language that mirrors your brand's voice", icon: <MessageSquare size={20} /> },
              { text: "Intelligent questioning to get to the root cause", icon: <Search size={20} /> },
              { text: "Seamless multilingual support (English & Chinese)", icon: <Users size={20} /> },
              { text: "Smart escalation for sensitive issues", icon: <ShieldCheck size={20} /> }
            ]
          },
          {
            title: "Knowledge",
            subtitle: "Expertise at scale",
            description: "Turn your internal documents into an instant expert. ArcSage ingests your policies and product data to provide precise, policy-compliant answers instantly.",
            image: knowledgeNetwork,
            imagePosition: "left",
            items: [
              { text: "Instant answers from your knowledge base", icon: <Search size={20} /> },
              { text: "Zero guesswork, 100% accuracy", icon: <ShieldCheck size={20} /> },
              { text: "Strict adherence to refund & exchange policies", icon: <ShoppingBag size={20} /> }
            ]
          },
          {
            title: "eCommerce",
            subtitle: "Support that sells",
            description: "ArcSage integrates directly with your store to handle order status, returns, and product questions, driving conversion.",
            image: ecommerceDetailed,
            imagePosition: "right",
            items: [
              { text: "Order status and delivery", icon: <ShoppingBag size={20} /> },
              { text: "Product questions", icon: <Search size={20} /> },
              { text: "Stock and availability", icon: <Database size={20} /> },
              { text: "Return requests", icon: <RefreshCw size={20} /> }
            ]
          }
        ]} />
      </Section>

      {/* Group 2: Operational Efficiency */}
      <Section
        id="operations"
        title="Operational Efficiency"
        subtitle="Automate the busywork, focus on the customer."
        background="gray"
      >
        <FeaturesCarousel features={[
          {
            title: "Automation",
            subtitle: "Workflows that work",
            description: "Automate complex tasks like appointment scheduling and data entry. ArcSage connects your tools to get work done.",
            image: workflowDetailed,
            imagePosition: "right",
            items: [
              { text: "Appointment scheduling through shared calendars", icon: <Calendar size={20} /> },
              { text: "Automated reminders for services, pickups, or returns", icon: <Bell size={20} /> },
              { text: "CRM updates and case creation", icon: <Database size={20} /> },
              { text: "Task routing to the right team", icon: <Users size={20} /> }
            ]
          },
          {
            title: "Collaboration",
            subtitle: "Your team's best teammate",
            description: "ArcSage empowers your human agents by handling the routine, drafting responses, and summarizing context.",
            image: collaborationUi,
            imagePosition: "right",
            items: [
              { text: "Draft replies for human approval", icon: <MessageSquare size={20} /> },
              { text: "Notify staff when a case needs action", icon: <Bell size={20} /> },
              { text: "Provide summaries before calls", icon: <BarChart3 size={20} /> },
              { text: "Reduce backlog without losing detail", icon: <CheckListIcon size={20} /> }
            ]
          }
        ]} />
      </Section>

      {/* Group 3: Strategic Intelligence */}
      <Section
        id="intelligence"
        title="Strategic Intelligence"
        subtitle="AI that learns and improves over time."
      >
        <FeaturesCarousel features={[
          {
            title: "Agentic AI",
            subtitle: "An AI that thinks and acts",
            description: "Built on cutting-edge agentic frameworks, ArcSage observes, reasons, and takes initiative just like your best employees.",
            image: robotOptionB,
            imagePosition: "right",
            items: [
              { text: "Track the state of each customer", icon: <Users size={20} /> },
              { text: "Predict the next required action", icon: <Zap size={20} /> },
              { text: "Decide when to reply, ask, or escalate", icon: <ShieldCheck size={20} /> },
              { text: "Improve performance as it learns from your operations", icon: <BarChart3 size={20} /> }
            ]
          },
          {
            title: "Improvement",
            subtitle: "Smarter every day",
            description: "ArcSage doesn't just answer; it learns. It identifies patterns and suggests improvements to your operations and content.",
            image: improvementUi,
            imagePosition: "right",
            items: [
              { text: "Learns common enquiry patterns", icon: <Database size={20} /> },
              { text: "Improves tone and clarity", icon: <MessageSquare size={20} /> },
              { text: "Highlights bottlenecks in your workflow", icon: <BarChart3 size={20} /> },
              { text: "Suggests operational improvements", icon: <Zap size={20} /> }
            ]
          }
        ]} />
      </Section>

      <Section
        id="agentic-highlight"
        title="Agentic AI that learns your operations"
        subtitle="ArcSage is built on a state of the art agentic framework that mirrors the way real teams work."
        theme="dark"
        image={dashboardDarker}
        imagePosition="left"
      >
        <div style={{ fontSize: '19px', lineHeight: '1.6', color: 'var(--color-text-secondary-dark)' }}>
          <p style={{ marginBottom: '24px' }}>
            Unlike traditional chatbots that follow a script, our agentic AI observes, reasons, and acts. It learns from every interaction to become a more effective member of your team.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '16px' }}>
            {[
              "Predicts customer needs before they ask",
              "Coordinates complex tasks across systems",
              "Adapts tone and strategy based on context"
            ].map((item, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-primary-dark)' }}>
                <div style={{ color: 'var(--color-accent-dark)' }}><Zap size={20} /></div>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section
        id="results"
        title="Results that matter"
        subtitle="Retail companies working with ArcSage see:"
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', textAlign: 'center' }}>
          {[
            { value: "70%", label: "Reduction in response time" },
            { value: "24/7", label: "Coverage across all channels" },
            { value: "40%", label: "Decrease in ticket backlog" }
          ].map((stat, index) => (
            <div key={index} className="glass-panel" style={{ padding: '40px', borderRadius: '24px' }}>
              <div style={{ fontSize: '56px', fontWeight: 700, color: 'var(--color-accent)', marginBottom: '8px' }} className="text-gradient">{stat.value}</div>
              <div style={{ fontSize: '19px', color: 'var(--color-text-secondary)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Final CTA */}
      <Section id="cta" background="transparent">
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <h2 style={{ fontSize: '48px', marginBottom: '24px' }}>Ready to transform your support?</h2>
          <p style={{ fontSize: '21px', color: 'var(--color-text-secondary)', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
            Join the retailers who are scaling their operations with ArcSage's intelligent agents.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link to="/contact" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '18px' }}>Get Started Now</Link>
          </div>
        </div>
      </Section>

      <Integrations />
    </Layout>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Router>
  );
};

export default App;
