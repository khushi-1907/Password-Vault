import CryptoJS from 'crypto-js';

/**
 * Encrypt data using a master key derived from the user's master password.
 * @param data The plaintext data to encrypt.
 * @param masterKey The secret key/password.
 */
export const encryptData = (data: string, masterKey: string): string => {
    if (!data) return '';
    return CryptoJS.AES.encrypt(data, masterKey).toString();
};

/**
 * Decrypt data using the master key.
 * @param ciphertext The encrypted string.
 * @param masterKey The secret key/password.
 */
export const decryptData = (ciphertext: string, masterKey: string): string => {
    if (!ciphertext) return '';
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, masterKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error('Decryption failed:', error);
        return 'Decryption Error';
    }
};
