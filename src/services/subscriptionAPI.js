import api from './api';

const getToken = () => {
    return localStorage.getItem('token');
};

export const subscriptionAPI = {
    // Bir kur çifti için abonelik ekler
    addSubscription: (currencyPair) => {
        const token = getToken();
        if (!token) {
            console.error('Token bulunamadı. Lütfen giriş yapın.');
            return Promise.reject('Token bulunamadı.');
        }
        return api.post('/subscriptions', { currencyPair }, {
            headers: {
                Authorization: `Bearer ${token}` // <-- JWT token'ı buraya ekledik
            }
        });
    },

    // Bir kur çifti için aboneliği kaldırır
    removeSubscription: (currencyPair) => {
        const token = getToken();
        if (!token) {
            console.error('Token bulunamadı. Lütfen giriş yapın.');
            return Promise.reject('Token bulunamadı.');
        }
        return api.delete(`/subscriptions/${currencyPair}`, {
            headers: {
                Authorization: `Bearer ${token}` // <-- JWT token'ı buraya da ekledik
            }
        });
    },
};