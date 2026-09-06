import { lazy, Suspense } from 'react'
import { Outlet, Route, Routes } from 'react-router-dom'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { LoadingState } from './components/ui'
import HomePage from './pages/HomePage'

const AboutPage = lazy(() => import('./pages/AboutPage'))
const Jsb2027Page = lazy(() => import('./pages/Jsb2027Page'))
const ThemePage = lazy(() => import('./pages/ThemePage'))
const DistinctionsPage = lazy(() => import('./pages/DistinctionsPage'))
const ProgramPage = lazy(() => import('./pages/ProgramPage'))
const ReglementPage = lazy(() => import('./pages/ReglementPage'))
const FaqPage = lazy(() => import('./pages/FaqPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const SponsorsPage = lazy(() => import('./pages/SponsorsPage'))
const SponsorFormPage = lazy(() => import('./pages/SponsorFormPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ApplyPage = lazy(() => import('./pages/ApplyPage'))
const VotePage = lazy(() => import('./pages/VotePage'))
const VerifyBadgePage = lazy(() => import('./pages/VerifyBadgePage'))
const VerifyCertificatePage = lazy(() => import('./pages/VerifyCertificatePage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'))
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'))
const ParticipantsAdminPage = lazy(() => import('./pages/admin/ParticipantsAdminPage'))
const CandidatesAdminPage = lazy(() => import('./pages/admin/CandidatesAdminPage'))
const SponsorsAdminPage = lazy(() => import('./pages/admin/SponsorsAdminPage'))
const OrganizationsAdminPage = lazy(() => import('./pages/admin/OrganizationsAdminPage'))
const ProgramAdminPage = lazy(() => import('./pages/admin/ProgramAdminPage'))
const ContentAdminPage = lazy(() => import('./pages/admin/ContentAdminPage'))
const VotesAdminPage = lazy(() => import('./pages/admin/VotesAdminPage'))
const BadgesAdminPage = lazy(() => import('./pages/admin/BadgesAdminPage'))
const CertificatesAdminPage = lazy(() => import('./pages/admin/CertificatesAdminPage'))
const EvaluationAdminPage = lazy(() => import('./pages/admin/EvaluationAdminPage'))
const EmailLogsAdminPage = lazy(() => import('./pages/admin/EmailLogsAdminPage'))
const AuditLogsAdminPage = lazy(() => import('./pages/admin/AuditLogsAdminPage'))

function PublicShell() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-16">
          <LoadingState label="Chargement de la page…" />
        </div>
      }
    >
      <Routes>
        {/* ---- Site public ---- */}
        <Route element={<PublicShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/a-propos" element={<AboutPage />} />
          <Route path="/jsb-2027" element={<Jsb2027Page />} />
          <Route path="/theme" element={<ThemePage />} />
          <Route path="/distinctions" element={<DistinctionsPage />} />
          <Route path="/programme" element={<ProgramPage />} />
          <Route path="/reglement" element={<ReglementPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/sponsors" element={<SponsorsPage />} />
          <Route path="/devenir-sponsor" element={<SponsorFormPage />} />
          <Route path="/participer" element={<RegisterPage />} />
          <Route path="/candidater" element={<ApplyPage />} />
          <Route path="/vote" element={<VotePage />} />
          <Route path="/verify/:token" element={<VerifyBadgePage />} />
          <Route path="/verify/certificate/:token" element={<VerifyCertificatePage />} />
        </Route>

        {/* ---- Administration ---- */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="participants" element={<ParticipantsAdminPage />} />
          <Route path="candidatures" element={<CandidatesAdminPage />} />
          <Route path="evaluation" element={<EvaluationAdminPage />} />
          <Route path="sponsors" element={<SponsorsAdminPage />} />
          <Route path="organisations" element={<OrganizationsAdminPage />} />
          <Route path="programme" element={<ProgramAdminPage />} />
          <Route path="contenu" element={<ContentAdminPage />} />
          <Route path="vote" element={<VotesAdminPage />} />
          <Route path="badges" element={<BadgesAdminPage />} />
          <Route path="attestations" element={<CertificatesAdminPage />} />
          <Route path="emails" element={<EmailLogsAdminPage />} />
          <Route path="logs" element={<AuditLogsAdminPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
