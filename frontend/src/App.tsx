import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/login';
import Home from './pages/home';
import { HttpService } from './services/http-service';
import Property from './pages/property';
import './App.css';

function Header() {
  return (
    <header className="bg-gray-800 text-white p-4 fixed top-0 left-0 right-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Home Tour - Virtual</Link>
        <nav>
          <Link to="/login" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Login
          </Link>
          <Link to="/property" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Properties
          </Link>
        </nav>
      </div>
    </header>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    setIsAuthenticated(HttpService.isAuthenticated());
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex flex-col">
          <Routes>
            <Route path="/login" element={
              isAuthenticated ? <Navigate to="/" replace /> : <Login onLoginSuccess={() => setIsAuthenticated(true)} />
            } />
            <Route path="/" element={<Home />} />
            <Route path="/property" element={<Property />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
