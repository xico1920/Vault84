// Manager de audio
// Bué basico, algo me diz que ainda tenho de voltar aqui...
// Oh well
export class AudioManager {
    // Constructor
    constructor() {
        this.sounds = {
            boot: new Audio('assets/audio/boot.mp3'), // Som de boot
            login: new Audio('assets/audio/welcome.mp3'), // Som de welcome
            click: new Audio('assets/audio/click.mp3'), // Som de click
            bg: new Audio('assets/audio/background.mp3') // Som do background
        };
    }

    // Função de play
    play(name) {
        this.sounds[name].currentTime = 0;
        this.sounds[name].play();
    }

    // Função de stop
    stop(name) {
        this.sounds[name].pause();
        this.sounds[name].currentTime = 0;
    }

    // Função de volume
    setVolume(name, volume) {
        this.sounds[name].volume = volume;
    }
    
    // Função de loop
    loop(name, shouldLoop) {
        this.sounds[name].loop = shouldLoop;
    }
}