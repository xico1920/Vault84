// Small stuff to help out with the main styling/code
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function glitchText(text, glitchChance = 0.05) {
    const chars = "!@#$%^&*()_+[]{}<>?/|\\";
    return text.split('').map(c =>
        Math.random() < glitchChance ? chars[Math.floor(Math.random() * chars.length)] : c
    ).join('');
}

export function randomChar() {
    const chars = "!@#$%^&*()_+[]{}<>?/|\\";
    return chars[Math.floor(Math.random() * chars.length)];
}