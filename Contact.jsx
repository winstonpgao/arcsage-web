import React from 'react';
import Section from './Section';

const Contact = () => {
    return (
        <Section id="contact" title="Contact and pricing" background="white">
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '60px',
                alignItems: 'start'
            }}>
                <div>
                    <p style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--color-text-primary)' }}>
                        Pricing depends on your volume and workflow.
                    </p>
                    <p style={{ fontSize: '19px', marginBottom: '40px' }}>
                        We discuss options directly to build a plan that suits your team.
                    </p>

                    <div>
                        <p style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Contact us at</p>
                        <a href="mailto:winston@arcsage.com.au" style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-accent)' }}>
                            winston@arcsage.com.au
                        </a>
                    </div>
                </div>

                <div style={{
                    backgroundColor: 'var(--color-background)',
                    padding: '40px',
                    borderRadius: 'var(--radius-xl)'
                }}>
                    {/* Placeholder for a form or just visual interest */}
                    <h3 style={{ marginBottom: '16px' }}>Get in touch</h3>
                    <p style={{ marginBottom: '24px' }}>Ready to modernize your customer service? Send us a message.</p>
                    <a href="mailto:winston@arcsage.com.au" className="btn btn-primary" style={{ width: '100%' }}>
                        Email Us
                    </a>
                </div>
            </div>
        </Section>
    );
};

export default Contact;
