// ────────── Module Importing ──────────
// ────────── Custom Modules ──────────
// ────────── Utils Module (Backend) ──────────

// OUTPUT Coloring
type Color = 'red' | 'green' | 'blue' | 'orange' | 'gold' | 'white';
type Weight = 'normal' | 'bold';

interface ColorOptions {
    color?: Color;
    weight?: Weight;
};

const colorCodes: Record<Color, number> = {
    red: 196,
    green: 46,
    blue: 75,
    orange: 208,
    gold: 220,
    white: 37,
};
const weightCodes: Record<Weight, number> = {
    normal: 22, // Normal intensity
    bold: 1,    // Bold
};

export function colorizeANSI(
    text: string,
    options: ColorOptions = {}
): string {

    const colorCode = colorCodes[options.color ?? 'white'] ?? colorCodes.white;
    const weightCode = weightCodes[options.weight ?? 'normal'] ?? weightCodes.normal;

    return `\x1b[${weightCode};38;5;${colorCode}m${text}\x1b[0m`;
};