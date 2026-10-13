import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import TabBar from './components/TabBar';

function AppRoutes() {
  const { user, loading, hasOnboarded } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="auth-logo">🏠</div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  if (!hasOnboarded) {
    return (
      <Routes>
        <Route path="*" element={<Onboarding />} />
      </Routes>
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
        <Route path="/notification-preferences" element={<NotificationPreferences />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <TabBar />
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
