import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionAPI } from '../services/transactionAPI';
import '../styles/Transactions.css';
import TransactionsView from './TransactionsView';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'EXPENSE',
    description: '',
    category: '',
    transactionDate: new Date().toISOString().split('T')[0],
    currencyPair: '',
    quantity: '',
    purchaseRate: '',
    sellingRate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState({});
  const [monthlyExpense, setMonthlyExpense] = useState({});
  const [showMonthlyIncome, setShowMonthlyIncome] = useState(false);
  const [showMonthlyExpense, setShowMonthlyExpense] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      navigate('/login');
      return;
    }

    const loadTransactions = async () => {
      try {
        const response = await transactionAPI.getAll();
        setTransactions(response.data);
      } catch (err) {
        setError('İşlemler yüklenemedi');
      }
    };

    const loadBalance = async () => {
      try {
        const response = await transactionAPI.getBalance();
        setBalance(response.data);
      } catch (err) {
        console.error('Bakiye yüklenemedi');
      }
    };

    const loadMonthlySummary = async () => {
      try {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

        const incomeSummaryResponse = await transactionAPI.getTransactionsSummaryByDateRangeAndType(firstDayOfMonth, lastDayOfMonth, 'INCOME');
        const expenseSummaryResponse = await transactionAPI.getTransactionsSummaryByDateRangeAndType(firstDayOfMonth, lastDayOfMonth, 'EXPENSE');

        setMonthlyIncome(incomeSummaryResponse.data);
        setMonthlyExpense(expenseSummaryResponse.data);
      } catch (err) {
        console.error('Aylık özet yüklenemedi');
      }
    };

    loadTransactions();
    loadBalance();
    loadMonthlySummary();
  }, [navigate]);

  const incomeCategories = [
    { name: 'Maaş', amount: 0 },
    { name: 'Ek Gelir', amount: 0 },
    { name: 'Kira Geliri', amount: 0 },
  ];

  const expenseCategories = [
    { name: 'Ev Kirası', amount: 0 },
    { name: 'Su Faturası', amount: 0 },
    { name: 'Elektrik Faturası', amount: 0 },
    { name: 'Doğalgaz Faturası', amount: 0 },
    { name: 'Market', amount: 0 },
    { name: 'Ulaşım', amount: 0 },
    { name: 'İnternet', amount: 0 },
    { name: 'Telefon Faturası', amount: 0 },
  ];

  // Bu fonksiyon artık kullanılmayacak, kaldırabilirsiniz.
  // const handleCategoryClick = (category, type, amount) => {
  //   setFormData({
  //     ...formData,
  //     category: category,
  //     description: category,
  //     type: type,
  //     amount: amount === 0 ? '' : amount.toString()
  //   });
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const transactionData = {
        amount: parseFloat(formData.amount),
        type: formData.type,
        description: formData.description,
        category: formData.category,
        transactionDate: formData.transactionDate
      };

      if (['CURRENCY_BUY', 'CURRENCY_SELL', 'GOLD_BUY', 'GOLD_SELL'].includes(formData.type)) {
        transactionData.currencyPair = formData.currencyPair;
        transactionData.quantity = parseFloat(formData.quantity);
        transactionData.purchaseRate = parseFloat(formData.purchaseRate);

        if (formData.type.endsWith('_SELL')) {
          transactionData.sellingRate = parseFloat(formData.sellingRate);
        }
      }

      await transactionAPI.create(transactionData);

      setFormData({
        amount: '',
        type: 'EXPENSE',
        description: '',
        category: '',
        transactionDate: new Date().toISOString().split('T')[0],
        currencyPair: '',
        quantity: '',
        purchaseRate: '',
        sellingRate: ''
      });

      const [transactionsResponse, balanceResponse] = await Promise.all([
        transactionAPI.getAll(),
        transactionAPI.getBalance()
      ]);

      setTransactions(transactionsResponse.data);
      setBalance(balanceResponse.data);
      
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'İşlem eklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const isInvestmentTransaction = ['CURRENCY_BUY', 'CURRENCY_SELL', 'GOLD_BUY', 'GOLD_SELL'].includes(formData.type);

  const handleIncomeToggle = () => setShowMonthlyIncome(!showMonthlyIncome);
  const handleExpenseToggle = () => setShowMonthlyExpense(!showMonthlyExpense);

  return (
    <TransactionsView
      transactions={transactions}
      balance={balance}
      formData={formData}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      loading={loading}
      error={error}
      monthlyIncome={monthlyIncome}
      monthlyExpense={monthlyExpense}
      isInvestmentTransaction={isInvestmentTransaction}
      // handleCategoryClick prop'u artık kaldırılabilir
      incomeCategories={incomeCategories}
      expenseCategories={expenseCategories}
      formatCurrency={formatCurrency}
      showMonthlyIncome={showMonthlyIncome}
      showMonthlyExpense={showMonthlyExpense}
      handleIncomeToggle={handleIncomeToggle}
      handleExpenseToggle={handleExpenseToggle}
    />
  );
};

export default Transactions;