import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ShopProvider } from '@/context/ShopContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Home } from '@/pages/Home';
import { CakeDetails } from '@/pages/CakeDetails';
import { AdminLogin } from '@/pages/AdminLogin';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { CakeForm } from '@/pages/CakeForm';
import { AdminSettings } from '@/pages/AdminSettings';
import { Toaster } from '@/components/ui/sonner';

// Protected route component for admin
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/manage" replace />;
  }
  
  return <>{children}</>;
}

// Public layout with header and footer
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route
              path="/"
              element={
                <PublicLayout>
                  <Home />
                </PublicLayout>
              }
            />
            <Route
              path="/cake/:id"
              element={
                <PublicLayout>
                  <CakeDetails />
                </PublicLayout>
              }
            />

            {/* Admin routes - hidden at /manage */}
            <Route path="/manage" element={<AdminLogin />} />
            <Route
              path="/manage/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage/cake/new"
              element={
                <ProtectedRoute>
                  <CakeForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage/cake/edit/:id"
              element={
                <ProtectedRoute>
                  <CakeForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage/settings"
              element={
                <ProtectedRoute>
                  <AdminSettings />
                </ProtectedRoute>
              }
            />

            {/* Redirect old /admin to /manage */}
            <Route path="/admin" element={<Navigate to="/manage" replace />} />
            <Route path="/admin/*" element={<Navigate to="/manage" replace />} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </ShopProvider>
    </AuthProvider>
  );
}

export default App;
