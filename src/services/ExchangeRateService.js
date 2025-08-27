class ExchangeRateService {
    constructor() {
        this.socket = null;
        this.onRatesUpdate = null;
        this.onConnectionChange = null;
        this.reconnectInterval = null;
        this.isConnecting = false;
    }

    connect(onRatesUpdate, onConnectionChange) {
        // Eğer zaten bağlanıyorsak çık
        if (this.isConnecting) return;
        
        this.onRatesUpdate = onRatesUpdate;
        this.onConnectionChange = onConnectionChange;
        this.isConnecting = true;
        
        console.log('WebSocket bağlantısı kuruluyor...');
        
        // Önceki bağlantıyı temizle
        this.disconnect();
        
        try {
            this.socket = new WebSocket('ws://localhost:8080/ws/exchange-rates');
            
            this.socket.onopen = () => {
                console.log('WebSocket bağlantısı kuruldu');
                this.isConnecting = false;
                if (this.onConnectionChange) {
                    this.onConnectionChange(true);
                }
                
                // Bağlantı kurulunca ilk veriyi iste
                this.socket.send('getRates');
                
                // Otomatik yeniden bağlanmayı temizle
                if (this.reconnectInterval) {
                    clearInterval(this.reconnectInterval);
                    this.reconnectInterval = null;
                }
            };
            
            this.socket.onmessage = (event) => {
                try {
                    console.log('WebSocket mesajı alındı:', event.data);
                    
                    const rates = JSON.parse(event.data);
                    console.log('Parsed döviz verileri:', rates);
                    
                    if (this.onRatesUpdate && rates && typeof rates === 'object') {
                        this.onRatesUpdate(rates);
                    }
                } catch (error) {
                    console.error('WebSocket mesaj işleme hatası:', error, 'Ham veri:', event.data);
                }
            };
            
            this.socket.onclose = (event) => {
                console.log('WebSocket bağlantısı kapandı, yeniden bağlanılıyor...', event.code, event.reason);
                this.isConnecting = false;
                if (this.onConnectionChange) {
                    this.onConnectionChange(false);
                }
                this.handleReconnect();
            };
            
            this.socket.onerror = (error) => {
                console.error('WebSocket hatası:', error);
                this.isConnecting = false;
                if (this.onConnectionChange) {
                    this.onConnectionChange(false);
                }
            };
            
        } catch (error) {
            console.error('WebSocket bağlantı hatası:', error);
            this.isConnecting = false;
            if (this.onConnectionChange) {
                this.onConnectionChange(false);
            }
            this.handleReconnect();
        }
    }

    handleReconnect() {
        // Zaten yeniden bağlanma attempt'i varsa çık
        if (this.reconnectInterval) return;
        
        // 5 saniyede bir yeniden bağlanmayı dene
        this.reconnectInterval = setInterval(() => {
            console.log('Yeniden bağlanma denemesi...');
            this.connect(this.onRatesUpdate, this.onConnectionChange);
        }, 5000);
    }

    disconnect() {
        this.isConnecting = false;
        
        if (this.socket) {
            // Önce event listener'ları temizle
            this.socket.onopen = null;
            this.socket.onmessage = null;
            this.socket.onclose = null;
            this.socket.onerror = null;
            
            // Sonra socket'i kapat
            if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
                this.socket.close();
            }
            this.socket = null;
        }
        
        if (this.reconnectInterval) {
            clearInterval(this.reconnectInterval);
            this.reconnectInterval = null;
        }
    }

    requestRates() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send('getRates');
        } else {
            // Socket açık değilse yeniden bağlanmayı dene
            this.connect(this.onRatesUpdate, this.onConnectionChange);
        }
    }
}

export default new ExchangeRateService();