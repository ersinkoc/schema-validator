/**
 * Plugin system example for @oxog/schema-validator
 * Demonstrates how to create and use custom validators
 */
const v = require('../dist/index.js').default;
const { PluginManager } = require('../dist/index.js');

console.log('=== Plugin System Examples ===\n');

// 1. Create a custom validator plugin
const creditCardPlugin = {
  name: 'credit-card-validator',
  version: '1.0.0',
  validators: {
    creditCard: {
      validate: (value) => {
        // Remove spaces and dashes
        const digits = String(value).replace(/[\s-]/g, '');
        
        // Check if it's all digits and has valid length
        if (!/^\d+$/.test(digits) || digits.length < 13 || digits.length > 19) {
          return false;
        }
        
        // Luhn algorithm
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
      },
      errorMessage: 'Invalid credit card number'
    },
    
    creditCardType: {
      validate: (value) => {
        const digits = String(value).replace(/[\s-]/g, '');
        
        // Detect card type
        if (/^4/.test(digits)) return 'visa';
        if (/^5[1-5]/.test(digits)) return 'mastercard';
        if (/^3[47]/.test(digits)) return 'amex';
        if (/^6(?:011|5)/.test(digits)) return 'discover';
        
        return false;
      },
      errorMessage: 'Unrecognized credit card type'
    }
  }
};

// 2. Phone number validator plugin
const phonePlugin = {
  name: 'phone-validator',
  version: '1.0.0',
  validators: {
    phone: {
      validate: (value, options = {}) => {
        const { country = 'US' } = options;
        const phone = String(value).replace(/\D/g, '');
        
        switch (country) {
          case 'US':
            // US phone: 10 digits, starts with 2-9
            return /^[2-9]\d{9}$/.test(phone);
          case 'UK':
            // UK phone: 11 digits, starts with 0
            return /^0\d{10}$/.test(phone);
          default:
            // International format
            return /^\d{7,15}$/.test(phone);
        }
      },
      errorMessage: 'Invalid phone number format'
    },
    
    phoneWithCountryCode: {
      validate: (value) => {
        // E.164 format: +[country code][number]
        return /^\+[1-9]\d{1,14}$/.test(String(value));
      },
      errorMessage: 'Phone number must be in E.164 format (e.g., +1234567890)'
    }
  }
};

// 3. Custom business validators plugin
const businessPlugin = {
  name: 'business-validators',
  version: '1.0.0',
  validators: {
    ein: {
      // US Employer Identification Number
      validate: (value) => {
        const ein = String(value).replace(/\D/g, '');
        return /^\d{9}$/.test(ein);
      },
      errorMessage: 'Invalid EIN format (must be 9 digits)'
    },
    
    ssn: {
      // US Social Security Number
      validate: (value) => {
        const ssn = String(value).replace(/\D/g, '');
        if (!/^\d{9}$/.test(ssn)) return false;
        
        // Cannot start with 000, 666, or 900-999
        const area = parseInt(ssn.substring(0, 3), 10);
        if (area === 0 || area === 666 || area >= 900) return false;
        
        // Middle digits cannot be 00
        const group = parseInt(ssn.substring(3, 5), 10);
        if (group === 0) return false;
        
        // Last 4 digits cannot be 0000
        const serial = parseInt(ssn.substring(5, 9), 10);
        if (serial === 0) return false;
        
        return true;
      },
      errorMessage: 'Invalid SSN format'
    },
    
    vatNumber: {
      // EU VAT Number (simplified)
      validate: (value) => {
        const vat = String(value).toUpperCase();
        // Simple check: 2 letter country code + numbers
        return /^[A-Z]{2}\d{8,12}$/.test(vat);
      },
      errorMessage: 'Invalid VAT number format'
    }
  }
};

// 4. Register plugins with the validator
console.log('Registering plugins...');

// Create a plugin manager instance
const pluginManager = new PluginManager();

// Register plugins
pluginManager.register(creditCardPlugin);
pluginManager.register(phonePlugin);
pluginManager.register(businessPlugin);

console.log('Registered plugins:', pluginManager.list().map(p => p.name));

// 5. Use the custom validators
console.log('\n=== Testing Credit Card Validator ===');

// Note: In a real implementation, these would be added to the string schema prototype
// For demonstration, we'll validate directly
const testCreditCards = [
  '4532015112830366',  // Valid Visa
  '5425233430109903',  // Valid Mastercard
  '374245455400126',   // Valid Amex
  '6011000991300009',  // Valid Discover
  '1234567890123456',  // Invalid
];

testCreditCards.forEach(card => {
  const isValid = creditCardPlugin.validators.creditCard.validate(card);
  const cardType = creditCardPlugin.validators.creditCardType.validate(card);
  console.log(`Card ${card}: ${isValid ? `Valid (${cardType})` : 'Invalid'}`);
});

console.log('\n=== Testing Phone Validator ===');

const testPhones = [
  { number: '2025551234', country: 'US', expected: true },
  { number: '02079460123', country: 'UK', expected: true },
  { number: '+14155552671', country: null, expected: true },
  { number: '123', country: 'US', expected: false },
];

testPhones.forEach(({ number, country, expected }) => {
  let isValid;
  if (number.startsWith('+')) {
    isValid = phonePlugin.validators.phoneWithCountryCode.validate(number);
  } else {
    isValid = phonePlugin.validators.phone.validate(number, { country });
  }
  console.log(`Phone ${number} (${country || 'International'}): ${isValid ? 'Valid' : 'Invalid'} ${isValid === expected ? '✓' : '✗'}`);
});

console.log('\n=== Testing Business Validators ===');

// Test EIN
const testEINs = ['12-3456789', '123456789', '00-0000000'];
testEINs.forEach(ein => {
  const isValid = businessPlugin.validators.ein.validate(ein);
  console.log(`EIN ${ein}: ${isValid ? 'Valid' : 'Invalid'}`);
});

// Test SSN
const testSSNs = ['123-45-6789', '000-12-3456', '123-00-4567', '666-12-3456'];
testSSNs.forEach(ssn => {
  const isValid = businessPlugin.validators.ssn.validate(ssn);
  console.log(`SSN ${ssn}: ${isValid ? 'Valid' : 'Invalid'}`);
});

// Test VAT
const testVATs = ['DE123456789', 'FR12345678901', 'XX123'];
testVATs.forEach(vat => {
  const isValid = businessPlugin.validators.vatNumber.validate(vat);
  console.log(`VAT ${vat}: ${isValid ? 'Valid' : 'Invalid'}`);
});

// 6. Create a composite validator using plugins
console.log('\n=== Composite Validator Example ===');

// In a real implementation, this would be integrated with the schema
const paymentSchema = {
  cardNumber: (value) => creditCardPlugin.validators.creditCard.validate(value),
  cardType: (value) => creditCardPlugin.validators.creditCardType.validate(value),
  billingPhone: (value) => phonePlugin.validators.phoneWithCountryCode.validate(value)
};

const paymentData = {
  cardNumber: '4532015112830366',
  billingPhone: '+14155552671'
};

console.log('Payment validation:');
console.log(`- Card valid: ${paymentSchema.cardNumber(paymentData.cardNumber)}`);
console.log(`- Card type: ${creditCardPlugin.validators.creditCardType.validate(paymentData.cardNumber)}`);
console.log(`- Phone valid: ${paymentSchema.billingPhone(paymentData.billingPhone)}`);

console.log('\n=== Plugin System Demo Complete ===');