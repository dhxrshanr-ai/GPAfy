/* =============================================
   VIBE — App Core
   Router, API helpers, Auth state
   ============================================= */

const App = {
    currentUser: null,
    currentPage: null,

    // ─── API Helpers ───
    async api(url, options = {}) {
        const config = {
            headers: { 'Content-Type': 'application/json' },
            ...options
        };
        // If FormData, remove content-type so browser sets it
        if (options.body instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        const res = await fetch(url, config);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Something went wrong');
        return data;
    },

    async get(url) {
        return this.api(url);
    },

    async post(url, body) {
        return this.api(url, { method: 'POST', body: JSON.stringify(body) });
    },

    async put(url, body) {
        return this.api(url, { method: 'PUT', body: JSON.stringify(body) });
    },

    async del(url) {
        return this.api(url, { method: 'DELETE' });
    },

    // ─── Toast Notifications ───
    toast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    // ─── Avatar Helper ───
    getAvatarHTML(user, sizeClass = '') {
        if (user.avatar) {
            return `<div class="avatar ${sizeClass}"><img src="${user.avatar}" alt="${user.display_name}"></div>`;
        }
        const initial = (user.display_name || user.username || '?')[0].toUpperCase();
        return `<div class="avatar ${sizeClass}">${initial}</div>`;
    },

    // ─── Time Formatter ───
    timeAgo(dateStr) {
        const now = new Date();
        const date = new Date(dateStr + 'Z');
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    },

    // ─── Navigation ───
    updateNav() {
        const navbar = document.getElementById('navbar');
        if (!this.currentUser) {
            navbar.style.display = 'none';
            return;
        }
        navbar.style.display = 'block';

        // Active link highlighting
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        const hash = window.location.hash || '#/feed';
        if (hash.startsWith('#/feed')) document.getElementById('nav-feed')?.classList.add('active');
        else if (hash.startsWith('#/explore')) document.getElementById('nav-explore')?.classList.add('active');
        else if (hash.startsWith('#/profile')) document.getElementById('nav-profile')?.classList.add('active');
    },

    // ─── Router ───
    async route() {
        const hash = window.location.hash || '#/login';
        const app = document.getElementById('app');

        this.updateNav();

        // Parse route
        const parts = hash.slice(2).split('/');
        const page = parts[0];
        const param = parts[1];

        // Auth guard
        if (!this.currentUser && page !== 'login' && page !== 'register') {
            window.location.hash = '#/login';
            return;
        }

        // Redirect logged in users away from auth pages
        if (this.currentUser && (page === 'login' || page === 'register')) {
            window.location.hash = '#/feed';
            return;
        }

        try {
            switch (page) {
                case 'login':
                    app.innerHTML = Pages.auth('login');
                    Pages.bindAuth('login');
                    break;
                case 'register':
                    app.innerHTML = Pages.auth('register');
                    Pages.bindAuth('register');
                    break;
                case 'feed':
                    app.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
                    await Pages.renderFeed(app);
                    break;
                case 'profile':
                    app.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
                    const profileId = param || this.currentUser.id;
                    await Pages.renderProfile(app, profileId);
                    break;
                case 'post':
                    app.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
                    await Pages.renderPost(app, param);
                    break;
                case 'explore':
                    app.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
                    await Pages.renderExplore(app);
                    break;
                case 'followers':
                    app.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
                    await Pages.renderFollowList(app, param, 'followers');
                    break;
                case 'following':
                    app.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
                    await Pages.renderFollowList(app, param, 'following');
                    break;
                default:
                    window.location.hash = '#/feed';
            }
        } catch (err) {
            console.error('Route error:', err);
            app.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚠️</div><h3>Something went wrong</h3><p>${err.message}</p></div>`;
        }

        this.currentPage = page;
    },

    // ─── Init ───
    async init() {
        try {
            const data = await this.get('/api/auth/me');
            this.currentUser = data.user;
        } catch (e) {
            this.currentUser = null;
        }

        // Logout handler
        document.getElementById('btn-logout').addEventListener('click', async () => {
            await this.post('/api/auth/logout');
            this.currentUser = null;
            window.location.hash = '#/login';
        });

        // Listen for hash changes
        window.addEventListener('hashchange', () => this.route());

        // Initial route
        this.route();
    }
};

// Start the app
document.addEventListener('DOMContentLoaded', () => App.init());
