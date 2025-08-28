import api from './api';

export const subscriptionAPI = {
    // Bir kur çifti için abonelik ekler
    addSubscription: (currencyPair) => {
        return api.post('/subscriptions', { currencyPair });
    },

    // Bir kur çifti için aboneliği kaldırır
    removeSubscription: (currencyPair) => {
        return api.delete(`/subscriptions/${currencyPair}`);
    },

    // Kullanıcının mevcut aboneliklerini getirir (Eğer backend'de bir GET endpoint'iniz varsa kullanabilirsiniz)
    // Şimdilik UI'da durumu yerel olarak takip edeceğiz.
    // getSubscriptions: () => {
    //     return api.get('/subscriptions/my');
    // },
};