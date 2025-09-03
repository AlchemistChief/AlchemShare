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

export function colorizeANSI(
    text: string,
    color?: Color,
): string {

    const colorCode = colorCodes[color ?? 'white'] ?? colorCodes.white;

    return `\x1b[1;38;5;${colorCode}m${text}\x1b[0m`;
};

export function generateUniqueToken(): string {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    const timestampPart = Date.now().toString(36);

    let token = timestampPart;

    while (token.length < 20) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return token;
}