import { Link } from 'react-router-dom'
export default function NotFoundPage() {
 return <section className="contact-page"><div className="container"><div className="contact-page__header"><p>404</p><h1>Page not found</h1><p>Explore the platform or contact our team.</p><Link to="/" className="btn btn--primary btn--lg">Return to ArcSage</Link></div></div></section>
}
