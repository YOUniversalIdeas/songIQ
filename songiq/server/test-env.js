require('dotenv').config({ path: './env.development' });

console.log('=== Environment Variable Test ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Loaded' : 'Not loaded');
console.log('STRIPE_BASIC_PLAN_PRICE_ID:', process.env.STRIPE_BASIC_PLAN_PRICE_ID);
console.log('================================');
