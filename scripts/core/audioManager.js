// Manager de audio
export class AudioManager {
    constructor() {
        this.sounds = {
            boot: new Audio('assets/audio/boot.mp3'),
            login: new Audio('assets/audio/welcome.mp3'),
            click: new Audio('assets/audio/click.mp3'),
            bg: new Audio('assets/audio/background.mp3')
        };
    }

    play(name) {
        this.sounds[name].currentTime = 0;
        this.sounds[name].play();
    }

    stop(name) {
        this.sounds[name].pause();
        this.sounds[name].currentTime = 0;
    }

    setVolume(name, volume) {
        this.sounds[name].volume = volume;
    }

    loop(name, shouldLoop) {
        this.sounds[name].loop = shouldLoop;
    }
}