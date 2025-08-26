import React, { useEffect, useState } from 'react';
import ExchangeRateService from '../services/ExchangeRateService';
import ChatBot from './ChatBot';
import '../styles/LiveExchangeRates.css'; // CSS dosyasını import edin

const LiveExchangeRates = () => {
    const [rates, setRates] = useState({});
    const [isConnected, setIsConnected] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const handleRatesUpdate = (newRates) => {
            if (isMounted) {
                console.log('Gelen döviz ve altın verileri:', newRates);
                setRates(newRates);
                setLastUpdated(new Date());
            }
        };

        const handleConnectionChange = (connected) => {
            if (isMounted) {
                console.log('Bağlantı durumu değişti:', connected);
                setIsConnected(connected);
            }
        };

        console.log('Component mounted, WebSocket bağlantısı kuruluyor...');
        ExchangeRateService.connect(handleRatesUpdate, handleConnectionChange);

        return () => {
            console.log('Component unmounted, WebSocket bağlantısı kapatılıyor...');
            isMounted = false;
            ExchangeRateService.disconnect();
        };
    }, []);

    const handleManualRefresh = () => {
        console.log('Manuel güncelleme isteniyor...');
        ExchangeRateService.requestRates();
    };

    const isMajorPair = (pair) => {
        const majorPairs = ['USD/TRY', 'EUR/TRY', 'GBP/TRY', 'USD/EUR', 'EUR/USD', 'GRAM ALTIN'];
        return majorPairs.includes(pair);
    };

    const formatRate = (pair, rate) => {
        if (pair === 'GRAM ALTIN') {
            return parseFloat(rate).toFixed(2);
        }
        return parseFloat(rate).toFixed(4);
    };

    const getItemClassName = (pair) => {
        if (pair === 'GRAM ALTIN') {
            return 'goldRateItem';
        }
        return isMajorPair(pair) ? 'majorRateItem' : 'rateItem';
    };

    return (
        <div className="container">
            <div className="header">
                <h2>Canlı Döviz ve Altın Kurları</h2>
                <div className="connectionStatus">
                    <span className={isConnected ? 'statusConnected' : 'statusDisconnected'}>
                        {isConnected ? '🟢 Gerçek Zamanlı Veri' : '🔴 Demo Veri'}
                    </span>
                    {lastUpdated && (
                        <span className="lastUpdated">
                            Son güncelleme: {lastUpdated.toLocaleTimeString('tr-TR')}
                        </span>
                    )}
                </div>
            </div>
            
            <button onClick={handleManualRefresh} className="refreshBtn">
                ↻ Manuel Güncelle
            </button>

            {rates && Object.keys(rates).length > 0 ? (
                <>
                    {!isConnected && (
                        <div className="demoWarning">
                            <p>
                                ⚠️ Gerçek zamanlı verilere bağlanılamıyor. Son alınan veriler gösteriliyor.
                            </p>
                        </div>
                    )}
                    
                    <div className="ratesGrid">
                        {Object.entries(rates)
                            .sort(([a], [b]) => {
                                // Önce altın, sonra ana döviz çiftleri, sonra diğerleri
                                if (a === 'GRAM ALTIN') return -1;
                                if (b === 'GRAM ALTIN') return 1;
                                if (isMajorPair(a) && !isMajorPair(b)) return -1;
                                if (!isMajorPair(a) && isMajorPair(b)) return 1;
                                return a.localeCompare(b);
                            })
                            .map(([pair, rate]) => (
                                <div key={pair} className={getItemClassName(pair)}>
                                    <span className="pair">{pair}</span>
                                    <span className="rate">
                                        {formatRate(pair, rate)}
                                    </span>
                                </div>
                            ))
                        }
                    </div>
                </>
            ) : (
                <div className="noData">
                    <p>Döviz kuru ve altın verileri yükleniyor...</p>
                </div>
            )}
            <ChatBot />
        </div>
    );
};

export default LiveExchangeRates;