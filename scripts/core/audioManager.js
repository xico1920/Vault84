// Manager de audio
// Bué basico, algo me diz que ainda tenho de voltar aqui...
// Oh well
export class AudioManager {
    constructor() {
        this.sounds = {};
        const files = {
            boot:  'assets/audio/boot.mp3',
            login: 'assets/audio/welcome.mp3',
            click: 'assets/audio/click.mp3',
            bg:    'assets/audio/background.mp3'
        };
        for (var k in files) {
            try { this.sounds[k] = new Audio(files[k]); } catch(_) {}
        }
    }

    play(name) {
        try {
            if (!this.sounds[name]) return;
            this.sounds[name].currentTime = 0;
            var p = this.sounds[name].play();
            if (p && p.catch) p.catch(function(){});
        } catch(_) {}
    }

    stop(name) {
        try {
            if (!this.sounds[name]) return;
            this.sounds[name].pause();
            this.sounds[name].currentTime = 0;
        } catch(_) {}
    }

    setVolume(name, volume) {
        try { if (this.sounds[name]) this.sounds[name].volume = volume; } catch(_) {}
    }

    loop(name, shouldLoop) {
        try { if (this.sounds[name]) this.sounds[name].loop = shouldLoop; } catch(_) {}
    }
}