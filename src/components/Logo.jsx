import React from 'react';
import logo from '../assets/logo.jpeg';

import { Link } from 'react-router-dom';

const Logo = ({ className = "" }) => {
    return (
        <Link to="/" onClick={() => window.scrollTo(0, 0)} className={className} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <img src={logo} alt="ArcSage Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
            <span style={{ fontWeight: 600, fontSize: '20px', letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>ArcSage</span>
        </Link>
    );
};

export default Logo;
