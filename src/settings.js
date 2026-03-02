export class Settings {
    constructor() {
        this.volume = parseFloat(localStorage.getItem('volume')) || 0.5;
        this.musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
        this.quality = localStorage.getItem('quality') || 'medium';
    }

    save() {
        localStorage.setItem('volume', this.volume);
        localStorage.setItem('musicEnabled', this.musicEnabled);
        localStorage.setItem('quality', this.quality);
    }

    setVolume(value) {
        this.volume = value;
        this.save();
    }

    setMusic(enabled) {
        this.musicEnabled = enabled;
        this.save();
    }

    setQuality(quality) {
        this.quality = quality;
        this.save();
        this.applyQualitySettings();
    }

    applyQualitySettings() {
        // This will be called by the Game engine when it initializes
        console.log(`Applying ${this.quality} quality settings...`);
    }
}
