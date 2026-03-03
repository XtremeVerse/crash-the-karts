
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

    setupCarousel(carouselId, items, onSelect, selectedItem) {
        const container = document.getElementById(carouselId);
        if (!container) return;

        const track = container.querySelector('.carousel-track');
        const prevBtn = container.querySelector('.carousel-btn.prev');
        const nextBtn = container.querySelector('.carousel-btn.next');
        let currentIndex = 0;

        track.innerHTML = '';
        items.forEach((item) => {
            const el = document.createElement('div');
            el.className = 'carousel-item';
            if (item === selectedItem) {
                el.classList.add('selected');
                currentIndex = items.indexOf(item);
            }
            // For now, we use text. In the future, we can generate thumbnails.
            el.innerHTML = `<span>${item}</span>`;
            el.addEventListener('click', () => {
                onSelect(item);
                track.querySelector('.selected')?.classList.remove('selected');
                el.classList.add('selected');
            });
            track.appendChild(el);
        });

        const itemWidth = 120 + 15; // item width + margin
        const trackWidth = items.length * itemWidth;
        const containerWidth = container.offsetWidth;

        const updatePosition = () => {
            let newPos = -currentIndex * itemWidth;
            // Center the selected item
            newPos += (containerWidth / 2) - (itemWidth / 2);
            // Clamp position to not show empty space
            const maxPos = 0;
            const minPos = -(trackWidth - containerWidth);
            track.style.transform = `translateX(${Math.max(minPos, Math.min(maxPos, newPos))}px)`;
        };

        prevBtn.addEventListener('click', () => {
            currentIndex = Math.max(0, currentIndex - 1);
            onSelect(items[currentIndex]);
            track.querySelector('.selected')?.classList.remove('selected');
            track.children[currentIndex].classList.add('selected');
            updatePosition();
        });

        nextBtn.addEventListener('click', () => {
            currentIndex = Math.min(items.length - 1, currentIndex + 1);
            onSelect(items[currentIndex]);
            track.querySelector('.selected')?.classList.remove('selected');
            track.children[currentIndex].classList.add('selected');
            updatePosition();
        });

        updatePosition();
    }


    renderGarage() {
        const bodyColorContainer = document.getElementById('body-color-selector');
        const rimColorContainer = document.getElementById('rim-color-selector');
        const neonToggle = document.getElementById('neon-toggle');

        import('./assetsIndex.js').then(mod => {
            const cars = mod.listCarNames();
            const chars = mod.listCharacterNames();

            this.setupCarousel('car-carousel', cars, (carName) => {
                this.game.store.selectCar(carName);
                this.updateStatsDisplay();
                this.game.showGaragePreview();
            }, this.game.store.selectedCar);

            this.setupCarousel('character-carousel', chars, (charName) => {
                this.game.store.selectCharacter(charName);
                this.game.showGaragePreview();
            }, this.game.store.selectedCharacter);
        });

        const colors = ['#ff0000', '#0000ff', '#00ff00', '#ffff00', '#ffffff', '#000000', '#800080', '#ffa500', '#00ffff', '#ff00ff', '#ffc0cb', '#008080'];

        const createColorSwatches = (container, colorList, selectedColor, onSelect) => {
            if (!container) return;
            container.innerHTML = '';
            colorList.forEach(col => {
                const sw = document.createElement('div');
                sw.className = 'swatch';
                if (selectedColor === col) {
                    sw.classList.add('selected');
                }
                sw.style.backgroundColor = col;
                sw.addEventListener('click', () => {
                    onSelect(col);
                    container.querySelector('.swatch.selected')?.classList.remove('selected');
                    sw.classList.add('selected');
                    this.game.showGaragePreview();
                });
                container.appendChild(sw);
            });
        };

        createColorSwatches(bodyColorContainer, colors, this.game.store.selectedColor, (color) => {
            this.game.store.setSelectedColor(color);
        });

        createColorSwatches(rimColorContainer, colors, this.game.store.selectedRimColor, (color) => {
            this.game.store.setSelectedRimColor(color);
        });


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
