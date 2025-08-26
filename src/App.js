import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route ,Navigate} from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import { AuthProvider } from './context/AuthContext';
import Reports from './pages/Reports'; 
import LiveExchangeRates from './components/LiveExchangeRates';
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check login status from localStorage on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    setIsAuthenticated(!!token && !!user);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout isAuthenticated={isAuthenticated} onLogout={handleLogout} />}>
          <Route index element={<Home isAuthenticated={isAuthenticated} />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="reports" element={<Reports />} /> 
          <Route path="/exchange-rates" element={<LiveExchangeRates />} />
        </Route>
      </Routes>
    </Router>
  );
}
export default App;