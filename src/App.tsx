import { lazy, Suspense } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import TabBar from './components/TabBar';
import OnlineStatus from './components/OnlineStatus';
import CookieConsent from './components/CookieConsent';
import Logo from './components/Logo';

// Screens are code-split, so a first visit downloads the screen you land on
// instead of every screen in the app.
const Home = lazy(() => import('./pages/Home'));
const Add = lazy(() => import('./pages/Add'));
const Detail = lazy(() => import('./pages/Detail'));
const EditTask = lazy(() => import('./pages/EditTask'));
const Profile = lazy(() => import('./pages/Profile'));
const Login = lazy(() => import('./pages/Login'));
const Welcome = lazy(() => import('./pages/Welcome'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Property = lazy(() => import('./pages/Property'));
const Appliances = lazy(() => import('./pages/Appliances'));
const ApplianceDetail = lazy(() => import('./pages/ApplianceDetail'));
const Warranties = lazy(() => import('./pages/Warranties'));
const Household = lazy(() => import('./pages/Household'));
const Notifications = lazy(() => import('./pages/Notifications'));
const NotificationPreferences = lazy(
  () => import('./pages/NotificationPreferences'),
);
const Settings = lazy(() => import('./pages/Settings'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const DeleteAccount = lazy(() => import('./pages/DeleteAccount'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Search = lazy(() => import('./pages/Search'));
const Waitlist = lazy(() => import('./pages/Waitlist'));
const Completed = lazy(() => import('./pages/Completed'));
const Health = lazy(() => import('./pages/Health'));

const WAITLIST_MODE = false;

// Reuses the app's existing full-screen loading state, so waiting on a screen
// chunk looks the same as waiting on the session check.
function RouteFallback() {
  return (
    <div className="auth-loading">
      <Logo size={56} animated />
    </div>
  );
}

function AppRoutes() {
  const { user, loading, hasOnboarded } = useAuth();
  const location = useLocation();

  if (WAITLIST_MODE && location.pathname !== '/waitlist' && !user) {
    return (
      <>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/waitlist" element={<Waitlist />} />
            <Route path="*" element={<Navigate to="/waitlist" replace />} />
          </Routes>
        </Suspense>
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
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Routes>
        </Suspense>
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
          <Suspense fallback={<RouteFallback />}>
            <Welcome />
          </Suspense>
          <CookieConsent />
        </>
      );
    }
    if (location.pathname === '/login') {
      return (
        <>
          <Suspense fallback={<RouteFallback />}>
            <Login />
          </Suspense>
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
        <Suspense fallback={<RouteFallback />}>
          <Onboarding />
        </Suspense>
        <CookieConsent />
      </>
    );
  }

  return (
    <>
      <Suspense fallback={<RouteFallback />}>
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
          <Route
            path="/notification-preferences"
            element={<NotificationPreferences />}
          />
          <Route path="/settings" element={<Settings />} />
          <Route path="/delete-account" element={<DeleteAccount />} />
          <Route path="/search" element={<Search />} />
          <Route path="/waitlist" element={<Waitlist />} />
          <Route path="/completed" element={<Completed />} />
          <Route path="/health" element={<Health />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <TabBar />
      <CookieConsent />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <OnlineStatus />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export { App };