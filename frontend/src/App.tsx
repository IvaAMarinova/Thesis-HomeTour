import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
import EditCompany from './pages/edit-company'

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { fetchUserId } = useUser();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const authenticated = await HttpService.isAuthenticated(fetchUserId);
        setIsAuthenticated(authenticated);
      } catch (error) {
        console.error("[AppContent] Error during authentication check:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuthentication();
  }, [fetchUserId]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow">
        <ToastContainer />
        <Routes>
          <Route path="/login" element={<Login onLoginSuccess={() => setIsAuthenticated(true)} />} />
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<Property />} />
          <Route path="/companies/:id" element={<Company />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/edit-properties/:id" element={<EditProperties />} />
          <Route path="/edit-property/:id" element={<EditProperty />} />
          <Route path="/edit-company/:id" element={<EditCompany />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <CookiesProvider>
        <Router>
          <AppContent />
        </Router>
      </CookiesProvider>
    </UserProvider>
  );
}

export default App;