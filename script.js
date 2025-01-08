// API Configuration
const APIS = {
    cat: {
        url: 'https://catfact.ninja/fact',
        title: 'Cat Facts',
        icon: 'fa-cat'
    },
    dog: {
        url: 'https://dog.ceo/api/breeds/image/random',
        title: 'Dog Gallery',
        icon: 'fa-dog'
    },
    joke: {
        url: 'https://official-joke-api.appspot.com/random_joke',
        title: 'Joke Generator',
        icon: 'fa-face-laugh-beam'
    },
    bitcoin: {
        url: 'https://api.coindesk.com/v1/bpi/currentprice.json',
        title: 'Crypto Tracker',
        icon: 'fa-bitcoin-sign'
    },
    ip: {
        url: 'https://api.ipify.org?format=json',
        title: 'IP Lookup',
        icon: 'fa-network-wired'
    },
    user: {
        url: 'https://randomuser.me/api/',
        title: 'User Generator',
        icon: 'fa-user-astronaut'
    },
    age: {
        url: 'https://api.agify.io',
        title: 'Age Oracle',
        icon: 'fa-hourglass',
        requiresName: true
    },
    gender: {
        url: 'https://api.genderize.io',
        title: 'Gender Insights',
        icon: 'fa-venus-mars',
        requiresName: true
    },
    nationality: {
        url: 'https://api.nationalize.io',
        title: 'Origin Finder',
        icon: 'fa-globe',
        requiresName: true
    }
};

// Clock functionality
function updateClock() {
    const clockElement = document.querySelector('.clock-time');
    const now = new Date();
    const hours = now.getHours() % 12 || 12;
    const minutes = now.getMinutes().toString().padStart(2, '0');
    clockElement.textContent = `${hours}:${minutes}`;
}

// Initialize and update clock
updateClock();
setInterval(updateClock, 60000);

// Modal Management
class ModalManager {
    constructor() {
        this.modal = document.getElementById('nexus-modal');
        this.header = this.modal.querySelector('.modal-header');
        this.inputWrapper = this.modal.querySelector('.input-wrapper');
        this.resultWrapper = this.modal.querySelector('.result-wrapper');
        this.closeButton = this.modal.querySelector('.modal-close');
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.closeButton.addEventListener('click', () => this.hide());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.hide();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.hide();
            }
        });
    }

    show(title) {
        this.modal.style.display = 'block';
        this.header.innerHTML = `
            <h2 class="modal-title">${title}</h2>
        `;
        this.clearContent();
    }

    hide() {
        this.modal.style.display = 'none';
        this.clearContent();
    }

    clearContent() {
        this.inputWrapper.innerHTML = '';
        this.resultWrapper.innerHTML = '';
    }

    showLoading() {
        this.resultWrapper.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner-third"></i>
            </div>
        `;
    }

    showError(message) {
        this.resultWrapper.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
            </div>
        `;
    }

    showResult(content) {
        this.resultWrapper.innerHTML = content;
    }

    createNameInput(onSubmit) {
        this.inputWrapper.innerHTML = `
            <div class="input-group">
                <input type="text" class="nexus-input" placeholder="Enter a name...">
                <button class="nexus-button">Analyze</button>
            </div>
        `;

        const input = this.inputWrapper.querySelector('input');
        const button = this.inputWrapper.querySelector('button');

        const handleSubmit = () => {
            const name = input.value.trim();
            if (name) onSubmit(name);
        };

        button.addEventListener('click', handleSubmit);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSubmit();
        });
    }
}

// API Handlers
class APIHandler {
    constructor() {
        this.modal = new ModalManager();
    }

    async fetchData(url, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;
        
        try {
            const response = await fetch(fullUrl);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            throw new Error('Failed to fetch data');
        }
    }

    formatBitcoinData(data) {
        return `
            <div class="crypto-result">
                <div class="crypto-price">
                    <h3>Current Bitcoin Prices</h3>
                    <div class="price-grid">
                        <div class="price-card">
                            <span class="currency">USD</span>
                            <span class="amount">${data.bpi.USD.rate}</span>
                        </div>
                        <div class="price-card">
                            <span class="currency">EUR</span>
                            <span class="amount">${data.bpi.EUR.rate}</span>
                        </div>
                        <div class="price-card">
                            <span class="currency">GBP</span>
                            <span class="amount">${data.bpi.GBP.rate}</span>
                        </div>
                    </div>
                    <div class="update-time">
                        Last Updated: ${data.time.updated}
                    </div>
                </div>
            </div>
        `;
    }

    formatUserData(data) {
        const user = data.results[0];
        return `
            <div class="user-result">
                <img src="${user.picture.large}" alt="User" class="user-avatar">
                <div class="user-info">
                    <h3>${user.name.first} ${user.name.last}</h3>
                    <p><i class="fas fa-envelope"></i> ${user.email}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${user.location.city}, ${user.location.country}</p>
                    <p><i class="fas fa-phone"></i> ${user.phone}</p>
                </div>
            </div>
        `;
    }

    formatJokeData(data) {
        return `
            <div class="joke-result">
                <p class="joke-setup">${data.setup}</p>
                <p class="joke-punchline">${data.punchline}</p>
            </div>
        `;
    }

    async handleAPI(apiType) {
        const api = APIS[apiType];
        this.modal.show(api.title);

        if (api.requiresName) {
            this.modal.createNameInput(async (name) => {
                this.modal.showLoading();
                try {
                    const data = await this.fetchData(api.url, { name });
                    this.modal.showResult(JSON.stringify(data, null, 2));
                } catch (error) {
                    this.modal.showError('Failed to analyze name');
                }
            });
            return;
        }

        this.modal.showLoading();
        try {
            const data = await this.fetchData(api.url);
            let formattedResult;

            switch (apiType) {
                case 'cat':
                    formattedResult = `<p class="cat-fact">${data.fact}</p>`;
                    break;
                case 'dog':
                    formattedResult = `<img src="${data.message}" alt="Dog" class="dog-image">`;
                    break;
                case 'joke':
                    formattedResult = this.formatJokeData(data);
                    break;
                case 'bitcoin':
                    formattedResult = this.formatBitcoinData(data);
                    break;
                case 'ip':
                    formattedResult = `<p class="ip-result">Your IP Address: ${data.ip}</p>`;
                    break;
                case 'user':
                    formattedResult = this.formatUserData(data);
                    break;
                default:
                    formattedResult = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
            }

            this.modal.showResult(formattedResult);
        } catch (error) {
            this.modal.showError('Failed to fetch data');
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const apiHandler = new APIHandler();

    // Add click handlers to API cards
    document.querySelectorAll('.nexus-card').forEach(card => {
        card.addEventListener('click', () => {
            const apiType = card.dataset.api;
            apiHandler.handleAPI(apiType);
        });
    });
});