import React, { useEffect, useState } from 'react';
import ExchangeRateService from '../services/ExchangeRateService';
import ChatBot from './ChatBot';
import { subscriptionAPI } from '../services/subscriptionAPI'; // Yeni: API servisini import et
import '../styles/LiveExchangeRates.css'; 

const LiveExchangeRates = () => {
    const [rates, setRates] = useState({});
    const [isConnected, setIsConnected] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [notifications, setNotifications] = useState([]); // Yeni: Bildirimleri saklayacak state
    const [subscribedPairs, setSubscribedPairs] = useState([]); // Yeni: Takip edilen kurları saklayacak state

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
        
        // Yeni: Tekil kur değişim bildirimlerini ele alacak fonksiyon
        const handleNotification = (notificationData) => {
            if (isMounted) {
                const [pair, rate] = Object.entries(notificationData)[0];
                const message = `${pair} kuru güncellendi: Yeni fiyat ${rate} ₺`;
                console.log('Yeni bildirim:', message);
                setNotifications(prevNotifications => [
                    { id: Date.now(), message: message, timestamp: new Date() },
                    ...prevNotifications
                ].slice(0, 5)); // En fazla 5 bildirim göster
            }
        };

        console.log('Component mounted, WebSocket bağlantısı kuruluyor...');
        // Yeni callback'i connect fonksiyonuna gönder
        ExchangeRateService.connect(handleRatesUpdate, handleConnectionChange, handleNotification);

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

    // Yeni: Abonelik durumunu değiştirecek fonksiyon
    const handleSubscribeToggle = async (currencyPair) => {
        try {
            const isSubscribed = subscribedPairs.includes(currencyPair);
            if (isSubscribed) {
                await subscriptionAPI.removeSubscription(currencyPair);
                setSubscribedPairs(prev => prev.filter(pair => pair !== currencyPair));
                alert(`${currencyPair} takibi kaldırıldı.`);
            } else {
                await subscriptionAPI.addSubscription(currencyPair);
                setSubscribedPairs(prev => [...prev, currencyPair]);
                alert(`${currencyPair} takibe alındı. Fiyatı değişince size bildirim gelecek.`);
            }
        } catch (error) {
            console.error("Abonelik işlemi başarısız oldu:", error);
            alert("Abonelik işlemi sırasında bir hata oluştu.");
        }
    };

    // Diğer yardımcı fonksiyonlar...
    const formatRate = (pair, rate) => {
        // ... (mevcut kodunuz)
        if (pair === 'GRAM ALTIN') {
            return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(rate);
        }
        return new Intl.NumberFormat('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(rate);
    };

    const isMajorPair = (pair) => {
        // ... (mevcut kodunuz)
        const majorPairs = ['USD/TRY', 'EUR/TRY', 'GBP/TRY'];
        return majorPairs.includes(pair);
    };

    const getItemClassName = (pair) => {
        let className = 'ratesItem';
        if (pair === 'GRAM ALTIN') {
            className += ' gold-item';
        }
        // Eğer kullanıcı bu kura abone ise, butonu farklı renkte gösterelim
        if (subscribedPairs.includes(pair)) {
            className += ' subscribed-item';
        }
        return className;
    };
    
    return (
        <div className="liveRatesPage">
            <h1>Canlı Döviz ve Altın Kurları</h1>
            
            {/* Bağlantı durumu ve son güncelleme zamanı */}
            <div className="statusContainer">
                <span className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
                    {isConnected ? 'Bağlı' : 'Bağlantı kesik'}
                </span>
                {lastUpdated && (
                    <span className="lastUpdated">
                        Son Güncelleme: {lastUpdated.toLocaleTimeString('tr-TR')}
                    </span>
                )}
                <button onClick={handleManualRefresh} className="refreshButton">
                    Manuel Yenile
                </button>
            </div>

            {Object.keys(rates).length > 0 ? (
                <>
                    {/* Yeni: Bildirim Kutusu */}
                    <div className="notificationBox">
                        <h3>Bildirimler</h3>
                        {notifications.length > 0 ? (
                            <ul>
                                {notifications.map((notification) => (
                                    <li key={notification.id} className="notificationItem">
                                        <span>{notification.message}</span>
                                        <span className="notificationTime">
                                            ({notification.timestamp.toLocaleTimeString('tr-TR')})
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="noNotifications">Henüz bildirim yok.</p>
                        )}
                    </div>

                    <div className="ratesGrid">
                        {Object.entries(rates)
                            .sort(([a], [b]) => {
                                if (a === 'GRAM ALTIN') return -1;
                                if (b === 'GRAM ALTIN') return 1;
                                if (isMajorPair(a) && !isMajorPair(b)) return -1;
                                if (!isMajorPair(a) && isMajorPair(b)) return 1;
                                return a.localeCompare(b);
                            })
                            .map(([pair, rate]) => (
                                <div key={pair} className={getItemClassName(pair)}>
                                    <div className="rate-content">
                                        <span className="pair">{pair}</span>
                                        <span className="rate">{formatRate(pair, rate)}</span>
                                    </div>
                                    {/* Yeni: Abonelik butonu */}
                                    <button
                                        onClick={() => handleSubscribeToggle(pair)}
                                        className={`subscribe-btn ${subscribedPairs.includes(pair) ? 'subscribed' : ''}`}
                                    >
                                        {subscribedPairs.includes(pair) ? 'Takipte' : 'Takip Et'}
                                    </button>
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