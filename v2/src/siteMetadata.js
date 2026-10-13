export const SITE_ORIGIN = (import.meta.env?.VITE_SITE_URL || 'https://arcsage.com.au').replace(/\/$/, '')
export const PUBLIC_ROUTES = ['/', '/about', '/contact', '/real-estate-ai-lead-qualification', '/zh/real-estate-ai-lead-qualification', '/guides/real-estate-ai-lead-qualification']
const metadata = {
 '/': ['ArcSage — AI-Powered Lead Qualification Platform', 'AI lead qualification for real estate teams. Explore enquiry intake, qualification workflows, and English/Chinese communication.'],
 '/about': ['About ArcSage | Real Estate AI', 'Meet the ArcSage team and learn about its real estate lead qualification focus in Melbourne, Australia.'],
 '/contact': ['Contact ArcSage | Discuss Lead Qualification', 'Contact ArcSage in Melbourne to discuss real estate enquiry qualification, workflow requirements, and current pricing.'],
 '/real-estate-ai-lead-qualification': ['AI Lead Qualification for Real Estate | ArcSage', 'Explore how ArcSage approaches real estate buyer enquiry intake, qualification criteria, and English/Chinese communication.'],
 '/zh/real-estate-ai-lead-qualification': ['房地产 AI 客户意向评估 | ArcSage', '了解 ArcSage 面向房地产中介的咨询整理、客户意向评估及中英文沟通方案。'],
 '/guides/real-estate-ai-lead-qualification': ['How to Evaluate Real Estate AI Lead Qualification | ArcSage', 'A buyer guide to enquiry extraction, explainable qualification, human review, integrations, and implementation scope.'],
}
export function pageMetadata(pathname) {
 const path = pathname === '/' ? '/' : pathname.replace(/\/+$/, '')
 const values = metadata[path]
 const language = path.startsWith('/zh/') ? 'zh-CN' : 'en'
 if (!values) return { title: 'Page Not Found | ArcSage', description: 'This page could not be found.', language, robots: 'noindex', canonical: null, schema: null }
 return { title: values[0], description: values[1], language, robots: 'index,follow',
  canonical: SITE_ORIGIN + (path === '/' ? '/' : path + '/'),
  schema: { '@context': 'https://schema.org', '@type': 'Organization', name: 'ArcSage', url: SITE_ORIGIN + '/', email: 'winston@arcsage.com.au' } }
}
