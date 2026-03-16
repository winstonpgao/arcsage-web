import React from 'react';
import { motion } from 'framer-motion';
import { Cloud, Server, Database, Workflow, Sparkles, BarChart3, LayoutGrid, Zap } from 'lucide-react';

const Integrations = () => {
    const providers = [
        { name: "AWS", icon: <Cloud size={32} /> },
        { name: "Azure", icon: <Server size={32} /> },
        { name: "Google Cloud", icon: <Database size={32} /> },
        { name: "Copilot", icon: <Sparkles size={32} /> },
        { name: "Power BI", icon: <BarChart3 size={32} /> },
        { name: "Microsoft 365", icon: <LayoutGrid size={32} /> },
        { name: "Zapier", icon: <Zap size={32} /> },
        { name: "n8n", icon: <Workflow size={32} /> }
    ];

    return (
        <section className="section-padding" style={{ borderTop: '1px solid var(--color-border)' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={{ marginBottom: '16px' }}>Seamless Integrations</h2>
                    <p style={{ fontSize: '19px', color: 'var(--color-text-secondary)' }}>
                        Works with your existing infrastructure.
                    </p>
                </div>

                <div className="integrations-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '40px',
                    alignItems: 'center',
                    justifyItems: 'center'
                }}>
                    {providers.map((provider, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '12px',
                                color: 'var(--color-text-secondary)',
                                fontWeight: 600,
                                fontSize: '18px'
                            }}
                        >
                            <div style={{
                                padding: '24px',
                                backgroundColor: 'var(--color-surface)',
                                borderRadius: '20px',
                                color: 'var(--color-text-primary)',
                                boxShadow: 'var(--shadow-sm)',
                                border: '1px solid var(--color-border)'
                            }}>
                                {provider.icon}
                            </div>
                            {provider.name}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Integrations;
