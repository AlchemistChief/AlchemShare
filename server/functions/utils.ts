// ────────── Module Importing ──────────
// ────────── Custom Modules ──────────
// ────────── Utils Module (Backend) ──────────

// ────────── Colsole Coloring ──────────
type Color = 'red' | 'green' | 'blue' | 'orange' | 'gold' | 'white';

const colorCodes: Record<Color, number> = {
    red: 196,
    green: 46,
    blue: 75,
    orange: 208,
    gold: 220,
    white: 37,
};

// ────────── Helper: Colorized Console Output ──────────
export function colorizeANSI(
    text: string,
    color?: Color,
): string {

    const colorCode = colorCodes[color ?? 'white'] ?? colorCodes.white;

    return `\x1b[1;38;5;${colorCode}m${text}\x1b[0m`;
};

// ────────── Helper: Generate Unique String ──────────
export function generateUniqueToken(): string {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    const timestampPart = Date.now().toString(36);

    let token = timestampPart;

    while (token.length < 20) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return token;
}

// ────────── Helper: Convert bytes into human readable string ──────────
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    const units = ['KB', 'MB', 'GB', 'TB'];
    let size = bytes / 1024;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
}

// ────────── Helper: Format date as dd.mm.yyyy - hh:mm ──────────
export function formatDate(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} - ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}