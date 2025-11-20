import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import { motion, useScroll, useTransform } from 'framer-motion';
import BackToTop from './BackToTop';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
    const { scrollY } = useScroll();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const updateScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', updateScroll);
        return () => window.removeEventListener('scroll', updateScroll);
    }, []);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                padding: '20px 0',
                transition: 'all 0.3s ease',
                backgroundColor: scrolled ? 'var(--color-surface-transparent)' : 'transparent',
                backdropFilter: scrolled ? 'blur(20px)' : 'none',
                borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent'
            }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Logo />
                    <nav style={{ display: 'flex', gap: '32px' }}>
                        <a href="/#features" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', textDecoration: 'none' }}>Features</a>
                        <a href="/#results" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', textDecoration: 'none' }}>Results</a>
                        <Link to="/contact" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '14px' }}>Contact</Link>
                    </nav>
                </div>
            </header>

            <main style={{ flex: 1 }}>
                {children}
            </main>

            <BackToTop />

            <footer style={{
                padding: '80px 0 40px',
                backgroundColor: 'var(--color-background)',
                borderTop: '1px solid var(--color-border)'
            }}>    <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '60px' }}>
                        <div>
                            <Logo />
                            <p style={{ marginTop: '16px', maxWidth: '300px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                                Intelligent assistants for modern retail.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '60px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <h4 style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Product</h4>
                                <a href="#features" style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>Features</a>
                                <a href="#integration" style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>Integration</a>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <h4 style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Company</h4>
                                <Link to="/contact" style={{ fontSize: '14px', color: 'var(--color-text-primary)', textDecoration: 'none' }}>Contact</Link>
                                <a href="mailto:winston@arcsage.com.au" style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>winston@arcsage.com.au</a>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        borderTop: '1px solid var(--color-border)',
                        paddingTop: '32px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '12px',
                        color: 'var(--color-text-secondary)'
                    }}>
                        <p>&copy; {new Date().getFullYear()} ArcSage. All rights reserved.</p>
                        <div style={{ display: 'flex', gap: '24px' }}>
                            <a href="#" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Privacy Policy</a>
                            <a href="#" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
