import { Route, Routes } from 'react-router-dom'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import HomePage from './pages/HomePage'
import PlaceholderPage from './pages/PlaceholderPage'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/a-propos" element={<PlaceholderPage title="À propos de la JSB" />} />
          <Route path="/jsb-2027" element={<PlaceholderPage title="JSB 2027" />} />
          <Route path="/theme" element={<PlaceholderPage title="Thème officiel" />} />
          <Route path="/participer" element={<PlaceholderPage title="Participer" />} />
          <Route path="/candidater" element={<PlaceholderPage title="Candidater à la JSB" />} />
          <Route path="/distinctions" element={<PlaceholderPage title="Distinctions" />} />
          <Route path="/programme" element={<PlaceholderPage title="Programme" />} />
          <Route path="/reglement" element={<PlaceholderPage title="Règlement" />} />
          <Route path="/sponsors" element={<PlaceholderPage title="Sponsors et partenaires" />} />
          <Route path="/devenir-sponsor" element={<PlaceholderPage title="Devenir sponsor" />} />
          <Route path="/organisations" element={<PlaceholderPage title="Organisations" />} />
          <Route path="/vote" element={<PlaceholderPage title="Vote du public" />} />
          <Route path="/faq" element={<PlaceholderPage title="FAQ" />} />
          <Route path="/contact" element={<PlaceholderPage title="Contact" />} />
          <Route path="/verify/:token" element={<PlaceholderPage title="Vérification de badge" />} />
          <Route path="*" element={<PlaceholderPage title="Page introuvable" />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}
