import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ArrowUp } from 'lucide-react'

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showTop, setShowTop] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
    window.scrollTo(0, 0)
  }, [location])

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      setShowTop(window.scrollY > 600)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="app">
      <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
        <div className="nav__inner">
          <Link to="/" className="nav__logo">
            <img src="/logo.jpeg" alt="ArcSage" width="36" height="36" />
            <span>ArcSage</span>
          </Link>
          <nav className={`nav__links ${menuOpen ? 'nav__links--open' : ''}`}>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Platform</Link>
            <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About</Link>
            <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Contact</Link>
          </nav>
          <div className="nav__actions">
            <Link to="/contact" className="btn btn--primary btn--sm">Get Started</Link>
            <button className="nav__toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="footer">
        <div className="container">
          <div className="footer__grid">
            <div className="footer__brand">
              <Link to="/" className="nav__logo">
                <img src="/logo.jpeg" alt="ArcSage" width="32" height="32" />
                <span>ArcSage</span>
              </Link>
              <p>AI-powered lead qualification platform for real estate agencies.</p>
              <p className="footer__location">Melbourne, Australia</p>
            </div>
            <div className="footer__col">
              <h4>Platform</h4>
              <Link to="/">Features</Link>
              <Link to="/">How It Works</Link>
              <Link to="/">Pricing</Link>
            </div>
            <div className="footer__col">
              <h4>Company</h4>
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact</Link>
            </div>
            <div className="footer__col">
              <h4>Contact</h4>
              <a href="mailto:winston@arcsage.com.au">winston@arcsage.com.au</a>
              <p>Melbourne, VIC, Australia</p>
            </div>
          </div>
          <div className="footer__bottom">
            <p>&copy; {new Date().getFullYear()} ArcSage Technology Pty Ltd. All rights reserved.</p>
            <p>ABN registered in Australia</p>
          </div>
        </div>
      </footer>

      {showTop && (
        <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  )
}
