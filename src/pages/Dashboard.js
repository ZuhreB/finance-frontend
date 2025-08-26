import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionAPI } from '../services/transactionAPI';
import '../styles/Dashboard.css';
const Dashboard = () => {
  const [balance, setBalance] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadDashboardData = useCallback(async () => {
    console.log('Loading dashboard data...');
    try {
      const [balanceResponse, transactionsResponse] = await Promise.all([
        transactionAPI.getBalance(),
        transactionAPI.getAll()
      ]);

      setBalance(balanceResponse.data);
      setRecentTransactions(transactionsResponse.data.slice(0, 5));
    } catch (err) {
      console.error('Dashboard verileri yüklenemedi:', err);
      if (err.response?.status === 401) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              console.log('Unauthorized! Redirecting to login.');
              navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]); // useCallback, navigate fonksiyonuna bağımlı

  useEffect(() => {
    // Artık stabil olan bu fonksiyonu güvenle çağırabiliriz.
    loadDashboardData();
  }, [loadDashboardData]); // useEffect, loadDashboardData fonksiyonuna bağımlı

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Yükleniyor...</div>;
  }

  return (
    <div className="container">
    <h1 className="Title">
      Hoş Geldiniz, {user.username}!
    </h1>
    <div className="cards">
      <div className="bakiye">
        <h3 className="titleBalance">Toplam Bakiye</h3>
        <p className={`balance ${balance >= 0 ? 'positive' : 'negative'}`}> 
          {formatCurrency(balance)}
        </p>
      </div>

      <div className="recentTransactions">
        <h3 className="titleTransactions">Son İşlemler</h3>
        {recentTransactions.length === 0 ? (
          <p className="noTransactions">Henüz işlem bulunmamaktadır.</p>
        ) : (
          <ul className="transactionList">
            {recentTransactions.map((transaction) => (
              <li
                key={transaction.id}
                className={`transaction-item ${
                  transaction.type === 'INCOME' ? 'income' : 'expense'
                }`}
              >
                <div className="transactionDetails">
                  <span
                    className={`amount ${
                      transaction.type === 'INCOME'
                        ? 'income-amount'
                        : 'expense-amount'
                    }`}
                  >
                    {formatCurrency(transaction.amount)}
                  </span>
                  <span className="description">
                    {transaction.description} ({transaction.category})
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </div>
  );
};

export default Dashboard;