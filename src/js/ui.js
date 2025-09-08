// ui.js - Componentes de interface do usuário
class UIManager {
    constructor() {
        this.activeDropdowns = new Set();
        this.activeTooltips = new Map();
        this.init();
    }
    
    init() {
        this.initDropdowns();
        this.initTooltips();
        this.initTabs();
        this.initAccordions();
        this.initCarousels();
        this.initLightbox();
        this.initLoadingStates();
        this.initBackToTop();
    }
    
    // Sistema de dropdowns
    initDropdowns() {
        const dropdownTriggers = document.querySelectorAll('.dropdown-toggle, [data-dropdown]');
        
        dropdownTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleDropdown(trigger);
            });
        });
        
        // Fechar dropdowns ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                this.closeAllDropdowns();
            }
        });
        
        // Fechar dropdowns com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllDropdowns();
            }
        });
    }
    
    toggleDropdown(trigger) {
        const dropdown = trigger.closest('.dropdown');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (!dropdown || !menu) return;
        
        const isActive = dropdown.classList.contains('active');
        
        // Fechar outros dropdowns
        this.closeAllDropdowns();
        
        if (!isActive) {
            dropdown.classList.add('active');
            menu.style.display = 'block';
            this.activeDropdowns.add(dropdown);
            
            // Posicionar menu
            this.positionDropdown(trigger, menu);
        }
    }
    
    positionDropdown(trigger, menu) {
        const triggerRect = trigger.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        // Reset positioning
        menu.style.top = '';
        menu.style.left = '';
        menu.style.right = '';
        menu.style.bottom = '';
        
        // Posicionar horizontalmente
        if (triggerRect.left + menuRect.width > viewport.width) {
            menu.style.right = '0';
        } else {
            menu.style.left = '0';
        }
        
        // Posicionar verticalmente
        if (triggerRect.bottom + menuRect.height > viewport.height) {
            menu.style.bottom = '100%';
            menu.style.marginBottom = '5px';
        } else {
            menu.style.top = '100%';
            menu.style.marginTop = '5px';
        }
    }
    
    closeAllDropdowns() {
        this.activeDropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
            const menu = dropdown.querySelector('.dropdown-menu');
            if (menu) {
                menu.style.display = 'none';
            }
        });
        this.activeDropdowns.clear();
    }
    
    // Sistema de tooltips
    initTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip], [title]');
        
        tooltipElements.forEach(element => {
            // Converter title para data-tooltip
            if (element.title && !element.dataset.tooltip) {
                element.dataset.tooltip = element.title;
                element.removeAttribute('title');
            }
            
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target);
            });
            
            element.addEventListener('mouseleave', (e) => {
                this.hideTooltip(e.target);
            });
        });
    }
    
    showTooltip(element) {
        const text = element.dataset.tooltip;
        if (!text) return;
        
        const tooltip = document.createElement('div');
        tooltip.classList.add('tooltip');
        tooltip.textContent = text;
        
        document.body.appendChild(tooltip);
        this.activeTooltips.set(element, tooltip);
        
        // Posicionar tooltip
        this.positionTooltip(element, tooltip);
        
        // Mostrar tooltip
        requestAnimationFrame(() => {
            tooltip.classList.add('show');
        });
    }
    
    hideTooltip(element) {
        const tooltip = this.activeTooltips.get(element);
        if (tooltip) {
            tooltip.classList.remove('show');
            setTimeout(() => {
                if (tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
            }, 150);
            this.activeTooltips.delete(element);
        }
    }
    
    positionTooltip(element, tooltip) {
        const elementRect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        const left = elementRect.left + (elementRect.width / 2) - (tooltipRect.width / 2);
        const top = elementRect.top - tooltipRect.height - 10;
        
        tooltip.style.left = Math.max(10, left) + 'px';
        tooltip.style.top = Math.max(10, top) + 'px';
    }
    
    // Sistema de abas
    initTabs() {
        const tabContainers = document.querySelectorAll('.tabs');
        
        tabContainers.forEach(container => {
            const tabButtons = container.querySelectorAll('.tab-button');
            const tabPanes = container.querySelectorAll('.tab-pane');
            
            tabButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.switchTab(button, tabButtons, tabPanes);
                });
            });
        });
    }
    
    switchTab(activeButton, allButtons, allPanes) {
        const targetId = activeButton.dataset.tab;
        
        // Desativar todas as abas
        allButtons.forEach(btn => btn.classList.remove('active'));
        allPanes.forEach(pane => pane.classList.remove('active'));
        
        // Ativar aba selecionada
        activeButton.classList.add('active');
        const targetPane = document.getElementById(targetId);
        if (targetPane) {
            targetPane.classList.add('active');
        }
    }
    
    // Sistema de acordeons
    initAccordions() {
        const accordionTriggers = document.querySelectorAll('.accordion-trigger');
        
        accordionTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleAccordion(trigger);
            });
        });
    }
    
    toggleAccordion(trigger) {
        const accordion = trigger.closest('.accordion-item');
        const content = accordion.querySelector('.accordion-content');
        const icon = trigger.querySelector('.accordion-icon');
        
        if (!accordion || !content) return;
        
        const isActive = accordion.classList.contains('active');
        
        // Verificar se é acordeon exclusivo
        const parent = accordion.closest('.accordion');
        const isExclusive = parent && parent.classList.contains('exclusive');
        
        if (isExclusive) {
            // Fechar outros itens do acordeon
            parent.querySelectorAll('.accordion-item').forEach(item => {
                if (item !== accordion) {
                    item.classList.remove('active');
                    const otherContent = item.querySelector('.accordion-content');
                    if (otherContent) {
                        otherContent.style.maxHeight = null;
                    }
                }
            });
        }
        
        // Toggle item atual
        if (isActive) {
            accordion.classList.remove('active');
            content.style.maxHeight = null;
        } else {
            accordion.classList.add('active');
            content.style.maxHeight = content.scrollHeight + 'px';
        }
        
        // Animar ícone
        if (icon) {
            icon.style.transform = isActive ? '' : 'rotate(180deg)';
        }
    }
    
    // Sistema de carousels
    initCarousels() {
        const carousels = document.querySelectorAll('.carousel');
        
        carousels.forEach(carousel => {
            this.setupCarousel(carousel);
        });
    }
    
    setupCarousel(carousel) {
        const track = carousel.querySelector('.carousel-track');
        const slides = carousel.querySelectorAll('.carousel-slide');
        const prevBtn = carousel.querySelector('.carousel-prev');
        const nextBtn = carousel.querySelector('.carousel-next');
        const indicators = carousel.querySelectorAll('.carousel-indicator');
        
        if (!track || slides.length === 0) return;
        
        let currentSlide = 0;
        const totalSlides = slides.length;
        
        // Configurar carousel
        const carouselData = {
            currentSlide: 0,
            totalSlides: totalSlides,
            auto: carousel.dataset.auto === 'true',
            interval: parseInt(carousel.dataset.interval) || 5000,
            intervalId: null
        };
        
        // Função para ir para slide específico
        const goToSlide = (index) => {
            currentSlide = index;
            carouselData.currentSlide = index;
            
            const offset = -index * 100;
            track.style.transform = `translateX(${offset}%)`;
            
            // Atualizar indicadores
            indicators.forEach((indicator, i) => {
                indicator.classList.toggle('active', i === index);
            });
            
            // Atualizar botões
            if (prevBtn) prevBtn.disabled = index === 0;
            if (nextBtn) nextBtn.disabled = index === totalSlides - 1;
        };
        
        // Próximo slide
        const nextSlide = () => {
            const next = (currentSlide + 1) % totalSlides;
            goToSlide(next);
        };
        
        // Slide anterior
        const prevSlide = () => {
            const prev = currentSlide === 0 ? totalSlides - 1 : currentSlide - 1;
            goToSlide(prev);
        };
        
        // Eventos dos botões
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        
        // Eventos dos indicadores
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => goToSlide(index));
        });
        
        // Auto-play
        if (carouselData.auto) {
            const startAutoPlay = () => {
                carouselData.intervalId = setInterval(nextSlide, carouselData.interval);
            };
            
            const stopAutoPlay = () => {
                if (carouselData.intervalId) {
                    clearInterval(carouselData.intervalId);
                    carouselData.intervalId = null;
                }
            };
            
            carousel.addEventListener('mouseenter', stopAutoPlay);
            carousel.addEventListener('mouseleave', startAutoPlay);
            
            startAutoPlay();
        }
        
        // Inicializar
        goToSlide(0);
        
        // Touch/Swipe support para mobile
        let startX = 0;
        let isDragging = false;
        
        carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        });
        
        carousel.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
        });
        
        carousel.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            
            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;
            
            if (Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }
            
            isDragging = false;
        });
    }
    
    // Sistema de lightbox
    initLightbox() {
        const lightboxTriggers = document.querySelectorAll('[data-lightbox]');
        
        lightboxTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.openLightbox(trigger);
            });
        });
    }
    
    openLightbox(trigger) {
        const src = trigger.href || trigger.src || trigger.dataset.lightbox;
        const caption = trigger.dataset.caption || trigger.alt || '';
        
        // Criar lightbox
        const lightbox = document.createElement('div');
        lightbox.classList.add('lightbox');
        lightbox.innerHTML = `
            <div class="lightbox-overlay"></div>
            <div class="lightbox-content">
                <button class="lightbox-close">&times;</button>
                <img src="${src}" alt="${caption}" class="lightbox-image">
                ${caption ? `<div class="lightbox-caption">${caption}</div>` : ''}
                <div class="lightbox-controls">
                    <button class="lightbox-prev">&lt;</button>
                    <button class="lightbox-next">&gt;</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(lightbox);
        document.body.style.overflow = 'hidden';
        
        // Mostrar lightbox
        requestAnimationFrame(() => {
            lightbox.classList.add('active');
        });
        
        // Eventos
        const closeBtn = lightbox.querySelector('.lightbox-close');
        const overlay = lightbox.querySelector('.lightbox-overlay');
        
        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => {
                document.body.removeChild(lightbox);
            }, 300);
        };
        
        closeBtn.addEventListener('click', closeLightbox);
        overlay.addEventListener('click', closeLightbox);
        
        // Fechar com ESC
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeLightbox();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }
    
    // Estados de loading
    initLoadingStates() {
        // Loading buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-loading')) {
                this.setButtonLoading(e.target);
            }
        });
    }
    
    setButtonLoading(button, isLoading = true) {
        if (isLoading) {
            button.disabled = true;
            button.classList.add('loading');
            
            // Salvar texto original
            if (!button.dataset.originalText) {
                button.dataset.originalText = button.textContent;
            }
            
            button.innerHTML = `
                <span class="spinner"></span>
                ${button.dataset.loadingText || 'Carregando...'}
            `;
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            button.textContent = button.dataset.originalText || button.textContent;
        }
    }
    
    // Botão voltar ao topo
    initBackToTop() {
        const backToTopBtn = document.createElement('button');
        backToTopBtn.classList.add('back-to-top');
        backToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        backToTopBtn.setAttribute('aria-label', 'Voltar ao topo');
        
        document.body.appendChild(backToTopBtn);
        
        // Mostrar/esconder baseado no scroll
        window.addEventListener('scroll', Utils.debounce(() => {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        }, 100));
        
        // Scroll suave para o topo
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Criar modal dinâmico
    createModal(content, options = {}) {
        const modal = document.createElement('div');
        modal.classList.add('modal');
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content ${options.size || ''}">
                <div class="modal-header">
                    <h3 class="modal-title">${options.title || ''}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${options.footer ? `<div class="modal-footer">${options.footer}</div>` : ''}
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Eventos
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        
        const closeModal = () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => {
                if (modal.parentNode) {
                    document.body.removeChild(modal);
                }
            }, 300);
        };
        
        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);
        
        // Mostrar modal
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
        
        return {
            element: modal,
            close: closeModal
        };
    }
    
    // Confirmar ação
    confirm(message, options = {}) {
        return new Promise((resolve) => {
            const content = `
                <p>${message}</p>
                <div class="confirm-actions">
                    <button class="btn btn-secondary cancel-btn">${options.cancelText || 'Cancelar'}</button>
                    <button class="btn btn-primary confirm-btn">${options.confirmText || 'Confirmar'}</button>
                </div>
            `;
            
            const modal = this.createModal(content, {
                title: options.title || 'Confirmar',
                size: 'small'
            });
            
            const cancelBtn = modal.element.querySelector('.cancel-btn');
            const confirmBtn = modal.element.querySelector('.confirm-btn');
            
            cancelBtn.addEventListener('click', () => {
                modal.close();
                resolve(false);
            });
            
            confirmBtn.addEventListener('click', () => {
                modal.close();
                resolve(true);
            });
        });
    }
    
    // Prompt de entrada
    prompt(message, options = {}) {
        return new Promise((resolve) => {
            const content = `
                <p>${message}</p>
                <input type="text" class="form-control prompt-input" 
                       placeholder="${options.placeholder || ''}" 
                       value="${options.defaultValue || ''}">
                <div class="prompt-actions">
                    <button class="btn btn-secondary cancel-btn">${options.cancelText || 'Cancelar'}</button>
                    <button class="btn btn-primary confirm-btn">${options.confirmText || 'OK'}</button>
                </div>
            `;
            
            const modal = this.createModal(content, {
                title: options.title || 'Entrada',
                size: 'small'
            });
            
            const input = modal.element.querySelector('.prompt-input');
            const cancelBtn = modal.element.querySelector('.cancel-btn');
            const confirmBtn = modal.element.querySelector('.confirm-btn');
            
            // Focar no input
            setTimeout(() => input.focus(), 100);
            
            const handleConfirm = () => {
                modal.close();
                resolve(input.value);
            };
            
            const handleCancel = () => {
                modal.close();
                resolve(null);
            };
            
            cancelBtn.addEventListener('click', handleCancel);
            confirmBtn.addEventListener('click', handleConfirm);
            
            // Enter para confirmar, ESC para cancelar
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleConfirm();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    handleCancel();
                }
            });
        });
    }
    
    // Lazy loading de imagens
    initLazyLoading() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => {
            img.classList.add('lazy');
            imageObserver.observe(img);
        });
    }
}

// Inicializar UI Manager
document.addEventListener('DOMContentLoaded', function() {
    window.uiManager = new UIManager();
});

// Funções globais de utilidade
function showModal(content, options) {
    return window.uiManager ? window.uiManager.createModal(content, options) : null;
}

function showConfirm(message, options) {
    return window.uiManager ? window.uiManager.confirm(message, options) : Promise.resolve(false);
}

function showPrompt(message, options) {
    return window.uiManager ? window.uiManager.prompt(message, options) : Promise.resolve(null);
}

function setButtonLoading(button, isLoading = true) {
    if (window.uiManager) {
        window.uiManager.setButtonLoading(button, isLoading);
    }
}

// Componentes específicos
class ProgressBar {
    constructor(element) {
        this.element = element;
        this.progress = 0;
        this.init();
    }
    
    init() {
        this.bar = this.element.querySelector('.progress-bar');
        this.text = this.element.querySelector('.progress-text');
    }
    
    setProgress(percent) {
        this.progress = Math.max(0, Math.min(100, percent));
        
        if (this.bar) {
            this.bar.style.width = `${this.progress}%`;
        }
        
        if (this.text) {
            this.text.textContent = `${Math.round(this.progress)}%`;
        }
        
        this.element.dispatchEvent(new CustomEvent('progress', {
            detail: { progress: this.progress }
        }));
    }
    
    increment(amount = 1) {
        this.setProgress(this.progress + amount);
    }
    
    reset() {
        this.setProgress(0);
    }
}

// Inicializar progress bars
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.progress').forEach(element => {
        element.progressBar = new ProgressBar(element);
    });
});