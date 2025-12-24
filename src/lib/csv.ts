import { encryptData } from './encryption';

export interface CSVVaultItem {
    name: string;
    username: string;
    password: string;
    url: string;
    notes: string;
}

/**
 * Export vault items to CSV format
 * @param items - Array of vault items
 * @param encrypt - Whether to keep passwords encrypted or decrypt them
 */
export function exportToCSV(items: CSVVaultItem[]): string {
    const headers = ['name', 'username', 'password', 'url', 'notes'];
    const csvRows = [headers.join(',')];

    items.forEach(item => {
        const row = [
            escapeCSV(item.name),
            escapeCSV(item.username),
            escapeCSV(item.password),
            escapeCSV(item.url),
            escapeCSV(item.notes || ''),
        ];
        csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
}

/**
 * Parse CSV and return vault items
 * Supports Chrome, Bitwarden, and generic CSV formats
 */
export function importFromCSV(csvContent: string, masterPassword: string): CSVVaultItem[] {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) throw new Error('CSV file is empty or invalid');

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
    const items: CSVVaultItem[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const item: any = {};

        headers.forEach((header, index) => {
            item[header] = values[index] || '';
        });

        // Map common field names
        const name = item.name || item.title || item.website || item.url || 'Imported Item';
        const username = item.username || item.login_username || item.user || '';
        const password = item.password || item.login_password || '';
        const url = item.url || item.website || item.login_uri || '';
        const notes = item.notes || item.note || '';

        // Encrypt the password before adding
        items.push({
            name,
            username,
            password: encryptData(password, masterPassword),
            url,
            notes: notes ? encryptData(notes, masterPassword) : '',
        });
    }

    return items;
}

/**
 * Escape CSV values (handle commas, quotes, newlines)
 */
function escapeCSV(value: string): string {
    if (!value) return '';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
}

/**
 * Parse a single CSV line (handles quoted values)
 */
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++; // Skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current);
    return result;
}

/**
 * Trigger browser download of CSV file
 */
export function downloadCSV(csvContent: string, filename = 'vault-export.csv') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
