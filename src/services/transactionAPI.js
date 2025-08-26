import api from './api';

export const transactionAPI = {
  create: (transactionData) => api.post('/transactions', transactionData),
  getFiltered: (filters) => {
    return api.get('/transactions', { params: filters });
  },
  getAll: () => api.get('/transactions'),
  getBalance: () => api.get('/transactions/balance'),
  getByType: (type) => api.get(`/transactions/type/${type}`),

  // Yeni eklenecek fonksiyon: Belirli tarih aralığındaki işlemleri getirir
  getTransactionsSummaryByDateRange: (startDate, endDate) => {
    return api.get(`/transactions/reports/summary`, {
      params: {
        startDate: startDate,
        endDate: endDate,
      },
    });
  },

  getInvestmentProfitLoss: (startDate, endDate) => {
    return api.get(`/transactions/reports/investment-profit-loss`, {
      params: {
        startDate: startDate,
        endDate: endDate,
      },
    });
  },
};