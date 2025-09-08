// utils.js - Utilitários e funções auxiliares
class UtilsManager {
    constructor() {
        this.storagePrefix = 'projeto_';
        this.init();
    }
    
    init() {
        this.setupGlobalErrorHandler();
        this.setupPerformanceMonitoring();
    }
    
    // Gerenciamento de localStorage
    storage = {
        set: (key, value) => {
            try {
                const serializedValue = JSON.stringify(value);
                localStorage.setItem(this.storagePrefix + key, serializedValue);
                return true;
            } catch (error) {
                console.error('Erro ao salvar no localStorage:', error);
                return false;
            }
        },
        
        get: (key, defaultValue = null) => {
            try {
                const item = localStorage.getItem(this.storagePrefix + key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('Erro ao ler do localStorage:', error);
                return defaultValue;
            }
        },
        
        remove: (key) => {
            try {
                localStorage.removeItem(this.storagePrefix + key);
                return true;
            } catch (error) {
                console.error('Erro ao remover do localStorage:', error);
                return false;
            }
        },
        
        clear: () => {
            try {
                const keys = Object.keys(localStorage).filter(key => 
                    key.startsWith(this.storagePrefix)
                );
                keys.forEach(key => localStorage.removeItem(key));
                return true;
            } catch (error) {
                console.error('Erro ao limpar localStorage:', error);
                return false;
            }
        }
    };
    
    // Utilitários de formatação
    format = {
        // Formatar moeda brasileira
        currency: (value, options = {}) => {
            const defaults = {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 2
            };
            
            const config = { ...defaults, ...options };
            return new Intl.NumberFormat('pt-BR', config).format(value);
        },
        
        // Formatar números
        number: (value, decimals = 0) => {
            return new Intl.NumberFormat('pt-BR', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            }).format(value);
        },
        
        // Formatar datas
        date: (date, options = {}) => {
            const defaults = {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            
            const config = { ...defaults, ...options };
            const dateObj = date instanceof Date ? date : new Date(date);
            return dateObj.toLocaleDateString('pt-BR', config);
        },
        
        // Formatar hora
        time: (date, options = {}) => {
            const defaults = {
                hour: '2-digit',
                minute: '2-digit'
            };
            
            const config = { ...defaults, ...options };
            const dateObj = date instanceof Date ? date : new Date(date);
            return dateObj.toLocaleTimeString('pt-BR', config);
        },
        
        // Formatar CPF
        cpf: (cpf) => {
            const cleaned = cpf.replace(/\D/g, '');
            return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        },
        
        // Formatar CNPJ
        cnpj: (cnpj) => {
            const cleaned = cnpj.replace(/\D/g, '');
            return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        },
        
        // Formatar telefone
        phone: (phone) => {
            const cleaned = phone.replace(/\D/g, '');
            if (cleaned.length === 10) {
                return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
            } else if (cleaned.length === 11) {
                return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            }
            return phone;
        },
        
        // Formatar CEP
        cep: (cep) => {
            const cleaned = cep.replace(/\D/g, '');
            return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
        },
        
        // Truncar texto
        truncate: (text, length = 100, suffix = '...') => {
            if (text.length <= length) return text;
            return text.substring(0, length).trim() + suffix;
        },
        
        // Capitalizar primeira letra
        capitalize: (text) => {
            return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        },
        
        // Formatar tamanho de arquivo
        fileSize: (bytes) => {
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            if (bytes === 0) return '0 Bytes';
            
            const i = Math.floor(Math.log(bytes) / Math.log(1024));
            return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
        }
    };
    
    // Validações
    validate = {
        // Validar email
        email: (email) => {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return regex.test(email);
        },
        
        // Validar CPF
        cpf: (cpf) => {
            const cleaned = cpf.replace(/[^\d]/g, '');
            
            if (cleaned.length !== 11) return false;
            if (/^(\d)\1{10}$/.test(cleaned)) return false;
            
            let sum = 0;
            for (let i = 0; i < 9; i++) {
                sum += parseInt(cleaned.charAt(i)) * (10 - i);
            }
            let remainder = (sum * 10) % 11;
            if (remainder === 10 || remainder === 11) remainder = 0;
            if (remainder !== parseInt(cleaned.charAt(9))) return false;
            
            sum = 0;
            for (let i = 0; i < 10; i++) {
                sum += parseInt(cleaned.charAt(i)) * (11 - i);
            }
            remainder = (sum * 10) % 11;
            if (remainder === 10 || remainder === 11) remainder = 0;
            if (remainder !== parseInt(cleaned.charAt(10))) return false;
            
            return true;
        },
        
        // Validar CNPJ
        cnpj: (cnpj) => {
            const cleaned = cnpj.replace(/[^\d]/g, '');
            
            if (cleaned.length !== 14) return false;
            if (/^(\d)\1{13}$/.test(cleaned)) return false;
            
            const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
            const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
            
            let sum = 0;
            for (let i = 0; i < 12; i++) {
                sum += parseInt(cleaned.charAt(i)) * weights1[i];
            }
            let remainder = sum % 11;
            const digit1 = remainder < 2 ? 0 : 11 - remainder;
            
            if (digit1 !== parseInt(cleaned.charAt(12))) return false;
            
            sum = 0;
            for (let i = 0; i < 13; i++) {
                sum += parseInt(cleaned.charAt(i)) * weights2[i];
            }
            remainder = sum % 11;
            const digit2 = remainder < 2 ? 0 : 11 - remainder;
            
            return digit2 === parseInt(cleaned.charAt(13));
        },
        
        // Validar telefone
        phone: (phone) => {
            const cleaned = phone.replace(/\D/g, '');
            return cleaned.length >= 10 && cleaned.length <= 11;
        },
        
        // Validar CEP
        cep: (cep) => {
            const cleaned = cep.replace(/\D/g, '');
            return cleaned.length === 8;
        },
        
        // Validar URL
        url: (url) => {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        },
        
        // Validar senha forte
        strongPassword: (password) => {
            const minLength = 8;
            const hasUpperCase = /[A-Z]/.test(password);
            const hasLowerCase = /[a-z]/.test(password);
            const hasNumbers = /\d/.test(password);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
            
            return password.length >= minLength && hasUpperCase && 
                   hasLowerCase && hasNumbers && hasSpecialChar;
        }
    };
    
    // Utilitários de DOM
    dom = {
        // Criar elemento
        create: (tag, attributes = {}, children = []) => {
            const element = document.createElement(tag);
            
            Object.entries(attributes).forEach(([key, value]) => {
                if (key === 'className') {
                    element.className = value;
                } else if (key === 'innerHTML') {
                    element.innerHTML = value;
                } else {
                    element.setAttribute(key, value);
                }
            });
            
            children.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else if (child instanceof Node) {
                    element.appendChild(child);
                }
            });
            
            return element;
        },
        
        // Encontrar elemento pai com seletor
        closest: (element, selector) => {
            return element.closest(selector);
        },
        
        // Verificar se elemento está visível
        isVisible: (element) => {
            const rect = element.getBoundingClientRect();
            return rect.top >= 0 && rect.left >= 0 &&
                   rect.bottom <= window.innerHeight &&
                   rect.right <= window.innerWidth;
        },
        
        // Scroll suave para elemento
        scrollTo: (element, options = {}) => {
            const defaults = {
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest'
            };
            
            const config = { ...defaults, ...options };
            element.scrollIntoView(config);
        },
        
        // Copiar texto para clipboard
        copyToClipboard: async (text) => {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (error) {
                // Fallback para navegadores mais antigos
                const textarea = document.createElement('textarea');
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                const success = document.execCommand('copy');
                document.body.removeChild(textarea);
                return success;
            }
        }
    };
    
    // Utilitários de rede
    http = {
        // GET request
        get: async (url, options = {}) => {
            const config = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            };
            
            try {
                const response = await fetch(url, config);
                return await this.handleResponse(response);
            } catch (error) {
                throw this.handleError(error);
            }
        },
        
        // POST request
        post: async (url, data = null, options = {}) => {
            const config = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                body: data ? JSON.stringify(data) : null,
                ...options
            };
            
            try {
                const response = await fetch(url, config);
                return await this.handleResponse(response);
            } catch (error) {
                throw this.handleError(error);
            }
        },
        
        // PUT request
        put: async (url, data = null, options = {}) => {
            const config = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                body: data ? JSON.stringify(data) : null,
                ...options
            };
            
            try {
                const response = await fetch(url, config);
                return await this.handleResponse(response);
            } catch (error) {
                throw this.handleError(error);
            }
        },
        
        // DELETE request
        delete: async (url, options = {}) => {
            const config = {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            };
            
            try {
                const response = await fetch(url, config);
                return await this.handleResponse(response);
            } catch (error) {
                throw this.handleError(error);
            }
        },
        
        // Tratar resposta
        handleResponse: async (response) => {
            if (!response.ok) {
                const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
                error.status = response.status;
                error.response = response;
                throw error;
            }
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return await response.text();
        },
        
        // Tratar erro
        handleError: (error) => {
            console.error('Erro na requisição:', error);
            return error;
        }
    };
    
    // Utilitários diversos
    misc = {
        // Debounce
        debounce: (func, wait, immediate = false) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    timeout = null;
                    if (!immediate) func(...args);
                };
                const callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func(...args);
            };
        },
        
        // Throttle
        throttle: (func, limit) => {
            let inThrottle;
            return function executedFunction(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },
        
        // Gerar ID único
        generateId: (prefix = 'id') => {
            return prefix + '_' + Math.random().toString(36).substr(2, 9);
        },
        
        // Aguardar tempo
        sleep: (ms) => {
            return new Promise(resolve => setTimeout(resolve, ms));
        },
        
        // Detectar dispositivo móvel
        isMobile: () => {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        },
        
        // Detectar navegador
        getBrowser: () => {
            const ua = navigator.userAgent;
            
            if (ua.includes('Firefox')) return 'Firefox';
            if (ua.includes('Chrome')) return 'Chrome';
            if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
            if (ua.includes('Edge')) return 'Edge';
            if (ua.includes('Opera')) return 'Opera';
            
            return 'Unknown';
        },
        
        // Obter parâmetros da URL
        getUrlParams: () => {
            return new URLSearchParams(window.location.search);
        },
        
        // Atualizar parâmetro da URL
        updateUrlParam: (key, value) => {
            const url = new URL(window.location);
            url.searchParams.set(key, value);
            window.history.pushState({}, '', url);
        },
        
        // Remover parâmetro da URL
        removeUrlParam: (key) => {
            const url = new URL(window.location);
            url.searchParams.delete(key);
            window.history.pushState({}, '', url);
        }
    };
    
    // Configurar tratamento global de erros
    setupGlobalErrorHandler() {
        window.addEventListener('error', (event) => {
            console.error('Erro JavaScript:', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promise rejeitada:', event.reason);
        });
    }
    
    // Monitoramento básico de performance
    setupPerformanceMonitoring() {
        if (typeof performance !== 'undefined' && performance.mark) {
            performance.mark('app-start');
            
            window.addEventListener('load', () => {
                performance.mark('app-load');
                performance.measure('app-load-time', 'app-start', 'app-load');
                
                const measure = performance.getEntriesByName('app-load-time')[0];
                console.log(`Tempo de carregamento: ${measure.duration.toFixed(2)}ms`);
            });
        }
    }
}

// Inicializar utilitários
document.addEventListener('DOMContentLoaded', function() {
    window.utilsManager = new UtilsManager();
    
    // Expor utilitários globalmente para facilitar o uso
    window.Utils = window.utilsManager;
});

// Event Emitter personalizado
class EventEmitter {
    constructor() {
        this.events = {};
    }
    
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        
        // Retorna função para remover o listener
        return () => this.off(event, callback);
    }
    
    off(event, callback) {
        if (!this.events[event]) return;
        
        const index = this.events[event].indexOf(callback);
        if (index > -1) {
            this.events[event].splice(index, 1);
        }
    }
    
    emit(event, ...args) {
        if (!this.events[event]) return;
        
        this.events[event].forEach(callback => {
            try {
                callback(...args);
            } catch (error) {
                console.error(`Erro no evento ${event}:`, error);
            }
        });
    }
    
    once(event, callback) {
        const onceWrapper = (...args) => {
            callback(...args);
            this.off(event, onceWrapper);
        };
        
        this.on(event, onceWrapper);
    }
}

// Sistema de cache simples
class SimpleCache {
    constructor(maxSize = 100, ttl = 300000) { // 5 minutos default
        this.cache = new Map();
        this.maxSize = maxSize;
        this.ttl = ttl;
    }
    
    set(key, value, customTtl = null) {
        const expires = Date.now() + (customTtl || this.ttl);
        
        // Remover item mais antigo se cache estiver cheio
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, {
            value,
            expires
        });
    }
    
    get(key) {
        const item = this.cache.get(key);
        
        if (!item) return null;
        
        if (Date.now() > item.expires) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }
    
    has(key) {
        return this.get(key) !== null;
    }
    
    delete(key) {
        return this.cache.delete(key);
    }
    
    clear() {
        this.cache.clear();
    }
    
    size() {
        return this.cache.size;
    }
    
    // Limpar itens expirados
    cleanup() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expires) {
                this.cache.delete(key);
            }
        }
    }
}

// Gerenciador de cookies
class CookieManager {
    static set(name, value, options = {}) {
        const defaults = {
            path: '/',
            expires: null,
            maxAge: null,
            domain: null,
            secure: false,
            sameSite: 'Lax'
        };
        
        const config = { ...defaults, ...options };
        
        let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
        
        if (config.expires) {
            cookieString += `; expires=${config.expires.toUTCString()}`;
        }
        
        if (config.maxAge) {
            cookieString += `; max-age=${config.maxAge}`;
        }
        
        if (config.domain) {
            cookieString += `; domain=${config.domain}`;
        }
        
        if (config.path) {
            cookieString += `; path=${config.path}`;
        }
        
        if (config.secure) {
            cookieString += '; secure';
        }
        
        if (config.sameSite) {
            cookieString += `; samesite=${config.sameSite}`;
        }
        
        document.cookie = cookieString;
    }
    
    static get(name) {
        const nameEQ = encodeURIComponent(name) + '=';
        const cookies = document.cookie.split(';');
        
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.indexOf(nameEQ) === 0) {
                return decodeURIComponent(cookie.substring(nameEQ.length));
            }
        }
        
        return null;
    }
    
    static remove(name, options = {}) {
        const config = {
            expires: new Date(0),
            ...options
        };
        
        this.set(name, '', config);
    }
    
    static exists(name) {
        return this.get(name) !== null;
    }
    
    static getAll() {
        const cookies = {};
        
        if (document.cookie) {
            document.cookie.split(';').forEach(cookie => {
                const [name, value] = cookie.trim().split('=');
                if (name && value) {
                    cookies[decodeURIComponent(name)] = decodeURIComponent(value);
                }
            });
        }
        
        return cookies;
    }
}

// Analytics básico
class Analytics {
    constructor() {
        this.events = [];
        this.sessionStart = Date.now();
        this.pageViews = 1;
    }
    
    // Rastrear evento
    track(event, properties = {}) {
        const eventData = {
            event,
            properties: {
                ...properties,
                timestamp: Date.now(),
                url: window.location.href,
                userAgent: navigator.userAgent,
                sessionId: this.getSessionId()
            }
        };
        
        this.events.push(eventData);
        console.log('Analytics Event:', eventData);
        
        // Aqui você enviaria para seu serviço de analytics
        // this.sendToService(eventData);
    }
    
    // Rastrear page view
    trackPageView(page = window.location.pathname) {
        this.track('page_view', {
            page,
            referrer: document.referrer,
            pageView: this.pageViews++
        });
    }
    
    // Rastrear clique
    trackClick(element, customProperties = {}) {
        const properties = {
            elementType: element.tagName.toLowerCase(),
            elementId: element.id,
            elementClass: element.className,
            elementText: element.textContent?.substring(0, 100),
            ...customProperties
        };
        
        this.track('click', properties);
    }
    
    // Obter ID da sessão
    getSessionId() {
        let sessionId = CookieManager.get('session_id');
        
        if (!sessionId) {
            sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
            CookieManager.set('session_id', sessionId, { maxAge: 30 * 60 }); // 30 minutos
        }
        
        return sessionId;
    }
    
    // Obter tempo na página
    getTimeOnPage() {
        return Date.now() - this.sessionStart;
    }
    
    // Rastrear erro
    trackError(error, additionalInfo = {}) {
        this.track('error', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            ...additionalInfo
        });
    }
}

// Detectar funcionalidades do navegador
class FeatureDetection {
    static get localStorage() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }
    
    static get sessionStorage() {
        try {
            const test = 'test';
            sessionStorage.setItem(test, test);
            sessionStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }
    
    static get webGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
        } catch {
            return false;
        }
    }
    
    static get geolocation() {
        return 'geolocation' in navigator;
    }
    
    static get notification() {
        return 'Notification' in window;
    }
    
    static get serviceWorker() {
        return 'serviceWorker' in navigator;
    }
    
    static get touch() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    
    static get webRTC() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }
    
    static get intersectionObserver() {
        return 'IntersectionObserver' in window;
    }
    
    static get mutationObserver() {
        return 'MutationObserver' in window;
    }
    
    static getAllFeatures() {
        return {
            localStorage: this.localStorage,
            sessionStorage: this.sessionStorage,
            webGL: this.webGL,
            geolocation: this.geolocation,
            notification: this.notification,
            serviceWorker: this.serviceWorker,
            touch: this.touch,
            webRTC: this.webRTC,
            intersectionObserver: this.intersectionObserver,
            mutationObserver: this.mutationObserver
        };
    }
}

// Inicializar instâncias globais
document.addEventListener('DOMContentLoaded', function() {
    // Event emitter global
    window.eventBus = new EventEmitter();
    
    // Cache global
    window.cache = new SimpleCache();
    
    // Analytics
    window.analytics = new Analytics();
    
    // Rastrear page view inicial
    window.analytics.trackPageView();
    
    // Rastrear cliques automaticamente
    document.addEventListener('click', (e) => {
        if (e.target.matches('button, a, [data-track]')) {
            window.analytics.trackClick(e.target);
        }
    });
    
    // Rastrear erros JavaScript
    window.addEventListener('error', (e) => {
        window.analytics.trackError(e.error || new Error(e.message));
    });
    
    // Log de funcionalidades suportadas
    console.log('Funcionalidades do navegador:', FeatureDetection.getAllFeatures());
});

// Exportar classes para uso global
window.EventEmitter = EventEmitter;
window.SimpleCache = SimpleCache;
window.CookieManager = CookieManager;
window.Analytics = Analytics;
window.FeatureDetection = FeatureDetection;

// Polyfills básicos
(function() {
    // Polyfill para Array.includes
    if (!Array.prototype.includes) {
        Array.prototype.includes = function(searchElement, fromIndex) {
            return this.indexOf(searchElement, fromIndex) !== -1;
        };
    }
    
    // Polyfill para String.includes
    if (!String.prototype.includes) {
        String.prototype.includes = function(search, start) {
            if (typeof start !== 'number') {
                start = 0;
            }
            
            if (start + search.length > this.length) {
                return false;
            } else {
                return this.indexOf(search, start) !== -1;
            }
        };
    }
    
    // Polyfill para Object.assign
    if (typeof Object.assign !== 'function') {
        Object.assign = function(target) {
            if (target == null) {
                throw new TypeError('Cannot convert undefined or null to object');
            }
            
            const to = Object(target);
            
            for (let index = 1; index < arguments.length; index++) {
                const nextSource = arguments[index];
                
                if (nextSource != null) {
                    for (const nextKey in nextSource) {
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        };
    }
    
    // Polyfill para CustomEvent
    if (typeof window.CustomEvent !== 'function') {
        function CustomEvent(event, params) {
            params = params || { bubbles: false, cancelable: false, detail: undefined };
            const evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        }
        
        CustomEvent.prototype = window.Event.prototype;
        window.CustomEvent = CustomEvent;
    }
})();

console.log('Sistema de utilitários carregado com sucesso!');