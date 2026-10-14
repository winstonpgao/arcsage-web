import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import PageMetadata from './components/PageMetadata'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import LeadQualificationPage from './pages/LeadQualificationPage'
import LeadQualificationZhPage from './pages/LeadQualificationZhPage'
import BuyerGuidePage from './pages/BuyerGuidePage'
import NotFoundPage from './pages/NotFoundPage'
export default function App() {
 return <><PageMetadata /><Layout><Routes>
  <Route path="/" element={<HomePage />} /><Route path="/about" element={<AboutPage />} /><Route path="/contact" element={<ContactPage />} />
  <Route path="/real-estate-ai-lead-qualification" element={<LeadQualificationPage />} />
  <Route path="/zh/real-estate-ai-lead-qualification" element={<LeadQualificationZhPage />} />
  <Route path="/guides/real-estate-ai-lead-qualification" element={<BuyerGuidePage />} />
  <Route path="*" element={<NotFoundPage />} />
 </Routes></Layout></>
}
