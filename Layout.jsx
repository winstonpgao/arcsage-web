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
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <Logo />
                    <nav style={{ display: 'flex', gap: 'clamp(16px, 4vw, 32px)', flexWrap: 'wrap', alignItems: 'center' }}>
                        <a href="/#features" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', textDecoration: 'none', whiteSpace: 'nowrap' }}>Features</a>
                        <a href="/#results" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', textDecoration: 'none', whiteSpace: 'nowrap' }}>Results</a>
                        <Link to="/contact" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '14px', whiteSpace: 'nowrap' }}>Contact</Link>
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
            }}>
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '60px', flexWrap: 'wrap', gap: '40px' }}>
                        <div>
                            <Logo />
                            <p style={{ marginTop: '16px', maxWidth: '300px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                                Intelligent assistants for modern retail.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 'clamp(40px, 8vw, 60px)', flexWrap: 'wrap' }}>
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

                    {/* Powered by Google Cloud */}
                    <div style={{
                        borderTop: '1px solid var(--color-border)',
                        paddingTop: '32px',
                        marginTop: '40px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '14px',
                        color: 'var(--color-text-secondary)'
                    }}>
                        <span>Powered by</span>
                        <svg viewBox="0 0 192 32" style={{ height: '20px', width: 'auto' }} fill="currentColor">
                            <path d="M27.5 13.6h-12v4.8h8.5c-.4 4.7-4.4 6.7-8.5 6.7-5.2 0-9.5-4.2-9.5-9.5s4.2-9.5 9.5-9.5c3.8 0 6.2 2.3 6.2 2.3l3.4-3.3S21.7 2 15.5 2C8.1 2 2 8.1 2 15.5S8.1 29 15.5 29c6.6 0 12.6-4.8 12.6-13.4 0-1.2-.1-2-.6-2zm8.4-5.5c-4.4 0-7.9 3.6-7.9 8s3.5 8 7.9 8 7.9-3.6 7.9-8-3.5-8-7.9-8zm0 12.2c-2.3 0-4.2-1.9-4.2-4.2s1.9-4.2 4.2-4.2 4.2 1.9 4.2 4.2-1.9 4.2-4.2 4.2zm22-12.2c-4.4 0-7.9 3.6-7.9 8s3.5 8 7.9 8 7.9-3.6 7.9-8-3.5-8-7.9-8zm0 12.2c-2.3 0-4.2-1.9-4.2-4.2s1.9-4.2 4.2-4.2 4.2 1.9 4.2 4.2-1.9 4.2-4.2 4.2zm21.8-11.8v-.3c0-2.9-2.2-5.1-5.4-5.1-2.1 0-3.5.9-4.4 2.1l3.1 1.3c.4-.8 1.2-1.4 2.2-1.4 1.3 0 2.2.8 2.2 2v.2c-1.3-.7-2.7-1-4.1-1-3.7 0-7.5 2-7.5 5.8 0 3.4 3 5.6 6.3 5.6 2.6 0 4-1.2 4.9-2.5v2h3.7V8.5h-.1zm-.4 6.5c0 2.3-2.4 3.9-5 3.9-1.6 0-3.8-.8-3.8-2.8 0-2.5 2.7-3.1 5-3.1 1.4 0 2.5.3 3.8.9v1.1zm6.7 9.1h3.8V3h-3.8v21.1zm16.5-14.2c-1.8 0-3.3.8-4 2.1l-3.4-1.4c1.2-2.5 3.8-4.2 7.4-4.2 4.5 0 7.5 2.8 7.5 7.2v9.5h-3.7v-2c-1.1 1.5-2.9 2.5-5.2 2.5-3.6 0-6.7-2.4-6.7-6 0-3.9 3.1-6 6.7-6 2.3 0 4.1.9 5.2 2.4V14c0-2.3-1.8-3.7-4-3.7zM95 20c-1.9 0-3.5 1.3-3.5 3 0 1.7 1.6 3 3.5 3s3.5-1.3 3.5-3c0-1.7-1.6-3-3.5-3z" />
                            <path d="M126.1 19.8c2.7 0 4.9-.9 6.5-2.4l-2.5-2.6c-.9.9-2.1 1.4-3.5 1.4-2.8 0-4.9-2.2-4.9-5s2.1-5 4.9-5c1.4 0 2.6.5 3.5 1.4l2.5-2.6c-1.6-1.5-3.8-2.4-6.5-2.4-5.2 0-9.4 4.2-9.4 9.6s4.2 9.6 9.4 9.6zm11.4-17.3h4.4v17.1h-4.4V2.5zm20.4 10.3c0 4.3-3.4 7.5-7.8 7.5s-7.8-3.2-7.8-7.5 3.4-7.5 7.8-7.5 7.8 3.2 7.8 7.5zm-4.5 0c0-2.1-1.5-3.8-3.4-3.8s-3.4 1.7-3.4 3.8 1.5 3.8 3.4 3.8 3.4-1.7 3.4-3.8zm20.4 0v7h-4.4v-6.5c0-1.7-1.2-2.8-2.7-2.8-1.7 0-2.9 1.2-2.9 3.1v6.2h-4.4V5.5h4.4v7.5c.8-1.2 2.2-2 4.1-2 3.2 0 5.9 2.5 5.9 6.1zm13 7.1c-2.7 0-4.9-.9-6.5-2.4l2.5-2.6c.9.9 2.1 1.4 3.5 1.4 2.8 0 4.9-2.2 4.9-5s-2.1-5-4.9-5c-1.4 0-2.6.5-3.5 1.4l-2.5-2.6c1.6-1.5 3.8-2.4 6.5-2.4 5.2 0 9.4 4.2 9.4 9.6s-4.2 9.6-9.4 9.6z" />
                        </svg>
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
                            <a href="https://privacy.arcsage.com.au/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Privacy Policy</a>
                            <a href="#" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
