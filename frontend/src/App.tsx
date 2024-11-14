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
import { UserProvider } from './contexts/UserContext';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    setIsAuthenticated(HttpService.isAuthenticated());
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return (
    <UserProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header />
          <div className="flex-grow">
            <Routes>
              <Route path="/login" element={<Login onLoginSuccess={() => setIsAuthenticated(true)} />} />
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/properties/:id" element={<Property />} />
              <Route path="/companies/:id" element={<Company />} />
              <Route path="/companies" element={<Companies />} />
            </Routes>
          </div>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
