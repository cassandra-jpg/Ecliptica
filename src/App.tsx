import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminSignupPage from './pages/AdminSignupPage';
import AdminDashboard from './pages/AdminDashboard';
import PartnerDashboard from './pages/PartnerDashboard';
import ClientDashboard from './pages/ClientDashboard';
import MembersPage from './pages/MembersPage';
import NewsletterPage from './pages/NewsletterPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin-signup" element={<AdminSignupPage />} />

          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/partner"
            element={
              <ProtectedRoute allowedRoles={['partner']}>
                <PartnerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/client"
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <ClientDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/members" element={<MembersPage />} />

          <Route path="/newsletter" element={<NewsletterPage />} />

          <Route
            path="/"
            element={
              <div className="flex">
                <Sidebar />
                <main className="lg:ml-60 w-full">
                  <HomePage />
                </main>
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
