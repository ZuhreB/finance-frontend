import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionAPI } from '../services/transactionAPI';

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

    loadTransactions();
    loadBalance();
  }, [navigate]);

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        // Düzgün bir transaction objesi oluştur
        const transactionData = {
            amount: parseFloat(formData.amount),
            type: formData.type,
            description: formData.description,
            category: formData.category,
            transactionDate: formData.transactionDate
        };

        // Döviz/altın işlemleri için ek alanlar
        if (['CURRENCY_BUY', 'CURRENCY_SELL', 'GOLD_BUY', 'GOLD_SELL'].includes(formData.type)) {
            transactionData.currencyPair = formData.currencyPair;
            transactionData.quantity = parseFloat(formData.quantity);
            transactionData.purchaseRate = parseFloat(formData.purchaseRate);
            
            if (formData.type.endsWith('_SELL')) {
                transactionData.sellingRate = parseFloat(formData.sellingRate);
            }
        }

        console.log('Gönderilen veri:', transactionData);
        
        await transactionAPI.create(transactionData);
        
        // Formu sıfırla
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
        
        // Yeniden verileri yükle
        const [transactionsResponse, balanceResponse] = await Promise.all([
            transactionAPI.getAll(),
            transactionAPI.getBalance()
        ]);
        
        setTransactions(transactionsResponse.data);
        setBalance(balanceResponse.data);
        
    } catch (err) {
        console.error('Hata detayı:', err);
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

  return (
    <div>
      <h1>İşlemler</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* İşlem Ekleme Formu */}
        <div className="form-container">
          <h2>Yeni İşlem Ekle</h2>
          {error && <div className="error">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tutar:</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Tür:</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="EXPENSE">Normal Gider</option>
                <option value="INCOME">Normal Gelir</option>
                <option value="CURRENCY_BUY">Döviz Alış</option>
                <option value="CURRENCY_SELL">Döviz Satış</option>
                <option value="GOLD_BUY">Altın Alış</option>
                <option value="GOLD_SELL">Altın Satış</option>
              </select>
            </div>

            <div className="form-group">
              <label>Açıklama:</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Kategori:</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Tarih:</label>
              <input
                type="date"
                name="transactionDate"
                value={formData.transactionDate}
                onChange={handleChange}
                required
              />
            </div>

            {/* Döviz/Altın İşlemleri için Ek Alanlar */}
            {isInvestmentTransaction && (
              <>
                <div className="form-group">
                  <label>Döviz/Altın Türü:</label>
                  <select
                    name="currencyPair"
                    value={formData.currencyPair}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seçiniz</option>
                    <option value="USD/TRY">USD/TRY</option>
                    <option value="EUR/TRY">EUR/TRY</option>
                    <option value="GBP/TRY">GBP/TRY</option>
                    <option value="GRAM ALTIN">GRAM ALTIN</option>
                    <option value="ÇEYREK ALTIN">ÇEYREK ALTIN</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Miktar:</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    step="0.001"
                    required={isInvestmentTransaction}
                  />
                </div>

                {formData.type.endsWith('_BUY') ? (
                  <div className="form-group">
                    <label>Alış Kuru:</label>
                    <input
                      type="number"
                      name="purchaseRate"
                      value={formData.purchaseRate}
                      onChange={handleChange}
                      step="0.0001"
                      required
                    />
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label>Alış Kuru (önceki):</label>
                      <input
                        type="number"
                        name="purchaseRate"
                        value={formData.purchaseRate}
                        onChange={handleChange}
                        step="0.0001"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Satış Kuru:</label>
                      <input
                        type="number"
                        name="sellingRate"
                        value={formData.sellingRate}
                        onChange={handleChange}
                        step="0.0001"
                        required
                      />
                    </div>
                  </>
                )}
              </>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Ekleniyor...' : 'İşlem Ekle'}
            </button>
          </form>
        </div>

        {/* Bakiye ve İşlem Listesi */}
        <div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '10px', marginBottom: '2rem' }}>
            <h3>Toplam Bakiye</h3>
            <p style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: balance >= 0 ? '#28a745' : '#dc3545' 
            }}>
              {formatCurrency(balance)}
            </p>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '10px' }}>
            <h3>Son İşlemler</h3>
            {transactions.length === 0 ? (
              <p>Henüz işlem bulunmamaktadır.</p>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {transactions.map((transaction) => (
                  <div key={transaction.id} style={{ 
                    padding: '0.5rem', 
                    borderBottom: '1px solid #eee',
                    color: transaction.type === 'INCOME' || 
                           transaction.type === 'CURRENCY_SELL' || 
                           transaction.type === 'GOLD_SELL' ? '#28a745' : '#dc3545'
                  }}>
                    <strong>{formatCurrency(transaction.amount)}</strong> - 
                    {transaction.description} 
                    {transaction.category && ` (${transaction.category})`}
                    {transaction.currencyPair && ` - ${transaction.currencyPair}`}
                    {transaction.quantity && ` - ${transaction.quantity} adet`}
                    {' - '}
                    {new Date(transaction.transactionDate).toLocaleDateString('tr-TR')}
                    <br />
                    <small style={{ color: '#666' }}>
                      {transaction.type}
                    </small>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;