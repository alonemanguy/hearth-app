import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import Home from './pages/Home';
import Add from './pages/Add';
import Detail from './pages/Detail';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Welcome from './pages/Welcome';
import Onboarding from './pages/Onboarding';
import Property from './pages/Property';
import Appliances from './pages/Appliances';
import ApplianceDetail from './pages/ApplianceDetail';
import Warranties from './pages/Warranties';
import Notifications from './pages/Notifications';
import NotificationPreferences from './pages/NotificationPreferences';
import Settings from './pages/Settings';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import DeleteAccount from './pages/DeleteAccount';
import TabBar from './components/TabBar';
import CookieConsent from './components/CookieConsent';
import Logo from './components/Logo';

function AppRoutes() {
  const { user, loading, hasOnboarded } = useAuth();
  const location = useLocation();

  // 1. Legal pages — always accessible, regardless of auth state
  if (
    location.pathname === '/privacy' ||
    location.pathname === '/terms'
  ) {
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

  // 2. Loading state
  if (loading) {
    return (
      <div className="auth-loading">
        <Logo size={56} animated />
      </div>
    );
  }

  // 3. Not logged in → Welcome or Login only, everything else redirects
  if (!user) {
    if (location.pathname === '/welcome') {
      return (
        <>
          <Welcome />
          <CookieConsent />
        </>
      );
    }
    if (location.pathname === '/login') {
      return (
        <>
          <Login />
          <CookieConsent />
        </>
      );
    }
    return <Navigate to="/welcome" replace />;
  }

  // 4. Logged in but still on /welcome or /login → redirect into the app
  if (
    location.pathname === '/welcome' ||
    location.pathname === '/login'
  ) {
    return <Navigate to="/" replace />;
  }

  // 5. Logged in but haven't finished onboarding → show onboarding
  if (!hasOnboarded) {
    return (
      <>
        <Onboarding />
        <CookieConsent />
      </>
    );
  }

  // 6. Full app
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
        <Route path="/warranties" element={<Warranties />} />
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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export { App };