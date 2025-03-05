require('dotenv').config();
console.log('Environment variables:');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('TOKEN_SECRET:', process.env.TOKEN_SECRET);
