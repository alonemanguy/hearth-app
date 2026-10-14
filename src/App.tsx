import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import Home from './pages/Home';
import Add from './pages/Add';
import Detail from './pages/Detail';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Property from './pages/Property';
import Appliances from './pages/Appliances';
import ApplianceDetail from './pages/ApplianceDetail';
import Notifications from './pages/Notifications';
import NotificationPreferences from './pages/NotificationPreferences';
import Settings from './pages/Settings';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import DeleteAccount from './pages/DeleteAccount';
import TabBar from './components/TabBar';
import CookieConsent from './components/CookieConsent';
import { Icon } from './lib/icons';

function AppRoutes() {
  const { user, loading, hasOnboarded } = useAuth();
  const location = useLocation();

  // Public routes — accessible without auth or onboarding
  const isPublicLegal =
    location.pathname === '/privacy' || location.pathname === '/terms';

  if (isPublicLegal) {
    return (
      <>
        <Routes>
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
        <CookieConsent />
      </>
    );
  }

  if (loading) {
    return (
      <div className="auth-loading">
        <Icon name="home" size={48} strokeWidth={1.5} />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Login />
        <CookieConsent />
      </>
    );
  }

  if (!hasOnboarded) {
    return (
      <>
        <Onboarding />
        <CookieConsent />
      </>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<Add />} />
        <Route path="/detail/:id" element={<Detail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/property" element={<Property />} />
        <Route path="/appliances" element={<Appliances />} />
        <Route path="/appliance/:id" element={<ApplianceDetail />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route
          path="/notification-preferences"
          element={<NotificationPreferences />}
        />
        <Route path="/settings" element={<Settings />} />
        <Route path="/delete-account" element={<DeleteAccount />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <TabBar />
      <CookieConsent />
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
