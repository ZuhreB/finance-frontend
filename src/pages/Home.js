import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const isLoggedIn = localStorage.getItem('user') !== null;

  return (
    <div style={{ textAlign: 'center', padding: '3rem 0' }}>
      <h1>💰 FinanceApp'e Hoş Geldiniz</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
        Kişisel finanslarınızı kolayca yönetin, gelir-gider takibi yapın ve tasarruf edin.
      </p>
      
      {!isLoggedIn ? (
        <div>
          <Link to="/register" className="btn-primary" style={{ display: 'inline-block', margin: '0 0.5rem' }}>
            Hemen Başla
          </Link>
          <Link to="/login" style={{ display: 'inline-block', margin: '0 0.5rem', padding: '0.75rem 1.5rem' }}>
            Giriş Yap
          </Link>
        </div>
      ) : (
        <Link to="/dashboard" className="btn-primary" style={{ display: 'inline-block' }}>
          Dashboard'a Git
        </Link>
      )}
    </div>
  );
};

export default Home;