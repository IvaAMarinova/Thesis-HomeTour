import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query';
import Login from './pages/login';
import Home from './pages/home';
import { HttpService } from './services/http-service';
import Properties from './pages/properties';
import Property from './pages/property';
import './App.css';
import Header from './components/header';
import Company from './pages/company';
import Companies from './pages/companies';
import Profile from './pages/profile';
import { UserProvider, useUser } from './contexts/UserContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from './components/footer';
import { CookiesProvider } from 'react-cookie';
import EditProperties from './pages/edit-properties';
import EditProperty from './pages/edit-property';
import EditCompany from './pages/edit-company';
import { PrivateRoute } from './pages/unauthorized/private-route';
import Unauthorized from './pages/unauthorized';
import { useLocation } from 'react-router-dom';
import { LoadingSpinner } from './components/ui/loading-spinner';
import { GoogleOAuthProvider } from "@react-oauth/google";

const queryClient = new QueryClient();

function AppContent() {
  const { fetchUserId } = useUser();
  const { userType } = useUser();
  const queryClient = useQueryClient();
  const location = useLocation();

  const { data: isAuthenticated, isLoading } = useQuery({
    queryKey: ['isAuthenticated'],
    queryFn: async () => {
      try {
        const authenticated = await HttpService.isAuthenticated(fetchUserId);
        console.log("[React Query] Authentication status: ", authenticated);
        return authenticated;
      } catch (error) {
        console.error("[React Query] Error during authentication check:", error);
        return false;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const handleLoginSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['isAuthenticated'] });
  };

  if (isLoading && location.pathname !== '/') {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner size={96} className="text-gray-500" />
        </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow">
        <ToastContainer />
        <Routes>
          <Route
            path="/login"
            element={<Login onLoginSuccess={handleLoginSuccess} />}
          />
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<Property />} />
          <Route path="/companies/:id" element={<Company />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route
            element={<PrivateRoute isLoggedIn={isAuthenticated ?? false} allowedRoles={['b2b']} userRole={userType} />}
          >
            <Route path="/edit-properties/:id" element={<EditProperties />} />
            <Route path="/edit-property/:id" element={<EditProperty />} />
            <Route path="/edit-company/:id" element={<EditCompany />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <CookiesProvider>
            <Router>
              <AppContent />
            </Router>
          </CookiesProvider>
        </UserProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;