import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import ContactPage from './pages/ContactPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import SecurityPage from './pages/SecurityPage';
import CookiesPage from './pages/CookiesPage';
import SuccessPage from './pages/SuccessPage';
import NotFoundPage from './pages/NotFoundPage';
import './index.css';
import { Helmet } from 'react-helmet-async';

function App() {
  const siteName = 'Ticket Wise';
  const siteUrl = 'https://www.ticketwise.com.br';
  const defaultDescription = 'Ticket Wise: Plataforma de gestão de tickets e suporte ao cliente para empresas que querem crescer com eficiência.';
  const defaultImage = `${siteUrl}/og-image.jpg`;

  return (
    <AuthProvider>
      <Router>
        <Helmet>
          <title>{siteName}</title>
          <meta name="description" content={defaultDescription} />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#6d28d9" />
          <meta property="og:site_name" content={siteName} />
          <meta property="og:type" content="website" />
          <meta property="og:image" content={defaultImage} />
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:image" content={defaultImage} />
        </Helmet>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/security" element={<SecurityPage />} />
              <Route path="/cookies" element={<CookiesPage />} />
              <Route path="/success" element={<SuccessPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;