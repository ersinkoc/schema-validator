import { createPlugin } from '../manager';
import { string } from '../../schemas/primitives/string';

function luhnCheck(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]!, 10);

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

export const creditCardPlugin = createPlugin({
  name: 'credit-card',
  version: '1.0.0',
  
  install(_validator) {
    // Extend string schema with credit card validation
    (string as any).prototype.creditCard = function(options?: {
      types?: ('visa' | 'mastercard' | 'amex' | 'discover')[];
      message?: string;
    }) {
      return this.refine((value: string) => {
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
    (string as any).prototype.cvv = function(options?: {
      cardType?: 'visa' | 'mastercard' | 'amex' | 'discover';
      message?: string;
    }) {
      return this.regex(
        options?.cardType === 'amex' ? /^\d{4}$/ : /^\d{3}$/,
        options?.message || 'Invalid CVV'
      );
    };

    // Add expiry date validation
    (string as any).prototype.cardExpiry = function(options?: {
      format?: 'MM/YY' | 'MM/YYYY';
      message?: string;
    }) {
      const format = options?.format || 'MM/YY';
      const pattern = format === 'MM/YYYY' 
        ? /^(0[1-9]|1[0-2])\/\d{4}$/
        : /^(0[1-9]|1[0-2])\/\d{2}$/;
      
      return this.regex(pattern).refine((value: string) => {
        const [month, year] = value.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        
        let fullYear = parseInt(year!);
        if (format === 'MM/YY') {
          fullYear = 2000 + fullYear;
        }
        
        if (fullYear < currentYear) {
          return false;
        }
        
        if (fullYear === currentYear && parseInt(month!) < currentMonth) {
          return false;
        }
        
        return true;
      }, options?.message || 'Card has expired');
    };
  },

  validators: {
    creditCard: (value: unknown) => {
      if (typeof value !== 'string') return false;
      const cleaned = value.replace(/\D/g, '');
      return cleaned.length >= 13 && cleaned.length <= 19 && luhnCheck(cleaned);
    },
    cvv: (value: unknown) => {
      if (typeof value !== 'string') return false;
      return /^\d{3,4}$/.test(value);
    }
  },

  transforms: {
    maskCreditCard: (value: string) => {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length < 4) return value;
      const last4 = cleaned.slice(-4);
      const masked = '*'.repeat(cleaned.length - 4) + last4;
      return masked.replace(/(.{4})/g, '$1 ').trim();
    }
  }
});

function detectCardType(cardNumber: string): 'visa' | 'mastercard' | 'amex' | 'discover' | null {
  if (/^4/.test(cardNumber)) return 'visa';
  if (/^5[1-5]/.test(cardNumber)) return 'mastercard';
  if (/^3[47]/.test(cardNumber)) return 'amex';
  if (/^6(?:011|5)/.test(cardNumber)) return 'discover';
  return null;
}