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
import EditTask from './pages/EditTask';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Welcome from './pages/Welcome';
import Onboarding from './pages/Onboarding';
import Property from './pages/Property';
import Appliances from './pages/Appliances';
import ApplianceDetail from './pages/ApplianceDetail';
import Warranties from './pages/Warranties';
import Household from './pages/Household';
import Notifications from './pages/Notifications';
import NotificationPreferences from './pages/NotificationPreferences';
import Settings from './pages/Settings';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import DeleteAccount from './pages/DeleteAccount';
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';
import Search from './pages/Search';
import Waitlist from './pages/Waitlist';
import Completed from './pages/Completed';
import TabBar from './components/TabBar';
import CookieConsent from './components/CookieConsent';
import Logo from './components/Logo';

const WAITLIST_MODE = false; // Flip to true to enable waitlist gating

function AppRoutes() {
  const { user, loading, hasOnboarded } = useAuth();
  const location = useLocation();

  if (WAITLIST_MODE && location.pathname !== '/waitlist' && !user) {
    return (
      <>
        <Routes>
          <Route path="/waitlist" element={<Waitlist />} />
          <Route path="*" element={<Navigate to="/waitlist" replace />} />
        </Routes>
        <CookieConsent />
      </>
    );
  }

  if (
    location.pathname === '/privacy' ||
    location.pathname === '/terms' ||
    location.pathname === '/reset-password' ||
    location.pathname === '/forgot-password'
  ) {
    return (
      <>
        <Routes>
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
        <CookieConsent />
      </>
    );
  }

  if (loading) {
    return (
      <div className="auth-loading">
        <Logo size={56} animated />
      </div>
    );
  }

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
    if (WAITLIST_MODE) {
      return <Navigate to="/waitlist" replace />;
    }
    return <Navigate to="/welcome" replace />;
  }

  if (
    location.pathname === '/welcome' ||
    location.pathname === '/login'
  ) {
    return <Navigate to="/" replace />;
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
        <Route path="/detail/:id/edit" element={<EditTask />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/property" element={<Property />} />
        <Route path="/appliances" element={<Appliances />} />
        <Route path="/appliance/:id" element={<ApplianceDetail />} />
        <Route path="/warranties" element={<Warranties />} />
        <Route path="/household" element={<Household />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/notification-preferences" element={<NotificationPreferences />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/delete-account" element={<DeleteAccount />} />
        <Route path="/search" element={<Search />} />
        <Route path="/waitlist" element={<Waitlist />} />
        <Route path="/completed" element={<Completed />} />
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