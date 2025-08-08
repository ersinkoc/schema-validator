"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creditCardPlugin = void 0;
const manager_1 = require("../manager");
const string_1 = require("../../schemas/primitives/string");
function luhnCheck(value) {
    const digits = value.replace(/\D/g, '');
    let sum = 0;
    let isEven = false;
    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits[i], 10);
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        sum += digit;
        isEven = !isEven;
    }
    return sum % 10 === 0;
}
exports.creditCardPlugin = (0, manager_1.createPlugin)({
    name: 'credit-card',
    version: '1.0.0',
    install(_validator) {
        // Extend string schema with credit card validation
        string_1.string.prototype.creditCard = function (options) {
            return this.refine((value) => {
                const cleaned = value.replace(/\D/g, '');
                // Check length
                if (cleaned.length < 13 || cleaned.length > 19) {
                    return false;
                }
                // Luhn algorithm check
                if (!luhnCheck(cleaned)) {
                    return false;
                }
                // Check card type if specified
                if (options?.types && options.types.length > 0) {
                    const cardType = detectCardType(cleaned);
                    if (!cardType || !options.types.includes(cardType)) {
                        return false;
                    }
                }
                return true;
            }, options?.message || 'Invalid credit card number');
        };
        // Add CVV validation
        string_1.string.prototype.cvv = function (options) {
            return this.regex(options?.cardType === 'amex' ? /^\d{4}$/ : /^\d{3}$/, options?.message || 'Invalid CVV');
        };
        // Add expiry date validation
        string_1.string.prototype.cardExpiry = function (options) {
            const format = options?.format || 'MM/YY';
            const pattern = format === 'MM/YYYY'
                ? /^(0[1-9]|1[0-2])\/\d{4}$/
                : /^(0[1-9]|1[0-2])\/\d{2}$/;
            return this.regex(pattern).refine((value) => {
                const [month, year] = value.split('/');
                const currentDate = new Date();
                const currentYear = currentDate.getFullYear();
                const currentMonth = currentDate.getMonth() + 1;
                let fullYear = parseInt(year);
                if (format === 'MM/YY') {
                    fullYear = 2000 + fullYear;
                }
                if (fullYear < currentYear) {
                    return false;
                }
                if (fullYear === currentYear && parseInt(month) < currentMonth) {
                    return false;
                }
                return true;
            }, options?.message || 'Card has expired');
        };
    },
    validators: {
        creditCard: (value) => {
            if (typeof value !== 'string')
                return false;
            const cleaned = value.replace(/\D/g, '');
            return cleaned.length >= 13 && cleaned.length <= 19 && luhnCheck(cleaned);
        },
        cvv: (value) => {
            if (typeof value !== 'string')
                return false;
            return /^\d{3,4}$/.test(value);
        }
    },
    transforms: {
        maskCreditCard: (value) => {
            const cleaned = value.replace(/\D/g, '');
            if (cleaned.length < 4)
                return value;
            const last4 = cleaned.slice(-4);
            const masked = '*'.repeat(cleaned.length - 4) + last4;
            return masked.replace(/(.{4})/g, '$1 ').trim();
        }
    }
});
function detectCardType(cardNumber) {
    if (/^4/.test(cardNumber))
        return 'visa';
    if (/^5[1-5]/.test(cardNumber))
        return 'mastercard';
    if (/^3[47]/.test(cardNumber))
        return 'amex';
    if (/^6(?:011|5)/.test(cardNumber))
        return 'discover';
    return null;
}
//# sourceMappingURL=credit-card.js.map