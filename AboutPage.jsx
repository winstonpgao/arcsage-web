import React from 'react';
import { motion } from 'framer-motion';
import Section from './Section';
import { Lightbulb, Users, Zap, Shield } from 'lucide-react';

const AboutPage = () => {
    return (
        <div style={{ paddingTop: '80px', backgroundColor: 'var(--color-background)' }}>
            {/* Hero Section */}
            {/* Hero Section */}
            <section style={{
                padding: '100px 0 60px',
                textAlign: 'center', /* Reverted to center */
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        style={{ maxWidth: '900px', margin: '0 auto 24px' }} /* Reverted to auto margin */
                    >
                        Building the Future of <br />
                        <span className="text-gradient">Human-AI Connection</span>
                    </motion.h1>
                </div>
            </section>

            {/* Our Team Section */}
            <Section
                title="Our Team"
                subtitle="Experts in Data & Engineering"
                style={{ paddingBottom: '20px' }}
            >
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left', fontSize: '18px', lineHeight: '1.8', color: 'var(--color-text-secondary)' }}>
                    <p style={{ marginBottom: '24px', fontSize: '20px' }}>
                        Founded in 2025 and headquartered in Melbourne, Australia, our company is a team of data scientists and software engineers passionate about building intelligent applications and automation.
                    </p>
                    <p style={{ marginBottom: '16px' }}>
                        We specialize in:
                    </p>
                    <ul style={{ listStyleType: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                        {['Applied Data Science', 'Reporting & Visualization Pipelines', 'Data Warehouse Design', 'Automation', 'Cloud Infrastructure', 'Application Development'].map((item, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-accent)' }} />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </Section>

            {/* Mission Section */}
            <Section
                title="Our Mission"
                subtitle="Connecting Human and Machine Intelligence"
                theme="dark"
                style={{ paddingTop: '40px', paddingBottom: '40px' }}
            >
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left', fontSize: '20px', lineHeight: '1.8', color: 'var(--color-text-secondary)' }}>
                    <p style={{ marginBottom: '24px' }}>
                        Our mission is to connect human and machine intelligence to streamline decision-making, increase efficiency, and unlock actionable insights.
                    </p>
                    <p style={{ marginBottom: '24px' }}>
                        Our products transform workflows across <strong>financial services, higher education, real estate, retail, and pharmacy</strong>.
                    </p>
                    <p>
                        We target enterprises seeking smarter, scalable, and secure AI-driven solutions, and differentiate through deep domain expertise and end-to-end integration of data science, AI, and LLM technologies.
                    </p>
                </div>
            </Section>

            {/* Values Section */}
            <div style={{ padding: '80px 0 100px', backgroundColor: 'var(--color-surface)' }}>
                <div className="container">
                    <h2 style={{ textAlign: 'left', marginBottom: '60px', fontSize: '36px' }}>Our Core Values</h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '40px'
                    }}>
                        {[
                            { icon: <Zap size={40} />, title: "Innovation", text: "We push the boundaries of what AI can do, constantly evolving our technology to stay ahead of the curve." },
                            { icon: <Users size={40} />, title: "Human-Centric", text: "Technology is a tool for people. User experience is at the heart of every decision we make." },
                            { icon: <Lightbulb size={40} />, title: "Clarity", text: "We turn chaos into order, providing clear insights and actionable results that drive business growth." },
                            { icon: <Shield size={40} />, title: "Integrity", text: "We build trust through transparency, security, and ethical AI practices that protect your data and business." }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                style={{
                                    padding: '40px',
                                    backgroundColor: 'var(--color-background)',
                                    borderRadius: '24px',
                                    border: '1px solid var(--color-border)',
                                    textAlign: 'left',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start'
                                }}
                            >
                                <div style={{ color: 'var(--color-accent)', marginBottom: '24px', display: 'inline-block' }}>{item.icon}</div>
                                <h3 style={{ fontSize: '28px', marginBottom: '16px', fontWeight: 700 }}>{item.title}</h3>
                                <p style={{ color: 'var(--color-text-secondary)', fontSize: '20px', lineHeight: '1.6' }}>{item.text}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
