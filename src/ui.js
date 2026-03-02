export class UI {
    constructor(game) {
        this.game = game;
        this.pages = {
            landing: document.getElementById('landing-page'),
            modeSelection: document.getElementById('mode-selection-page'),
            garage: document.getElementById('garage-page'),
            shop: document.getElementById('shop-page'),
            settings: document.getElementById('settings-page'),
            hud: document.getElementById('game-hud'),
            end: document.getElementById('end-screen')
        };

        this.initEventListeners();
    }

    showPage(pageId) {
        Object.values(this.pages).forEach(page => {
            if (page) page.classList.add('hidden');
        });

        const targetPage = this.pages[pageId];
        if (targetPage) {
            targetPage.classList.remove('hidden');
        }

        if (pageId === 'hud') {
            this.pages.hud.classList.remove('hidden');
        }
        if (pageId === 'garage') {
            this.renderGarage();
        }
    }

    initEventListeners() {
        document.getElementById('btn-play').addEventListener('click', () => this.showPage('modeSelection'));
        document.getElementById('btn-garage').addEventListener('click', () => {
            this.showPage('garage');
            this.game.showGaragePreview();
        });
        document.getElementById('btn-shop').addEventListener('click', () => {
            this.showPage('shop');
            this.updateShopUI();
        });
        document.getElementById('btn-settings').addEventListener('click', () => this.showPage('settings'));

        document.querySelectorAll('.btn-back').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showPage('landing');
                this.game.hideGaragePreview();
            });
        });

        document.getElementById('btn-mode-quick').addEventListener('click', () => this.startGame('quick'));
        document.getElementById('btn-mode-hard').addEventListener('click', () => this.startGame('hard'));
        document.getElementById('btn-mode-free').addEventListener('click', () => this.startGame('free'));

        document.querySelectorAll('.btn-buy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.parentElement.dataset.id;
                const price = parseInt(e.target.dataset.price);
                this.game.store.buyItem(itemId, price);
                this.updateShopUI();
            });
        });

        document.getElementById('volume-slider').addEventListener('input', (e) => {
            this.game.settings.setVolume(parseFloat(e.target.value));
        });
        document.getElementById('graphics-quality').addEventListener('change', (e) => {
            this.game.settings.setQuality(e.target.value);
        });

        document.getElementById('btn-play-again').addEventListener('click', () => {
            this.showPage('modeSelection');
        });
        document.getElementById('btn-return-home').addEventListener('click', () => {
            this.showPage('landing');
        });
        const unlockBtn = document.getElementById('btn-unlock-car');
        if (unlockBtn) {
            unlockBtn.addEventListener('click', () => {
                const needed = this.pendingUnlockCar;
                if (!needed) return;
                const price = 500;
                if (this.game.store.unlockCar(needed, price)) {
                    this.renderGarage();
                }
            });
        }
    }

    startGame(mode) {
        this.showPage('hud');
        this.game.initMatch(mode);
    }

    updateHUD(data) {
        document.getElementById('hud-timer').textContent = data.timer;
        document.getElementById('hud-score').textContent = data.score;
        document.getElementById('hud-health').textContent = Math.ceil(data.health);
        document.getElementById('health-bar-fill').style.width = `${data.health}%`;
        document.getElementById('hud-ammo').textContent = data.ammo;
    }

    updateShopUI() {
        document.getElementById('coin-count').textContent = this.game.store.coins;
        document.querySelectorAll('.btn-buy').forEach(btn => {
            const itemId = btn.parentElement.dataset.id;
            const price = parseInt(btn.dataset.price);
            if (this.game.store.hasItem(itemId)) {
                btn.textContent = 'BOUGHT';
                btn.disabled = true;
            } else if (this.game.store.coins < price) {
                btn.disabled = true;
            } else {
                btn.disabled = false;
            }
        });
    }

    showEndScreen(results) {
        this.showPage('end');
        document.getElementById('end-winner').textContent = results.winner;
        document.getElementById('end-kills').textContent = results.kills;
        document.getElementById('end-deaths').textContent = results.deaths;
        document.getElementById('end-coins').textContent = results.coinsEarned;
    }

    renderGarage() {
        const carContainer = document.getElementById('car-selector');
        const charContainer = document.getElementById('character-selector');
        const bodyRow = document.getElementById('body-color-selector');
        const rimRow = document.getElementById('rim-color-selector');
        const neonToggle = document.getElementById('neon-toggle');
        if (!carContainer || !charContainer) return;
        carContainer.innerHTML = '';
        charContainer.innerHTML = '';
        if (bodyRow) bodyRow.innerHTML = '';
        if (rimRow) rimRow.innerHTML = '';
        // Discover cars and characters dynamically from placeholder folders
        import('./assetsIndex.js').then(mod => {
            const cars = mod.listCarNames();
            const chars = mod.listCharacterNames();
            cars.forEach(c => {
            const btn = document.createElement('button');
            btn.textContent = c;
            btn.addEventListener('click', () => {
                this.game.store.selectCar(c);
                this.updateStatsDisplay();
                this.pendingUnlockCar = null;
                const unlockBtn = document.getElementById('btn-unlock-car');
                if (unlockBtn) unlockBtn.classList.add('hidden');
                this.game.showGaragePreview();
            });
            carContainer.appendChild(btn);
            });
            chars.forEach(ch => {
            const btn = document.createElement('button');
            btn.textContent = ch;
            btn.addEventListener('click', () => {
                this.game.store.selectCharacter(ch);
                this.game.showGaragePreview();
            });
            charContainer.appendChild(btn);
            });
        });
        const colors = ['red','blue','green','yellow','white','black','purple','orange','cyan','magenta'];
        if (bodyRow) {
            colors.forEach(col => {
                const sw = document.createElement('div');
                sw.className = 'swatch' + (this.game.store.selectedColor === col ? ' selected' : '');
                sw.style.background = col;
                sw.addEventListener('click', () => {
                    this.game.store.setSelectedColor(col);
                    this.renderGarage();
                    this.game.showGaragePreview();
                });
                bodyRow.appendChild(sw);
            });
        }
        if (rimRow) {
            colors.forEach(col => {
                const sw = document.createElement('div');
                sw.className = 'swatch' + (this.game.store.selectedRimColor === col ? ' selected' : '');
                sw.style.background = col;
                sw.addEventListener('click', () => {
                    this.game.store.setSelectedRimColor(col);
                    this.renderGarage();
                    this.game.showGaragePreview();
                });
                rimRow.appendChild(sw);
            });
        }
        if (neonToggle) {
            neonToggle.checked = !!this.game.store.neonEnabled;
            neonToggle.onchange = () => {
                this.game.store.setNeonEnabled(neonToggle.checked);
                this.game.showGaragePreview();
            };
        }
        this.updateStatsDisplay();
    }
    updateStatsDisplay() {
        const s = this.game.store.getCarStats();
        document.getElementById('stat-speed').textContent = s.speed;
        document.getElementById('stat-accel').textContent = s.accel;
        document.getElementById('stat-handling').textContent = s.handling;
        document.getElementById('stat-health').textContent = s.health;
    }
}
