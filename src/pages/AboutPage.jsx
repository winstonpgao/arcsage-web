import React from 'react';
import { motion } from 'framer-motion';
import Section from '../components/Section';
import aboutTeamVision from '../assets/about_team_vision.png';
import { Lightbulb, Users, Zap, Globe } from 'lucide-react';

const AboutPage = () => {
    return (
        <div style={{ paddingTop: '80px', backgroundColor: 'var(--color-background)' }}>
            {/* Hero Section */}
            <section style={{
                padding: '100px 0',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        style={{ maxWidth: '900px', margin: '0 auto 24px' }}
                    >
                        Building the Future of <br />
                        <span className="text-gradient">Human-AI Connection</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        style={{ fontSize: '21px', lineHeight: '1.5', maxWidth: '700px', margin: '0 auto 60px', color: 'var(--color-text-secondary)' }}
                    >
                        At ArcSage, we believe that technology should serve humanity, not the other way around. We are a team of visionaries, engineers, and designers dedicated to creating an intelligent interface that empowers businesses to connect effortlessly.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.4 }}
                    >
                        <img
                            src={aboutTeamVision}
                            alt="ArcSage Visionary Team"
                            style={{
                                maxWidth: '100%',
                                borderRadius: '24px',
                                maxHeight: '500px',
                                boxShadow: '0 20px 60px rgba(139, 92, 246, 0.2)',
                                border: '1px solid var(--color-border)'
                            }}
                        />
                    </motion.div>
                </div>
            </section>

            {/* Mission Section */}
            <Section
                title="Our Mission"
                subtitle="Simplifying the Complex"
                theme="dark"
            >
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', fontSize: '18px', lineHeight: '1.8', color: 'var(--color-text-secondary)' }}>
                    <p style={{ marginBottom: '24px' }}>
                        The digital landscape is becoming increasingly noisy. Businesses are overwhelmed by data, and customers are frustrated by impersonal interactions. Our mission is to cut through the noise.
                    </p>
                    <p>
                        We build **Agentic AI** systems that don't just respond, but *understand* and *act*. By automating the routine and enhancing the complex, we free up human potential to focus on what truly matters: genuine connection and creativity.
                    </p>
                </div>
            </Section>

            {/* Values Section */}
            <div style={{ padding: '100px 0', backgroundColor: 'var(--color-surface)' }}>
                <div className="container">
                    <h2 style={{ textAlign: 'center', marginBottom: '60px' }}>Our Core Values</h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '40px'
                    }}>
                        {[
                            { icon: <Zap size={32} />, title: "Innovation", text: "We push the boundaries of what AI can do, constantly evolving our technology." },
                            { icon: <Users size={32} />, title: "Human-Centric", text: "Technology is a tool for people. User experience is at the heart of every decision." },
                            { icon: <Lightbulb size={32} />, title: "Clarity", text: "We turn chaos into order, providing clear insights and actionable results." },
                            { icon: <Globe size={32} />, title: "Global Impact", text: "We aim to empower businesses of all sizes, everywhere, to serve their customers better." }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                style={{
                                    padding: '32px',
                                    backgroundColor: 'var(--color-background)',
                                    borderRadius: '20px',
                                    border: '1px solid var(--color-border)',
                                    textAlign: 'center'
                                }}
                            >
                                <div style={{ color: 'var(--color-accent)', marginBottom: '16px', display: 'inline-block' }}>{item.icon}</div>
                                <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>{item.title}</h3>
                                <p style={{ color: 'var(--color-text-secondary)' }}>{item.text}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
