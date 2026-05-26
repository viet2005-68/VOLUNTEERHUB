#!/usr/bin/env node

/**
 * Script to generate VAPID keys for Web Push notifications
 * 
 * Usage:
 *   node generate-vapid-keys.js
 * 
 * This will generate a pair of VAPID keys (public and private) that can be used
 * for Web Push notifications. Add these keys to your .env file.
 */

const crypto = require('crypto');

function urlBase64Encode(buffer) {
    return buffer
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function generateVapidKeys() {
    // Generate ECDSA key pair using P-256 curve (prime256v1)
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
        namedCurve: 'prime256v1',
        publicKeyEncoding: {
            type: 'spki',
            format: 'der'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'der'
        }
    });

    // Extract the raw public key (remove the DER encoding overhead)
    // SPKI format has 26 bytes of overhead for P-256 keys
    const rawPublicKey = publicKey.slice(26);

    // Extract the raw private key (remove the DER encoding overhead)
    // PKCS8 format has 36 bytes of overhead for P-256 keys
    const rawPrivateKey = privateKey.slice(36);

    return {
        publicKey: urlBase64Encode(rawPublicKey),
        privateKey: urlBase64Encode(rawPrivateKey)
    };
}

console.log('='.repeat(80));
console.log('VAPID Keys Generator for Web Push Notifications');
console.log('='.repeat(80));
console.log('');

try {
    const keys = generateVapidKeys();

    console.log('✓ VAPID keys generated successfully!\n');
    console.log('Add these to your .env file:\n');
    console.log('-'.repeat(80));
    console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
    console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
    console.log(`VAPID_SUBJECT=mailto:admin@volunteerhub.com`);
    console.log('-'.repeat(80));
    console.log('');
    console.log('⚠️  IMPORTANT:');
    console.log('   - Keep the private key SECRET and never commit it to version control');
    console.log('   - The public key can be shared with the frontend');
    console.log('   - Change the VAPID_SUBJECT to your actual email address');
    console.log('');
    console.log('Public Key (for frontend):');
    console.log(keys.publicKey);
    console.log('');

} catch (error) {
    console.error('✗ Error generating VAPID keys:', error.message);
    process.exit(1);
}


