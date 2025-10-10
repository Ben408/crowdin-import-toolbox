#!/usr/bin/env node

/**
 * Generate secure random keys for Railway environment variables
 * Run: node scripts/generate-keys.js
 */

const crypto = require('crypto');

console.log('\n🔐 Generating Secure Keys for Railway Deployment\n');
console.log('=' .repeat(60));

// Generate JWT Secret (32 bytes = 256 bits)
const jwtSecret = crypto.randomBytes(32).toString('base64');
console.log('\n✅ JWT_SECRET:');
console.log(jwtSecret);

// Generate Encryption Key (32 bytes = 256 bits)
const encryptionKey = crypto.randomBytes(32).toString('base64');
console.log('\n✅ ENCRYPTION_KEY:');
console.log(encryptionKey);

console.log('\n' + '='.repeat(60));
console.log('\n📋 Copy these to Railway environment variables:');
console.log('\n1. Go to railway.app/dashboard');
console.log('2. Select your project');
console.log('3. Click "Variables" tab');
console.log('4. Add these variables:\n');

console.log(`   JWT_SECRET=${jwtSecret}`);
console.log(`   ENCRYPTION_KEY=${encryptionKey}`);

console.log('\n⚠️  IMPORTANT: Keep these keys secure! Do not commit to Git.\n');

