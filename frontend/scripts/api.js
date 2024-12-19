// API functions for future backend integration
const api = {
    // حفظ بيانات اللعبة
    saveGameState: async (gameData) => {
        // يمكن إضافة التكامل مع الخادم هنا مستقبلاً
        localStorage.setItem('dominoGameState', JSON.stringify(gameData));
        return true;
    },

    // استرجاع بيانات اللعبة
    loadGameState: async () => {
        // يمكن إضافة التكامل مع الخادم هنا مستقبلاً
        const data = localStorage.getItem('dominoGameState');
        return data ? JSON.parse(data) : null;
    },

    // مسح بيانات اللعبة
    clearGameState: async () => {
        localStorage.removeItem('dominoGameState');
        return true;
    }
};
