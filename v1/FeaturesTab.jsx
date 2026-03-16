import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FeaturesTab = ({ features }) => {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div className="container" style={{ padding: '60px 24px' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '40px',
                flexWrap: 'wrap',
                gap: '12px'
            }}>
                {features.map((feature, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveTab(index)}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '9999px',
                            fontSize: '15px',
                            fontWeight: 500,
                            transition: 'all 0.3s ease',
                            backgroundColor: activeTab === index ? 'var(--color-text-primary)' : 'rgba(0,0,0,0.05)',
                            color: activeTab === index ? 'white' : 'var(--color-text-secondary)',
                            cursor: 'pointer',
                            border: 'none'
                        }}
                    >
                        {feature.title}
                    </button>
                ))}
            </div>

            <div style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: '24px',
                padding: '40px',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid rgba(0,0,0,0.05)',
                minHeight: '500px'
            }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: features[activeTab].image ? '1fr 1fr' : '1fr',
                            gap: '40px',
                            alignItems: 'center'
                        }}
                    >
                        <div style={{ order: features[activeTab].imagePosition === 'left' ? 2 : 1 }}>
                            <h3 style={{ marginBottom: '16px', fontSize: '28px' }}>{features[activeTab].subtitle}</h3>
                            <p style={{ fontSize: '17px', lineHeight: '1.6', color: 'var(--color-text-secondary)', marginBottom: '32px' }}>
                                {features[activeTab].description}
                            </p>

                            <ul style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr',
                                gap: '16px',
                                listStyle: 'none',
                                padding: 0
                            }}>
                                {features[activeTab].items.map((item, idx) => (
                                    <li key={idx} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        fontSize: '16px',
                                        fontWeight: 500,
                                        color: 'var(--color-text-primary)'
                                    }}>
                                        <div style={{
                                            color: 'var(--color-accent)',
                                            backgroundColor: 'rgba(0, 113, 227, 0.1)',
                                            padding: '6px',
                                            borderRadius: '6px',
                                            display: 'flex'
                                        }}>
                                            {item.icon}
                                        </div>
                                        {item.text}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {features[activeTab].image && (
                            <div style={{ order: features[activeTab].imagePosition === 'left' ? 1 : 2 }}>
                                <img
                                    src={features[activeTab].image}
                                    alt={features[activeTab].title}
                                    style={{
                                        width: '100%',
                                        borderRadius: '16px',
                                        boxShadow: 'var(--shadow-md)'
                                    }}
                                />
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default FeaturesTab;
