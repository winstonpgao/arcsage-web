import React from 'react';
import { motion } from 'framer-motion';

const Section = ({ id, title, subtitle, children, background = "white", theme = "light", image = null, imagePosition = "right" }) => {
    const isDark = theme === "dark";
    const isGray = background === "gray";
    const isTransparent = background === "transparent";

    const bgColor = isTransparent ? "transparent" : (isDark ? "var(--color-background-dark)" : (isGray ? "var(--color-background)" : "var(--color-surface)"));
    const textColor = isDark ? "var(--color-text-primary-dark)" : "var(--color-text-primary)";
    const subTextColor = isDark ? "var(--color-text-secondary-dark)" : "var(--color-text-secondary)";

    return (
        <section id={id} className="section-padding" style={{
            backgroundColor: bgColor,
            color: textColor,
            borderTop: isDark ? "none" : "1px solid var(--color-border)"
        }}>
            <div className="container">
                <div style={{
                    display: image ? 'grid' : 'block',
                    gridTemplateColumns: image ? '1fr 1fr' : '1fr',
                    gap: '60px',
                    alignItems: 'center'
                }}>
                    <div style={{ order: image && imagePosition === "left" ? 2 : 1 }}>
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    transition: {
                                        duration: 0.6,
                                        staggerChildren: 0.1
                                    }
                                }
                            }}
                            style={{ maxWidth: image ? '100%' : '800px', margin: image ? '0' : '0 auto 60px' }}
                        >
                            {title && <motion.h2 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} style={{ marginBottom: '24px' }}>{title}</motion.h2>}
                            {subtitle && <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} style={{ fontSize: '21px', lineHeight: '1.5', color: subTextColor, marginBottom: image ? '32px' : '0' }}>{subtitle}</motion.p>}
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    transition: {
                                        duration: 0.6,
                                        delay: 0.2,
                                        staggerChildren: 0.1
                                    }
                                }
                            }}
                        >
                            {children}
                        </motion.div>
                    </div>

                    {image && (
                        <motion.div
                            style={{ order: imagePosition === "left" ? 1 : 2 }}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <img
                                src={image}
                                alt={title}
                                style={{
                                    maxWidth: '100%',
                                    borderRadius: '24px',
                                    boxShadow: 'var(--shadow-lg)',
                                    filter: 'brightness(0.85)' // Darken bright UI screenshots
                                }}
                            />
                        </motion.div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Section;
