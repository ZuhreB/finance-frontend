import React, { useState } from 'react';
import { transactionAPI } from '../services/transactionAPI';
import '../styles/Reports.css'; // CSS dosyasını import edin

const Reports = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [profitLossData, setProfitLossData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: 'ALL',
    period: 'custom'
  });

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₺0,00';
    const numberAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(numberAmount);
  };

  const handleFetchReports = async () => {
    if (!startDate || !endDate) {
      setError('Lütfen bir tarih aralığı seçin.');
      return;
    }
    setLoading(true);
    setError('');
    setReportData(null);
    setCategoryData([]);
    setProfitLossData(null);

    try {
      const summaryResponse = await transactionAPI.getTransactionsSummaryByDateRange(startDate, endDate);
      setReportData(summaryResponse.data);
      
      if (filters.type !== 'ALL') {
        try {
          const categoryResponse = await fetch(`http://localhost:8080/api/transactions/reports/category-breakdown?startDate=${startDate}&endDate=${endDate}&type=${filters.type}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (categoryResponse.ok) {
            const categoryResult = await categoryResponse.json();
            const categoryArray = Object.entries(categoryResult).map(([category, amount]) => ({
              category,
              amount
            }));
            setCategoryData(categoryArray);
          }
        } catch (categoryErr) {
          console.error('Kategori verileri alınamadı:', categoryErr);
        }
      } else {
        setCategoryData([]);
      }

      const profitLossResponse = await transactionAPI.getInvestmentProfitLoss(startDate, endDate);
      setProfitLossData(profitLossResponse.data);

    } catch (err) {
      console.error('Raporlar alınamadı:', err);
      setError('Raporlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (period) => {
    setFilters({...filters, period});
    
    const today = new Date();
    let start, end;
    
    switch (period) {
      case 'this_month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'last_month':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'this_year':
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date(today.getFullYear(), 11, 31);
        break;
      default:
        return;
    }
    
    if (start && end) {
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    }
  };

  const getCombinedProfitLossData = () => {
    if (!profitLossData || (!profitLossData.realizedProfitLossByAsset && !profitLossData.unrealizedProfitLossByAsset)) {
      return {};
    }

    const combined = { ...profitLossData.realizedProfitLossByAsset, ...profitLossData.unrealizedProfitLossByAsset };
    return combined;
  };

  const combinedProfitLoss = getCombinedProfitLossData();
  const hasInvestmentData = Object.keys(combinedProfitLoss).length > 0;

  return (
    <div className="reports-container">
      <h2 className="reports-title">Raporlar</h2>
      <p>Belli bir tarih aralığındaki gelir, gider ve kategorilere göre dağılımı görüntüleyin.</p>

      {/* Gelişmiş Filtreler */}
      <div className="advanced-filters">
        <div className="form-group">
          <label>İşlem Türü</label>
          <select 
            value={filters.type} 
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className="form-select"
          >
            <option value="ALL">Tüm İşlemler</option>
            <option value="INCOME">Sadece Gelirler</option>
            <option value="EXPENSE">Sadece Giderler</option>
          </select>
        </div>

        <div className="form-group">
          <label>Hızlı Seçim</label>
          <select 
            value={filters.period} 
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="form-select"
          >
            <option value="custom">Özel Tarih</option>
            <option value="this_month">Bu Ay</option>
            <option value="last_month">Geçen Ay</option>
            <option value="this_year">Bu Yıl</option>
          </select>
        </div>
      </div>

      <div className="date-filter-box">
        <div className="form-group">
          <label htmlFor="startDate">Başlangıç Tarihi</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDate">Bitiş Tarihi</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="form-input"
          />
        </div>
        <button 
          onClick={handleFetchReports} 
          className="primary-btn" 
          disabled={loading}
        >
          {loading ? 'Yükleniyor...' : 'Rapor Oluştur'}
        </button>
      </div>

      {loading && <p className="loading-text">Yükleniyor...</p>}
      {error && <p className="error-message">{error}</p>}

      {reportData && (
        <div>
          {/* Özet Kartları */}
          <div className="summary-grid">
            <div className="summary-card summary-card-income">
              <h3>Toplam Gelir</h3>
              <p className={`summary-amount amount-positive`}>
                {formatCurrency(reportData.totalIncome)}
              </p>
            </div>
            <div className="summary-card summary-card-expense">
              <h3>Toplam Gider</h3>
              <p className={`summary-amount amount-negative`}>
                {formatCurrency(reportData.totalExpense)}
              </p>
            </div>
            <div className="summary-card summary-card-balance">
              <h3>Net Bakiye</h3>
              <p className={`summary-amount ${(reportData.totalIncome || 0) - (reportData.totalExpense || 0) >= 0 ? 'amount-positive' : 'amount-negative'}`}>
                {formatCurrency((reportData.totalIncome || 0) - (reportData.totalExpense || 0))}
              </p>
            </div>
          </div>

          {/* Aylık Gelir/Gider Özeti */}
          <div className="monthly-summary">
            <h3>📅 Aylık Özet</h3>
            <div className="monthly-grid">
              <div className="monthly-item">
                <h4>Ortalama Aylık Gelir</h4>
                <p className="summary-amount amount-positive">
                  {formatCurrency((reportData.totalIncome || 0) / 12)}
                </p>
              </div>
              <div className="monthly-item">
                <h4>Ortalama Aylık Gider</h4>
                <p className="summary-amount amount-negative">
                  {formatCurrency((reportData.totalExpense || 0) / 12)}
                </p>
              </div>
              <div className="monthly-item">
                <h4>Ortalama Aylık Net</h4>
                <p className={`summary-amount ${((reportData.totalIncome || 0) - (reportData.totalExpense || 0)) / 12 >= 0 ? 'amount-positive' : 'amount-negative'}`}>
                  {formatCurrency(((reportData.totalIncome || 0) - (reportData.totalExpense || 0)) / 12)}
                </p>
              </div>
            </div>
          </div>

          {/* Kategori Bazlı Detaylar */}
          {categoryData.length > 0 && (
            <div className="category-details">
              <h3>
                {filters.type === 'INCOME' ? '💰 Gelir Kategorileri' : '🏷️ Gider Kategorileri'}
              </h3>
              <div className="category-list">
                {categoryData.map((category, index) => (
                  <div key={index} className={`category-item ${filters.type === 'INCOME' ? 'category-income' : 'category-expense'}`}>
                    <span>{category.category}</span>
                    <span className={filters.type === 'INCOME' ? 'amount-positive' : 'amount-negative'}>
                      {formatCurrency(category.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Yatırım Kar/Zarar Raporu */}
          {profitLossData && profitLossData.profitLossByAsset && Object.keys(profitLossData.profitLossByAsset).length > 0 && (
            <div className="investment-report">
              <h3>📈 Yatırım Kar/Zarar Raporu (Mevcut Piyasa)</h3>
                <div className="investment-list">
                  <div className={`investment-item ${profitLossData.totalProfitLoss > 0 ? 'investment-positive' : 'investment-negative'}`}>
                    <span>Toplam Kar/Zarar</span>
                    <span className={profitLossData.totalProfitLoss > 0 ? 'amount-positive' : 'amount-negative'}>
                        {formatCurrency(profitLossData.totalProfitLoss)}
                    </span>
                  </div>
                    {Object.entries(profitLossData.profitLossByAsset).map(([asset, profitLoss], index) => (
                      <div key={index} className={`investment-item ${profitLoss > 0 ? 'investment-positive' : 'investment-negative'}`}>
                        <span>{asset}</span>
                          <div className="investment-details">
                        <span>Miktar: {profitLossData.currentHoldings[asset]}</span>
                    <span>Güncel Fiyat: {formatCurrency(profitLossData.currentRates[asset])}</span>
                      <span>Toplam Yatırım: {formatCurrency(profitLossData.totalInvestmentByAsset[asset])}</span>
                        <span className={profitLoss > 0 ? 'amount-positive' : 'amount-negative'}>
                          {formatCurrency(profitLoss)}
                        </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          
        </div>
      )}
    </div>
  );
};

export default Reports;