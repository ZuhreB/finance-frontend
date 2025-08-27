import React from 'react';

const TransactionsView = ({
  transactions,
  balance,
  formData,
  handleChange,
  handleSubmit,
  loading,
  error,
  monthlyIncome,
  monthlyExpense,
  isInvestmentTransaction,
  incomeCategories,
  expenseCategories,
  formatCurrency,
  showMonthlyIncome,
  showMonthlyExpense,
  handleIncomeToggle,
  handleExpenseToggle
}) => {
  return (
    <div className="transactions-page">
      <h1>İşlemler</h1>

      {/* Yeni ana grid yapısı */}
      <div className="content-grid">
        {/* İşlem Ekleme Formu (Sol Kısım) */}
        <div className="form-container">
          <h2>Yeni İşlem Ekle</h2>
          {error && <div className="error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Tutar ve Tür alanlarını yan yana getirin */}
            <div className="form-row">
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
            </div>

            {/* Açıklama ve Kategori alanlarını yan yana getirin */}
            <div className="form-row">
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
                {/* Kategori Seçim Kutusu */}
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Kategori Seçin</option>
                  <optgroup label="Gelirler">
                    {incomeCategories.map((cat) => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Giderler">
                    {expenseCategories.map((cat) => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Tarih alanı */}
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

                <div className="form-row">
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
                </div>
              </>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Ekleniyor...' : 'İşlem Ekle'}
            </button>
          </form>
        </div>

        {/* Sağ Kısım: Özetler ve Son İşlemler (2 satırlı düzen) */}
        <div className="right-panel-grid">
          <div className="balance-summary-group">
            <div className="balance-box">
              <h3>Toplam Bakiye</h3>
              <p className={balance >= 0 ? "positive-balance" : "negative-balance"}>
                {formatCurrency(balance)}
              </p>
            </div>

            {/* Aylık Özet */}
            <div className="balance-box">
              <h3>Bu Ayın Özeti</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <h4 onClick={handleIncomeToggle} style={{ cursor: 'pointer' }}>
                    Gelirler 📈 {showMonthlyIncome ? '▼' : '►'}
                  </h4>
                  {showMonthlyIncome && (
                    Object.keys(monthlyIncome).length > 0 ? (
                      Object.keys(monthlyIncome).map(category => (
                        <p key={category} style={{ color: '#28a745' }}>
                          <strong>{category}:</strong> {formatCurrency(monthlyIncome[category])}
                        </p>
                      ))
                    ) : (
                      <p>Bu ay gelir yok.</p>
                    )
                  )}
                </div>
                <div>
                  <h4 onClick={handleExpenseToggle} style={{ cursor: 'pointer' }}>
                    Giderler 📉 {showMonthlyExpense ? '▼' : '►'}
                  </h4>
                  {showMonthlyExpense && (
                    Object.keys(monthlyExpense).length > 0 ? (
                      Object.keys(monthlyExpense).map(category => (
                        <p key={category} style={{ color: '#dc3545' }}>
                          <strong>{category}:</strong> {formatCurrency(monthlyExpense[category])}
                        </p>
                      ))
                    ) : (
                      <p>Bu ay gider yok.</p>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Son İşlemler (Sağ alt kısım) */}
          <div className="transactions-list-container">
            <h3>Son İşlemler</h3>
            {transactions.length === 0 ? (
              <p>Henüz işlem bulunmamaktadır.</p>
            ) : (
              <div className="transactions-scroll-list">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className={`transaction-item ${transaction.type === 'INCOME' || transaction.type === 'CURRENCY_SELL' || transaction.type === 'GOLD_SELL' ? 'income-transaction' : 'expense-transaction'}`}>
                    <div className="transaction-amount">
                      <strong>{formatCurrency(transaction.amount)}</strong>
                    </div>
                    <div className="transaction-detail">
                      <span className="transaction-description">{transaction.description}</span>
                      {transaction.category && <span className="transaction-category">({transaction.category})</span>}
                      {transaction.currencyPair && <span className="transaction-detail"> - {transaction.currencyPair}</span>}
                      {transaction.quantity && <span className="transaction-detail"> - {transaction.quantity} adet</span>}
                      <span className="transaction-date"> - {new Date(transaction.transactionDate).toLocaleDateString('tr-TR')}</span>
                      <span className="transaction-type"> ({transaction.type})</span>
                    </div>
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

export default TransactionsView;