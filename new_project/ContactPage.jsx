import React from 'react';
import { motion } from 'framer-motion';
import Section from './Section';
import Layout from './Layout';

const ContactPage = () => {
    return (
        <Layout>
            <div style={{ paddingTop: '120px', minHeight: '100vh' }}>
                <Section id="contact-hero" background="transparent">
                    <div className="container">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            style={{ textAlign: 'center', marginBottom: '80px' }}
                        >
                            <h1 style={{ fontSize: '64px', marginBottom: '24px' }}>
                                Let's talk <span className="text-gradient">business</span>
                            </h1>
                            <p style={{ fontSize: '24px', color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                                Ready to modernize your customer service? We're here to help you build the future of retail support.
                            </p>
                        </motion.div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '60px',
                            alignItems: 'start',
                            maxWidth: '1200px',
                            margin: '0 auto'
                        }}>
                            {/* Left Column: Contact Info */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                                <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px' }}>
                                    <h3 style={{ marginBottom: '16px', fontSize: '28px' }}>Get in touch</h3>
                                    <p style={{ fontSize: '18px', marginBottom: '32px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                                        Pricing depends on your volume and workflow. We discuss options directly to build a plan that suits your team.
                                    </p>

                                    <div style={{ marginBottom: '32px' }}>
                                        <p style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Email us at</p>
                                        <a href="mailto:winston@arcsage.com.au" style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-accent)', textDecoration: 'none' }}>
                                            winston@arcsage.com.au
                                        </a>
                                    </div>
                                </div>

                                <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px' }}>
                                    <h3 style={{ marginBottom: '16px', fontSize: '28px' }}>Office</h3>
                                    <p style={{ fontSize: '18px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                                        Melbourne, Australia<br />
                                        Available Worldwide
                                    </p>
                                </div>
                            </div>

                            {/* Right Column: Contact Form */}
                            <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px' }}>
                                <form style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} onSubmit={(e) => e.preventDefault()}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Name</label>
                                            <input type="text" placeholder="John Doe" style={{
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '12px',
                                                padding: '12px 16px',
                                                color: 'white',
                                                fontSize: '16px',
                                                outline: 'none'
                                            }} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Email</label>
                                            <input type="email" placeholder="john@company.com" style={{
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '12px',
                                                padding: '12px 16px',
                                                color: 'white',
                                                fontSize: '16px',
                                                outline: 'none'
                                            }} />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Company</label>
                                        <input type="text" placeholder="Your Company Ltd." style={{
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '12px',
                                            padding: '12px 16px',
                                            color: 'white',
                                            fontSize: '16px',
                                            outline: 'none'
                                        }} />
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Message</label>
                                        <textarea placeholder="Tell us about your needs..." rows="4" style={{
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '12px',
                                            padding: '12px 16px',
                                            color: 'white',
                                            fontSize: '16px',
                                            outline: 'none',
                                            resize: 'vertical'
                                        }} />
                                    </div>

                                    <button type="submit" className="btn btn-primary" style={{ marginTop: '16px', width: '100%' }}>
                                        Send Message
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </Section>
            </div>
        </Layout>
    );
};

export default ContactPage;
