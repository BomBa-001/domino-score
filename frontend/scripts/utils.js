// Utility functions
const utils = {
    // تنسيق الأرقام
    formatNumber: (number) => {
        return number.toLocaleString('ar-EG');
    },

    // التحقق من صحة المدخلات
    validateInput: (value) => {
        return !isNaN(value) && value !== '';
    },

    // إنشاء عنصر HTML
    createElement: (tag, className, content) => {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.textContent = content;
        return element;
    }
};
