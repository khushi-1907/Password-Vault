#!/usr/bin/env node

/**
 * Manual Testing Script for Forgot Password Flow
 * 
 * This script helps test the forgot password functionality
 * Run with: npx ts-node test-forgot-password.ts
 */

import crypto from 'crypto';

// Test token generation and expiration
function testTokenGeneration() {
    console.log('\n=== Testing Token Generation ===\n');
    
    // Generate a token like the API does
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    console.log('Plain Token:', resetToken);
    console.log('Hashed Token:', hashedToken);
    console.log('Token Length:', resetToken.length);
    
    // Verify token matches when hashed again
    const isValidToken = hashedToken === crypto.createHash('sha256').update(resetToken).digest('hex');
    console.log('Token Verification:', isValidToken ? '✓ PASS' : '✗ FAIL');
    
    return { resetToken, hashedToken };
}

// Test token expiration
function testTokenExpiration() {
    console.log('\n=== Testing Token Expiration ===\n');
    
    const currentTime = Date.now();
    const expirationTime = new Date(currentTime + 3600000); // 1 hour from now
    const expiredTime = new Date(currentTime - 1000); // Already expired
    
    console.log('Current Time:', new Date(currentTime).toISOString());
    console.log('Expiration Time (1 hour):', expirationTime.toISOString());
    console.log('Expired Time:', expiredTime.toISOString());
    
    // Check if expiration check works
    const isValid = expirationTime.getTime() > currentTime;
    const isExpired = expiredTime.getTime() < currentTime;
    
    console.log('Valid Token:', isValid ? '✓ PASS' : '✗ FAIL');
    console.log('Expired Token Detection:', isExpired ? '✓ PASS' : '✗ FAIL');
}

// Test password requirements
function testPasswordRequirements() {
    console.log('\n=== Testing Password Requirements ===\n');
    
    const testPasswords = [
        { password: 'Weak', valid: false, reason: 'Too short, missing special char and number' },
        { password: 'WeakPass', valid: false, reason: 'Missing special char and number' },
        { password: 'WeakPass123', valid: false, reason: 'Missing special char' },
        { password: 'StrongPass123!', valid: true, reason: 'Meets all requirements' },
        { password: 'MyV@ultKey2024', valid: true, reason: 'Meets all requirements' },
    ];
    
    testPasswords.forEach(({ password, valid, reason }) => {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[^A-Za-z0-9]/.test(password),
        };
        
        const metRequirements = Object.values(requirements).filter(Boolean).length;
        const isValid = metRequirements === 5;
        
        console.log(`Password: "${password}"`);
        console.log(`Expected: ${valid ? '✓ VALID' : '✗ INVALID'} - ${reason}`);
        console.log(`Result: ${isValid ? '✓ VALID' : '✗ INVALID'}`);
        console.log(`Requirements Met: ${metRequirements}/5`);
        console.log('');
    });
}

// Test email validation
function testEmailValidation() {
    console.log('\n=== Testing Email Validation ===\n');
    
    const testEmails = [
        { email: 'user@example.com', valid: true },
        { email: 'test.user+tag@example.co.uk', valid: true },
        { email: 'invalid.email@', valid: false },
        { email: '@example.com', valid: false },
        { email: 'plainaddress', valid: false },
    ];
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    testEmails.forEach(({ email, valid }) => {
        const isValid = emailRegex.test(email);
        const status = isValid === valid ? '✓ PASS' : '✗ FAIL';
        console.log(`${email}: ${status} (Expected: ${valid ? 'valid' : 'invalid'})`);
    });
}

// Test API endpoints exist
async function testAPIEndpoints() {
    console.log('\n=== Testing API Endpoints ===\n');
    
    const endpoints = [
        '/api/auth/forgot-password',
        '/api/auth/reset-password',
        '/api/auth/verify-reset-token',
    ];
    
    console.log('Expected endpoints:');
    endpoints.forEach(endpoint => {
        console.log(`  POST ${endpoint}`);
    });
    
    console.log('\nNote: Full endpoint testing requires running server');
}

// Main test runner
async function runTests() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║  Forgot Password Flow - Test Suite     ║');
    console.log('╚════════════════════════════════════════╝');
    
    try {
        testTokenGeneration();
        testTokenExpiration();
        testPasswordRequirements();
        testEmailValidation();
        testAPIEndpoints();
        
        console.log('\n╔════════════════════════════════════════╗');
        console.log('║  Test Suite Completed                  ║');
        console.log('╚════════════════════════════════════════╝\n');
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

runTests();
