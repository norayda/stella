import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ComponentPreviewRouter } from './components/ComponentPreview';
import { StellaVoiceAssistant } from './components/StellaVoiceAssistant';

/*-krisspy-code-start*/
// Auto-generated imports from manifest
import DesignSystemTest from '/src/pages/DesignSystemTest.tsx';
import NotFound from '/src/pages/NotFound.tsx';
import StellaWelcome from '/src/pages/StellaWelcome.tsx';
import StellaName from '/src/pages/StellaName.tsx';
import StellaPersonalization from '/src/pages/StellaPersonalization.tsx';
import StellaVehicle from '/src/pages/StellaVehicle.tsx';
import StellaReady from '/src/pages/StellaReady.tsx';
import StellaHome from '/src/pages/StellaHome.tsx';
import StellaSOS from '/src/pages/StellaSOS.tsx';
import StellaCopilot from '/src/pages/StellaCopilot.tsx';
import StellaGarage from '/src/pages/StellaGarage.tsx';
import StellaTrips from '/src/pages/StellaTrips.tsx';
import StellaRewards from '/src/pages/StellaRewards.tsx';
import StellaMaintenanceHistory from '/src/pages/StellaMaintenanceHistory.tsx';
import StellaModes from '/src/pages/StellaModes.tsx';
import StellaProfile from '/src/pages/StellaProfile.tsx';
import StellaSettings from '/src/pages/StellaSettings.tsx';
import StellaAccessibility from '/src/pages/StellaAccessibility.tsx';
import StellaChangeVehicle from '/src/pages/StellaChangeVehicle.tsx';
import StellaContact from '/src/pages/StellaContact.tsx';
import StellaFavorites from '/src/pages/StellaFavorites.tsx';
import StellaInterests from '/src/pages/StellaInterests.tsx';
import StellaNotifications from '/src/pages/StellaNotifications.tsx';
import StellaPayment from '/src/pages/StellaPayment.tsx';
import StellaLogin from '/src/pages/StellaLogin.tsx';

/*-krisspy-code-end*/



// Auth guard component
function AuthGuard({ children, requiresAuth = false }: { children: React.ReactNode, requiresAuth?: boolean }) {
  if (requiresAuth) {
    const isAuthenticated = false; // This would come from your auth context/store
    
    if (!isAuthenticated) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Authentication Required</h1>
          <p>You need to be logged in to access this page</p>
          <button style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: '#3b82f6', 
            color: 'white', 
            border: 'none', 
            borderRadius: '0.25rem',
            cursor: 'pointer'
          }}>
            Sign In
          </button>
        </div>
      );
    }
  }
  
  return <>{children}</>;
}

// Layout wrapper component
function PageWithLayout({ 
  page: Page, 
  layouts = [] 
}: { 
  page: React.ComponentType, 
  layouts?: React.ComponentType<{ children: React.ReactNode }>[] 
}) {
  if (!layouts.length) {
    return <Page />;
  }
  
  // Render nested layouts from outermost to innermost
  return layouts.reduceRight(
    (acc, Layout) => <Layout>{acc}</Layout>, 
    <Page />
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/*-krisspy-code-start*/}
        {/* Auto-generated routes from manifest */}
        <Route path="/design-system" element={
          <AuthGuard requiresAuth={false}>
            <PageWithLayout page={DesignSystemTest} layouts={[]} />
          </AuthGuard>
        } />

        <Route path="*" element={
          <AuthGuard requiresAuth={false}>
            <PageWithLayout page={NotFound} layouts={[]} />
          </AuthGuard>
        } />

        <Route path="/404" element={
          <AuthGuard requiresAuth={false}>
            <PageWithLayout page={NotFound} layouts={[]} />
          </AuthGuard>
        } />

        <Route path="/" element={
          <AuthGuard requiresAuth={false}>
            <PageWithLayout page={StellaWelcome} layouts={[]} />
          </AuthGuard>
        } />

        <Route path="/welcome" element={
          <AuthGuard requiresAuth={false}>
            <PageWithLayout page={StellaWelcome} layouts={[]} />
          </AuthGuard>
        } />

        <Route path="/name" element={
          <AuthGuard requiresAuth={false}>
            <PageWithLayout page={StellaName} layouts={[]} />
          </AuthGuard>
        } />

        <Route path="/personalization" element={
          <AuthGuard requiresAuth={false}>
            <PageWithLayout page={StellaPersonalization} layouts={[]} />
          </AuthGuard>
        } />

        <Route path="/vehicle" element={
          <AuthGuard requiresAuth={false}>
            <PageWithLayout page={StellaVehicle} layouts={[]} />
          </AuthGuard>
        } />

        <Route path="/ready" element={
          <AuthGuard requiresAuth={false}>
            <PageWithLayout page={StellaReady} layouts={[]} />
          </AuthGuard>
        } />

        <Route path="/welcome-back" element={
          <AuthGuard requiresAuth={false}>
            <PageWithLayout page={StellaReady} layouts={[]} />
          </AuthGuard>
        } />

        <Route path="/home" element={
          <AuthGuard requiresAuth={false}>
            <PageWithLayout page={StellaHome} layouts={[]} />
          </AuthGuard>
        } />

        <Route path="/dashboard" element={
          <AuthGuard requiresAuth={false}>
            <PageWithLayout page={StellaHome} layouts={[]} />
          </AuthGuard>
        } />

        <Route path="/sos" element={
          <AuthGuard requiresAuth={false}>
            <PageWithLayout page={StellaSOS} layouts={[]} />
          </AuthGuard>
        } />

        <Route path="/copilot" element={
          <AuthGuard requiresAuth={false}>
            <PageWithLayout page={StellaCopilot} layouts={[]} />
          </AuthGuard>
        } />

        <Route path="/garage" element={
          <AuthGuard requiresAuth={false}>
            <PageWithLayout page={StellaGarage} layouts={[]} />
          </AuthGuard>
        } />

        <Route path="/trips" element={
          <AuthGuard requiresAuth={false}>
            <PageWithLayout page={StellaTrips} layouts={[]} />
          </AuthGuard>
        } />

        <Route path="/rewards" element={
          <AuthGuard requiresAuth={false}>
            <PageWithLayout page={StellaRewards} layouts={[]} />
          </AuthGuard>
        } />

        <Route path="/avantages" element={
          <AuthGuard requiresAuth={false}>
            <PageWithLayout page={StellaRewards} layouts={[]} />
          </AuthGuard>
        } />

        <Route path="/maintenance-history" element={
          <AuthGuard requiresAuth={false}>
            <PageWithLayout page={StellaMaintenanceHistory} layouts={[]} />
          </AuthGuard>
        } />

        <Route path="/settings/modes" element={
          <AuthGuard requiresAuth={false}>
            <PageWithLayout page={StellaModes} layouts={[]} />
          </AuthGuard>
        } />

        <Route path="/profile" element={
          <AuthGuard requiresAuth={false}>
            <PageWithLayout page={StellaProfile} layouts={[]} />
          </AuthGuard>
        } />

        <Route path="/profil" element={
          <AuthGuard requiresAuth={false}>
            <PageWithLayout page={StellaProfile} layouts={[]} />
          </AuthGuard>
        } />

        <Route path="/settings" element={
          <AuthGuard requiresAuth={false}>
            <PageWithLayout page={StellaSettings} layouts={[]} />
          </AuthGuard>
        } />

        <Route path="/settings/accessibility" element={
          <AuthGuard requiresAuth={false}>
            <PageWithLayout page={StellaAccessibility} layouts={[]} />
          </AuthGuard>
        } />

        <Route path="/change-vehicle" element={
          <AuthGuard requiresAuth={false}>
            <PageWithLayout page={StellaChangeVehicle} layouts={[]} />
          </AuthGuard>
        } />

        <Route path="/contact" element={
          <AuthGuard requiresAuth={false}>
            <PageWithLayout page={StellaContact} layouts={[]} />
          </AuthGuard>
        } />

        <Route path="/favorites" element={
          <AuthGuard requiresAuth={false}>
            <PageWithLayout page={StellaFavorites} layouts={[]} />
          </AuthGuard>
        } />

        <Route path="/interests" element={
          <AuthGuard requiresAuth={false}>
            <PageWithLayout page={StellaInterests} layouts={[]} />
          </AuthGuard>
        } />

        <Route path="/notifications" element={
          <AuthGuard requiresAuth={false}>
            <PageWithLayout page={StellaNotifications} layouts={[]} />
          </AuthGuard>
        } />

        <Route path="/payment" element={
          <AuthGuard requiresAuth={false}>
            <PageWithLayout page={StellaPayment} layouts={[]} />
          </AuthGuard>
        } />

        <Route path="/login" element={
          <AuthGuard requiresAuth={false}>
            <PageWithLayout page={StellaLogin} layouts={[]} />
          </AuthGuard>
        } />

        <Route path="/connexion" element={
          <AuthGuard requiresAuth={false}>
            <PageWithLayout page={StellaLogin} layouts={[]} />
          </AuthGuard>
        } />
        {/*-krisspy-code-end*/}
        
        <Route path="/_component/*" element={<ComponentPreviewRouter />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <StellaVoiceAssistant />
    </Router>
  );
}