// Layout.js
import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import '../styles/Layout.css';

const Layout = ({ isAuthenticated, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="container">
          <Link to="/" className="logo">
            💰 FinanceApp
          </Link>
          
          <nav className="nav">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/transactions">İşlemler</Link>
                <Link to="/reports">Raporlar</Link>
                <Link to="/exchange-rates">Döviz Kurları</Link> {/* Yeni link */}
                <button onClick={handleLogout} className="logout-btn">
                  Çıkış Yap
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Giriş Yap</Link>
                <Link to="/register">Kayıt Ol</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <Outlet />
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 FinanceApp - Kişisel Finans Yönetimi</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;