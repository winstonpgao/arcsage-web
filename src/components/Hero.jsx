import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import heroAbstract from '../assets/hero_abstract.png';
import heroAiRobot from '../assets/hero_ai_robot.png';
import heroAiRobotDark from '../assets/hero_ai_robot_dark.png';

const Hero = () => {
    return (
        <section style={{
            padding: '160px 0 100px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            minHeight: '80vh'
        }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '60px', flexDirection: 'row' }}>
                <div style={{ maxWidth: '500px', zIndex: 1 }}>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        style={{ marginBottom: '24px' }}
                    >
                        Customer service that <br />
                        <span className="text-gradient">takes care of itself</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        style={{ fontSize: '21px', lineHeight: '1.5', marginBottom: '40px', color: 'var(--color-text-secondary)' }}
                    >
                        ArcSage creates intelligent assistants that handle customer enquiries, manage follow ups, schedule appointments, and support your eCommerce workflow from end to end.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        style={{ display: 'flex', gap: '16px' }}
                    >
                        <Link to="/contact" className="btn btn-primary">Get Started</Link>
                        <a href="/#features" className="btn btn-secondary">Learn more</a>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    style={{ flex: 1, display: 'flex', justifyContent: 'center' }}
                >
                    <img
                        src={heroAiRobot}
                        alt="AI Assistant"
                        style={{
                            maxWidth: '100%',
                            height: 'auto',
                            maxHeight: '500px',
                            filter: 'brightness(0.8) drop-shadow(0 0 40px rgba(139, 92, 246, 0.2))'
                        }}
                    />
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
