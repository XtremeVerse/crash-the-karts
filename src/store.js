import { Cars, DefaultCar } from './carStats.js';
export class Store {
    constructor() {
        this.coins = parseInt(localStorage.getItem('coins')) || 0;
        this.unlockedItems = JSON.parse(localStorage.getItem('unlockedItems')) || [];
        this.selectedColor = localStorage.getItem('selectedColor') || 'red';
        this.unlockedCars = JSON.parse(localStorage.getItem('unlockedCars')) || [DefaultCar];
        this.selectedCar = localStorage.getItem('selectedCar') || DefaultCar;
        this.unlockedCharacters = JSON.parse(localStorage.getItem('unlockedCharacters')) || ['Driver1'];
        this.selectedCharacter = localStorage.getItem('selectedCharacter') || 'Driver1';
        this.selectedRimColor = localStorage.getItem('selectedRimColor') || 'white';
        this.neonEnabled = localStorage.getItem('neonEnabled') === 'true';
    }
    save() {
        localStorage.setItem('coins', this.coins);
        localStorage.setItem('unlockedItems', JSON.stringify(this.unlockedItems));
        localStorage.setItem('selectedColor', this.selectedColor);
        localStorage.setItem('unlockedCars', JSON.stringify(this.unlockedCars));
        localStorage.setItem('selectedCar', this.selectedCar);
        localStorage.setItem('unlockedCharacters', JSON.stringify(this.unlockedCharacters));
        localStorage.setItem('selectedCharacter', this.selectedCharacter);
        localStorage.setItem('selectedRimColor', this.selectedRimColor);
        localStorage.setItem('neonEnabled', String(this.neonEnabled));
    }
    addCoins(amount) {
        this.coins += amount;
        this.save();
    }
    buyItem(itemId, price) {
        if (this.coins >= price && !this.hasItem(itemId)) {
            this.coins -= price;
            this.unlockedItems.push(itemId);
            this.save();
            return true;
        }
        return false;
    }
    hasItem(itemId) {
        return this.unlockedItems.includes(itemId);
    }
    unlockCar(carName, price) {
        if (this.coins >= price && !this.unlockedCars.includes(carName)) {
            this.coins -= price;
            this.unlockedCars.push(carName);
            this.save();
            return true;
        }
        return false;
    }
    selectCar(carName) {
        if (this.unlockedCars.includes(carName)) {
            this.selectedCar = carName;
            this.save();
        }
    }
    unlockCharacter(charName, price) {
        if (this.coins >= price && !this.unlockedCharacters.includes(charName)) {
            this.coins -= price;
            this.unlockedCharacters.push(charName);
            this.save();
            return true;
        }
        return false;
    }
    selectCharacter(charName) {
        if (this.unlockedCharacters.includes(charName)) {
            this.selectedCharacter = charName;
            this.save();
        }
    }
    setSelectedColor(color) {
        this.selectedColor = color;
        this.save();
    }
    setSelectedRimColor(color) {
        this.selectedRimColor = color;
        this.save();
    }
    setNeonEnabled(v) {
        this.neonEnabled = v;
        this.save();
    }
    getCarStats() {
        const base = Cars[this.selectedCar] || Cars[DefaultCar];
        let stats = { speed: base.speed, accel: base.accel, handling: base.handling, health: base.health };
        if (this.hasItem('hp_boost')) stats.health += Math.round(base.health * 0.15);
        if (this.hasItem('speed_boost')) stats.accel += base.accel * 0.15;
        return stats;
    }
}
