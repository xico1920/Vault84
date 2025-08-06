// Merdinhas pequenas para ajudar/adicionar extra flare no jogo e lógica
// Ficam à parte porque, ya, não faz sentido estarem se quer a ir de um lado para o outro
// se podem estar só aqui :D

// Função de sleep
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Função de glithed text (haveremos de usar de novo, very kewl)
export function glitchText(text, glitchChance = 0.05) {
    const chars = "!@#$%^&*()_+[]{}<>?/|\\";
    return text.split('').map(c =>
        Math.random() < glitchChance ? chars[Math.floor(Math.random() * chars.length)] : c
    ).join('');
}

// Função randomChar
export function randomChar() {
    const chars = "!@#$%^&*()_+[]{}<>?/|\\";
    return chars[Math.floor(Math.random() * chars.length)];
}