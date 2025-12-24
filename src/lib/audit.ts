import CryptoJS from 'crypto-js';

export interface AuditIssue {
    id: string;
    name: string;
    type: 'weak' | 'reused' | 'breached';
    severity: 'high' | 'medium' | 'low';
}

/**
 * Check if a password is weak (< 10 chars or missing special symbols)
 */
export function isWeakPassword(password: string): boolean {
    if (password.length < 10) return true;
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return true;
    return false;
}

/**
 * Find reused passwords across vault items
 */
export function findReusedPasswords(items: Array<{ _id: string; name: string; password: string }>): Map<string, string[]> {
    const passwordMap = new Map<string, string[]>();

    items.forEach(item => {
        const existing = passwordMap.get(item.password) || [];
        existing.push(item._id);
        passwordMap.set(item.password, existing);
    });

    // Filter to only those with duplicates
    const reused = new Map<string, string[]>();
    passwordMap.forEach((ids, password) => {
        if (ids.length > 1) {
            reused.set(password, ids);
        }
    });

    return reused;
}

/**
 * Check if a password has been breached using HIBP k-Anonymity API
 * Only sends the first 5 characters of the SHA-1 hash
 */
export async function checkPasswordBreach(password: string): Promise<boolean> {
    try {
        // Generate SHA-1 hash
        const hash = CryptoJS.SHA1(password).toString(CryptoJS.enc.Hex).toUpperCase();
        const prefix = hash.substring(0, 5);
        const suffix = hash.substring(5);

        // Query HIBP API with k-Anonymity
        const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
        if (!response.ok) return false;

        const text = await response.text();
        const hashes = text.split('\n');

        // Check if our suffix appears in the results
        for (const line of hashes) {
            const [hashSuffix] = line.split(':');
            if (hashSuffix === suffix) {
                return true; // Password has been breached
            }
        }

        return false;
    } catch (error) {
        console.error('HIBP check failed:', error);
        return false;
    }
}

/**
 * Generate a comprehensive audit report
 */
export async function generateAuditReport(
    items: Array<{ _id: string; name: string; password: string }>,
    checkBreaches = false
): Promise<AuditIssue[]> {
    const issues: AuditIssue[] = [];

    // Check for weak passwords
    items.forEach(item => {
        if (isWeakPassword(item.password)) {
            issues.push({
                id: item._id,
                name: item.name,
                type: 'weak',
                severity: 'high',
            });
        }
    });

    // Check for reused passwords
    const reused = findReusedPasswords(items);
    reused.forEach((ids, password) => {
        ids.forEach(id => {
            const item = items.find(i => i._id === id);
            if (item) {
                issues.push({
                    id: item._id,
                    name: item.name,
                    type: 'reused',
                    severity: 'medium',
                });
            }
        });
    });

    // Optionally check breaches (can be slow)
    if (checkBreaches) {
        const checkedPasswords = new Set<string>();
        for (const item of items) {
            if (checkedPasswords.has(item.password)) continue;
            checkedPasswords.add(item.password);

            const isBreached = await checkPasswordBreach(item.password);
            if (isBreached) {
                issues.push({
                    id: item._id,
                    name: item.name,
                    type: 'breached',
                    severity: 'high',
                });
            }
        }
    }

    return issues;
}
